// "The Warship That Sank Before It Left the Harbor" — M-Play Zone pilot. Timed to voice.mp3 (65.96 s, 1979 frames @30).
// Phrase frames: see work/phrases.json. One shot per phrase (merged where short).
import { M as E, camFromKeys, idle, blinkAt, walk, q, clamp, lerp, ramp } from './motion.js';
export const FPS = 30, TOTAL = 1979;
export const SHOTS = [
  { id: 'hook', a: 0, b: 127, light: 'day' },
  { id: 'spoiler', a: 128, b: 200, light: 'day' },
  { id: 'king', a: 201, b: 246, light: 'day' },
  { id: 'cannons', a: 247, b: 304, light: 'day' },
  { id: 'gold', a: 305, b: 358, light: 'day' },
  { id: 'decks', a: 359, b: 405, light: 'day' },
  { id: 'argue', a: 406, b: 483, light: 'day' },
  { id: 'weight', a: 484, b: 601, light: 'day' },
  { id: 'test', a: 602, b: 664, light: 'day' },
  { id: 'run', a: 665, b: 766, light: 'day' },
  { id: 'rock', a: 767, b: 856, light: 'day' },
  { id: 'stop', a: 857, b: 911, light: 'day' },
  { id: 'bold', a: 912, b: 1005, light: 'day' },
  { id: 'crowd', a: 1006, b: 1094, light: 'golden' },
  { id: 'salute', a: 1095, b: 1146, light: 'golden' },
  { id: 'sails', a: 1147, b: 1180, light: 'golden' },
  { id: 'lean', a: 1181, b: 1280, light: 'golden' },
  { id: 'gust', a: 1281, b: 1421, light: 'golden' },
  { id: 'voyage', a: 1422, b: 1542, light: 'golden' },
  { id: 'bottom', a: 1543, b: 1637, light: 'deep' },
  { id: 'perfect', a: 1638, b: 1728, light: 'deep' },
  { id: 'museum', a: 1729, b: 1844, light: 'museum' },
  { id: 'trip', a: 1845, b: 1978, light: 'museum' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const DECK = 2, SDECK = 4.9, HALL = 0.6, MX = 800;

// ---------- lights ----------
export const LIGHTS = {
  day: { az: 140, el: 42, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 90, fogFar: 1100,
    skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.1, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.2, shadowExt: 30 },
  golden: { az: 20, el: 14, sky: '#9a90c8', ground: '#6a4c40', hemi: 1.05, sun: '#ffb46c', sunI: 2.8, fog: '#f0b88c', fogNear: 90, fogFar: 900,
    skyTop: '#6f6eb0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', waterDeep: '#3d5a86', waterShal: '#d99a6e',
    glint: '#ffe2a8', vig: 0.26, shadowExt: 34 },
  deep: { az: 150, el: 72, sky: '#5fb8c8', ground: '#0d2a30', hemi: 1.35, sun: '#bfe8ff', sunI: 1.1, fog: '#155b66', fogNear: 6, fogFar: 85,
    skyTop: '#1b5c6a', skyHor: '#1b5c6a', sat: 1.0, waterDeep: '#3f9fb0', waterShal: '#8fe0ee', glint: '#e8fdff', vig: 0.42, shadowExt: 40, lift: '#020b10' },
  museum: { az: 70, el: 74, sky: '#ffe2b8', ground: '#3a2a40', hemi: 1.45, sun: '#ffe6c0', sunI: 1.5, fog: '#2a2230', fogNear: 70, fogFar: 300,
    skyTop: '#2a2230', skyHor: '#2a2230', sat: 1.08, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.3, shadowExt: 45 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------- ship pose (shared by the world and by actors standing on deck) ----------
const cross = (f) => { // sailors' side of the deck, -1..1, three crossings of 30 frames each way
  const t = (f - 672) / 30; if (t <= 0) return -1; const k = Math.floor(t), u = t - k;
  const s = E.smooth(u) * 2 - 1; return k % 2 ? -s : s; };
const rockAmp = (f) => lerp(0.035, 0.17, E.smooth(ramp(f, 680, 850)));
export const poseAt = (f) => {
  const S = shotAt(f);
  const P = { x: 0, z: 0, sink: 0, roll: 0, pitch: 0 };
  switch (S.id) {
    case 'spoiler': return { ...P, x: 30, sink: 19, roll: -0.2 };
    case 'weight': {
      let roll = 0, sink = 0;
      for (let i = 0; i < 4; i++) { const land = 519 + i * 18.7; if (f >= land) { sink += 0.18; const d = f - land; roll += (i === 3 ? 0.07 : 0.045) * Math.exp(-d / 14) * Math.sin(d * 0.55); } }
      return { ...P, sink, roll };
    }
    case 'run': case 'rock': { const lag = cross(f - 9); return { ...P, roll: rockAmp(f) * lag }; }
    case 'stop': { const k = 1 - E.smooth(ramp(f, 857, 905)); return { ...P, roll: rockAmp(856) * cross(f - 9) * k }; }
    case 'bold': return { ...P, roll: 0.012 * Math.sin(f * 0.12) };
    case 'crowd': case 'salute': case 'sails': return { ...P, x: 2, roll: 0.01 * Math.sin(f * 0.1) };
    case 'lean': { const lean = f < 1219 ? 0 : f < 1238 ? E.easeOut(ramp(f, 1219, 1238)) : 1 - E.smooth(ramp(f, 1246, 1268));
      return { ...P, x: 2 + (f - 1181) * 0.05, roll: -0.26 * lean + 0.01 * Math.sin(f * 0.1) }; }
    case 'gust': { const x = 2 + (f - 1181) * 0.05, a = E.easeIn(ramp(f, 1300, 1338)), b = E.smooth(ramp(f, 1340, 1421));
      return { ...P, x, roll: -(0.85 * a + 0.32 * b), sink: 3.2 * b }; }
    case 'voyage': { const t = ramp(f, 1422, 1535); return { ...P, x: 2 + (f - 1181) * 0.05, roll: -lerp(1.17, 0.95, E.smooth(t)), sink: lerp(3.2, 32, Math.pow(t, 3)) }; }
    case 'bottom': case 'perfect': return { ...P, x: 40, sink: 26, roll: -0.14, pitch: 0.03 };
  }
  return P;
};
const shipPt = (P, lx, ly, lz) => { const c = Math.cos(P.roll), s = Math.sin(P.roll); return [P.x + lx, ly * c - lz * s - P.sink, P.z + ly * s + lz * c]; };

// ---------- cameras ----------
const CAMS = {
  hook: [
    { f: 0, pos: [-36.3, 3.95, 1.5], look: [-31.5, 3.82, 0.8], fov: 34 },
    { f: 40, pos: [-36.5, 4.0, 1.5], look: [-31.5, 3.85, 0.8], fov: 33 },
    { f: 112, pos: [-50, 13.5, -24], look: [-6, 8.5, 5], fov: 52, ease: 'smooth' },
    { f: 127, pos: [-50.5, 13.8, -24.5], look: [-6, 8.6, 5], fov: 51 },
  ],
  spoiler: [{ f: 128, pos: [-31.6, 3.6, -4.2], look: [28, 4.5, 1], fov: 30 }, { f: 200, pos: [-31.2, 3.55, -4.0], look: [28, 4.2, 1], fov: 26 }],
  king: [{ f: 201, pos: [-37.6, 3.7, -2.2], look: [-32, 3.95, 0.5], fov: 38 }, { f: 246, pos: [-37.0, 3.65, -2.0], look: [-32, 4.0, 0.5], fov: 33 }],
  cannons: [{ f: 247, pos: [12, 3.0, 13.5], look: [12, 2.9, 4], fov: 40 }, { f: 304, pos: [-5, 3.1, 13.0], look: [-5, 2.9, 4], fov: 38 }],
  gold: [{ f: 305, pos: [-31, 6.6, 3.2], look: [-20, 6.1, 0], fov: 36 }, { f: 358, pos: [-27.2, 6.4, 1.4], look: [-20, 6.1, 0], fov: 31, roll: 2 }],
  decks: [{ f: 359, pos: [-2, 3.4, 15], look: [-2, 3.1, 4], fov: 40 }, { f: 400, pos: [5, 8, 47], look: [0, 4.5, 0], fov: 46, ease: 'easeOut' }, { f: 405, pos: [5.1, 8.1, 47.3], look: [0, 4.5, 0], fov: 46 }],
  argue: [{ f: 406, pos: [-38.2, 3.75, -2.8], look: [-32, 3.45, 0.4], fov: 40 }, { f: 483, pos: [-37.4, 3.7, -2.5], look: [-32, 3.5, 0.4], fov: 36 }],
  weight: [{ f: 484, pos: [44, 12.5, 9], look: [0, 6.0, 0], fov: 27 }, { f: 601, pos: [35, 11.2, 7.4], look: [0, 5.8, 0], fov: 25 }],
  test: [{ f: 602, pos: [13, 8.6, 6.5], look: [-2, 6.0, -1], fov: 46 }, { f: 664, pos: [12.2, 8.4, 6.0], look: [-2, 6.0, -1], fov: 44 }],
  run: [{ f: 665, pos: [14, 9.2, 9], look: [0, 5.6, 0], fov: 50 }, { f: 766, pos: [13, 9.0, 8.4], look: [0, 5.6, 0], fov: 48 }],
  rock: [{ f: 767, pos: [36, 10.5, 7.5], look: [0, 7.0, 0], fov: 36 }, { f: 856, pos: [31, 10.0, 6.5], look: [0, 7.0, 0], fov: 34 }],
  stop: [{ f: 857, pos: [-1.2, 7.05, 3.6], look: [-6, 6.75, 0], fov: 38 }, { f: 911, pos: [-1.6, 7.0, 3.3], look: [-6, 6.8, 0], fov: 35 }],
  bold: [{ f: 912, pos: [-1.6, 7.0, 3.3], look: [-6, 6.8, 0], fov: 35 }, { f: 975, pos: [-2.6, 6.95, 2.4], look: [-6, 6.85, 0], fov: 30 }, { f: 1005, pos: [-2.9, 6.95, 2.2], look: [-6, 6.85, 0], fov: 28, roll: -3.5 }],
  crowd: [{ f: 1006, pos: [-14, 5.2, 17], look: [-33, 3.8, 0], fov: 40 }, { f: 1094, pos: [-16, 5.0, 14.5], look: [-33.5, 3.7, -1], fov: 38 }],
  salute: [{ f: 1095, pos: [12, 5, 34], look: [1, 5, 0], fov: 42 }, { f: 1146, pos: [11, 5.2, 32], look: [1, 5.2, 0], fov: 40 }],
  sails: [{ f: 1147, pos: [20, 2.2, 19], look: [2, 15, 0], fov: 54 }, { f: 1180, pos: [19, 2.3, 18], look: [2, 16, 0], fov: 52 }],
  lean: [{ f: 1181, pos: [44, 4.6, -15], look: [6, 7.2, 0], fov: 40 }, { f: 1280, pos: [45, 4.5, -14], look: [8, 7.0, 0], fov: 38 }],
  gust: [{ f: 1281, pos: [-37, 4.7, -6.5], look: [10, 6, 0], fov: 34 }, { f: 1338, pos: [-36.5, 4.6, -6.2], look: [11, 4.5, 0], fov: 30 }, { f: 1421, pos: [-36, 4.5, -6], look: [12, 2.8, 0], fov: 26, roll: 2.5 }],
  voyage: [{ f: 1422, pos: [-14, 28, 40], look: [11, 1, -8], fov: 44 }, { f: 1542, pos: [-9, 24, 35], look: [13, 0, -7], fov: 40 }],
  bottom: [{ f: 1543, pos: [78, -22, -28], look: [40, -24.5, 0], fov: 50 }, { f: 1637, pos: [72, -23, -30], look: [40, -24.5, 0], fov: 46 }],
  perfect: [{ f: 1638, pos: [7, -18.5, -6], look: [20, -20.5, -0.8], fov: 42 }, { f: 1728, pos: [12.5, -19.4, -2.6], look: [20, -20.6, -0.8], fov: 34 }],
  museum: [{ f: 1729, pos: [MX + 26, 7, 42], look: [MX, 10, 0], fov: 54 }, { f: 1844, pos: [MX + 14, 4.4, 33], look: [MX - 2, 8, 0], fov: 48 }],
  trip: [{ f: 1845, pos: [MX - 1.4, 2.7, 19.6], look: [MX - 4, 2.45, 14], fov: 36 }, { f: 1950, pos: [MX - 1.9, 2.6, 18.9], look: [MX - 4, 2.4, 14], fov: 31 }, { f: 1978, pos: [MX - 2.2, 2.3, 18.6], look: [MX - 4, 1.6, 14], fov: 30, roll: 4 }],
};
const KICKS = [
  { f: 219, a: 0.03 }, ...Array.from({ length: 8 }, (_, i) => ({ f: 252 + i * 6, a: 0.008 })),
  ...[519, 537, 556, 575].map((f) => ({ f, a: 0.03 })), { f: 872, a: 0.03 }, { f: 981, a: 0.02 },
  ...[1099, 1106, 1113, 1120, 1127].map((f) => ({ f, a: 0.025 })), { f: 1309, a: 0.04 }, { f: 1354, a: 0.03 }, { f: 1953, a: 0.05 },
];
const FLASH = [128, 201, 1006, 1543, 1729];
export const camAt = (f) => {
  const S = shotAt(f);
  const c = camFromKeys(CAMS[S.id], f, { kicks: KICKS });
  c.flash = 0; for (const a of FLASH) if (f >= a && f < a + 6) c.flash = (1 - (f - a) / 6) * 0.85;
  if (S.id === 'voyage' || S.id === 'bottom') c.shadowAt = [S.id === 'voyage' ? 12 : 40, S.id === 'voyage' ? 0 : -26, 0];
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f), P = poseAt(f);
  switch (S.id) {
    case 'hook': return { focus: dist(C.pos, [-31.5, 3.85, 0.8]), cinf: lerp(11, 0, E.smooth(ramp(f, 45, 100))) };
    case 'spoiler': return { focus: dist(C.pos, [30, 6, 0]), cinf: 5, near: 1 };
    case 'king': case 'argue': return { focus: dist(C.pos, [-32, 3.9, 0.5]), cinf: 10 };
    case 'cannons': return { focus: dist(C.pos, C.look), cinf: 7 };
    case 'gold': return { focus: dist(C.pos, [-20, 6, 0]), cinf: 9 };
    case 'weight': case 'rock': return { focus: dist(C.pos, [0, 6.5, 0]), cinf: 4 };
    case 'stop': case 'bold': return { focus: dist(C.pos, shipPt(P, -6, SDECK + 1.9, 0)), cinf: 11 };
    case 'crowd': return { focus: dist(C.pos, [-33, 3.7, 0]), cinf: 5 };
    case 'gust': return { focus: dist(C.pos, [-32.5, 3.8, -3]), cinf: lerp(9, 0, E.smooth(ramp(f, 1295, 1312))), near: 1 };
    case 'perfect': return { focus: dist(C.pos, [20, -20.5, -0.8]), cinf: 8 };
    case 'trip': return { focus: dist(C.pos, [MX - 4, 2.5, 14]), cinf: 12 };
  }
  return { focus: 30, cinf: 0 };
};

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), P = poseAt(f), id = S.id;
  const pre = ['king', 'argue', 'weight'].includes(id);
  const openLids = ['cannons', 'decks', 'crowd', 'salute', 'sails', 'lean', 'gust', 'voyage', 'bottom', 'perfect', 'spoiler'].includes(id);
  return {
    shipX: P.x, shipZ: P.z, sink: P.sink, roll: P.roll, pitch: P.pitch,
    scaff: pre, lids: id === 'cannons' ? E.easeOut(ramp(f, 247, 262)) : openLids ? 1 : 0,
    cannonPop: id === 'cannons' ? ramp(f, 254, 300) : 0, cannons: 1,
    sails: id === 'hook' || id === 'spoiler' ? 1 : id === 'sails' ? E.back(ramp(f, 1150, 1172), 1.2) : ['lean', 'gust', 'voyage', 'bottom', 'perfect'].includes(id) ? 1 : 0,
    crates: id === 'weight' ? ramp(f, 500, 575) : 0,
  };
};

// ---------- actors ----------
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), headTilt: q(I.headTilt, 1), tilt: q(I.tilt * 0.6, 1), ...o }; };
const CROWD = (() => { const keys = ['civA', 'civB', 'civC', 'sailorA', 'sailorB', 'workA', 'builder', 'workB', 'civB', 'civA', 'sailorC', 'civC'], out = [];
  let r = 7; const rnd = () => ((r = (r * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < keys.length; i++) out.push({ k: keys[i], seed: 50 + i, x: -30.6 - (i % 3) * 1.5 - rnd() * 0.6, z: -9 + i * 1.55 + rnd() * 0.5 }); return out; })();
const SAILORS = Array.from({ length: 9 }, (_, i) => ({ k: ['sailorA', 'sailorB', 'sailorC'][i % 3], seed: 70 + i, lx: 9 - i * 1.25, lz: (i % 2 ? 0.45 : -0.45) }));

export const actorsAt = (f, T) => {
  const S = shotAt(f), P = poseAt(f), out = [];
  const tint = S.light === 'golden' ? '#ffe2c8' : S.light === 'deep' ? '#bfe9f0' : S.light === 'museum' ? '#ffe9d0' : '#ffffff';
  const onQuay = (who, o, x, z, extra = {}) => out.push(R(T, who, o, [x, DECK, z], { ground: DECK, tint, ...extra }));
  const onDeck = (who, o, lx, lz, extra = {}) => { const w = shipPt(P, lx, SDECK, lz); out.push(R(T, who, o, w, { tint, roll: q(-P.roll * 0.9, 3), ...extra })); };
  switch (S.id) {
    case 'hook': onQuay('host', life(f, 3, { expr: f < 30 ? 'smile' : 'grin', L: f > 22 && f < 100 ? 'point' : 'hang', look: f > 22 ? 0.5 : 0, facing: f > 22 ? 1 : 0 }), -31.5, 0.8); break;
    case 'spoiler': onQuay('host', life(f, 3, { expr: f < 150 ? 'nervous' : 'shock', L: 'cheek', R: 'cheek', look: 0.6, facing: 1 }), -29.9, -2.2); break;
    case 'king': {
      const up = E.back(ramp(f, 214, 224), 2);
      onQuay('king', life(f, 5, { expr: f > 214 ? 'grin' : 'smile', L: up > 0.5 ? 'up' : 'hip', R: up > 0.5 ? 'up' : 'hip', bob: q(up > 0.5 ? 0.02 * Math.sin(f * 0.6) : 0, 3) }), -32, 0.5);
      onQuay('builder', life(f, 11, { expr: 'neutral', L: 'lift', R: 'lift', look: 0.5 }), -34.2, 3.3);
      onQuay('workA', life(f, 12, { expr: 'nervous', look: -0.4 }), -30.4, -2.6); break; }
    case 'argue': {
      const nod = f > 440 ? q(0.015 * Math.abs(Math.sin((f - 440) * 0.35)), 3) : 0;
      onQuay('king', life(f, 5, { expr: f > 440 ? 'squint' : 'stern', L: 'cross', R: 'cross' }), -32, 0.5);
      onQuay('builder', life(f, 11, { expr: 'nervous', look: 0.6, bob: nod }), -33.1, 1.7);
      onQuay('workA', life(f, 12, { expr: 'nervous', look: -0.6, bob: nod }), -31.2, -0.7); break; }
    case 'test': {
      onDeck('admiral', life(f, 21, { expr: 'stern', L: 'hip', R: 'point', facing: 1, look: 0.5 }), -6, 0);
      SAILORS.forEach((s) => onDeck(s.k, life(f, s.seed, { expr: 'neutral', look: -0.4 }), s.lx * 0.6 + 1, -3.0 + s.lz)); break; }
    case 'run': case 'rock': case 'stop': {
      const stopK = S.id === 'stop' ? E.smooth(ramp(f, 857, 875)) : 0;
      if (S.id !== 'stop') onDeck('admiral', life(f, 21, { expr: f > 800 ? 'nervous' : 'stern', L: 'hip', R: 'hip' }), -6, 0);
      else onDeck('admiral', life(f, 21, { expr: f > 870 ? 'shock' : 'nervous', L: 'up', R: 'up', bob: q(0.02 * Math.abs(Math.sin(f * 0.7)), 3) }), -6, 0);
      SAILORS.forEach((s, i) => { const side = cross(f - i * 1.2) * (1 - stopK) ; const w = walk(f, 665 + i, 3.0, 0.7);
        if (S.id === 'stop' && i > 2) return;
        onDeck(s.k, { seed: s.seed, expr: S.id === 'rock' ? 'shock' : 'grin', step: stopK > 0.9 ? 0 : q(w.phase, 2), L: 'hang', R: 'hang', tilt: q(side * 3, 1), blink: blinkAt(f, s.seed) },
          s.lx * 0.6 + 1, side * 3.0 + s.lz); });
      break; }
    case 'bold': {
      const thumb = f >= 978;
      onDeck('admiral', life(f, 21, { expr: f < 930 ? 'neutral' : 'grin', L: 'hip', R: thumb ? 'thumb' : 'hip', headTilt: q(thumb ? 6 : 0, 1) }), -6, 0);
      break; }
    case 'crowd': case 'salute': case 'gust': {
      const shock = S.id === 'gust' && f > 1312;
      CROWD.forEach((c, i) => {
        const cheer = S.id !== 'gust' || f < 1310;
        const z = S.id === 'gust' ? -c.z * 0.9 : c.z;
        onQuay(c.k, life(f, c.seed, { expr: shock ? (i % 2 ? 'shock' : 'nervous') : cheer ? (i % 3 ? 'grin' : 'laugh') : 'neutral',
          L: shock ? 'cheek' : cheer && i % 2 ? 'wave' : 'hang', R: shock ? 'cheek' : cheer && i % 3 === 0 ? 'up' : 'hang', wv: q(f * 0.4 + i, 1), facing: S.id === 'gust' ? 1 : 0, look: S.id === 'gust' ? 0.5 : 0 }), c.x, z);
      });
      onQuay('host', life(f, 3, { expr: shock ? 'shock' : 'grin', L: shock ? 'cheek' : 'wave', R: shock ? 'cheek' : 'hang', wv: q(f * 0.45, 1) }), -31.2, S.id === 'gust' ? -3.0 : 3.2);
      break; }
    case 'museum': case 'trip': {
      for (let i = 0; i < 10; i++) { const x = MX - 15 + i * 3.2 + (i % 2) * 0.8, z = 11 + (i % 3) * 2.4;
        if (S.id === 'trip' && Math.abs(x - (MX - 4)) < 2) continue;
        out.push(R(T, ['civA', 'civB', 'civC', 'workB', 'sailorB'][i % 5], life(f, 90 + i, { expr: i % 2 ? 'smile' : 'neutral', look: (i % 3 - 1) * 0.5, L: i % 4 === 0 ? 'point' : 'hang' }), [x, HALL, z], { ground: HALL, tint })); }
      const fall = S.id === 'trip' ? E.easeIn(ramp(f, 1950, 1958)) : 0;
      const host = life(f, 3, { expr: fall > 0 ? 'shock' : f > 1908 ? 'grin' : 'smile', L: S.id === 'trip' && f < 1905 ? 'point' : 'hang', facing: S.id === 'trip' && f < 1905 ? -1 : 0, look: S.id === 'trip' && f < 1905 ? -0.5 : 0,
        R: fall > 0 ? 'up' : 'hang', L2: 0 });
      if (fall > 0) host.L = 'up';
      out.push(R(T, 'host', host, [MX - 4 + fall * 0.4, HALL + fall * 0.32, 14], { ground: HALL, tint, roll: q(-fall * 1.35, 3) }));
      break; }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
const fish = (col) => (p) => { p.ell(300, 500, 120, 55, col, 10); p.poly([[190, 500], [110, 430], [110, 570]], col, 10); p.dot(380, 485, 12); };
const bubble = (p) => { p.ell(300, 500, 46, 46, '#d8f6ff55', 7); p.ell(285, 485, 12, 12, '#ffffffcc', 0); };
const gull = (p) => { p.stroke([[120, 520], [300, 580], [480, 520]], 22, '#1a1416'); p.stroke([[130, 515], [300, 572], [470, 515]], 12, '#ffffff'); };
const streak = (p) => { for (let i = 0; i < 4; i++) p.stroke([[40 + i * 30, 300 + i * 120], [560 - i * 40, 280 + i * 120]], 9, '#ffffffcc'); };
export const fxAt = (f, T) => {
  const S = shotAt(f), P = poseAt(f), out = [];
  if (S.id === 'spoiler') for (let i = 0; i < 2; i++) { const t = f * 0.02 + i * 2; out.push(FX('gull', gull, [28 + Math.sin(t) * 6, 14 + i * 2 + Math.sin(t * 2) * 0.6, Math.cos(t) * 5], 2.2)); }
  if (S.id === 'gold') { for (let i = 0; i < 6; i++) { const t = q(((f - 305) / 18 + i * 0.37) % 1, 2); out.push(FX('spark' + t, (p) => T.fxBurst(p, t, '#fff3b0', 8, 30, 160), [-20.4, 3 + (i * 1.3) % 6, -2.4 + (i * 1.7) % 4.8], 0.9)); } }
  if (S.id === 'weight') for (let i = 0; i < 4; i++) { const land = 519 + i * 18.7, d = f - land; if (d >= 0 && d < 14) { const t = q(d / 14, 2), w = shipPt(P, 20 - (0.32 + i * 0.09) * 40, SDECK + 0.2, (i % 2 ? 1 : -1) * 0.8);
    out.push(FX('dust' + t, (p) => T.fxDust(p, t, '#e8d6b8'), [w[0] + 1.5, w[1], w[2]], 2.2)); } }
  if (S.id === 'salute') for (let k = 0; k < 5; k++) { const a = 1099 + k * 7, d = f - a; if (d >= 0 && d < 30) { const t = q(d / 30, 2); for (let j = 0; j < 3; j++) {
    const x = 12 - (k * 3 + j) * 1.45; out.push(FX('smoke' + t, (p) => T.fxDust(p, t, '#f6f0e6'), [P.x + x, 3.4, 6.2 + t * 2], 2.0 + t * 1.6, { tint: '#ffe6cc' })); } } }
  if (S.id === 'lean' || (S.id === 'gust' && f < 1340)) for (let i = 0; i < 5; i++) { const t = ((f * 0.045 + i * 0.21) % 1); out.push(FX('wind', streak, [P.x - 30 + t * 60, 6 + i * 3, 9 - i * 0.5], 3.4, { alpha: Math.sin(t * Math.PI) })); }
  if (S.id === 'gust' && f >= 1336) for (let i = 0; i < 6; i++) { const t = q(((f - 1336) / 16 + i / 6) % 1, 2); const x = P.x + 10 - i * 3.6;
    out.push(FX('splash' + t, (p) => { p.g.translate(0, 130); p.g.scale(0.75, 0.75); T.fxSplash(p, t); }, [x, 0.05, -3.2], 2.4, { tint: '#ffe6cc' })); }
  if (S.id === 'voyage') for (let i = 0; i < 5; i++) { const t = q(((f - 1422) / 22 + i / 5) % 1, 2); out.push(FX('splashV' + t, (p) => { p.g.translate(0, 130); T.fxSplash(p, t); }, [P.x + 8 - i * 5, 0.05, -2], 4.5, { tint: '#ffe6cc' })); }
  if (S.id === 'bottom' || S.id === 'perfect') {
    for (let i = 0; i < 6; i++) { const t = ((f * 0.012 + i * 0.19) % 1); out.push(FX('fish' + (i % 3), fish(['#e8742a', '#f2c230', '#ff9a8a'][i % 3]), [40 + Math.cos(t * 6.28 + i) * (20 + i * 3), -22 + (i % 3) * 2.5, Math.sin(t * 6.28 + i) * (14 + i * 2)], 0.7, { tint: '#cfeff4' })); }
    for (let i = 0; i < 8; i++) { const t = ((f * 0.01 + i * 0.13) % 1); out.push(FX('bub', bubble, [S.id === 'perfect' ? 16 + (i % 4) * 2 : 30 + i * 3, -28 + t * 22, (i % 2 ? 1 : -1) * (2 + i * 0.4)], 0.35)); }
    if (S.id === 'perfect') for (let i = 0; i < 4; i++) { const t = q(((f - 1638) / 22 + i * 0.27) % 1, 2); out.push(FX('sparkU' + t, (p) => T.fxBurst(p, t, '#fff3b0', 8, 30, 160), [19.6, -23 + (i * 1.5) % 5, -2 + i * 1.1], 0.8)); }
  }
  if (S.id === 'trip' && f >= 1956) { const t = q(ramp(f, 1956, 1975), 2); out.push(FX('puff' + t, (p) => T.fxDust(p, t, '#d8cfe0'), [MX - 3.0, HALL - 0.3, 14.6], 0.7)); }
  return out;
};
