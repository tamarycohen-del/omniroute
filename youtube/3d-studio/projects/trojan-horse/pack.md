# Trojan Horse — how it actually worked · production pack

| | |
|---|---|
| Length · blocks | 30s · 3 |
| Aspect | 9:16 |
| Edit | full |
| Narrator | Christopher (en-US-ChristopherNeural) |
| Approved | 2026-10-20 |

## Angle
Everyone believes an army hid inside the horse — but the horse held only a few dozen men; the fleet waited behind a nearby island (Tenedos), the Trojans hauled the horse in themselves, and that night the men opened the gate from inside and signalled the ships.

## Script (85 words)
MYTH    For 3,000 years, we've been told the Greeks took Troy with an army hidden inside a wooden horse.
TWIST   But the horse held no army. Just a few dozen men.
MECH A  The fleet had only sailed behind a nearby island — and the Trojans hauled the horse in themselves.
MECH B  That night, the men slid down ropes, opened the gate from inside, and lit a torch for the ships.
KICKER  So Troy didn't fall to a horse. It fell to one silent night, and a gate opened from within.

## Sources
- Wikipedia, Trojan Horse — headcount per source (Apollodorus 50, Quintus Smyrnaeus 30, Tzetzes 23): https://en.wikipedia.org/wiki/Trojan_Horse
- History Today, "Was the Trojan Horse Real?": https://www.historytoday.com/archive/history-matters/was-trojan-horse-real
- Virgil, Aeneid II 250–267 — fleet returns from Tenedos, beacon signal, Sinon opens the horse, gates opened: https://www.poetryfoundation.org/poetrymagazine/poems/55228/virgil-aeneid-ii-ii-250-267
- Wikipedia, Sinon — torch signal to the fleet: https://en.wikipedia.org/wiki/Sinon

## Asset roster
| id | type | ar | content |
|---|---|---|---|
| style-key | key | 9:16 | wooden horse before the walls of Troy |
| env-shore | environment | 9:16 | sandy shore, teal sea, rocky island on horizon, walls distant |
| env-walls | environment | 9:16 | limestone walls of Troy, monumental wooden double gate, sandy plain |
| env-plaza | environment | 9:16 | plaza inside the gate, inner gate with timber bar, torch brackets |
| char-greek | character | 2:3 | Greek soldier, red crest, red tunic, bronze cuirass |
| char-trojan | character | 2:3 | Trojan defender, navy crest, navy cloak, leather cuirass, lion pauldrons |
| prop-horse-wood | prop | 1:1 | giant wooden horse, wheeled platform, hidden belly hatch seam |
| prop-horse-open | state | 1:1 | same horse, hatch open, rope ladder |
| prop-ships | prop | 1:1 | Greek war galley |

## STYLE FORMULA (byte-identical everywhere)
STYLE: premium 3D animated short film still, glossy stylized-realistic CGI —
smooth appealing character proportions with realistic PBR materials (weathered
wood grain, hemp rope fibers, burnished bronze, wool fabric, dry sand),
warm golden sunlight, soft ambient occlusion, crisp specular highlights,
clear deep cobalt-blue sky, shallow cinematic depth of field, physically
plausible lighting, subtle film response. NOT photoreal, NOT flat 2D, no
outlines, no text, no watermark, no UI.

## Style key prompt (9:16, no reference)
{FORMULA}
Vertical 9:16 still. A giant wooden horse built from weathered oak planks lashed with hemp rope stands on a wheeled timber platform on a sun-bleached sandy plain before the pale limestone walls of Troy; a few tiny Trojan defenders in navy cloaks line the wall top looking down. Low angle, late-afternoon sun from the left, long shadows, dust in the air.

## Sheet prompts (all: reference = sheets/style-key.png, except states = base sheet)
env-shore (9:16): {FORMULA} ENVIRONMENT SHEET — EMPTY LOCATION PLATE, take only the render style and palette from the reference image, NOT its subject. Vertical 9:16. A wide sandy Bronze-Age shoreline, calm teal sea with gentle foam, a rocky island on the horizon, the pale limestone walls of Troy small and distant to the right, keel grooves and a few abandoned camp stakes in the sand, late-afternoon sun. ABSOLUTELY NO wooden horse, NO people, NO animals, NO ships.
env-walls (9:16): {FORMULA} ENVIRONMENT SHEET — EMPTY LOCATION PLATE, take only the render style and palette from the reference image, NOT its subject. Vertical 9:16. The pale limestone ashlar walls of Troy with crenellations and a monumental wooden double gate with bronze studs under a stone arch, seen head-on from the sandy plain, dust in the air, late-afternoon sun. ABSOLUTELY NO wooden horse, NO people, NO animals.
env-plaza (9:16): {FORMULA} ENVIRONMENT SHEET — EMPTY LOCATION PLATE, take only the render style and palette from the reference image, NOT its subject. Vertical 9:16. The flagstone plaza just inside the gate of Troy: the inner face of the great wooden double gate with a massive timber locking bar resting in bronze brackets, columned limestone facades, bronze torch brackets with lit torches, hanging garlands, a few overturned clay wine jugs, warm sunlight falling through the gateway. ABSOLUTELY NO wooden horse, NO people, NO animals.
char-greek (2:3): {FORMULA} CHARACTER SHEET, full body, front-facing 3/4 view, arms relaxed, neutral sand-colored flat backdrop. A Greek soldier: bronze Corinthian helmet with a tall red horsehair crest, red wool tunic, burnished bronze muscle cuirass, bronze greaves, leather sandals, round bronze shield slung on his back, short sword at the hip. Stylized-realistic adult face, tanned skin, dark stubble, determined expression.
char-trojan (2:3): {FORMULA} CHARACTER SHEET, full body, front-facing 3/4 view, arms relaxed, neutral sand-colored flat backdrop. A Trojan defender: ornate bronze helmet with a navy-blue crest and embossed swan motifs, navy wool cloak and scarf, dark leather cuirass with bronze lion-head pauldrons, bronze greaves, spear in hand. Stylized-realistic adult face, olive skin, short dark beard, alert expression.
prop-horse-wood (1:1): {FORMULA} PROP SHEET, isolated on a plain neutral sand-colored backdrop, no scene, no hands, no people. A giant wooden horse built from weathered oak planks lashed with hemp rope, carved wooden mane and tail, bronze-studded joints, standing on a wheeled timber platform with four solid wooden wheels, a subtle rectangular hatch seam in the belly, side 3/4 view.
prop-horse-open (1:1, ref = prop-horse-wood): {FORMULA} PROP SHEET, isolated on a plain neutral sand-colored backdrop, no scene, no hands, no people. The same wooden horse exactly as in the reference image, now with the rectangular belly hatch dropped open on bronze hinges, dark hollow interior visible, a knotted hemp rope ladder hanging down to the platform.
prop-ships (1:1): {FORMULA} PROP SHEET, isolated on a plain neutral sand-colored backdrop, no scene, no hands, no people. A Greek war galley: long black-pitched wooden hull, bronze ram at the prow, painted eye on the bow, single mast with a square cream linen sail, a bank of oars, side 3/4 view.

## Block prompts
Each = {FORMULA} + the shot list below + the fixed tail:
"Characters only emote and gesture, they do NOT talk, no lip-sync, no dialogue. Diegetic sound effects only (wood creaks, impacts, wind), no music, no voices. Continuity: characters, costumes, objects and lighting EXACTLY as in the reference images; same warm sunlight and cobalt sky in every shot. NEGATIVE: photorealism, 2D flatness, cartoon outlines, on-screen text, words, letters, numbers, captions, watermark, UI, extra characters, style drift, static freeze at start."

### Block 1 (0–10) — Myth + Twist · refs: env-shore, prop-horse-wood, prop-ships
Vertical 9:16 3D animated sequence, 10s, 9 HARD CUTS exactly as timed:
SHOT 1 [0.0–0.6] MACRO whip: motion-blurred weathered oak plank grain and hemp rope fibers whip sideways across frame. HARD CUT.
SHOT 2 [0.6–1.6] WIDE shore: a fleet of black-hulled Greek galleys with square linen sails sails away toward the horizon over calm teal sea; on the sand a giant wooden horse on its wheeled timber platform stands alone; the pale walls of Troy distant. HARD CUT.
SHOT 3 [1.6–2.5] LOW-ANGLE WIDE: the wooden horse towers against the cobalt sky, hemp lashings creaking, dust drifting. HARD CUT.
SHOT 4 [2.5–3.4] MEDIUM: Trojan defenders in navy wool cloaks and ornate bronze helmets with navy crests step out cautiously, shields raised, circling the wheeled platform. HARD CUT.
SHOT 5 [3.4–4.4] CLOSE-UP horse belly: a neon-green glowing rectangle outline draws itself around the hidden hatch seam in the planks, casting soft green light on the wood. HARD CUT.
SHOT 6 [4.4–5.6] MEDIUM x-ray: a neon-green glowing outline cuts through the horse's belly, revealing a small cluster of crouched Greek soldiers in red horsehair crests and bronze cuirasses packed knee to knee, tiny inside the vast hollow. HARD CUT.
SHOT 7 [5.6–6.6] CLOSE-UP interior: darkness cut by slats of sunlight between the planks; one Greek soldier claps a hand over another's mouth. HARD CUT.
SHOT 8 [6.6–7.5] MACRO: one wide glossy eye pressed to a knot-hole, a slit of light across it, pupil darting left and right. HARD CUT.
SHOT 9 [7.5–10.0] POV through the knot-hole: a small bright circle shows Trojans outside pointing up at the horse; the camera pulls back out through the hole and rises into a high WIDE: the horse on the sand ringed by tiny figures, the empty beach, the sea with no ships.

### Block 2 (10–20) — Mechanism A · refs: env-walls, char-trojan, prop-horse-wood
Vertical 9:16 3D animated sequence, 10s, 9 HARD CUTS exactly as timed:
SHOT 1 [0.0–1.2] WIDE sea from the shore: black-hulled Greek galleys with square linen sails glide behind a rocky island and vanish one by one; a neon-green glowing arrow traces their curve behind the rock. HARD CUT.
SHOT 2 [1.2–2.0] CLOSE-UP: the last bronze-rammed prow slips behind the rock, linen sail furling. HARD CUT.
SHOT 3 [2.0–3.0] MEDIUM: Trojan defenders throw thick hemp ropes over the wooden horse's neck, dozens haul in unison, the timber wheels lurch forward, sand sprays. HARD CUT.
SHOT 4 [3.0–4.0] LOW tracking: solid wooden wheels grind over sand and stone toward the great gate; a red dashed line traces the path along the ground to the gate. HARD CUT.
SHOT 5 [4.0–5.2] WIDE gate: the horse scrapes through the stone gateway, its carved head barely clearing the arch, splinters and stone dust bursting from both sides. HARD CUT.
SHOT 6 [5.2–6.0] CLOSE-UP: a grinning Trojan defender slaps the horse's flank as it passes; inside, in the dark, a Greek soldier flinches. HARD CUT.
SHOT 7 [6.0–7.0] MEDIUM from the wall top: the great wooden double doors swing shut behind the horse and a massive timber bar drops into its bronze brackets; a neon-green glowing outline traces the bar. HARD CUT.
SHOT 8 [7.0–8.4] WIDE plaza: the wooden horse parked in the flagstone plaza, Trojan defenders dancing around it, torches blazing, clay wine jugs raised. HARD CUT.
SHOT 9 [8.4–10.0] MACRO: the hatch seam in the belly planks; a single bead of sweat seeps through the crack and drips.

### Block 3 (20–30) — Mechanism B + Kicker · refs: env-plaza, char-greek, prop-horse-open
Vertical 9:16 3D animated sequence, 10s, 9 HARD CUTS exactly as timed:
SHOT 1 [0.0–1.0] WIDE plaza: torches guttering low, Trojan defenders in navy cloaks slumped asleep against the columns, overturned wine jugs; the wooden horse looms silent. HARD CUT.
SHOT 2 [1.0–2.0] CLOSE-UP underside: the belly hatch drops open on bronze hinges, dark hollow inside, a knotted hemp rope ladder unrolls to the flagstones. HARD CUT.
SHOT 3 [2.0–3.0] MEDIUM: Greek soldiers in red crests slide down the ropes one after another, landing in a silent crouch. HARD CUT.
SHOT 4 [3.0–4.0] LOW tracking: sandaled feet sprint across flagstones past sleeping guards toward the inner gate. HARD CUT.
SHOT 5 [4.0–5.0] CLOSE-UP: two Greek soldiers heave the massive timber bar up and out of its bronze brackets; a neon-green glowing outline traces the bar. HARD CUT.
SHOT 6 [5.0–6.0] WIDE from inside: the great double doors swing open onto the open plain, dust drifting in the light, slow reveal. HARD CUT.
SHOT 7 [6.0–7.0] MEDIUM wall top: a Greek soldier raises a blazing torch high toward the sea; a red dashed sightline flashes from the torch out across the water. HARD CUT.
SHOT 8 [7.0–8.0] WIDE sea: the Greek fleet rounds the rocky island, square sails full, racing back toward the shore. HARD CUT.
SHOT 9 [8.0–10.0] CLOSE-UP hold: the wooden horse alone in the empty plaza, hatch hanging open, rope ladder swaying gently, slow push-in. END.

## Edit map (draft; punches on twist/kicker move to word timestamps after voicing)
punches: 3.6 (green rectangle), 7.0 (twist "no army"), 16.0 (bar drops, green), 21.0 (hatch drops), 27.5 (kicker hold)
shakes: 10.0, 14.0 (horse scrapes gate), 20.0, 25.0 (gate swings open)
