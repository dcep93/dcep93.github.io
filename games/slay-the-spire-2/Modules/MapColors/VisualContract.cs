namespace Spire420.Modules.MapColors;

public static class VisualContract
{
    public static void RequireLegendShader(bool hasExistingMaterial, IEnumerable<string> uniforms)
    {
        if (hasExistingMaterial)
            throw new InvalidOperationException("Expected material-free legend icon; leaving existing material untouched.");
        var names = new HashSet<string>(uniforms, StringComparer.Ordinal);
        if (!names.Contains("initial_color") || !names.Contains("map_color"))
            throw new InvalidOperationException("Legend shader missing initial_color or map_color; leaving icon untouched.");
    }
}
