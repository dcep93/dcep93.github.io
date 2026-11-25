using Godot;
using MegaCrit.Sts2.Core.Modding;
using DcepSpire.Modules;
using DcepSpire.Modules.Autoplay;
using DcepSpire.Modules.MapColors;

namespace DcepSpire;

[ModInitializer(nameof(Initialize))]
public static class Entry
{
    private static bool _initialized;

    public static void Initialize()
    {
        if (_initialized) return;
        _initialized = true;
        var folder = Path.GetDirectoryName(typeof(Entry).Assembly.Location)!;
        var config = Configuration.Load(Path.Combine(folder, Configuration.FileName), Log);
        ModuleHost.Start([new MapColorsModule(), new AutoplayModule()], config, Log);
        Log("Draft 0.1.0 initialized. Settings apply at game startup.");
    }

    private static void Log(string message) => GD.Print($"[DcepSpire] {message}");
}
