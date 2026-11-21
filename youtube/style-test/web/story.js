// "Einstein Wrote 9 x 10 = 91 on Purpose... Or Did He?" Timed to voice.mp3 (ElevenLabs Ethan, 55.84 s, 1676 frames @30).
import { M as E, camFromKeys, idle, blinkAt, walk, q, clamp, lerp, ramp } from './motion.js';
import { profCard, wordCard, tallyCard } from './props_ein.js';
import { babyCard, bigNum } from './props_nur.js';
export const FPS = 30, TOTAL = 1676;
export const SHOTS = [
  { id: 'enter', a: 0, b: 144, light: 'class' },
  { id: 'board', a: 145, b: 489, light: 'class' },
  { id: 'laugh', a: 490, b: 573, light: 'class' },
  { id: 'wrong', a: 574, b: 687, light: 'class' },
  { id: 'waited', a: 688, b: 729, light: 'class' },
  { id: 'turn', a: 730, b: 788, light: 'class' },
  { id: 'quote', a: 789, b: 981, light: 'class' },
  { id: 'world', a: 982, b: 1166, light: 'class' },
  { id: 'silent', a: 1167, b: 1216, light: 'class' },
  { id: 'twist', a: 1217, b: 1471, light: 'class' },
  { id: 'lesson', a: 1472, b: 1556, light: 'class' },
  { id: 'end', a: 1557, b: 1675, light: 'class' },
  { id: 'hook', a: 2000, b: 2299, light: 'class' },
  { id: 'walk', a: 2500, b: 2650, light: 'class' },
  { id: 'hq', a: 3000, b: 3300, light: 'class' }, // quality test: host close-up
  { id: 'n1', a: 5000, b: 5069, light: 'nur' }, // nursery sample: establishing
  { id: 'n2', a: 5070, b: 5119, light: 'nur' }, // dolly along the cribs
  { id: 'n3', a: 5120, b: 5169, light: 'nur' }, // insert: clipboard
  { id: 'n4', a: 5170, b: 5245, light: 'nur' }, // host reaction
  { id: 'h3a', a: 4000, b: 4044, light: 'class' }, // 3D host test: hello
  { id: 'h3b', a: 4045, b: 4104, light: 'class' }, // snap zoom: shock
  { id: 'h3c', a: 4105, b: 4164, light: 'class' }, // low wide: laugh
  { id: 'h3d', a: 4165, b: 4245, light: 'class' }, // close: wave + thumbs up // bridge: he walks to the empty board // cold-open hook, rendered separately and spliced in front
];
export const HOOK_SMUG = 2190;
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const CZ = -1200, BZ = CZ - 4.82, NZ = -1400;

export const LIGHTS = {
  nur: { az: 180, el: 32, sky: '#ffffff', ground: '#f0dcd8', hemi: 1.75, sun: '#ffe6b8', sunI: 2.6, fog: '#f4e8e0', fogNear: 60, fogFar: 300,
    skyTop: '#9fd0f4', skyHor: '#eaf6ff', sat: 1.12, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.26, shadowExt: 9, lift: '#0a0604' },
  class: { az: 20, el: 40, sky: '#fff4e0', ground: '#7a5a3a', hemi: 1.4, sun: '#fff0d8', sunI: 1.6, fog: '#e8dcc0', fogNear: 60, fogFar: 200,
    skyTop: '#bfe0f8', skyHor: '#e8f2fa', sat: 1.1, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.24, shadowExt: 10 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });

const CAMS = {
  enter: [{ f: 0, pos: [0.4, 2.3, CZ + 5.6], look: [0.6, 1.8, BZ], fov: 50 }, { f: 144, pos: [0.4, 2.1, CZ + 4.6], look: [0.6, 2.0, BZ], fov: 46 }],
  n1: [{ f: 5000, pos: [3.6, 2.3, NZ + 3.9], look: [-2.2, 1.2, NZ - 1.6], fov: 50 }, { f: 5069, pos: [3.1, 2.15, NZ + 3.3], look: [-2.2, 1.15, NZ - 1.8], fov: 48 }],
  n2: [{ f: 5070, pos: [-3.6, 1.3, NZ - 1.5], look: [-2.9, 1.05, NZ - 3.6], fov: 42 }, { f: 5119, pos: [1.6, 1.3, NZ - 1.5], look: [2.3, 1.0, NZ - 3.6], fov: 42, ease: 'easeOut' }],
  n3: [{ f: 5120, pos: [-3.3, 1.66, NZ + 1.98], look: [-3.5, 0.94, NZ + 1.6], fov: 42 }, { f: 5169, pos: [-3.36, 1.55, NZ + 1.9], look: [-3.5, 0.94, NZ + 1.6], fov: 42 }],
  n4: [{ f: 5170, pos: [-0.9, 1.35, NZ + 1.1], look: [-1.55, 1.15, NZ - 1.0], fov: 38 }, { f: 5245, pos: [-1.0, 1.33, NZ + 0.75], look: [-1.55, 1.18, NZ - 1.0], fov: 38 }],
  h3a: [{ f: 4000, pos: [0.55, 1.2, CZ - 0.2], look: [0.2, 0.95, CZ - 2.6], fov: 38 }, { f: 4044, pos: [0.5, 1.2, CZ - 0.5], look: [0.2, 0.98, CZ - 2.6], fov: 38 }],
  h3b: [{ f: 4045, pos: [0.42, 1.3, CZ - 0.9], look: [0.2, 1.15, CZ - 2.6], fov: 36 }, { f: 4051, pos: [0.26, 1.32, CZ - 1.35], look: [0.2, 1.24, CZ - 2.6], fov: 34 }, { f: 4104, pos: [0.25, 1.32, CZ - 1.42], look: [0.2, 1.25, CZ - 2.6], fov: 34 }],
  h3c: [{ f: 4105, pos: [-1.0, 0.55, CZ - 0.9], look: [0.2, 1.05, CZ - 2.6], fov: 44 }, { f: 4164, pos: [-0.7, 0.6, CZ - 0.75], look: [0.2, 1.08, CZ - 2.6], fov: 44 }],
  h3d: [{ f: 4165, pos: [0.65, 1.3, CZ - 0.75], look: [0.25, 1.1, CZ - 2.6], fov: 38 }, { f: 4245, pos: [0.58, 1.3, CZ - 0.95], look: [0.25, 1.12, CZ - 2.6], fov: 38 }],
  hq: [{ f: 3000, pos: [0.3, 1.45, CZ + 0.6], look: [0.25, 1.25, CZ - 2.6], fov: 36 }, { f: 3210, pos: [0.3, 1.45, CZ - 0.2], look: [0.25, 1.3, CZ - 2.6], fov: 36 }],
  walk: [{ f: 2500, pos: [3.2, 1.85, CZ - 1.0], look: [3.15, 1.6, CZ - 4.2], fov: 48 }, { f: 2607, pos: [1.9, 1.8, CZ - 1.0], look: [1.5, 1.7, CZ - 4.5], fov: 46 }],
  hook: [{ f: 2000, pos: [1.0, 1.72, CZ - 1.9], look: [1.05, 1.68, CZ - 4.45], fov: 34 }, { f: 2220, pos: [1.03, 1.72, CZ - 2.35], look: [1.05, 1.7, CZ - 4.45], fov: 34 }],
  board: [{ f: 145, pos: [0, 2.3, CZ + 0.4], look: [0, 2.3, BZ], fov: 44 }, { f: 400, pos: [0, 2.3, CZ - 0.2], look: [0, 2.3, BZ], fov: 44 },
    { f: 457, pos: [0.3, 1.25, CZ - 2.6], look: [0.3, 1.25, BZ], fov: 34, ease: 'easeOut' }, { f: 489, pos: [0.3, 1.25, CZ - 2.8], look: [0.3, 1.25, BZ], fov: 32 }],
  laugh: [{ f: 490, pos: [-1.2, 1.6, CZ - 4.2], look: [-1.2, 1.0, CZ + 2], fov: 60 }, { f: 573, pos: [-1.2, 1.55, CZ - 3.8], look: [-1.2, 1.0, CZ + 2], fov: 56 }],
  wrong: [{ f: 574, pos: [0.4, 1.6, CZ + 0.6], look: [1.2, 2.0, BZ], fov: 44 }, { f: 687, pos: [0.6, 1.7, CZ - 0.6], look: [1.2, 2.0, BZ], fov: 40 }],
  waited: [{ f: 688, pos: [1.6, 1.8, CZ - 1.6], look: [2.0, 1.75, CZ - 4.2], fov: 36 }, { f: 729, pos: [1.65, 1.8, CZ - 1.9], look: [2.0, 1.75, CZ - 4.2], fov: 34 }],
  turn: [{ f: 730, pos: [1.65, 1.8, CZ - 1.9], look: [2.0, 1.75, CZ - 4.2], fov: 34 }, { f: 788, pos: [1.7, 1.8, CZ - 2.2], look: [2.0, 1.8, CZ - 4.2], fov: 32 }],
  quote: [{ f: 789, pos: [1.6, 1.8, CZ - 0.8], look: [2.4, 1.7, CZ - 4.2], fov: 44 }, { f: 981, pos: [1.8, 1.8, CZ - 1.4], look: [2.4, 1.75, CZ - 4.2], fov: 42 }],
  world: [{ f: 982, pos: [1.7, 1.8, CZ - 2.0], look: [2.0, 1.8, CZ - 4.2], fov: 34 }, { f: 1166, pos: [1.8, 1.85, CZ - 2.6], look: [2.0, 1.85, CZ - 4.2], fov: 30 }],
  silent: [{ f: 1167, pos: [-3, 2.6, CZ - 3.6], look: [0.5, 1.2, CZ + 3], fov: 54 }, { f: 1216, pos: [-2.6, 2.5, CZ - 3.4], look: [0.5, 1.2, CZ + 3], fov: 52 }],
  twist: [{ f: 1217, pos: [0, 2.3, CZ + 0.4], look: [0, 2.3, BZ], fov: 46 }, { f: 1471, pos: [0, 2.3, CZ - 0.2], look: [0, 2.3, BZ], fov: 44 }],
  lesson: [{ f: 1472, pos: [0.8, 2.0, CZ + 0.6], look: [0.6, 2.0, BZ], fov: 46 }, { f: 1556, pos: [0.9, 2.0, CZ - 0.2], look: [0.6, 2.0, BZ], fov: 44 }],
  end: [{ f: 1557, pos: [-1.0, 1.4, CZ + 2.8], look: [-1.2, 1.25, CZ + 0.65], fov: 40 }, { f: 1675, pos: [-1.05, 1.4, CZ + 2.4], look: [-1.2, 1.3, CZ + 0.65], fov: 36 }],
};
const KICKS = [{ f: 457, a: 0.03 }, { f: 490, a: 0.02 }, { f: 1250, a: 0.05 }];
const FLASH = [1217];
export const camAt = (f) => { const S = shotAt(f); const c = camFromKeys(CAMS[S.id], f, { kicks: KICKS }); c.flash = 0; for (const a of FLASH) if (f >= a && f < a + 6) c.flash = (1 - (f - a) / 6) * 0.5; return c; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = { n1: [-1.2, 1.0, NZ - 1.0], n2: [0, 0.9, NZ - 3.55], n4: [-1.55, 1.2, NZ - 1.0], h3a: [0.2, 1.1, CZ - 2.6], h3b: [0.2, 1.25, CZ - 2.6], h3c: [0.2, 1.0, CZ - 2.6], h3d: [0.2, 1.2, CZ - 2.6], hq: [0.2, 1.4, CZ - 2.6], hook: [1.05, 1.7, CZ - 4.45], waited: [2.0, 1.75, CZ - 4.2], turn: [2.0, 1.8, CZ - 4.2], world: [2.0, 1.8, CZ - 4.2], quote: [2.4, 1.7, CZ - 4.2], end: [-1.2, 1.25, CZ + 0.65], laugh: [0, 1.1, CZ + 1] };
export const dofAt = (f) => { const S = shotAt(f), C = camAt(f); if (FOCUS[S.id]) return { focus: dist(C.pos, FOCUS[S.id]), cinf: 7 }; return { focus: 30, cinf: 0 }; };

// rows on the board over time
const ROWT = [145, 206, 271, 350, 360, 370, 380, 390, 398, 457];
export const worldAt = (f) => { const S = shotAt(f); if (/^n\d$/.test(S.id)) return { lift: 0, fall: 0, space: false, board: { rows: 10, red: true, stamp: 0 }, checks: S.id === 'n3' ? Math.min(9, Math.max(0, Math.floor((f - 5124) / 4))) : 9 }; let rows = S.id === 'hook' || S.id === 'walk' ? 0 : ROWT.filter((t) => f >= t).length;
  return { lift: 0, fall: 0, space: false, board: { rows, red: f >= 470 && S.id !== 'hook' && S.id !== 'walk', stamp: S.id === 'twist' && f >= 1250 ? Math.max(1, 2.2 - 1.2 * E.easeOut(ramp(f, 1250, 1258))) : 0 } }; };

const KIDS = ['civA', 'civB', 'civC', { tunic: '#e86a3a', skin: '#c99067', hair: '#1e1714' }, { tunic: '#5ab85a', skin: '#f5c9a0', hair: '#7a4a26', dress: '#e8a0c0' }, 'workB', { tunic: '#8ab8e8', skin: '#ecd0b6', hair: '#3b2a20' }, 'civA'];
const R = (T, who, o, pos, extra = {}) => ({ key: (typeof who === 'string' ? who : who.tunic) + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), headTilt: q(I.headTilt, 1), tilt: q(I.tilt * 0.6, 1), ...o }; };
const PROF_AT = (f) => { const S = shotAt(f); if (S.id === 'hook') return [1.05, CZ - 4.45]; if (S.id === 'walk') return [lerp(3.4, 1.65, E.smooth(ramp(f, 2500, 2595))), CZ - 4.2]; if (S.id === 'enter') return [lerp(5.5, 2.0, E.smooth(ramp(f, 10, 120))), CZ - 4.0]; if (S.id === 'board') return [1.65, CZ - 4.3]; return [2.0, CZ - 4.2]; };

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], id = S.id;
  if (id.startsWith('h3')) return out;
  if (id[0] === 'n' && /^n\d$/.test(id)) {
    for (let i = 0; i < 9; i++) out.push({ key: 'baby' + i + '_' + (Math.floor(f / 3) % 20), draw: (p) => babyCard(p, { i, t: f }), x: -4.0 + i * 1.0, y: 0.74, z: NZ - 3.55, s: 0.34, ground: undefined, blob: false });
    if (id !== 'n3') { const t = f - 5000;
      const shock = id === 'n4' && f >= 5178, o = life(f, 11, { expr: id === 'n1' ? (t < 40 ? 'smile' : 'neutral') : shock ? (f < 5215 ? 'shock' : 'nervous') : 'neutral', look: id === 'n1' && t < 40 ? -0.7 : 0,
        L: shock && f < 5215 ? 'temple' : 'hang', R: id === 'n1' && t >= 40 ? 'point' : shock && f >= 5215 ? 'cheek' : 'hang', swirl: f * 0.3 });
      out.push(R(T, 'host', o, [-1.55, 0, NZ - 1.0], { s: 0.92, ground: 0 })); }
    return out;
  }
  if (id === 'hq') {
    const t = f - 3000, o = life(f, 11, { expr: t < 75 ? 'smile' : 'grin', look: t < 40 ? -0.6 : 0, L: 'hang', R: t >= 95 && t < 165 ? 'wave' : t >= 170 ? 'thumb' : 'hang', wv: (t - 95) * 0.45 });
    out.push(R(T, 'host', o, [0.2, 0, CZ - 2.6], { s: 0.9, ground: 0 }));
    const po = { seed: 6, expr: 'smile', blink: blinkAt(f, 6), L: 'hang', R: 'hang', bob: q(idle(f, 6).bob, 3) };
    out.push({ key: 'prof' + JSON.stringify(po), draw: (p) => profCard(p, T, po), x: 1.7, y: 0, z: CZ - 4.3, ground: 0 });
    return out;
  }
  // students (always seated behind their desks; hidden in board close-ups)
  if (!['board', 'twist', 'hook'].includes(id)) for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const i = r * 4 + c; if (i >= 8 + (r === 2 ? 0 : 0) && r === 2 && c > 1) continue;
    const laughing = (id === 'laugh' || (id === 'wrong' && f < 620)), quiet = ['quote', 'world', 'silent'].includes(id);
    const o = life(f, 60 + i, { expr: laughing ? 'laugh' : quiet ? (i % 2 ? 'nervous' : 'neutral') : i % 3 ? 'smile' : 'neutral', L: laughing && i % 2 ? 'belly' : 'hang', R: laughing && i % 3 === 0 ? 'point' : 'hang',
      bob: laughing ? q(0.012 * Math.abs(Math.sin(f * 0.7 + i)), 3) : q(idle(f, 60 + i).bob, 3) });
    if (id === 'end' && i === 1) { o.expr = f > 1640 ? 'grin' : 'smile'; o.R = f > 1645 ? 'thumb' : 'hang'; }
    if (i === 1 && ['silent', 'quote', 'world'].includes(id)) o.expr = 'smile';
    out.push(R(T, i === 1 ? 'host' : KIDS[i % 8], o, [-3.6 + c * 2.4, 0, CZ + 0.2 + r * 2.0 + 0.45], { s: 0.72, ground: 0 })); }
  // professor
  const [px, pz] = PROF_AT(f);
  const facing = id === 'board' ? 0 : 0, write = id === 'board' && f < 470;
  const expr = id === 'hook' ? (f >= HOOK_SMUG ? 'scheme' : 'neutral') : id === 'board' ? (f < 470 ? 'neutral' : 'smile') : id === 'wrong' || id === 'waited' ? 'neutral' : ['turn', 'quote', 'world', 'lesson'].includes(id) ? (f > 1080 && id === 'world' ? 'grin' : 'smile') : 'smile';
  const po = { seed: 6, expr, blink: blinkAt(f, 6), L: write ? 'up' : id === 'quote' ? 'hip' : 'hang', R: id === 'world' && f > 1029 ? 'point' : id === 'quote' ? 'hip' : 'hang', bob: q(idle(f, 6).bob, 3), facing, step: id === 'enter' && f < 120 ? q(walk(f, 10, 1.0, 0.6).phase, 1) : id === 'walk' && f < 2595 ? q(walk(f, 2500, 1.0, 0.6).phase, 1) : 0 };
  if (id !== 'end' && id !== 'laugh' && id !== 'silent' || id === 'silent') out.push({ key: 'prof' + JSON.stringify(po), draw: (p) => profCard(p, T, po), x: px, y: 0, z: pz, ground: 0 });
  return out;
};

const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 8, ...extra });
const front = (C, d) => { const fx = C.look[0] - C.pos[0], fy = C.look[1] - C.pos[1], fz = C.look[2] - C.pos[2], L = Math.hypot(fx, fy, fz); return [C.pos[0] + fx / L * d, C.pos[1] + fy / L * d, C.pos[2] + fz / L * d]; };
const hudWord = (out, C, t, col, k, dy, size = 130) => { const d = 1.6, s = 0.38, P = front(C, d); out.push(FX('w' + t + q(k, 1), (p) => { const g = p.g; g.save(); g.translate(300, 500); g.scale(k, k); g.translate(-300, -500); wordCard(p, { t, col, size, rot: -0.06 }); g.restore(); }, [P[0], P[1] - 0.5 * 2.25 * s + dy, P[2]], s, { order: 9 })); };
export const fxAt = (f, T) => {
  const S = shotAt(f), C = camAt(f), out = [], pop = (a) => E.back(ramp(f, a, a + 8), 2.2);
  if (S.id === 'n4' && f >= 5184) { const P = front(C, 1.6), s = 0.26 * pop(5184); out.push(FX('nine', (p) => bigNum(p, { t: '9 ?!' }), [P[0] + 0.2, P[1] + 0.22, P[2]], s, { order: 9 })); }
  if (S.id === 'laugh' || (S.id === 'wrong' && f < 620)) for (let i = 0; i < 4; i++) { const t = ((f * 0.03 + i * 0.27) % 1); out.push(FX('ha' + i, (p) => wordCard(p, { t: i % 2 ? 'HA HA!' : 'LOL', col: '#ffd23a', size: 110, rot: i % 2 ? 0.15 : -0.15 }), [-3 + i * 2, 2.0 + t * 0.6, CZ + 0.8 + (i % 2) * 2], 0.6, { alpha: Math.sin(t * Math.PI) })); }
  if (S.id === 'quote') { const P = front(C, 1.7), s = 0.42; out.push(FX('tally' + (f >= 883), (p) => tallyCard(p, { dim: false }), [P[0], P[1] - 0.45 * 2.25 * s + 0.22, P[2]], s * (f >= 789 ? 1 : 0), { order: 9 })); }
  if (S.id === 'twist') { if (f >= 1318) hudWord(out, C, 'NO DATE', '#ffffff', pop(1318), -0.34, 80); if (f >= 1344) hudWord(out, C, 'NO SCHOOL', '#ffffff', pop(1344), -0.46, 80); if (f >= 1370) hudWord(out, C, 'NO STUDENT', '#ffffff', pop(1370), -0.58, 80);
    if (f >= 1419) hudWord(out, C, 'INTERNET LEGEND', '#ffd23a', pop(1419), 0.26, 62); }
  if (S.id === 'lesson' && f >= 1505) hudWord(out, C, 'THE LESSON IS REAL', '#7ad85a', pop(1505), 0.3, 56);
  if (S.id === 'end' && f >= 1640) { const P = front(C, 1.6), s = 0.36; out.push(FX('tallyE', (p) => tallyCard(p, { dim: true }), [P[0] - 0.08, P[1] - 0.12, P[2]], s * pop(1640), { order: 9 })); }
  return out;
};

// ---------- 3D host test (frames 4000-4245) ----------
const sm = (x) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
const span = (t, a, b) => sm((t - a) / (b - a));
const blinkK = (t, at) => { const d = Math.abs(t - at); return d < 4 ? 1 - d / 4 : 0; };
export const host3dAt = (f) => {
  const id = shotAt(f).id; if (!id.startsWith('h3')) return null;
  const t = f - 4000, br = Math.sin(t * 0.13);
  const P = { x: 0.2, z: CZ - 2.6, yaw: 0, bounce: 0.006 * br, sway: 0.015 * Math.sin(t * 0.07), headZ: 0.03 * Math.sin(t * 0.09), headX: 0, headY: 0,
    eyeScale: 1, pupil: 1, blink: Math.max(blinkK(t, 30), blinkK(t, 150), blinkK(t, 196)), lookX: 0, lookY: 0,
    mouth: 'smile', open: 0, mw: 1, brow: [0, 0], browY: 0, squash: 1,
    armL: { out: 0.14, fwd: -0.05, bend: 0.12 }, armR: { out: 0.14, fwd: -0.05, bend: 0.12 }, legL: {}, legR: {} };
  if (t < 45) { // hello: looks over, then at us
    const k = span(t, 8, 22); P.lookX = -0.9 * (1 - k); P.headY = -0.35 * (1 - k); P.mw = 0.9;
    P.brow = [6 * k, 2 * k];
  } else if (t < 105) { // SHOCK: anticipation squash, stretch, eyes pop
    const a = span(t, 45, 49), b = span(t, 49, 55), c = span(t, 55, 66);
    P.squash = 1 - 0.09 * a * (1 - b) + 0.1 * b * (1 - c) + 0.02 * c;
    const pop = span(t, 48, 54); P.eyeScale = 1 + 0.5 * pop - 0.08 * span(t, 54, 64); P.pupil = 1 - 0.35 * pop;
    P.browY = 46 * pop; P.brow = [24 * pop, 8 * pop]; P.mouth = 'O'; P.open = 0.85 * pop; P.headX = -0.12 * pop; P.blink = 0;
    const up = span(t, 47, 56); P.armL = { out: 0.14 + 0.5 * up, fwd: -0.05 - 0.9 * up, bend: 0.12 + 1.5 * up, bendF: -0.6 * up }; P.armR = { ...P.armL };
    P.bounce += 0.03 * b * (1 - c);
    P.lookY = 0.2 * pop; P.headZ += 0.02 * Math.sin(t * 1.3) * pop; // trembling
  } else if (t < 165) { // LAUGH: head back, shoulders bounce
    const k = span(t, 105, 112), sh = Math.abs(Math.sin((t - 105) * 0.55));
    P.mouth = 'laugh'; P.open = 0.6 + 0.35 * sh; P.mw = 1.35; P.blink = 0.7 * k; P.brow = [14, -4]; P.browY = 10;
    P.headX = -0.28 * k + 0.05 * sh; P.bounce += 0.018 * sh * k; P.lean = -0.06 * k; P.squash = 1 + 0.025 * sh;
    P.armL = { out: 0.3, fwd: -0.35, bend: -1.45, bendF: -0.3 }; P.armR = { out: 0.3, fwd: -0.35, bend: -1.45, bendF: -0.3 }; // hands on belly
  } else { // GRIN + wave, then thumbs up and a wink
    const k = span(t, 165, 172); P.mouth = 'grin'; P.open = 0.35; P.mw = 1.05; P.brow = [10, 0]; P.browY = 6;
    if (t < 205) { const w = Math.sin((t - 165) * 0.45); P.armR = { out: 0.14 + 2.35 * k, fwd: -0.15, bend: -0.5 * k - 0.35 * w * k, wrist: 0.25 * w }; P.headZ += 0.05 * w * k; }
    else { const u = span(t, 205, 213); P.armR = { out: 0.4 - 0.15 * u, fwd: -0.05 - 0.95 * u, bend: 0.12, bendF: -1.6 * u, thumbUp: u > 0.5 };
      P.blinkR = span(t, 214, 218) * (1 - span(t, 232, 236)); P.squash = 1 + 0.03 * span(t, 205, 209) * (1 - span(t, 209, 216)); P.headZ += -0.08 * u; }
  }
  return P;
};
