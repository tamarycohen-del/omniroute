#!/usr/bin/env python3
"""Builds story/full_script.md, story/narration.txt, story/storyboard.md, prompts/scene_prompts/*.txt
from production/lines.txt + production/timeline.json + production/scenes.py"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE); from scenes import SCENES
lines = [l.rstrip('\n').split('|', 1) for l in open(os.path.join(HERE, 'lines.txt')) if l.strip()]
tl = json.load(open(os.path.join(HERE, 'timeline.json'))); T = {s['shot']: s for s in tl['shots']}
order = [s['shot'] for s in tl['shots']]
text = {}; [text.setdefault(a, []).append(b) for a, b in lines]
mmss = lambda t: f"{int(t // 60)}:{int(t % 60):02d}"
SECTIONS = [('Hook', 'S01', 'S03'), ('The rule', 'S04', 'S09'), ('How the town uses its Opposites', 'S10', 'S16'), ('Alex and Xela', 'S17', 'S24'),
            ('The Opposite Race', 'S25', 'S29'), ('The wish', 'S30', 'S32'), ('Xela becomes famous', 'S33', 'S40B'), ('Something is wrong', 'S41', 'S43B'),
            ('The test and the answer', 'S44', 'S49'), ('The secret gets out: chaos', 'S50', 'S54B'), ('Alex saves the town', 'S55', 'S59'), ('Friends, opposite style', 'S60', 'S61B'), ('Final twist + call to action', 'S62', 'S65')]
MASTER = open(os.path.join(ROOT, 'prompts', 'master_visual_prompt.txt')).read().strip()
CHAR = {'Alex': 'ALEX: classic blocky block-game avatar (R6-style proportions: cube head, rectangular torso, two arm blocks, two leg blocks), light tan skin, bright blue short-sleeve uniform shirt with a small yellow badge on the left chest, dark blue belt, royal blue pants, white sneakers, blue baseball cap with a yellow five-point star on the front, short brown hair under the cap, simple cartoon face (big round white eyes with black pupils, thin eyebrows, pink cheeks).',
        'Xela': 'XELA (Alex\'s Opposite clone): EXACTLY identical to Alex in every detail — same blue uniform, same blue cap with yellow star, same proportions and colors. Distinguished only by expression and behavior.',
        'Mia': 'MIA: same blocky proportions, warm tan skin, long bright pink hair to the shoulders, purple hoodie, dark navy pants, pink shoes. Her Opposite clone is identical.',
        'Larry': 'LAZY LARRY: blocky avatar, brown skin tone, messy brown hair, green hoodie, brown pants, dark shoes. His Opposite clone is identical.',
        'Mayor': 'MAYOR GOLD: blocky avatar, shiny gold suit jacket with white shirt and red tie, black pants, tall black top hat with a gold band, brown mustache. His Opposite clone is identical.',
        'Grandma': 'GRANDMA: blocky avatar, light grey hair in a bun, purple glasses, lavender sweater, grey pants. Her Opposite clone is identical.',
        'Teacher': 'MRS. BLOOM: blocky avatar, red hair in a bun, dark glasses, teal top, dark teal pants. Her Opposite clone is identical.',
        'Reporter': 'REPORTER: blocky avatar, dark skin, short black hair, yellow jacket, black pants, holding a microphone or a TV camera.'}
def who(sid, desc):
    d = desc.lower(); out = []
    for k, key in [('Alex', 'alex'), ('Xela', 'xela'), ('Xela', 'clone'), ('Mia', 'mia'), ('Larry', 'larry'), ('Mayor', 'mayor'), ('Grandma', 'grandma'), ('Teacher', 'bloom'), ('Reporter', 'reporter')]:
        if key in d and k not in out: out.append(k)
    if 'Xela' in out and 'Alex' not in out and sid not in ('S19', 'S35', 'S36', 'S37', 'S41', 'S58B'): out.insert(0, 'Alex')
    return out
os.makedirs(os.path.join(ROOT, 'prompts', 'scene_prompts'), exist_ok=True)
fs = ['# IN THIS TOWN, EVERYONE HAS AN OPPOSITE CLONE…\n', f'Full narration script · ~{len(" ".join(b for _, b in lines).split())} words · temp-voice runtime {mmss(tl["total"])} (target pace 190–210 wpm)\n']
for name, a, b in SECTIONS:
    ia, ib = order.index(a), order.index(b); fs.append(f'\n## {mmss(T[a]["s"])} — {name}\n')
    for sid in order[ia:ib + 1]: fs.append(f'\n**[{sid} · {mmss(T[sid]["s"])}]** ' + ' '.join(text[sid]) + '\n')
open(os.path.join(ROOT, 'story', 'full_script.md'), 'w').write(''.join(fs))
open(os.path.join(ROOT, 'story', 'narration.txt'), 'w').write('\n\n'.join(' '.join(text[s]) for s in order) + '\n')
sb = ['# Storyboard — scene by scene\n', 'Timing comes from production/timeline.json (temp voice). Re-run make_docs.py after recording the final narration.\n']
for i, sid in enumerate(order):
    loc, light, desc, camera, sfx = SCENES[sid]; dur = T[sid]['end'] - T[sid]['s']; cast = who(sid, desc)
    img = f"{MASTER}\n\nCHARACTERS IN THIS SHOT:\n" + '\n'.join('- ' + CHAR[c] for c in cast) + f"\n\nLOCATION: {loc}, {('night, cool moonlight' if light == 'night' else 'bright daylight' if light == 'day' else light + ' light')}.\nSHOT: {desc}\nCAMERA: {camera}\nNo text, no logos, no subtitles. 16:9, 1920x1080."
    vid = f"Animate this image as smooth block-game gameplay footage (third-person game camera). {desc} Camera: {camera} Keep every character's outfit, colors, cap and proportions exactly the same for the whole clip. Simple stiff-limbed block-game animation (arms and legs swing as rigid blocks), no morphing, no extra characters, no text. Duration {max(4, min(8, round(dur)))} seconds."
    open(os.path.join(ROOT, 'prompts', 'scene_prompts', f'{i + 1:02d}_{sid}.txt'), 'w').write('IMAGE PROMPT\n' + img + '\n\nIMAGE-TO-VIDEO PROMPT\n' + vid + '\n\nNEGATIVE PROMPT\nsee prompts/negative_prompt.txt\n')
    sb.append(f"\n## Scene {i + 1} · {sid} · {mmss(T[sid]['s'])}–{mmss(T[sid]['end'])} ({dur:.1f}s)\n- **Narration:** {' '.join(text[sid])}\n- **Viewer sees:** {desc}\n- **Characters:** {', '.join(cast) or '—'}\n- **Camera:** {camera}\n- **Environment / light:** {loc} · {light}\n- **SFX:** {sfx}\n- **Prompts:** `prompts/scene_prompts/{i + 1:02d}_{sid}.txt`\n")
open(os.path.join(ROOT, 'story', 'storyboard.md'), 'w').write(''.join(sb))
print('docs ok', len(order), 'scenes')
