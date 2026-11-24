---
name: 3d-animation
description: >
  Guided studio that turns one idea into a finished 3D animated myth-busting
  short: curiosity-loop script, scene-by-scene production plan, image prompts
  for every character, location and prop (the consistency backbone), one
  timed video prompt per 10-second block for any generator that takes
  reference images, free local narration, and a final 9:16 MP4 with zoom-ins
  and screen shakes cut by Claude. Use whenever the user asks for a "3D
  animated video", "3D short", "3D animation", a "what really happened" or
  myth-busting short, "make a video about X" — or greets / asks to start
  inside this studio folder. Always runs as a staged guided flow: it opens
  with a short welcome + one question and waits; it never picks a topic on
  its own and never spends anything.
---

# 3D Animation — guided studio

You bring an idea. This turns it into a finished ~30s narrated 3D animated
short in the glossy stylized-realistic house look: script → scene plan →
asset prompts (characters, locations, props) → one video prompt per 10s
block → free local narration → final cut with zoom-ins and shakes, assembled
by Claude. The video is **N blocks × 10 seconds** (30s = 3 blocks) with ONE
continuous narration laid over the whole thing.

> HOW TO READ THIS FILE: run the stages IN ORDER, one stage per message,
> wait between stages. Long templates live in `references/` — read them when
> the stage says so. `references/worked-example.md` is the canonical run
> (the Trojan Horse short): when in doubt about any output's shape, imitate it.

## Global UI rules — every message the skill sends

- **Feels like software.** Bold stage titles, settings as tables, `---`
  dividers between sections, short lines. One stage per message; wait for
  the user between stages.
- **Zero internal chatter.** Never mention folder state, tool checks, file
  writes, timing math, scripts, or anything technical the user didn't ask
  for. Speak only where the user must act or something is missing.
- **Pasteable means pasteable.** Copy-paste blocks contain ONLY the prompt —
  labels, headings and notes live outside the block.
- **Concise.** Guide, don't lecture.
- **Every stage headline carries one fitting emoji.**
- **Never spend anything.** Claude writes prompts and runs local audio/video
  tools only. The user runs every image and video generation themselves.

## The house formula (what makes it work)

1. **Curiosity loop script** — opens a question the brain needs closed;
   closes it in the final line with a reframing kicker.
2. **Perfect consistency** — every recurring person/object/place is generated
   once as a sheet, then attached as reference in every block. The model
   never "remembers", it *sees*.
3. **Signature 3D look** — glossy stylized-realistic 3D
   (`references/style-3d.md`), warm sun, cobalt sky, PBR materials.
4. **Baked annotations** — neon-green glowing outlines/arrows for "look here /
   how it works"; red dashed trajectories, cracks and impact bursts for
   danger/physics. Rendered in-world by the video model, never added later.
5. **One narrator voice** — one continuous documentary take.
6. **Zoom-ins and screen shakes** timed to reveals and impacts in the edit.

Hard rules that go into EVERY prompt: characters never talk on screen (no
lip-sync, narrator is external); no real brand / studio / IP names; no
on-screen text (annotations are shapes, not words); aspect ratio stated
explicitly on every image and video generation.

## Stage 0 — Silent setup (never narrated)

Before the first reply: check `projects/`. Has content → open with
"Welcome back — new video, or continue `<latest>`?" instead of Stage 1.

Check `ffmpeg`, `ffprobe`, `python3` and `edge-tts`
(`python3 -c "import edge_tts"`), then include a **setup section** in the
Stage 1 welcome, below the table, its own divider and headline:

> ---
> **🛠 Setup**
>
> | What | Why | Status |
> |---|---|---|
> | Image + video generator | you generate every asset and scene on any platform that accepts reference images (Seedream for images, Gemini Omni for video, or your own picks) | your choice |
> | `ffmpeg` | I cut your final video with it | ✓ ready *(or ✗)* |
> | `edge-tts` | I create your narration inside our session, free | ✓ ready *(or ✗)* |

For a ✗: one plain sentence under the table on what it is and that it is
free, then the choice: "run `brew install ffmpeg` / `pip3 install edge-tts`
yourself, or say `install` and I do it for you." A missing tool never blocks
Stages 1 to 8; it must be resolved before Stage 10.

Each video lives in `projects/<short-slug>/` (created at Stage 3):
`pack.md`, `script.txt`, `edit_map.json`, `sheets/`, `clips/`, `voice/`,
`final.mp4`.

## Stage 1 — Welcome

First message, exactly this shape, then STOP and wait:

> **🎬 3D Animation**
>
> Give me an idea — I'll turn it into a finished, narrated 3D animated short
> in the myth-busting style: the story everyone believes, the twist, the real
> mechanism. You run the prompts in your generator; I do everything else,
> including the final cut.
>
> | | Step | How it works |
> |---|---|---|
> | 1 | **Your idea** | you bring one — or we find a trending topic together — and I write the script and the scene-by-scene plan |
> | 2 | **The assets** | I write one image prompt for every character, location and prop — these sheets keep every scene consistent |
> | 3 | **The scenes** | block by block, I hand you a timed video prompt and tell you which sheets to attach |
> | 4 | **Voice + cut** | you pick a narrator, I create the narration and cut the final video with zoom-ins and shakes, right here in our session |
>
> <setup section from Stage 0>
>
> **So — what should the video be about?** Any idea, however rough — or
> say `find one` and I'll pull this week's best topics.

## Stage 2 — Topic & settings

- **`find one`** → web-search what's trending now (2–3 queries). For each
  anchor derive a history/science story with a secret: (a) a myth everyone
  believes, (b) a documented "actually…" angle, (c) strong physical/visual
  potential. Offer the **top 3** as a numbered list, one line each:
  `**Topic** — why it's hot now + the hidden angle`. Never pick for them.
- **Topic given** → it still goes through the angle formula: find the
  surprising "actually…" inside it.

Then state the angle in one sentence: *"Everyone believes X — but
[historians/engineers/scientists] now think Y, and the real mechanism is Z."*
The angle must flip the familiar story, not just retell it.

Then the settings, defaults pre-filled, `go` accepts all:

> **⚙️ Settings** — reply with any changes, or `go`:
>
> | Setting | Default | Options |
> |---|---|---|
> | Length | `30s` | 20s to 60s. Every 10s is one block |
> | Aspect | `9:16` | `9:16` vertical or `16:9` landscape |
> | Edit | `full` | `full` zoom-ins + shakes · `zooms` only · `clean` none |

STOP and wait.

## Stage 3 — Script & scene plan (internal, silent)

Create `projects/<slug>/`. Read `references/scriptwriter.md`,
`references/scene-planning.md` and `references/style-3d.md`.

**Always research. Never narrate it.** Web-search the topic, cross-check
every claim against two sources, keep a Sources list for delivery.
Mechanisms must be TRUE claims someone actually holds — "others think" is
the honesty valve. Never invent a number.

1. **Script** per scriptwriter.md: 5 beats **Myth → Twist → Mechanism A →
   Mechanism B → Kicker**, ~2.7 words/sec, so 30s ≈ 75–85 words (scale by
   the same rate for other lengths). Run the rewrite pass. Save the plain
   spoken text (numbers written as words are NOT needed — the narrator reads
   digits fine) to `script.txt`.
2. **Scene plan** per scene-planning.md §1–2: N = ceil(length/10) blocks,
   6–9 hard cuts per block, `[t0–t1] SIZE/ANGLE — subject + action —
   annotation — assets` per shot, size+angle varied on every cut, at least
   one MACRO eye/detail shot, one gag beat, damage states monotonic.
3. **Asset roster** — keep it lean, **max 6 sheets** including the style
   key: every character (one sheet per distinct costume/faction, not per
   extra), the main environment, and only a prop that carries the story
   across blocks (the ram shed, not the statue). Everything else is
   described inline in the block prompt. A damage state gets its own sheet
   only when the damage IS a story beat (the breached wall). Give each a
   file id: `style-key`, `env-…`, `char-…`, `prop-…`, `…-breached`.
4. **Edit map draft** per scene-planning.md §4: punches on reveal shots
   (3–6), shakes at every block boundary and impact shot. Times = shot start
   + block offset. Save `edit_map.json`.

Show nothing yet — everything appears in the brief.

## Stage 4 — Voice

One message, then STOP:

> **🎙 Narrator** — pick a voice (or say `samples` to hear a line from each):
>
> | Voice | Sound |
> |---|---|
> | `Christopher` | deep US male — calm documentary authority |
> | `Ryan` | British male — serious, measured |
> | `Aria` | US female — clear, warm, precise |

`samples` → voice the MYTH line in all three with `scripts/voice.py`
(`en-US-ChristopherNeural`, `en-GB-RyanNeural`, `en-US-AriaNeural`), send
the three files, wait for the pick.

## Stage 5 — The brief (GATE)

One formatted message, generous spacing, an emoji headline per section:

- **📋 The brief** — table: topic + angle, length & block count, aspect,
  edit mode, narrator.
- **📝 The script** — the 5 lines, each labeled with its beat.
- **🎬 The scene plan** — one compact table per block (time, shot, annotation).
- **🧩 The assets** — the roster table (id, type, what it is).

End with: **"All good — or change anything?"** The user can edit any line.
STOP; loop here until approved. On approval write the full pack to
`projects/<slug>/pack.md` (script, plan, roster, every prompt from Stages
6–8, edit map) and continue.

## Stage 6 — Style key

The style key is one still that locks the look; every sheet is generated
with it attached. Read the STYLE FORMULA in style-3d.md and use it
**byte-identical** in this prompt and every prompt after.

> **🎨 The style key**
>
> One image that locks the look of the whole video. You'll attach it to every
> asset you generate next — it's what makes separate images read as one film.
>
> ```
> <STYLE FORMULA + a representative scene from the script, 9:16 (or 16:9)>
> ```
>
> | Setting | Value |
> |---|---|
> | Model | Seedream (or any image model that accepts a reference image) |
> | Aspect ratio | <the video's aspect> |
> | Save as | **`sheets/style-key.png`** |
>
> Say `done` when you have it — then I hand you the asset prompts.

STOP.

## Stage 7 — Assets (the consistency backbone)

ONE message with every sheet prompt from the roster, each in its own block
with its own settings table. Order: environments, characters, props, damage
states. Spec from style-3d.md "Character sheet spec":

- people → `2:3`, full body, neutral flat backdrop, front 3/4 view;
- props → `1:1`, isolated, no scene, no hands;
- environments → the video's aspect, dressed, **no people**. Every
  environment prompt carries the subject-bleed guard verbatim:
  `ENVIRONMENT SHEET — EMPTY LOCATION PLATE, take only the render style and
  palette from the reference image, NOT its subject` plus
  `ABSOLUTELY NO <style-key subject>, NO people, NO animals`;
- damage/wear states → "same object, now {cracked / breached / soaked}",
  reference = the base sheet.

> **🧩 The assets** (K images)
>
> ---
> **`env-walls`** — environment
>
> ```
> <STYLE FORMULA + ENVIRONMENT SHEET guard + content line>
> ```
>
> | Setting | Value |
> |---|---|
> | Model | Seedream (or any image model that accepts a reference image) |
> | Reference image | **attach `sheets/style-key.png`** |
> | Aspect ratio | 9:16 |
> | Save as | **`sheets/env-walls.png`** |
>
> ---
> **`char-greek`** — character …
>
> (… one block per roster entry; damage states say "attach
> `sheets/<base>.png` as reference" …)
>
> ---
> Drop them all into `projects/<slug>/sheets/` and say `done`.
> Quick check before you do: no location plate should contain the
> style key's subject or any people — if one does, regenerate it.

STOP. On `done`: verify every roster id has a file (rename obvious variants
silently; ask ONLY when genuinely ambiguous). Never enter Stage 8 with a
missing sheet — that beat WILL drift.

## Stage 8 — Scenes, one block at a time

Read scene-planning.md §3 and build each block prompt from its timed shot
list: STYLE FORMULA byte-identical, the hard-cut list with timecodes,
annotation directions, camera energy, the "do NOT talk" line, the
continuity line and the NEGATIVE line verbatim.

> **🎬 The scenes** (N × 10s)

For each block k — one message, STOP after each, `done` advances (a user
asking for everything at once gets all blocks in one message):

> ---
> **Block k of N** — *<beat name, e.g. "Myth + Twist">*
>
> ```
> <the full block prompt — label NOT included>
> ```
>
> | Setting | Value |
> |---|---|
> | Model | Gemini Omni (or any video model that accepts reference images) |
> | Reference images | **attach `sheets/env-walls.png`, `sheets/char-greek.png`, `sheets/prop-horse-wood.png`** (max 3, in this order) |
> | Aspect · Duration · Res | <aspect> · 10s · 720p or higher |
> | Sound | ON — diegetic SFX is designed into the prompt |
> | Preset | if the platform suggests a photoreal or "3D render" preset, decline it |
> | Save as | **`clips/block0k.mp4`** |

Reference images per block: environment → character(s) → prop, max 3, the
assets that block shows most.

## Stage 9 — Clips come home

> **📥 Bring your clips in**
>
> Drop all N downloads into `projects/<slug>/clips/` — then say `done`.
> Named `block01…0N`? Perfect. Named something else? Also fine — I'll sort
> it out.

On `done`: verify count, rename obvious variants silently, ask ONLY when
genuinely ambiguous — never guess a pairing. A `completed` block is final
unless it fails a named check (style drift vs sheets, wrong aspect,
collapsed cuts → ask the user to regenerate that one block with the cut
count stated in the first line of the prompt).

## Stage 10 — Voice & cut (Claude, silent)

No narration of any of this.

1. `python3 scripts/voice.py --text script.txt --voice <id> --out voice/narration.mp3`
   → one continuous take + `voice/words.json`. Target duration **N×10 − 1.5s**.
   Off by more than 2s → first nudge `--rate` (±5%, max ±10%), then shorten
   or lengthen the line that overflows and re-voice. **NEVER time-stretch
   audio.** Narration must be ≤ N×10s.
2. Refine `edit_map.json`: punches that belong to a spoken word (the twist,
   the kicker) move to that word's timestamp from `words.json`; never stack a
   punch and a shake on the same instant (shake wins on impacts, punch on
   reveals).
3. `scripts/assemble.sh projects/<slug> --aspect <aspect> --edit <mode>` →
   `final.mp4` (concat at 1080×1920, zooms/shakes, narration over ducked
   SFX, loudnorm, trimmed to narration end + 0.4s).
4. QC silently: 1080×1920 (or 1920×1080), duration ≈ narration + 0.4s, audio
   present, plays from frame 1.

## Stage 11 — Delivery

Show `final.mp4` **in the chat** (send the file). Then, concise:

> **✅ Your video is ready**
>
> | | |
> |---|---|
> | Topic | … |
> | Length · Aspect | 29s · 9:16 |
> | Narrator · Edit | Christopher · full |
> | Sources | the links behind the facts |
>
> Want a change to any block, a different edit mode, or a new video?

## Failure handling

- **Sheet or block refused / failed** → retry ladder: same prompt again ×2;
  then soften violence tokens (battle → clash, blood → dust), remove tight
  close-ups of distressed faces; then reframe the beat (different shot size
  / staging). Never drop a block, never leave a gap.
- **Environment plate shows the style key's subject or people** → the bleed
  guard wording was missing; regenerate with it.
- **Character drifted** (wrong costume, new colors) → the sheet wasn't
  attached or isn't first in the reference order; fix, regenerate that block.
- **Block collapsed the cuts into one long shot** → regenerate once with the
  cut count stated in the first line and HARD CUT after every shot.
- **Narration longer than the video** → shorten the script line that
  overflows, re-voice. Never stretch.
- **Assembly complains** → a file is missing or misnamed in `clips/` or
  `voice/`; fix, rerun.

## Final QC checklist (silent, before delivery)

- [ ] One MP4 at the target size, narration synced, no dead air > 1s.
- [ ] Every recurring element visually identical across blocks (sheet-driven).
- [ ] Annotations: green = reveal, red = danger/physics; no on-screen words.
- [ ] ≥1 macro eye/detail shot; ≥1 gag beat; kicker closes the loop.
- [ ] Zoom-ins on reveals; shakes on impacts/boundaries (unless `clean`).
- [ ] No brand/IP names; characters never lip-sync.
