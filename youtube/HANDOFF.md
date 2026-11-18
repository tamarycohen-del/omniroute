# Channel handoff (read this first in a new session)

Branch: `claude/happy-newton-la11y6`. Channel id `UCZfAUpE88vp9EUA2ESHk0KA` (YouTube via Composio, account `youtube_hoist-rumble`).

## Channel
- Current name: "History Oops" (was M-Play Zone). Planned rename: **Factopia**, handle `factopia` (fallbacks `factopia.shorts`, `thefactopia`).
  YouTube blocks a rename until ~2026-11-23; a reminder is scheduled in the old session for 2026-11-23 18:00 Israel time.
- Description + keywords already updated to Factopia (via API). Name, handle and profile picture can only be changed by hand in YouTube Studio.
- Profile picture: `youtube/m-play-zone/factopia-profile.png`. Banner (chosen candidate): `youtube/m-play-zone/factopia-banner-center.jpg`
  (also `-plain`, `-host`, original `factopia-banner.jpg`). The banner CAN be uploaded via API (YOUTUBE_UPLOAD_CHANNEL_BANNER) — upload together with the rename.
- Owner is male; talks Hebrew; videos are in English.

## Videos
| Video | Status | Files |
|---|---|---|
| Vasa warship (old Edge voice) | uploaded by owner | `youtube/m-play-zone/production/vasa/` |
| Emu War (ElevenLabs Jon - Catalyst) | uploaded by owner | `youtube/history-oops/emu-war/` |
| What If Gravity Turned Off (Ethan) | to schedule next day 20:00 | `youtube/history-oops/gravity-off/` |
| How many times will you see them again (Ethan) | to schedule day after 20:00 | `youtube/history-oops/see-again/` |
Final MP4s were in the old session's scratchpad (not in git); re-render from sources if needed.

## What the analytics say (Nov 2026)
- Upload order: Vasa first, then Emu. Vasa: ~70% average viewed but fewer views. Emu: ~51% average viewed but more views (catchier topic/title). "Stayed to watch" ~60-62% on both.
- Lesson: a catchy, absurd topic brings views (Emu); one clear tension line that builds to a single climax near the end (Vasa) keeps them watching. Aim for both in one video.
- Length rule (user): every video 45-60 s, never under 45 s.
- Rules for new videos: keep the middle (20-40 s) tight with a visual change or twist there; end on a loop back to the opening or a last punch; finish with one simple question to the viewer (e.g. "What's the biggest mistake in history?").

## Direction change (in planning, Nov 14 2026)
- User wants to move the channel (visual + niche + identity) to **horror + apocalypse stories in parts** (not only apocalypses - horror too).
- Chosen format: **"Day 1 / Day 2…" survival diary** with our host as the survivor; each part ends on a cliffhanger.
- Each part ends with a **choice for the audience** (open the door? run or stay? go with him or with her?) - the next part follows the majority in the comments. Choices vary; not only rule-breaking. (The user does not want to repeat the CELL-217 *story* itself.)
- Series parts: **~75 s each** (user). Plan 7-8 parts per series so the full compilation passes 8 min (mid-roll ads). After each series, upload the full compilation as a long video (first one: vertical centred with blurred sides; 16:9 re-render later if it does well).
- **Look (decided):** flat 2D vector style (dark purple palette, soft gradients, moonlight, vignette), rendered with the 2D canvas engine in `youtube/horror/flat2d/` (`anim.html` + `stick.js` `whiteStick`, `render2d.mjs`): ~12 s for 270 frames.
- **Main character (decided):** white stickman with dark outline and a **dark beanie** (option B). The old host (orange cap) is retired for this series. Props like the flashlight only when a scene needs them - not a fixed item.
- Captions: bold uppercase, one keyword in lime; chapter label top-left ("3:33 AM / NIGHT ONE").
- **Decided: full switch on the current channel** (no second channel). First series: "It Knows Her Voice" (power outage, knocks at 3:33, mom's voice at the door - open or not).
- **Narration voice:** a new horror voice (not Ethan). Samples in `youtube/horror/voices/`: Cedric M (BQOei2tk6QCBMHQWPhbj) done; Michael C. Vincent (n1PvBOwxb8X6m7tahp2h) done; Larry (5bh6Hc8SO3Yh1skN9Cqm) pending (free tier busy). User picks.
- Open decisions: keep or hide the existing fact videos; new channel name + banner + avatar (the Factopia rename reminder on Nov 23 should become a horror-name reminder).

## New videos: use the research + script skill
- `.claude/skills/factopia-research-script/SKILL.md`: landscape scan -> facts + audience -> 3-5 angles (user picks) -> script with the hard retention rules -> self-review + upload package. Then build with `cartoon-audio-short`.

## Rendering speed (new style)
- New style renders at 2x supersampling (2160x3840, downscaled with lanczos) + detail pass: ~8-14 s/frame on this CPU-only container.
- Always render in 2 processes: one forward (`RESUME=1 node render.mjs frames "a-b"`), one backward with a reversed comma list of the same frames. They meet in the middle; RESUME skips frames already done.
- Optional speed-up when time matters: 1.5x supersampling instead of 2x (about 2x faster, barely visible on a phone).

## Recurring host (in EVERY video)
- Our original host character: orange cap, round glasses, teal top (`romanFront(p, 'host', ...)`, outfit `host` in the engine).
- He appears in every video: at least one reaction shot in the middle and a close-up in the ending (grin + thumbs up, or the final punchline).
- In story videos he can be one of the people in the scene (e.g. the front-row student in the Einstein video).

## How we make a video
- Skill: `.claude/skills/cartoon-audio-short/` (three.js cartoon engine, `render.mjs`, `mix.py`, `captions.py --style white`, `finish.sh`, `fitvoice.py`).
- Voice: ElevenLabs `Ethan – Energetic YouTube Narrator` (voice_id `uB5dGadiIOtRLnqbQl9M`, eleven_v4, tags [excited]/[playful]). Free tier is often busy — retry; elevenlabsusercontent.com is blocked locally, fetch via the Composio workbench.
- Word timings: segment the voice by pauses (`seg2words.py` in each video folder), captions big white.
- Loudness: -14 LUFS, true peak -1 dB.
- Never upload to YouTube without the owner's explicit OK (an API upload was removed by YouTube once; owner uploads by hand now).
- Don't copy other channels' content, characters, names or voices.

## Series 1 "Her Voice" - Part 1 DONE (Nov 14 2026)
- Folder: `youtube/horror/it-knows-her-voice/` (ep1_script.txt approved, audio/, web/ep1.html, biscuit.js, biscuit_sheet.jpg).
- Voices: narrator **Clancy** (FLpz0UhC9a7CIfUSBo6S), the voice at the door **Tammy** (TDdaEMZGTCMRB4x8bVQ2, normal warm mom voice - user: do NOT make it sound wrong), muffled through the door in voice.py.
- Build: `audio/voice.py` (splices takes, words.json from Scribe word times) -> `audio/sfx.py` (synth bed, half the voice level) -> copy words.json to web/ -> render web/ep1.html with render2d.mjs (2 processes, ~50 s) from a scratch dir that has a node_modules link -> ffmpeg loudnorm -14 LUFS.
- Re-record only the changed line (user: don't waste credits). Match a spliced line's loudness to its neighbours and cut in silence.
- User notes for the look: no KNOCK text; no "the voice" label; label top-left = time + episode name ("HER VOICE") + small "CHAPTER ONE"; both choice cards the same colour (red); Biscuit = small brown long dog, short snout, front view under the bed (narrow body, eyes don't move, only trembles).
- Part 1 ends with the choice OPEN THE DOOR / BACK DOOR WITH BISCUIT; Part 2 follows the most-liked comment.
- ElevenLabs free tier: one call once failed with "unusual activity... free tier disabled" (proxy); a retry later worked.
- Upload time: user used to upload daily at 08:45 Israel time. From Part 1 on: a fixed evening slot, about 22:00 Israel (15:00 New York / 12:00 LA). Part 1 itself went up ~00:40 Israel on Nov 15. Use YouTube Studio "Schedule" when the user isn't free at that time.
- Instagram @history_oops is connected through Composio (Creator account; insights work: INSTAGRAM_GET_USER_MEDIA, INSTAGRAM_GET_IG_MEDIA_INSIGHTS, INSTAGRAM_GET_IG_MEDIA_COMMENTS). Part 1 on IG after a few hours: 1,575 views, 709 reached, 58 likes, 10 comments, 2 saves, average watch 22.2 s of 78 s. Votes so far: Biscuit leads. Comments asked for longer videos and why the phone dies so fast.
- Branding (Nov 15): suggested name **Votefear** (no channel found with that name; fallbacks Pickfright, Pickdoom). YouTube description + IG bio drafted ("You decide. He has to survive."). Files in `youtube/horror/branding/`: profile pictures (J = our character's face on dark, 2048px versions), final banner `youtube_banner_2560x1440.png` (purple, character + moon + signpost with lime/red arrows + eyes in the dark, no text) - approved.
- Part 2 DONE (Nov 15): choice GO TO MRS. HALE / INTO THE WOODS WITH BISCUIT. Folder part2/ (script.txt, audio/voice2.py + sfx2.py, cover_part2.jpg), web/ep2.html (with idle motion: breathing, tree sway, fog/dust, handheld drift, eyes in the dark doorway - the user approved this animation upgrade; use it for the next parts too). Mrs. Hale voice = "Nan" (jVMsZEw3hfmEAe9OUUtS). Opening = same bedroom shot as Part 1 + "Imagine your mom knocks at the door at 3:33 a.m.... while you're <last choice>".
- Lesson: eleven_v4 voices a narrator line as the character if it follows "X said:" - keep character lines in their own take, and never put narration right after "said:" in the same take.

## Render workflow (user's rule)
- While working on an episode: render at normal 1080x1920 (`render2d.mjs`) for speed.
- Only after the user approves the final cut: render once in 2K with `web/render2k.mjs` (1440x2560, same args), encode crf16 / aac 256k, and send that file for upload.

## HER VOICE status (Nov 18 2026)
- Part 5 published (Nov 18, 22:01 IL): YouTube Yv5IBX7puaE (1080 upload), Instagram reel Df5UIRljm5a (+ question comment posted; user pins it).
  Choice: CROSS THE BRIDGE WITH BISCUIT / GO HOME TO MOM. Folder part5/ (script_v2.txt approved, audio/ voice5.py sfx5.py music5.py, thumbnail_part5.jpg, upload.txt), web/ep5.html.
- Script skill: `.claude/skills/her-voice-script/` (yt-script was removed at the user's request).
- Full-series compilation (planned, user wants it in 4K): render each epN.html with web/render4k.mjs (ROOT-env copy used in the session scratchpad),
  Part 5 4K render was stopped at 2149/2469 frames (scratchpad only - re-render if it was cleaned). Then join parts 1-5 (+ later parts) into one long video.
