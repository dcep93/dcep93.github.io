using System.Text.Json;

namespace Spire420.Modules.BattleStats;

/// <param name="Imported">New or changed samples; unchanged duplicates are neither imported nor skipped.</param>
/// <param name="Skipped">Rejected points, or one for each unreadable/unsupported file.</param>
public sealed record BattleImportReport(int Files, int Imported, int Skipped);

public static class BattleHistoryImporter
{
    public static BattleImportReport ImportDirectory(string historyDirectory, ulong? localPlayerId, BattleStatsStore store, Action<string>? log = null)
    {
        var files = 0;
        var imported = 0;
        var skipped = 0;
        try
        {
            if (!Directory.Exists(historyDirectory)) return new(0, 0, 0);
            foreach (var file in Directory.EnumerateFiles(historyDirectory, "*.run", SearchOption.TopDirectoryOnly).Order(StringComparer.Ordinal))
            {
                files++;
                try
                {
                    var report = ImportJson(File.ReadAllText(file), localPlayerId, store);
                    imported += report.Imported;
                    skipped += report.Skipped;
                }
                catch (Exception ex)
                {
                    skipped++;
                    Warn(log, "history file unreadable", ex);
                }
            }
        }
        catch (Exception ex) { Warn(log, "history scan failed", ex); }
        return new(files, imported, skipped);
    }

    public static BattleImportReport ImportJson(string json, ulong? localPlayerId, BattleStatsStore store)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            if (!Property(root, "start_time", out var time) || time.ValueKind != JsonValueKind.Number || !time.TryGetInt64(out var startTime) || startTime <= 0 ||
                !Text(root, "seed", out var seed) || string.IsNullOrWhiteSpace(seed) ||
                !Array(root, "players", out var players) || !Player(players, localPlayerId, out var playerId) ||
                !Array(root, "map_point_history", out var acts)) return new(1, 0, 1);

            // Native RunHistory defaults omitted game_mode to Standard. Explicit invalid values are not defaults.
            var mode = BattleMode.Standard;
            if (Property(root, "game_mode", out var rawMode))
            {
                mode = rawMode.ValueKind == JsonValueKind.String ? BattleModes.Parse(rawMode.GetString()) : BattleMode.Unknown;
                if (mode == BattleMode.Unknown) return new(1, 0, 1);
            }

            // Preserve physical positions, including malformed entries, when finding the terminal point.
            var points = new List<(int Act, int Point, JsonElement Entry)>();
            var skipped = 0;
            var actIndex = 0;
            foreach (var act in acts.EnumerateArray())
            {
                if (act.ValueKind == JsonValueKind.Array)
                {
                    var pointIndex = 0;
                    foreach (var entry in act.EnumerateArray()) points.Add((actIndex, pointIndex++, entry));
                }
                else
                {
                    // Treat a malformed trailing act as the terminal location; never promote the preceding battle.
                    points.Add((actIndex, 0, act));
                }
                actIndex++;
            }
            var imported = 0;
            for (var i = 0; i < points.Count; i++)
            {
                var (act, point, entry) = points[i];
                if (!Array(entry, "rooms", out var rooms) || rooms.GetArrayLength() != 1 ||
                    !Text(rooms[0], "room_type", out var roomType) || roomType is not ("monster" or "elite" or "boss") ||
                    !Text(rooms[0], "model_id", out var encounter) || !encounter.StartsWith("ENCOUNTER.", StringComparison.Ordinal) || encounter.Length <= "ENCOUNTER.".Length ||
                    !Array(entry, "player_stats", out var stats) || !Damage(stats, playerId, out var damage)) { skipped++; continue; }
                if (i == points.Count - 1 && !Completed(root, encounter)) { skipped++; continue; }
                var key = BattleStatsIdentity.BattleKey(startTime, seed, playerId, act, point, 0, encounter);
                if (store.Upsert(new(key, encounter, damage, mode))) imported++;
            }
            return new(1, imported, skipped);
        }
        catch (JsonException) { return new(1, 0, 1); }
    }

    private static bool Completed(JsonElement root, string encounter)
    {
        // Save serializers may omit false/default flags; malformed flags are never evidence of completion.
        if (Property(root, "was_abandoned", out var abandoned) && abandoned.ValueKind != JsonValueKind.False) return false;
        if (Property(root, "win", out var win) && win.ValueKind == JsonValueKind.True) return true;
        if (Property(root, "win", out win) && win.ValueKind != JsonValueKind.False) return false;
        return Text(root, "killed_by_encounter", out var killed) && killed == encounter;
    }

    private static bool Player(JsonElement players, ulong? localId, out ulong playerId)
    {
        playerId = 0;
        var count = players.GetArrayLength();
        if (count == 1) return Id(players[0], "id", out playerId);
        if (count == 0 || localId is null) return false;
        var matches = 0;
        var ids = new HashSet<ulong>();
        foreach (var player in players.EnumerateArray())
        {
            if (!Id(player, "id", out var id) || !ids.Add(id)) return false;
            if (id == localId.Value) { playerId = id; matches++; }
        }
        return matches == 1;
    }

    private static bool Damage(JsonElement stats, ulong playerId, out int damage)
    {
        damage = 0;
        var matches = 0;
        foreach (var stat in stats.EnumerateArray())
        {
            if (!Id(stat, "player_id", out var id) || id != playerId) continue;
            if (!Property(stat, "damage_taken", out var value) || value.ValueKind != JsonValueKind.Number || !value.TryGetInt32(out damage) || damage < 0) return false;
            matches++;
        }
        return matches == 1;
    }

    private static bool Property(JsonElement value, string key, out JsonElement property)
    {
        property = default;
        return value.ValueKind == JsonValueKind.Object && value.TryGetProperty(key, out property);
    }
    private static bool Array(JsonElement value, string key, out JsonElement property) => Property(value, key, out property) && property.ValueKind == JsonValueKind.Array;
    private static bool Id(JsonElement value, string key, out ulong id)
    {
        id = 0;
        return Property(value, key, out var property) && property.ValueKind == JsonValueKind.Number && property.TryGetUInt64(out id);
    }
    private static bool Text(JsonElement value, string key, out string text)
    {
        text = "";
        if (!Property(value, key, out var property) || property.ValueKind != JsonValueKind.String) return false;
        text = property.GetString()!;
        return true;
    }
    private static void Warn(Action<string>? log, string message, Exception ex)
    {
        try { log?.Invoke($"BattleStats: {message} ({ex.GetType().Name})"); } catch (Exception) { }
    }
}
