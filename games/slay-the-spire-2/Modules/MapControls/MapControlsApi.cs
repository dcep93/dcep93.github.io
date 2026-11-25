using System.Reflection;
using System.Reflection.Emit;
using Godot;
using HarmonyLib;
using MegaCrit.Sts2.Core.Nodes.Screens.Map;

namespace Spire420.Modules.MapControls;

// Exact inspected v0.114.0 contracts; also exercised without a running Godot engine.
public static class MapControlsApi
{
    private const BindingFlags DeclaredInstance = BindingFlags.Instance | BindingFlags.Public |
        BindingFlags.NonPublic | BindingFlags.DeclaredOnly;

    public static MouseButton Swap(MouseButton button) => button switch
    {
        MouseButton.Left => MouseButton.Right,
        MouseButton.Right => MouseButton.Left,
        _ => button
    };

    public static MethodInfo RequireMethod(Type type, string name, Type result, params Type[] parameters)
    {
        var method = type.GetMethod(name, DeclaredInstance, null, parameters, null);
        if (method is null || method.DeclaringType != type || method.ReturnType != result ||
            !method.IsPrivate || method.IsAbstract || method.IsGenericMethod || method.GetMethodBody() is null ||
            !method.GetParameters().Select(p => p.ParameterType).SequenceEqual(parameters))
            throw new MissingMethodException(type.FullName, name);
        return method;
    }

    public static IReadOnlyList<MethodInfo> Validate()
    {
        var scroll = RequireMethod(typeof(NMapScreen), "ProcessMouseEvent", typeof(void), typeof(InputEvent));
        var draw = RequireMethod(typeof(NMapScreen), "ProcessMouseDrawingEvent", typeof(void), typeof(InputEvent));
        var release = RequireMethod(typeof(NMouseHeldMapDrawingInput), "ProcessMouseDrawingEvent", typeof(void), typeof(InputEvent));
        RequireMethod(typeof(NMouseHeldMapDrawingInput), "get_ListeningButton", typeof(MouseButton));
        // Inspect all bodies before installing any hook, then recheck the stream Harmony supplies.
        Translate(PatchProcessor.GetOriginalInstructions(scroll), 1);
        Translate(PatchProcessor.GetOriginalInstructions(draw), 2);
        Translate(PatchProcessor.GetOriginalInstructions(release), 1);
        return [scroll, draw, release];
    }

    public static List<CodeInstruction> Translate(IEnumerable<CodeInstruction> instructions, int expectedGetters)
    {
        var original = instructions.ToList();
        var getter = typeof(InputEventMouseButton).GetProperty(nameof(InputEventMouseButton.ButtonIndex))!.GetMethod!;
        var count = original.Count(instruction => instruction.Calls(getter));
        if (count != expectedGetters)
            throw new InvalidOperationException($"MapControls: expected {expectedGetters} ButtonIndex getter calls, found {count}.");

        var swap = typeof(MapControlsApi).GetMethod(nameof(Swap))!;
        var translated = new List<CodeInstruction>(original.Count + count);
        foreach (var instruction in original)
        {
            // Keep every original instruction, operand, branch label and exception marker intact.
            translated.Add(instruction);
            if (instruction.Calls(getter)) translated.Add(new CodeInstruction(OpCodes.Call, swap));
        }
        return translated;
    }

    // Native map points use MouseFilter.Pass. A node click can bubble to the map background.
    // Only suppress starting a stroke over a point belonging to this particular map screen.
    public static bool IsMapPointHit<T>(T? hovered, T screen, Func<T, T?> parent, Func<T, bool> isMapPoint)
        where T : class
    {
        var foundPoint = false;
        for (var node = hovered; node is not null; node = parent(node))
        {
            if (ReferenceEquals(node, screen)) return foundPoint;
            foundPoint |= isMapPoint(node);
        }
        return false;
    }
}
