# Scene planning, block prompts, and the edit grammar

## §1 Block math

- Narration length L seconds → N = ceil(L / 10) blocks of 10s each.
- Beat boundaries (from scriptwriter.md) map onto the timeline first; blocks
  are cut at 10s marks; a beat may span a block boundary — that's fine, the
  narration is continuous (laid over the whole video in the edit, not per block).
- House pacing: **6–9 hard cuts per 10s block** (~1.0–1.6s per shot). Never fewer
  than 5, never a shot longer than 2.5s except the final hold (~2s).

## §2 Shot list format (scene plan, per block)

```
BLOCK 2 (10.0–20.0) — MECHANISM A: the wet-hide ram
[10.0–11.0] MEDIUM tracking — crew charges pulling the hide-covered ram cart — assets: ram-shed, attacker-soldier
[11.0–12.5] POV push toward gate — GREEN arrow slams toward the gate doors — assets: wall-gate
[12.5–13.4] CU hides on the shed roof dripping — GREEN curved arrows trace the water — assets: ram-shed(wet)
[13.5–14.5] WIDE from wall top — torch flies — RED dashed trajectory arc — assets: wall-gate, defender-soldier
[14.5–15.6] MACRO hide surface — torch lands, steam hiss, flame dies — GREEN splat — assets: ram-shed(wet)
...
```

Per-shot fields: `[t0–t1] SIZE/ANGLE — subject + action — ANNOTATION — assets`.
Rules:
- vary SIZE and ANGLE on every consecutive cut (WIDE→MEDIUM→CU→MACRO→WIDE…);
- each shot names its roster assets; a shot that needs something not in the
  roster describes it inline in the block prompt (the roster stays at max 6
  sheets — characters, main environment, one story-carrying prop);
- one annotation max per shot (green = reveal, red = danger/physics);
- schedule the signature shots: macro-eyes in the myth/twist zone, one gag beat
  (poof-vanish or deadpan reveal), whip-in on shot 1;
- damage states must progress monotonically (intact → cracked → breached) and
  never revert within the video.

## §3 Block prompt template (one generation per block)

```
{STYLE FORMULA — byte-identical from style-3d.md}

Vertical 9:16 3D animated sequence, {10}s, {6–9} HARD CUTS exactly as timed:

SHOT 1 [0.0–1.0] {size/angle}: {subject, action, materials}. {annotation
direction if any}. HARD CUT.
SHOT 2 [1.0–2.5] {…}. HARD CUT.
…
SHOT K [8.6–10.0] {…}.

Characters only emote and gesture, they do NOT talk, no lip-sync, no dialogue.
Diegetic sound effects only (wood creaks, impacts, wind), no music, no voices.
Continuity: characters, costumes, objects and lighting EXACTLY as in the
reference images; same warm sunlight and cobalt sky in every shot.
NEGATIVE: photorealism, 2D flatness, cartoon outlines, on-screen text, words,
letters, numbers, captions, watermark, UI, extra characters, style drift,
static freeze at start.
```

Reference images (order matters): environment sheet → character sheet(s) →
prop sheet. Max 3 — pick the assets THIS block shows most. The settings table
under each block prompt names the exact files to attach.
If a returned block collapsed the cuts (one long shot), regenerate once with
"HARD CUT" bolded per shot and the cut count stated in the first line.

## §4 Edit grammar (final cut)

The generated blocks already contain camera energy; the edit pass adds the
signature punctuation. Build `edit_map.json` from the shot plan (visual
anchors: the shot time + the block's 10s offset) and refine with the word
timestamps that `voice.py` writes to `voice/words.json`:

- **punch** — quick zoom-in 1.00→~1.08 over ~0.4s, ease-out, at the moment a
  reveal lands (annotation appears, twist word, kicker image). 3–6 per video.
  Anchor each punch to the shot that carries the reveal (shot start + block
  offset); where a punch belongs to a spoken word (the twist, the kicker),
  use that word's timestamp from `voice/words.json`.
- **shake** — ±1% random crop jitter for ~0.3s at every block boundary and on
  impact beats (ram hits, wall collapse, horse hits wall).
- Never stack a punch and a shake on the same instant; shake wins on impacts,
  punch wins on reveals.
- Tail: freeze nothing; trim video to narration_end + 0.4s.

`edit_map.json` shape:
```json
{"punches":[{"t":5.9,"dur":0.45},{"t":22.3,"dur":0.45}],
 "shakes":[{"t":10.0,"dur":0.3},{"t":11.2,"dur":0.3},{"t":20.0,"dur":0.3}]}
```

Applied by `scripts/assemble.sh` (it calls `scripts/edit.py --print-vf` and
folds the zoom/shake filter into the final encode). The mix: narration at
0dB from t=0, block SFX ducked under speech, `loudnorm=I=-16:TP=-1.5`,
container 1080×1920 H.264 yuv420p + AAC.

## §5 QC before delivery

- duration = narration + ~0.4s; video plays from frame 1 (no static head);
- every block visually consistent with the sheets (spot-check first frame of
  each block against its environment sheet);
- annotations readable, no accidental text anywhere;
- audio: one voice, SFX under it, −16 LUFS integrated.
