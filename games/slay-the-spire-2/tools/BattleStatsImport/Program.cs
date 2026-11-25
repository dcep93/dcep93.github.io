using System.Globalization;
using System.Text.Json;
using Spire420.Modules.BattleStats;

// Uses only managed BattleStats types; no game assembly resolver or engine startup is needed.
var options = new Dictionary<string, string>(StringComparer.Ordinal);
var dryRun = false;
var supported = new HashSet<string>(["--history", "--local-player-id", "--profile-path", "--unique-id", "--database-root"], StringComparer.Ordinal);
for (var i = 0; i < args.Length; i++)
{
    if (args[i] == "--dry-run" && !dryRun) { dryRun = true; continue; }
    if (!supported.Contains(args[i]) || i + 1 == args.Length || args[i + 1].StartsWith("--", StringComparison.Ordinal) || !options.TryAdd(args[i], args[i + 1]))
        return Usage();
    i++;
}
if (options.Count != supported.Count || !ulong.TryParse(options["--local-player-id"], NumberStyles.None, CultureInfo.InvariantCulture, out var localId) ||
    !Path.IsPathFullyQualified(options["--profile-path"]) || string.IsNullOrWhiteSpace(options["--unique-id"])) return Usage();

try
{
    var history = Path.GetFullPath(options["--history"]);
    if (!Directory.Exists(history)) { Console.Error.WriteLine("History directory does not exist."); return 2; }
    var dbPath = BattleStatsIdentity.ProfileFile(Path.GetFullPath(options["--database-root"]), options["--profile-path"], options["--unique-id"]);
    var store = new BattleStatsStore(dbPath, Console.Error.WriteLine);
    var loaded = store.Load();
    var report = BattleHistoryImporter.ImportDirectory(history, localId, store, Console.Error.WriteLine);
    var saved = !dryRun && loaded && store.Flush();
    Console.WriteLine(JsonSerializer.Serialize(new { dryRun, databasePath = dbPath, files = report.Files, imported = report.Imported,
        skipped = report.Skipped, sampleCount = store.Count, readOnly = store.IsReadOnly, saved }));
    return loaded && (dryRun || saved) ? 0 : 1;
}
catch (Exception ex)
{
    Console.Error.WriteLine($"BattleStats import failed ({ex.GetType().Name}).");
    return 1;
}

static int Usage()
{
    Console.Error.WriteLine("Usage: BattleStatsImport --history DIR --local-player-id UINT64 --profile-path ABSOLUTE_PATH --unique-id ID --database-root DIR [--dry-run]");
    return 2;
}
