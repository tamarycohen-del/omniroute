// "What If Gravity Turned Off for 5 Seconds?" Timed to voice.mp3 (ElevenLabs, 60.72 s, 1822 frames @30).
import { M as E, camFromKeys, idle, blinkAt, walk, q, clamp, lerp, ramp } from './motion.js';
import { catCard, fishCard, sandwichCard, cupCard, countCard, wordCard, astronautCard, zzzCard } from './props.js';
export const FPS = 30, TOTAL = 1822;
export const SHOTS = [
  { id: 'hook', a: 0, b: 107, light: 'day' },
  { id: 'one', a: 108, b: 137, light: 'day' },
  { id: 'float', a: 138, b: 229, light: 'day' },
  { id: 'coffee', a: 230, b: 283, light: 'day' },
  { id: 'you', a: 284, b: 311, light: 'day' },
  { id: 'cars', a: 312, b: 373, light: 'day' },
  { id: 'drivers', a: 374, b: 467, light: 'day' },
  { id: 'two', a: 468, b: 499, light: 'day' },
  { id: 'ocean', a: 500, b: 616, light: 'day' },
  { id: 'fish', a: 617, b: 695, light: 'day' },
  { id: 'three', a: 696, b: 727, light: 'day' },
  { id: 'people', a: 728, b: 891, light: 'day' },
  { id: 'astro', a: 892, b: 990, light: 'space' },
  { id: 'four', a: 991, b: 1023, light: 'day' },
  { id: 'sandwich', a: 1024, b: 1106, light: 'day' },
  { id: 'five', a: 1107, b: 1183, light: 'day' },
  { id: 'down', a: 1184, b: 1283, light: 'day' },
  { id: 'butts', a: 1284, b: 1363, light: 'day' },
  { id: 'carcar', a: 1364, b: 1413, light: 'day' },
  { id: 'beach', a: 1414, b: 1470, light: 'day' },
  { id: 'cat', a: 1471, b: 1546, light: 'day' },
  { id: 'who', a: 1547, b: 1623, light: 'day' },
  { id: 'guy', a: 1624, b: 1751, light: 'room' },
  { id: 'follow', a: 1752, b: 1821, light: 'room' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const HX = 400, BX = -400, SZ = 3000, RZ = -600;
// global gravity state: lift 0..1 while it is off, fall 0..1 when it returns
const LIFT = (f) => (f < 1184 ? E.smooth(ramp(f, 112, 210)) : 0);
const FALL = (f) => (f < 1186 ? 0 : E.easeIn(ramp(f, 1186, 1206)));

// ---------- lights ----------
export const LIGHTS = {
  day: { az: 120, el: 48, sky: '#cfe0f4', ground: '#7a9a5a', hemi: 1.2, sun: '#fff4e0', sunI: 2.5, fog: '#d6e6f4', fogNear: 80, fogFar: 900,
    skyTop: '#3d8ae0', skyHor: '#cfe6f8', sat: 1.12, waterDeep: '#2c7ca0', waterShal: '#5ac0d8', glint: '#effaff', vig: 0.18, shadowExt: 26 },
  space: { az: 60, el: 30, sky: '#c8d8f0', ground: '#3a4a6a', hemi: 1.1, sun: '#ffffff', sunI: 2.6, fog: '#05060c', fogNear: 900, fogFar: 3000,
    skyTop: '#03040a', skyHor: '#0a1030', sat: 1.08, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.3, shadowExt: 18 },
  room: { az: 40, el: 60, sky: '#ffe2b8', ground: '#5a3a3a', hemi: 1.25, sun: '#ffd8a0', sunI: 1.3, fog: '#2a2040', fogNear: 60, fogFar: 200,
    skyTop: '#0a0c24', skyHor: '#1a2050', sat: 1.08, gain: '#fff0e0', waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.32, shadowExt: 10 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------- cameras ----------
const CAMS = {
  hook: [{ f: 0, pos: [0.3, 1.6, 2.4], look: [0, 1.45, -5.6], fov: 36 }, { f: 60, pos: [0.3, 1.55, 0.6], look: [0, 1.5, -5.6], fov: 34 }, { f: 107, pos: [0.4, 1.0, 0.2], look: [0, 3.0, -5.6], fov: 40 }],
  one: [{ f: 108, pos: [-2, 6, 8], look: [0, 1.5, -6], fov: 46 }, { f: 137, pos: [-1.6, 6.4, 7.4], look: [0, 1.8, -6], fov: 46 }],
  float: [{ f: 138, pos: [2.6, 2.2, 4.2], look: [0.5, 2, -6], fov: 50 }, { f: 229, pos: [3.4, 1.6, 3.2], look: [0.5, 4.0, -6], fov: 54 }],
  coffee: [{ f: 230, pos: [26.9, 1.7, -4.4], look: [26.7, 1.9, -7.4], fov: 38 }, { f: 283, pos: [26.8, 1.9, -4.8], look: [26.7, 2.3, -7.4], fov: 36 }],
  you: [{ f: 284, pos: [0.4, 1.6, -1.0], look: [0, 2.0, -5.6], fov: 44 }, { f: 311, pos: [0.4, 1.4, -1.6], look: [0, 4.4, -5.6], fov: 50 }],
  cars: [{ f: 312, pos: [HX - 30, 4, 26], look: [HX, 2, 0], fov: 46 }, { f: 373, pos: [HX - 24, 3, 24], look: [HX + 4, 4.5, 0], fov: 46 }],
  drivers: [{ f: 374, pos: [HX + 4.5, 4.0, 10.5], look: [HX - 0.3, 3.9, 2.5], fov: 34 }, { f: 467, pos: [HX + 3.8, 4.0, 9.4], look: [HX - 0.3, 4.0, 2.5], fov: 32 }],
  two: [{ f: 468, pos: [BX, 6, 30], look: [BX, 2, -10], fov: 46 }, { f: 499, pos: [BX, 6.4, 28], look: [BX, 2.4, -10], fov: 46 }],
  ocean: [{ f: 500, pos: [BX + 2, 2.2, 22], look: [BX, 3, -14], fov: 46 }, { f: 616, pos: [BX + 4, 4, 18], look: [BX, 6, -14], fov: 48 }],
  fish: [{ f: 617, pos: [BX + 1.2, 5.2, -14.5], look: [BX, 5.1, -19], fov: 40 }, { f: 695, pos: [BX + 0.8, 5.2, -15.3], look: [BX, 5.1, -19], fov: 36 }],
  three: [{ f: 696, pos: [0, 30, 40], look: [0, 4, -10], fov: 44 }, { f: 727, pos: [0, 31, 38], look: [0, 5, -10], fov: 44 }],
  people: [{ f: 728, pos: [0.5, 1.2, 8], look: [0, 6, -4], fov: 56 }, { f: 891, pos: [0.5, 4, 6], look: [0, 16, -4], fov: 58 }],
  astro: [{ f: 892, pos: [0.6, 1.8, 6.5], look: [0, 1.6, 0], fov: 44 }, { f: 990, pos: [0.4, 1.8, 5.2], look: [0, 1.7, 0], fov: 40 }],
  four: [{ f: 991, pos: [0, 8, 10], look: [0, 14, -4], fov: 56 }, { f: 1023, pos: [0, 8.4, 9], look: [0, 15, -4], fov: 56 }],
  sandwich: [{ f: 1024, pos: [2.4, 12.4, 3.4], look: [0, 12.2, -2], fov: 36 }, { f: 1106, pos: [2.0, 12.4, 2.4], look: [0, 12.2, -2], fov: 32 }],
  five: [{ f: 1107, pos: [0, 10, 18], look: [0, 10, -6], fov: 50 }, { f: 1183, pos: [0, 10.5, 16], look: [0, 10, -6], fov: 50 }],
  down: [{ f: 1184, pos: [3.5, 3, 16], look: [0, 6, -6], fov: 56 }, { f: 1283, pos: [3.5, 2.4, 14], look: [0, 2, -6], fov: 50, ease: 'easeOut' }],
  butts: [{ f: 1284, pos: [0.2, 1.3, 2.6], look: [0, 0.8, -5.4], fov: 46 }, { f: 1363, pos: [0.2, 1.2, 1.6], look: [0, 0.8, -5.4], fov: 42 }],
  carcar: [{ f: 1364, pos: [-10, 3.6, 12], look: [-13, 1.8, -2], fov: 40 }, { f: 1413, pos: [-10.5, 3.4, 11], look: [-13.5, 2.0, -2], fov: 38 }],
  beach: [{ f: 1414, pos: [BX + 3, 2.6, 26], look: [BX, 2, 0], fov: 50 }, { f: 1470, pos: [BX + 3, 2.4, 24], look: [BX, 1.6, 2], fov: 48 }],
  cat: [{ f: 1471, pos: [7.4, 0.7, -2.2], look: [7.0, 0.8, -5.4], fov: 40 }, { f: 1546, pos: [7.3, 0.6, -3.0], look: [7.0, 0.6, -5.4], fov: 34 }],
  who: [{ f: 1547, pos: [-6, 4, 12], look: [0, 1.5, -6], fov: 50 }, { f: 1623, pos: [6, 5, 4], look: [12, 4.5, -16], fov: 40 }],
  guy: [{ f: 1624, pos: [2.6, 2.3, RZ + 0.4], look: [-1.6, 1.2, RZ - 2.0], fov: 44 }, { f: 1751, pos: [1.8, 2.0, RZ - 0.6], look: [-1.6, 1.2, RZ - 2.3], fov: 40 }],
  follow: [{ f: 1752, pos: [1.8, 2.0, RZ - 0.6], look: [-1.6, 1.2, RZ - 2.3], fov: 40 }, { f: 1821, pos: [2.2, 2.2, RZ - 0.2], look: [-1.6, 1.6, RZ - 2.3], fov: 44 }],
};
const KICKS = [{ f: 108, a: 0.02 }, { f: 468, a: 0.02 }, { f: 696, a: 0.02 }, { f: 991, a: 0.02 }, { f: 1107, a: 0.04 }, { f: 1141, a: 0.03 },
  { f: 1206, a: 0.06 }, { f: 1290, a: 0.03 }, { f: 1306, a: 0.03 }, { f: 1322, a: 0.03 }, { f: 1385, a: 0.05 }, { f: 1430, a: 0.04 }, { f: 1495, a: 0.02 }];
const FLASH = [108, 468, 696, 991, 1107, 1206];
const camBase = (f) => { const S = shotAt(f); const c = camFromKeys(CAMS[S.id], f, { kicks: KICKS }); c.flash = 0; for (const a of FLASH) if (f >= a && f < a + 6) c.flash = (1 - (f - a) / 6) * 0.6; if (S.id === 'astro') c.shadowAt = [0, 0, SZ]; return c; };
// cameras in the space shot are relative to the station
const camRaw = camBase;
const shiftZ = (c, z) => ({ ...c, pos: [c.pos[0], c.pos[1], c.pos[2] + z], look: [c.look[0], c.look[1], c.look[2] + z] });
export const camAt = (f) => { const S = shotAt(f), c = camRaw(f); return S.id === 'astro' ? shiftZ(c, SZ) : c; };

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = { hook: [0, 1.5, -5.6], coffee: [26.6, 2, -7.4], you: [0, 3, -5.6], drivers: [HX, 4, 2.5], fish: [BX, 5.1, -19], astro: [0, 1.6, SZ],
  sandwich: [0, 12.2, -2], butts: [0, 0.8, -5.4], cat: [7, 0.7, -5.4], guy: [-1.6, 1.3, RZ - 2.3], follow: [-1.6, 1.3, RZ - 2.3] };
export const dofAt = (f) => { const S = shotAt(f), C = camAt(f); if (FOCUS[S.id]) return { focus: dist(C.pos, FOCUS[S.id]), cinf: 7 }; return { focus: 30, cinf: 0 }; };

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), id = S.id, out = { lift: LIFT(f), fall: FALL(f), space: id === 'astro' };
  if (id === 'cars') out.hwDrive = (f - 312) * 0.15;
  if (['ocean', 'fish', 'two'].includes(id)) out.blobs = id === 'two' ? 0.1 : E.smooth(ramp(f, 500, 600));
  if (id === 'beach') { out.blobs = 1; out.blobFall = E.easeIn(ramp(f, 1414, 1446)); }
  if (id === 'carcar') out.carStack = E.easeIn(ramp(f, 1366, 1386)) * 1.0 + (f > 1386 ? 0.001 : 0);
  if (['butts', 'cat', 'who', 'carcar'].includes(id) && id !== 'carcar') out.carStack = 1;
  if (id === 'drivers') { const y = 2.6 + 0.4 * Math.sin(f * 0.05); out.hero = [HX, y, 2.5, 0.06 * Math.sin(f * 0.04), 0.3, 0.05 * Math.sin(f * 0.03)]; }
  return out;
};

// ---------- cast ----------
const PJ = [{ tunic: '#8ab8e8', skin: '#f5c9a0', cap: '#8ab8e8' }, { tunic: '#e8a0c0', skin: '#ecd0b6', hair: '#5a3b2a' }, { tunic: '#a8d88a', skin: '#c99067', hair: '#1e1714' },
  { tunic: '#f2d27a', skin: '#f5c9a0', hair: '#3b2a20', cap: '#e86a3a' }];
const CIV = ['civA', 'civB', 'civC', 'workA', 'workB', 'sailorB'];
const R = (T, who, o, pos, extra = {}) => ({ key: (typeof who === 'string' ? who : who.tunic) + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const C2 = (key, draw, pos, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), headTilt: q(I.headTilt, 1), tilt: q(I.tilt * 0.6, 1), ...o }; };
const CROWD = Array.from({ length: 16 }, (_, i) => { let r = (i * 2654435761) >>> 0; const rnd = () => ((r = (r * 1664525 + 1013904223) >>> 0) / 4294967296);
  return { seed: 10 + i, x: ((i % 8) - 3.5) * 1.7 + (rnd() - 0.5) * 0.8, z: -2 - rnd() * 8, h: 4 + rnd() * 22, pj: i % 3 !== 2, who: i % 3 !== 2 ? PJ[i % 4] : CIV[i % 6], sp: (rnd() - 0.5) * 0.04 }; });

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], lift = LIFT(f), fall = FALL(f);
  const tint = S.light === 'room' ? '#ffe6d0' : '#ffffff';
  const H = (who, o, x, y, z, extra = {}) => out.push(R(T, who, o, [x, y, z], { tint, ...extra }));
  const floatO = (f, seed) => ({ seed, expr: 'shock', L: 'up', R: 'up', blink: 0, tilt: q(8 * Math.sin(f * 0.05 + seed), 0) });
  switch (S.id) {
    case 'hook': H('host', life(f, 3, { expr: f < 54 ? 'grin' : 'smile', L: f > 54 ? 'point' : 'hang', look: f > 54 ? 0.4 : 0, facing: f > 54 ? 1 : 0 }), 0, 0.1, -5.6, { ground: 0.1 }); break;
    case 'one': case 'float': H('host', life(f, 3, { expr: S.id === 'float' ? 'shock' : 'neutral', look: 0.5 }), 0, 0.1, -5.6, { ground: 0.1 }); break;
    case 'coffee': {
      out.push(C2('cup' + q(lift, 2), (p) => cupCard(p, { blob: lift }), [26.5, 0.98 + lift * 0.6, -7.3], { s: 0.55, blob: false }));
      out.push(C2('cat' + (f > 260 ? 's' : 'c'), (p) => catCard(p, { pose: 'float', expr: f > 260 ? 'shock' : 'calm' }), [26.95, 1.0 + lift * 0.7 + 0.15 * Math.sin(f * 0.07), -7.0], { s: 0.6, roll: q(0.3 * Math.sin(f * 0.04), 2), blob: false }));
      break; }
    case 'you': H('host', floatO(f, 3), 0, 0.1 + E.easeOut(ramp(f, 286, 311)) * 2.4, -5.6, { roll: q(0.25 * Math.sin(f * 0.1), 2) }); break;
    case 'drivers': { const y = 2.6 + 0.4 * Math.sin(f * 0.05);
      H('workB', life(f, 7, { expr: 'stern', L: 'reach', R: 'reach' }), HX - 0.2, y + 0.95, 3.42, { s: 0.5, blob: false, order: 3 });
      if ((f >= 430 && f < 440) || (f >= 446 && f < 456)) out.push(C2('honk', (p) => wordCard(p, { t: 'HONK!', col: '#ffd23a' }), [HX + 2.3, y + 1.4, 3.3], { s: 0.9, blob: false, order: 6 }));
      break; }
    case 'fish': for (let i = 0; i < 3; i++) out.push(C2('fish' + i + (f > 657 ? 'c' : ''), (p) => fishCard(p, { col: ['#f2a03a', '#f2d24a', '#ff8a8a'][i], look: q(Math.sin(f * 0.15 + i * 2), 0), confused: f > 657 && i === 1 }),
      [BX - 0.6 + i * 0.6, 4.3 + i * 0.35 + 0.1 * Math.sin(f * 0.1 + i), -19 + (i % 2) * 0.4], { s: 0.42, flip: i === 2, blob: false })); break;
    case 'people': case 'three': case 'four': case 'down':
      CROWD.forEach((c, i) => { const up = S.id === 'down' ? c.h * (1 - fall) : c.h * clamp((f - 700 - i * 4) / 190) ** 1.2;
        if (S.id === 'down' && fall >= 1) return;
        H(c.who, floatO(f, c.seed), c.x + Math.sin(f * 0.02 + i) * 0.6, 0.1 + up, c.z, { roll: q(S.id === 'down' ? 0 : 0.5 * Math.sin(f * 0.03 + i), 2) }); });
      break;
    case 'astro': { H; out.push(C2('astro1', (p) => astronautCard(p, { expr: 'relief' }), [-0.9, 0, SZ], { s: 0.95, ground: 0 }));
      out.push(C2('astro2' + (f > 940), (p) => astronautCard(p, { expr: f > 940 ? 'relief' : 'smile', wave: f > 940 }), [0.9, 0, SZ + 0.3], { s: 0.95, ground: 0 })); break; }
    case 'sandwich': {
      const t = (f - 1024) / 82;
      H('workB', { seed: 9, expr: f % 40 < 20 ? 'shock' : 'grin', L: 'reach', R: 'reach', blink: 0 }, 0, 13.4 + 0.2 * Math.sin(f * 0.06), -2, { roll: q(Math.PI + 0.2 * Math.sin(f * 0.05), 2) });
      out.push(C2('sand', (p) => sandwichCard(p), [0.6 + 0.25 * Math.sin(f * 0.13), 11.2 - 0.15 * Math.sin(f * 0.1) + t * 0.3, -1.6], { s: 0.42, roll: q(f * 0.03, 2), blob: false }));
      break; }
    case 'butts': {
      for (let i = 0; i < 5; i++) { const land = 1288 + i * 16, d = f - land, x = -2.8 + i * 1.4;
        const y = d < 0 ? 3 - (1288 - f) * -0.0 + Math.max(0, -d) * 0.25 : d < 6 ? -0.55 + 0.1 * Math.sin(d) : -0.55;
        if (d < -12) continue;
        H(i % 2 ? PJ[i % 4] : CIV[i], { seed: 20 + i, expr: d < 0 ? 'shock' : d < 20 ? 'shock' : 'nervous', L: d < 0 ? 'up' : 'hang', R: d < 0 ? 'up' : 'hang', blink: 0 }, x, Math.max(-0.55, y), -5.4, { roll: q(d >= 0 ? 0.12 * (i % 2 ? 1 : -1) : 0, 2), shadow: false }); }
      break; }
    case 'cat': { const t = ramp(f, 1473, 1490), y = lerp(4, 0.02, E.easeIn(t));
      out.push(C2('cat' + (t >= 1 ? 'land' : 'fall') + (f > 1517 ? 'smug' : ''), (p) => catCard(p, { pose: t >= 1 ? 'stand' : 'float', expr: f > 1500 ? 'smug' : t >= 1 ? 'calm' : 'shock' }), [7, y, -5.4], { s: 0.6, ground: 0.02, roll: q(t < 1 ? (1 - t) * 3 : 0, 2) })); break; }
    case 'who': for (let i = 0; i < 6; i++) H(i % 2 ? PJ[i % 4] : CIV[i], { seed: 30 + i, expr: 'nervous', blink: blinkAt(f, 30 + i) }, -6 + i * 2.6, -0.55, -5.6 + (i % 2) * 0.6, { roll: q(0.1 * (i % 2 ? 1 : -1), 2), shadow: false }); break;
    case 'guy': case 'follow': {
      const fl = S.id === 'follow' ? E.smooth(ramp(f, 1790, 1821)) * 0.6 : 0;
      H('host', { seed: 3, expr: 'snore', L: 'hang', R: 'hang', blink: 1 }, -1.6, 1.25 + fl, RZ - 0.6, { roll: q(-Math.PI / 2, 3), s: 0.9, shadow: false, blob: false });
      break; }
  }
  return out;
};

// ---------- 2D effects + HUD ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
const streak = (p) => { for (let i = 0; i < 4; i++) p.stroke([[300 + (i - 1.5) * 80, 80], [300 + (i - 1.5) * 80, 900]], 10, '#ffffffcc'); };
const hud = (C, t, sub, col, k, out) => { // number floating 3.2 m in front of the camera, upper half of the frame
  const fx = C.look[0] - C.pos[0], fy = C.look[1] - C.pos[1], fz = C.look[2] - C.pos[2], L = Math.hypot(fx, fy, fz), d = 3.2;
  const s = 0.62 * E.back(k, 2.2);
  out.push(FX('count' + t + sub + col, (p) => countCard(p, { t, sub, col }), [C.pos[0] + fx / L * d, C.pos[1] + fy / L * d - 0.25 * s * 2.25 + 0.28, C.pos[2] + fz / L * d], s, { order: 9 }));
};
export const fxAt = (f, T) => {
  const S = shotAt(f), C = camAt(f), out = [];
  const N = { one: '1', two: '2', three: '3', four: '4', five: '5' }[S.id];
  if (N) hud(C, N, S.id === 'five' && f > 1141 ? 'GRAVITY ON!' : 'SECOND', S.id === 'five' ? '#ff5a3a' : '#ffd23a', ramp(f, S.a, S.a + 8), out);
  if (S.id === 'hook' && f > 60) hud(C, '5', 'SECONDS', '#ffd23a', ramp(f, 60, 68), out);
  if (S.id === 'down' && f < 1210) for (let i = 0; i < 6; i++) out.push(FX('streak', streak, [-6 + i * 2.4, 4 + (i % 3) * 2, -3], 2.2, { alpha: 0.7 }));
  if (S.id === 'down' && f >= 1206) for (let i = 0; i < 6; i++) out.push(FX('dust' + q(ramp(f, 1206, 1240), 1), (p) => T.fxDust(p, ramp(f, 1206, 1240), '#e8e0d0'), [-7 + i * 3, 0, -4 - (i % 2) * 2], 2.0));
  if (S.id === 'butts') for (let i = 0; i < 5; i++) { const d = f - (1288 + i * 16); if (d >= 0 && d < 14) { const t = q(d / 14, 1);
    out.push(FX('dust' + t, (p) => T.fxDust(p, t, '#e8e0d0'), [-2.8 + i * 1.4, -0.1, -5.0], 0.6)); if (d < 8) out.push(FX('thud', (p) => wordCard(p, { t: 'THUD!', size: 120, rot: i % 2 ? 0.15 : -0.15 }), [-2.8 + i * 1.4, 1.2, -5.0], 0.7)); } }
  if (S.id === 'carcar' && f >= 1386 && f < 1406) out.push(FX('crunch', (p) => wordCard(p, { t: 'CRUNCH!', col: '#ff8a3a', size: 130 }), [-13, 4.2, -2], 1.6));
  if (S.id === 'carcar' && f >= 1386) out.push(FX('dustc' + q(ramp(f, 1386, 1410), 1), (p) => T.fxDust(p, ramp(f, 1386, 1410), '#e8e0d0'), [-13.5, 0.3, -2.5], 1.5));
  if (S.id === 'beach' && f >= 1438) for (let i = 0; i < 6; i++) { const t = q(ramp(f, 1438 + i * 2, 1466), 1); out.push(FX('spl' + t, (p) => { p.g.translate(0, 130); T.fxSplash(p, t); }, [BX - 20 + i * 8, 0.1, 2 + (i % 2) * 3], 4.5)); }
  if (S.id === 'cat' && f >= 1490 && f < 1504) out.push(FX('ring', (p) => T.fxBurst(p, ramp(f, 1490, 1504), '#fff3b0', 8, 30, 160), [7.2, 0.5, -5.2], 0.9));
  if (S.id === 'guy' || S.id === 'follow') out.push(FX('zzz' + q((f * 0.012) % 1, 2), (p) => zzzCard(p, { k: (f * 0.012) % 1 }), [-1.4, 1.5, RZ - 2.7], 0.9, { order: 6 }));
  return out;
};
