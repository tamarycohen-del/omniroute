---
name: her-voice-script
description: Write the next part of the HER VOICE horror series ("Would You Open the Door?", History Oops). Uses the series brief, the real comment vote, and the channel's retention/growth rules. Use when asked for a HER VOICE script or the next part.
---

# Write a HER VOICE part

Read first: `youtube/horror/it-knows-her-voice/SERIES_BRIEF.md` (characters, full plot, open mysteries, rules) and the previous part's script/words (`partN/script.txt`, `web/wordsN.json`).

## Inputs to collect
1. The vote: pull comments + likes on the last part (YouTube `YOUTUBE_LIST_COMMENT_THREADS2`, Instagram `INSTAGRAM_GET_IG_MEDIA_COMMENTS`). Winner = most total likes; ignore the channel's own pinned comment.
2. Stats of the last parts (views, avg watch time, saves, shares) to decide what to fix.

## Fixed structure (keep the length: 80-90 s, ~200-230 words; viewers asked for long parts)
1. Cold open on a NEW scary image + hook line ("Imagine…") that works for someone who never saw earlier parts.
2. A PROMISE in the first 8 s that pays off later ("And tonight… she finally speaks").
3. "In the comments, you said: <choice>." + 4 REAL viewer comments on screen + a 2-word reaction ("Bold call.").
4. 8-12 short beats, a new scary image every 2-3 s.
5. RE-HOOK at ~25-30 s (where viewers leave): sudden change + "But that wasn't the scary part" style line.
6. A PAUSE CLUE (something visible for ~1 s that is explained later) → saves/rewatches.
7. A "that's my mom" moment (something every kid knows) → shares.
8. A twist near the end that reuses an old clue (Mom never says "honey"; Mom always texts "love you"; Biscuit growls at fakes).
9. "So… do you <A>? Or <B>?" + "Comment your choice. Part N follows you." Two RED cards, short caps; Biscuit in the scene; both options risky; one option includes Biscuit.

## Growth checklist (problem → cause → fix)
no views → bad hook → promise something · no saves → no value → give a clue worth rewatching · no comments → no excitement → a bold, hard choice · no likes → not relevant → say it differently · no shares → not relatable → make them feel seen · no followers → not unique → lean on Biscuit and "your comments decide".

## Rules
Simple English, short present-tense sentences, no gore. Never solve all mysteries. The narrator never says "the voice". Character lines (Mom, Mrs. Hale) are recorded in separate takes, never in the same take as "X said:". Keep continuity (3:3x-3:4x AM clock, Mom's stretching arms, Mrs. Hale's too-wide smile, Biscuit). Ask the user before any plot decision that changes the series rules; list those decisions at the end of the script.

## Output
`partN/script.txt`: header (vote result, stats lessons, time card, word count) + table `# | narration | on screen` + recording notes + pinned comment + "plot decisions to confirm".

## Storytelling principles (from Kallaway's "Short-Form Storytelling Principles", applied to HER VOICE)
Check every script against these before recording:
1. **Curiosity through contrast**: open a question, answer it, open the next one, all the way down. Every 3-4 s a beat must raise a new question. The biggest curiosity = breaking an expectation ("The scariest thing tonight isn't the monster. It's the one who looks like Mom.").
2. **Speed to value**: something scary/interesting on screen in frame 1 and a reason to stay within 5 s (Part 6 cold open: eyes in the open car door from the first frame).
3. **Value density**: cut anything the viewer doesn't need. Keep the comments beat under ~1 s of dead time and keep the story moving behind it.
4. **Clarity**: 6th-grade words, active voice, short sentences. Say the key reveal twice: once short, once dead simple (so viewers who join mid-video get it).
5. **Anticipation**: tease what's coming (the promise), then pay it off with a reveal that isn't the obvious one.
6. **Emotion**: fear and shock drive the most shares; pick trigger words and visuals for one target emotion per beat.
7. **Rhythm**: mostly staccato, mixed with a few medium/long lines; never the same sentence length three times in a row.
8. **Energy**: narrator takes in ElevenLabs need tension/urgency; re-record flat lines.

## Sound mix (apply the `audio-design` skill, adapted to our videos)
- Loudness: our Shorts are streaming video, so keep loudnorm I=-14 LUFS, true peak <= -1 dBTP (the skill's -24/-18 LUFS targets are for games). Meter with `ffmpeg -i mix.wav -af ebur128=peak=true -f null -`.
- Buses: voice, music, SFX, ambience (water/crickets/drone) as separate arrays; duck music AND ambience under the voice (release ~300-500 ms, no pumping).
- Adaptive music: build intensity in layers (pad -> pulse -> drums) instead of one flat loop; switch sections on bar lines; use stingers for reveals.
- SFX variation: never repeat the exact same sample in a row (footsteps, ticks, clicks): small random pitch (+/-1 semitone) and volume (+/-2 dB) offsets.
- Leave headroom before the limiter; check that the re-hook silence is really silent.

## Upload checklist
Instagram reels: ALWAYS pass cover_url (the part thumbnail, as a public r2 URL) to INSTAGRAM_POST_IG_USER_MEDIA. The cover cannot be changed via the API after publishing.

## Production craft (also for LAST LIGHT and every new series)
Adapted from the directing and technique guides of [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar) by Lemomo (LemoLab), licensed [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/); summarized in our own words and changed to fit our vertical choice-shorts. Lines marked (ours) come from our own mistakes.

**Before writing**
- World logic first (ours): every rule of the world (who can go where, when, why) is set up on screen BEFORE the moment that depends on it. Ask "why doesn't the monster just attack now?" for every beat. (Part 1 of LAST LIGHT shipped a draft where the creatures came out in daylight; fixed with "They can't touch sunlight... but the shadows were getting longer.")
- Choices must come out of the story's own rules (ours): both options use what the episode established (sound, light, the radio), both risky, easy to argue about. Never two random actions.
- Pick 1-2 reference works for this episode: write what to learn (pacing, camera grammar, color logic, sound) and what not to take (characters, designs, shots, music).
- One subject, one goal, one turn. Hook in the first 3 s. The ending echoes the opening.
- Write a short treatment before drawing: beat sheet by the second, shot list (framing, camera move, duration, WHY), and a sound table per section (ambience, foley, music state).

**Sound**
- Every visible action has a sound that matches its material (metal radio, cloth backpack, claws on asphalt, glass).
- Three layers: ambience, foley, music/drone. Duck ambience and music under the voice.
- At least two real silences (or near-silences) before the turn or the peak; the first sound after the silence is one of the most important in the film.
- Use sound as a transition at least twice: bring the next scene's sound in early, or let the last scene's sound run over the cut.
- Voice: compress it first, then balance by RMS, about 10 dB above the music. Keep 20-120 Hz about 3 dB under the rest so drones don't eat phone speakers.

**Rhythm and reading**
- Vary the pace: fast and slow, one clear acceleration, one held breath. One even speed = failure. Don't cut on every beat.
- A caption stays at least 1.8 s and at least spoken length + 0.6 s. On-screen text holds about (letters / 15 + 1.5) s after it finishes appearing. Title or choice cards at least 4 s.
- In TTS text spell numbers out; in captions write digits.

**Camera and staging**
- At least four different camera moves (push, pull, pan, parallax, tracking) and real framing changes. One signature shot people remember.
- At key moments the subject fills at least a third of the frame height (our full-body walking shots are too small: go closer for every emotional beat).
- Transitions made from the world itself (a shadow sweeping, a door closing, static) rather than default fades.

**Performance**
- Anticipation, action, follow-through on every meaningful move. Characters change emotion, they don't just slide.
- Blend poses with easing; never switch a pose inside an `if` at a time threshold (Biscuit's stand -> crouch snap). Exception: a deliberate one-frame comic pop.
- Check every expression at final size (worried vs angry is one eyebrow flip).

**Most common failures (check every render)**
Subject too small or against the frame edge · too dark to read or color on the same color · captions covering the subject · a gag or scare too fast to understand · blank frames in transitions · an effect that doesn't follow the subject after the camera moves (use one world -> screen function).

**Rendering**
- Deterministic frames: no `Math.random()` without a seed, no state carried between frames, so any chunk can render alone.
- Add film grain in ffmpeg, not on the canvas (grain drawn in the page makes frames slow and incompressible).

**Review before delivery (one fix round)**
1. Contact sheet of a frame every 1-2 s; at least two passes.
2. 0.2 s strips of every key action (falls, grabs, jumps, reveals).
3. On the final mp4: `youtube/tools/review.sh <file.mp4>` (loudness about -14 LUFS, black frames, whisper of the final mix).
4. Watch it once at full speed with sound.
Fix everything found in one round, check once more, then deliver. Later notes from the user are new rounds: change only what they ask.

## Research without YouTube API quota
Agent Reach (MIT, github.com/Panniantong/Agent-Reach) is installed with uv in the cloud session (needs youtube.com and reddit.com allowed in the environment; both are). Read-only:
- `agent-reach youtube search "<query>"` → titles, channels, view counts, durations (yt-dlp, no API quota).
- `agent-reach youtube subtitle <url>` → a competitor's script as text. Blocked from the cloud container (YouTube's "confirm you're not a bot" check on datacenter IPs, tested 2026-11-23); works on the user's own computer.
- `agent-reach reddit search "<query>"` → story ideas and what people say about a genre.
Never connect it to the channel's Instagram/X accounts (account automation risk). Composio stays for uploads and comments. In a fresh container reinstall: `uv tool install https://github.com/Panniantong/Agent-Reach/releases/latest/download/agent-reach.zip && agent-reach setup`.
