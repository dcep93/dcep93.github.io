using Godot;
using MegaCrit.Sts2.Core.Modding;
using Spire420.Modules;
using Spire420.Modules.Autoplay;
using Spire420.Modules.MapColors;
using Spire420.Modules.MapControls;

namespace Spire420;

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
        ModuleHost.Start([new MapColorsModule(), new MapControlsModule(), new AutoplayModule()], config, Log);
        Log("Draft 0.2.0 initialized. Settings apply at game startup.");
    }

    private static void Log(string message) => GD.Print($"[spire420] {message}");
}
