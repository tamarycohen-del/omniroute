---
name: yt-edit
description: Edit, tighten and quality-check an M-Play Zone Short. Covers script edits, an editing timeline, captions, sound, export settings, upload settings, and a post-publish check with analytics. Use when asked to edit or improve a script or video, check it before upload, or review how an uploaded Short is doing.
---

# Edit and QA an M-Play Zone Short

The format rules are in `../../../youtube/m-play-zone/series-bible.md`.

## A. Script edit (when given a script)

Cut anything that doesn't move the viewer toward picking a number or seeing the result. Do these in order:
1. Replace the first line with a situation plus a threat in 8 words or fewer.
2. Delete setup sentences, names and backstory before the options appear.
3. Bring the total to 35–45 s, at most about 110 words of VO.
4. Make sure each failure is different and visual, and that the survivor is revealed last with a fair clue.
5. End with the twist plus "Comment your number", and write it so it can loop.
Give back the edited script, then a 3-line summary of what changed and why.

## B. Retention checklist (before upload). Every item must pass.

- [ ] Frame 1 shows the hook text and all numbered options (check it with the sound off).
- [ ] No shot is longer than 2 s without movement, zoom or cut.
- [ ] The option number stays on screen (top-left) during its whole reveal.
- [ ] Captions are burned in, centred at about 60% height, max 3 words per line, white text with a black outline, active word highlighted.
- [ ] A "SURVIVED/CAUGHT" stamp on every reveal, with an impact SFX.
- [ ] Music sits at -20 dB under the VO, and there's 0.3 s of silence before the survivor reveal.
- [ ] The total length is 35–45 s and the last frame loops into the first.
- [ ] No gore, no real brands, no real people. AI content is labelled (see D).

## C. Editing and export

- 1080×1920, 30 fps, H.264, about 12 Mbps. Safe zone: keep text out of the bottom 20% and right 15% (YouTube's buttons sit there).
- Voice: an AI TTS (ElevenLabs or similar) with a low, calm narrator. Keep the same voice in every episode.
- Timeline: VO track, then shots cut on VO sentence breaks, then captions, then number badges, then stamps and SFX, then music.
- Any editor works (CapCut, DaVinci, Premiere). Use one saved template so badges, fonts and stamps stay the same every time.

## D. Upload settings

- Title using the bible's pattern. Description of 2 lines plus `#shorts #survival #choose`. No hashtags in the title.
- Category: Entertainment. Audience: not made for kids. Language: English.
- **Altered or synthetic content: Yes** if realistic AI people or scenes are shown (YouTube requires this disclosure).
- Related video = the previous episode. Add it to the "Pick to Survive" playlist.
- Post the pinned comment within 1 minute of publishing. Reply to the first 20 comments within the first hour.

## E. Post-publish check (48–72 h after upload)

Use the Composio YouTube tools (see the `yt-research` skill), `YOUTUBE_QUERY_ANALYTICS` with `filters: "video==<id>"`.
- averageViewPercentage below 60% means the hook or first 3 s failed. Rewrite the hook pattern for the next episode.
- 60–80% means a reveal drags. Cut the longest reveal by 1–2 s.
- Comments below 0.3% of views means the choice was too obvious, or the comment prompt was missing or too late.
Write down one lesson per episode in `../../../youtube/m-play-zone/log.md`, as a date, video id, the 3 numbers and the lesson.
