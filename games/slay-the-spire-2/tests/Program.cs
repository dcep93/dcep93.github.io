using System.Reflection;
using System.Runtime.Loader;
using System.Text.Json;
using Spire420;
using Spire420.Modules;
using Spire420.Modules.Autoplay;
using Spire420.Modules.MapColors;

var gameData = args[0];
var project = args[1];
// Resolve managed assemblies for API checks. No game startup, patches, or Godot engine is invoked.
AssemblyLoadContext.Default.Resolving += (_, name) =>
{
    var path = Path.Combine(gameData, name.Name + ".dll");
    return File.Exists(path) ? AssemblyLoadContext.Default.LoadFromAssemblyPath(path) : null;
};
var passed = 0;
void Check(string name, Action action)
{
    action();
    Console.WriteLine("PASS " + name);
    passed++;
}
void Require(bool condition, string message) { if (!condition) throw new Exception(message); }

Check("missing settings enable all existing and future modules", () =>
{
    var config = Configuration.Load(Path.Combine(Path.GetTempPath(), Guid.NewGuid()+".absent"), _ => throw new Exception("unexpected warning"));
    Require(config.IsEnabled("MapColors") && config.IsEnabled("Autoplay") && config.IsEnabled("Future"), "default disabled");
});
Check("explicit toggles, case-insensitive module IDs and partial palettes", () =>
{
    var config = Configuration.Parse("""{"modules":{"mapcolors":false},"mapColors":{"Shop":"#123456"}}""", _ => { });
    Require(!config.IsEnabled("MapColors") && config.IsEnabled("Autoplay"), "toggle lost");
    Require(config.TryGetColor("Shop", out var shop) && Math.Abs(shop.R - 18f/255) < 0.0001f, "color override lost");
    Require(config.TryGetColor("Elite", out _), "partial palette lost defaults");
});
Check("malformed JSON, root null, and invalid values recover with diagnostics", () =>
{
    foreach (var json in new[] { "{broken", "null", "[]", """{"modules":null,"mapColors":[]} """, """{"modules":{"MapColors":"off"},"mapColors":{"Elite":"red","Shop":null,"NewRoom":"#ffffff"}}""" })
    {
        var warnings = new List<string>();
        var config = Configuration.Parse(json, warnings.Add);
        Require(config.IsEnabled("MapColors") && config.IsEnabled("Autoplay"), "invalid settings disabled a module");
        Require(warnings.Count > 0, "missing diagnostics");
        Require(config.TryGetColor("Elite", out _), "invalid settings lost palette");
    }
});
Check("a bad color does not discard a valid disabled module", () =>
{
    var config = Configuration.Parse("""{"modules":{"MapColors":false},"mapColors":{"Elite":null}}""", _ => { });
    Require(!config.IsEnabled("MapColors"), "valid preference discarded");
});
Check("settings load never overwrites invalid user file", () =>
{
    var path = Path.Combine(Path.GetTempPath(), Guid.NewGuid()+".txt");
    try
    {
        File.WriteAllText(path, "invalid");
        Configuration.Load(path, _ => { });
        Require(File.ReadAllText(path) == "invalid", "user file overwritten");
    }
    finally { File.Delete(path); }
});
Check("module failure is isolated and disabled modules never initialize", () =>
{
    var broken = new FakeModule("Broken", true);
    var healthy = new FakeModule("Healthy", false);
    var disabled = new FakeModule("Disabled", false);
    var config = Configuration.Parse("""{"modules":{"Disabled":false}}""", _ => { });
    var messages = new List<string>();
    ModuleHost.Start([broken, healthy, disabled], config, messages.Add);
    Require(broken.Calls == 1 && healthy.Calls == 1 && disabled.Calls == 0, "module isolation failed");
    Require(messages.Any(x => x.Contains("could not initialize")), "failure not reported");
});
Check("autoplay is enabled but registers no behavior", () =>
{
    var logs = new List<string>();
    ModuleHost.Start([new AutoplayModule()], new Configuration(), logs.Add);
    Require(logs.Count == 1 && logs[0].Contains("no actions or hooks"), "autoplay unexpectedly active");
    Require(typeof(AutoplayModule).GetFields(BindingFlags.Static | BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public).Length == 0,
        "autoplay acquired hidden state");
});
Check("shipped settings match enabled defaults and have eight unique colors", () =>
{
    using var doc = JsonDocument.Parse(File.ReadAllText(Path.Combine(project, Configuration.FileName)));
    Require(doc.RootElement.GetProperty("modules").EnumerateObject().All(x => x.Value.GetBoolean()), "shipped module disabled");
    Require(Configuration.DefaultColors.Count == 8 && Configuration.DefaultColors.Values.Distinct().Count() == 8, "palette missing distinctions");
    foreach (var (kind, hex) in Configuration.DefaultColors)
        Require(doc.RootElement.GetProperty("mapColors").GetProperty(kind).GetString() == hex && Rgb.TryParse(hex, out _), "default palette mismatch");
    foreach (var bad in new[] { "#12", "123456", "#11223344", "#GGHHII", "#-12345", "#12345 " })
        Require(!Rgb.TryParse(bad, out _), "accepted invalid hex: " + bad);
});
Check("manifest and actual assembly entry point agree", () =>
{
    using var manifest = JsonDocument.Parse(File.ReadAllText(Path.Combine(project, "spire420.json")));
    Require(manifest.RootElement.GetProperty("id").GetString() == typeof(Configuration).Assembly.GetName().Name, "assembly ID mismatch");
    Require(!manifest.RootElement.GetProperty("has_pck").GetBoolean() && manifest.RootElement.GetProperty("has_dll").GetBoolean(), "wrong package kind");
    var entry = typeof(Configuration).Assembly.GetType("Spire420.Entry")!;
    var attribute = entry.CustomAttributes.Single(x => x.AttributeType.Name == "ModInitializerAttribute");
    Require(entry.GetMethod((string)attribute.ConstructorArguments[0].Value!, BindingFlags.Public | BindingFlags.Static)?.GetParameters().Length == 0, "invalid initializer");
});
Check("legend scene contract rejects existing materials and missing shader uniforms", () =>
{
    VisualContract.RequireLegendShader(false, ["initial_color", "map_color"]);
    foreach (var (existing, uniforms) in new (bool, string[])[]
    {
        (true, ["initial_color", "map_color"]), (false, []),
        (false, ["initial_color"]), (false, ["map_color"])
    })
    {
        var rejected = false;
        try { VisualContract.RequireLegendShader(existing, uniforms); }
        catch (InvalidOperationException) { rejected = true; }
        Require(rejected, "incompatible legend material accepted");
    }
});
Check("all six patch targets and four private field signatures match installed game", () =>
{
    var api = typeof(Configuration).Assembly.GetType("Spire420.Modules.MapColors.MapApi")!;
    var targets = (IReadOnlyList<MethodInfo>)api.GetMethod("Validate")!.Invoke(null, null)!;
    Require(targets.Count == 6 && targets.All(x => !x.IsStatic && !x.IsAbstract && x.GetParameters().Length == 0), "unsupported patch targets");
    foreach (var method in targets) Console.WriteLine($"  {method.DeclaringType!.Name}.{method.Name} -> {method.ReturnType.Name}");
});
Check("ancient color keeps configured hue and differentiates availability without losing source alpha", () =>
{
    var rendererType = typeof(Configuration).Assembly.GetType("Spire420.Modules.MapColors.MapRenderer")!;
    var renderer = Activator.CreateInstance(rendererType, new Configuration());
    var method = rendererType.GetMethod("AncientColor")!;
    var colorType = method.ReturnType;
    var original = Activator.CreateInstance(colorType, 0.1f, 0.2f, 0.3f, 0.8f);
    var available = method.Invoke(renderer, [original, false])!;
    var unavailable = method.Invoke(renderer, [original, true])!;
    float Channel(object color, string name) => (float)colorType.GetField(name)!.GetValue(color)!;
    Require(Math.Abs(Channel(available, "A") - 0.8f) < 0.0001f, "available alpha changed");
    Require(Math.Abs(Channel(unavailable, "A") - 0.44f) < 0.0001f, "unavailable state not differentiated");
    foreach (var channel in new[] { "R", "G", "B" })
        Require(Channel(available, channel) == Channel(unavailable, channel), "state lost room hue");
});
Console.WriteLine($"{passed} checks passed. No game process launched or contacted.");

sealed class FakeModule(string id, bool fail) : IModule
{
    public string Id => id;
    public int Calls { get; private set; }
    public void Initialize(Configuration configuration, Action<string> log)
    {
        Calls++;
        if (fail) throw new InvalidOperationException("test failure");
    }
}
