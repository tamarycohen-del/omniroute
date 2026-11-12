// "Australia Declared War on Birds... and Lost" (History Oops). Timed to voice.mp3 (62.07 s, 1862 frames @30).
import { M as E, camFromKeys, idle, blinkAt, walk, q, clamp, lerp, ramp } from './motion.js';
import { emuCard } from './emu.js';
export const FPS = 30, TOTAL = 1862;
export const SHOTS = [
  { id: 'hook', a: 0, b: 97, light: 'day' },
  { id: 'birds', a: 98, b: 128, light: 'day' },
  { id: 'wheat', a: 129, b: 217, light: 'day' },
  { id: 'finest', a: 218, b: 273, light: 'day' },
  { id: 'major', a: 274, b: 302, light: 'day' },
  { id: 'soldiers', a: 303, b: 337, light: 'day' },
  { id: 'guns', a: 338, b: 375, light: 'day' },
  { id: 'enemy', a: 376, b: 402, light: 'day' },
  { id: 'tall', a: 403, b: 438, light: 'day' },
  { id: 'fast', a: 439, b: 488, light: 'day' },
  { id: 'fear', a: 489, b: 522, light: 'day' },
  { id: 'plan', a: 523, b: 630, light: 'day' },
  { id: 'diffplan', a: 631, b: 703, light: 'day' },
  { id: 'ambush', a: 704, b: 827, light: 'day' },
  { id: 'fire', a: 828, b: 873, light: 'day' },
  { id: 'jam', a: 874, b: 911, light: 'day' },
  { id: 'truck', a: 912, b: 959, light: 'day' },
  { id: 'race', a: 960, b: 1022, light: 'day' },
  { id: 'bumpy', a: 1023, b: 1129, light: 'day' },
  { id: 'gaveup', a: 1130, b: 1217, light: 'day' },
  { id: 'beg', a: 1218, b: 1267, light: 'day' },
  { id: 'back', a: 1268, b: 1316, light: 'day' },
  { id: 'waiting', a: 1317, b: 1363, light: 'day' },
  { id: 'count', a: 1364, b: 1461, light: 'day' },
  { id: 'bullets', a: 1462, b: 1529, light: 'day' },
  { id: 'tanks', a: 1530, b: 1607, light: 'day' },
  { id: 'home', a: 1608, b: 1671, light: 'golden' },
  { id: 'stayed', a: 1672, b: 1708, light: 'golden' },
  { id: 'lost', a: 1709, b: 1808, light: 'golden' },
  { id: 'follow', a: 1809, b: 1861, light: 'golden' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const ROAD = 4, GUN = [0, 0.95, 40];
const ridgeY = (x, z) => { const k = 1 - (x / 64) ** 2 - ((z - 128) / 24) ** 2; return k > 0 ? Math.sqrt(1600 * k) - 32 : 0; };

// ---------- lights ----------
export const LIGHTS = {
  day: { az: 130, el: 50, sky: '#cfe0f4', ground: '#b9784a', hemi: 1.2, sun: '#fff0d6', sunI: 2.6, fog: '#f0dcc0', fogNear: 80, fogFar: 900,
    skyTop: '#3d86d6', skyHor: '#f1dcbc', sat: 1.12, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.2, shadowExt: 28 },
  golden: { az: 200, el: 16, sky: '#a898c8', ground: '#7a4c38', hemi: 1.05, sun: '#ffb46c', sunI: 2.8, fog: '#f2b48a', fogNear: 80, fogFar: 800,
    skyTop: '#6f6eb0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.26, shadowExt: 30 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------- truck path ----------
export const truckAt = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'finest': return { x: lerp(-38, -14, E.easeOut(ramp(f, 218, 273))), z: ROAD, yaw: 0, bump: 0.25, spin: -0.6 };
    case 'truck': return { x: f < 940 ? 0 : (f - 940) ** 2 * 0.006, z: ROAD, yaw: 0, bump: f < 940 ? 0 : 0.4, spin: f < 940 ? 0 : -0.6 };
    case 'race': case 'bumpy': return { x: 2 + (f - 960) * 0.3, z: ROAD, yaw: 0, bump: S.id === 'bumpy' ? 1 : 0.5, spin: -0.8 };
    case 'gaveup': return { x: -2 - (f - 1130) * 0.35, z: ROAD, yaw: Math.PI, bump: 0.3, spin: -0.6 };
    case 'back': return { x: lerp(-44, -12, E.easeOut(ramp(f, 1268, 1316))), z: ROAD, yaw: 0, bump: 0.3, spin: -0.6 };
    case 'home': return { x: -2 - (f - 1608) * 0.32, z: ROAD, yaw: Math.PI, bump: 0.3, spin: -0.6 };
  }
  return null;
};
const bedPt = (T, lx = -1.6) => { const c = Math.cos(T.yaw), s = Math.sin(T.yaw); return [T.x + lx * c, 1.0, T.z - lx * s]; };

// ---------- cameras ----------
const CAMS = {
  hook: [{ f: 0, pos: [0.2, 1.75, 10.5], look: [0, 1.45, 4], fov: 36 }, { f: 97, pos: [0.15, 1.7, 8.8], look: [0, 1.5, 4], fov: 34 }],
  birds: [{ f: 98, pos: [1.0, 1.9, 7.2], look: [0.2, 1.75, 4], fov: 36 }, { f: 128, pos: [0.9, 1.9, 6.8], look: [0.2, 1.8, 4], fov: 34 }],
  wheat: [{ f: 129, pos: [-8, 5.5, 12], look: [0, 0.6, -18], fov: 44 }, { f: 217, pos: [6, 5.0, 11], look: [2, 0.6, -18], fov: 42 }],
  finest: [{ f: 218, pos: [-5, 0.35, 8.5], look: [-20, 2.2, 4], fov: 44 }, { f: 273, pos: [-6, 0.3, 8.2], look: [-15, 2.6, 4], fov: 40 }],
  major: [{ f: 274, pos: [2.4, 1.75, 8.6], look: [2, 1.6, 12], fov: 38 }, { f: 302, pos: [2.35, 1.75, 9.0], look: [2, 1.65, 12], fov: 36 }],
  soldiers: [{ f: 303, pos: [4.6, 1.55, 8.8], look: [4.6, 1.4, 12.6], fov: 40 }, { f: 337, pos: [4.6, 1.55, 9.1], look: [4.6, 1.4, 12.6], fov: 38 }],
  guns: [{ f: 338, pos: [1.6, 1.15, 38.6], look: [0, 0.95, 40.6], fov: 42 }, { f: 350, pos: [1.7, 1.2, 38.4], look: [0, 0.95, 40.6], fov: 42 },
    { f: 372, pos: [30, 34, 2], look: [0, 0, 44], fov: 46, ease: 'easeIn' }, { f: 375, pos: [31, 35, 0], look: [0, 0, 44], fov: 46 }],
  enemy: [{ f: 376, pos: [2.5, 0.4, -4.4], look: [2.2, 1.9, -8], fov: 42 }, { f: 402, pos: [2.5, 0.45, -4.8], look: [2.2, 1.95, -8], fov: 40 }],
  tall: [{ f: 403, pos: [0.55, 1.35, 9.2], look: [0.55, 1.35, 4], fov: 36 }, { f: 438, pos: [0.55, 1.4, 8.8], look: [0.55, 1.4, 4], fov: 34 }],
  fast: [{ f: 439, pos: [0, 1.1, 10], look: [-6, 1.1, 4], fov: 46 }, { f: 470, pos: [0, 1.1, 10], look: [6, 1.1, 4], fov: 46, ease: 'easeOut' }, { f: 488, pos: [0, 1.1, 10], look: [9, 1.1, 4], fov: 46 }],
  fear: [{ f: 489, pos: [1.2, 1.95, 8.6], look: [0.6, 1.85, 5.4], fov: 38 }, { f: 522, pos: [1.0, 1.95, 7.6], look: [0.6, 1.9, 5.4], fov: 30 }],
  plan: [{ f: 523, pos: [7.55, 1.9, 6.0], look: [7.55, 1.8, 16], fov: 42 }, { f: 630, pos: [7.6, 1.95, 7.2], look: [7.65, 1.9, 16], fov: 40 }],
  diffplan: [{ f: 631, pos: [0, 2.0, 1.5], look: [0, 1.3, -11], fov: 42 }, { f: 682, pos: [0, 2.0, 2.2], look: [0, 1.3, -11], fov: 40 }, { f: 703, pos: [0, 3.2, 4.2], look: [0, 1.0, -13], fov: 48, ease: 'easeOut' }],
  ambush: [{ f: 704, pos: [0.45, 1.75, 34.0], look: [0.45, 1.25, 52], fov: 44 }, { f: 827, pos: [0.45, 1.65, 35.4], look: [0.45, 1.25, 52], fov: 40 }],
  fire: [{ f: 828, pos: [2.6, 1.15, 39.2], look: [0, 1.0, 43], fov: 40 }, { f: 873, pos: [2.4, 1.1, 39.6], look: [0, 1.0, 43], fov: 36 }],
  jam: [{ f: 874, pos: [0.25, 1.9, 43.4], look: [0.2, 1.85, 46.5], fov: 36 }, { f: 911, pos: [0.25, 1.9, 43.9], look: [0.2, 1.85, 46.5], fov: 30 }],
  truck: [{ f: 912, pos: [-5, 2.8, 15], look: [-0.5, 1.4, 4], fov: 44 }, { f: 959, pos: [2, 2.8, 15], look: [6, 1.4, 4], fov: 44 }],
  bumpy: [], race: [], gaveup: [{ f: 1130, pos: [6, 2.0, 10], look: [-8, 1.2, 4], fov: 42 }, { f: 1217, pos: [6, 2.1, 10], look: [-20, 1.0, 3], fov: 34 }],
  beg: [{ f: 1218, pos: [-39.3, 1.7, -48.4], look: [-40, 1.5, -52], fov: 40 }, { f: 1267, pos: [-39.4, 1.7, -49.0], look: [-40, 1.55, -52], fov: 36 }],
  back: [{ f: 1268, pos: [0, 1.0, 8.5], look: [-16, 1.6, 4], fov: 40 }, { f: 1316, pos: [0, 1.0, 8.2], look: [-12, 1.7, 4], fov: 40 }],
  waiting: [{ f: 1317, pos: [0, 6.5, 108], look: [0, 9.3, 127], fov: 36 }, { f: 1363, pos: [0, 7.4, 114], look: [0, 9.5, 127], fov: 34 }],
  count: [{ f: 1364, pos: [7.55, 1.9, 6.2], look: [7.55, 1.8, 16], fov: 42 }, { f: 1461, pos: [7.7, 1.95, 7.6], look: [7.8, 1.95, 16], fov: 40 }],
  bullets: [{ f: 1462, pos: [0.3, 1.6, 9.2], look: [0.3, 1.2, 4], fov: 40 }, { f: 1529, pos: [0.3, 1.6, 8.4], look: [0.3, 1.3, 4], fov: 38 }],
  tanks: [{ f: 1530, pos: [0.3, 0.35, 8.2], look: [0, 1.7, 4], fov: 46 }, { f: 1607, pos: [0.3, 0.35, 8.0], look: [0, 1.8, 4], fov: 44 }],
  home: [{ f: 1608, pos: [9, 2.6, 11], look: [-8, 1.0, 4], fov: 40 }, { f: 1671, pos: [9.5, 2.7, 11.5], look: [-14, 1.0, 4], fov: 34 }],
  stayed: [{ f: 1672, pos: [2.2, 7, 107], look: [2.2, 10.4, 127], fov: 40 }, { f: 1708, pos: [2.2, 7.6, 110], look: [2.2, 10.6, 127], fov: 38 }],
  lost: [{ f: 1709, pos: [0.6, 1.45, 10.4], look: [0.6, 1.35, 4], fov: 36 }, { f: 1808, pos: [0.6, 1.45, 9.0], look: [0.6, 1.4, 4], fov: 34 }],
  follow: [{ f: 1809, pos: [0.6, 1.45, 9.0], look: [0.6, 1.4, 4], fov: 34 }, { f: 1861, pos: [0.6, 1.5, 8.2], look: [0.6, 1.45, 4], fov: 32 }],
};
const KICKS = [{ f: 60, a: 0.025 }, { f: 682, a: 0.03 }, ...Array.from({ length: 14 }, (_, i) => ({ f: 830 + i * 3, a: 0.006 })), { f: 876, a: 0.02 },
  ...Array.from({ length: 13 }, (_, i) => ({ f: 1025 + i * 8, a: 0.012 })), { f: 1647, a: 0.02 }, { f: 1765, a: 0.02 }];
const FLASH = [98, 682, 1672];
export const camAt = (f) => {
  const S = shotAt(f), T = truckAt(f);
  let c;
  if (S.id === 'race') c = camFromKeys([{ f: 960, pos: [T.x - 4, 1.4, 12.5], look: [T.x + 3, 1.3, 4.5], fov: 44 }], f, { kicks: KICKS });
  else if (S.id === 'bumpy') c = camFromKeys([{ f: 1023, pos: [T.x - 0.2, 2.4, 8.2], look: [T.x - 1.6, 2.0, 4], fov: 42 }], f, { kicks: KICKS });
  else if (S.id === 'fast') { const x = -30 + (f - 439) * 1.25; c = camFromKeys([{ f: 439, pos: [0, 1.1, 10], look: [clamp(x + 1.5, -6, 9), 1.1, 4], fov: 46 }], f, { kicks: KICKS }); }
  else c = camFromKeys(CAMS[S.id], f, { kicks: KICKS });
  if (S.id === 'race' || S.id === 'bumpy') { c.pos = [T.x + (S.id === 'race' ? -4 : -0.2), c.pos[1], c.pos[2]]; c.look = [T.x + (S.id === 'race' ? 3 : -1.6), c.look[1], c.look[2]]; }
  c.flash = 0; for (const a of FLASH) if (f >= a && f < a + 6) c.flash = (1 - (f - a) / 6) * 0.7;
  if (S.id === 'fire' && f < 874 && f % 3 === 0) c.flash = 0.18;
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = { hook: [0, 1.5, 4], birds: [0.2, 1.8, 4], major: [2, 1.6, 12], soldiers: [4.6, 1.4, 12.6], enemy: [2.2, 1.9, -8], tall: [0.55, 1.4, 4],
  fear: [0.6, 1.9, 5.4], plan: [7.2, 1.8, 15.8], count: [7.2, 1.8, 15.8], jam: [0.2, 1.85, 46.5], beg: [-40, 1.5, -52], bullets: [0.3, 1.2, 4], lost: [0.6, 1.3, 4], follow: [0.6, 1.3, 4] };
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (FOCUS[S.id]) return { focus: dist(C.pos, FOCUS[S.id]), cinf: ['enemy', 'fear', 'jam'].includes(S.id) ? 9 : 7 };
  if (S.id === 'fire') return { focus: dist(C.pos, [0, 1, 41]), cinf: 5 };
  if (S.id === 'guns') return { focus: dist(C.pos, GUN), cinf: lerp(8, 0, ramp(f, 350, 362)) };
  return { focus: 30, cinf: 0 };
};

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), T = truckAt(f), id = S.id;
  const out = { tally: id === 'count', gunAYaw: id === 'fire' ? 0.08 * Math.sin(f * 0.5) : 0, recoil: id === 'fire' && f < 874 };
  if (T) { out.truck = [T.x, T.z, T.yaw]; out.bump = T.bump; out.wheelSpin = T.spin; }
  if (id === 'stayed') out.flag = E.easeOut(ramp(f, 1676, 1704));
  if (id === 'waiting') out.flag = undefined;
  return out;
};

// ---------- cast ----------
const SOLDIER = { tunic: '#8a7a4a', skin: '#f5c9a0', cap: '#6b5d3a' }, SOLDIER2 = { tunic: '#7f7244', skin: '#e2b48c', cap: '#6b5d3a', moustache: '#5a3a24' };
const MAJOR = { tunic: '#7a6a3c', skin: '#efcfb2', cap: '#4f4226', moustache: '#6a4a30', stout: true };
const FARMER = { tunic: '#b0563a', skin: '#e8b890', cap: '#c9a868', beard: '#8a6a4a' };
const HOST = 'host';
const R = (T, who, o, pos, extra = {}) => ({ key: (typeof who === 'string' ? who : who.tunic) + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), headTilt: q(I.headTilt, 1), tilt: q(I.tilt * 0.6, 1), ...o }; };
const rightOf = (C) => { const fx = C.look[0] - C.pos[0], fz = C.look[2] - C.pos[2]; return [-fz, fx]; };
// emu card: dir = world move/facing direction [dx, dz]; flips so it faces that way on screen
const EMU = (f, C, o, pos, dir = [1, 0], extra = {}) => {
  const r = rightOf(C), flip = dir[0] * r[0] + dir[1] * r[1] < 0;
  const oo = { ...o }; if (oo.expr === undefined && blinkAt(f, o.seed || 1) > 0.6) oo.expr = 'blink';
  return { key: 'emu' + JSON.stringify(oo), draw: (p) => emuCard(p, oo), x: pos[0], y: pos[1], z: pos[2], s: 1.1, flip, ground: pos[1], ...extra };
};
const emuIdle = (f, seed, o = {}) => ({ seed, look: q(Math.sin((f + seed * 9) * 0.04), 1), neck: q(0.15 * Math.sin((f + seed * 13) * 0.05), 2), ...o });
const runPh = (f, seed, rate = 0.09) => q(((f * rate + seed * 0.37) % 1), 1) % 1;
const FLOCK = Array.from({ length: 14 }, (_, i) => { let r = (i * 2654435761) >>> 0; const rnd = () => ((r = (r * 1664525 + 1013904223) >>> 0) / 4294967296);
  return { seed: i + 1, x: -14 + rnd() * 28, z: -8 - rnd() * 16, a: rnd() * Math.PI * 2, sp: 0.25 + rnd() * 0.2 }; });
const HORDE = Array.from({ length: 22 }, (_, i) => { let r = (i * 40503 + 7) >>> 0; const rnd = () => ((r = (r * 1664525 + 1013904223) >>> 0) / 4294967296);
  return { seed: 30 + i, x: (rnd() - 0.5) * (8 + i * 1.2), z: 52 + i * 2.2 + rnd() * 3 }; });

export const actorsAt = (f, T) => {
  const S = shotAt(f), C = camAt(f), TR = truckAt(f), out = [];
  const tint = S.light === 'golden' ? '#ffe2c8' : '#ffffff';
  const H = (who, o, x, z, extra = {}) => out.push(R(T, who, o, [x, 0, z], { ground: 0, tint, ...extra }));
  const Em = (o, x, z, dir, extra = {}) => out.push(EMU(f, C, o, [x, 0, z], dir, { tint, ...extra }));
  const onBed = (who, o, lx = -1.9, extra = {}) => { const p = bedPt(TR, lx), b = TR.bump * 0.18 * Math.abs(Math.sin(f * 0.9));
    out.push(R(T, who, o, [p[0], p[1] + b, p[2]], { tint, roll: q(TR.bump * 0.12 * Math.sin(f * 0.7 + 0.5), 3), ...extra })); };
  switch (S.id) {
    case 'hook': H(HOST, life(f, 3, { expr: f < 46 ? 'smile' : 'grin', R: f > 46 ? 'wave' : 'hang', L: 'hang', wv: q(f * 0.35, 1) }), 0, ROAD);
      for (let i = 0; i < 5; i++) Em(emuIdle(f, i + 2, { peck: q(Math.max(0, Math.sin(f * 0.15 + i)) ** 6, 1) }), -6 + i * 3.2, -9 - (i % 2) * 4, [i % 2 ? 1 : -1, 0]); break;
    case 'birds': Em(emuIdle(f, 7, { salute: f > 104, expr: f > 104 ? 'smug' : undefined, look: -1 }), 0.2, ROAD, [-1, 0]); break;
    case 'wheat': {
      FLOCK.forEach((e, i) => Em(emuIdle(f, e.seed, { peck: q(Math.max(0, Math.sin(f * 0.13 + i * 1.3)) ** 4, 1) }), e.x + Math.sin(f * 0.01 + i) * 0.4, e.z, [i % 2 ? 1 : -1, 0]));
      const shake = q(0.6 * Math.sin(f * 0.9), 1);
      H(FARMER, life(f, 9, { expr: 'stern', L: 'up', R: 'up', tilt: shake * 4 }), -2.5, ROAD - 1.2); break; }
    case 'finest': onBed(MAJOR, life(f, 4, { expr: 'stern', R: 'point', L: 'hip', facing: 1 }), -1.9);
      onBed(SOLDIER, life(f, 6, { expr: 'nervous' }), -2.9, { z: TR.z - 0.6 }); onBed(SOLDIER2, life(f, 8, { expr: 'nervous' }), -2.9, { z: TR.z + 0.6 }); break;
    case 'major': H(MAJOR, life(f, 4, { expr: f > 285 ? 'squint' : 'stern', R: 'hip', L: 'hip' }), 2, 12); break;
    case 'soldiers': { const t = f > 318; H(SOLDIER, life(f, 6, { expr: t ? 'nervous' : 'smile', R: 'hang' }), 4.1, 12.6); H(SOLDIER2, life(f, 8, { expr: 'nervous', L: 'hang', look: -0.5 }), 5.1, 12.8); break; }
    case 'guns': H(MAJOR, life(f, 4, { expr: 'stern', L: 'hip', R: 'hip' }), 1.0, 41.4); H(SOLDIER, life(f, 6, { expr: 'nervous' }), -0.9, 41.3); H(SOLDIER2, life(f, 8, { expr: 'smile' }), 0.1, 42.0); break;
    case 'enemy': Em(emuIdle(f, 11, { expr: 'smug', look: 0.6 }), 2.2, -8, [-1, 0]); break;
    case 'tall': H(SOLDIER, life(f, 6, { expr: f > 418 ? 'nervous' : 'neutral', look: 0.6, headTilt: 6 }), 0, ROAD); Em(emuIdle(f, 12, { look: -1, neck: 0.25 }), 1.15, ROAD - 0.1, [-1, 0], { s: 1.18 }); break;
    case 'fast': { const x = -30 + (f - 439) * 1.25; Em({ seed: 13, run: runPh(f, 13, 0.25), expr: 'smug' }, x, ROAD + 0.5, [1, 0]);
      H(SOLDIER, life(f, 6, { expr: f > 455 ? 'shock' : 'neutral', look: q(clamp((x - 0) / 6, -1, 1), 1) }), 4.5, ROAD - 0.8); break; }
    case 'fear': Em({ seed: 14, expr: f > 500 ? 'angry' : 'smug', look: -0.3, neck: 0.3 }, 0.6, 5.4, [1, 0]); break;
    case 'plan': case 'count': H(MAJOR, life(f, 4, { expr: S.id === 'count' ? (f > 1462 ? 'shock' : 'squint') : f > 594 ? 'grin' : 'stern', L: 'point', R: 'hip', facing: -1, look: -0.4 }), 6.2, 15.6); break;
    case 'diffplan': {
      const go = f >= 682;
      FLOCK.slice(0, 10).forEach((e, i) => {
        if (!go) { Em(emuIdle(f, e.seed, { look: q(Math.sin(f * 0.12 + i * 2), 0), expr: f > 660 ? 'smug' : undefined }), e.x * 0.6, -8 - (i % 4) * 2.2, [Math.sin(i * 1.7) > 0 ? 1 : -1, 0]); return; }
        const d = (f - 682) * e.sp * 1.6, dx = Math.cos(e.a), dz = Math.sin(e.a) * 0.5 - 0.5;
        Em({ seed: e.seed, run: runPh(f, e.seed, 0.22), expr: 'shock' }, e.x * 0.6 + dx * d, -8 - (i % 4) * 2.2 + dz * d, [dx, dz]); });
      break; }
    case 'ambush': case 'fire': {
      H(SOLDIER, life(f, 6, { expr: S.id === 'fire' ? 'grin' : 'nervous', L: 'reach', R: 'reach' }), -0.35, 39.0);
      H(MAJOR, life(f, 4, { expr: 'stern', L: 'hip', R: 'point', facing: 1 }), 1.3, 38.8);
      HORDE.forEach((e, i) => { const w = walk(f, 704, 0.9, 0.6), z = e.z - (S.id === 'ambush' ? w.dist : walk(827, 704, 0.9, 0.6).dist);
        const sc = S.id === 'fire' && f > 832 + i;
        Em(sc ? { seed: e.seed, run: runPh(f, e.seed, 0.25), expr: 'shock' } : emuIdle(f, e.seed, { run: S.id === 'ambush' ? runPh(f, e.seed, 0.05) : undefined }), e.x + (sc ? (i % 2 ? 1 : -1) * (f - 832 - i) * 0.35 : 0), z, sc ? [i % 2 ? 1 : -1, 0] : [i % 2 ? 1 : -1, -1]); });
      break; }
    case 'jam': Em({ seed: 15, expr: f < 884 ? 'neutral' : f < 890 ? 'blink' : 'smug', look: 0, neck: 0.1 }, 0.2, 46.5, [-1, 0]); break;
    case 'truck': onBed(SOLDIER, life(f, 6, { expr: f > 940 ? 'grin' : 'neutral', L: 'reach', R: 'reach' }), -2.2); H(MAJOR, life(f, 4, { expr: 'stern', R: 'point', facing: 1 }), f < 936 ? -3.6 : -40, ROAD + 2.2); break;
    case 'race': {
      onBed(SOLDIER, life(f, 6, { expr: 'grin', L: 'reach', R: 'reach' }), -2.2);
      for (let i = 0; i < 5; i++) { const x = TR.x - 6 + i * 3 + (f - 960) * (0.18 + i * 0.03);
        Em({ seed: 20 + i, run: runPh(f, 20 + i, 0.25), expr: i === 2 ? 'smug' : undefined, look: i === 2 ? -1 : 0 }, x, ROAD + 2.4 + (i % 2) * 1.2, [1, 0]); }
      break; }
    case 'bumpy': onBed(SOLDIER, life(f, 6, { expr: 'shock', L: q(Math.sin(f * 0.4), 0) > 0 ? 'up' : 'reach', R: 'reach', tilt: q(10 * Math.sin(f * 0.6), 0) }), -2.2); break;
    case 'gaveup': onBed(SOLDIER, life(f, 6, { expr: 'nervous' }), -2.2);
      for (let i = 0; i < 5; i++) Em(emuIdle(f, 40 + i, { expr: 'smug', salute: i === 2 && f > 1170 }), -12 + i * 1.6, -5.4 - (i % 2) * 0.6, [-1, 0]); break;
    case 'beg': H(FARMER, life(f, 9, { expr: 'nervous', L: 'cheek', R: 'cheek', bob: q(0.015 * Math.abs(Math.sin(f * 0.3)), 3) }), -40, -52); break;
    case 'back': onBed(SOLDIER, life(f, 6, { expr: 'stern', L: 'reach', R: 'reach' }), -2.2); onBed(MAJOR, life(f, 4, { expr: 'stern', R: 'point', facing: 1 }), -1.0); break;
    case 'waiting': case 'stayed':
      for (let i = 0; i < 9; i++) { const x = -9 + i * 2.2, z = 127 + (i % 2) * 0.8; if (S.id === 'stayed' && Math.abs(x - 4) < 1) continue;
        Em(emuIdle(f, 50 + i, { helmet: true, expr: S.id === 'waiting' ? 'angry' : 'smug', salute: S.id === 'stayed' && i % 3 === 1, look: q(-x / 9, 1) }), x, z, [i < 4 ? 1 : -1, 0], { y: ridgeY(x, z) - 0.15, ground: ridgeY(x, z) - 0.15 }); }
      break;
    case 'bullets': Em(emuIdle(f, 60, { expr: f > 1480 ? 'smug' : 'neutral' }), 0.3, ROAD, [-1, 0]); break;
    case 'tanks': { const z = lerp(3.4, 5.0, ramp(f, 1530, 1607)); Em({ seed: 61, run: runPh(f, 61, 0.06), helmet: true, expr: 'angry' }, 0, z, [-1, 0]); break; }
    case 'home': onBed(SOLDIER, life(f, 6, { expr: 'nervous', L: 'hang', R: 'hang' }), -2.2); onBed(MAJOR, life(f, 4, { expr: f > 1647 ? 'squint' : 'nervous' }), -1.0);
      if (f > 1647) Em(emuIdle(f, 62, { expr: 'smug', salute: true }), 3.5, ROAD + 2.5, [-1, 0]); break;
    case 'lost': case 'follow': {
      const fin = S.id === 'follow', palm = f > 1745 && !fin;
      H(HOST, life(f, 3, { expr: fin ? 'grin' : palm ? 'squint' : 'neutral', L: palm ? 'cheek' : 'hang', R: fin ? 'thumb' : palm ? 'cheek' : 'hang', look: fin ? 0 : 0.5 }), -0.1, ROAD);
      const x = lerp(5.5, 1.35, E.easeOut(ramp(f, 1709, 1750)));
      Em(f < 1750 ? { seed: 63, run: runPh(f, 63, 0.12), gun: true, expr: 'smug' } : emuIdle(f, 63, { gun: true, expr: 'smug', look: fin ? 0 : -1 }), x, ROAD - 0.1, [-1, 0]); break; }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
const streak = (p) => { for (let i = 0; i < 4; i++) p.stroke([[40 + i * 30, 300 + i * 120], [560 - i * 40, 280 + i * 120]], 9, '#ffffffcc'); };
const shell = (p) => { p.poly([[250, 380], [350, 380], [350, 640], [250, 640]], '#d9a441', 10); p.poly([[250, 380], [300, 290], [350, 380]], '#b8743a', 10); p.stroke([[270, 600], [330, 600]], 8, '#8a6a2a'); };
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  const dust = (x, z, t, s = 1.4) => out.push(FX('dust' + t, (p) => T.fxDust(p, t, '#e2b58a'), [x, 0, z], s));
  if (S.id === 'fast') { const x = -30 + (f - 439) * 1.25; for (let k = 1; k <= 3; k++) dust(x - k * 2.2, ROAD + 0.5, q(Math.min(0.95, k * 0.28), 2), 1.6);
    for (let i = 0; i < 4; i++) out.push(FX('wind', streak, [x - 2 - i * 0.6, 0.6 + i * 0.4, ROAD + 1], 1.4, { alpha: 0.8 })); }
  if (S.id === 'diffplan' && f >= 682) for (let i = 0; i < 6; i++) dust((i - 2.5) * 2.4, -9 - (i % 3) * 2, q(ramp(f, 682 + i * 2, 703), 2), 2.2);
  if (S.id === 'fire' && f < 874 && f % 3 !== 2) out.push(FX('flash' + (f % 3), (p) => T.fxBurst(p, 0.5 + (f % 3) * 0.2, '#ffe27a', 9, 30, 200), [0, 0.95, 41.45], 0.7));
  if (S.id === 'fire' && f < 874) for (let i = 0; i < 3; i++) { const t = q(((f - 828) / 10 + i / 3) % 1, 1); out.push(FX('shell' + t, shell, [0.3 + t * 0.8, 0.95 + Math.sin(t * Math.PI) * 0.5 - t * 0.6, 40.1], 0.14)); }
  if (S.id === 'jam' && f < 884) out.push(FX('puffj' + q(ramp(f, 874, 884), 1), (p) => T.fxDust(p, ramp(f, 874, 884), '#d8d0c8'), [0, 0.95, 41.5], 0.5));
  if (S.id === 'race' || S.id === 'bumpy' || S.id === 'gaveup' || S.id === 'back' || S.id === 'home' || (S.id === 'truck' && f > 940)) {
    const TR = truckAt(f), back = Math.cos(TR.yaw); for (let k = 1; k <= 3; k++) dust(TR.x - back * (3.4 + k * 1.4), TR.z, q(((f * 0.06 + k * 0.3) % 1), 1), 1.1);
  }
  if (S.id === 'race') for (let i = 0; i < 5; i++) { const TR = truckAt(f), x = TR.x - 6 + i * 3 + (f - 960) * (0.18 + i * 0.03); dust(x - 1.6, ROAD + 2.4 + (i % 2) * 1.2, q(((f * 0.1 + i * 0.2) % 1), 1), 0.8); }
  if (S.id === 'bullets') { const n = Math.min(10, Math.floor((f - 1466) / 5.5) + 1);
    for (let i = 0; i < n; i++) { const t0 = 1466 + i * 5.5, d = clamp((f - t0) / 8), x = 0.3 + (i % 2 ? 1 : -1) * (0.5 + (i * 0.13) % 0.5), z = ROAD + 0.6 + (i % 3) * 0.15;
      out.push(FX('shell', shell, [x, lerp(3.2, 0.02 + (i % 4) * 0.05, d * d), z], 0.3, { roll: d < 1 ? f * 0.4 : 1.57 })); } }
  if (S.id === 'tanks') for (let i = 0; i < 4; i++) { const t = q(((f - 1530) / 12 + i * 0.25) % 1, 1), z = lerp(3.4, 5.0, ramp(f, 1530, 1607));
    out.push(FX('spark' + t, (p) => T.fxBurst(p, t, '#fff6c0', 8, 20, 140), [(i % 2 ? 0.4 : -0.3), 1.2 + (i % 3) * 0.5, z + 0.3], 0.5)); }
  return out;
};
