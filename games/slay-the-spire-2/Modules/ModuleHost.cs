namespace DcepSpire.Modules;

public static class ModuleHost
{
    public static void Start(IEnumerable<IModule> modules, Configuration configuration, Action<string> log)
    {
        foreach (var module in modules)
        {
            if (!configuration.IsEnabled(module.Id))
            {
                log($"{module.Id}: disabled by settings.");
                continue;
            }
            try { module.Initialize(configuration, log); }
            catch (Exception ex) { log($"{module.Id}: could not initialize; other modules continue. {ex}"); }
        }
    }
}
