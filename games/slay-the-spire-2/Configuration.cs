using System.Globalization;
using System.Text.Json;

namespace Spire420;

public readonly record struct Rgb(float R, float G, float B)
{
    public static bool TryParse(string? value, out Rgb rgb)
    {
        rgb = default;
        if (value is not { Length: 7 } || value[0] != '#' ||
            !uint.TryParse(value.AsSpan(1), NumberStyles.AllowHexSpecifier, CultureInfo.InvariantCulture, out var hex))
            return false;
        rgb = new Rgb(((hex >> 16) & 255) / 255f, ((hex >> 8) & 255) / 255f, (hex & 255) / 255f);
        return true;
    }
}

public sealed class Configuration
{
    public const string FileName = "settings.json.txt";
    private readonly Dictionary<string, bool> _modules = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, Rgb> _colors = new(StringComparer.OrdinalIgnoreCase);
    public static IReadOnlyDictionary<string, string> DefaultColors { get; } =
        new System.Collections.ObjectModel.ReadOnlyDictionary<string, string>(new Dictionary<string, string>
        {
            ["Monster"] = "#687680", ["Elite"] = "#F07836", ["RestSite"] = "#35B85A",
            ["Shop"] = "#FFD166", ["Treasure"] = "#CC83D8", ["Unknown"] = "#48D5CF",
            ["Boss"] = "#B92B41", ["Ancient"] = "#463D72"
        });

    public Configuration()
    {
        foreach (var (kind, hex) in DefaultColors)
        {
            Rgb.TryParse(hex, out var color);
            _colors[kind] = color;
        }
    }

    // New modules are enabled even when an older settings file does not list them.
    public bool IsEnabled(string module) => !_modules.TryGetValue(module, out var enabled) || enabled;
    public bool TryGetColor(string kind, out Rgb color) => _colors.TryGetValue(kind, out color);

    public static Configuration Load(string path, Action<string> warn)
    {
        try
        {
            if (!File.Exists(path)) return new Configuration();
            return Parse(File.ReadAllText(path), warn);
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
        {
            warn($"Cannot read settings; using enabled defaults: {ex.Message}");
            return new Configuration();
        }
    }

    public static Configuration Parse(string json, Action<string> warn)
    {
        var config = new Configuration();
        try
        {
            using var doc = JsonDocument.Parse(json, new JsonDocumentOptions
            {
                CommentHandling = JsonCommentHandling.Skip, AllowTrailingCommas = true
            });
            if (doc.RootElement.ValueKind != JsonValueKind.Object)
                throw new JsonException("Settings must be an object.");
            if (doc.RootElement.TryGetProperty("modules", out var modules))
            {
                if (modules.ValueKind != JsonValueKind.Object) warn("modules must be an object; using enabled defaults.");
                else foreach (var property in modules.EnumerateObject())
                {
                    if (property.Value.ValueKind is JsonValueKind.True or JsonValueKind.False)
                        config._modules[property.Name] = property.Value.GetBoolean();
                    else warn($"Invalid toggle {property.Name}; keeping its enabled default.");
                }
            }
            if (doc.RootElement.TryGetProperty("mapColors", out var colors))
            {
                if (colors.ValueKind != JsonValueKind.Object) warn("mapColors must be an object; using palette defaults.");
                else foreach (var property in colors.EnumerateObject())
                {
                    if (!config._colors.ContainsKey(property.Name))
                        warn($"Unknown room type {property.Name}; ignored.");
                    else if (property.Value.ValueKind == JsonValueKind.String && Rgb.TryParse(property.Value.GetString(), out var rgb))
                        config._colors[property.Name] = rgb;
                    else warn($"Invalid color for {property.Name}; expected #RRGGBB, keeping default.");
                }
            }
        }
        catch (JsonException ex)
        {
            warn($"Invalid settings; using enabled defaults: {ex.Message}");
            return new Configuration();
        }
        return config;
    }
}
