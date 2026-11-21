// "What If You Could See How Many Times You'll Ever See Someone Again?" Timed to voice.mp3 (ElevenLabs Ethan, 70.16 s, 2105 frames @30).
import { M as E, camFromKeys, idle, blinkAt, walk, q, clamp, lerp, ramp } from './motion.js';
import { tagCard, phoneCard, mathCard, wordCard, mowerCard } from './props_see.js';
export const FPS = 30, TOTAL = 2105;
export const SHOTS = [
  { id: 'wake', a: 0, b: 146, light: 'room' },
  { id: 'notage', a: 147, b: 212, light: 'day' },
  { id: 'exact', a: 213, b: 319, light: 'day' },
  { id: 'bus', a: 320, b: 387, light: 'day' },
  { id: 'another', a: 388, b: 442, light: 'day' },
  { id: 'gas', a: 443, b: 515, light: 'day' },
  { id: 'most', a: 516, b: 641, light: 'day' },
  { id: 'coworker', a: 642, b: 754, light: 'office' },
  { id: 'neighbor', a: 755, b: 1004, light: 'day' },
  { id: 'laugh', a: 1005, b: 1166, light: 'day' },
  { id: 'call', a: 1167, b: 1275, light: 'room' },
  { id: 'reveal', a: 1276, b: 1329, light: 'room' },
  { id: 'freeze', a: 1330, b: 1364, light: 'room' },
  { id: 'math', a: 1365, b: 1578, light: 'room' },
  { id: 'sense', a: 1579, b: 1632, light: 'room' },
  { id: 'weird', a: 1633, b: 1791, light: 'day' },
  { id: 'formula', a: 1792, b: 1899, light: 'day' },
  { id: 'know', a: 1900, b: 1985, light: 'room' },
  { id: 'change', a: 1986, b: 2053, light: 'room' },
  { id: 'visit', a: 2054, b: 2104, light: 'day' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const RZ = -600, OZ = -900;

// ---------- lights ----------
export const LIGHTS = {
  day: { az: 120, el: 48, sky: '#cfe0f4', ground: '#7a9a5a', hemi: 1.2, sun: '#fff4e0', sunI: 2.5, fog: '#d6e6f4', fogNear: 80, fogFar: 900,
    skyTop: '#3d8ae0', skyHor: '#cfe6f8', sat: 1.12, waterDeep: '#2c7ca0', waterShal: '#5ac0d8', glint: '#effaff', vig: 0.18, shadowExt: 22 },
  room: { az: 40, el: 60, sky: '#ffe8c8', ground: '#5a3a3a', hemi: 1.35, sun: '#ffe0b0', sunI: 1.4, fog: '#2a2040', fogNear: 60, fogFar: 200,
    skyTop: '#f2c8a0', skyHor: '#ffe0c0', sat: 1.08, gain: '#fff4e8', waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.28, shadowExt: 10 },
  office: { az: 60, el: 70, sky: '#ffffff', ground: '#8a8a94', hemi: 1.5, sun: '#ffffff', sunI: 1.3, fog: '#e8e8f0', fogNear: 60, fogFar: 200,
    skyTop: '#e8e8f0', skyHor: '#e8e8f0', sat: 1.06, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.22, shadowExt: 10 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------- cameras ----------
const ROOMCAM = { pos: [0.9, 1.6, RZ + 2.2], look: [0.5, 1.5, RZ - 1.2] };
const CAMS = {
  wake: [{ f: 0, pos: [0.9, 1.7, RZ + 2.6], look: [0.4, 1.4, RZ - 1.4], fov: 46 }, { f: 146, pos: [0.8, 1.7, RZ + 1.4], look: [0.5, 1.7, RZ - 1.2], fov: 40 }],
  notage: [{ f: 147, pos: [0.4, 1.8, 2.2], look: [0, 1.9, -5.6], fov: 44 }, { f: 212, pos: [0.4, 1.8, 1.4], look: [0, 1.95, -5.6], fov: 42 }],
  exact: [{ f: 213, pos: [-0.6, 1.9, 0.6], look: [-0.4, 1.8, -5.6], fov: 40 }, { f: 319, pos: [-0.6, 1.9, -0.6], look: [-0.4, 1.8, -5.6], fov: 38 }],
  bus: [{ f: 320, pos: [39.6, 1.8, -3.6], look: [39.3, 1.7, -7.0], fov: 38 }, { f: 387, pos: [39.5, 1.8, -4.0], look: [39.3, 1.8, -7.0], fov: 34 }],
  another: [{ f: 388, pos: [41.2, 1.8, -3.8], look: [41.0, 1.7, -7.1], fov: 38 }, { f: 442, pos: [41.1, 1.8, -4.2], look: [41.0, 1.8, -7.1], fov: 34 }],
  gas: [{ f: 443, pos: [-40.2, 1.8, -3.6], look: [-40.6, 1.7, -7.6], fov: 40 }, { f: 515, pos: [-40.3, 1.8, -4.2], look: [-40.6, 1.8, -7.6], fov: 36 }],
  most: [{ f: 516, pos: [-2, 3.4, 5], look: [0, 1.6, -5.6], fov: 50 }, { f: 641, pos: [2, 3.2, 4.4], look: [0, 1.6, -5.6], fov: 50 }],
  coworker: [{ f: 642, pos: [2.0, 1.7, OZ + 2.0], look: [2.9, 1.6, OZ - 1.2], fov: 40 }, { f: 754, pos: [2.3, 1.7, OZ + 1.2], look: [2.9, 1.7, OZ - 1.2], fov: 36 }],
  neighbor: [{ f: 755, pos: [10.4, 1.6, -3.2], look: [10.2, 1.5, -9.5], fov: 42 }, { f: 934, pos: [10.4, 1.7, -4.4], look: [10.2, 1.7, -9.5], fov: 38 }, { f: 1004, pos: [10.4, 1.9, -5.4], look: [10.2, 2.0, -9.5], fov: 34 }],
  laugh: [{ f: 1005, pos: [6.3, 1.75, -2.4], look: [6.0, 1.75, -5.6], fov: 38 }, { f: 1166, pos: [6.25, 1.8, -3.0], look: [6.0, 1.85, -5.6], fov: 32 }],
  call: [{ f: 1167, ...ROOMCAM, fov: 44 }, { f: 1275, pos: [0.85, 1.6, RZ + 1.9], look: [0.5, 1.5, RZ - 1.2], fov: 42 }],
  reveal: [{ f: 1276, pos: [0.85, 1.6, RZ + 1.9], look: [0.5, 1.5, RZ - 1.2], fov: 42 }, { f: 1329, pos: [0.82, 1.6, RZ + 1.7], look: [0.5, 1.5, RZ - 1.2], fov: 40 }],
  freeze: [{ f: 1330, pos: [0.65, 1.6, RZ + 0.6], look: [0.55, 1.6, RZ - 1.2], fov: 34 }, { f: 1364, pos: [0.62, 1.6, RZ + 0.3], look: [0.55, 1.6, RZ - 1.2], fov: 30 }],
  math: [{ f: 1365, pos: [2.6, 1.7, RZ + 1.0], look: [0.5, 1.5, RZ - 1.2], fov: 44 }, { f: 1578, pos: [2.3, 1.7, RZ + 0.6], look: [0.5, 1.5, RZ - 1.2], fov: 42 }],
  sense: [{ f: 1579, pos: [2.3, 1.7, RZ + 0.6], look: [0.5, 1.5, RZ - 1.2], fov: 42 }, { f: 1632, pos: [2.2, 1.7, RZ + 0.4], look: [0.5, 1.5, RZ - 1.2], fov: 40 }],
  weird: [{ f: 1633, pos: [-3, 2.4, 6], look: [0, 1.8, -5.6], fov: 50 }, { f: 1791, pos: [3, 2.2, 5], look: [0, 1.9, -5.6], fov: 46 }],
  formula: [{ f: 1792, pos: [3, 2.2, 5], look: [0, 1.9, -5.6], fov: 46 }, { f: 1899, pos: [3.4, 2.4, 4.4], look: [0, 2.0, -5.6], fov: 44 }],
  know: [{ f: 1900, ...ROOMCAM, fov: 44 }, { f: 1985, pos: [0.85, 1.6, RZ + 1.9], look: [0.5, 1.5, RZ - 1.2], fov: 42 }],
  change: [{ f: 1986, pos: [0.85, 1.6, RZ + 1.9], look: [0.5, 1.5, RZ - 1.2], fov: 42 }, { f: 2053, pos: [0.82, 1.6, RZ + 1.7], look: [0.5, 1.5, RZ - 1.2], fov: 40 }],
  visit: [{ f: 2054, pos: [0.3, 1.8, -2.4], look: [0, 1.8, -5.6], fov: 42 }, { f: 2104, pos: [0.3, 1.7, -1.6], look: [0, 1.8, -5.6], fov: 44 }],
};
const KICKS = [{ f: 362, a: 0.015 }, { f: 414, a: 0.015 }, { f: 488, a: 0.015 }, { f: 697, a: 0.02 }, { f: 935, a: 0.03 }, { f: 1276, a: 0.04 }];
const FLASH = [147, 1276];
export const camAt = (f) => { const S = shotAt(f); const c = camFromKeys(CAMS[S.id], f, { kicks: KICKS }); c.flash = 0; for (const a of FLASH) if (f >= a && f < a + 6) c.flash = (1 - (f - a) / 6) * 0.5; return c; };

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = { wake: [0.5, 1.6, RZ - 1.2], exact: [-1.0, 1.8, -5.6], bus: [39.3, 1.8, -7.0], another: [41, 1.8, -7.1], gas: [-40.6, 1.8, -7.6], coworker: [2.9, 1.7, OZ - 1.2],
  neighbor: [10.2, 1.7, -9.5], laugh: [6, 1.8, -5.6], freeze: [0.55, 1.6, RZ - 1.2], visit: [0, 1.6, -5.6] };
const HUDSHOT = { call: 1, reveal: 1, know: 1, change: 1, math: 1, sense: 1, formula: 1 };
export const dofAt = (f) => { const S = shotAt(f), C = camAt(f);
  if (HUDSHOT[S.id]) return { focus: S.id === 'formula' ? 3 : 1.25, cinf: S.id === 'formula' || S.id === 'math' || S.id === 'sense' ? 10 : 8, near: 0 };
  if (FOCUS[S.id]) return { focus: dist(C.pos, FOCUS[S.id]), cinf: 7 }; return { focus: 30, cinf: 0 }; };

export const worldAt = (f) => ({ lift: 0, fall: 0, space: false });

// ---------- cast ----------
const MOM = { tunic: '#7a5ab8', skin: '#f3d2b4', hair: '#6a4a30', dress: '#7a5ab8' };
const NEIGH = { tunic: '#e8c23a', skin: '#ecc8a8', cap: '#3a6a3a', moustache: '#6a4a30', stout: true };
const COWORK = { tunic: '#4a6ab8', skin: '#c99067', hair: '#1e1714', glasses: true };
const ATTEND = { tunic: '#e8453a', skin: '#f5c9a0', cap: '#e8453a' };
const STR1 = { tunic: '#5d8a3a', skin: '#c99067', hair: '#1e1714' }, STR2 = { tunic: '#d9a441', skin: '#f5c9a0', hair: '#7a4a26', dress: '#c25a7a' };
const WALKERS = ['civA', 'civB', 'civC', 'workA', 'workB', STR1, STR2, 'sailorB', 'civA', 'civC'];
const R = (T, who, o, pos, extra = {}) => ({ key: (typeof who === 'string' ? who : who.tunic) + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), headTilt: q(I.headTilt, 1), tilt: q(I.tilt * 0.6, 1), ...o }; };

export const WX = (f, i, n, cx = 0) => { const dir = i % 2 ? 1 : -1, w = walk(f, 0, 0.7, 0.6); return cx + (i - (n - 1) / 2) * 1.5 + dir * (((w.dist + i * 1.3) % 3) - 1.5); };
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'room' ? '#fff0e0' : '#ffffff';
  const H = (who, o, x, z, extra = {}) => out.push(R(T, who, o, [x, extra.y ?? 0, z], { ground: extra.y ?? 0, tint, ...extra }));
  const street = (n, z = -5.6, cx = 0) => { for (let i = 0; i < n; i++) { const x = WX(f, i, n, cx), dir = i % 2 ? 1 : -1;
    H(WALKERS[i % 10], { seed: 40 + i, expr: 'neutral', blink: blinkAt(f, 40 + i), step: q(walk(f, i * 7, 1.0, 0.6).phase, 1), look: dir * 0.5, facing: dir }, x, z + (i % 3) * 0.3); } };
  switch (S.id) {
    case 'wake': H('host', life(f, 3, { expr: f < 60 ? 'squint' : f < 100 ? 'smile' : 'shock', L: f < 60 ? 'up' : 'hang', R: f < 60 ? 'up' : 'hang', look: f > 100 ? 0.3 : 0 }), 0.5, RZ - 1.2); break;
    case 'notage': street(5); break;
    case 'exact': street(4); H('host', life(f, 3, { expr: 'shock', look: -0.5, facing: -1 }), -0.6, -3.6); break;
    case 'bus': H(STR1, life(f, 21, { expr: 'neutral', look: 0.3 }), 39.3, -7.0); break;
    case 'another': H(STR2, life(f, 22, { expr: 'smile', look: -0.3 }), 41.0, -7.1); break;
    case 'gas': H(ATTEND, life(f, 23, { expr: 'smile', L: 'hip' }), -40.6, -7.6); break;
    case 'most': street(10); street(6, 5.6); break;
    case 'coworker': H(COWORK, life(f, 24, { expr: f > 697 ? 'grin' : 'neutral', R: f > 700 ? 'wave' : 'hang', wv: q(f * 0.4, 1) }), 2.9, OZ - 1.2); break;
    case 'neighbor': H(NEIGH, life(f, 25, { expr: f > 935 ? 'grin' : 'neutral', L: 'reach', R: 'reach', step: q(walk(f, 755, 0.5, 0.5).phase, 1) }), 10.2 + Math.sin(f * 0.02) * 0.8, -9.5);
      out.push({ key: 'mower', draw: (p) => mowerCard(p), x: 10.8 + Math.sin(f * 0.02) * 0.8, y: 0, z: -9.4, s: 0.55, blob: false }); break;
    case 'laugh': H('host', life(f, 3, { expr: f < 1039 ? 'laugh' : 'nervous', L: f < 1039 ? 'belly' : 'hang', R: f < 1039 ? 'belly' : 'hang', bob: q(f < 1039 ? 0.012 * Math.abs(Math.sin(f * 0.6)) : 0, 3) }), 6.0, -5.6);
      H(NEIGH, life(f, 25, { expr: 'grin', R: 'wave', wv: q(f * 0.35, 1) }), 9.5, -9.5); break;
    case 'math': case 'sense': H('host', life(f, 3, { expr: 'nervous', L: 'cheek' }), 0.5, RZ - 1.2); break;
    case 'weird': case 'formula': street(5); H('host', life(f, 3, { expr: S.id === 'weird' ? 'smile' : 'neutral', look: 0.3 }), 0.3, -5.0); break;
    case 'freeze': H('host', { seed: 3, expr: 'shock', blink: 0 }, 0.6, RZ - 1.2); break;
    case 'visit': H('host', life(f, 3, { expr: 'grin', R: 'thumb' }), 0, -5.6); break;
  }
  return out;
};

// ---------- tags, phone and math HUD ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 7, ...extra });
const tagAt = (out, t, x, z, k = 1, col, y0 = 0, s = 0.36) => out.push(FX('tag' + t + col + q(k, 1), (p) => { const g = p.g; g.save(); g.translate(300, 680); g.scale(k, k); g.translate(-300, -680); tagCard(p, { t, col }); g.restore(); }, [x, y0 + 2.05, z], s));
const front = (C, d) => { const fx = C.look[0] - C.pos[0], fy = C.look[1] - C.pos[1], fz = C.look[2] - C.pos[2], L = Math.hypot(fx, fy, fz); return [C.pos[0] + fx / L * d, C.pos[1] + fy / L * d, C.pos[2] + fz / L * d]; };
const phoneAt = (out, f, T, C, tag, k) => { const s = 0.36, P = front(C, 1.25); out.push(FX('phone' + tag + q(k, 1), (p) => phoneCard(p, { T, mom: MOM, opts: { seed: 8, expr: 'smile', blink: 0, R: 'wave', wv: 0.6 }, tag, k }), [P[0], P[1] - 0.5 * 2.25 * s + 0.02, P[2]], s, { order: 8 })); };
const mathAt = (out, C, lines, hi, d = 1.6) => { const s = 0.62 * d / 2.6, P = front(C, d); out.push(FX('math' + lines.join('|') + hi, (p) => mathCard(p, { lines, hi }), [P[0], P[1] - 0.55 * 2.25 * s + 0.2 * d, P[2]], s, { order: 9 })); };
const n = (v) => v.toLocaleString('en-US');
export const fxAt = (f, T) => {
  const S = shotAt(f), C = camAt(f), out = [];
  const pop = (a) => E.back(ramp(f, a, a + 8), 2.2);
  switch (S.id) {
    case 'wake': if (f > 108) tagAt(out, '?', 0.5, RZ - 1.2, pop(108), '#a8a8b8'); break;
    case 'notage': for (let i = 0; i < 5; i++) { const x = WX(f, i, 5);
      const r = Math.floor((f / 4) + i * 7) % 97; tagAt(out, String(f < 177 ? 18 + (r % 60) : 150 + (r % 45)), x, -5.6 + (i % 3) * 0.3, 1, f < 177 ? '#8ad0ff' : '#a8e88a'); } break;
    case 'exact': for (let i = 0; i < 4; i++) { const x = WX(f, i, 4); tagAt(out, ['0', '0', '3', '0'][i], x, -5.6 + (i % 3) * 0.3, 1, '#ffd23a'); } break;
    case 'bus': tagAt(out, f < 362 ? '?' : '0', 39.3, -7.0, f < 362 ? 1 : pop(362), f < 362 ? '#a8a8b8' : '#ffd23a'); break;
    case 'another': tagAt(out, f < 414 ? '?' : '0', 41.0, -7.1, f < 414 ? 1 : pop(414), f < 414 ? '#a8a8b8' : '#ffd23a'); break;
    case 'gas': tagAt(out, f < 488 ? '?' : '0', -40.6, -7.6, f < 488 ? 1 : pop(488), f < 488 ? '#a8a8b8' : '#ffd23a'); break;
    case 'most': for (let i = 0; i < 10; i++) { const x = WX(f, i, 10); tagAt(out, '0', x, -5.6 + (i % 3) * 0.3, 1, '#ffd23a', 0, 0.5); }
      for (let i = 0; i < 6; i++) { const x = WX(f, i, 6); tagAt(out, '0', x, 5.6 + (i % 3) * 0.3, 1, '#ffd23a', 0, 0.5); } break;
    case 'coworker': tagAt(out, f < 697 ? '?' : n(2400), 2.9, OZ - 1.2, f < 697 ? 1 : pop(697), f < 697 ? '#a8a8b8' : '#8ad0ff'); break;
    case 'neighbor': tagAt(out, f < 935 ? '?' : n(2900), 10.2 + Math.sin(f * 0.02) * 0.8, -9.5, f < 935 ? 1 : pop(935), f < 935 ? '#a8a8b8' : '#ff5a5a'); break;
    case 'laugh': tagAt(out, n(2900), 9.5, -9.5, 1, '#ff5a5a'); if (f < 1036) out.push(FX('haha', (p) => wordCard(p, { t: 'HA HA!', col: '#ffd23a', size: 120 }), [6.5, 2.2, -5.4], 0.6)); break;
    case 'call': phoneAt(out, f, T, C, f >= 1221 ? '?' : '', f >= 1221 ? pop(1221) : 1); break;
    case 'reveal': phoneAt(out, f, T, C, '288', pop(1276)); break;
    case 'math': { const L = ['3 visits / year']; if (f >= 1468) L.push('× 4 days'); if (f >= 1526) L.push('= 12 days / year'); mathAt(out, C, L, L.length - 1); break; }
    case 'sense': mathAt(out, C, ['12 days × 24 years', '= 288'], f >= 1590 ? 1 : 0); break;
    case 'weird': for (let i = 0; i < 5; i++) { const x = WX(f, i, 5); tagAt(out, ['0', n(1200), '7', '0', '45'][i], x, -5.6 + (i % 3) * 0.3, 1, '#ffd23a'); }
      if (f >= 1714) mathAt(out, C, ['IT\'S MATH'], 0, 1.8); break;
    case 'formula': mathAt(out, C, ['how often', '× years left', '= YOUR NUMBER'], f >= 1860 ? 2 : f >= 1830 ? 1 : 0, 1.8); break;
    case 'know': phoneAt(out, f, T, C, '288', 1); break;
    case 'change': phoneAt(out, f, T, C, String(288 + Math.max(0, Math.floor((f - 2018) / 5))), 1); break;
    case 'visit': tagAt(out, '300+', 0, -5.6, pop(2058), '#ff8a5a'); break;
  }
  return out;
};
