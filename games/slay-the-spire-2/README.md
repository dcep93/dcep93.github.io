# spire420

Personal Slay the Spire 2 mod, built from source in this repository. Draft **0.2.0**, targeting the installed **v0.114.0 public beta** on macOS. One installed mod contains independent internal modules; every module defaults to enabled.

| Module | Draft behavior |
| --- | --- |
| MapColors | Recolors map room icons and the six legend icons. Keeps existing shapes, dark artwork, hover/selection outlines, animations, paths, and votes. |
| MapControls | Primary (one-finger) click-drag draws on the map background; secondary (two-finger) click-drag scrolls. Room clicks remain native. |
| Autoplay | Enabled but inert. No timers, input, map navigation, card play, or gameplay hooks. Waiting for your explicit rules. |

## Try the installed draft

The installer only copies files. It never launches, focuses, quits, restarts, or sends input to the game. Your running game will not pick up the draft until you choose to quit and relaunch.

1. Finish playing, then restart the game with mods enabled when convenient.
2. Accept the game's first-use mod prompt if shown; enable **spire420** in the game's mod settings and follow any restart prompt.
3. Open the map and use the visual and map-control checklists below.

The game's own mod loader maintains separate modded/unmodded saves. This installer does not edit or migrate saves, change Steam launch options, or accept the mod prompt for you.

**Observed first-use save migration issue in v0.114.0:** the game copied the original profile into `modded/`, then cloud synchronization deleted those new local files because the modded cloud profile was empty. The original profile remained intact. Before enabling mods for the first time, close the game and back up `~/Library/Application Support/SlayTheSpire2/`. If the modded profile appears empty, keep the original files and close the game before recovery. Restoring local files alone is insufficient when the empty cloud profile remains authoritative; recovery must also reconcile the modded Steam save copy. See [the verified save contract](docs/api-contract.md#save-migration-and-cloud-sync).

Install location on macOS:

```text
~/Library/Application Support/Steam/steamapps/common/Slay the Spire 2/
  SlayTheSpire2.app/Contents/MacOS/mods/spire420/
    spire420.dll
    spire420.json
    settings.json.txt
    README.md
```

## Settings and draft palette

Edit the **installed** `settings.json.txt`. Settings take effect at the next game start; there is no live settings menu in this draft. The `.json.txt` suffix is intentional: the game's loader treats every `.json` under `mods/` as a mod manifest.

```json
"modules": { "MapColors": true, "MapControls": true, "Autoplay": true }
```

Set any value to `false` to disable that module. Missing module keys default to `true`, including modules added later. Missing palette entries keep their defaults. Invalid settings are reported in the log and are never rewritten by the mod. Installation preserves your existing settings file.

| Room | Draft color | Hex |
| --- | --- | --- |
| Normal fight | Slate | `#687680` |
| Elite | Orange | `#F07836` |
| Rest | Green | `#35B85A` |
| Shop | Gold | `#FFD166` |
| Treasure | Orchid | `#CC83D8` |
| Unknown | Turquoise | `#48D5CF` |
| Boss | Deep crimson | `#B92B41` |
| Ancient | Dark plum | `#463D72` |

These colors vary hue and brightness; distinct native silhouettes and dark artwork provide additional cues under f.lux. Normal icons retain the game's original availability alpha. Ancient and placeholder boss icons use lower alpha when unavailable; Spine bosses retain the game's state-specific dark layer. The mod does not read or change f.lux, override the display color profile, or reveal unknown room outcomes. Visited unknown rooms retain their Unknown color while the game's revealed icon remains intact.

**Visual acceptance is pending your test.** A very warm display can compress several hues; report which pair is confusing and the f.lux setting, and we can revise the palette. No claim is made that offline checks reproduce your display.

This first draft uses the game's existing shader mask: normal-room colors are accents inside the original artwork, not a flat repaint of every pixel. Shop and Rest icons have smaller tinted areas, so start the f.lux comparison there. A stronger foreground treatment can follow your feedback.

## Build, check, install

Prerequisites: Python 3.9+, .NET 9 SDK, and a local macOS game installation. No Godot editor, BaseLib, or ModConfig installation is required. The project references the game's own managed assemblies and does not redistribute them.

The SDK prepared on this Mac is at `~/.local/share/sts2-dev/dotnet/dotnet`. The helper finds it automatically, or uses `dotnet` on PATH. Elsewhere, install the SDK from [Microsoft](https://dotnet.microsoft.com/download/dotnet/9.0) and pass `--dotnet` if needed.

From this directory:

```sh
python3 scripts/mod.py build
python3 scripts/mod.py check
python3 scripts/mod.py install
```

`check` builds Release, verifies six scene/shader contracts directly from the local PCK, runs managed configuration/module/API and map-input IL tests, and tests the installer with temporary directories. It does not start Godot or contact the game process. Loading the managed game assembly for reflection may print a Sentry message saying its native extension is not loaded; this is expected outside the game.

`install` runs the checks before deploying. An existing copy of this mod is backed up under `Contents/MacOS/mod-backups/spire420/<timestamp>/`, outside the loader's recursive `mods/` scan. A failed directory swap restores the previous copy. The installed DLL's SHA-256 is verified against the build.

Custom installation example:

```sh
python3 scripts/mod.py install --game-dir '/Volumes/Games/steamapps/common/Slay the Spire 2'
```

To remove, quit the game at your convenience and move only `mods/spire420/` outside `mods/`. Do not keep a renamed backup inside `mods/`: the loader scans recursively. To roll back, replace that directory with one of the installer backups while the game is closed. Disabling all modules does not itself remove the package from the game's mod list; disable the package in game settings for unmodded play.

## Map controls and manual checklist

MapControls interprets the mouse buttons supplied by macOS; it does not detect raw fingers. With primary click configured for one finger and secondary click for two fingers, hold primary on the map background to draw and hold secondary to scroll. Room points keep ordinary primary-click selection; begin strokes in the background, then draw across points if desired. Two-finger pan gestures and wheel scrolling remain native, separate from secondary click-drag. Drawing, erasing, animation guards, scroll bounds, toolbar controls, and controller behavior stay owned by the game.

**Native input acceptance is pending your next restart.** Offline checks verify signatures, button values, instruction preservation, and the node-hit policy without creating native input events or running the game. After restarting:

- Primary click-drag on the background draws; primary release stops the line immediately.
- Secondary click-drag scrolls without drawing; release ends dragging, including at scroll limits.
- Primary click on a reachable room selects it without starting a line. A drag beginning on a room keeps native click/drag cancellation and does not begin a background stroke.
- Two-finger pan and mouse-wheel scrolling still work. Check the start-of-act animation and reopening the map.
- Middle-button hold erases; middle release stops erasing.
- Toolbar draw, erase, clear, and stopping a toolbar stroke still work; controller navigation remains usable.
- Set `"MapControls": false`, restart, and confirm native primary-scroll/secondary-draw behavior returns while MapColors remains independent. Restore `true` and restart to re-enable.

## Visual checklist

- With f.lux off, distinguish every room type at normal map zoom; compare the legend.
- Repeat with your usual f.lux warmth, especially Elite/Boss, Treasure/Ancient, and Rest/Unknown.
- Hover/unhover individual nodes and legend entries. Colors should persist without every node appearing selected.
- Compare reachable, future/unavailable, and visited nodes. Native pulse, circles, paths, quest markers, controller reticles, and co-op vote icons should remain intact.
- Check bosses and ancients when present; their renderer differs from normal rooms. Placeholder boss art also has a separate branch.
- Reopen the map and change acts; colors should persist.
- Autoplay should never take an action in this draft.

Logs: `~/Library/Application Support/SlayTheSpire2/logs/godot.log`; search for `[spire420]`. Report any `skipped incompatible` or `could not initialize` line. The draft has not been loaded into the running game by the authoring session.

## Extending the mod

Add an `IModule` under `Modules/`, then register it in `Entry.Initialize`. Missing settings mean enabled. Each module owns its hooks and reports initialization failure independently. MapColors and MapControls validate all their hooks before patching and remove only their own patches if patch installation fails. Unsupported scene visuals are skipped and logged rather than guessed. MapColors leaves unknown/custom map node visuals vanilla.

Future autoplay work must encode only user-supplied conditions and reassess `affects_gameplay`, multiplayer behavior, and save assumptions before shipping. There is no rule engine hidden in this draft.

See [the inspected API contract](docs/api-contract.md) for references, verified methods, rendering choices, and limitations. Source and docs belong in Git; build outputs, local SDKs, decompiled game code, and extracted assets do not.
