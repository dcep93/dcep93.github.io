namespace Spire420.Modules.Autoplay;

// Deliberately has no game, input, timer, or Harmony dependencies.
// User-defined conditions belong here in a future change, not implicit heuristics.
public sealed class AutoplayModule : IModule
{
    public string Id => "Autoplay";
    public void Initialize(Configuration configuration, Action<string> log) =>
        log("Autoplay: enabled; no user-defined rules installed, so no actions or hooks registered.");
}
