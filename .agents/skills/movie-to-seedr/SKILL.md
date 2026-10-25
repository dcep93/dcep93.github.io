---
name: movie-to-seedr
description: Find five movie torrent choices through pirateproxy.net in Chrome, add a selected magnet to Seedr, check readiness, and download on request. Open downloaded movies full screen in VLC, control playback, verify original audio, and toggle English subtitles. Validate browser, Seedr, and VLC setup.
---

# Movie to Seedr

## Always load the current local instructions

Before each user request, including index selection, status, and download follow-ups, reread this SKILL.md from the local checkout of dcep93.github.io and any reference needed for that request. The installed skill folder should link to this repo folder so local edits, including uncommitted edits, are authoritative. Do not pull from GitHub automatically or overwrite the checkout from an installed copy. If the source cannot be read, stop rather than execute remembered instructions.

## Setup validation

Use the connected Chrome browser and its persistent signed-in profile through the available browser-control tools. Discover current browsers and tabs; do not assume a previous tab ID remains valid. Reuse existing task tabs where possible. Read [references/browser-workflow.md](references/browser-workflow.md) for setup and observed UI behavior.

Validate relevant prerequisites before acting:

- Chrome is connected and controllable.
- The search page is reachable and returns real movie results.
- Seedr is signed in and its current used/total or free storage is visible before adding a torrent.
- The magnet copy/paste path is available before submitting.
- On a local-download request, the folder is ready and Chrome can start the download; verify its state in the downloads UI.
- For VLC requests, VLC is installed and controllable and the chosen movie is fully downloaded. Follow [references/vlc-playback.md](references/vlc-playback.md); Chrome and Seedr need not be connected for an already-local movie.

Ask the user to handle sign-in, MFA, or CAPTCHA when necessary and keep the handoff tab open. Reuse retained sessions on subsequent runs, but do not promise that login never expires. Keep credentials, cookies, account data, and download URLs out of the repository. Never disable browser security to pass setup.

## Search and shortlist

1. Start at https://pirateproxy.net/ and search the requested movie. Check the title, sequel number, and year; ask only if ambiguity materially affects the match. If its search endpoint fails, use up to two proxy links actually listed on that directory, reporting the fallback; the user has authorized these proxies. Close unwanted ad/search popups and recover the intended page as described in the browser reference. Stop on security interstitials; do not follow ads or install suggested software.
2. Inspect matching movie releases. Exclude other installments, television, soundtracks, collections, and duplicates unless requested. Refine a broad search with the known year or exact title. Rank correct matches by seeders descending; use size as a tie-breaker unless the user states other preferences. Missing counts are unknown, not zero. Do not assume the site's default order is globally sorted.
3. Show up to five entries in a compact numbered table: exact release title, size with its displayed unit, and seeders. Add language, resolution, or a storage-fit note only when useful. If fewer matches exist, show fewer. Label truncated titles rather than inventing the missing text.
4. Retain the numbered mapping to the exact release/detail URL and identity in the conversation. When the user selects an index, use that mapping, not the current row order. If the mapping is missing or ambiguous, reconstruct it from conversation evidence or ask; never silently substitute another release.

Normally stop after the shortlist for the user's selection. If the user explicitly authorizes automatic selection, apply their criteria. For highest-seeder-with-space selection, choose the highest-seeded eligible entry among those five whose whole torrent fits Seedr's currently available space. Normalize GiB/MiB and GB/MB correctly; treat rounded near-limit values as uncertain. Do not delete existing content or purchase storage to make it fit. If none fits, report that and offer smaller choices.

## Selected entry to Seedr

The user's index selection authorizes adding that specific torrent. Recheck the selected release and current Seedr capacity before submission. Right-click its actual magnet link, choose Copy link address, then paste into Seedr's add-link input. Verify that the copied value is a magnet URI with an xt identifier and that its identity corresponds to the selected entry. Use the browser clipboard without displaying unrelated clipboard contents.

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

When asked to open or play the downloaded movie, use [references/vlc-playback.md](references/vlc-playback.md). Default to full screen, original-language main audio, and subtitles disabled. On a subsequent Play request, resume rather than restart or accidentally pause. On an English-subtitles request, select an available English track and verify it. Navigate menus promptly using fresh state and direct controls; retain the user's latest playback settings across follow-ups.
