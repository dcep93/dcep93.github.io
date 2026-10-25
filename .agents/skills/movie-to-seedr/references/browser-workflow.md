# Browser setup and observed behavior

Prefer the connected browser automation tool for Chrome. Follow its returned API documentation and inspect fresh accessibility/DOM state after actions. Use current labels and observed links rather than fixed element indexes or invented endpoints.

## Persistent setup

- Use the user's existing connected Chrome profile. If it is missing, ask the user to connect/open Chrome instead of silently using an unrelated browser profile.
- Open https://www.seedr.cc/ and use Login if needed. For an authorized known sign-in route, use the browser's Login/Google Login controls and inspect the response. Request user input only for missing credentials, account ambiguity, MFA, CAPTCHA, or other required handoff. Let the user choose Keep Me Logged In when appropriate. Retained cookies belong to Chrome; never export them into skill files.
- Leave a tab waiting for user login marked as a handoff when the browser tools support this. Preserve the Seedr result tab as a deliverable after a successful operation.
- Setup validation is an observation, not a permanent guarantee. Recheck login and capacity whenever adding a torrent, and readiness whenever downloading.

## Search behavior observed during development

On 2026-10-25, pirateproxy.net's home search redirected to search.dailystocks.com and returned 502. Its first listed proxy, tpb.re, opened a working Pirate Search page. Discover proxy links afresh from pirateproxy.net rather than treating this hostname as permanent.

The query `mission impossible 2` returned other installments. Refining to `mission impossible 2000` isolated the intended film. Results displayed sizes in GiB/MiB, SE and LE counts, release links, and magnet icons. Some titles were truncated, and uploader groups affected default ordering, so compare actual seeder counts instead of assuming the first rows are always the best results.

## Seedr submission tested

During the live test, clicking Google Login through the browser completed sign-in using the existing session without extra user input. Seedr's file view showed used/total storage and a collapsed plus/add-link control. Opening it exposed `Paste link URL Here`; pasting the selected magnet and pressing Enter submitted once. Verify the resulting transfer and storage state instead of relying on the input clearing.

Right-clicking the actual magnet link exposed Chrome's native Copy link address menu, but the native click failed with unavailable input geometry and copy could not be verified. The tested fallback was to dismiss the menu, take the exact magnet URL from the observed link, verify its info hash against the selected release, and paste through the browser into Seedr. Disclose this fallback; do not claim native copying succeeded or ask this user to right-click.

The selected movie was accepted and showed `Collecting Seeds`; no percentage was displayed. This verifies sign-in, capacity comparison, and submission, not download completion. A reserved storage increase does not mean cloud fetching or local download is complete. Stop a download attempt at this stage and propose a later readiness check.

## Popup recovery

The user authorizes following proxies listed on pirateproxy.net and closing unwanted popups generated during this workflow. A Toorgle general-search popup appeared during the development search; it was unrelated to the torrent results and was closed.

Before search submission and magnet interactions, know the task's current tabs. After an unexpected focus change, redirect, or failed action, list tabs and identify new unwanted tabs by their URLs, titles, and relationship to the action. Close only those task-generated ad/search tabs; preserve the user's unrelated tabs, the intended results, and Seedr. Re-observe the intended page before retrying an action. For in-page overlays, use an observed close/dismiss control. Do not click fake download buttons, accept notification permissions, or weaken popup/security settings. If the original tab was redirected, return to its last verified task URL. After two failed recovery attempts for the same action, try the next directory-listed proxy within the search fallback limit or report the blocker.

## Local source installation

Keep this folder in `.agents/skills/movie-to-seedr` inside the checkout. Link a supported user-level skill location to that folder so the skill can be discovered outside this repo. On this Windows machine the checkout is `C:\Users\100 horses\Documents\repos\dcep93.github.io`; resolve the actual checkout on another machine. Verify that the linked SKILL.md content equals the source and that Codex discovers it. If linking is unavailable, use a small local loader that reads the canonical repo SKILL.md before each request rather than maintaining a stale full copy. Do not commit machine-specific credentials or task state.
