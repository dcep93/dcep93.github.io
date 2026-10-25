# VLC playback

## Setup and file selection

Use the available native computer-control tools for VLC, following the Computer Use skill and its current API documentation. Browser automation alone cannot control VLC. Check whether VLC is installed and its window is targetable. During development on this Windows machine, the executable was present at `C:\Program Files\VideoLAN\VLC\vlc.exe`; discover the current app/window instead of assuming an old handle is valid. If native controls or VLC are unavailable, report the missing prerequisite instead of claiming playback succeeded.

Identify the completed local download from this movie's task context and verified download state. Do not use a partial download or assume the latest file in Downloads is the chosen movie. If the folder is a ZIP archive, extract it into a dedicated directory without overwriting existing files; check resolved extraction paths remain inside that directory. Open the main movie video, excluding samples, trailers, and bonus content. Use the exact media path with VLC's observed Open File control; never execute bundled scripts or installers. Ask only if multiple main features are genuinely ambiguous.

An Open/Play request authorizes opening this movie in VLC and applying the defaults below. If the user asks to prepare it paused or wait before playing, honor that explicitly. Downloading alone does not request playback. For later Play, subtitle, or audio requests, reuse the verified current movie and position.

## Fast menu navigation

Use concise actions and the cheapest useful state observation. Prefer observed menu items, accessible controls, or shortcuts shown by VLC. Do not insert arbitrary sleeps or narrate every click. Each changed menu/window needs fresh state before selecting a state-dependent item; speed does not justify stale indexes, guessed coordinates, or blind shortcut sequences. If a menu is inaccessible, inspect its screenshot and use the native tool's supported coordinate actions.

Configure tracks before entering full screen when practical. For changes during full screen, use the observed context/menu controls or temporarily exit full screen, make the change, and return. Dismiss menus when done so the movie remains unobstructed. Verify one authoritative signal for each changed setting and avoid repeatedly reopening menus once verified.

## Original audio

Inspect the available audio tracks (normally Audio > Audio Track) and the selected marker. Select the main original-language track, excluding commentary, descriptive audio, and dubbed tracks when identifiable. Original language is the movie's original language, not automatically English, the first track, or the default track. Establish it from reliable movie/release information already available; research only if necessary.

Use track language/title metadata and release information as evidence. If labels are missing or several same-language tracks cannot be distinguished, report that original audio is unverified and ask only if choosing would require a guess. Do not claim to have listened to audio without an actual audio-capable observation. Keep the existing volume and mute setting unless the user requests an audio-level change; track selection is separate from volume.

## Full screen and Play

On a new movie opening, select original audio, turn subtitles off, and enter VLC's actual full-screen mode rather than merely maximizing the window. Verify full screen from the visible player state or a checked full-screen control. A Play request should leave the movie playing from its current position. Inspect the current control/state first: if already playing, do not toggle it; if paused/stopped, use Play. Verify playback using the Pause control/state or advancing playhead. Do not restart or seek unless requested.

## Subtitles

- Default for a newly opened movie: use the subtitle-track menu (normally Subtitle > Sub Track > Disable) and verify Disable is selected. Apply this to the current playback session rather than changing global VLC preferences.
- When asked to restore or enable English subtitles, select an English track from the current movie and verify the selection. Prefer ordinary full-dialogue English subtitles over forced-only or commentary tracks; retain the user's previously chosen English track when identifiable. Use English SDH if it is the only suitable track and mention that distinction if useful.
- If no embedded English track exists, inspect the selected download's files for a clearly matching English sidecar and load it through VLC's subtitle-file action. Do not load an unrelated subtitle or silently fetch an external subtitle package. If no suitable English subtitle exists, say so and leave the existing setting intact.
- A later Play request preserves the current subtitle setting. Only a new movie opening or an explicit subtitles-off request resets it to disabled.

Finish with a short factual status: movie, playing/paused, full screen, selected audio language/track, and subtitles off/English. Report any unverified setting explicitly. Do not claim a live playback test passed when only the skill instructions or installation were checked.
