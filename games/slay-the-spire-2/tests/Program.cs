using System.Reflection;
using System.Reflection.Emit;
using Godot;
using HarmonyLib;
using Spire420.Modules.MapControls;
using System.Runtime.Loader;
using System.Text.Json;
using Spire420;
using Spire420.Modules;
using Spire420.Modules.Autoplay;
using Spire420.Modules.MapColors;

var gameData = args[0];
var project = args[1];
// Resolve managed assemblies for offline checks. No game startup or Godot engine is invoked.
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

Check("MapControls module is available and disabled settings skip its hooks", () =>
{
    var type = typeof(Configuration).Assembly.GetType("Spire420.Modules.MapControls.MapControlsModule");
    Require(type is not null, "MapControls module is missing");
    var module = (IModule)Activator.CreateInstance(type!)!;
    var logs = new List<string>();
    ModuleHost.Start([module], Configuration.Parse("""{"modules":{"MapControls":false}}""", _ => { }), logs.Add);
    Require(module.Id == "MapControls" && logs.Count == 1 && logs[0].Contains("disabled by settings"), "disabled module installed hooks");
});
Check("missing settings enable all existing and future modules", () =>
{
    var config = Configuration.Load(Path.Combine(Path.GetTempPath(), Guid.NewGuid()+".absent"), _ => throw new Exception("unexpected warning"));
    Require(config.IsEnabled("MapColors") && config.IsEnabled("Autoplay") && config.IsEnabled("MapControls") && config.IsEnabled("Future"), "default disabled");
});
Check("explicit toggles, case-insensitive module IDs and partial palettes", () =>
{
    var config = Configuration.Parse("""{"modules":{"mapcolors":false},"mapColors":{"Shop":"#123456"}}""", _ => { });
    Require(!config.IsEnabled("MapColors") && config.IsEnabled("Autoplay") && config.IsEnabled("MapControls"), "older settings lost enabled new module");
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
// Delay JIT of methods using Godot/Harmony types until the resolver above is registered.
typeof(FakeModule).Assembly.GetType("MapControlsChecks")!.GetMethod("Run")!.Invoke(null,
    [(Action<string, Action>)Check, (Action<bool, string>)Require]);
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

static class MapControlsChecks
{
    public static void Run(Action<string, Action> check, Action<bool, string> require)
    {
        check("map button translation swaps primary/secondary and preserves every other enum value", () =>
        {
            foreach (var button in Enum.GetValues<MouseButton>().Append((MouseButton)99))
            {
                var expected = button == MouseButton.Left ? MouseButton.Right : button == MouseButton.Right ? MouseButton.Left : button;
                require(MapControlsApi.Swap(button) == expected, $"unexpected translation for {button}");
                require(MapControlsApi.Swap(MapControlsApi.Swap(button)) == button, "swap is not reversible");
            }
        });
        check("held drawing release maps primary to native Right and preserves middle erasing", () =>
        {
            require(MapControlsApi.Swap(MouseButton.Left) == MouseButton.Right, "primary release misses native drawing listener");
            require(MapControlsApi.Swap(MouseButton.Right) != MouseButton.Right, "secondary release stops primary drawing");
            foreach (var button in Enum.GetValues<MouseButton>())
                require((MapControlsApi.Swap(button) == MouseButton.Middle) == (button == MouseButton.Middle),
                    $"wrong erasing release for {button}");
            var transpiler = typeof(MapControlsModule).GetMethod("ReleaseTranspiler", BindingFlags.NonPublic | BindingFlags.Static)!;
            var target = MapControlsApi.Validate()[2];
            var original = PatchProcessor.GetOriginalInstructions(target);
            var transformed = ((IEnumerable<CodeInstruction>)transpiler.Invoke(null, [original])!).ToList();
            require(transformed.Count == original.Count + 1, "release transpiler not connected to translation");
        });
        check("all three declared map input signatures and native getter counts match installed game", () =>
        {
            var targets = MapControlsApi.Validate();
            require(targets.Count == 3, "wrong hook count");
            require(targets[0].Name == "ProcessMouseEvent" && targets[1].Name == "ProcessMouseDrawingEvent" &&
                targets[2].Name == "ProcessMouseDrawingEvent" && targets[2].DeclaringType!.Name == "NMouseHeldMapDrawingInput", "wrong patch targets");
            var getter = typeof(InputEventMouseButton).GetProperty("ButtonIndex")!.GetMethod!;
            var swap = typeof(MapControlsApi).GetMethod("Swap")!;
            for (var i = 0; i < 3; i++)
            {
                var expected = i == 1 ? 2 : 1;
                var original = PatchProcessor.GetOriginalInstructions(targets[i]);
                var transformed = MapControlsApi.Translate(original, expected);
                require(transformed.Count == original.Count + expected, "incorrect instruction delta");
                var position = 0;
                foreach (var instruction in original)
                {
                    require(ReferenceEquals(transformed[position++], instruction), "native instruction or metadata replaced");
                    if (instruction.Calls(getter)) require(transformed[position++].Calls(swap), "getter value not translated immediately");
                }
                Console.WriteLine($"  {targets[i].DeclaringType!.Name}.{targets[i].Name}: {expected} translated getter(s)");
            }
            require(Harmony.GetAllPatchedMethods().All(method =>
                Harmony.GetPatchInfo(method)?.Owners.Contains(MapControlsModule.HarmonyOwner) != true), "offline checks installed patches");
        });
        check("IL translation preserves labels, exception blocks, unrelated calls and original operands", () =>
        {
            var getter = typeof(InputEventMouseButton).GetProperty("ButtonIndex")!.GetMethod!;
            var call = new CodeInstruction(OpCodes.Callvirt, getter);
            var label = new DynamicMethod("labels", typeof(void), Type.EmptyTypes).GetILGenerator().DefineLabel();
            call.labels.Add(label);
            call.blocks.Add(new ExceptionBlock(ExceptionBlockType.BeginExceptionBlock));
            var other = new CodeInstruction(OpCodes.Call, typeof(object).GetMethod("ToString")!);
            var end = new CodeInstruction(OpCodes.Ret);
            end.blocks.Add(new ExceptionBlock(ExceptionBlockType.EndExceptionBlock));
            var translated = MapControlsApi.Translate([call, other, end], 1);
            require(ReferenceEquals(translated[0], call) && ReferenceEquals(translated[2], other) && ReferenceEquals(translated[3], end), "instructions changed");
            require(call.labels.SequenceEqual([label]) && call.blocks.Count == 1 && end.blocks.Count == 1, "metadata changed");
            require(translated[1].labels.Count == 0 && translated[1].blocks.Count == 0, "inserted call stole native metadata");
            foreach (var incompatible in new[] { new List<CodeInstruction>(), new List<CodeInstruction> { call, call } })
                Reject(() => MapControlsApi.Translate(incompatible, 1), require);
        });
        check("signature validation rejects inherited, static, generic, wrong parameter and wrong result methods", () =>
        {
            MapControlsApi.RequireMethod(typeof(SignatureFixture), "Valid", typeof(void), typeof(InputEvent));
            foreach (var name in new[] { "Static", "WrongResult", "WrongParameter", "Generic", "Missing" })
                Reject(() => MapControlsApi.RequireMethod(typeof(SignatureFixture), name, typeof(void), typeof(InputEvent)), require);
            Reject(() => MapControlsApi.RequireMethod(typeof(DerivedFixture), "Valid", typeof(void), typeof(InputEvent)), require);
        });
        check("map point guard blocks only hits on this screen's points or descendants", () =>
        {
            var screen = new HitNode(null);
            var background = new HitNode(screen);
            var point = new HitNode(background, true);
            var icon = new HitNode(point);
            var otherScreen = new HitNode(null);
            var foreignPoint = new HitNode(otherScreen, true);
            bool Hit(HitNode? node) => MapControlsApi.IsMapPointHit(node, screen, n => n.Parent, n => n.IsPoint);
            require(Hit(point) && Hit(icon), "node click can start a background stroke");
            require(!Hit(null) && !Hit(screen) && !Hit(background) && !Hit(foreignPoint), "unrelated control blocked");
        });
        check("Harmony installs only the three map-control targets and removes its own patches", () =>
        {
            var targets = MapControlsApi.Validate();
            var logs = new List<string>();
            try
            {
                // Generate replacement methods in this isolated managed checker; never invoke native game methods.
                new MapControlsModule().Initialize(new Configuration(), logs.Add);
                var owned = Harmony.GetAllPatchedMethods().Where(method =>
                    Harmony.GetPatchInfo(method)?.Owners.Contains(MapControlsModule.HarmonyOwner) == true).ToList();
                require(owned.Count == 3 && targets.All(owned.Contains), "installed outside exact map-control target set");
                for (var i = 0; i < targets.Count; i++)
                {
                    var patches = Harmony.GetPatchInfo(targets[i])!;
                    require(patches.Transpilers.Count(p => p.owner == MapControlsModule.HarmonyOwner) == 1, "missing transpiler");
                    require(patches.Prefixes.Count(p => p.owner == MapControlsModule.HarmonyOwner) == (i == 1 ? 1 : 0), "wrong guard target");
                    require(!patches.Postfixes.Any(p => p.owner == MapControlsModule.HarmonyOwner), "unexpected postfix");
                }
                require(logs.Count == 1 && logs[0].Contains("3 verified hooks installed"), "installation was not confirmed");
            }
            finally { new Harmony(MapControlsModule.HarmonyOwner).UnpatchAll(MapControlsModule.HarmonyOwner); }
            require(targets.All(method => Harmony.GetPatchInfo(method)?.Owners.Contains(MapControlsModule.HarmonyOwner) != true),
                "checker left module patches installed");
        });
    }

    private static void Reject(Action action, Action<bool, string> require)
    {
        var rejected = false;
        try { action(); }
        catch (Exception ex) when (ex is MissingMethodException or InvalidOperationException) { rejected = true; }
        require(rejected, "incompatible input contract accepted");
    }

    private record HitNode(HitNode? Parent, bool IsPoint = false);
    private class SignatureFixture
    {
        private void Valid(InputEvent input) { }
        private static void Static(InputEvent input) { }
        private int WrongResult(InputEvent input) => 0;
        private void WrongParameter(object input) { }
        private void Generic<T>(InputEvent input) { }
    }
    private sealed class DerivedFixture : SignatureFixture { }
}
