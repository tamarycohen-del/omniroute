# The 3D house style — locked formula

Reverse-engineered frame-by-frame from the reference short (Trojan Horse, 1080×1920, a 3D myth-busting channel).
This file defines the ONE style formula. It is embedded **byte-identical** in the
style key, every character sheet, and every video block prompt. The formula never
changes mid-video; consistency comes from repetition + image references, not memory.

## STYLE FORMULA (paste verbatim)

```
STYLE: premium 3D animated short film still, glossy stylized-realistic CGI —
smooth appealing character proportions with realistic PBR materials (weathered
wood grain, hemp rope fibers, burnished bronze, wool fabric, dry sand),
warm golden sunlight, soft ambient occlusion, crisp specular highlights,
clear deep cobalt-blue sky, shallow cinematic depth of field, physically
plausible lighting, subtle film response. NOT photoreal, NOT flat 2D, no
outlines, no text, no watermark, no UI.
```

## What the reference frames show (use when art-directing)

- **Characters:** stylized-realistic 3D humans — Pixar-adjacent proportions but
  adult, grounded faces; visible skin subsurface glow, groomed brows, glossy
  expressive eyes. Costumes read instantly at 1 second: faction color-coding
  (attackers = red crests/tunics; defenders = ornate blue crests, navy cloaks,
  embossed bronze helmets with swan/goddess motifs, leather cuirass with bronze
  lion pauldrons).
- **Materials carry the wow:** every close-up is a material study — wood grain,
  rope twist, dripping wet hide, marble veining, bronze patina. Prompt materials
  explicitly in every CU.
- **World:** sun-bleached Bronze-Age plain, pale limestone ashlar walls with
  crenellations, dust kicked by motion. Sky always clear cobalt — it is the
  background of half the shots.
- **Lighting:** single warm key (afternoon sun), no dramatic color grading,
  no night scenes. Readability over mood.

## Annotation grammar (baked into generations, never post text)

| Color | Meaning | Shapes | Prompt language |
|---|---|---|---|
| **Neon green** | "look here / how it works / reveal" | glowing rectangle around a hidden part; arrow pushing toward a goal; scribble underline on a detail; x-ray outline of hidden contents; splat marking a result | "a neon-green glowing rectangle outline draws itself around the hidden panel, casting soft green light on the wood" |
| **Red** | "danger / force / physics" | dashed trajectory arc following a projectile; glowing crack racing through ground/wall; starburst impact flash at a collision point; arrow showing an ominous pull | "a red dashed trajectory arc traces the torch's flight", "a glowing red crack splits the ground and races toward the wall" |

Annotation rules:
- Annotations are **in-world**: they wrap surfaces, cast glow, track the camera.
- One annotation concept per shot, never two colors in one shot.
- Green = curiosity/reveal beats. Red = threat/mechanism-in-action beats.
- Shapes only. NEVER words, numbers, or arrows with labels.

## Signature shots (use at least the first two per video)

1. **Macro eye shot** — extreme close-up of a character's eyes darting/widening
   (the "human moment" that resets attention).
2. **Poof-vanish gag** — an object disappears in a grey smoke burst to visualize
   "never existed / gone".
3. **Whip-in opener** — first shot starts as a motion-blurred texture CU that
   whips out to the establishing wide.
4. **Deadpan reveal** — the literal, absurd version of a metaphor shown straight
   (a real horse standing where the "horse" was claimed).
5. **X-ray cutaway** — green glowing outline showing what's hidden inside a
   container/wall/machine.

## Character sheet spec (Assets stage)

- People: full body, front-facing 3/4, neutral sand-colored flat backdrop, arms
  relaxed, `2:3`. One sheet per distinct costume/faction, not per extra.
- Objects: isolated on plain backdrop, `1:1`, no hands, no scene.
- Environments: dressed wide of the place with its one anchor object, `9:16`,
  NO people.
- Damage/wear states: generate from the base sheet (attach the base sheet image as a second reference):
  "same object, now {cracked / breached / soaked / burned}" — one sheet per
  state that appears on screen.
