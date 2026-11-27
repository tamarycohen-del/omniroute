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
# spelled-out numbers -> numerals (Whisper writes either form), so shots can key on e.g. /^30/ or /^6'9/
RULES = [(['six', 'foot', 'six'], "6'6\""), (['six', 'foot', 'nine'], "6'9\""), (['thirty', 'point', 'one'], '30.1'), (['two', 'hundred', 'fifty'], '250'), (['forty', 'thousand'], '40,000'),
         (['ten'], '10'), (['four'], '4'), (['eleven'], '11'), (['nine'], '9'), (['seven'], '7'), (['six'], '6')]
norm = lambda x: re.sub(r'[^a-z]', '', x.lower())
final = []; k = 0
while k < len(res):
    for seq, rep in RULES:
        if [norm(r['w']) for r in res[k:k + len(seq)]] == seq:
            final.append({'w': rep, 's': res[k]['s'], 'e': res[k + len(seq) - 1]['e']}); k += len(seq); break
    else:
        final.append(res[k]); k += 1
for q in range(len(final) - 1):
    if norm(final[q]['w']) == 'for' and norm(final[q + 1]['w']) == 'championships': final[q]['w'] = '4'
res = final
json.dump(res, open(sys.argv[2], 'w'))
print(' '.join(f"{x['w']}@{x['s']}" for x in res))
