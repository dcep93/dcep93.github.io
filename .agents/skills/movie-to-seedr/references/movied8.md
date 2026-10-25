# Seedr video in movied8

Use https://movied8.web.app/ in the user's connected Chrome profile. The user's request to load a selected Seedr movie here authorizes transferring that file's playback URL to this app. Treat signed URLs as private access links: use only the intended app, avoid printing tokens, and never commit them or persist them in skill files.

## Select the ready Seedr file

Locate the exact requested movie/episode in the signed-in Seedr file list. Confirm cloud readiness and choose the main video, excluding samples and unrelated episodes. A ready cloud video can be loaded in movied8 without downloading the folder locally. If Seedr is still fetching/processing, report actual progress, stop the playback attempt, and propose checking readiness on the next yes.

Obtain a fresh direct video/playback URL using Seedr's observed video or file-link controls. Use the actual selected file link, not a magnet, folder/ZIP download, Seedr HTML page, or a constructed endpoint. Preserve the entire signed URL when pasting but do not expose it in the response. Inspect fresh page controls to distinguish a playback URL from a share link. If the URL is expired or rejected, obtain a new link once from the same file; do not edit its token or expiration parameters.

## Load the app

The existing movied8 page was observed with a video player, editable `path`, `src`, and `subs` fields, Submit, Local video, Follow, Sync, and saved-title buttons. An existing title was addressed with a `?k=` query parameter. These observations identify controls; they do not establish every storage/sync behavior. Inspect current state and labels before submitting.

1. Reuse the intended TV/display tab and inspect the active saved title and sync state. Keep existing saved entries. For a new video, use a descriptive title/key in `path` rather than reusing an unrelated entry's key; use the exact requested existing key when replacing it is the user's intent. Verify the current UI supports this mapping before submitting.
2. Paste the fresh selected Seedr video URL into `src`. Preserve a matching English subtitle source in `subs` if it is known; do not carry over subtitles from another movie or invent a subtitle URL. If no subtitle is supplied, leave it empty for the new entry.
3. Submit once, then verify the loaded media identity and player readiness. Do not treat the form's successful submission as proof the video decodes or plays.
4. Apply full screen, original-language main audio where verifiable, and subtitles off for newly opened media. Retain any English subtitle source for later enabling. Use the player's observed controls; if autoplay is blocked, use Play and confirm the state/advancing playhead. Distinguish full-screen video from full-screen Chrome.

## Follow-ups and limitations

- Play/resume is idempotent: do nothing if already playing. Preserve playback position and the latest subtitle choice. Pause only on request.
- English subtitles: select the available English text track or use a matching subtitle source from this download through the app's supported controls. Verify the enabled track. If none is available, say so; do not guess. Hardcoded subtitles cannot be disabled.
- Original audio: verify a selectable track or reliable release metadata. If the browser player cannot select or identify audio tracks, report that limitation and propose VLC for the exact file if audio selection is needed. Do not claim browser controls provide VLC's track capabilities.
- Chrome may not play every Seedr container/codec. A stalled/error player is not success. After a fresh-link retry, report the error and propose local download/VLC rather than repeatedly resubmitting or claiming audio/video works.
- Preserve Follow/Sync settings and existing room/key relationships unless asked to change them. Do not assume which device is leader or that remote playback changed merely because a field changed locally. Verify the intended display when possible. Never delete saved titles as routine recovery.

Finish with title/episode, playing or paused, full screen, and verified audio/subtitle state. If only loaded/paused, offer the single next action "Next: play [title] full screen in movied8. Say yes." Once playback is established, stop.

## Evidence and limits

The form and player controls were observed in the user's existing movied8 Chrome tab. A signed Seedr video URL was present in its src field, showing the existing integration pattern. Loading a new Seedr movie in movied8 has not been tested; Seedr sign-in and later browser inspection were blocked during authoring. Revalidate the actual UI, source mapping, and playback at execution time.
