using System.Reflection;
using HarmonyLib;
using Spire420;
using Spire420.Modules;
using Spire420.Modules.BattleStats;

public static class BattleStatsRuntimeChecks
{
    public static void Run(Action<string, Action> check, Action<bool, string> require)
    {
        check("BattleStats defaults on, respects explicit disable, and ships version 0.3.0", () =>
        {
            require(new Configuration().IsEnabled("BattleStats"), "default off");
            require(Configuration.Parse("""{"modules":{"MapColors":true}}""", _ => { }).IsEnabled("BattleStats"), "older settings disable new module");
            var logs = new List<string>();
            ModuleHost.Start([new BattleStatsModule()], Configuration.Parse("""{"modules":{"BattleStats":false}}""", _ => { }), logs.Add);
            require(logs.Count == 1 && logs[0].Contains("disabled by settings"), "disabled module initialized");
            require(typeof(Configuration).Assembly.GetName().Version == new Version(0, 3, 0, 0), "assembly version mismatch");
        });
        check("BattleStats native lifecycle, identity, persistence and UI signatures match installed game", () =>
        {
            var targets = BattleStatsApi.Validate();
            require(targets.Count == 2 && targets[0].DeclaringType!.Name == "NCombatRoom" && targets[0].Name == "_Ready" &&
                targets[1].DeclaringType!.Name == "RunHistorySaveManager" && targets[1].Name == "SaveHistory", "wrong targets");
            foreach (var target in targets) Console.WriteLine($"  {target.DeclaringType!.Name}.{target.Name} -> {target.ReturnType.Name}");
        });
        check("BattleStats real Harmony postfixes install and remove only their two exact targets", () =>
        {
            var targets = BattleStatsApi.Validate();
            try
            {
                BattleStatsModule.InstallPatches();
                var owned = Harmony.GetAllPatchedMethods().Where(m => Harmony.GetPatchInfo(m)?.Owners.Contains(BattleStatsModule.HarmonyOwner) == true).ToList();
                require(owned.Count == 2 && targets.All(owned.Contains), "wrong installed target set");
                foreach (var target in targets)
                {
                    var info = Harmony.GetPatchInfo(target)!;
                    require(info.Postfixes.Count(p => p.owner == BattleStatsModule.HarmonyOwner) == 1 &&
                        !info.Prefixes.Concat(info.Transpilers).Concat(info.Finalizers).Any(p => p.owner == BattleStatsModule.HarmonyOwner), "unexpected patch type");
                }
            }
            finally { new Harmony(BattleStatsModule.HarmonyOwner).UnpatchAll(BattleStatsModule.HarmonyOwner); }
            require(targets.All(m => Harmony.GetPatchInfo(m)?.Owners.Contains(BattleStatsModule.HarmonyOwner) != true), "patches remain");
        });
        check("BattleStats completion rejects stale states/profiles, abandonment, replay and invalid counters", () =>
        {
            var state = new object();
            var lifecycle = new BattleStatsLifecycle(state, "profile-a", 12);
            require(!lifecycle.TryComplete(new object(), "profile-a", false, false, 20, out _), "late other combat accepted");
            require(!lifecycle.TryComplete(state, "profile-b", false, false, 20, out _), "other profile accepted");
            require(!lifecycle.TryComplete(state, "profile-a", true, false, 20, out _), "abandon accepted");
            require(!lifecycle.TryComplete(state, "profile-a", false, true, 20, out _), "replay accepted");
            require(!lifecycle.TryComplete(state, "profile-a", false, false, 11, out _), "decreasing counter accepted");
            require(!lifecycle.Completed, "rejected callback consumed completion");
            require(lifecycle.TryComplete(state, "profile-a", false, false, 20, out var damage) && damage == 8, "nested damage wrong");
            require(!lifecycle.TryComplete(state, "profile-a", false, false, 25, out _), "double completion accepted");
        });
        check("BattleStats ordinary resumed damage and nested baseline keep zero-damage samples", () =>
        {
            var state = new object();
            var normal = new BattleStatsLifecycle(state, "p", BattleStatsLifecycle.Baseline(1, 7));
            require(normal.Damage(9) == 9, "ordinary resumed counter lost damage");
            var nested = new BattleStatsLifecycle(state, "p", BattleStatsLifecycle.Baseline(2, 7));
            require(nested.Damage(9) == 2, "prior room damage included");
            require(nested.TryComplete(state, "p", false, false, 7, out var damage) && damage == 0, "zero-damage completion omitted");
        });
        check("BattleStats visibility requires current active combat and excludes replay/other rooms", () =>
        {
            for (var flags = 0; flags < 32; flags++)
            {
                var active = (flags & 1) != 0;
                var inProgress = (flags & 2) != 0;
                var current = (flags & 4) != 0;
                var same = (flags & 8) != 0;
                var replay = (flags & 16) != 0;
                require(BattleStatsLifecycle.Show(active, inProgress, current, same, replay) == (flags == 15), "visible outside matching combat");
            }
        });
    }
}
