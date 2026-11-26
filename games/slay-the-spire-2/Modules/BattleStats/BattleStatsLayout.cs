using Godot;
using MegaCrit.Sts2.Core.Nodes;

namespace Spire420.Modules.BattleStats;

public static class BattleStatsLayout
{
    public const int FontSize = 28;
    public const float Gap = 4;

    // Transform every corner: global position alone is insufficient across scaled canvas parents.
    public static Rect2 Bounds(Transform2D sourceToParent, Vector2 size)
    {
        var a = sourceToParent * Vector2.Zero;
        var b = sourceToParent * new Vector2(size.X, 0);
        var c = sourceToParent * size;
        var d = sourceToParent * new Vector2(0, size.Y);
        var minimum = a.Min(b).Min(c).Min(d);
        var maximum = a.Max(b).Max(c).Max(d);
        return new(minimum, maximum - minimum);
    }

    public static Rect2 Below(Rect2 info, Rect2 viewport, Vector2 desired)
    {
        var width = Math.Min(desired.X, Math.Max(0, viewport.Size.X - 32));
        var right = Math.Clamp(info.End.X, viewport.Position.X + 16 + width, Math.Max(viewport.Position.X + 16 + width, viewport.End.X - 11));
        return new(new Vector2(right - width, info.End.Y + Gap), new Vector2(width, desired.Y));
    }

    public static Rect2 Fallback(Rect2 viewport, Vector2 desired) =>
        Below(new Rect2(new Vector2(viewport.End.X - 16, viewport.Position.Y + Math.Min(180, viewport.Size.Y * .2f)), Vector2.Zero), viewport, desired);

    public static bool Place(Control parent, Label label)
    {
        var inverse = parent.GetGlobalTransformWithCanvas().AffineInverse();
        var viewportRect = parent.GetViewportRect();
        var viewport = Bounds(inverse * new Transform2D(0, viewportRect.Position), viewportRect.Size);
        var desired = new Vector2(Math.Max(700, label.GetCombinedMinimumSize().X), label.GetCombinedMinimumSize().Y);
        Rect2? info = null;
        var group = NRun.Instance?.GetNodeOrNull<Control>("GlobalUi/DebugInfo");
        if (group is not null)
        {
            foreach (var name in new[] { "ReleaseInfo", "DebugSeed", "ModdedWarning" })
            {
                var native = group.GetNodeOrNull<Label>(name);
                if (native is null || !native.IsVisibleInTree() || native.Size.X <= 0 || native.Size.Y <= 0) continue;
                var bounds = Bounds(inverse * native.GetGlobalTransformWithCanvas(), native.Size);
                info = info is { } previous ? previous.Merge(bounds) : bounds;
            }
        }
        var rectangle = info is { } actual ? Below(actual, viewport, desired) : Fallback(viewport, desired);
        label.Size = rectangle.Size;
        label.Position = rectangle.Position;
        return info is not null;
    }
}
