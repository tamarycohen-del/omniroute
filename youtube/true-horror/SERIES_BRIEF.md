# TRUE HORROR — daily unsolved-case Shorts (History Oops + Instagram)

Template: `HINTERKAIFECK_SHORT/` (copy its source_code and adapt). One video per day, published ~22:00 Israel.

## Case queue (take the first one not yet done; mark it done here)
<!-- User wants FAMILIAR cases first so viewers connect fast (2026-11-26). -->
- [x] Hinterkaifeck (1922) — YT -5NZ8rYXTD8, IG DgLciMIBK6v
- [x] Dyatlov Pass (1959) — YT 04qr1nBzhfs, IG DgN6Vc9h2Ix
- [~] Bermuda Triangle: Flight 19 (1945) — READY (NEXT_UPLOAD.json, publishes 2026-11-27 22:00) — familiar name, hook: five planes vanished + the rescue plane too
- [ ] D.B. Cooper (1971)
- [ ] Amelia Earhart (1937)
- [ ] Mary Celeste (1872)
- [ ] Villisca axe murders (1912) — no gore, no bodies, like Hinterkaifeck
- [ ] Flannan Isles lighthouse keepers (1900)
- [ ] Roanoke lost colony (1590)
- [ ] The Sodder children (1945)
- [ ] The Yuba County Five (1978)

## HOOK RULES (researched 2026-11-26; apply to every video)
1. First spoken words = the single most shocking CONCRETE fact (no date, no background first). Date/place go to line 3.
   e.g. "Five Navy bombers vanished in the Bermuda Triangle. Then the plane sent to find them… vanished too."
2. Use the FAMILIAR name in the first 2 seconds (Bermuda Triangle, D.B. Cooper, Amelia Earhart…).
3. Frame 0: BIG on-screen hook text, max 2 lines (~150px, white + yellow/red), top area (y≈330/470), saying the
   same thing as the voice — many viewers start muted. Second line can swap when the twist lands.
4. Frame 0 is already moving: fast punch-in/zoom (no static opening), eerie sound from frame 0.
5. Open a loop in the hook (a question or impossible detail) and PAY IT OFF later; re-hook around 40% ("It never came
   back either.", "But that wasn't the strangest part.").
6. Thumbnail/cover = the same promise as the hook (2-3 big words).
7. ENDING (user feedback 2026-11-27): after the final question the end card is SHORT — video ends ~1.2 s after the
   last word (card fades in over 0.25 s, ~1 s on screen). TOTAL = last line end + 1.3 in both the page and mix.py.
Sources: fluxnote.io unsolved-cases strategy, vidiq viral Shorts hooks 2026, opus.pro hook formulas, dev.to "Hook
Engineering 2026", shortsfast continuous-curiosity, socialmediaexaminer Shorts hooks & curiosity loops.

## Format
- 9:16, 1080x1920, 30 fps, 55–70 s, English. Hook line on frame 0, the eeriest concrete detail first.
- ~20 short narration lines (script file like `narration_script.txt`: `emotion | text | speed | pause_ms`).
- Ending: "…remains unsolved" + a question to the viewer ("Who/what do you think…?") + end card "<CASE> — <YEAR> / UNSOLVED."
- Dark illustrated comic look drawn in code (canvas 2D): thick ink outlines, navy / muted green / black, grain, vignette; one consistent key location.
- Captions: one word at a time, bold italic white, yellow/red key words, lower-middle (y≈1500).
- Thumbnail: key location + one light/one detail + 2–3 big words (e.g. "WHO WAS INSIDE?").

## Free tools only (no paid generation, no ElevenLabs)
- Voice: `youtube/tools/vstts.py` (OmniVoice), then atempo so the total is 55–70 s.
- Word timings: `source_code/words.py` (faster-whisper). Fix misheard names in words.json.
- Music/SFX: `source_code/mix.py` pattern (numpy drone + pulse + CC0 sfx-kit/earshot). Optional public-domain melody only if
  the composition is PD in the US and it is our own performance.
- Render: scratchpad `town/r2d.mjs` in 6 parallel chunks; check a contact sheet before encoding; `youtube/tools/review.sh`.

## Accuracy rules
- Real people died: respectful, no gore, no bodies/injuries, no weapons in use.
- Only well-documented facts; speculation framed as "reportedly / may / some believe". Never name or imply a culprit.
- Drawn reconstructions only; captions say "Illustrated reconstruction, no real photos."
- Note any shaky wording in the README.

## Publish (Composio, session-bear pattern)
- Commit mp4 + thumbnail.jpg, fetch blobs via GitHub proxy, upload_local_file.
- YouTube: YOUTUBE_MULTIPART_UPLOAD_VIDEO, account youtube_hoist-rumble, public straight away, categoryId 24,
  then YOUTUBE_UPDATE_THUMBNAIL + YOUTUBE_POST_COMMENT (channel UCZfAUpE88vp9EUA2ESHk0KA).
- Instagram: INSTAGRAM_POST_IG_USER_MEDIA REELS (ig user 17841467947584023, account instagram_cathy-sattle) with cover_url,
  poll status_code, _PUBLISH, first comment, permalink.
- If the YouTube quota is exceeded: post Instagram now, schedule YouTube for 10:20 Israel.
