namespace Spire420.Modules.BattleStats;

// Engine-independent completion gate: scene exits and resets never call this gate.
public sealed class BattleStatsLifecycle(object state, string profile, int baseline)
{
    public bool Completed { get; private set; }
    public int Damage(int counter) => counter >= baseline && baseline >= 0 ? counter - baseline : -1;

    public bool TryComplete(object candidateState, string candidateProfile, bool abandoned, bool replay, int counter, out int damage)
    {
        damage = Damage(counter);
        if (Completed || !ReferenceEquals(state, candidateState) || profile != candidateProfile || abandoned || replay || damage < 0)
            return false;
        Completed = true;
        return true;
    }

    public static int Baseline(int roomCount, int counter) => roomCount == 1 ? 0 : counter;
    public static bool Show(bool activeMode, bool inProgress, bool currentScreen, bool sameState, bool replay) =>
        activeMode && inProgress && currentScreen && sameState && !replay;
}
