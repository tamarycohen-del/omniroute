// "Einstein Wrote 9 x 10 = 91 on Purpose... Or Did He?" Timed to voice.mp3 (ElevenLabs Ethan, 55.84 s, 1676 frames @30).
import { M as E, camFromKeys, idle, blinkAt, walk, q, clamp, lerp, ramp } from './motion.js';
import { profCard, wordCard, tallyCard } from './props_ein.js';
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
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const CZ = -1200, BZ = CZ - 4.82;

export const LIGHTS = {
  class: { az: 20, el: 40, sky: '#fff4e0', ground: '#7a5a3a', hemi: 1.4, sun: '#fff0d8', sunI: 1.6, fog: '#e8dcc0', fogNear: 60, fogFar: 200,
    skyTop: '#bfe0f8', skyHor: '#e8f2fa', sat: 1.1, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.24, shadowExt: 10 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });

const CAMS = {
  enter: [{ f: 0, pos: [0.4, 2.3, CZ + 5.6], look: [0.6, 1.8, BZ], fov: 50 }, { f: 144, pos: [0.4, 2.1, CZ + 4.6], look: [0.6, 2.0, BZ], fov: 46 }],
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
const FOCUS = { waited: [2.0, 1.75, CZ - 4.2], turn: [2.0, 1.8, CZ - 4.2], world: [2.0, 1.8, CZ - 4.2], quote: [2.4, 1.7, CZ - 4.2], end: [-1.2, 1.25, CZ + 0.65], laugh: [0, 1.1, CZ + 1] };
export const dofAt = (f) => { const S = shotAt(f), C = camAt(f); if (FOCUS[S.id]) return { focus: dist(C.pos, FOCUS[S.id]), cinf: 7 }; return { focus: 30, cinf: 0 }; };

// rows on the board over time
const ROWT = [145, 206, 271, 350, 360, 370, 380, 390, 398, 457];
export const worldAt = (f) => { let rows = ROWT.filter((t) => f >= t).length; const S = shotAt(f);
  return { lift: 0, fall: 0, space: false, board: { rows, red: f >= 470, stamp: S.id === 'twist' && f >= 1250 ? Math.max(1, 2.2 - 1.2 * E.easeOut(ramp(f, 1250, 1258))) : 0 } }; };

const KIDS = ['civA', 'civB', 'civC', { tunic: '#e86a3a', skin: '#c99067', hair: '#1e1714' }, { tunic: '#5ab85a', skin: '#f5c9a0', hair: '#7a4a26', dress: '#e8a0c0' }, 'workB', { tunic: '#8ab8e8', skin: '#ecd0b6', hair: '#3b2a20' }, 'civA'];
const R = (T, who, o, pos, extra = {}) => ({ key: (typeof who === 'string' ? who : who.tunic) + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), headTilt: q(I.headTilt, 1), tilt: q(I.tilt * 0.6, 1), ...o }; };
const PROF_AT = (f) => { const S = shotAt(f); if (S.id === 'enter') return [lerp(5.5, 2.0, E.smooth(ramp(f, 10, 120))), CZ - 4.0]; if (S.id === 'board') return [1.65, CZ - 4.3]; return [2.0, CZ - 4.2]; };

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], id = S.id;
  // students (always seated behind their desks; hidden in board close-ups)
  if (!['board', 'twist'].includes(id)) for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const i = r * 4 + c; if (i >= 8 + (r === 2 ? 0 : 0) && r === 2 && c > 1) continue;
    const laughing = (id === 'laugh' || (id === 'wrong' && f < 620)), quiet = ['quote', 'world', 'silent'].includes(id);
    const o = life(f, 60 + i, { expr: laughing ? 'laugh' : quiet ? (i % 2 ? 'nervous' : 'neutral') : i % 3 ? 'smile' : 'neutral', L: laughing && i % 2 ? 'belly' : 'hang', R: laughing && i % 3 === 0 ? 'point' : 'hang',
      bob: laughing ? q(0.012 * Math.abs(Math.sin(f * 0.7 + i)), 3) : q(idle(f, 60 + i).bob, 3) });
    if (id === 'end' && i === 1) { o.expr = f > 1640 ? 'grin' : 'smile'; o.R = f > 1645 ? 'thumb' : 'hang'; }
    if (i === 1 && ['silent', 'quote', 'world'].includes(id)) o.expr = 'smile';
    out.push(R(T, i === 1 ? 'host' : KIDS[i % 8], o, [-3.6 + c * 2.4, 0, CZ + 0.2 + r * 2.0 + 0.45], { s: 0.72, ground: 0 })); }
  // professor
  const [px, pz] = PROF_AT(f);
  const facing = id === 'board' ? 0 : 0, write = id === 'board' && f < 470;
  const expr = id === 'board' ? (f < 470 ? 'neutral' : 'smile') : id === 'wrong' || id === 'waited' ? 'neutral' : ['turn', 'quote', 'world', 'lesson'].includes(id) ? (f > 1080 && id === 'world' ? 'grin' : 'smile') : 'smile';
  const po = { seed: 6, expr, blink: blinkAt(f, 6), L: write ? 'up' : id === 'quote' ? 'hip' : 'hang', R: id === 'world' && f > 1029 ? 'point' : id === 'quote' ? 'hip' : 'hang', bob: q(idle(f, 6).bob, 3), facing, step: id === 'enter' && f < 120 ? q(walk(f, 10, 1.0, 0.6).phase, 1) : 0 };
  if (id !== 'end' && id !== 'laugh' && id !== 'silent' || id === 'silent') out.push({ key: 'prof' + JSON.stringify(po), draw: (p) => profCard(p, T, po), x: px, y: 0, z: pz, ground: 0 });
  return out;
};

const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 8, ...extra });
const front = (C, d) => { const fx = C.look[0] - C.pos[0], fy = C.look[1] - C.pos[1], fz = C.look[2] - C.pos[2], L = Math.hypot(fx, fy, fz); return [C.pos[0] + fx / L * d, C.pos[1] + fy / L * d, C.pos[2] + fz / L * d]; };
const hudWord = (out, C, t, col, k, dy, size = 130) => { const d = 1.6, s = 0.38, P = front(C, d); out.push(FX('w' + t + q(k, 1), (p) => { const g = p.g; g.save(); g.translate(300, 500); g.scale(k, k); g.translate(-300, -500); wordCard(p, { t, col, size, rot: -0.06 }); g.restore(); }, [P[0], P[1] - 0.5 * 2.25 * s + dy, P[2]], s, { order: 9 })); };
export const fxAt = (f, T) => {
  const S = shotAt(f), C = camAt(f), out = [], pop = (a) => E.back(ramp(f, a, a + 8), 2.2);
  if (S.id === 'laugh' || (S.id === 'wrong' && f < 620)) for (let i = 0; i < 4; i++) { const t = ((f * 0.03 + i * 0.27) % 1); out.push(FX('ha' + i, (p) => wordCard(p, { t: i % 2 ? 'HA HA!' : 'LOL', col: '#ffd23a', size: 110, rot: i % 2 ? 0.15 : -0.15 }), [-3 + i * 2, 2.0 + t * 0.6, CZ + 0.8 + (i % 2) * 2], 0.6, { alpha: Math.sin(t * Math.PI) })); }
  if (S.id === 'quote') { const P = front(C, 1.7), s = 0.42; out.push(FX('tally' + (f >= 883), (p) => tallyCard(p, { dim: false }), [P[0], P[1] - 0.45 * 2.25 * s + 0.22, P[2]], s * (f >= 789 ? 1 : 0), { order: 9 })); }
  if (S.id === 'twist') { if (f >= 1318) hudWord(out, C, 'NO DATE', '#ffffff', pop(1318), -0.34, 80); if (f >= 1344) hudWord(out, C, 'NO SCHOOL', '#ffffff', pop(1344), -0.46, 80); if (f >= 1370) hudWord(out, C, 'NO STUDENT', '#ffffff', pop(1370), -0.58, 80);
    if (f >= 1419) hudWord(out, C, 'INTERNET LEGEND', '#ffd23a', pop(1419), 0.26, 62); }
  if (S.id === 'lesson' && f >= 1505) hudWord(out, C, 'THE LESSON IS REAL', '#7ad85a', pop(1505), 0.3, 56);
  if (S.id === 'end' && f >= 1640) { const P = front(C, 1.6), s = 0.36; out.push(FX('tallyE', (p) => tallyCard(p, { dim: true }), [P[0] - 0.08, P[1] - 0.12, P[2]], s * pop(1640), { order: 9 })); }
  return out;
};
