---
name: movie-to-seedr
description: "Operate the user's TV viewing workflows in Chrome and VLC: find movie or TV releases through pirateproxy.net, manage Seedr transfers/downloads, play Seedr videos in movied8.web.app, load sports games in multisport420.web.app, control full screen/audio/subtitles, and continue a proposed next step when the user says yes."
---

# TV Assistant

Keep the existing `$movie-to-seedr` invocation and linked folder working while supporting the broader TV workflow. TV means the user's viewing apps, movies, episodes, and sports; do not assume access to physical TV power, inputs, or remote hardware.

## Always load the current local instructions

Before each user request, including index selection, status, and download follow-ups, reread this SKILL.md from the local checkout of dcep93.github.io and any reference needed for that request. The installed skill folder should link to this repo folder so local edits, including uncommitted edits, are authoritative. Do not pull from GitHub automatically or overwrite the checkout from an installed copy. If the source cannot be read, stop rather than execute remembered instructions.

## Route the request

- Find a movie/episode/season, add a magnet, check readiness, or download: use the Seedr workflow below and [browser-workflow.md](references/browser-workflow.md).
- Watch a Seedr video in movied8: use [movied8.md](references/movied8.md). Local download is not required for a ready cloud video.
- Load, focus, replace, remove, or arrange sports games in multisport420: use [multisport420.md](references/multisport420.md).
- Play a downloaded movie/episode in VLC: use [vlc-playback.md](references/vlc-playback.md).
- Play, pause, full screen, audio, or subtitles without naming an app: use the last verified viewing app and media in this conversation. Ask only if the target is ambiguous.

## Propose the next step; continue on yes

At a natural stopping point, report the verified result and propose one concrete next action with its target, e.g. "Next: add option 2, [release title], to Seedr. Say yes." Keep that action pending in this conversation. A later "yes", "go ahead", or equivalent refers to the latest unresolved proposal and authorizes that named action; do not ask again. A user-specified index overrides a recommended index.

Retain the media/release identity, stage, target app, selected game(s), player settings, and pending action in conversation context. Keep signed media URLs and account details out of the repo. On waking, reread the skill, recover that context, and refresh the relevant UI before proceeding. Verify prerequisites such as capacity, readiness, and event identity again; do not repeat a completed submission or toggle a setting that is already correct. If no unambiguous pending action survives, ask a short target-specific question instead of guessing.

Propose actions that advance the user's stated intent. After the shortlist, recommend a named option that fits when capacity is known. After adding a torrent, propose a readiness check; if it is not ready, report progress and offer to check again on the next yes. When ready, propose the requested viewing route or download. If the user has not chosen VLC/local download versus movied8/cloud playback, propose movied8 as the next step so yes has a concrete meaning. After download, propose opening the selected video in VLC. Stop when viewing is established; don't invent endless next steps.

Honor explicit authorization for a complete multi-step flow: complete that scope without inserting redundant approval pauses. This next-step convention does not bypass tool-required confirmations or user-only login/MFA. "Wake up and say yes" means continuation when the user returns; do not create background monitoring or claim to listen while idle.

## Setup validation

Use the connected Chrome browser and its persistent signed-in profile through the available browser-control tools. Discover current browsers and tabs; do not assume a previous tab ID remains valid. Reuse existing task tabs where possible. Read [references/browser-workflow.md](references/browser-workflow.md) for setup and observed UI behavior.

### Clear stale full screen when it blocks the next action

Before navigation, tab/app switching, login handoffs, search/form entry, file opening, or menu changes, inspect the visible target window for a leftover full-screen state. Repeat this check after waking or when the expected controls/page are hidden. Apply it across Chrome, embedded players, movied8, multisport420, and VLC; a tool-accessible background tab is not necessarily what the user sees.

Identify whether full screen belongs to the webpage's video player, Chrome itself, or VLC. If it obstructs the requested action, use the observed Exit full screen control or a supported escape action in that specific window, then refresh state. Exit nested layers individually if necessary. Use a toggle such as F11 only after establishing that Chrome is currently full screen; do not blindly toggle it or send keys to an unverified foreground app. A maximized window alone does not require recovery.

Exiting full screen means exposing navigation and controls, not closing the tab/app, stopping playback, or discarding the current media. Preserve position, audio, subtitles, and selected games. Keep full screen when it does not block the action, such as an accessible Play/Pause command. After temporary menu work, restore the prior viewing state; after loading requested media, apply the normal full-screen playback default. Leave login/setup pages visible for user handoff. If the first exit attempt has no observable effect, re-inspect the target and full-screen layer before one supported alternate attempt; if still blocked, report it rather than repeatedly toggling.

### Check relevant prerequisites

Validate relevant prerequisites before acting:

- Chrome is connected and controllable.
- The search page is reachable and returns real movie results.
- Seedr is signed in and its current used/total or free storage is visible before adding a torrent.
- The magnet copy/paste path is available before submitting.
- On a local-download request, the folder is ready and Chrome can start the download; verify its state in the downloads UI.
- For VLC requests, VLC is installed and controllable and the chosen movie is fully downloaded. Follow [references/vlc-playback.md](references/vlc-playback.md); Chrome and Seedr need not be connected for an already-local movie.
- For movied8 or multisport420, validate the requested app and its current controls. Check only prerequisites relevant to the requested route.

For login handoffs, distinguish a tool-accessible tab from the window visible on the TV. Bring the login page into the visible Chrome window when supported and verify it before saying it is on screen. If a full-screen player hides it, use observed controls to exit full screen and select the login tab. If window targeting fails, say so and give a direct link; do not repeatedly claim an unseen tab is visible.

Ask the user to handle sign-in, MFA, or CAPTCHA when necessary and keep the handoff tab open. Reuse retained sessions on subsequent runs, but do not promise that login never expires. Keep credentials, cookies, account data, and download URLs out of the repository. Never disable browser security to pass setup.

## Search and shortlist

1. Start at https://pirateproxy.net/ and search the requested movie, episode, or season. Check the title, sequel number, year, and episode/season identifiers as applicable; ask only if ambiguity materially affects the match. For a TV episode, preserve the exact season/episode; do not substitute a season pack unless requested. If its search endpoint fails, use up to two proxy links actually listed on that directory, reporting the fallback; the user has authorized these proxies. Close unwanted ad/search popups and recover the intended page as described in the browser reference. Stop on security interstitials; do not follow ads or install suggested software.
2. Inspect matching releases. Exclude other installments, episodes, soundtracks, unwanted collections/packs, and duplicates. Refine a broad search with the known year or exact title/episode. Rank correct matches by seeders descending; use size as a tie-breaker unless the user states other preferences. Missing counts are unknown, not zero. Do not assume the site's default order is globally sorted.
3. Show up to five entries in a compact numbered table: exact release title, size with its displayed unit, and seeders. Add language, resolution, or a storage-fit note only when useful. If fewer matches exist, show fewer. Label truncated titles rather than inventing the missing text.
4. Retain the numbered mapping to the exact release/detail URL and identity in the conversation. When the user selects an index, use that mapping, not the current row order. If the mapping is missing or ambiguous, reconstruct it from conversation evidence or ask; never silently substitute another release.

Normally stop after the shortlist for the user's index or yes to the specifically proposed option. If the user explicitly authorizes automatic selection, apply their criteria. For highest-seeder-with-space selection, choose the highest-seeded eligible entry among those five whose whole torrent fits Seedr's currently available space. Normalize GiB/MiB and GB/MB correctly; treat rounded near-limit values as uncertain. Do not delete existing content or purchase storage to make it fit. If none fits, report that and offer smaller choices.

## Selected entry to Seedr

The user's index selection or yes to a named add-to-Seedr proposal authorizes adding that specific torrent. Recheck the selected release and current Seedr capacity before submission. Right-click its actual magnet link, choose Copy link address, then paste into Seedr's add-link input. Verify that the copied value is a magnet URI with an xt identifier and that its identity corresponds to the selected entry. Use the browser clipboard without displaying unrelated clipboard contents.

If the browser's native context menu is unavailable to the connected automation, report that limitation. A DOM-backed copy of the exact observed magnet link to the clipboard may be offered as an equivalent fallback; do not pretend right-click copying worked. Do not launch a local torrent client.

Submit once and verify Seedr's response and the resulting folder/transfer identity. If the outcome is uncertain, inspect Seedr before retrying to avoid duplicate submissions. Stop on quota, invalid-link, login, or service errors and report the actual result.

## Status and download

Distinguish three stages:

- **Seedr fetching:** torrent data arriving in the cloud.
- **Download preparation:** folder/archive being prepared by Seedr.
- **Local download:** archive transferring through Chrome to the computer.

Report the stage, observed status, and percentage only if shown or calculable from actual completed/total bytes. If there is no percentage, say it is unavailable. A ready cloud folder does not prove that the local download completed.

Download a folder only when the user asks or has explicitly authorized an end-to-end test including download. Check readiness first. If fetching or preparation is incomplete, report the current status/percentage and bail out of the download attempt; do not wait indefinitely, schedule monitoring, or repeatedly trigger archive preparation. If the download action itself starts preparation, observe the response and stop if it is not ready.

For a ready folder, start its folder/archive download once using Chrome's configured destination. Verify that Chrome accepted the download and report whether it is in progress or complete. If completion is requested, observe until complete or a concrete blocker, with concise progress updates. Never claim completion solely from clicking Download. Extraction is allowed when needed for requested VLC playback; do not run downloaded programs.

## VLC playback

When asked to open or play a downloaded movie or episode, use [references/vlc-playback.md](references/vlc-playback.md). Its movie guidance applies to episodes too; select the exact requested episode in a season folder. Default to full screen, original-language main audio, and subtitles disabled. On a subsequent Play request, resume rather than restart or accidentally pause. On an English-subtitles request, select an available English track and verify it. Navigate menus promptly using fresh state and direct controls; retain the user's latest playback settings across follow-ups.
