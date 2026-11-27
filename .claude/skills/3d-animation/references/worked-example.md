# Canonical worked example — "The Trojan Horse wasn't a horse" (28.9s, 1080×1920)

Frame-accurate reverse-engineering of the reference short. Use this file two ways:
(a) as the template every new topic imitates, (b) to REPLICATE the Troy short 1:1.

## Topic → Angle

- Trending anchor: the Odyssey movie — Greek mythology heat.
- Angle: *Everyone believes the Greeks took Troy hiding in a wooden horse — but
  historians now think no horse existed; the "horse" was a hide-covered
  battering ram, or an earthquake sent by Poseidon.*

## Script (verbatim, 78 words ≈ 28.6s) + measured beat map

| Beat | t | Line |
|---|---|---|
| MYTH | 0.00–5.80 | For 3,000 years, we've been told the Greeks hid inside a giant wooden horse to take Troy. |
| TWIST | 5.80–9.20 | But historians now think no such horse existed. |
| MECH A | 9.20–15.64 | To break down gates, armies used battering rams covered in wet horse skin so it wouldn't burn. |
| MECH B | 15.64–22.08 | Others think the horse was an earthquake — because Poseidon ruled the sea, horses, and earthquakes. |
| KICKER | 22.08–28.60 | So Troy may have fallen to a log dressed as a horse, or to the ground itself. |

## Asset roster (10 sheets incl. style key)

| file | type | ar | content |
|---|---|---|---|
| style-key | key | 9:16 | wooden horse before the walls — the look anchor |
| env-walls | environment | 9:16 | pale limestone ashlar walls of Troy, crenellations, heavy wooden double gate, sandy plain, clear cobalt sky |
| env-shore | environment | 9:16 | sandy shoreline, calm teal sea, walls distant |
| env-walls-breached | damage state | 9:16 | same walls with one collapsed breach, tumbled stone blocks, dust |
| char-greek | character | 2:3 | Greek attacker: bronze Corinthian helmet with red horsehair crest, red tunic, bronze cuirass, greaves |
| char-trojan | character | 2:3 | Trojan defender: ornate bronze helmet with navy-blue crest and embossed swan motifs, navy wool cloak and scarf, dark leather cuirass with bronze lion-head pauldrons |
| prop-horse-wood | prop | 1:1 | giant wooden horse of weathered oak planks, hemp rope lashings, wheeled timber platform, subtle hidden door seam in the flank |
| prop-ram-shed | prop | 1:1 | wheeled siege shed roofed in dark soaked animal hides dripping water, bronze-capped ram log slung on hemp ropes inside |
| prop-statue | prop | 1:1 | white marble statue of Poseidon holding a staff, pedestal relief of a horse over waves |
| prop-horse-real | prop | 1:1 | calm bay-brown horse, glossy coat |

Every sheet prompt = STYLE FORMULA (byte-identical) + the content line + sheet
spec from style-3d.md. The style key image is attached as reference on all.

## Shot lists (3 × 10s blocks, 9:16)

### BLOCK 1 (0–10) — MYTH + TWIST · attach: env-walls, char-greek, prop-horse-wood
```
[0.0–0.6] MACRO whip — motion-blurred oak plank + rope texture whips sideways. HARD CUT
[0.6–1.5] WIDE low-angle — giant wooden horse on its wheeled platform before the walls. HARD CUT
[1.5–2.5] MEDIUM — three Greek soldiers strain, pushing the platform, wheels grind sand. HARD CUT
[2.5–3.4] MEDIUM from below — Trojan defenders lined along the wall top, watching. HARD CUT
[3.4–4.4] CU horse flank — neon-green glowing rectangle draws itself around a hidden panel, green light bleeds on wood. HARD CUT
[4.4–5.4] CU — the panel swings open, dark hollow inside; green x-ray outline reveals crouched soldiers. HARD CUT
[5.4–6.4] CU inside — two Greek soldiers; one claps a hand over the other's mouth. HARD CUT
[6.4–7.3] MACRO — extreme close-up of wide eyes darting left-right. HARD CUT
[7.3–10.0] WIDE — the whole horse VANISHES in a grey smoke poof; smoke drifts, plain empty, defenders staring.
```

### BLOCK 2 (10–20) — MECHANISM A + quake begins · attach: env-walls, prop-ram-shed, char-trojan
```
[0.0–1.0] MEDIUM tracking — Greek crew charges pulling the hide-covered ram shed on wheels. HARD CUT
[1.0–2.0] POV push along the wall — neon-green arrow slams toward the closed wooden gate. HARD CUT
[2.0–2.9] CU — bronze ram head punches the gate planks, red starburst impact flash at contact. HARD CUT
[2.9–3.8] CU shed roof — dark soaked hides dripping; green curved arrows trace the water flow. HARD CUT
[3.8–4.7] WIDE from wall top — a defender hurls a flaming torch; red dashed trajectory arc follows its flight. HARD CUT
[4.7–5.7] MACRO — the torch lands on the soaked hide, steam hiss, the flame dies; soft green splat glow. HARD CUT
[5.7–6.6] WIDE plain — a glowing red crack splits the ground and races toward the wall. HARD CUT
[6.6–7.6] MEDIUM wall face — the red glowing crack climbs the stones; defenders above scramble. HARD CUT
[7.6–8.6] WIDE — a wall section crumbles, stone blocks tumble in dust. HARD CUT
[8.6–10.0] CU — white marble Poseidon statue, green outline traces it; tilt down to the pedestal relief of a horse over waves, green highlight.
```

### BLOCK 3 (20–30, trimmed to 29) — MECHANISM B + KICKER · attach: env-walls-breached, char-trojan, prop-horse-real
```
[0.0–1.0] WIDE shore — the sea pulls back from the sand; red arrow drags the waterline out; two defenders watch. HARD CUT
[1.0–2.0] MACRO — horse hooves stomp, cracks radiate through dry ground. HARD CUT
[2.0–3.0] WIDE — a bay horse gallops across the plain and slams into the wall, dust burst. HARD CUT
[3.0–4.3] MEDIUM — the wheeled hide shed rolls forward; a neon-green glowing horse outline draws itself over the shed. HARD CUT
[4.3–5.3] CU — the bronze-capped ram log swings on its hemp ropes. HARD CUT
[5.3–6.3] MEDIUM — a real bay horse stands calm on the empty plain, deadpan. HARD CUT
[6.3–7.3] WIDE — defenders in navy cloaks wander through the breached wall rubble. HARD CUT
[7.3–10.0] CU hold — two defender faces, baffled, slow push-in. END.
```

## Voice + edit map

- Narration: ONE continuous take of the full 78-word script, documentary
  pace. Target duration N×10 − 1.5s = 28.5s. The measured take landed at 28.1s.
- edit_map.json as used in the proven run (visual-anchored — block-relative
  shot times + 10s offsets):
```json
{"punches":[{"t":3.9,"dur":0.45},{"t":6.0,"dur":0.45},{"t":15.2,"dur":0.45},
            {"t":23.6,"dur":0.45},{"t":27.2,"dur":0.5}],
 "shakes":[{"t":10.0,"dur":0.3},{"t":12.4,"dur":0.35},{"t":17.7,"dur":0.35},
           {"t":20.0,"dur":0.3},{"t":22.6,"dur":0.35}]}
```
- Assembly: `scripts/assemble.sh` — concat 3 blocks at 1080×1920, zooms and
  shakes folded into the final encode, narration from t=0 over SFX at 0.25×,
  loudnorm −16 LUFS, trim to narration end + 0.4s.

## Lessons from the proven run

- Environment plates needed one regeneration round: the style key's wooden
  horse leaked into BOTH location plates until the "EMPTY LOCATION PLATE /
  NOT its subject / ABSOLUTELY NO wooden horse" wording was used.
- Some platforms push a photoreal or "3D render" preset on these prompts —
  decline it, the STYLE FORMULA is the style.
- Result: 28.5s 1080×1920 MP4, every original beat present at matching
  timestamps (±1s drift on a few block-2/3 beats).
