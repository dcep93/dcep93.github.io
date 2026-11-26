using System.Reflection;
using Godot;
using MegaCrit.Sts2.Core.Combat;
using MegaCrit.Sts2.Core.Context;
using MegaCrit.Sts2.Core.Entities.Players;
using MegaCrit.Sts2.Core.Entities.Creatures;
using MegaCrit.Sts2.Core.MonsterMoves.Intents;
using MegaCrit.Sts2.Core.Nodes;
using MegaCrit.Sts2.Core.Nodes.Combat;
using MegaCrit.Sts2.Core.Models;
using MegaCrit.Sts2.Core.Multiplayer.Game;
using MegaCrit.Sts2.Core.Nodes.Rooms;
using MegaCrit.Sts2.Core.Nodes.Screens.ScreenContext;
using MegaCrit.Sts2.Core.Rooms;
using MegaCrit.Sts2.Core.Runs;
using MegaCrit.Sts2.Core.Runs.History;
using MegaCrit.Sts2.Core.Saves;
using MegaCrit.Sts2.Core.Saves.Managers;

namespace Spire420.Modules.BattleStats;

public static class BattleStatsApi
{
    private const BindingFlags Instance = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance;
    private static FieldInfo? _startTime;
    private static FieldInfo? _visuals;
    private static FieldInfo? _intent;
    private static FieldInfo? _isFrozen;

    public static BattleMode Mode(GameMode mode) => mode switch
    {
        GameMode.Standard => BattleMode.Standard, GameMode.Daily => BattleMode.Daily,
        GameMode.Dread => BattleMode.Dread, GameMode.Blitz => BattleMode.Blitz, _ => BattleMode.Unknown
    };

    public static RunHistory ProjectHistory(long start, string seed, GameMode mode, IEnumerable<ulong> playerIds,
        IEnumerable<IEnumerable<MapPointHistoryEntry>> history) => new()
    {
        StartTime = start, Seed = seed, GameMode = mode, WasAbandoned = true,
        Players = playerIds.Select(id => new RunHistoryPlayer { Id = id }).ToList(),
        MapPointHistory = history.Select(a => a.ToList()).ToList()
    };

    public static bool IntentIsFresh(AbstractIntent? displayed, AbstractIntent current, bool frozen) =>
        !frozen && displayed is not null && ReferenceEquals(displayed, current);

    public static bool IntentsVisible(NCombatRoom room, Creature creature)
    {
        if (NCombatUi.IsDebugHidingIntent || creature.Monster is not { } monster) return false;
        var container = room.GetCreatureNode(creature)?.IntentContainer;
        if (container is null || !container.IsVisibleInTree() || container.Modulate.A <= 0) return false;
        var displayed = container.GetChildren().OfType<NIntent>().ToArray();
        var intents = monster.NextMove.Intents;
        if (displayed.Length != intents.Count) return false;
        // During transitions, NextMove can precede its display or the native display can freeze before fading.
        // Recomputing either state would expose numbers the native intent is not currently showing.
        for (var i = 0; i < displayed.Length; i++)
            if (!displayed[i].IsVisibleInTree() || displayed[i].Modulate.A <= 0 ||
                !IntentIsFresh(_intent!.GetValue(displayed[i]) as AbstractIntent, intents[i],
                    (bool)_isFrozen!.GetValue(displayed[i])!)) return false;
        return true;
    }

    public static long StartTime(RunManager manager) => (long)_startTime!.GetValue(manager)!;
    public static CombatState? RoomState(NCombatRoom room) => (_visuals!.GetValue(room) as CombatRoom)?.CombatState;

    public static IReadOnlyList<MethodInfo> Validate()
    {
        var ready = Method(typeof(NCombatRoom), "_Ready", typeof(void), false);
        var save = Method(typeof(RunHistorySaveManager), "SaveHistory", typeof(void), false, typeof(RunHistory));
        _intent = Field(typeof(NIntent), "_intent", typeof(AbstractIntent));
        _isFrozen = Field(typeof(NIntent), "_isFrozen", typeof(bool));
        Property(typeof(IRunState), "GameMode", typeof(GameMode));
        Property(typeof(RunHistory), "GameMode", typeof(GameMode));
        foreach (var value in new[] { "Standard", "Daily", "Dread", "Blitz" }) RequireEnum<GameMode>(value);
        Property(typeof(AbstractIntent), "IntentType", typeof(IntentType));
        foreach (var value in new[] { "Attack", "DeathBlow", "Hidden", "Unknown" }) RequireEnum<IntentType>(value);
        Property(typeof(CombatState), "Enemies", typeof(IReadOnlyList<Creature>));
        Property(typeof(Creature), "IsEnemy", typeof(bool));
        Property(typeof(Creature), "IsAlive", typeof(bool));
        Property(typeof(Creature), "Monster", typeof(MonsterModel));
        Property(typeof(Player), "Creature", typeof(Creature));
        var move = Property(typeof(MonsterModel), "NextMove").PropertyType;
        Property(move, "Intents", typeof(IReadOnlyList<AbstractIntent>));
        var total = typeof(AttackIntent).GetMethod("GetTotalDamage", [typeof(IEnumerable<Creature>), typeof(Creature)]);
        if (total is not { IsPublic: true, IsAbstract: true } || total.ReturnType != typeof(int))
            throw new MissingMethodException("AttackIntent.GetTotalDamage");
        Method(typeof(MultiAttackIntent), "GetTotalDamage", typeof(int), false, typeof(IEnumerable<Creature>), typeof(Creature));
        Property(typeof(NCombatUi), "IsDebugHidingIntent", typeof(bool), true);
        Property(typeof(NCreature), "IntentContainer", typeof(Control));
        Method(typeof(NCombatRoom), "GetCreatureNode", typeof(NCreature), false, typeof(Creature));
        Property(typeof(NRun), "Instance", typeof(NRun), true);
        Property(typeof(CanvasItem), "Modulate", typeof(Color));
        Method(typeof(CanvasItem), "IsVisibleInTree", typeof(bool), false);
        Method(typeof(CanvasItem), "GetGlobalTransformWithCanvas", typeof(Transform2D), false);
        Method(typeof(CanvasItem), "GetViewportRect", typeof(Rect2), false);
        Method(typeof(Control), "GetCombinedMinimumSize", typeof(Vector2), false);
        Property(typeof(Label), "HorizontalAlignment", typeof(HorizontalAlignment), writable: true);
        _startTime = Field(typeof(RunManager), "_startTime", typeof(long));
        _visuals = Field(typeof(NCombatRoom), "_visuals", typeof(ICombatRoomVisuals));
        Event(typeof(CombatManager), "CombatSetUp", typeof(Action<CombatState>));
        Event(typeof(CombatManager), "CombatWon", typeof(Action<CombatRoom>));
        Event(typeof(CombatManager), "CombatEnded", typeof(Action<CombatRoom>));
        Property(typeof(CombatManager), "Instance", typeof(CombatManager), true);
        Property(typeof(CombatManager), "IsInProgress", typeof(bool));
        Property(typeof(CombatRoom), "CombatState", typeof(CombatState));
        Property(typeof(CombatState), "RunState", typeof(IRunState));
        Property(typeof(CombatState), "Encounter", typeof(EncounterModel));
        Property(typeof(AbstractModel), "Id", typeof(ModelId));
        Method(typeof(ModelId), "ToString", typeof(string), false);
        Property(typeof(NCombatRoom), "Mode", typeof(CombatRoomMode));
        foreach (var value in new[] { "ActiveCombat", "VisualOnly", "FinishedCombat" }) RequireEnum<CombatRoomMode>(value);
        RequireEnum<NetGameType>("Replay");
        foreach (var value in new[] { "Monster", "Elite", "Boss" }) RequireEnum<RoomType>(value);
        Property(typeof(RunManager), "Instance", typeof(RunManager), true);
        Property(typeof(RunManager), "IsAbandoned", typeof(bool));
        Property(typeof(RunManager), "IsCleaningUp", typeof(bool));
        var network = Property(typeof(RunManager), "NetService").PropertyType;
        Property(network, "Type", typeof(NetGameType));
        Property(typeof(LocalContext), "NetId", typeof(ulong?), true);
        Method(typeof(LocalContext), "GetMe", typeof(Player), true, typeof(ICombatState));
        Property(typeof(Player), "NetId", typeof(ulong));
        Property(typeof(IPlayerCollection), "Players", typeof(IReadOnlyList<Player>));
        Property(typeof(RunHistory), "Players", typeof(List<RunHistoryPlayer>));
        Property(typeof(RunHistoryPlayer), "Id", typeof(ulong));
        Property(typeof(IRunState), "MapPointHistory", typeof(IReadOnlyList<IReadOnlyList<MapPointHistoryEntry>>));
        Property(typeof(IRunState), "CurrentMapPointHistoryEntry", typeof(MapPointHistoryEntry));
        var rng = Property(typeof(IRunState), "Rng").PropertyType;
        Property(rng, "StringSeed", typeof(string));
        Property(typeof(MapPointHistoryEntry), "Rooms", typeof(List<MapPointRoomHistoryEntry>));
        Property(typeof(MapPointHistoryEntry), "PlayerStats", typeof(List<PlayerMapPointHistoryEntry>));
        Method(typeof(MapPointHistoryEntry), "GetEntry", typeof(PlayerMapPointHistoryEntry), false, typeof(ulong));
        Property(typeof(MapPointRoomHistoryEntry), "ModelId", typeof(ModelId));
        Property(typeof(PlayerMapPointHistoryEntry), "PlayerId", typeof(ulong));
        Property(typeof(PlayerMapPointHistoryEntry), "DamageTaken", typeof(int));
        Property(typeof(SaveManager), "Instance", typeof(SaveManager), true);
        Property(typeof(SaveManager), "IsProfileInitialized", typeof(bool));
        Property(typeof(SaveManager), "CurrentProfileId", typeof(int));
        Property(typeof(SaveManager), "Progress", typeof(ProgressState));
        Property(typeof(ProgressState), "UniqueId", typeof(string));
        Property(typeof(UserDataPathProvider), "IsRunningModded", typeof(bool), true);
        var profilePath = typeof(UserDataPathProvider).GetMethods().Single(m => m.Name == "GetProfileScopedBasePath");
        if (!profilePath.IsStatic || profilePath.ReturnType != typeof(string) || profilePath.GetParameters() is not [var id, var platform, var user] ||
            id.ParameterType != typeof(int) || !platform.IsOptional || user.ParameterType != typeof(ulong?) || !user.IsOptional)
            throw new MissingMethodException("GetProfileScopedBasePath");
        Method(typeof(ProjectSettings), "GlobalizePath", typeof(string), true, typeof(string));
        Property(typeof(ActiveScreenContext), "Instance", typeof(ActiveScreenContext), true);
        Event(typeof(ActiveScreenContext), "Updated", typeof(Action));
        Method(typeof(ActiveScreenContext), "IsCurrent", typeof(bool), false, typeof(IScreenContext));
        foreach (var (name, type) in new (string, Type)[] { ("StartTime", typeof(long)), ("Seed", typeof(string)),
            ("Win", typeof(bool)), ("WasAbandoned", typeof(bool)), ("KilledByEncounter", typeof(ModelId)),
            ("MapPointHistory", typeof(List<List<MapPointHistoryEntry>>)) }) Property(typeof(RunHistory), name, type);
        var serializer = typeof(JsonSerializationUtility).GetMethods().Single(m => m.Name == "ToJson" && m.IsGenericMethodDefinition);
        if (!serializer.IsStatic || serializer.ReturnType != typeof(string) || serializer.GetGenericArguments().Length != 1 ||
            serializer.GetParameters().Length < 1 || serializer.GetParameters()[0].ParameterType != serializer.GetGenericArguments()[0] || !serializer.GetParameters().Skip(1).All(p => p.IsOptional))
            throw new MissingMethodException("JsonSerializationUtility.ToJson<T>");
        serializer.MakeGenericMethod(typeof(RunHistory));
        Property(typeof(Label), "Text", typeof(string), writable: true);
        Property(typeof(Control), "Position", typeof(Vector2), writable: true);
        Property(typeof(Control), "Size", typeof(Vector2), writable: true);
        Property(typeof(Control), "MouseFilter", typeof(Control.MouseFilterEnum), writable: true);
        Property(typeof(CanvasItem), "Visible", typeof(bool), writable: true);
        Property(typeof(SystemFont), "FontNames", typeof(string[]), writable: true);
        Property(typeof(Godot.Timer), "WaitTime", typeof(double), writable: true);
        Property(typeof(Godot.Timer), "OneShot", typeof(bool), writable: true);
        Method(typeof(Godot.Timer), "Start", typeof(void), false, typeof(double));
        Method(typeof(Godot.Timer), "Stop", typeof(void), false);
        Event(typeof(Godot.Timer), "Timeout", typeof(Action));
        Event(typeof(Node), "TreeExiting", typeof(Action));
        Method(typeof(Node), "AddChild", typeof(void), false, typeof(Node), typeof(bool), typeof(Node.InternalMode));
        Method(typeof(Control), "AddThemeFontOverride", typeof(void), false, typeof(StringName), typeof(Font));
        Method(typeof(Control), "AddThemeFontSizeOverride", typeof(void), false, typeof(StringName), typeof(int));
        Method(typeof(Control), "AddThemeColorOverride", typeof(void), false, typeof(StringName), typeof(Color));
        Method(typeof(Control), "AddThemeConstantOverride", typeof(void), false, typeof(StringName), typeof(int));
        return [ready, save];
    }

    private static MethodInfo Method(Type type, string name, Type result, bool isStatic, params Type[] parameters)
    {
        var method = type.GetMethod(name, Instance | BindingFlags.Static, null, parameters, null);
        if (method is null || method.DeclaringType != type || !method.IsPublic || method.IsStatic != isStatic ||
            method.ReturnType != result || method.IsAbstract || method.IsGenericMethod)
            throw new MissingMethodException(type.FullName, name);
        return method;
    }
    private static FieldInfo Field(Type type, string name, Type value)
    {
        var field = type.GetField(name, Instance | BindingFlags.DeclaredOnly);
        if (field is null || field.FieldType != value || !field.IsPrivate || field.IsStatic) throw new MissingFieldException(type.FullName, name);
        return field;
    }
    private static PropertyInfo Property(Type type, string name, Type? value = null, bool isStatic = false, bool writable = false)
    {
        var property = type.GetProperty(name, Instance | BindingFlags.Static);
        if (property?.GetMethod is not { IsPublic: true } getter || getter.IsStatic != isStatic ||
            (value is not null && property.PropertyType != value) || (writable && property.SetMethod is not { IsPublic: true }))
            throw new MissingMemberException(type.FullName, name);
        return property;
    }
    private static void Event(Type type, string name, Type handler)
    {
        var ev = type.GetEvent(name);
        if (ev?.EventHandlerType != handler || ev.AddMethod is not { IsPublic: true, IsStatic: false } || ev.RemoveMethod is not { IsPublic: true })
            throw new MissingMemberException(type.FullName, name);
    }
    private static void RequireEnum<T>(string name) where T : struct, Enum
    {
        if (!Enum.TryParse<T>(name, out var value) || !Enum.IsDefined(value)) throw new MissingMemberException(typeof(T).FullName, name);
    }
}
