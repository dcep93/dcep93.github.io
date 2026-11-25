using HarmonyLib;
using MegaCrit.Sts2.Core.Nodes.Rooms;
using MegaCrit.Sts2.Core.Runs;

namespace Spire420.Modules.BattleStats;

public sealed class BattleStatsModule : IModule
{
    public const string HarmonyOwner = "dcep93.spire420.BattleStats";
    private static BattleStatsRuntime? _runtime;
    public string Id => "BattleStats";

    public void Initialize(Configuration configuration, Action<string> log)
    {
        BattleStatsApi.Validate();
        var runtime = new BattleStatsRuntime(log);
        try
        {
            InstallPatches();
            runtime.Subscribe();
            _runtime = runtime;
        }
        catch
        {
            runtime.Dispose();
            new Harmony(HarmonyOwner).UnpatchAll(HarmonyOwner);
            throw;
        }
        log("BattleStats: enabled; 2 verified hooks and combat lifecycle subscriptions installed.");
    }

    // Used by the isolated checker without creating native objects or subscribing to game singletons.
    public static void InstallPatches()
    {
        var targets = BattleStatsApi.Validate();
        var harmony = new Harmony(HarmonyOwner);
        try
        {
            harmony.Patch(targets[0], postfix: new HarmonyMethod(typeof(BattleStatsModule), nameof(ReadyPostfix)));
            harmony.Patch(targets[1], postfix: new HarmonyMethod(typeof(BattleStatsModule), nameof(HistoryPostfix)));
        }
        catch { harmony.UnpatchAll(HarmonyOwner); throw; }
    }

    private static void ReadyPostfix(NCombatRoom __instance) => _runtime?.Attach(__instance);
    private static void HistoryPostfix(RunHistory history) => _runtime?.HistorySaved(history);
}
