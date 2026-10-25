# Sports on multisport420

Use the connected Chrome profile at https://multisport420.web.app/. Prefer the user's existing TV/display tab so changes affect the intended screen. First inspect the current selected games, category, layout, focus/audio, and room connection. Follow current page labels; local source findings below guide discovery but do not prove the deployed UI or a live stream works.

## Load the requested games

Before these actions, complete the Firebase room check below whenever opening or returning to the app.

1. Match the requested team, matchup, league, and date against the app's current stream list. A team slug or an old URL is not evidence that today's game is available. Use the category selector under Options if needed. If the list is stale or missing, use refresh streams once and inspect the result. Report upcoming/unavailable events accurately. Ask only if multiple events fit.
2. Use the matching stream's toggle to add it, first checking whether it is already selected; a repeated toggle can remove it. Preserve existing games when asked to add a game. When asked to replace/switch a particular screen, change only that target. Do not replace the entire lineup by navigating to a guessed hash URL.
3. Focus the selected tile/body or its explicit focus control to select that game's presentation/audio. **Do not click its title as a focus shortcut: the screen title closes the screen.** Use an explicit audio button where available, especially in dual layout. Preserve another game's audio when focusing a silent scoreboard.
4. If playback needs a player Play action, inspect the iframe/player and activate the real control. Close task-generated popup tabs as described in browser-workflow.md. Verify an actual playing state or visible game video; adding a tile alone is not successful playback.

## Load all games

For "all games", "load every game", or equivalent, join/verify the intended Firebase room first, then select every available game in the requested league/category. If no league is specified by the user or established task context, use the app's ALL category so the visible default NFL filter does not silently narrow the request. Inspect the full current list, including entries requiring scrolling. Use the current list rather than remembered teams or guessed URLs; refresh once if stale.

Exclude **RedZone / NFL RedZone / Red Zone** and **Fantasy Scoreboard / Fantasy420Scoreboard**, including equivalent title/slug variants. These exclusions apply to this bulk workflow; an explicit later request may load either. If excluded entries are already loaded, remove them to satisfy "without RedZone and fantasy scoreboard". Select each eligible game only if not already selected; never click an already-selected toggle blindly. Deduplicate by stream identity. An available listing is not proof of live playback: report upcoming/unavailable or failed players accurately.

Keep Chrome visibly foreground, dismiss unwanted popups after player-triggering actions, and recheck current selection as it changes. Preserve layout and audio unless the request includes changing them. Finish by verifying every eligible listed game is selected, the two excluded entries are absent, and the intended room still shows Live. Report the number selected and any failures separately from verified playback. Do not stop after a handful of games or declare success based only on clicks.

## Select loaded streams from the room remote

Open the viewer's observed **Open remote** link in the same intended room; bring the remote tab visibly forward before acting. Require **Viewer connected**, not merely a reachable remote page. Use **Loaded streams** and its **Find a stream** search to check/uncheck the requested game. These checkboxes add/remove streams on the viewing screen; the separate game bubbles only control spotlight/audio. Inspect checked state before acting, preserve other selections, and verify the resulting lineup on the viewer as well as the remote.

The viewer shares its available catalog on Join and refresh. If the picker has no available catalog, refresh streams on the viewing screen; an older deployed viewer may need a reload and rejoin to publish it. Joining publishes the viewer's current lineup over the room state, so preserve/verify that lineup before rejoining. Do not use rejoin as a routine response to remote selection failures. If no viewer is connected or the deployed UI lacks the picker, report that condition instead of claiming remote stream selection worked.

## Layout and recovery

Use Options > Layout for requested arrangements. Local source exposes Spotlight, Dual spotlight, Cinema, Grid wall, and other layouts; select only choices actually present in the live app. Grid wall keeps tiles in place while selection changes audio. Show stream selector exposes Stream 1 / Stream 2 when the current provider supports alternatives. On a failed stream, try one observed alternate source or the targeted Refresh screen control, then report the result instead of looping.

Use Close screen only when removing/replacing that screen is requested. Use the dedicated Refresh screen button rather than its enclosing clickable title. Do not clear cache as routine recovery: it clears local app state. Keep the current layout, stream selection, room, and volume unless the user requests a change or it is necessary for the stated action.

The optional multisport420 extension supports popup/audio behavior, but do not assume it is installed or install it as an unrequested repair.

## Required Firebase room check

Whenever opening or returning to multisport420, bring the intended display tab visibly forward and inspect its **Phone remote** room controls before changing games, layout, or audio. Verify both the current room identity and the **Live** connection indicator. A populated Room ID input, an open remote tab, or a previously remembered room alone is not proof of current membership or connectivity.

The inspected local UI shows the joined room name (or **Default room**), **Leave**, and **Live** or **Disconnected** when joined. **Joining…** means connection is still pending. Revalidate these labels against the deployed UI. A joined room marked Disconnected is not ready for synchronized control.

If already live in the intended room, preserve membership and continue. If not joined, use the room previously established in this task or explicitly provided by the user, click **Join** once, and verify the room identity and Live status. An empty input selects the app's default room; use that only when the default room is the established/requested target. If the intended room is unknown or conflicts with the currently joined room, ask which room to use rather than guessing, creating a new room, or switching silently. Do not commit private room identifiers or remote links into this skill.

For Joining…, Disconnected, or a connection error, refresh the observed status and allow at most one supported reconnect attempt to the same known room; do not repeatedly leave/join or overwrite room state as troubleshooting. If Live cannot be verified, report the actual room status and pause synchronized viewing changes. A Live connection establishes this tab's Firebase connection, not that another device received a command: verify the affected display separately when available.

After loading, report the game(s), room connection status, layout if changed, audio target, and whether playback was verified. For a menu/list lookup, offer one concrete next action such as "Next: load [matchup] on multisport420. Say yes." Once the requested games are playing, stop.

## Evidence and limits

Local source inspected in `Documents/repos/multisport420/app/src/app_x`: `components/Guide.tsx`, `Menu.tsx`, `Options.tsx`, `ViewingControls.tsx`, `ScreenTitleBar.tsx`, `Multiscreen.tsx`, `RoomControls.tsx`, and `lib/viewingLayouts.ts`. Browser inspection timed out during authoring; no live game-load test was completed. Inspect the deployed controls at execution time.
