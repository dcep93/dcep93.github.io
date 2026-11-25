# Personal Slay the Spire 2 mod

Approved in chat on 2026-11-25. The user authorized preparing and installing a draft, will do visual testing, and explicitly requires that the running game not be interrupted.

## Scope

Source lives in `games/slay-the-spire-2/` in dcep93.github.io. One mod package contains independent internal modules; no external plugin loader. Every module defaults to enabled and can be disabled individually in a documented settings file. MapColors is the first functional module. Autoplay is an enabled, inert placeholder until the user supplies explicit rules; it must register no gameplay hooks or input automation.

MapColors recolors map icons by room type, retaining their existing shapes and game interaction/state cues. Distinguish Monster, Elite, RestSite, Shop, Treasure, Unknown, Boss, and Ancient where the current game's icon contract permits. Do not guess how unsupported custom nodes render. Preserve path lines, votes, selection/hover animation, and click behavior. Use a fixed palette with hue and lightness separation and contrasting icon outlines to remain readable under a warm f.lux tint. Do not change f.lux settings or attempt to cancel its warmth. Palette settings are editable; visual acceptance on the user's display is explicitly deferred to the user.

## Implementation boundaries

Use C# targeting the installed game's .NET 9 runtime, its GodotSharp and Harmony assemblies, and its ModInitializer/manifest conventions. Research existing mods as API references; implement original code and document references. Inspect the installed v0.114.0 assemblies to confirm exact methods, types, scene paths, and animation behavior. Prefer narrow, verified hooks rather than speculative type/method searches. If the runtime contract is incompatible, log a useful message and stop that module without disrupting the game.

Module initialization and configuration are shared. Each module owns its patches and behavior. A failure in one module must not prevent another from initializing. Missing settings use enabled defaults. Invalid settings produce a clear warning and safe defaults without overwriting the user's file. No game binaries or extracted proprietary assets go into Git.

## Build, install, and validation

Provide repeatable build, contract-check, install, and removal instructions. Install only the custom mod's files into the macOS manual-mod directory, preserving existing settings and backing up an existing version. Installation must not launch, quit, restart, signal, focus, or send input to the game. The running process cannot load this draft until a later user-controlled restart.

Validate release compilation, manifest and module defaults, inert autoplay, the exact installed API contract, and installation byte-for-byte. Exercise settings failure cases and visual policy independently of a running Godot engine where practical. Provide a short visual checklist covering f.lux on/off, map hover and legend, visited/unavailable nodes, and boss/ancient nodes. Runtime load and visual correctness remain unverified until the user restarts and tests.

## Repository and delivery

Work on the checked-out master branch. Stage only task-owned files, preserve unrelated changes, commit and push according to workspace instructions. Keep generated binaries, tool downloads, and extracted game sources out of Git. Archive the implementation plan using the workspace helper. Document the draft's limitations honestly.
