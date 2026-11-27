"""words.json (clean caption tokens) from the Whisper word timings. usage: make_words.py <voice_words.json> <out words.json>"""
import json, sys, re
W = json.load(open(sys.argv[1])); out = []
i = 0
while i < len(W):
    w = dict(W[i]); i += 1
    # glue number fragments / hyphen pieces onto the previous token
    while i < len(W) and (re.match(r'^[.,\-\'][\w\'"]', W[i]['w']) and (re.search(r'[\d\w]$', w['w'].rstrip('.,')) or True)):
        w['w'] = w['w'].rstrip('.,') + W[i]['w']; w['e'] = W[i]['e']; i += 1
    out.append(w)
fix = {'2': 'too'}
res = []
for k, w in enumerate(out):
    t = w['w'].strip().rstrip('.,')
    if t in fix and k > 0 and out[k - 1]['w'].lower().startswith('guards'): t = fix[t]
    t = t.replace('LeBron,', 'LeBron')
    if t.startswith('"') or t == '': continue
    res.append({'w': t, 's': w['s'], 'e': w['e']})
json.dump(res, open(sys.argv[2], 'w'))
print(' '.join(f"{x['w']}@{x['s']}" for x in res))
