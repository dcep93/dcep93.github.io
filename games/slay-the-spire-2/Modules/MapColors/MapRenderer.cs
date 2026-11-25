using System.Reflection;
using System.Runtime.CompilerServices;
using Godot;
using MegaCrit.Sts2.Core.Bindings.MegaSpine;
using MegaCrit.Sts2.Core.Map;
using MegaCrit.Sts2.Core.Nodes.Screens.Map;

namespace DcepSpire.Modules.MapColors;

public sealed class MapRenderer(Configuration configuration)
{
    private static readonly FieldInfo UsesSpine = MapApi.Field(typeof(NBossMapPoint), "_usesSpine", typeof(bool));
    private static readonly FieldInfo BossMaterial = MapApi.Field(typeof(NBossMapPoint), "_material", typeof(ShaderMaterial));
    private static readonly FieldInfo BossSprite = MapApi.Field(typeof(NBossMapPoint), "_animController", typeof(MegaSprite));
    private static readonly FieldInfo LegendType = MapApi.Field(typeof(NMapLegendItem), "_pointType", typeof(MapPointType));
    private readonly ConditionalWeakTable<GodotObject, ShaderMaterial> _materials = new();

    private bool TryColor(MapPointType kind, out Color color)
    {
        color = default;
        if (!configuration.TryGetColor(kind.ToString(), out var rgb)) return false;
        color = new Color(rgb.R, rgb.G, rgb.B, 1);
        return true;
    }

    public void Apply(NMapPoint point)
    {
        if (!GodotObject.IsInstanceValid(point) || point.Point is null || !TryColor(point.Point.PointType, out var color)) return;
        if (point.GetType() == typeof(NNormalMapPoint))
        {
            var icon = point.GetNodeOrNull<TextureRect>("%Icon") ?? throw new InvalidOperationException("Normal map %Icon missing.");
            var material = OwnMaterial(icon, icon.Material as ShaderMaterial);
            icon.Material = material;
            material.SetShaderParameter("map_color", color);
            // Native shader preserves dark ink; native SelfModulate preserves alpha/tweens.
            // Do not touch %Outline, point.Modulate, votes, circle VFX, or selection reticle.
        }
        else if (point.GetType() == typeof(NBossMapPoint)) ApplyBoss((NBossMapPoint)point, color);
    }

    private void ApplyBoss(NBossMapPoint point, Color color)
    {
        if ((bool)UsesSpine.GetValue(point)!)
        {
            var material = OwnMaterial(point, BossMaterial.GetValue(point) as ShaderMaterial);
            var sprite = (MegaSprite?)BossSprite.GetValue(point) ?? throw new InvalidOperationException("Boss animation controller missing.");
            if (!ReferenceEquals(BossMaterial.GetValue(point), material))
            {
                sprite.SetNormalMaterial(material);
                BossMaterial.SetValue(point, material); // Future game refreshes must update the same private copy.
            }
            material.SetShaderParameter("map_color", color);
            // Preserve black_layer_color: the game uses it for traveled/unavailable state.
        }
        else
        {
            var icon = point.GetNodeOrNull<TextureRect>("%PlaceholderImage") ?? throw new InvalidOperationException("Boss placeholder missing.");
            var unavailable = point.State == MapPointState.Untravelable;
            color.A = icon.SelfModulate.A * (unavailable ? 0.55f : 1f);
            icon.SelfModulate = color;
        }
    }

    public Color AncientColor(Color original, bool unavailable)
    {
        if (!TryColor(MapPointType.Ancient, out var color)) return original;
        color.A = original.A * (unavailable ? 0.55f : 1f);
        return color; // The game's own refreshes and tweens consume these color getters.
    }

    public void ApplyLegend(NMapLegendItem item)
    {
        if (item.GetType() != typeof(NMapLegendItem) || !TryColor((MapPointType)LegendType.GetValue(item)!, out var color)) return;
        var icon = item.GetNodeOrNull<TextureRect>("Icon") ?? throw new InvalidOperationException("Legend Icon missing.");
        if (_materials.TryGetValue(icon, out var owned))
        {
            if (ReferenceEquals(icon.Material, owned)) return;
            throw new InvalidOperationException("Legend material changed after tinting; leaving replacement untouched.");
        }
        // The legend uses the same atlas artwork, but has no material. Give it the normal icon shader.
        var shader = ResourceLoader.Load<Shader>("res://scenes/ui/normal_map_point.gdshader")
            ?? throw new InvalidOperationException("Legend shader resource missing; leaving icon untouched.");
        VisualContract.RequireLegendShader(icon.Material is not null,
            shader.GetShaderUniformList().Select(x => x.AsGodotDictionary()["name"].AsString()));
        var template = new ShaderMaterial { Shader = shader };
        template.SetShaderParameter("initial_color", new Color(0.705882f, 0.615686f, 0.537255f));
        template.SetShaderParameter("map_color", color);
        template.ResourceLocalToScene = true;
        icon.Material = template;
        _materials.Add(icon, template);
    }

    private ShaderMaterial OwnMaterial(GodotObject owner, ShaderMaterial? source)
    {
        if (_materials.TryGetValue(owner, out var existing))
        {
            if (!ReferenceEquals(source, existing))
                throw new InvalidOperationException("Map material changed after tinting; leaving replacement untouched.");
            return existing;
        }
        if (source?.Shader is null) throw new InvalidOperationException("Expected map icon ShaderMaterial missing.");
        var hasMapColor = source.Shader.GetShaderUniformList().Any(x => x.AsGodotDictionary()["name"].AsString() == "map_color");
        if (!hasMapColor) throw new InvalidOperationException("Expected shader map_color uniform missing.");
        var copy = (ShaderMaterial)source.Duplicate();
        copy.ResourceLocalToScene = true;
        _materials.Add(owner, copy);
        return copy;
    }
}
