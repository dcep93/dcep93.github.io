using System.Globalization;
using System.Text.Json;
using Spire420.Modules.BattleStats;

static class BattleStatsChecks
{
    public static void Run(Action<string, Action> check, Action<bool, string> require)
    {
        check("battle statistics use integer samples, replace duplicates and exclude the current key", () => InTemp(dir =>
        {
            var store = new BattleStatsStore(Path.Combine(dir, "stats.json"));
            require(store.Load(), "new database failed");
            require(BattleStatsFormatter.Format(0, store.Summary("ENCOUNTER.A", BattleMode.Standard), null) == "今0 σ— 中— #0 Σ?", "empty format");
            foreach (var (key, damage) in new[] { ("a", 0), ("b", 10), ("c", 20), ("d", 21) })
                require(store.Upsert(new(key, "ENCOUNTER.A", damage, BattleMode.Standard)), "sample not inserted");
            var version = store.Version;
            require(!store.Upsert(new("b", "ENCOUNTER.A", 10, BattleMode.Standard)) && store.Version == version, "duplicate changed version");
            require(store.Summary("ENCOUNTER.A", BattleMode.Standard) == new BattleSummary(4, 12.75m, 15m), "even summary");
            require(store.Summary("ENCOUNTER.A", BattleMode.Standard, "d") == new BattleSummary(3, 10m, 10m), "replayed current attempt leaked");
            require(store.Upsert(new("d", "ENCOUNTER.A", 30, BattleMode.Standard)) && store.Count == 4, "replacement duplicated");
            store.Upsert(new("other", "ENCOUNTER.B", 1000, BattleMode.Standard));
            require(store.Summary("ENCOUNTER.A", BattleMode.Standard).Mean == 15m, "encounters mixed");
            var oldCulture = CultureInfo.CurrentCulture;
            try
            {
                CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo("fr-FR");
                require(BattleStatsFormatter.Format(7, new(23, 12.4m, 10m), 30) == "今7 σ12.4 中10 #23 Σ30", "format not invariant");
            }
            finally { CultureInfo.CurrentCulture = oldCulture; }
            var large = new BattleStatsStore(Path.Combine(dir, "large.json"));
            large.Upsert(new("a", "ENCOUNTER.A", int.MaxValue, BattleMode.Standard));
            large.Upsert(new("b", "ENCOUNTER.A", int.MaxValue - 1, BattleMode.Standard));
            require(large.Summary("ENCOUNTER.A", BattleMode.Standard) == new BattleSummary(2, int.MaxValue - .5m, int.MaxValue - .5m), "integer overflow");
            require(!large.Upsert(new("bad", "ENCOUNTER.A", -1, BattleMode.Standard)), "negative accepted");
        }));
        check("history rejects explicitly malformed or unsupported modes", () => InTemp(dir =>
        {
            foreach (var mode in new[] { "null", "42", "true", "{}", "[]", "\"future\"", "\"Standard\"", "\"0\"" })
            {
                var store = new BattleStatsStore(Path.Combine(dir, Guid.NewGuid() + ".json"));
                var json = Run([Point(9)], true).Insert(1, "\"game_mode\":" + mode + ",");
                var report = BattleHistoryImporter.ImportJson(json, 1, store);
                require(report.Imported == 0 && report.Skipped > 0 && store.Count == 0, "explicit invalid mode accepted: " + mode);
            }
        }));
        check("mode buckets isolate exact encounter and same-key reimport recovers legacy records", () => InTemp(dir =>
        {
            var path = Path.Combine(dir, "stats.json");
            var key = BattleStatsIdentity.BattleKey(123, "seed", 1, 0, 0, 0, "ENCOUNTER.A");
            var legacy = JsonSerializer.Serialize(new { SchemaVersion = 1, Samples = new[] { new { Key = key, Encounter = "ENCOUNTER.A", Damage = 9 } } });
            File.WriteAllText(path, legacy);
            var store = new BattleStatsStore(path);
            require(store.Load() && store.Count == 1 && store.Summary("ENCOUNTER.A", BattleMode.Standard).Count == 0, "legacy mode guessed");
            require(store.Flush() && File.ReadAllText(path + ".schema1.bak") == legacy && File.ReadAllText(path + ".bak") == legacy, "migration did not preserve original bytes");
            require(JsonDocument.Parse(File.ReadAllText(path)).RootElement.GetProperty("SchemaVersion").GetInt32() == 2, "schema not upgraded");
            var reloaded = new BattleStatsStore(path);
            require(reloaded.Load() && reloaded.Count == 1 && reloaded.Summary("ENCOUNTER.A", BattleMode.Standard).Count == 0, "unknown sample not preserved");
            foreach (var (name, mode, damage) in new[] { ("standard", BattleMode.Standard, 4), ("daily", BattleMode.Daily, 8), ("dread", BattleMode.Dread, 12), ("blitz", BattleMode.Blitz, 16) })
            {
                var json = Run([Point(damage)], true).Insert(1, "\"game_mode\":\"" + name + "\",");
                var before = reloaded.Count;
                require(BattleHistoryImporter.ImportJson(json, 1, reloaded).Imported == 1 && reloaded.Count == before, "same-key recovery duplicated record");
                require(reloaded.Summary("ENCOUNTER.A", mode) == new BattleSummary(1, damage, damage), "mode recovery failed");
                require(Enum.GetValues<BattleMode>().Where(m => m != mode).All(m => reloaded.Summary("ENCOUNTER.A", m).Count == 0), "modes mixed");
                reloaded.Upsert(new(name, "ENCOUNTER.B", 1000, mode));
                require(reloaded.Summary("ENCOUNTER.A", mode).Mean == damage, "encounters mixed");
                require(reloaded.Flush() && File.ReadAllText(path + ".schema1.bak") == legacy, "later write destroyed legacy backup");
            }
            var omitted = new BattleStatsStore(Path.Combine(dir, "omitted.json"));
            require(BattleHistoryImporter.ImportJson(Run([Point(0)], true), 1, omitted).Imported == 1 && omitted.Summary("ENCOUNTER.A", BattleMode.Standard).Count == 1, "native absent-mode default lost");
        }));
        check("legacy migration refuses external writes and malformed schema-two modes", () => InTemp(dir =>
        {
            var path = Path.Combine(dir, "stats.json");
            File.WriteAllText(path, "{\"SchemaVersion\":1,\"Samples\":[]}");
            var store = new BattleStatsStore(path);
            require(store.Load(), "legacy fixture load");
            File.WriteAllText(path, "external");
            require(!store.Flush() && store.IsReadOnly && File.ReadAllText(path) == "external" && !File.Exists(path + ".schema1.bak"), "migration overwrote external writer");
            foreach (var mode in new[] { "null", "99", "\"daily\"" })
            {
                var bad = "{\"SchemaVersion\":2,\"Samples\":[{\"Key\":\"a\",\"Encounter\":\"ENCOUNTER.A\",\"Damage\":0,\"Mode\":" + mode + "}]}";
                File.WriteAllText(path, bad);
                var invalid = new BattleStatsStore(path);
                require(!invalid.Load() && !invalid.Flush() && File.ReadAllText(path) == bad, "invalid stored mode guessed");
            }
        }));
        check("battle and profile identity isolate runs, players, positions and profiles", () =>
        {
            var key = BattleStatsIdentity.BattleKey(123, "seed", ulong.MaxValue, 0, 1, 0, "ENCOUNTER.A");
            require(key == BattleStatsIdentity.BattleKey(123, "seed", ulong.MaxValue, 0, 1, 0, "ENCOUNTER.A"), "unstable identity");
            var different = new[] {
                BattleStatsIdentity.BattleKey(124,"seed",ulong.MaxValue,0,1,0,"ENCOUNTER.A"),
                BattleStatsIdentity.BattleKey(123,"other",ulong.MaxValue,0,1,0,"ENCOUNTER.A"),
                BattleStatsIdentity.BattleKey(123,"seed",1,0,1,0,"ENCOUNTER.A"),
                BattleStatsIdentity.BattleKey(123,"seed",ulong.MaxValue,1,1,0,"ENCOUNTER.A"),
                BattleStatsIdentity.BattleKey(123,"seed",ulong.MaxValue,0,2,0,"ENCOUNTER.A"),
                BattleStatsIdentity.BattleKey(123,"seed",ulong.MaxValue,0,1,1,"ENCOUNTER.A"),
                BattleStatsIdentity.BattleKey(123,"seed",ulong.MaxValue,0,1,0,"ENCOUNTER.B") };
            require(different.All(x => x != key) && different.Distinct().Count() == 7, "identity collision");
            var file = BattleStatsIdentity.ProfileFile("/tmp/stats", "/profiles/a", "one");
            require(file != BattleStatsIdentity.ProfileFile("/tmp/stats", "/profiles/b", "one") &&
                file != BattleStatsIdentity.ProfileFile("/tmp/stats", "/profiles/a", "two"), "profile collision");
            require(file == BattleStatsIdentity.ProfileFile("/tmp/stats", "/profiles/a/../a/", "one"), "profile path normalization mismatch");
        });
        check("history accepts completed wins/deaths including zero damage and deduplicates", () => InTemp(dir =>
        {
            var store = new BattleStatsStore(Path.Combine(dir, "stats.json"));
            var run = Run([Point(0), Point(11)], win: true);
            var result = BattleHistoryImporter.ImportJson(run, null, store);
            require(result.Imported == 2 && result.Skipped == 0 && store.Count == 2, "win import");
            require(BattleHistoryImporter.ImportJson(run, null, store).Imported == 0 && store.Count == 2, "duplicate import");
            require(store.Summary("ENCOUNTER.A", BattleMode.Standard, BattleStatsIdentity.BattleKey(123, "seed", 1, 0, 1, 0, "ENCOUNTER.A")) == new BattleSummary(1, 0m, 0m), "import/live key mismatch");
            foreach (var roomType in new[] { "monster", "elite", "boss" })
            {
                var typed = new BattleStatsStore(Path.Combine(dir, roomType + ".json"));
                require(BattleHistoryImporter.ImportJson(run.Replace("monster", roomType), null, typed).Imported == 2, "valid combat room type rejected");
            }
            foreach (var (win, abandoned, killed, count) in new[] {
                (false,false,"ENCOUNTER.A",2), (false,false,"ENCOUNTER.B",1),
                (false,false,"NONE.NONE",1), (true,true,"ENCOUNTER.A",1), (false,true,"ENCOUNTER.A",1) })
            {
                var other = new BattleStatsStore(Path.Combine(dir, Guid.NewGuid()+".json"));
                BattleHistoryImporter.ImportJson(Run([Point(0), Point(11)], win, abandoned, killed), null, other);
                require(other.Count == count, "terminal completion filter");
            }
        }));
        check("history rejects ambiguous multiplayer, multiroom, missing damage and malformed structure", () => InTemp(dir =>
        {
            var store = new BattleStatsStore(Path.Combine(dir, "stats.json"));
            var multi = Run([Point(8, ulong.MaxValue)], win: true, players: [1, ulong.MaxValue]);
            require(BattleHistoryImporter.ImportJson(multi, null, store).Imported == 0, "guessed multiplayer local ID");
            require(BattleHistoryImporter.ImportJson(multi, 2, store).Imported == 0, "foreign player accepted");
            require(BattleHistoryImporter.ImportJson(multi, ulong.MaxValue, store).Imported == 1, "uint64 local ID rejected");
            var malformedPoints = new object[] { Point(-1),
                new { rooms = new[] { new { model_id = "ENCOUNTER.A", room_type = "event" } }, player_stats = new[] { new { player_id = 1, damage_taken = 2 } } },
                new { rooms = new[] { new { model_id = "ENCOUNTER.A", room_type = "unknown" } }, player_stats = new[] { new { player_id = 1, damage_taken = 2 } } },
                new { rooms = new[] { new { model_id = "ENCOUNTER.A" } }, player_stats = new[] { new { player_id = 1, damage_taken = 2 } } }, new { rooms = new[] { new { model_id = "ENCOUNTER.A", room_type = "monster" } }, player_stats = new[] { new { player_id = 1 } } },
                new { rooms = new[] { new { model_id = "EVENT.A", room_type = "event" }, new { model_id = "ENCOUNTER.A", room_type = "monster" } }, player_stats = new[] { new { player_id = 1, damage_taken = 10 } } },
                new { rooms = new[] { new { model_id = "ENCOUNTER.A", room_type = "monster" } }, player_stats = new[] { new { player_id = 1, damage_taken = 2.5 } } }, "broken" };
            require(BattleHistoryImporter.ImportJson(Run(malformedPoints, true), 1, store).Imported == 0, "ambiguous record accepted");
            foreach (var json in new[] { "{", "null", "[]", Run([Point(1)],true).Replace("\"start_time\":123", "\"start_time\":0"), Run([Point(1)],true).Replace("\"seed\":\"seed\"", "\"seed\":\"\"") })
                require(BattleHistoryImporter.ImportJson(json, 1, store).Imported == 0, "invalid root accepted");
            // A malformed trailing point is still the final point; the preceding combat is complete.
            var other = new BattleStatsStore(Path.Combine(dir, "other.json"));
            BattleHistoryImporter.ImportJson(Run([Point(2), "broken"], abandoned: true), 1, other);
            require(other.Count == 1, "lost earlier completed point");
        }));
        check("history preserves zero-based act positions and rejects duplicate player statistics", () => InTemp(dir =>
        {
            var store = new BattleStatsStore(Path.Combine(dir, "stats.json"));
            var run = JsonSerializer.Serialize(new { start_time = 123, seed = "seed", win = true, players = new[] { new { id = 1 } },
                map_point_history = new object[][] { ["malformed", Point(3)], [], [Point(9)] } });
            require(BattleHistoryImporter.ImportJson(run, null, store).Imported == 2, "cross-act import lost records");
            require(store.Summary("ENCOUNTER.A", BattleMode.Standard, BattleStatsIdentity.BattleKey(123, "seed", 1, 2, 0, 0, "ENCOUNTER.A")) == new BattleSummary(1, 3m, 3m), "act positions shifted");
            require(store.Summary("ENCOUNTER.A", BattleMode.Standard, BattleStatsIdentity.BattleKey(123, "seed", 1, 0, 1, 0, "ENCOUNTER.A")) == new BattleSummary(1, 9m, 9m), "point positions shifted");
            var duplicate = new { rooms = new[] { new { model_id = "ENCOUNTER.A", room_type = "monster" } },
                player_stats = new[] { new { player_id = 1, damage_taken = 2 }, new { player_id = 1, damage_taken = 3 } } };
            require(BattleHistoryImporter.ImportJson(Run([duplicate],true),1,store).Imported == 0, "duplicate player statistics accepted");
        }));
        check("history directory isolates corrupt files and reads only run files without writing", () => InTemp(dir =>
        {
            File.WriteAllText(Path.Combine(dir, "a.run"), Run([Point(0)], true));
            File.WriteAllText(Path.Combine(dir, "b.run"), "broken");
            File.WriteAllText(Path.Combine(dir, "a.run.backup"), Run([Point(999)], true));
            var before = Directory.GetFiles(dir).ToDictionary(x => x, File.ReadAllText);
            var store = new BattleStatsStore(Path.Combine(dir, "stats.json"));
            var report = BattleHistoryImporter.ImportDirectory(dir, 1, store);
            require(report.Files == 2 && report.Imported == 1 && report.Skipped == 1, "directory report");
            require(before.All(x => File.ReadAllText(x.Key) == x.Value) && Directory.GetFiles(dir).Length == 3, "import wrote history");
        }));
        check("battle database round trips atomically, backs up and preserves unreadable schemas", () => InTemp(dir =>
        {
            var path = Path.Combine(dir, "nested", "stats.json");
            var store = new BattleStatsStore(path);
            require(store.Load() && store.Upsert(new("a", "ENCOUNTER.A", 7, BattleMode.Standard)) && store.Flush(), "first flush");
            var previous = File.ReadAllText(path);
            store.Upsert(new("b", "ENCOUNTER.A", 8, BattleMode.Standard));
            require(store.Flush() && File.ReadAllText(path + ".bak") == previous, "backup mismatch");
            var loaded = new BattleStatsStore(path);
            require(loaded.Load() && loaded.Summary("ENCOUNTER.A", BattleMode.Standard) == new BattleSummary(2, 7.5m, 7.5m), "round trip");
            require(Directory.GetFiles(Path.GetDirectoryName(path)!).Length == 2, "temporary files leaked");
            // An external modification after a successful load must also be preserved.
            loaded.Upsert(new("c", "ENCOUNTER.A", 9, BattleMode.Standard));
            File.WriteAllText(path, "external changes");
            require(!loaded.Flush() && loaded.IsReadOnly && loaded.Count == 3 && File.ReadAllText(path) == "external changes", "concurrent writer overwritten");
            foreach (var bad in new[] { "broken", "null", "{\"SchemaVersion\":999,\"Samples\":[]}", "{\"SchemaVersion\":1,\"Samples\":[{\"Key\":\"x\",\"Encounter\":\"ENCOUNTER.A\"}]}" })
            {
                File.WriteAllText(path, bad);
                var messages = new List<string>();
                var broken = new BattleStatsStore(path, messages.Add);
                require(!broken.Load() && broken.IsReadOnly && messages.Count > 0, "unsafe load accepted");
                broken.Upsert(new("new", "ENCOUNTER.A", 5, BattleMode.Standard));
                require(!broken.Flush() && File.ReadAllText(path) == bad && File.ReadAllText(path + ".bak") == previous, "corrupt evidence overwritten");
            }
            var blocked = Path.Combine(dir, "file");
            File.WriteAllText(blocked, "obstacle");
            var failed = new BattleStatsStore(Path.Combine(blocked, "stats.json"));
            failed.Upsert(new("a", "ENCOUNTER.A", 1, BattleMode.Standard));
            require(!failed.Flush() && failed.Count == 1 && File.ReadAllText(blocked) == "obstacle", "I/O failure discarded memory");
            var replacementPath = Path.Combine(dir, "replacement.json");
            var replacement = new BattleStatsStore(replacementPath);
            replacement.Upsert(new("a", "ENCOUNTER.A", 1, BattleMode.Standard));
            require(replacement.Flush(), "replacement fixture setup");
            var originalBytes = File.ReadAllBytes(replacementPath);
            Directory.CreateDirectory(replacementPath + ".bak");
            File.WriteAllText(Path.Combine(replacementPath + ".bak", "obstacle"), "preserve");
            replacement.Upsert(new("b", "ENCOUNTER.A", 2, BattleMode.Standard));
            require(!replacement.Flush() && replacement.Count == 2 && File.ReadAllBytes(replacementPath).SequenceEqual(originalBytes), "failed replacement lost old data");
            require(!Directory.GetFiles(dir, "*.tmp").Any(), "failed replacement leaked temporary file");
        }));
    }

    private static object Point(int damage, ulong player = 1) => new { rooms = new[] { new { model_id = "ENCOUNTER.A", room_type = "monster" } }, player_stats = new[] { new { player_id = player, damage_taken = damage } } };
    private static string Run(object[] points, bool win = false, bool abandoned = false, string killed = "NONE.NONE", ulong[]? players = null) =>
        JsonSerializer.Serialize(new { start_time = 123, seed = "seed", win, was_abandoned = abandoned, killed_by_encounter = killed,
            players = (players ?? [1]).Select(id => new { id }), map_point_history = new[] { points } });
    private static void InTemp(Action<string> action)
    {
        var dir = Path.Combine(Path.GetTempPath(), "spire420-battle-check-" + Guid.NewGuid());
        Directory.CreateDirectory(dir);
        try { action(dir); }
        finally { Directory.Delete(dir, true); }
    }
}
