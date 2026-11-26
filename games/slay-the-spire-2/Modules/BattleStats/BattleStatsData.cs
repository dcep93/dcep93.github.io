using System.Globalization;
using System.Security.Cryptography;
using System.Text.Json;

namespace Spire420.Modules.BattleStats;

public enum BattleMode { Unknown, Standard, Daily, Dread, Blitz }

public static class BattleModes
{
    public static BattleMode Parse(string? value) => value switch
    {
        "standard" => BattleMode.Standard, "daily" => BattleMode.Daily,
        "dread" => BattleMode.Dread, "blitz" => BattleMode.Blitz, _ => BattleMode.Unknown
    };
}

public sealed record BattleSample(string Key, string Encounter, int Damage, BattleMode Mode);
public sealed record BattleSummary(int Count, decimal? Mean, decimal? Median);

public static class BattleStatsIdentity
{
    public static string BattleKey(long startTime, string seed, ulong playerId, int actIndex, int pointIndex, int roomIndex, string encounter) =>
        Hash([startTime, seed, playerId, actIndex, pointIndex, roomIndex, encounter]);

    public static string ProfileFile(string storageRoot, string absoluteProfilePath, string uniqueId) =>
        Path.Combine(storageRoot, Hash([Path.TrimEndingDirectorySeparator(Path.GetFullPath(absoluteProfilePath)), uniqueId]) + ".json");

    private static string Hash(object[] identity) => Convert.ToHexStringLower(SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(identity)));
}

public static class BattleStatsFormatter
{
    public static string Format(int current, BattleSummary summary, long? attack) =>
        $"今{current.ToString(CultureInfo.InvariantCulture)} σ{Number(summary.Mean)} 中{Number(summary.Median)} #{summary.Count.ToString(CultureInfo.InvariantCulture)} Σ{attack?.ToString(CultureInfo.InvariantCulture) ?? "?"}";

    private static string Number(decimal? value) => value?.ToString("0.#", CultureInfo.InvariantCulture) ?? "—";
}
