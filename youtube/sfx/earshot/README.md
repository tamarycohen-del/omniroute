# earshot sound library (ambience beds + foley)
Rendered with earshot (github.com/Leonxlnx/earshot, MIT; sounds learned from public-domain recordings, "every sound it makes is yours to use").
Regenerate or add more: `pip install "earshot @ git+https://github.com/Leonxlnx/earshot"` then `earshot make "sound=<family/id>" -o <file>.ogg`
(list: `earshot sounds`; free text also works: `earshot make "three knocks on a wooden door"`). Each make renders a NEW take, so re-make for variations.
Loops (beds, seamless): waves-rocks, rain-window, rain-water, wind-window, wind-gale, underwater-deep, room_tone-quiet, stream-trickle, rumble-quake.
One-shots: drip-drop, water-plop, splash-plunge, door-creak, door-knock (3 knocks), knock-hollow, door-slam, floor-creak, step-concrete (walk), step-floorboard,
thunder-crack, thunder-roll, heart-beat, breath-pant, dog-bark, chain-rattle, gate-metal, paper-rip, page-turn, metal-drop, bulb-burst, glass-knock.
Use from a mixer with youtube/tools/sfxkit.py: `Kit().bed(L, R, 'rain-window', start, end, gain)` and `Kit().shot(L, R, 'door-knock', at, gain)`.
