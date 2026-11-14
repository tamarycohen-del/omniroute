// "Einstein Wrote 9 x 10 = 91 on Purpose... Or Did He?" Timed to voice.mp3 (ElevenLabs Ethan, 55.84 s, 1676 frames @30).
import { M as E, camFromKeys, idle, blinkAt, walk, q, clamp, lerp, ramp } from './motion.js';
import { profCard, wordCard, tallyCard } from './props_ein.js';
import { babyCard, bigNum } from './props_nur.js';
import { gaugeCard, sprayCard, burstWord } from './props_snz.js';
import { ghostCard, drillCard, bubbleCard, rainCard } from './props_dn.js';
export const FPS = 30, TOTAL = 1676;
// ---- SNEEZE SHORT: phrase start/end times (s) from the voice track; shots are generated from these ----
export const PH = [[0, 3.69], [4.28, 5.94], [6.43, 8.75], [9.18, 10.18], [10.69, 12.43], [12.94, 18.88], [19.27, 19.6], [20.11, 22.1], [22.55, 24.1], [24.53, 26.37], [26.75, 28.09]];
export const SZ0 = 7000, SZ_END = 28.7, CHOO_T = 27.78;
const sf = (t) => SZ0 + Math.round(t * 30);
const KEDGE = (k) => (k === 0 ? 0 : (PH[k - 1][1] + PH[k][0]) / 2);
const KEND = (k) => (k === PH.length - 1 ? SZ_END : (PH[k][1] + PH[k + 1][0]) / 2);
const SZSHOTS = [];
const PRESS_SPLIT = (PH[5][0] + PH[5][1]) / 2;
for (let k = 0; k < PH.length; k++) {
  const light = k >= 4 && k <= 8 ? 'thr' : 'car';
  if (k === 0) { SZSHOTS.push({ id: 'z0', a: sf(0), b: sf(2.15) - 1, light: 'car' }); SZSHOTS.push({ id: 'z0b', a: sf(2.15), b: sf(KEND(0)) - 1, light: 'thr' }); }
  else if (k === 5) { SZSHOTS.push({ id: 'z5a', a: sf(KEDGE(5)), b: sf(PRESS_SPLIT) - 1, light }); SZSHOTS.push({ id: 'z5b', a: sf(PRESS_SPLIT), b: sf(KEND(5)) - 1, light }); }
  else SZSHOTS.push({ id: 'z' + k, a: sf(KEDGE(k)), b: sf(KEND(k)) - (k === PH.length - 1 ? 0 : 1), light });
}
export const SZ_FRAMES = [SZ0, sf(SZ_END)];
// ---- NOTEBOOK SHORT (frames 9000+): phrase times (s) from the voice; shots generated from these ----
export const DPH = [[0, 5.07], [5.69, 8.7], [9.36, 10.96], [11.57, 16.23], [16.75, 18.6], [19.19, 20.24], [20.72, 22.58], [23.06, 25.41], [25.85, 27.42], [27.94, 30.75], [31.32, 33.36], [34.06, 34.42], [34.92, 40.61]];
export const DN0 = 9000, DN_END = 41.2, DLAND = 4.55, DDIE = { 4: 16.95, 6: 22.31, 7: 25.09, 8: 26.82 };
const df = (t) => DN0 + Math.round(t * 30);
const DE = (k) => (k === 0 ? 0 : (DPH[k - 1][1] + DPH[k][0]) / 2), DEND = (k) => (k === DPH.length - 1 ? DN_END : (DPH[k][1] + DPH[k + 1][0]) / 2);
const DNSHOTS = [], dsplit = { 0: 0.62, 3: 0.3, 9: 0.55 };
const DLIGHT = (k) => (k <= 0 ? 'storm' : k === 6 ? 'cin' : k === 7 ? 'plane' : k === 8 ? 'class' : 'night');
for (let k = 0; k < DPH.length; k++) {
  const a = DE(k), b = DEND(k);
  if (dsplit[k] !== undefined) { const m = DPH[k][0] + (DPH[k][1] - DPH[k][0]) * dsplit[k]; DNSHOTS.push({ id: 'd' + k + 'a', a: df(a), b: df(m) - 1, light: DLIGHT(k) }, { id: 'd' + k + 'b', a: df(m), b: df(b) - 1, light: k === 0 ? 'storm' : 'night' }); }
  else DNSHOTS.push({ id: 'd' + k, a: df(a), b: df(b) - (k === DPH.length - 1 ? 0 : 1), light: DLIGHT(k) });
}
export const DN_FRAMES = [DN0, df(DN_END)];
export const SHOTS = [
  ...DNSHOTS,
  ...SZSHOTS,
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
  { id: 's1', a: 6000, b: 6099, light: 'car' }, // sneeze: holding it in, in the car
  { id: 's2', a: 6100, b: 6199, light: 'thr' }, // inside the windpipe, pressure rising
  { id: 's3', a: 6200, b: 6299, light: 'thr' }, // POP
  { id: 's4', a: 6300, b: 6399, light: 'car' }, // AH-CHOO
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
const SHOTS_BY = Object.fromEntries(DNSHOTS.map((x) => [x.id, x]));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const CZ = -1200, BZ = CZ - 4.82, NZ = -1400;

export const LIGHTS = {
  storm: { az: 30, el: 35, sky: '#9aa8c0', ground: '#3a4050', hemi: 1.1, sun: '#c8d4ec', sunI: 0.7, fog: '#5a6478', fogNear: 20, fogFar: 120,
    skyTop: '#2a3044', skyHor: '#5a6478', sat: 0.9, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.4, shadowExt: 10 },
  night: { az: 200, el: 30, sky: '#c8c0e8', ground: '#4a3a5a', hemi: 1.15, sun: '#9ab0ff', sunI: 0.5, fog: '#1a1830', fogNear: 30, fogFar: 160,
    skyTop: '#0a0c24', skyHor: '#1a2050', sat: 1.05, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.36, shadowExt: 8, lift: '#06040c' },
  cin: { az: 60, el: 40, sky: '#8890c0', ground: '#2a1020', hemi: 0.6, sun: '#000000', sunI: 0, fog: '#100810', fogNear: 20, fogFar: 80,
    skyTop: '#000', skyHor: '#000', sat: 1.1, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.42, shadowExt: 8 },
  plane: { az: 120, el: 30, sky: '#ffffff', ground: '#c8ccd8', hemi: 1.7, sun: '#ffffff', sunI: 0.8, fog: '#e8eef8', fogNear: 30, fogFar: 160,
    skyTop: '#7ec4f4', skyHor: '#e4f2fc', sat: 1.08, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.26, shadowExt: 8 },
  car: { az: 60, el: 38, sky: '#ffffff', ground: '#c8b8a8', hemi: 1.6, sun: '#fff0d8', sunI: 2.0, fog: '#d8e8f4', fogNear: 30, fogFar: 160,
    skyTop: '#7ec4f4', skyHor: '#e4f2fc', sat: 1.12, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.24, shadowExt: 8 },
  thr: { az: 60, el: 40, sky: '#ffb0b8', ground: '#5a1a24', hemi: 0.55, sun: '#000000', sunI: 0, fog: '#3a0a14', fogNear: 2, fogFar: 9,
    skyTop: '#000', skyHor: '#000', sat: 1.15, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.42, shadowExt: 8 },
  nur: { az: 180, el: 32, sky: '#ffffff', ground: '#f0dcd8', hemi: 1.75, sun: '#ffe6b8', sunI: 2.6, fog: '#f4e8e0', fogNear: 60, fogFar: 300,
    skyTop: '#9fd0f4', skyHor: '#eaf6ff', sat: 1.12, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.26, shadowExt: 9, lift: '#0a0604' },
  class: { az: 20, el: 40, sky: '#fff4e0', ground: '#7a5a3a', hemi: 1.4, sun: '#fff0d8', sunI: 1.6, fog: '#e8dcc0', fogNear: 60, fogFar: 200,
    skyTop: '#bfe0f8', skyHor: '#e8f2fa', sat: 1.1, waterDeep: '#000', waterShal: '#000', glint: '#000', vig: 0.24, shadowExt: 10 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });

const CAMS = {
  enter: [{ f: 0, pos: [0.4, 2.3, CZ + 5.6], look: [0.6, 1.8, BZ], fov: 50 }, { f: 144, pos: [0.4, 2.1, CZ + 4.6], look: [0.6, 2.0, BZ], fov: 46 }],
  ...(() => { const C = {}, A = (n) => SHOTS_BY[n].a, B = (n) => SHOTS_BY[n].b, RZ = -600, NB = [2.6, 0.98, -600 - 1.55], CN = -1800, PZ = -1900, OZ = -900;
    C.d0a = [{ f: A('d0a'), pos: [0.2, 0.4, 4.0], look: [0, 8, -2], fov: 60 }, { f: B('d0a'), pos: [0.2, 0.45, 3.9], look: [0, 5, -2], fov: 58 }];
    C.d0b = [{ f: A('d0b'), pos: [0.9, 1.3, 3.2], look: [0, 0.6, 0], fov: 42 }, { f: B('d0b'), pos: [0.7, 1.2, 2.6], look: [0, 0.7, 0], fov: 40 }];
    C.d1 = [{ f: A('d1'), pos: [1.6, 1.9, RZ + 1.4], look: [2.6, 1.1, RZ - 2.0], fov: 44 }, { f: B('d1'), pos: [1.9, 1.8, RZ + 0.9], look: [2.6, 1.1, RZ - 2.0], fov: 42 }];
    C.d2 = [{ f: A('d2'), pos: [NB[0] + 0.145, 1.78, NB[2] + 0.2], look: [NB[0] + 0.145, NB[1], NB[2] + 0.02], fov: 42 }, { f: B('d2'), pos: [NB[0] + 0.145, 1.68, NB[2] + 0.15], look: [NB[0] + 0.145, NB[1], NB[2] + 0.02], fov: 40 }];
    C.d3a = [{ f: A('d3a'), pos: [1.7, 1.55, RZ + 0.9], look: [2.6, 1.38, RZ - 2.35], fov: 38 }, { f: B('d3a'), pos: [1.85, 1.52, RZ + 0.55], look: [2.6, 1.4, RZ - 2.35], fov: 36 }];
    C.d3b = [{ f: A('d3b'), pos: [NB[0] - 0.12, 1.5, NB[2] + 0.16], look: [NB[0] - 0.12, NB[1], NB[2]], fov: 40 }, { f: B('d3b'), pos: [NB[0] - 0.1, 1.42, NB[2] + 0.12], look: [NB[0] - 0.1, NB[1], NB[2]], fov: 38 }];
    C.d4 = [{ f: A('d4'), pos: [-2.2, 1.5, RZ + 1.6], look: [-3.6, 1.2, RZ - 0.2], fov: 42 }, { f: B('d4'), pos: [-2.4, 1.45, RZ + 1.3], look: [-3.6, 1.1, RZ - 0.2], fov: 42 }];
    C.d5 = [{ f: A('d5'), pos: [2.3, 1.55, RZ - 0.5], look: [2.6, 1.5, RZ - 2.35], fov: 34 }, { f: B('d5'), pos: [2.35, 1.55, RZ - 0.7], look: [2.6, 1.5, RZ - 2.35], fov: 32 }];
    C.d6 = [{ f: A('d6'), pos: [1.0, 1.25, CN - 3.6], look: [0.35, 0.95, CN - 1.2], fov: 42 }, { f: B('d6'), pos: [0.9, 1.22, CN - 3.3], look: [0.35, 0.95, CN - 1.2], fov: 40 }];
    C.d7 = [{ f: A('d7'), pos: [0.4, 1.5, PZ - 0.85], look: [-0.55, 1.2, PZ + 0.35], fov: 46 }, { f: B('d7'), pos: [0.35, 1.48, PZ - 0.7], look: [-0.55, 1.2, PZ + 0.35], fov: 44 }];
    C.d8 = [{ f: A('d8'), pos: [2.1, 1.5, OZ - 0.6], look: [3.2, 1.15, OZ - 2.6], fov: 42 }, { f: B('d8'), pos: [2.2, 1.45, OZ - 0.85], look: [3.2, 1.1, OZ - 2.6], fov: 40 }];
    C.d9a = [{ f: A('d9a'), pos: [1.9, 1.6, RZ + 0.4], look: [2.6, 1.42, RZ - 2.35], fov: 38 }, { f: B('d9a'), pos: [2.0, 1.58, RZ + 0.1], look: [2.6, 1.44, RZ - 2.35], fov: 36 }];
    C.d9b = [{ f: A('d9b'), pos: [NB[0] + 0.14, 1.5, NB[2] + 0.16], look: [NB[0] + 0.14, NB[1], NB[2]], fov: 42 }, { f: B('d9b'), pos: [NB[0] + 0.14, 1.45, NB[2] + 0.13], look: [NB[0] + 0.14, NB[1], NB[2]], fov: 40 }];
    C.d10 = [{ f: A('d10'), pos: [NB[0] + 0.15, 1.42, NB[2] + 0.12], look: [NB[0] + 0.15, NB[1], NB[2]], fov: 40 }, { f: B('d10'), pos: [NB[0] + 0.15, 1.28, NB[2] + 0.06], look: [NB[0] + 0.15, NB[1], NB[2]], fov: 38 }];
    C.d11 = [{ f: A('d11'), pos: [2.45, 1.58, RZ - 0.75], look: [2.6, 1.52, RZ - 2.35], fov: 34 }, { f: B('d11'), pos: [2.5, 1.58, RZ - 0.95], look: [2.6, 1.52, RZ - 2.35], fov: 32 }];
    C.d12 = [{ f: A('d12'), pos: [NB[0] + 0.12, 1.75, NB[2] + 0.35], look: [NB[0] + 0.12, NB[1], NB[2]], fov: 42 }, { f: B('d12'), pos: [NB[0] + 0.12, 1.6, NB[2] + 0.28], look: [NB[0] + 0.12, NB[1], NB[2]], fov: 40 }];
    return C; })(),
  ...(() => { const C = {}, A = (k) => sf(KEDGE(k)), B = (k) => sf(KEND(k)) - 1, CZc = -1600, TZ = -1700;
    C.z0 = [{ f: A(0), pos: [0.25, 1.6, CZc + 1.55], look: [0, 1.48, CZc], fov: 38 }, { f: sf(2.15) - 1, pos: [0.22, 1.58, CZc + 1.3], look: [0, 1.5, CZc], fov: 36 }];
    C.z0b = [{ f: sf(2.15), pos: [0.0, 1.6, TZ - 0.05], look: [0.93, 1.65, TZ - 1.2], fov: 52 }, { f: B(0), pos: [0.3, 1.63, TZ - 0.45], look: [0.93, 1.65, TZ - 1.2], fov: 46 }];
    C.z1 = [{ f: A(1), pos: [1.3, 1.7, CZc + 2.6], look: [0, 1.35, CZc], fov: 44 }, { f: B(1), pos: [1.05, 1.68, CZc + 2.4], look: [0, 1.35, CZc], fov: 43 }];
    C.z2 = [{ f: A(2), pos: [-0.3, 1.6, CZc + 1.7], look: [0, 1.48, CZc], fov: 38 }, { f: B(2), pos: [-0.25, 1.58, CZc + 1.45], look: [0, 1.5, CZc], fov: 37 }];
    C.z3 = [{ f: A(3), pos: [0.15, 1.56, CZc + 1.5], look: [0, 1.52, CZc], fov: 36 }, { f: A(3) + 5, pos: [0.08, 1.55, CZc + 0.95], look: [0, 1.52, CZc], fov: 34, ease: 'easeOut' }, { f: B(3), pos: [0.07, 1.55, CZc + 0.9], look: [0, 1.52, CZc], fov: 34 }];
    C.z4 = [{ f: A(4), pos: [0, 1.5, TZ + 6.5], look: [0, 1.5, TZ - 3], fov: 70 }, { f: B(4), pos: [0, 1.5, TZ + 2.4], look: [0.1, 1.5, TZ - 3], fov: 62, ease: 'easeOut' }];
    C.z5a = [{ f: sf(KEDGE(5)), pos: [-0.25, 1.5, TZ + 2.4], look: [0.2, 1.5, TZ - 2], fov: 60 }, { f: sf(PRESS_SPLIT) - 1, pos: [-0.2, 1.5, TZ + 1.3], look: [0.3, 1.5, TZ - 2], fov: 58 }];
    C.z5b = [{ f: sf(PRESS_SPLIT), pos: [-0.4, 1.5, TZ + 0.5], look: [0.93, 1.62, TZ - 1.2], fov: 58 }, { f: sf(KEND(5)) - 1, pos: [-0.25, 1.52, TZ + 0.2], look: [0.93, 1.64, TZ - 1.2], fov: 54 }];
    C.z6 = [{ f: A(6), pos: [-0.3, 1.55, TZ + 0.25], look: [0.93, 1.65, TZ - 1.2], fov: 54 }, { f: B(6), pos: [-0.2, 1.55, TZ + 0.05], look: [0.93, 1.65, TZ - 1.2], fov: 52 }];
    C.z7 = [{ f: A(7), pos: [0.1, 1.62, TZ - 0.2], look: [0.93, 1.65, TZ - 1.2], fov: 50 }, { f: B(7), pos: [0.35, 1.64, TZ - 0.55], look: [0.93, 1.65, TZ - 1.2], fov: 46 }];
    C.z8 = [{ f: A(8), pos: [0.35, 1.64, TZ - 0.55], look: [0.93, 1.65, TZ - 1.2], fov: 46 }, { f: B(8), pos: [0.3, 1.62, TZ - 0.5], look: [0.93, 1.65, TZ - 1.2], fov: 48 }];
    C.z9 = [{ f: A(9), pos: [0.3, 1.6, CZc + 1.75], look: [0, 1.45, CZc], fov: 40 }, { f: B(9), pos: [0.26, 1.58, CZc + 1.5], look: [0, 1.46, CZc], fov: 39 }];
    C.z10 = [{ f: A(10), pos: [0.26, 1.58, CZc + 1.5], look: [0, 1.46, CZc], fov: 39 }, { f: sf(SZ_END), pos: [0.3, 1.6, CZc + 1.75], look: [0, 1.46, CZc], fov: 40, ease: 'easeOut' }];
    return C; })(),
  s1: [{ f: 6000, pos: [0.4, 1.65, -1600 + 2.5], look: [0, 1.4, -1600], fov: 42 }, { f: 6099, pos: [0.35, 1.62, -1600 + 2.1], look: [0, 1.42, -1600], fov: 40 }],
  s2: [{ f: 6100, pos: [-0.25, 1.5, -1700 + 2.6], look: [0.2, 1.5, -1700 - 2], fov: 60 }, { f: 6199, pos: [-0.2, 1.5, -1700 + 1.2], look: [0.3, 1.5, -1700 - 2], fov: 60 }],
  s3: [{ f: 6200, pos: [-0.35, 1.55, -1700 + 0.4], look: [0.93, 1.65, -1700 - 1.2], fov: 56 }, { f: 6299, pos: [-0.25, 1.55, -1700 + 0.1], look: [0.93, 1.65, -1700 - 1.2], fov: 54 }],
  s4: [{ f: 6300, pos: [0.3, 1.6, -1600 + 1.7], look: [0, 1.45, -1600], fov: 40 }, { f: 6399, pos: [0.25, 1.58, -1600 + 1.55], look: [0, 1.45, -1600], fov: 40 }],
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
const FLASH = [Math.round(DN0 + DLAND * 30), Math.round(DN0 + (DPH[11][0] + 0.1) * 30), 1217, Math.round(SZ0 + PH[6][0] * 30 + 2)];
export const camAt = (f) => { const S = shotAt(f); const c = camFromKeys(CAMS[S.id], f, { kicks: KICKS }); c.flash = 0; for (const a of FLASH) if (f >= a && f < a + 6) c.flash = (1 - (f - a) / 6) * 0.5; return c; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = { d0b: [0, 0.6, 0], d1: [2.6, 1.3, -602.35], d3a: [2.6, 1.4, -602.35], d4: [-3.6, 1.2, -600.2], d5: [2.6, 1.45, -602.35], d6: [0.35, 0.95, -1801.2], d7: [-0.55, 1.15, -1899.6], d8: [3.2, 1.2, -902.6], d9a: [2.6, 1.45, -602.35], d11: [2.6, 1.5, -602.35], z0: [0, 1.5, -1600], z1: [0, 1.45, -1600], z2: [0, 1.5, -1600], z3: [0, 1.5, -1600], z9: [0, 1.5, -1600], z10: [0, 1.5, -1600], s1: [0, 1.5, -1600], s4: [0, 1.5, -1600], n1: [-1.2, 1.0, NZ - 1.0], n2: [0, 0.9, NZ - 3.55], n4: [-1.55, 1.2, NZ - 1.0], h3a: [0.2, 1.1, CZ - 2.6], h3b: [0.2, 1.25, CZ - 2.6], h3c: [0.2, 1.0, CZ - 2.6], h3d: [0.2, 1.2, CZ - 2.6], hq: [0.2, 1.4, CZ - 2.6], hook: [1.05, 1.7, CZ - 4.45], waited: [2.0, 1.75, CZ - 4.2], turn: [2.0, 1.8, CZ - 4.2], world: [2.0, 1.8, CZ - 4.2], quote: [2.4, 1.7, CZ - 4.2], end: [-1.2, 1.25, CZ + 0.65], laugh: [0, 1.1, CZ + 1] };
export const dofAt = (f) => { const S = shotAt(f), C = camAt(f); if (FOCUS[S.id]) return { focus: dist(C.pos, FOCUS[S.id]), cinf: 7 }; return { focus: 30, cinf: 0 }; };

// rows on the board over time
const ROWT = [145, 206, 271, 350, 360, 370, 380, 390, 398, 457];
export const worldAt = (f) => { const S = shotAt(f);
  if (/^d\d/.test(S.id)) { const t = (f - DN0) / 30, k = parseInt(S.id.slice(1)), W = { lift: 0, fall: 0, space: false, board: { rows: 10, red: true, stamp: 0 } };
    if (k === 0) { const land = DLAND, u = Math.min(1, Math.max(0, (t - 0.2) / (land - 0.2))), y = 12 * (1 - u * u) + 0.03;
      W.nb = { fall: [0.1 + 0.25 * u, y, -1.5 + 1.9 * u, u < 1 ? t * 5 : 0, u < 1 ? t * 3 : 0.4, 0] }; }
    else { const list = (n, w) => ({ page: 'list', n, write: w });
      W.nb = k <= 2 ? { page: 'rule', glow: 0.7 + 0.3 * Math.sin(f * 0.4), pen: false } : k === 3 ? (S.id === 'd3b' ? list(1, Math.min(1, Math.max(0, (t - 13.2) / 2.4))) : { page: 'rule', glow: 0.6, pen: false })
        : k <= 5 ? list(1, 1) : k === 6 ? list(2, 1) : k === 7 ? list(3, 1) : k === 8 ? list(4, 1)
        : S.id === 'd9b' ? { ...list(4, 1), turn: Math.min(1, (t - DPH[9][0] - (DPH[9][1] - DPH[9][0]) * 0.55) / 0.6), pen: false }
        : k === 10 ? { page: 'his', n: 4, write: 1, reveal: Math.min(1, (t - DPH[10][0]) / 1.2), pen: false } : k === 11 ? { page: 'his', n: 4, pen: false } : { page: 'blank', pen: true, write: 0, n: 1, cta: Math.min(1, Math.max(0, (t - DPH[12][0] - 0.3) / 0.8)) }; }
    W.cinema = k === 6; W.bossSpin = k === 8 ? Math.max(0, t - DDIE[8] - 0.3) * 6 : 0;
    return W; }
  if (/^z[4-8]/.test(S.id) || S.id === 'z0b') { const t = (f - SZ0) / 30, popA = SZ0 + PH[6][0] * 30 + 2;
    const pr = S.id === 'z4' ? 0.1 : S.id.startsWith('z5') ? Math.min(1, E.easeIn(Math.max(0, (t - PH[5][0]) / (PH[5][1] - PH[5][0])))) : 0.3;
    const crack = S.id === 'z0b' ? 1 : f < popA ? 0 : S.id === 'z8' ? Math.max(0.02, 1 - Math.max(0, (t - PH[8][0] - 0.6) / 1.2)) : E.back(ramp(f, popA, popA + 8), 2);
    return { lift: 0, fall: 0, space: false, board: { rows: 10, red: true, stamp: 0 }, throat: { pressure: pr, crack, lightZ: S.id === 'z4' || S.id === 'z5a' ? -0.6 : 0.2 }, }; } if (S.id === 's2' || S.id === 's3') return { lift: 0, fall: 0, space: false, board: { rows: 10, red: true, stamp: 0 }, throat: { pressure: S.id === 's2' ? E.easeIn(ramp(f, 6110, 6195)) : 0.3, crack: S.id === 's3' ? E.back(ramp(f, 6202, 6210), 2) : 0, lightZ: S.id === 's2' ? -0.6 : 0.2 } }; if (/^n\d$/.test(S.id)) return { lift: 0, fall: 0, space: false, board: { rows: 10, red: true, stamp: 0 }, checks: S.id === 'n3' ? Math.min(9, Math.max(0, Math.floor((f - 5124) / 4))) : 9 }; let rows = S.id === 'hook' || S.id === 'walk' ? 0 : ROWT.filter((t) => f >= t).length;
  return { lift: 0, fall: 0, space: false, board: { rows, red: f >= 470 && S.id !== 'hook' && S.id !== 'walk', stamp: S.id === 'twist' && f >= 1250 ? Math.max(1, 2.2 - 1.2 * E.easeOut(ramp(f, 1250, 1258))) : 0 } }; };

const KIDS = ['civA', 'civB', 'civC', { tunic: '#e86a3a', skin: '#c99067', hair: '#1e1714' }, { tunic: '#5ab85a', skin: '#f5c9a0', hair: '#7a4a26', dress: '#e8a0c0' }, 'workB', { tunic: '#8ab8e8', skin: '#ecd0b6', hair: '#3b2a20' }, 'civA'];
const R = (T, who, o, pos, extra = {}) => ({ key: (typeof who === 'string' ? who : who.tunic) + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const life = (f, seed, o = {}) => { const I = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(I.bob, 3), headTilt: q(I.headTilt, 1), tilt: q(I.tilt * 0.6, 1), ...o }; };
const PROF_AT = (f) => { const S = shotAt(f); if (S.id === 'hook') return [1.05, CZ - 4.45]; if (S.id === 'walk') return [lerp(3.4, 1.65, E.smooth(ramp(f, 2500, 2595))), CZ - 4.2]; if (S.id === 'enter') return [lerp(5.5, 2.0, E.smooth(ramp(f, 10, 120))), CZ - 4.0]; if (S.id === 'board') return [1.65, CZ - 4.3]; return [2.0, CZ - 4.2]; };

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], id = S.id;
  if (id.startsWith('h3')) return out;
  if (/^d\d/.test(id)) { const t = (f - DN0) / 30, k = parseInt(id.slice(1)), pk = (t - DPH[k][0]) / Math.max(0.1, DPH[k][1] - DPH[k][0]);
    const HP = [2.6, 0, -602.35], die = (at) => E.easeIn(Math.max(0, Math.min(1, (t - at) / 0.45)));
    const add_ = (who, o, pos, sc, d = 0, side = 1) => out.push({ ...R(T, who, o, [pos[0], pos[1] - 0.55 * d, pos[2]], { s: sc, ground: d ? undefined : 0, blob: !d && pos[1] === 0 }), roll: side * 1.35 * d, key: (typeof who === 'string' ? who : who.tunic) + JSON.stringify(o) });
    const NEI = { tunic: '#e8e4d8', skin: '#e8b48a', moustache: '#3a2a20', stout: true }, SPO = { tunic: '#5a6ad8', skin: '#f0c8a0', hair: '#3a2418' }, KIDO = { tunic: '#f08a3a', skin: '#f5c9a0', hair: '#7a4a26' }, BOS = { tunic: '#2a2a34', skin: '#e8c0a0', hair: '#9a9a9a', brows: '#555555' };
    if (id === 'd0b') add_('host', life(f, 11, { expr: pk < 0.15 ? 'neutral' : 'shock', look: 0, headTilt: 4 }), [0, 0, 0], 0.92);
    if (id === 'd1') add_('host', life(f, 11, { expr: 'nervous', L: 'hang', R: 'hang' }), HP, 0.92);
    if (id === 'd3a') add_('host', life(f, 11, { expr: 'dazed', bob: q(0.004 * Math.sin(f * 2.3), 3) }), HP, 0.92);
    if (id === 'd4') { const at = DDIE[4], d = die(at), o = life(f, 21, { expr: d > 0 ? 'shock' : 'grin', R: 'hang', L: 'hang', bob: d ? 0 : q(0.006 * Math.sin(f * 3.1), 3) }), jig = d ? 0 : (f % 2) * 3;
      out.push({ key: 'nei' + JSON.stringify(o) + jig, draw: (p) => { T.romanFront(p, NEI, o); const g = p.g; g.save(); g.translate(417 + jig, 655 + 975 * (o.bob || 0) * 0); g.scale(0.55, 0.55); g.translate(-230, -505); drillCard(p); g.restore(); },
        x: -3.6, y: -0.55 * d, z: -600.2, s: 0.92, ground: d ? undefined : 0, blob: !d, roll: -1.35 * d }); }
    if (id === 'd5') add_('host', life(f, 11, { expr: 'scheme' }), HP, 0.92);
    if (id === 'd6') { const at = DDIE[6], d = die(at);
      add_(SPO, life(f, 31, { expr: d > 0 ? 'shock' : 'grin', R: d ? 'hang' : 'point' }), [0, -0.35, -1801.2], 0.9, d, -1);
      add_('host', life(f, 11, { expr: d > 0.5 ? 'scheme' : 'stern' }), [0.75, -0.35, -1801.2], 0.9); }
    if (id === 'd7') { const at = DDIE[7], d = die(at), kick = d ? 0 : Math.max(0, Math.sin(f * 0.9));
      add_('host', life(f, 11, { expr: d > 0.5 ? 'scheme' : 'pained', bob: q(0.02 * kick, 3) }), [-0.55, -0.12, -1900.0], 0.9);
      add_(KIDO, life(f, 41, { expr: 'grin', L: d ? 'hang' : 'up', R: 'hang' }), [-0.55, 0.55, -1899.05], 0.62, d, 1); }
    if (id === 'd8') { const at = DDIE[8], d = die(at);
      add_(BOS, life(f, 51, { expr: d > 0 ? 'shock' : 'stern', R: d ? 'hang' : 'point', L: 'hip' }), [3.2, -0.12, -902.55], 0.94, d, 1);
      }
    if (id === 'd9a') add_('host', life(f, 11, { expr: 'laugh', bob: q(0.012 * Math.abs(Math.sin(f * 0.6)), 3) }), HP, 0.92);
    if (id === 'd11') add_('host', life(f, 11, { expr: 'shock', blink: 0 }), HP, 0.92);
    return out; }
  if (/^z\d/.test(id)) { if (!/^z\d+$/.test(id)) return out; const k = +id.slice(1), t = (f - SZ0) / 30, pk = (t - PH[k][0]) / Math.max(0.1, PH[k][1] - PH[k][0]);
    let o;
    if (k === 0) o = life(f, 11, { expr: 'pained', L: 'nose', R: 'hang', blink: 0, bob: q(0.004 * Math.sin(f * 0.9), 3) });
    else if (k === 1) o = life(f, 11, { expr: 'smile', L: 'hang', R: 'hang', bob: q(0.006 * Math.sin(f * 0.5), 3) });
    else if (k === 2) o = life(f, 11, pk < 0.45 ? { expr: 'nervous', headTilt: q(-4 * Math.sin(f * 0.6), 1) } : { expr: 'pained', L: 'nose', blink: 0, bob: q(0.004 * Math.sin(f * 0.9), 3) });
    else if (k === 3) o = life(f, 11, { expr: 'pained', L: 'nose', blink: 0, bob: q(0.006 * Math.sin(f * 1.4), 3) });
    else if (k === 9) o = life(f, 11, { expr: pk < 0.5 ? 'nervous' : 'pained', headTilt: q(-3 - 5 * pk, 1), bob: q(-0.01 * pk, 3) });
    else if (k === 10) { const e = Math.max(0, Math.min(1, (t - CHOO_T + 0.1) / 0.2)); o = life(f, 11, { expr: e < 0.3 ? 'pained' : 'laugh', headTilt: q(6 * e, 1), bob: q(0.012 * e, 3) }); }
    if (o) out.push(R(T, 'host', o, [0, 0.1, -1600], { s: 0.92, ground: 0, blob: false }));
    return out; }
  if (id === 's1' || id === 's4') { const t = f - 6000;
    const o = id === 's1' ? life(f, 11, { expr: f < 6040 ? 'nervous' : 'pained', L: f >= 6040 ? 'nose' : 'hang', R: 'hang', blink: f >= 6040 ? 0 : undefined })
      : life(f, 11, { expr: f < 6320 ? 'pained' : 'laugh', L: 'hang', R: 'hang', headTilt: f >= 6320 ? -6 : 0 });
    out.push(R(T, 'host', o, [0, 0.1, -1600], { s: 0.92, ground: 0, blob: false })); return out; }
  if (id === 's2' || id === 's3') return out;
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
  if (/^d\d/.test(S.id)) { const t = (f - DN0) / 30, k = parseInt(S.id.slice(1));
    const ghost = (at, pos) => { const g = (t - at - 0.25) / 1.4; if (g > 0) out.push(FX('ghost' + Math.round(g * 20), (p) => ghostCard(p, { k: Math.min(1, g), t: f }), [pos[0], pos[1] + 0.5 + 0.5 * Math.min(1, g), pos[2]], 0.32, { order: 9 })); };
    if (S.id === 'd0a' || S.id === 'd0b') { const P = front(C, 0.9); out.push(FX('rain' + (f % 12), (p) => rainCard(p, { t: f }), [P[0], P[1] - 0.95 * 0.5, P[2]], 0.85, { order: 10 })); }
    if (S.id === 'd3a' && Math.floor(f / 4) % 3 !== 0) { const P = front(C, 1.3); out.push(FX('brrr' + (f % 2), (p) => wordCard(p, { t: 'BRRRRR!', col: '#ffd23a', size: 120, rot: -0.12 + (f % 2) * 0.05 }), [P[0] - 0.12, P[1] + 0.25, P[2]], 0.2, { order: 9 })); }
    if (S.id === 'd4') ghost(DDIE[4], [-3.6, 0.8, -600.2]);
    if (S.id === 'd6') { const at = DDIE[6]; if (t < at) out.push(FX('bub', (p) => bubbleCard(p, { t: 'HE DIES AT\nTHE END—', size: 58 }), [-0.35, 1.2, -1801.5], 0.26, { order: 9 })); ghost(at, [0, 0.35, -1801.2]); }
    if (S.id === 'd7') ghost(DDIE[7], [-0.55, 0.75, -1899.05]);
    if (S.id === 'd8') ghost(DDIE[8], [3.2, 0.6, -902.55]);
    if (S.id === 'd11' && t > DPH[11][0] + 0.15) { const kk = Math.min(1, (t - DPH[11][0] - 0.15) / 0.3); out.push(FX('halo' + Math.round(kk * 6), (p) => { const g = p.g; g.save(); g.globalAlpha = kk; g.strokeStyle = '#f2c230'; g.lineWidth = 26; g.shadowColor = '#fff2a0'; g.shadowBlur = 30; g.beginPath(); g.ellipse(300, 500, 170, 44, 0, 0, 7); g.stroke(); g.restore(); }, [2.6, 1.42, -602.3], 0.3, { order: 9 })); }
  }
  if (/^z\d/.test(S.id)) { const t = (f - SZ0) / 30;
    if (S.id === 'z5a' || S.id === 'z5b') { const nd = S.id === 'z5b' ? 0.7 : 1.6, P = front(C, nd), v = Math.min(1, E.easeIn(Math.max(0, (t - PH[5][0]) / (PH[5][1] - PH[5][0])))), sh = v > 0.7 ? Math.sin(f * 2.1) * 0.05 : 0;
      out.push(FX('gauge' + Math.round(v * 60) + (sh > 0), (p) => gaugeCard(p, { v, shake: sh }), [P[0], P[1] + 0.06 * nd / 1.6, P[2]], 0.3 * nd / 1.6, { order: 9 })); }
    if (S.id === 'z6') { const a = Math.round(SZ0 + PH[6][0] * 30 + 2); if (f >= a) { const P = front(C, 0.7); out.push(FX('pop', (p) => burstWord(p, { t: 'POP!', size: 170 }), [P[0], P[1] + 0.09, P[2]], 0.13 * pop(a), { order: 9 })); } }
    if (S.id === 'z8') { const P = front(C, 1.5), a = Math.round(SZ0 + PH[8][0] * 30 + 20); if (f >= a) out.push(FX('healed', (p) => burstWord(p, { t: 'HEALED', size: 120, bg: '#c8f5c0', col: '#1f8a3a' }), [P[0], P[1] + 0.22, P[2]], 0.26 * pop(a), { order: 9 })); }
    if (S.id === 'z9' && t > PH[9][0] + 0.4) { const P = front(C, 1.4); out.push(FX('ahah' + (t > PH[9][0] + 1.2), (p) => wordCard(p, { t: t > PH[9][0] + 1.2 ? 'AH... AH...' : 'AH...', col: '#ffffff', size: 92, rot: -0.08 }), [P[0] - 0.05, P[1] + 0.3, P[2]], 0.22, { order: 9 })); }
    if (S.id === 'z10') { const a = Math.round(SZ0 + CHOO_T * 30), P = front(C, 1.2);
      if (f >= a) { out.push(FX('spray' + Math.min(10, Math.floor((f - a) / 2)), (p) => sprayCard(p, { k: Math.min(1, (f - a) / 18) }), [P[0] + 0.2, P[1] - 0.3, P[2]], 0.34, { order: 8 }));
        out.push(FX('achoo', (p) => burstWord(p, { t: 'AH-CHOO!', size: 104, bg: '#bfe8ff', col: '#1f6ad8' }), [P[0] - 0.08, P[1] + 0.12, P[2]], 0.22 * pop(a), { order: 9 })); } }
    if (S.id === 'z0' && t > 1.2) { const P = front(C, 1.4); out.push(FX('hookq', (p) => burstWord(p, { t: 'DON\'T!', size: 130 }), [P[0] + 0.15, P[1] + 0.3, P[2]], 0.18 * pop(SZ0 + 36), { order: 9 })); }
  }
  if (S.id === 's2') { const P = front(C, 1.6), v = E.easeIn(ramp(f, 6110, 6195)) * 0.96, sh = v > 0.7 ? Math.sin(f * 2.1) * 0.04 : 0;
    out.push(FX('gauge' + Math.round(v * 60) + (sh > 0), (p) => gaugeCard(p, { v, shake: sh }), [P[0] + 0.14, P[1] + 0.02, P[2]], 0.32, { order: 9 })); }
  if (S.id === 's3' && f >= 6204) { const P = front(C, 1.5); out.push(FX('pop', (p) => burstWord(p, { t: 'POP!', size: 170 }), [P[0] - 0.12, P[1] + 0.2, P[2]], 0.3 * pop(6204), { order: 9 })); }
  if (S.id === 's4' && f >= 6320) { const P = front(C, 1.2);
    out.push(FX('spray' + Math.min(10, Math.floor((f - 6320) / 2)), (p) => sprayCard(p, { k: Math.min(1, (f - 6320) / 20) }), [P[0] + 0.2, P[1] - 0.3, P[2]], 0.34, { order: 8 }));
    out.push(FX('achoo', (p) => burstWord(p, { t: 'AH-CHOO!', size: 104, bg: '#bfe8ff', col: '#1f6ad8' }), [P[0] - 0.08, P[1] + 0.12, P[2]], 0.22 * pop(6322), { order: 9 })); }
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
