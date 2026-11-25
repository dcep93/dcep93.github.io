using System.Text.Json;

namespace Spire420.Modules.BattleStats;

/// <summary>Local-only samples. Failed reads lock disk writes; gameplay can keep collecting in memory.</summary>
public sealed class BattleStatsStore(string path, Action<string>? log = null)
{
    private readonly Dictionary<string, BattleSample> _samples = new(StringComparer.Ordinal);
    private bool _loaded;
    private bool _dirty;
    private byte[]? _original;
    public int Count => _samples.Count;
    public long Version { get; private set; }
    public bool IsReadOnly { get; private set; }

    public bool Load()
    {
        if (_loaded) return !IsReadOnly;
        _loaded = true;
        try
        {
            byte[] bytes;
            try { bytes = File.ReadAllBytes(path); }
            catch (FileNotFoundException) { return true; }
            catch (DirectoryNotFoundException) { return true; }
            var loaded = ReadSamples(bytes);
            foreach (var sample in loaded) _samples.Add(sample.Key, sample);
            _original = bytes;
            Version++;
            return true;
        }
        catch (Exception ex)
        {
            IsReadOnly = true;
            Warn("database unreadable; preserving file and disabling writes", ex);
            return false;
        }
    }

    public bool Upsert(BattleSample sample)
    {
        Load();
        if (!Valid(sample)) return false;
        if (_samples.TryGetValue(sample.Key, out var old) && old == sample) return false;
        _samples[sample.Key] = sample;
        _dirty = true;
        Version++;
        return true;
    }

    public BattleSummary Summary(string encounter, string? excludedKey = null)
    {
        Load();
        var damages = _samples.Values.Where(s => s.Encounter == encounter && s.Key != excludedKey).Select(s => s.Damage).Order().ToArray();
        if (damages.Length == 0) return new(0, null, null);
        long total = 0;
        foreach (var damage in damages) total += damage;
        var middle = damages.Length / 2;
        var median = damages.Length % 2 == 1 ? damages[middle] : ((decimal)damages[middle - 1] + damages[middle]) / 2;
        return new(damages.Length, (decimal)total / damages.Length, median);
    }

    public bool Flush()
    {
        Load();
        if (IsReadOnly) return false;
        if (!_dirty) return true;
        string? temporary = null;
        try
        {
            var fullPath = Path.GetFullPath(path);
            Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);
            // Refuse to replace a file changed by another writer after Load, including corrupt evidence.
            var current = File.Exists(fullPath) ? File.ReadAllBytes(fullPath) : null;
            if ((_original is null) != (current is null) || (_original is not null && !current!.AsSpan().SequenceEqual(_original)))
            {
                IsReadOnly = true;
                Warn("database changed externally; preserving file and disabling writes");
                return false;
            }
            var bytes = JsonSerializer.SerializeToUtf8Bytes(new
            {
                SchemaVersion = 1,
                Samples = _samples.Values.OrderBy(s => s.Key, StringComparer.Ordinal).ToArray()
            });
            temporary = fullPath + "." + Guid.NewGuid().ToString("N") + ".tmp";
            using (var stream = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                stream.Write(bytes);
                stream.Flush(flushToDisk: true);
            }
            if (current is null) File.Move(temporary, fullPath);
            else File.Replace(temporary, fullPath, fullPath + ".bak");
            temporary = null;
            _original = bytes;
            _dirty = false;
            return true;
        }
        catch (Exception ex)
        {
            Warn("database write failed; samples retained in memory", ex);
            return false;
        }
        finally
        {
            if (temporary is not null)
                try { File.Delete(temporary); } catch (Exception) { /* Best effort; never interrupt gameplay. */ }
        }
    }

    private static List<BattleSample> ReadSamples(byte[] bytes)
    {
        using var doc = JsonDocument.Parse(bytes);
        var root = doc.RootElement;
        if (root.ValueKind != JsonValueKind.Object || !root.TryGetProperty("SchemaVersion", out var version) ||
            version.ValueKind != JsonValueKind.Number || !version.TryGetInt32(out var v) || v != 1 ||
            !root.TryGetProperty("Samples", out var samples) || samples.ValueKind != JsonValueKind.Array)
            throw new InvalidDataException("Unsupported database structure or schema");
        var result = new List<BattleSample>();
        var keys = new HashSet<string>(StringComparer.Ordinal);
        foreach (var item in samples.EnumerateArray())
        {
            if (item.ValueKind != JsonValueKind.Object || !item.TryGetProperty("Key", out var key) || key.ValueKind != JsonValueKind.String ||
                !item.TryGetProperty("Encounter", out var encounter) || encounter.ValueKind != JsonValueKind.String ||
                !item.TryGetProperty("Damage", out var damage) || damage.ValueKind != JsonValueKind.Number || !damage.TryGetInt32(out var d))
                throw new InvalidDataException("Malformed battle sample");
            var sample = new BattleSample(key.GetString()!, encounter.GetString()!, d);
            if (!Valid(sample) || !keys.Add(sample.Key)) throw new InvalidDataException("Invalid or duplicate battle sample");
            result.Add(sample);
        }
        return result;
    }

    private static bool Valid(BattleSample sample) => !string.IsNullOrWhiteSpace(sample.Key) &&
        !string.IsNullOrEmpty(sample.Encounter) && sample.Encounter.StartsWith("ENCOUNTER.", StringComparison.Ordinal) &&
        sample.Encounter.Length > "ENCOUNTER.".Length && sample.Damage >= 0;

    private void Warn(string message, Exception? ex = null)
    {
        try { log?.Invoke($"BattleStats: {message}{(ex is null ? "" : " (" + ex.GetType().Name + ")")}"); }
        catch (Exception) { /* Diagnostics must not break gameplay. */ }
    }
}
