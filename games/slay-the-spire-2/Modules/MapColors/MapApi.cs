using System.Reflection;
using Godot;
using MegaCrit.Sts2.Core.Bindings.MegaSpine;
using MegaCrit.Sts2.Core.Nodes.Screens.Map;

namespace Spire420.Modules.MapColors;

// Exact, inspected v0.114.0 contracts. Shared with the offline contract checker.
public static class MapApi
{
    private const BindingFlags Instance = BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.DeclaredOnly;

    public static MethodInfo Method(Type type, string name, Type result) =>
        type.GetMethod(name, Instance, null, Type.EmptyTypes, null) is { } method && method.ReturnType == result
            ? method : throw new MissingMethodException(type.FullName, name);

    public static FieldInfo Field(Type type, string name, Type valueType) =>
        type.GetField(name, Instance) is { } field && field.FieldType == valueType
            ? field : throw new MissingFieldException(type.FullName, name);

    public static IReadOnlyList<MethodInfo> Validate()
    {
        var methods = new List<MethodInfo>
        {
            Method(typeof(NNormalMapPoint), "RefreshColorInstantly", typeof(void)),
            Method(typeof(NBossMapPoint), "RefreshColorInstantly", typeof(void)),
            Method(typeof(NMapLegendItem), "_Ready", typeof(void))
        };
        foreach (var name in new[] { "TraveledColor", "UntravelableColor", "HoveredColor" })
            methods.Add(Method(typeof(NAncientMapPoint), "get_" + name, typeof(Color)));
        Field(typeof(NBossMapPoint), "_usesSpine", typeof(bool));
        Field(typeof(NBossMapPoint), "_material", typeof(ShaderMaterial));
        Field(typeof(NBossMapPoint), "_animController", typeof(MegaSprite));
        Field(typeof(NMapLegendItem), "_pointType", typeof(MegaCrit.Sts2.Core.Map.MapPointType));
        return methods;
    }
}
