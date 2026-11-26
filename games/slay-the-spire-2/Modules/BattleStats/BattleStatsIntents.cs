using MegaCrit.Sts2.Core.Combat;
using MegaCrit.Sts2.Core.Entities.Creatures;
using MegaCrit.Sts2.Core.MonsterMoves.Intents;

namespace Spire420.Modules.BattleStats;

public static class BattleStatsIntents
{
    public static long? Current(CombatState state, Func<Creature, bool> visible)
    {
        try
        {
            var targets = state.Players.Select(p => p.Creature).ToArray();
            return Sum(state.Enemies, c => c.IsEnemy && c.IsAlive, c =>
                visible(c) && c.Monster is { } monster ? Evaluate(monster.NextMove.Intents, targets, c) : null);
        }
        catch (Exception) { return null; }
    }

    // The native total uses local-player damage hooks and the native repeat count, before block.
    public static long? Evaluate(IEnumerable<AbstractIntent> intents, IEnumerable<Creature> targets, Creature owner) =>
        Sum(intents, _ => true, intent => intent switch
        {
            { IntentType: IntentType.Hidden or IntentType.Unknown } => null,
            AttackIntent attack when attack.IntentType is IntentType.Attack or IntentType.DeathBlow => attack.GetTotalDamage(targets, owner),
            BuffIntent or CardDebuffIntent or DebuffIntent or DefendIntent or EscapeIntent or HealIntent or
                SleepIntent or StatusIntent or StunIntent or SummonIntent => 0,
            _ => null
        });

    public static long? Sum<T>(IEnumerable<T> items, Func<T, bool> include, Func<T, long?> preview)
    {
        try
        {
            long total = 0;
            foreach (var item in items)
            {
                if (!include(item)) continue;
                var value = preview(item);
                if (value is null or < 0) return null;
                total = checked(total + value.Value);
            }
            return total;
        }
        catch (Exception) { return null; } // A partial total would falsely imply all intents are known.
    }
}
