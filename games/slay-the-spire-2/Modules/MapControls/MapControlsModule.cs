using Godot;
using HarmonyLib;
using MegaCrit.Sts2.Core.Nodes.Screens.Map;

namespace Spire420.Modules.MapControls;

public sealed class MapControlsModule : IModule
{
    public const string HarmonyOwner = "dcep93.spire420.MapControls";
    public string Id => "MapControls";
    private static Action<string> _log = _ => { };
    private static bool _reportedHitTestFailure;

    public void Initialize(Configuration configuration, Action<string> log)
    {
        var targets = MapControlsApi.Validate();
        var harmony = new Harmony(HarmonyOwner);
        _log = log;
        try
        {
            harmony.Patch(targets[0], transpiler: new HarmonyMethod(typeof(MapControlsModule), nameof(ScrollTranspiler)));
            harmony.Patch(targets[1], prefix: new HarmonyMethod(typeof(MapControlsModule), nameof(DrawingPrefix)),
                transpiler: new HarmonyMethod(typeof(MapControlsModule), nameof(DrawingTranspiler)));
            harmony.Patch(targets[2], transpiler: new HarmonyMethod(typeof(MapControlsModule), nameof(ReleaseTranspiler)));
        }
        catch
        {
            harmony.UnpatchAll(HarmonyOwner);
            throw;
        }
        log("MapControls: enabled; 3 verified hooks installed. Primary draws on the map background; secondary scrolls.");
    }

    private static IEnumerable<CodeInstruction> ScrollTranspiler(IEnumerable<CodeInstruction> instructions) =>
        MapControlsApi.Translate(instructions, 1);

    private static IEnumerable<CodeInstruction> DrawingTranspiler(IEnumerable<CodeInstruction> instructions) =>
        MapControlsApi.Translate(instructions, 2);

    // Translate the event read rather than detouring the tiny ListeningButton getter, which may inline.
    private static IEnumerable<CodeInstruction> ReleaseTranspiler(IEnumerable<CodeInstruction> instructions) =>
        MapControlsApi.Translate(instructions, 1);

    private static bool DrawingPrefix(NMapScreen __instance, InputEvent inputEvent)
    {
        if (inputEvent is not InputEventMouseButton { ButtonIndex: MouseButton.Left, Pressed: true }) return true;
        try
        {
            return !MapControlsApi.IsMapPointHit<Node>(__instance.GetViewport().GuiGetHoveredControl(), __instance,
                node => node.GetParent(), node => node is NMapPoint);
        }
        catch (Exception ex)
        {
            // If hit inspection fails, preserve node selection by refusing to start a background stroke.
            if (!_reportedHitTestFailure)
            {
                _reportedHitTestFailure = true;
                _log($"MapControls: skipped primary drawing because map hit inspection failed: {ex.Message}");
            }
            return false;
        }
    }
}
