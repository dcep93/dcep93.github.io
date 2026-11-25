using Godot;
using MegaCrit.Sts2.Core.Combat;
using MegaCrit.Sts2.Core.Context;
using MegaCrit.Sts2.Core.Multiplayer.Game;
using MegaCrit.Sts2.Core.Nodes.Rooms;
using MegaCrit.Sts2.Core.Nodes.Screens.ScreenContext;
using MegaCrit.Sts2.Core.Rooms;
using MegaCrit.Sts2.Core.Runs;
using MegaCrit.Sts2.Core.Runs.History;
using MegaCrit.Sts2.Core.Saves;
using System.Runtime.CompilerServices;

namespace Spire420.Modules.BattleStats;

internal sealed class BattleStatsRuntime(Action<string> log) : IDisposable
{
    private readonly HashSet<string> _reported = new(StringComparer.Ordinal);
    private readonly ConditionalWeakTable<NCombatRoom, View> _views = new();
    private CombatManager? _manager;
    private string? _profile;
    private BattleStatsStore? _store;
    private bool _historyImported;
    private Snapshot? _current;

    public void Subscribe()
    {
        _manager = CombatManager.Instance;
        _manager.CombatSetUp += SetUp;
        _manager.CombatWon += Completed;
        _manager.CombatEnded += Completed;
    }

    public void Dispose()
    {
        if (_manager is not null)
        {
            _manager.CombatSetUp -= SetUp;
            _manager.CombatWon -= Completed;
            _manager.CombatEnded -= Completed;
        }
        _manager = null;
        _current = null;
    }

    private void Guard(string operation, Action action)
    {
        try { action(); }
        catch (Exception ex)
        {
            if (_reported.Add(operation)) log($"BattleStats: {operation} skipped ({ex.GetType().Name}: {ex.Message}).");
        }
    }

    private static bool IsReplay => RunManager.Instance.NetService?.Type == NetGameType.Replay;

    private bool EnsureProfile()
    {
        var save = SaveManager.Instance;
        if (!save.IsProfileInitialized || !UserDataPathProvider.IsRunningModded || string.IsNullOrWhiteSpace(save.Progress.UniqueId))
        {
            _current = null;
            _profile = null;
            _store = null;
            _historyImported = false;
            return false;
        }
        var path = ProjectSettings.GlobalizePath(UserDataPathProvider.GetProfileScopedBasePath(save.CurrentProfileId));
        var file = BattleStatsIdentity.ProfileFile(ProjectSettings.GlobalizePath("user://spire420/battle-stats"), path, save.Progress.UniqueId);
        if (_profile != file)
        {
            _current = null;
            _profile = file;
            _store = new BattleStatsStore(file, log);
            _store.Load();
            _historyImported = false;
        }
        // Wait for the real local identity before the one-time scan, so multiplayer records
        // aren't permanently skipped if the first scene arrives before LocalContext is ready.
        if (!_historyImported && LocalContext.NetId is { } localId)
        {
            var report = BattleHistoryImporter.ImportDirectory(Path.Combine(path, "saves", "history"), localId, _store!, log);
            _store!.Flush();
            _historyImported = true;
            log($"BattleStats: history scan {report.Files} files, {report.Imported} new/changed samples, {report.Skipped} skipped; {_store.Count} stored.");
        }
        return true;
    }

    private void SetUp(CombatState state) => Guard("combat setup", () =>
    {
        _current = null;
        if (IsReplay || !EnsureProfile()) return;
        var player = LocalContext.GetMe(state);
        var entry = state.RunState.CurrentMapPointHistoryEntry;
        if (player is null || entry is null || entry.Rooms.Count == 0 || state.Encounter is null) return;
        var encounter = state.Encounter.Id.ToString();
        var act = state.RunState.MapPointHistory.Count - 1;
        if (act < 0) return;
        var point = state.RunState.MapPointHistory[act].Count - 1;
        var room = entry.Rooms.Count - 1;
        if (point < 0 || !ReferenceEquals(state.RunState.MapPointHistory[act][point], entry) ||
            entry.Rooms[room].ModelId?.ToString() != encounter || !encounter.StartsWith("ENCOUNTER.", StringComparison.Ordinal)) return;
        var stats = entry.GetEntry(player.NetId);
        var start = BattleStatsApi.StartTime(RunManager.Instance);
        var seed = state.RunState.Rng.StringSeed;
        if (stats.DamageTaken < 0 || start <= 0 || string.IsNullOrWhiteSpace(seed)) return;
        // A mid-run upgrade may have earlier completed points that are not in any saved .run yet.
        // Project read-only history with an incomplete final point; this never calls native save APIs.
        var prior = new RunHistory
        {
            StartTime = start, Seed = seed, WasAbandoned = true,
            Players = state.RunState.Players.Select(p => new RunHistoryPlayer { Id = p.NetId }).ToList(),
            MapPointHistory = state.RunState.MapPointHistory.Select(a => a.ToList()).ToList()
        };
        BattleHistoryImporter.ImportJson(JsonSerializationUtility.ToJson(prior), player.NetId, _store!);
        _store!.Flush();
        var key = BattleStatsIdentity.BattleKey(start, seed, player.NetId, act, point, room, encounter);
        _current = new(state, entry, stats, _profile!, key, encounter, start, seed, player.NetId, act, point, room,
            new BattleStatsLifecycle(state, _profile!, BattleStatsLifecycle.Baseline(entry.Rooms.Count, stats.DamageTaken)));
    });

    private bool MatchesCurrent(Snapshot sample) => _profile == sample.Profile &&
        BattleStatsApi.StartTime(RunManager.Instance) == sample.Start && LocalContext.NetId == sample.Player &&
        ReferenceEquals(sample.State.RunState.CurrentMapPointHistoryEntry, sample.Entry);

    private void Completed(CombatRoom room) => Guard("combat completion", () =>
    {
        if (!EnsureProfile() || _current is not { } sample || !MatchesCurrent(sample)) return;
        Commit(sample, room.CombatState, sample.Stats.DamageTaken);
    });

    private void Commit(Snapshot sample, CombatState state, int counter)
    {
        if (RunManager.Instance.IsCleaningUp) return;
        if (!sample.Lifecycle.TryComplete(state, _profile!, RunManager.Instance.IsAbandoned, IsReplay, counter, out var damage)) return;
        _store!.Upsert(new(sample.Key, sample.Encounter, damage));
        _store.Flush();
    }

    public void HistorySaved(RunHistory history) => Guard("saved history import", () =>
    {
        if (IsReplay || !EnsureProfile() || history.StartTime != BattleStatsApi.StartTime(RunManager.Instance)) return;
        var report = BattleHistoryImporter.ImportJson(JsonSerializationUtility.ToJson(history), LocalContext.NetId, _store!);
        // The final loss can be saved before CombatEnded. Raw history deliberately skips multi-room points;
        // the captured live baseline lets us recover that exact nested fight without guessing prior damage.
        if (!history.WasAbandoned && !history.Win && _current is { } sample && MatchesCurrent(sample) &&
            history.StartTime == sample.Start && history.Seed == sample.Seed && history.KilledByEncounter.ToString() == sample.Encounter &&
            history.MapPointHistory.Count == sample.Act + 1 && history.MapPointHistory[sample.Act].Count == sample.Point + 1)
        {
            var point = history.MapPointHistory[sample.Act][sample.Point];
            if (point.Rooms.Count == sample.Room + 1 && point.Rooms[sample.Room].ModelId?.ToString() == sample.Encounter)
            {
                var stats = point.PlayerStats.SingleOrDefault(p => p.PlayerId == sample.Player);
                if (stats is not null) Commit(sample, sample.State, stats.DamageTaken);
            }
        }
        _store!.Flush();
        if (report.Imported > 0 || report.Skipped > 0)
            log($"BattleStats: saved history {report.Imported} new/changed samples, {report.Skipped} skipped.");
    });

    public void Attach(NCombatRoom room) => Guard("combat label attachment", () =>
    {
        if (_views.TryGetValue(room, out _)) return;
        var label = new Label
        {
            Name = "Spire420BattleStats", Position = new Vector2(16, 108), Size = new Vector2(700, 30),
            MouseFilter = Control.MouseFilterEnum.Ignore, Visible = false
        };
        label.AddThemeFontOverride("font", new SystemFont { FontNames = ["Hiragino Sans", "Noto Sans CJK JP", "Microsoft YaHei", "sans-serif"] });
        label.AddThemeFontSizeOverride("font_size", 22);
        label.AddThemeColorOverride("font_color", Colors.White);
        label.AddThemeColorOverride("font_outline_color", Colors.Black);
        label.AddThemeConstantOverride("outline_size", 4);
        var timer = new Godot.Timer { Name = "Spire420BattleStatsTimer", WaitTime = 0.25, OneShot = false };
        var view = new View(label, timer);
        _views.Add(room, view);
        room.AddChild(label);
        room.AddChild(timer);
        void Refresh() => Guard("combat label refresh", () => RefreshView(room, view));
        void Exit() => Guard("combat label cleanup", () =>
        {
            ActiveScreenContext.Instance.Updated -= Refresh;
            timer.Timeout -= Refresh;
            room.TreeExiting -= Exit;
            _views.Remove(room);
            timer.Stop();
            // Never treat a disappearing scene as completion.
        });
        timer.Timeout += Refresh;
        ActiveScreenContext.Instance.Updated += Refresh;
        room.TreeExiting += Exit;
        timer.Start();
    });

    private void RefreshView(NCombatRoom room, View view)
    {
        view.Label.Visible = false;
        if (IsReplay || !EnsureProfile() || _current is not { } sample || !MatchesCurrent(sample)) return;
        var sameState = BattleStatsApi.RoomState(room) == sample.State;
        if (!BattleStatsLifecycle.Show(room.Mode == CombatRoomMode.ActiveCombat, CombatManager.Instance.IsInProgress,
                ActiveScreenContext.Instance.IsCurrent(room), sameState, IsReplay)) return;
        var damage = sample.Lifecycle.Damage(sample.Stats.DamageTaken);
        if (damage < 0) return;
        if (view.Version != _store!.Version || view.Key != sample.Key || view.Encounter != sample.Encounter || view.Profile != _profile)
        {
            view.Summary = _store.Summary(sample.Encounter, sample.Key);
            view.Version = _store.Version;
            view.Key = sample.Key;
            view.Encounter = sample.Encounter;
            view.Profile = _profile;
        }
        view.Label.Text = BattleStatsFormatter.Format(damage, view.Summary);
        view.Label.Visible = true;
    }

    private sealed record Snapshot(CombatState State, MapPointHistoryEntry Entry, PlayerMapPointHistoryEntry Stats,
        string Profile, string Key, string Encounter, long Start, string Seed, ulong Player, int Act, int Point, int Room,
        BattleStatsLifecycle Lifecycle);
    private sealed class View(Label label, Godot.Timer timer)
    {
        public Label Label { get; } = label;
        public Godot.Timer Timer { get; } = timer;
        public long Version { get; set; } = -1;
        public string? Key { get; set; }
        public string? Encounter { get; set; }
        public string? Profile { get; set; }
        public BattleSummary Summary { get; set; } = new(0, null, null);
    }
}
