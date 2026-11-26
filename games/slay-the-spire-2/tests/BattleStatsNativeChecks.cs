using System.Reflection;
using System.Runtime.CompilerServices;
using Godot;
using HarmonyLib;
using MegaCrit.Sts2.Core.Combat;
using MegaCrit.Sts2.Core.Context;
using MegaCrit.Sts2.Core.Entities.Creatures;
using MegaCrit.Sts2.Core.Models;
using MegaCrit.Sts2.Core.MonsterMoves.Intents;
using MegaCrit.Sts2.Core.Nodes.Combat;
using MegaCrit.Sts2.Core.Rooms;
using MegaCrit.Sts2.Core.Runs;
using MegaCrit.Sts2.Core.Runs.History;
using MegaCrit.Sts2.Core.Saves;
using Spire420.Modules.BattleStats;

public static class BattleStatsNativeChecks
{
    public static void Run(Action<string, Action> check, Action<bool, string> require)
    {
        check("native current-run projection preserves mode and imports only earlier completed points", () =>
        {
            var directory = Path.Combine(Path.GetTempPath(), "spire420-projection-" + Guid.NewGuid());
            try
            {
                var point = new MapPointHistoryEntry
                {
                    Rooms = [new() { RoomType = RoomType.Monster, ModelId = new ModelId("ENCOUNTER", "A") }],
                    PlayerStats = [new() { PlayerId = 1, DamageTaken = 7 }]
                };
                var source = new List<List<MapPointHistoryEntry>> { new() { point, point } };
                foreach (var mode in new[] { GameMode.Standard, GameMode.Daily, GameMode.Dread, GameMode.Blitz })
                {
                    var history = BattleStatsApi.ProjectHistory(123, "seed", mode, [1], source);
                    require(history.GameMode == mode && history.WasAbandoned && !history.Win, "projection lost native mode or incomplete marker");
                    require(!ReferenceEquals(history.MapPointHistory, source) && !ReferenceEquals(history.MapPointHistory[0], source[0]) && source[0].Count == 2, "projection mutated source lists");
                    var store = new BattleStatsStore(Path.Combine(directory, mode + ".json"));
                    require(BattleHistoryImporter.ImportJson(JsonSerializationUtility.ToJson(history), 1, store).Imported == 1, "projection imported active final point or lost completed point");
                    require(store.Summary("ENCOUNTER.A", BattleStatsApi.Mode(mode)) == new BattleSummary(1, 7, 7), "native serialized mode not parsed");
                    require(Enum.GetValues<BattleMode>().Where(m => m != BattleStatsApi.Mode(mode)).All(m => store.Summary("ENCOUNTER.A", m).Count == 0), "projection polluted another mode");
                }
                require(BattleStatsApi.Mode(GameMode.None) == BattleMode.Unknown && BattleStatsApi.Mode((GameMode)999) == BattleMode.Unknown, "unsupported native mode mapped to Standard");
                require(!Directory.Exists(directory), "projection/import touched disk");
            }
            finally { if (Directory.Exists(directory)) Directory.Delete(directory, true); }
        });
        check("attack preview uses native single, dynamic multihit and polymorphic totals before block", () =>
        {
            // Creature is managed data, not a Godot node. Uninitialized avoids unrelated gameplay constructors.
            var owner = (Creature)RuntimeHelpers.GetUninitializedObject(typeof(Creature));
            var previous = LocalContext.NetId;
            try
            {
                LocalContext.NetId = null;
                var repeats = 3;
                var multi = new MultiAttackIntent(7, () => repeats);
                require(BattleStatsIntents.Evaluate([new SingleAttackIntent(5), multi], [], owner) == 26, "native single or repeat total lost");
                repeats = 4;
                require(BattleStatsIntents.Evaluate([multi], [], owner) == 28, "dynamic repeats cached");
                require(BattleStatsIntents.Evaluate([new ModifiedAttack()], [], owner) == 71, "recomputed base damage instead of using native total override");
                require(BattleStatsIntents.Evaluate([new SingleAttackIntent(int.MaxValue), new SingleAttackIntent(int.MaxValue)], [], owner) == 2L * int.MaxValue, "enemy attack sum overflowed int");
                require(BattleStatsIntents.Evaluate([new HiddenIntent()], [], owner) is null &&
                    BattleStatsIntents.Evaluate([new UnknownIntent()], [], owner) is null, "hidden/unknown attack exposed or treated as zero");
                require(BattleStatsIntents.Evaluate([new SingleAttackIntent(() => throw new InvalidOperationException())], [], owner) is null, "failed intent became partial total");
                require(BattleStatsIntents.Evaluate([new DefendIntent(), new BuffIntent(), new StunIntent()], [], owner) == 0, "known nonattack counted as damage");
                var native = PatchProcessor.GetOriginalInstructions(typeof(AttackIntent).GetMethod("GetSingleDamage")!);
                require(native.Any(i => i.operand is MethodInfo m && m.Name == "ModifyDamage" && m.DeclaringType?.Name == "Hook"), "native attack no longer uses modified damage");
                require(native.Any(i => i.operand is MethodInfo m && m.Name == "GetMe" && m.DeclaringType == typeof(LocalContext)), "native attack no longer uses local player");
            }
            finally { LocalContext.NetId = previous; }
        });
        check("intent freshness rejects frozen native displays even with unchanged intent identity", () =>
        {
            BattleStatsApi.Validate();
            var nativeFrozen = typeof(NIntent).GetField("_isFrozen", BindingFlags.NonPublic | BindingFlags.Instance);
            require(nativeFrozen is { IsPrivate: true, IsStatic: false } && nativeFrozen.FieldType == typeof(bool), "native frozen-state contract changed");
            var validated = typeof(BattleStatsApi).GetField("_isFrozen", BindingFlags.NonPublic | BindingFlags.Static)?.GetValue(null);
            require(Equals(validated, nativeFrozen), "frozen intent metadata not validated");
            var intent = new SingleAttackIntent(5);
            require(BattleStatsApi.IntentIsFresh(intent, intent, false), "fresh visible intent rejected");
            require(!BattleStatsApi.IntentIsFresh(intent, intent, true), "frozen display allowed a recomputed total");
            require(!BattleStatsApi.IntentIsFresh(new SingleAttackIntent(5), intent, false), "same-valued stale intent accepted");
            require(!BattleStatsApi.IntentIsFresh(null, intent, false), "uninitialized display accepted");
            var visibility = PatchProcessor.GetOriginalInstructions(typeof(BattleStatsApi).GetMethod("IntentsVisible")!);
            require(visibility.Any(i => i.operand is MethodInfo method && method == typeof(BattleStatsApi).GetMethod("IntentIsFresh")) &&
                visibility.Any(i => i.operand is FieldInfo field && field.DeclaringType == typeof(BattleStatsApi) && field.Name == "_isFrozen"),
                "native visibility does not consume validated frozen-state metadata");
        });
        check("unavailable combat state and unrecognized intent kinds remain unknown", () =>
        {
            var unavailable = (CombatState)RuntimeHelpers.GetUninitializedObject(typeof(CombatState));
            require(BattleStatsIntents.Current(unavailable, _ => true) is null, "unavailable state did not yield unknown");
            var owner = (Creature)RuntimeHelpers.GetUninitializedObject(typeof(Creature));
            require(BattleStatsIntents.Evaluate([new ConcealedAttack()], [], owner) is null, "concealed custom intent revealed damage");
        });
        check("intent aggregation ignores dead and allied creatures and refuses partial or overflowing totals", () =>
        {
            (bool Enemy, bool Alive, long Damage)[] enemies = [(true, true, 17L), (true, false, 999L), (false, true, 999L), (true, true, 25L)];
            require(BattleStatsIntents.Sum(enemies, c => c.Enemy && c.Alive, c => c.Damage) == 42, "dead/allied intent included");
            require(BattleStatsIntents.Sum(enemies, c => !c.Alive, _ => throw new InvalidOperationException()) is null, "failure did not mark unknown");
            require(BattleStatsIntents.Sum(enemies, _ => false, _ => throw new InvalidOperationException()) == 0, "excluded creature evaluated");
            require(BattleStatsIntents.Sum(new long?[] { 12, null, 8 }, _ => true, n => n) is null, "partial known sum shown");
            require(BattleStatsIntents.Sum(new long[] { long.MaxValue, 1 }, _ => true, n => n) is null, "wide overflow accepted");
            require(BattleStatsIntents.Sum(new long[] { -1 }, _ => true, n => n) is null, "invalid native damage accepted");
            require(BattleStatsFormatter.Format(0, new(0, null, null), 0).EndsWith("力0") && BattleStatsFormatter.Format(0, new(0, null, null), null).EndsWith("力?"), "zero and unknown indistinguishable");
        });
        check("build label geometry transforms scaled and translated parents and stays below on resize", () =>
        {
            var source = new Transform2D(new Vector2(2, 0), new Vector2(0, 2), new Vector2(100, 40));
            var parent = new Transform2D(new Vector2(.5f, 0), new Vector2(0, .5f), new Vector2(20, 10));
            var bounds = BattleStatsLayout.Bounds(parent.AffineInverse() * source, new Vector2(80, 20));
            require(bounds == new Rect2(160, 60, 320, 80), "wrong transformed build bounds");
            var rotated = BattleStatsLayout.Bounds(new Transform2D(Mathf.Pi / 2, new Vector2(100, 100)), new Vector2(20, 10));
            require(rotated.Position.IsEqualApprox(new Vector2(90, 100)) && rotated.Size.IsEqualApprox(new Vector2(10, 20)), "not all label corners transformed");
            foreach (var width in new[] { 1280f, 1920f, 2560f })
            {
                var viewport = new Rect2(0, 0, width, 1080);
                var info = new Rect2(width - 200, 93, 189, 75);
                var result = BattleStatsLayout.Below(info, viewport, new Vector2(700, 40));
                require(result.End.X == info.End.X && result.Position.Y == info.End.Y + BattleStatsLayout.Gap && result.Size.X == 700, "layout lost right alignment or below-build position");
                var fallback = BattleStatsLayout.Fallback(viewport, new Vector2(700, 40));
                require(fallback.End.X <= viewport.End.X && fallback.Position.X >= 0 && fallback.Position.Y > 0, "unsafe fallback");
            }
            require(BattleStatsLayout.FontSize > 22, "font did not increase");
        });
    }

    private sealed class ConcealedAttack : AttackIntent
    {
        public override IntentType IntentType => IntentType.Unknown;
        public override int GetTotalDamage(IEnumerable<Creature> targets, Creature owner) => 71;
    }

    private sealed class ModifiedAttack : AttackIntent
    {
        public override int GetTotalDamage(IEnumerable<Creature> targets, Creature owner) => 71;
    }
}
