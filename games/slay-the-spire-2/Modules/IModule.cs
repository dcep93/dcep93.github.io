namespace Spire420.Modules;

public interface IModule
{
    string Id { get; }
    void Initialize(Configuration configuration, Action<string> log);
}
