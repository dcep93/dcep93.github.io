# spire420 agent instructions

Read [docs/agent-handoff.md](docs/agent-handoff.md) before building, installing, migrating data, or investigating a user report. Read [docs/api-contract.md](docs/api-contract.md) before changing game hooks.

- Daniel designs the mod; **Codex agents build, verify and install authorized updates**. Do not delegate shell commands or installation back to him. He handles native gameplay/visual testing and normal game restarts.
- Never interrupt a running game: no launch, quit, focus, restart, UI input or process injection. Offline reflection/Harmony generation checks are safe; do not instantiate native Godot objects in tests.
- Use `python3 scripts/mod.py install` after changes are reviewed. It runs required checks, preserves installed settings, backs up the existing package outside `mods/`, and verifies the deployed DLL hash. Report installation separately from native activation, which requires Daniel's restart.
- Never write native saves or externally migrate the live stats database while the game runs. Preserve modded/unmodded save separation. Prior save recovery is documented in the handoff; do not repeat it casually.
- Keep this handoff current: release, checks, package backup, schema/migration behavior, known limitations and unresolved reports. Keep extracted game assets/decompiled code, local SDKs and binaries outside Git.
- Follow repository defaults for commits/pushes and preserve unrelated changes. Autoplay remains inert until Daniel supplies its rules.
