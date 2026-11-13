# M-Play Zone channel profile (use with this skill)

Channel: **M-Play Zone** (`@m-playzone`, id `UCZfAUpE88vp9EUA2ESHk0KA`), connected through the Composio YouTube toolkit.
Audience (Nov 2026): PH, IL, ID, GB, US, MY. Plain English for non-native speakers.

## The format we're building
"Curious true stories", ~60 s: one surprising real-world or historical fact, told as a mini story with a twist.
The reference channel is Ricks Clips (@ricksclips3000). We copy the **format**, never the content:
no remakes of its videos, no copying its titles, characters, channel name or description.
Accounts that cloned it 1:1 (ricksclips3001, ricksclips3002) have 19–295 subscribers.

What the reference data shows (Ricks Clips, 150 uploads, measured 11 Nov 2026):
- Median 676k views per upload. Since mid-Oct 2026 it posts **daily**, and most uploads get 3M–33M views.
- Length **57–67 s**. Titles are curiosity questions, no emoji, no hashtags:
  "Why Perfect Railroads Don't Work" (28M), "The Ancient Jar That Warned an Empire" (33.5M),
  "The Job Nobody Wants in Japan" (17.7M), "How One Cart Stopped an Entire Army", "The Pink Prison Cell Experiment".
- Look: flat 2D round-headed cards inside a lit 3D world (what this kit renders), one conversational narrator,
  small single-word captions in the centre.

## Defaults for this channel (override the skill's generic defaults)
- **Length 55–65 s** (≈ 200–235 words at 3.7 words/s). The skill's 20–30 s default is for other projects.
- **Captions ON**: small one-word captions (`captions.py --style small`). The skill's "no captions" rule does not apply here.
- **Voice**: if the user has no recording, generate it (see "Voice" below). Default Edge voice `en-US-AndrewNeural`, rate +6%.
- **Title patterns**: `Why <Everyday Thing> <Surprising Verb>` · `How One <Object> <Big Outcome>` ·
  `The <Adjective> <Thing> That <Did Something Unexpected>` · `The <Thing> Nobody <Expects/Wants>`.
  Max 50 characters. Check each candidate isn't already a Ricks Clips title (`YOUTUBE_SEARCH_YOU_TUBE` with the title in quotes).
- **Host**: a recurring narrator-character appears in the hook shot and the payoff shot of every video:
  round white head, orange beanie (`#e8742a`), round black glasses, teal hoodie (`#2f9e94`). Outfit key `host` in `roman.js`.
  The glasses are not drawn yet: add them as a headgear part (two ink circles + bridge) and render a character test sheet first.
- Fact-check every idea with a web search before offering it, and label it documented / disputed / legend.

## Voice options (Stage 3 → 4)
1. **User records** (best): ElevenLabs or their own mic. Then use `timing.py` as the skill says.
2. **ElevenLabs via Composio** (if the `elevenlabs` toolkit is connected): `ELEVENLABS_TEXT_TO_SPEECH` with a deep narrator
   voice, then `timing.py voice.mp3 script.txt` (it aligns the script to silences).
3. **Edge neural TTS** (free, no account): `tools/tts_edge.py script.txt --out .` gives `voice.mp3` + exact word timings.
   In this cloud sandbox `speech.platform.bing.com` is blocked, so run the file in `COMPOSIO_REMOTE_WORKBENCH`
   (write it there, run it, zip the outputs, `upload_local_file`, then resolve the redirect with
   `requests.get(url, allow_redirects=False).headers["Location"]` and `curl` that `r2.cloudflarestorage.com` URL locally).
   Then `python3 words2phrases.py tts_words.json script.txt voice.mp3 --out work` replaces `timing.py`.
Always tell the user which voice was used. The final script text is the source of truth.

## Publish (Stage 5, only after the user approves the finished MP4)
Prepare and show: title, 2-line description, 3 hashtags (`#shorts` + 2 topic tags), pinned comment (a question),
and the AI disclosure. **Never upload without an explicit "upload it" from the user.** Ask whether to publish
public, unlisted or private.
- Upload: `YOUTUBE_MULTIPART_UPLOAD_VIDEO` (fallback `YOUTUBE_UPLOAD_VIDEO`) via Composio; the file must first be in
  Composio storage (`upload_local_file` in the workbench gives the `s3key`).
- Metadata: category Education (27) or Entertainment (24), not made for kids, language en.
- "Altered or synthetic content": say yes if any shot is AI-generated video or a realistic AI voice is used.
- After 48–72 h run the `yt-edit` skill's post-publish check and add a line to `youtube/m-play-zone/log.md`.

## Daily workflow
1. `yt-research` (weekly): refresh the reference numbers and what topics are hitting.
2. This skill, Stage 2: 10 ideas, the user picks one.
3. Stage 3 script → voice (option 1, 2 or 3) → Stage 4 build → contact sheet → full render → finish with captions.
4. Stage 5 publish after approval.


## Recurring host rule (Factopia)
The host (orange cap, round glasses, teal top; outfit `host`) appears in every video: a reaction shot in the middle and a close-up in the ending. In story videos he can be one of the people in the scene.
