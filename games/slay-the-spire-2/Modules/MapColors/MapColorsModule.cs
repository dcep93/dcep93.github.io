using Godot;
using HarmonyLib;
using MegaCrit.Sts2.Core.Nodes.Screens.Map;

namespace DcepSpire.Modules.MapColors;

public sealed class MapColorsModule : IModule
{
    public string Id => "MapColors";
    private static MapRenderer? _renderer;
    private static Action<string> _log = _ => { };
    private static readonly HashSet<string> ReportedErrors = [];

    public void Initialize(Configuration configuration, Action<string> log)
    {
        var targets = MapApi.Validate(); // Validate everything before installing any patches.
        var harmony = new Harmony("dcep93.DcepSpire.MapColors");
        _renderer = new MapRenderer(configuration);
        _log = log;
        try
        {
            foreach (var target in targets)
            {
                var handler = target.DeclaringType == typeof(NAncientMapPoint) ? nameof(AncientColorPostfix)
                    : target.DeclaringType == typeof(NMapLegendItem) ? nameof(LegendPostfix) : nameof(PointPostfix);
                harmony.Patch(target, postfix: new HarmonyMethod(typeof(MapColorsModule), handler));
            }
        }
        catch
        {
            _renderer = null;
            harmony.UnpatchAll(harmony.Id);
            throw;
        }
        log($"MapColors: enabled; {targets.Count} verified hooks installed.");
    }

    private static void PointPostfix(NMapPoint __instance) => Guard("point", () => _renderer?.Apply(__instance));
    private static void LegendPostfix(NMapLegendItem __instance) => Guard("legend", () => _renderer?.ApplyLegend(__instance));

    private static void AncientColorPostfix(NAncientMapPoint __instance, System.Reflection.MethodBase __originalMethod, ref Color __result)
    {
        if (_renderer is null || __instance.GetType() != typeof(NAncientMapPoint)) return;
        try
        {
            __result = _renderer.AncientColor(__result, __originalMethod.Name == "get_UntravelableColor");
        }
        catch (Exception ex) { Report("ancient", ex); }
    }

    private static void Guard(string context, Action action)
    {
        if (_renderer is null) return;
        try { action(); }
        catch (Exception ex) { Report(context, ex); }
    }

    private static void Report(string context, Exception ex)
    {
        // Unsupported scene variants keep vanilla rendering. Never throw into gameplay or spam every frame.
        if (ReportedErrors.Add(context + ":" + ex.Message))
            _log($"MapColors: skipped incompatible {context} visual: {ex.Message}");
    }
}
