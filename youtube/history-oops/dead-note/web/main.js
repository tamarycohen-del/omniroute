import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
T.Q.on = !location.hash.includes('lq');
import * as P from './paint.js';
import { boardDraw } from './props_ein.js';
import { SHOTS, TOTAL, shotAt, camAt, dofAt, LIGHTS, lightFor, actorsAt, worldAt, fxAt, host3dAt } from './story.js';
import { createHost } from './char3d.js';
import { paintPages } from './props_dn.js';

const SS = location.hash.includes('lq') ? 1 : 2; // supersample: render at 2x, downscale later
const W = 1080 * SS, H = 1920 * SS;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.08, 1500);
const rx = (a) => a * Math.PI / 180;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });
const M = {
  plank: texM(P.planks(1), 1, 6), beam: texM(P.beam(2), 1, 2), beamDark: texM(P.beam(3, [28, 36, 30]), 1, 2),
  rot: texM(P.rotten(4), 1, 1), rotB: texM(P.rotten(14), 1, 1),
  stone: texM(P.stone(4), 1, 1), stoneMoss: texM(P.mossy(P.stone(4), 5, 1.2), 1, 1),
  grass: texM(P.grass(6), 40, 40), dirt: texM(P.dirt(7), 6, 30), plaster: texM(P.plaster(8), 1, 1), plaster2: texM(P.plaster(18, 28), 1, 1),
  roof: texM(P.roof(9), 2, 2), marble: texM(P.marble(10), 1, 1), marbleTop: toon({ color: '#ece2cf' }),
  trunk: toon({ color: '#6a4a32' }), cypress: toon({ color: '#3f6b36' }), pine: toon({ color: '#5c8a3c' }), bush: toon({ color: '#6c9a42' }),
  hill: toon({ color: '#7aa64c' }), hillFar: toon({ color: '#86ad60' }), mount: toon({ color: '#8fa7b8' }), snow: toon({ color: '#f4f6fa' }),
  iron: toon({ color: '#5c5a57' }), bronze: toon({ color: '#b08a4a' }), wood: toon({ color: '#7a5434' }), door: toon({ color: '#5a3a24' }),
  window: toon({ color: '#2b2430' }), red: toon({ color: '#b8282b' }),
};
M.banner = new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(P.banner()), alphaTest: 0.5, side: THREE.DoubleSide });
// helmet
const helmetIn = P.tex(P.helmetInside()); helmetIn.wrapS = helmetIn.wrapT = THREE.ClampToEdgeWrapping;
M.helmIn = new THREE.MeshToonMaterial({ gradientMap: grad, map: helmetIn, side: THREE.BackSide });
M.helmOut = toon({ color: '#8f8a7e' });

// ---------- ink / normal-depth contract ----------
const NOINK = 'noink'; // userData flag: never outlined (cards, fx, water handled specially)
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});
const ndNoInk = new THREE.ShaderMaterial({ // 3D characters: depth only, never outlined (soft 3D look)
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(0.,0.,0.,vD); }`, side: THREE.DoubleSide });
const waterNd = new THREE.ShaderMaterial({
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`,
});

// ---------- helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = true; parent.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const uvScale = (geo, su, sv) => { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return geo; };
/** box with world-scaled UVs per face (texel density 1 tile per `t` metres) */
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); }
  return g;
};

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const HOST3D = createHost(THREE, ndNoInk); scene.add(HOST3D.root); HOST3D.root.visible = false;
const rim = new THREE.DirectionalLight('#fff2e0', 0); rim.position.set(-3, 4, -6); scene.add(rim); scene.add(rim.target);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 40, 600);

// ---------- world: "What If Gravity Turned Off" ----------
// Areas: STREET (origin, road along x at z = 0, houses at z = -16 and +16), HIGHWAY (x = 400), BEACH (x = -400, sea toward -z),
// SPACE station (z = 3000, y = 0, dark sky via light preset), BEDROOM (x = 0, z = -600, interior box).
const world = new THREE.Group(); scene.add(world);
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') } };
const asph = toon({ color: '#5a5c62' }), walk = toon({ color: '#c9c2b4' }), lawnM = toon({ color: '#7cb84e' }), lineM = toon({ color: '#f4f0e0' }), yel = toon({ color: '#f2c230' });
// stop ground layers flickering: push the lawn and road back in depth so whatever lies on them always wins
Object.assign(lawnM, { polygonOffset: true, polygonOffsetFactor: 8, polygonOffsetUnits: 8 }); Object.assign(asph, { polygonOffset: true, polygonOffsetFactor: 4, polygonOffsetUnits: 4 });
const roofs = ['#b8483a', '#3d6e8a', '#6a4a3a', '#4a6a3a'].map((c) => toon({ color: c })), walls = ['#f2e6c8', '#cfe2ee', '#f2cfc0', '#e0eac8', '#f6f0e0'].map((c) => toon({ color: c }));
const dark = toon({ color: '#2a2a30' }), glassM = toon({ color: '#9ec4d6' }), tyreM = toon({ color: '#222020' }), chrome = toon({ color: '#d0d4d8' });
const sandM = toon({ color: '#ecd29a' }), waterBlobM = new THREE.MeshToonMaterial({ gradientMap: grad, color: '#5fb8d8', transparent: true, opacity: 0.82, depthWrite: false });
// ground
add(new THREE.PlaneGeometry(3000, 3000), lawnM, 0, 0, 0, world, { cast: false }).rotation.x = -Math.PI / 2;
add(new THREE.PlaneGeometry(260, 9), asph, 0, 0.02, 0, world, { cast: false }).rotation.x = -Math.PI / 2;
for (const z of [-5.6, 5.6]) add(tbox(260, 0.18, 2.2, 1), walk, 0, 0.09, z, world, { cast: false });
for (let x = -120; x < 120; x += 6) add(box(2.6, 0.02, 0.18), lineM, x, 0.03, 0, world, { cast: false });
// houses
const house = (x, z, w, d, h, wallM, roofM, face) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = face; world.add(g);
  add(tbox(w, h, d, 2), wallM, 0, h / 2, 0, g);
  const rf = add(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.6, 3.2, 4), roofM, 0, h + 1.6, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
  add(box(1.2, 2.2, 0.1), M.door, 0, 1.1, d / 2 + 0.03, g, { cast: false });
  for (const s of [-1, 1]) add(box(1.4, 1.2, 0.1), M.window, s * w * 0.3, h * 0.55, d / 2 + 0.03, g, { cast: false });
  return g; };
for (let i = 0; i < 14; i++) { const x = -78 + i * 12; house(x, -16, 9, 8, 5 + (i % 3), walls[i % 5], roofs[i % 4], 0); house(x + 5, 16, 9, 8, 5 + ((i + 1) % 3), walls[(i + 2) % 5], roofs[(i + 1) % 4], Math.PI); }
const tree = (x, z, h = 6) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); add(new THREE.CylinderGeometry(0.2, 0.3, h * 0.5, 7), M.trunk, 0, h * 0.25, 0, g);
  const c = add(new THREE.IcosahedronGeometry(h * 0.32, 1), M.bush, 0, h * 0.68, 0, g); c.scale.y = 0.85; return g; };
for (let x = -90; x <= 90; x += 15) { tree(x + 4, -9, 6); tree(x - 3, 9, 6.5); }
for (let x = -84; x <= 84; x += 21) for (const z of [-7, 7]) { add(new THREE.CylinderGeometry(0.08, 0.1, 5, 6), dark, x, 2.5, z, world); add(box(0.8, 0.2, 0.4), dark, x + 0.3 * Math.sign(-z), 5, z - 0.3 * Math.sign(z), world); }
// a car model (faces +x), origin on the ground
const car = (col, parent = world) => { const g = new THREE.Group(); parent.add(g); const body = toon({ color: col });
  add(tbox(4.2, 0.9, 1.9, 1), body, 0, 0.75, 0, g); add(tbox(2.2, 0.8, 1.7, 1), body, -0.3, 1.55, 0, g);
  for (const s of [-1, 1]) add(box(1.9, 0.55, 0.05), glassM, -0.3, 1.58, s * 0.86, g, { cast: false });
  add(box(0.05, 0.55, 1.5), glassM, 0.82, 1.58, 0, g, { cast: false }); add(box(0.05, 0.5, 1.5), glassM, -1.42, 1.58, 0, g, { cast: false });
  for (const [x, s] of [[1.35, -1], [1.35, 1], [-1.35, -1], [-1.35, 1]]) { const w = add(new THREE.CylinderGeometry(0.42, 0.42, 0.28, 14), tyreM, x, 0.42, s * 0.9, g); w.rotation.x = Math.PI / 2; }
  add(box(0.06, 0.25, 0.4), yel, 2.12, 0.85, 0.6, g, { cast: false }); add(box(0.06, 0.25, 0.4), yel, 2.12, 0.85, -0.6, g, { cast: false });
  return g; };
// ---- floaters: everything that lifts and falls. base = rest transform, h = lift height, spin = tumble amount
const floaters = [];
const fl = (o, h, spin = 1, group = 'street', extra = {}) => { o.userData.base = { p: o.position.clone(), r: o.rotation.clone() }; floaters.push({ o, h, spin, group, seed: floaters.length * 1.7, ...extra }); return o; };
{ const r = P.rng(4);
  // street props
  for (const [x, z] of [[-6, -6.6], [-4.8, -6.6], [9, 6.8]]) { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); add(new THREE.CylinderGeometry(0.4, 0.34, 1.1, 12), toon({ color: '#3f7a4a' }), 0, 0.55, 0, g); add(new THREE.CylinderGeometry(0.44, 0.44, 0.1, 12), dark, 0, 1.15, 0, g); fl(g, 4 + r() * 3, 1.2); }
  { const g = new THREE.Group(); g.position.set(3, 0, -6.4); world.add(g); add(tbox(2.4, 0.12, 0.6, 1), M.plank, 0, 0.55, 0, g); add(tbox(2.4, 0.6, 0.1, 1), M.plank, 0, 0.95, -0.28, g); for (const x of [-1, 1]) add(box(0.1, 0.55, 0.5), dark, x, 0.27, 0, g); fl(g, 5, 0.7); }
  { const g = new THREE.Group(); g.position.set(-2, 0, -6.5); world.add(g); add(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6), dark, 0, 0.55, 0, g); add(tbox(0.5, 0.45, 0.8, 1), toon({ color: '#2a5aa8' }), 0, 1.3, 0, g); fl(g, 6, 1); }
  { const b = add(new THREE.SphereGeometry(0.3, 14, 10), toon({ color: '#e8452a' }), -7, 0.3, -4.6); fl(b, 7, 2); }
  // parked cars (car A lands on car B later)
  const cA = car('#d84a3a'); cA.position.set(-9, 0, 3.4); fl(cA, 5, 0.6, 'street', { carA: true });
  const cB = car('#3a7ad8'); cB.position.set(-14, 0, -3.4); fl(cB, 4, 0.5, 'street', { carB: true });
  const cC = car('#f2c230'); cC.position.set(14, 0, 3.4); fl(cC, 6, 0.8);
  // cafe table + chairs (coffee cup is a card)
  { const g = new THREE.Group(); g.position.set(26.5, 0, -7.4); world.add(g); add(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 16), toon({ color: '#ffffff' }), 0, 0.95, 0, g); add(new THREE.CylinderGeometry(0.05, 0.05, 0.95, 6), dark, 0, 0.47, 0, g); fl(g, 3, 0.6); }
  for (const x of [25.5, 27.5]) { const g = new THREE.Group(); g.position.set(x, 0, -7.4); world.add(g); add(tbox(0.5, 0.06, 0.5, 1), toon({ color: '#e86a3a' }), 0, 0.5, 0, g); add(tbox(0.5, 0.5, 0.06, 1), toon({ color: '#e86a3a' }), 0, 0.78, -0.22, g); fl(g, 4, 1.4); }
}
// ---- highway (x = 400): 6 lanes along x, cars in both directions
const HX = 400;
add(new THREE.PlaneGeometry(400, 30), asph, HX, 0.02, 0, world, { cast: false }).rotation.x = -Math.PI / 2;
for (let x = HX - 190; x < HX + 190; x += 8) for (const z of [-5, 0, 5]) add(box(3.4, 0.02, 0.2), lineM, x, 0.03, z, world, { cast: false });
for (const z of [-15.5, 15.5]) add(tbox(400, 0.9, 0.4, 2), chrome, HX, 0.45, z, world);
const hwCars = [];
{ const cols = ['#d84a3a', '#3a7ad8', '#f2c230', '#5ab85a', '#f2f2f2', '#8a4ad8', '#2a2a30', '#e8862a', '#4ad8c8', '#d84a9a'];
  for (let i = 0; i < 14; i++) { const lane = [-12.5, -7.5, -2.5, 2.5, 7.5, 12.5][i % 6], c = car(cols[i % 10]); c.position.set(HX - 40 + i * 6.5 + (i % 3) * 2, 0, lane); if (lane < 0) c.rotation.y = Math.PI; c.userData.dir = lane < 0 ? -1 : 1; fl(c, 3 + (i % 4) * 1.5, 0.5, 'hw'); hwCars.push(c); } }
// ---- beach (x = -400): sand, sea plane (shader) toward -z, water blobs that rise
const BX = -400;
add(new THREE.PlaneGeometry(400, 60), sandM, BX, 0.03, 10, world, { cast: false }).rotation.x = -Math.PI / 2;
const waterMat = new THREE.ShaderMaterial({
  uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...waterU }, fog: true, side: THREE.DoubleSide,
  vertexShader: `#include <fog_pars_vertex>
    varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader: `#include <fog_pars_fragment>
    uniform float t; uniform vec3 deep, shal, glint; varying vec3 vW;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
    void main(){ vec2 p = vW.xz*vec2(.16,.22) + vec2(t*.12, -t*.18); float n = noise(p) * .6 + noise(p*2.3 + 7.) * .4;
      vec3 c = mix(deep, shal, .3 + .45*n); float streak = smoothstep(.74, .8, noise(vW.xz*vec2(.35,.5) + vec2(t*.3, -t*.4))); c = mix(c, glint, streak*.6);
      gl_FragColor = vec4(c,1.);
      #include <fog_fragment>
    }`,
});
const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), waterMat); sea.rotation.x = -Math.PI / 2; sea.position.set(BX, 0.05, -320); sea.userData.nd = new THREE.ShaderMaterial({
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }` }); scene.add(sea);
const blobs = [];
for (let i = 0; i < 9; i++) { const m = add(new THREE.SphereGeometry(1, 24, 16), waterBlobM, BX - 24 + i * 6 + (i % 2) * 2, 0, -12 - (i % 3) * 7, world, { cast: false }); m.userData.base = m.position.clone(); m.userData.r = 1.6 + (i % 3) * 0.9; blobs.push(m); }
for (const [i, dx] of [-30, -22, -14, 14, 22, 30].entries()) { const u = add(new THREE.ConeGeometry(1.4, 1.0, 10, 1, true), toon({ color: ['#e84a4a', '#f2c230', '#4a8ae8'][i % 3], side: THREE.DoubleSide }), BX + dx, 2.6, 14 + (i % 2) * 3, world); add(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 5), chrome, BX + dx, 1.3, 14 + (i % 2) * 3, world); }
// ---- space station (z = 3000): modules, solar wings, interior deck for the astronauts; Earth far below
const SPACE = new THREE.Group(); SPACE.position.set(0, 0, 3000); scene.add(SPACE);
{ const hull = toon({ color: '#e8e8ea' }), panel = toon({ color: '#2a4a8a' }), gold = toon({ color: '#e8b83a' });
  add(tbox(14, 0.3, 8, 2), toon({ color: '#9aa4ae' }), 0, -0.15, 0, SPACE, { cast: false }); // deck
  add(tbox(14, 6, 0.3, 2), hull, 0, 3, -4, SPACE); // back wall
  for (const x of [-4, 0, 4]) add(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 24), toon({ color: '#0a0e1a' }), x, 3.2, -3.82, SPACE, { cast: false }).rotation.x = Math.PI / 2; // portholes
  for (const x of [-4, 0, 4]) add(new THREE.TorusGeometry(0.95, 0.1, 8, 24), chrome, x, 3.2, -3.8, SPACE, { cast: false });
  add(tbox(2, 0.9, 1, 1), toon({ color: '#c8ccd2' }), 3.5, 0.45, -2, SPACE); // console
  const st = new THREE.Group(); st.position.set(0, 10, -40); SPACE.add(st);
  const mod = add(new THREE.CylinderGeometry(2.2, 2.2, 22, 16), hull, 0, 0, 0, st); mod.rotation.z = Math.PI / 2;
  for (const x of [-7, 7]) { const m2 = add(new THREE.CylinderGeometry(1.8, 1.8, 8, 16), hull, x, 0, 0, st); }
  for (const s of [-1, 1]) for (const x of [-9, 9]) { const p_ = add(box(3, 0.1, 14), panel, x, 0, s * 10, st); add(box(0.2, 0.2, 7), gold, x, 0, s * 4, st); }
}
const earthM = toon({ color: '#3a7ad8' });
const earth = add(new THREE.SphereGeometry(400, 48, 32), earthM, 0, -520, 3000 - 300, scene, { cast: false });
{ const r = P.rng(31); for (let i = 0; i < 24; i++) { const a = r() * Math.PI, b = r() * Math.PI * 2; const c = add(new THREE.SphereGeometry(60 + r() * 80, 12, 8), toon({ color: '#5ab85a' }), 0, 0, 0, scene, { cast: false });
  c.position.set(Math.sin(a) * Math.cos(b) * 352, -520 + Math.cos(a) * 352, 2700 + Math.sin(a) * Math.sin(b) * 352); c.scale.y = 0.35; c.lookAt(0, -520, 2700); } }
const stars = (() => { const pos = []; const r = P.rng(77); for (let i = 0; i < 600; i++) { const a = r() * Math.PI * 2, e = r() * 1.2 - 0.1; pos.push(Math.cos(a) * Math.cos(e) * 900, 200 + Math.sin(e) * 900, 3000 + Math.sin(a) * Math.cos(e) * 900); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 2.2, sizeAttenuation: false, fog: false })); m.userData.ndSkip = true; scene.add(m); return m; })();
// ---- bedroom (x = 0, z = -600): walls, bed, window with night sky, lamp, poster
const ROOM = new THREE.Group(); ROOM.position.set(0, 0, -600); scene.add(ROOM);
{ const wallR = toon({ color: '#8a9ad8' }), floorR = toon({ color: '#a8784a' });
  add(tbox(10, 0.2, 8, 2), floorR, 0, -0.07, 0, ROOM, { cast: false });
  add(tbox(10, 5, 0.2, 2), wallR, 0, 2.5, -4, ROOM); add(tbox(0.2, 5, 8, 2), wallR, -5, 2.5, 0, ROOM); add(tbox(0.2, 5, 8, 2), wallR, 5, 2.5, 0, ROOM);
  add(tbox(10, 0.2, 8, 2), toon({ color: '#d8d8f0' }), 0, 5.1, 0, ROOM, { cast: false });
  // bed
  add(tbox(2.4, 0.5, 4.2, 1), M.wood, -1.6, 0.25, -1.7, ROOM); add(tbox(2.3, 0.35, 4.0, 1), toon({ color: '#f4f4f4' }), -1.6, 0.67, -1.7, ROOM);
  add(tbox(2.42, 0.2, 2.8, 1), toon({ color: '#e8742a' }), -1.6, 0.92, -1.0, ROOM); // blanket
  add(tbox(1.4, 0.3, 0.7, 1), toon({ color: '#ffffff' }), -1.6, 0.95, -3.3, ROOM); // pillow
  add(tbox(2.6, 1.6, 0.15, 1), M.wood, -1.6, 0.8, -3.85, ROOM); // headboard
  // window
  add(box(2.2, 1.8, 0.05), toon({ color: '#1a2050' }), 2.2, 2.8, -3.88, ROOM, { cast: false });
  for (const [x, y, w, h] of [[2.2, 3.72, 2.4, 0.12], [2.2, 1.88, 2.4, 0.12], [1.05, 2.8, 0.12, 1.9], [3.35, 2.8, 0.12, 1.9], [2.2, 2.8, 0.08, 1.8]]) add(box(w, h, 0.1), toon({ color: '#ffffff' }), x, y, -3.85, ROOM, { cast: false });
  add(new THREE.SphereGeometry(0.25, 12, 8), toon({ color: '#fff3c4', emissive: '#fff0c0', emissiveIntensity: 0.6 }), 2.8, 3.3, -3.86, ROOM, { cast: false });
  // nightstand + lamp
  add(tbox(0.8, 0.8, 0.8, 1), M.wood, 0.3, 0.4, -3.2, ROOM); add(new THREE.CylinderGeometry(0.06, 0.1, 0.5, 8), dark, 0.3, 1.05, -3.2, ROOM);
  add(new THREE.CylinderGeometry(0.2, 0.32, 0.36, 12), toon({ color: '#ffe9a8', emissive: '#ffd88a', emissiveIntensity: 0.5 }), 0.3, 1.45, -3.2, ROOM);
  // poster: rocket
  const pc = document.createElement('canvas'); pc.width = 200; pc.height = 280; const pg = pc.getContext('2d'); pg.fillStyle = '#2a2a5a'; pg.fillRect(0, 0, 200, 280);
  pg.fillStyle = '#ffffff'; pg.beginPath(); pg.moveTo(100, 40); pg.lineTo(130, 120); pg.lineTo(130, 200); pg.lineTo(70, 200); pg.lineTo(70, 120); pg.closePath(); pg.fill();
  pg.fillStyle = '#e8452a'; pg.fillRect(70, 200, 60, 20); pg.fillStyle = '#f2c230'; pg.beginPath(); pg.moveTo(80, 220); pg.lineTo(100, 270); pg.lineTo(120, 220); pg.fill();
  add(new THREE.PlaneGeometry(1.0, 1.4), toon({ map: P.tex(pc) }), -4.88, 2.8, -1.2, ROOM, { cast: false }).rotation.y = Math.PI / 2;
}
// clouds: painted billboards far away (no fog, no ink)
const clouds = [];
{ const r = P.rng(90);
  for (let i = 0; i < 12; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 140 + r() * 160, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }
const helmet = new THREE.Group(); scene.add(helmet); helmet.visible = false;

// lift: 0..1 (gravity off), fall: 0..1 (coming back down; 1 = landed), carStack: car A lands on car B
let worldState = function (S, f) {
  const lift = S.lift || 0, fallT = S.fall || 0;
  for (const F of floaters) {
    const o = F.o, b = o.userData.base, k = F.group === 'hw' ? (S.hwLift ?? lift) : lift;
    const up = k * F.h * (0.75 + 0.25 * Math.sin(f * 0.04 + F.seed)) * (1 - fallT * fallT);
    o.position.copy(b.p); o.position.y += up; o.rotation.copy(b.r);
    o.rotation.x += k * F.spin * 0.5 * Math.sin(f * 0.03 + F.seed) * (1 - fallT); o.rotation.z += k * F.spin * 0.4 * Math.sin(f * 0.025 + F.seed * 2) * (1 - fallT);
    if (F.group === 'hw' && S.hwDrive) o.position.x += o.userData.dir * S.hwDrive;
    if (F.carA && S.carStack) { const t = S.carStack; const tgt = floaters.find((q) => q.carB).o.userData.base.p; o.position.x = lerp_(b.p.x, tgt.x, Math.min(1, t * 1.2)); o.position.z = lerp_(b.p.z, tgt.z, Math.min(1, t * 1.2));
      o.position.y = t < 1 ? 1.25 + (1 - t) * 6 : 1.25; o.rotation.set(0, 0.25, 0.08 * Math.sin(f * 0.8) * (1 - Math.min(1, t))); }
  }
  const wb = S.blobs || 0, wfall = S.blobFall || 0;
  blobs.forEach((m, i) => { const r = m.userData.r; const y = wb * (4 + i % 4 * 2) * (1 - wfall * wfall) + Math.sin(f * 0.06 + i) * 0.3 * wb;
    m.position.copy(m.userData.base); m.position.y = y; m.position.z += wfall * 14;
    const wob = 1 + 0.12 * Math.sin(f * 0.2 + i * 2) * wb; m.scale.set(r * wob * (1 + wfall * 1.5), r * (wb > 0.02 ? 1 / wob : 0.05) * (1 - wfall * 0.7), r * wob * (1 + wfall * 1.5)); m.visible = wb > 0.02; });
  SPACE.visible = earth.visible = stars.visible = !!S.space;
  waterU.t.value = f / 30;
}
const lerp_ = (a, b, t) => a + (b - a) * t;
// hero car (driver close-up), placed directly by the story: S.hero = [x, y, z, rx, ry, rz]
const heroCar = car('#e8452a', scene); heroCar.visible = false;
const _ws = worldState;
worldState = function (S, f) { _ws(S, f); heroCar.visible = !!S.hero; if (S.hero) { heroCar.position.set(S.hero[0], S.hero[1], S.hero[2]); heroCar.rotation.set(S.hero[3], S.hero[4], S.hero[5]); } };


// ---------- see-again extras: bus stop + bus (x = 40), gas station (x = -40), office (z = -900) ----------
{ const glassS = new THREE.MeshToonMaterial({ gradientMap: grad, color: '#bfe2f0', transparent: true, opacity: 0.35, depthWrite: false });
  const g = new THREE.Group(); g.position.set(40, 0, -7.2); world.add(g);
  add(tbox(4, 0.12, 1.6, 1), dark, 0, 2.6, 0, g); add(box(4, 2.4, 0.05), glassS, 0, 1.3, -0.75, g, { cast: false });
  for (const x of [-1.95, 1.95]) add(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), dark, x, 1.3, 0.6, g);
  add(tbox(2.6, 0.1, 0.5, 1), M.plank, 0, 0.5, -0.4, g);
  add(box(0.08, 0.8, 0.6), toon({ color: '#2a8a4a' }), 2.4, 2.4, 0.6, g, { cast: false });
  const bus = new THREE.Group(); bus.position.set(24, 0, -2.2); world.add(bus);
  add(tbox(11, 2.6, 2.5, 2), toon({ color: '#2a6ad8' }), 0, 1.75, 0, bus); add(box(10.6, 0.9, 2.52), glassM, 0, 2.3, 0, bus, { cast: false });
  add(box(11.02, 0.25, 2.52), toon({ color: '#f2f2f2' }), 0, 1.4, 0, bus, { cast: false });
  for (const x of [-3.8, 3.8]) for (const s_ of [-1, 1]) { const w = add(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 14), tyreM, x, 0.5, s_ * 1.15, bus); w.rotation.x = Math.PI / 2; } }
{ const g = new THREE.Group(); g.position.set(-40, 0, -8.5); world.add(g);
  add(tbox(9, 0.4, 5, 2), toon({ color: '#f2f2f2' }), 0, 4.2, 0, g); add(box(9.02, 0.5, 5.02), toon({ color: '#e8453a' }), 0, 4.0, 0, g, { cast: false });
  for (const x of [-3.8, 3.8]) add(new THREE.CylinderGeometry(0.18, 0.18, 4, 8), chrome, x, 2, 0, g);
  for (const x of [-1.6, 1.6]) { add(tbox(0.8, 1.6, 0.6, 1), toon({ color: '#e8453a' }), x, 0.8, 0, g); add(box(0.5, 0.35, 0.05), toon({ color: '#1a1a24' }), x, 1.25, 0.31, g, { cast: false }); }
  add(tbox(9, 0.1, 5, 2), toon({ color: '#9a9aa0' }), 0, 0.05, 0, g, { cast: false }); }
const OFFICE = new THREE.Group(); OFFICE.position.set(0, 0, -900); scene.add(OFFICE);
{ add(tbox(12, 0.2, 10, 2), toon({ color: '#8a8a94' }), 0, -0.07, 0, OFFICE, { cast: false });
  add(tbox(12, 4, 0.2, 2), toon({ color: '#e8e2d4' }), 0, 2, -4, OFFICE); add(tbox(0.2, 4, 10, 2), toon({ color: '#e8e2d4' }), -6, 2, 0, OFFICE); add(tbox(0.2, 4, 10, 2), toon({ color: '#e8e2d4' }), 6, 2, 0, OFFICE);
  add(tbox(12, 0.2, 10, 2), toon({ color: '#f4f4f4' }), 0, 4.1, 0, OFFICE, { cast: false });
  for (const x of [-3, 3]) add(box(1.6, 0.1, 0.8), toon({ color: '#fff8e0', emissive: '#fff4d0', emissiveIntensity: 0.6 }), x, 4.0, 0, OFFICE, { cast: false });
  for (const [x, z] of [[-1.4, -1.2], [1.4, -1.2]]) { add(tbox(2.2, 0.08, 1.1, 1), toon({ color: '#c8a070' }), x, 0.85, z, OFFICE); for (const dx of [-1, 1]) add(box(0.06, 0.85, 1.0), dark, x + dx * 1.0, 0.42, z, OFFICE);
    add(box(0.9, 0.55, 0.05), dark, x, 1.25, z - 0.3, OFFICE); add(box(0.8, 0.45, 0.02), toon({ color: '#5aa8e8' }), x, 1.25, z - 0.27, OFFICE, { cast: false }); }
  add(box(2.4, 1.4, 0.05), toon({ color: '#ffffff' }), 3.4, 2.2, -3.88, OFFICE, { cast: false }); add(new THREE.CylinderGeometry(0.4, 0.3, 0.8, 10), toon({ color: '#c86a3a' }), -5, 0.4, -3.2, OFFICE);
  const pl = add(new THREE.IcosahedronGeometry(0.6, 1), M.bush, -5, 1.2, -3.2, OFFICE); }
OFFICE.visible = true;


// ---------- classroom (z = -1200): walls, windows, chalkboard (canvas texture driven by the story), desks ----------
const CLASS = new THREE.Group(); CLASS.position.set(0, 0, -1200); scene.add(CLASS);
const boardCanvas = document.createElement('canvas'); boardCanvas.width = 700; boardCanvas.height = 900;
const boardTex = new THREE.CanvasTexture(boardCanvas); boardTex.colorSpace = THREE.SRGBColorSpace; let boardKey = '';
{ const wallC = toon({ color: '#e8d8b8' }), floorC = toon({ color: '#b07a4a' });
  add(tbox(14, 0.2, 12, 2), floorC, 0, -0.07, 0, CLASS, { cast: false });
  add(tbox(14, 4.6, 0.2, 2), wallC, 0, 2.3, -5, CLASS); add(tbox(0.2, 4.6, 12, 2), wallC, -7, 2.3, 0, CLASS); add(tbox(0.2, 4.6, 12, 2), wallC, 7, 2.3, 0, CLASS);
  add(tbox(14, 0.2, 12, 2), toon({ color: '#f4f0e6' }), 0, 4.7, 0, CLASS, { cast: false });
  for (const z of [-3, 0, 3]) { add(box(0.05, 1.8, 2.0), toon({ color: '#9ed4f0', emissive: '#bfe6ff', emissiveIntensity: 0.4 }), 6.88, 2.4, z, CLASS, { cast: false }); add(box(0.08, 2.0, 0.1), toon({ color: '#ffffff' }), 6.86, 2.4, z, CLASS, { cast: false }); }
  add(tbox(2.7, 3.5, 0.1, 1), toon({ color: '#6a4a2a' }), 0, 2.3, -4.88, CLASS);
  add(new THREE.PlaneGeometry(2.5, 3.2), new THREE.MeshToonMaterial({ gradientMap: grad, map: boardTex }), 0, 2.3, -4.82, CLASS, { cast: false });
  add(tbox(14, 4.6, 0.2, 2), wallC, 0, 2.3, 6, CLASS);
  add(tbox(2.7, 0.08, 0.25, 1), toon({ color: '#6a4a2a' }), 0, 0.68, -4.75, CLASS);
  add(tbox(2.2, 0.9, 0.9, 1), toon({ color: '#8a5a3a' }), 4.4, 0.45, -3.6, CLASS); // teacher desk
  add(new THREE.SphereGeometry(0.16, 12, 8), toon({ color: '#d84a3a' }), 4.0, 1.06, -3.6, CLASS);
  const clock = add(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 20), toon({ color: '#ffffff' }), -4.6, 3.8, -4.86, CLASS, { cast: false }); clock.rotation.x = Math.PI / 2;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = -3.6 + c * 2.4, z = 0.2 + r * 2.0;
    add(tbox(1.3, 0.08, 0.7, 1), toon({ color: '#c8a070' }), x, 0.75, z, CLASS); for (const dx of [-0.55, 0.55]) add(box(0.06, 0.75, 0.6), dark, x + dx, 0.37, z, CLASS); } }
const _ws2 = worldState;
worldState = function (S, f) { _ws2(S, f);
  const b = S.board || { rows: 0, red: false, stamp: 0 }, key = b.rows + '|' + b.red + '|' + (b.stamp || 0).toFixed(2);
  if (key !== boardKey) { boardKey = key; boardDraw(boardCanvas.getContext('2d'), 700, 900, b.rows, b.red, b.stamp || 0); boardTex.needsUpdate = true; } };

// ---------- cards ----------
const CW = SS > 1 ? 1800 : 1200, CH = SS > 1 ? 3000 : 2000, CM = 2.25; // canvas px, card height in metres (design 600x1000 -> 2.25 m)
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.6));
class Card {
  constructor(scale = 1) {
    [this.c, this.g] = (() => { const c = document.createElement('canvas'); c.width = CW; c.height = CH; return [c, c.getContext('2d')]; })();
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    const p = new T.Pen(g); fn(p); this.t.needsUpdate = true;
  }
}
const cards = []; const getCard = (i) => cards[i] || (cards[i] = new Card());

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 1.6 }, fogCol: { value: new THREE.Color() },
  sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash; uniform vec3 fogCol, lift, gain; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(7./d, .62, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue;            // character cards: never outlined by the world ink
      if (card) ds = 1e4;                        // sky
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d));                           // depth jump, near side only
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9); // crease
    }
    return e * (1. - smoothstep(140., 520., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.012,.01,.014), e);
    if (flash < -0.5) c = vec3(e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    c = mix(c, vec3(1.), flash);
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){
    float c0 = coc(vUv);
    if (cinf < .5 || c0 < .6) { gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.)); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<48;i++){ float fi = float(i); float r = sqrt((fi+.5)/48.); float a = fi*2.39996;
      vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5);
      acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = linearToOutputTexel(vec4(acc/max(wsum,1e-3), 1.)); }` }));
// final copy with sRGB handled by the renderer output (we render to screen with linear->sRGB in the shader chunk)
dofScene.children[0].material.toneMapped = false;

// ---------- nursery (z = -1400): pastel hospital nursery, big window with sun shafts, 9 cribs, props ----------
const NUR = new THREE.Group(); NUR.position.set(0, 0, -1400); scene.add(NUR);
const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const clipCanvas = document.createElement('canvas'); clipCanvas.width = 600; clipCanvas.height = 800;
const clipTex = new THREE.CanvasTexture(clipCanvas); clipTex.colorSpace = THREE.SRGBColorSpace; clipTex.anisotropy = 8; let clipKey = -1;
const drawClip = (n) => {
  if (n === clipKey) return; clipKey = n; const g = clipCanvas.getContext('2d');
  g.fillStyle = '#fbfaf4'; g.fillRect(0, 0, 600, 800);
  g.strokeStyle = '#c9d8ee'; g.lineWidth = 3; for (let y = 150; y < 800; y += 64) { g.beginPath(); g.moveTo(30, y); g.lineTo(570, y); g.stroke(); }
  g.fillStyle = '#e8506a'; g.fillRect(0, 0, 600, 110);
  g.fillStyle = '#ffffff'; g.font = '900 64px "Arial Black", Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NEWBORNS', 300, 58);
  g.textAlign = 'left'; g.font = '700 44px "Comic Sans MS", "Chalkboard", sans-serif';
  for (let i = 0; i < 9; i++) {
    const y = 190 + i * 64; g.fillStyle = '#2a3550'; g.fillText('Baby ' + (i + 1), 60, y);
    g.strokeStyle = '#2a3550'; g.lineWidth = 4; g.strokeRect(430, y - 22, 44, 44);
    if (i < n) { g.strokeStyle = '#2fae5a'; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(436, y); g.lineTo(450, y + 16); g.lineTo(482, y - 26); g.stroke(); }
  }
  if (n >= 9) { g.strokeStyle = '#e8303a'; g.lineWidth = 10; g.beginPath(); g.ellipse(300, 760, 230, 34, -0.03, 0, 7); g.stroke(); g.fillStyle = '#e8303a'; g.font = '900 52px "Arial Black", Impact, sans-serif'; g.textAlign = 'center'; g.fillText('TOTAL: 9 ?!', 300, 762); }
  clipTex.needsUpdate = true;
};
drawClip(0);
{ const W = 10, D = 9, Hh = 3.6;
  const tileTex = canvasTex(256, 256, (g) => { g.fillStyle = '#dff1e8'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#cfe7dc'; g.fillRect(0, 0, 128, 128); g.fillRect(128, 128, 128, 128); g.strokeStyle = 'rgba(80,120,100,0.25)'; g.lineWidth = 3; g.strokeRect(0, 0, 256, 256); g.strokeRect(0, 0, 128, 128); });
  tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping; tileTex.repeat.set(W / 1.2, D / 1.2);
  add(new THREE.BoxGeometry(W, 0.2, D), toon({ map: tileTex }), 0, -0.07, 0, NUR, { cast: false });
  const wallLow = toon({ color: '#f6c9d4' }), wallUp = toon({ color: '#fff4e6' }), rail = toon({ color: '#ffffff' }), ceil = toon({ color: '#fbf8f2' });
  const wall = (w, h, d, x, y, z) => { add(box(w, h, d), y < 1.2 ? wallLow : wallUp, x, y, z, NUR); };
  // back (z=-D/2) and right (x=+W/2) and front walls: low pink + cream with a white rail
  for (const [w, d, x, z] of [[W, 0.2, 0, -D / 2], [0.2, D, W / 2, 0], [W, 0.2, 0, D / 2]]) { wall(w, 1.1, d, x, 0.55, z); wall(w, Hh - 1.1, d, x, 1.1 + (Hh - 1.1) / 2, z); add(box(w + (d > 1 ? 0.06 : 0), 0.08, d + (w > 1 ? 0.06 : 0)), rail, x, 1.12, z, NUR); }
  // left wall (x=-W/2) with a big window opening z in [-2.4, 2.4], y in [1.0, 3.0]
  const X = -W / 2; wall(0.2, 1.0, D, X, 0.5, 0); add(box(0.26, 0.08, D), rail, X, 1.0, 0, NUR);
  add(box(0.2, Hh - 3.0, D), wallUp, X, 3.0 + (Hh - 3.0) / 2, 0, NUR);
  for (const s of [-1, 1]) add(box(0.2, 2.0, (D - 4.8) / 2), wallUp, X, 2.0, s * (2.4 + (D - 4.8) / 4), NUR);
  const frame = toon({ color: '#ffffff' });
  for (const z of [-2.4, -0.8, 0.8, 2.4]) add(box(0.24, 2.0, 0.09), frame, X, 2.0, z, NUR);
  for (const y of [1.0, 2.0, 3.0]) add(box(0.24, 0.09, 4.9), frame, X, y, 0, NUR);
  add(box(0.5, 0.06, 5.0), frame, X + 0.2, 0.97, 0, NUR); // sill
  add(box(W, 0.2, D), ceil, 0, Hh + 0.1, 0, NUR, { cast: true });
  // sun shafts through the window (additive, never in the outline pass)
  const beamTex = canvasTex(64, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256); const gx = g.createLinearGradient(0, 0, 64, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.2, 'rgba(0,0,0,0)'); gx.addColorStop(0.8, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, 64, 256); });
  const beamM = new THREE.MeshBasicMaterial({ map: beamTex, color: '#ffe9b8', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const dir = new THREE.Vector3(1, -0.62, 0.18).normalize(), L = 5.2;
  for (const z of [-1.6, 0, 1.6]) for (const y of [1.5, 2.5]) for (const k of [0, 1]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.75, L), beamM); m.userData.ndSkip = true; m.castShadow = false; m.receiveShadow = false;
    const c = new THREE.Vector3(X + 0.1, y, z).addScaledVector(dir, L / 2); m.position.copy(c);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir); m.rotateY(k * Math.PI / 2); NUR.add(m);
  }
  // ceiling lamps
  for (const x of [-2.5, 2.5]) add(box(1.6, 0.06, 0.6), toon({ color: '#fffbe8', emissive: '#fff6d0', emissiveIntensity: 0.5 }), x, Hh - 0.02, 0.5, NUR, { cast: false });
  // nine cribs along the back wall
  const white = toon({ color: '#fbfbfb' }), mats = ['#bfe2ff', '#ffd1e0', '#fff1b8'];
  for (let i = 0; i < 9; i++) {
    const x = -4.0 + i * 1.0, z = -3.55, g = new THREE.Group(); g.position.set(x, 0, z); NUR.add(g);
    add(box(0.82, 0.07, 0.52), white, 0, 0.62, 0, g); add(box(0.76, 0.1, 0.46), toon({ color: mats[i % 3] }), 0, 0.71, 0, g, { cast: false });
    for (const [dx, dz] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]]) add(new THREE.CylinderGeometry(0.025, 0.025, 1.05, 8), white, dx, 0.52, dz, g);
    for (const dz of [-0.25, 0.25]) { add(box(0.82, 0.05, 0.05), white, 0, 1.03, dz, g); for (let b = -3; b <= 3; b++) add(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6), white, b * 0.1, 0.85, dz, g, { cast: false }); }
    const tag = canvasTex(256, 128, (gg) => { gg.fillStyle = mats[i % 3]; gg.fillRect(0, 0, 256, 128); gg.strokeStyle = '#ffffff'; gg.lineWidth = 10; gg.strokeRect(5, 5, 246, 118); gg.fillStyle = '#2a3550'; gg.font = '900 64px "Arial Black", Impact, sans-serif'; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText('#' + (i + 1), 128, 68); });
    add(new THREE.PlaneGeometry(0.3, 0.15), toon({ map: tag }), 0, 0.84, 0.28, g, { cast: false });
  }
  // supply shelf with diaper stacks and bottles (right wall)
  const shelf = toon({ color: '#ffffff' });
  for (const y of [0.4, 1.0, 1.6]) add(box(0.45, 0.04, 2.2), shelf, W / 2 - 0.35, y, 1.2, NUR);
  for (let j = 0; j < 5; j++) { add(box(0.36, 0.38, 0.32), toon({ color: ['#9fd0f0', '#f6b0c8', '#fff0a8'][j % 3] }), W / 2 - 0.35, 0.61, 0.4 + j * 0.4, NUR); }
  for (let j = 0; j < 8; j++) { const bx = W / 2 - 0.35, bz = 0.3 + j * 0.25; add(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 12), toon({ color: '#f8fbff' }), bx, 1.13, bz, NUR); add(new THREE.CylinderGeometry(0.035, 0.05, 0.06, 12), toon({ color: '#5aa8e8' }), bx, 1.26, bz, NUR); }
  // heart monitor on a stand
  add(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8), toon({ color: '#c8ccd2' }), 3.6, 0.7, -2.4, NUR);
  const mon = canvasTex(256, 192, (g) => { g.fillStyle = '#0b1a14'; g.fillRect(0, 0, 256, 192); g.strokeStyle = '#3cff8a'; g.lineWidth = 5; g.beginPath(); const pts = [0, 110, 60, 110, 75, 60, 90, 150, 105, 110, 170, 110, 185, 70, 200, 140, 215, 110, 256, 110]; for (let k = 0; k < pts.length; k += 2) (k ? g.lineTo : g.moveTo).call(g, pts[k], pts[k + 1]); g.stroke(); g.fillStyle = '#3cff8a'; g.font = '700 34px Arial'; g.fillText('9 x', 14, 40); });
  add(box(0.62, 0.46, 0.1), toon({ color: '#3a3f48' }), 3.6, 1.55, -2.4, NUR);
  add(new THREE.PlaneGeometry(0.54, 0.38), toon({ map: mon, emissive: '#ffffff', emissiveMap: mon, emissiveIntensity: 0.9 }), 3.6, 1.55, -2.34, NUR, { cast: false });
  // poster with a stork on the back wall + clock
  const poster = canvasTex(400, 520, (g) => { g.fillStyle = '#fff8ec'; g.fillRect(0, 0, 400, 520); g.fillStyle = '#7cc4e8'; g.beginPath(); g.arc(200, 210, 150, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(200, 210, 90, 50, -0.2, 0, 7); g.fill(); g.fillStyle = '#ff9a3a'; g.beginPath(); g.moveTo(280, 190); g.lineTo(360, 205); g.lineTo(280, 215); g.fill(); g.fillStyle = '#2a3550'; g.font = '900 54px "Arial Black", Impact, sans-serif'; g.textAlign = 'center'; g.fillText('NURSERY', 200, 450); });
  add(new THREE.PlaneGeometry(1.0, 1.3), toon({ map: poster }), 2.6, 2.3, -D / 2 + 0.12, NUR, { cast: false });
  const clk = add(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 24), toon({ color: '#ffffff' }), -1.2, 2.7, -D / 2 + 0.13, NUR, { cast: false }); clk.rotation.x = Math.PI / 2;
  // rolling cart near the window with the clipboard (insert shot)
  add(box(1.0, 0.05, 0.6), toon({ color: '#e8eef4' }), -3.4, 0.9, 1.6, NUR); add(box(1.0, 0.04, 0.6), toon({ color: '#e8eef4' }), -3.4, 0.35, 1.6, NUR);
  for (const [dx, dz] of [[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]]) add(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8), toon({ color: '#b8c0c8' }), -3.4 + dx, 0.45, 1.6 + dz, NUR);
  const clipBoard = add(box(0.36, 0.015, 0.48), toon({ color: '#8a5a34' }), -3.45, 0.935, 1.6, NUR); clipBoard.rotation.y = 0.15;
  const paper = add(new THREE.PlaneGeometry(0.32, 0.43), toon({ map: clipTex }), -3.45, 0.945, 1.61, NUR, { cast: false }); paper.rotation.set(-Math.PI / 2, 0, 0.15);
  add(box(0.12, 0.03, 0.05), toon({ color: '#c8ccd2' }), -3.45 - 0.034, 0.95, 1.6 - 0.235, NUR).rotation.y = 0.15;
  add(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8), toon({ color: '#2a6ad8' }), -3.25, 0.95, 1.7, NUR).rotation.set(Math.PI / 2, 0, 0.6); // pen
}
{ const _ws3 = worldState; worldState = function (S, f) { _ws3(S, f); if (S.checks !== undefined) drawClip(S.checks); }; }

// ---------- car interior (z = -1600) ----------
const CAR = new THREE.Group(); CAR.position.set(0, 0, -1600); scene.add(CAR);
{ const dash = toon({ color: '#3a3f4a' }), trim = toon({ color: '#5a6170' }), seat = toon({ color: '#8a2e3a' });
  add(box(2.0, 0.42, 0.6), dash, 0, 0.72, 0.62, CAR); add(box(2.0, 0.08, 0.7), trim, 0, 0.94, 0.6, CAR);
  const wheel = add(new THREE.TorusGeometry(0.24, 0.035, 12, 40), toon({ color: '#1f2228' }), 0.0, 1.0, 0.42, CAR); wheel.rotation.x = -0.25; wheel.scale.set(1.15, 1.15, 1.15);
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 10), toon({ color: '#1f2228' }), 0, 0.92, 0.52, CAR).rotation.x = 1.2;
  add(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16), toon({ color: '#c0302c' }), 0, 1.0, 0.42, CAR).rotation.x = Math.PI / 2 - 0.25;
  for (const s of [-1, 1]) { const pl = add(box(0.1, 1.2, 0.1), trim, s * 1.0, 1.65, 0.75, CAR); pl.rotation.x = -0.35; }
  add(box(2.1, 0.1, 1.6), toon({ color: '#d8d4cc' }), 0, 2.25, 0.0, CAR);
  add(box(0.8, 1.0, 0.18), seat, 0, 1.0, -0.45, CAR); add(box(0.45, 0.28, 0.16), seat, 0, 1.75, -0.47, CAR);
  add(box(0.28, 0.08, 0.04), toon({ color: '#20242a' }), 0.15, 2.12, 0.66, CAR); // mirror
  const fr = add(new THREE.ConeGeometry(0.06, 0.16, 3), toon({ color: '#3ab85a' }), 0.15, 1.92, 0.66, CAR); fr.rotation.z = Math.PI; // air freshener
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 4), toon({ color: '#ffffff' }), 0.15, 2.04, 0.66, CAR);
  add(box(0.6, 0.12, 0.02), toon({ color: '#0b1a24', emissive: '#3ad0ff', emissiveIntensity: 0.4 }), 0.6, 0.95, 0.34, CAR, { cast: false }); // dash screen
  // passing scenery behind (simple trees)
  for (let i = 0; i < 10; i++) { const tr = new THREE.Group(); tr.position.set(-6 + i * 1.6, 0, -6 - (i % 3) * 1.5); CAR.add(tr); add(new THREE.CylinderGeometry(0.1, 0.14, 1.2, 8), toon({ color: '#7a5232' }), 0, 0.6, 0, tr); add(new THREE.IcosahedronGeometry(0.75, 1), M.bush, 0, 1.6, 0, tr); }
}
// ---------- inside the windpipe (z = -1700) ----------
const THR = new THREE.Group(); THR.position.set(0, 1.5, -1700); scene.add(THR);
const throatLight = new THREE.PointLight('#ffd8d0', 0, 9, 1.4); scene.add(throatLight);
const airBits = [], crackCanvas = document.createElement('canvas'); crackCanvas.width = 512; crackCanvas.height = 512;
{ const tubeM = toon({ color: '#e7808e', emissive: '#7a2232', emissiveIntensity: 0.35, side: THREE.BackSide });
  const tube = add(new THREE.CylinderGeometry(1.0, 1.0, 16, 48, 1, true), tubeM, 0, 0, 0, THR, { cast: false }); tube.rotation.x = Math.PI / 2;
  const ringM = toon({ color: '#f6b2bc', emissive: '#7a3240', emissiveIntensity: 0.25 });
  for (let z = -7.5; z <= 7.5; z += 0.55) { const r = add(new THREE.TorusGeometry(0.97, 0.075, 10, 48), ringM, 0, 0, z, THR, { cast: false }); }
  const gloss = toon({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.6, transparent: true, opacity: 0.35 });
  for (let i = 0; i < 40; i++) { const a = i * 2.4, z = -7 + (i * 0.37) % 14; const d = add(new THREE.SphereGeometry(0.012 + (i % 3) * 0.006, 8, 6), gloss, Math.cos(a) * 0.92, Math.sin(a) * 0.92, z, THR, { cast: false }); d.userData.ndSkip = true; }
  const airM = new THREE.MeshBasicMaterial({ color: '#eaf6ff', transparent: true, opacity: 0.55, depthWrite: false });
  for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.035 + (i % 4) * 0.012, 8, 6), airM); m.userData.ndSkip = true; THR.add(m); airBits.push(m); }
  const g = crackCanvas.getContext('2d'); g.strokeStyle = '#3a0a14'; g.lineCap = 'round'; g.lineJoin = 'round';
  const crk = (x, y, a, len, w, d) => { if (d > 4 || len < 10) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); crk(x2, y2, a + 0.5, len * 0.62, w * 0.65, d + 1); crk(x2, y2, a - 0.45, len * 0.6, w * 0.65, d + 1); };
  for (let k = 0; k < 6; k++) crk(256, 256, k * 1.05 + 0.2, 95, 16, 0);
  g.fillStyle = '#2a0610'; g.beginPath(); g.ellipse(256, 256, 34, 22, 0.4, 0, 7); g.fill();
}
const crackTex = new THREE.CanvasTexture(crackCanvas); crackTex.colorSpace = THREE.SRGBColorSpace;
const crack = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), new THREE.MeshBasicMaterial({ map: crackTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
crack.position.set(0.93, 0.15, -1.2); crack.rotation.y = -Math.PI / 2; crack.userData.ndSkip = true; THR.add(crack); crack.visible = false;
{ const _ws4 = worldState; worldState = function (S, f) { _ws4(S, f);
  const th = S.throat; throatLight.intensity = th ? 2.2 : 0;
  if (th) { throatLight.position.set(0, 1.5 + 0.3, -1700 + (th.lightZ ?? 1.5)); crack.visible = !!th.crack; crack.scale.setScalar(th.crack ? Math.min(1, th.crack) : 1);
    const pr = th.pressure ?? 0;
    airBits.forEach((m, i) => { const ph = i * 1.7, sp = 0.02 + 0.09 * pr, z = ((i * 0.43 + f * sp) % 5.5) - 5.5, r = 0.15 + 0.7 * ((i * 0.37) % 1) * (0.6 + 0.4 * pr);
      m.position.set(Math.cos(ph + f * 0.05 * (1 + 3 * pr)) * r, Math.sin(ph + f * 0.05 * (1 + 3 * pr)) * r, z); m.scale.setScalar(0.5 + 0.7 * pr); }); }
}; }

// ---------- "the notebook" short: desk + open notebook in the bedroom, falling closed notebook, cinema (z=-1800), plane (z=-1900), boss chair ----------
const nbCanvas = document.createElement('canvas'); nbCanvas.width = 1024; nbCanvas.height = 700;
const nbTex = new THREE.CanvasTexture(nbCanvas); nbTex.colorSpace = THREE.SRGBColorSpace; nbTex.anisotropy = 8; let nbKey = '';
const NBD = new THREE.Group(); ROOM.add(NBD); NBD.position.set(2.6, 0, -1.6);
{ add(tbox(1.6, 0.06, 0.9, 1), M.wood, 0, 0.92, 0, NBD); for (const [dx, dz] of [[-0.72, -0.38], [0.72, -0.38], [-0.72, 0.38], [0.72, 0.38]]) add(box(0.06, 0.92, 0.06), M.wood, dx, 0.46, dz, NBD);
  add(box(0.62, 0.025, 0.44), toon({ color: '#141216' }), 0, 0.965, 0.05, NBD);
  const pg = add(new THREE.PlaneGeometry(0.58, 0.4), toon({ map: nbTex }), 0, 0.98, 0.05, NBD, { cast: false }); pg.rotation.x = -Math.PI / 2;
  add(box(0.03, 0.002, 0.2), toon({ color: '#b01828' }), 0.05, 0.979, 0.3, NBD, { cast: false }); // ribbon
  add(new THREE.CylinderGeometry(0.1, 0.13, 0.04, 16), dark, -0.55, 0.97, -0.25, NBD); add(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8), dark, -0.55, 1.18, -0.25, NBD);
  add(new THREE.ConeGeometry(0.16, 0.18, 16, 1, true), toon({ color: '#3a6ad8', side: THREE.DoubleSide }), -0.48, 1.42, -0.2, NBD).rotation.z = -0.5;
  add(new THREE.CylinderGeometry(0.05, 0.04, 0.12, 12), toon({ color: '#e8e0d0' }), 0.6, 1.0, -0.25, NBD); // mug
}
const nbPen = add(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8), toon({ color: '#20242a' }), 0, 1.03, 0, NBD); nbPen.rotation.set(0.9, 0, 0.5);
const NBF = new THREE.Group(); scene.add(NBF); // closed notebook (falls in the street)
{ add(box(0.32, 0.05, 0.44), toon({ color: '#121014' }), 0, 0, 0, NBF); add(box(0.31, 0.045, 0.43), toon({ color: '#efe6d2' }), 0.006, 0, 0, NBF);
  add(box(0.32, 0.012, 0.44), toon({ color: '#121014' }), 0, 0.026, 0, NBF); add(box(0.32, 0.012, 0.44), toon({ color: '#121014' }), 0, -0.026, 0, NBF);
  add(box(0.03, 0.002, 0.2), toon({ color: '#b01828' }), 0.05, 0.033, 0.25, NBF, { cast: false });
  const em = add(new THREE.CircleGeometry(0.05, 20), toon({ color: '#d8d0c0' }), 0, 0.033, 0, NBF, { cast: false }); em.rotation.x = -Math.PI / 2; }
NBF.visible = false;
// cinema
const CIN = new THREE.Group(); CIN.position.set(0, 0, -1800); scene.add(CIN);
const cinScreen = canvasTex(512, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#7ab8f0'); gr.addColorStop(1, '#f0c890'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256); g.fillStyle = '#2a3a5a'; g.beginPath(); g.moveTo(0, 256); g.lineTo(140, 120); g.lineTo(260, 256); g.fill(); g.beginPath(); g.moveTo(200, 256); g.lineTo(360, 90); g.lineTo(512, 256); g.fill(); g.fillStyle = '#ffe9a0'; g.beginPath(); g.arc(420, 70, 30, 0, 7); g.fill(); });
{ add(box(16, 0.2, 14), toon({ color: '#2a1a24' }), 0, -0.07, 0, CIN, { cast: false });
  add(box(16, 7, 0.2), toon({ color: '#1a1220' }), 0, 3.5, -6, CIN); for (const s of [-1, 1]) add(box(0.2, 7, 14), toon({ color: '#3a1424' }), s * 8, 3.5, 0, CIN);
  add(new THREE.PlaneGeometry(9, 4.5), toon({ map: cinScreen, emissive: '#ffffff', emissiveMap: cinScreen, emissiveIntensity: 1.0 }), 0, 3.4, -5.85, CIN, { cast: false });
  const seatM = toon({ color: '#b8202c' }), armM = toon({ color: '#3a1018' });
  for (let r = 0; r < 4; r++) for (let c = -4; c <= 4; c++) { const x = c * 0.75, z = -1.2 + r * 1.1, y = r * 0.25;
    add(box(0.6, 0.12, 0.55), seatM, x, 0.45 + y, z, CIN); add(box(0.6, 0.75, 0.12), seatM, x, 0.85 + y, z + 0.26, CIN); add(box(0.08, 0.3, 0.55), armM, x + 0.34, 0.6 + y, z, CIN);
    if (r) add(box(6.8, y, 1.1), toon({ color: '#2a1a24' }), 0, y / 2, z, CIN, { cast: false }); }
}
const cinLight = new THREE.PointLight('#bcd8ff', 0, 14, 1.2); cinLight.position.set(0, 3, -1800 - 4); scene.add(cinLight);
// plane cabin
const PLN = new THREE.Group(); PLN.position.set(0, 0, -1900); scene.add(PLN);
const winTex = canvasTex(128, 192, (g) => { const gr = g.createLinearGradient(0, 0, 0, 192); gr.addColorStop(0, '#5aa8f0'); gr.addColorStop(1, '#e8f4ff'); g.fillStyle = gr; g.fillRect(0, 0, 128, 192); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(50, 120, 40, 14, 0, 0, 7); g.fill(); });
{ add(box(4, 0.2, 14), toon({ color: '#5a6278' }), 0, -0.07, 0, PLN, { cast: false });
  const hull = add(new THREE.CylinderGeometry(2.1, 2.1, 14, 40, 1, true, -Math.PI / 2, Math.PI), toon({ color: '#eef0f4', side: THREE.BackSide }), 0, 0.6, 0, PLN, { cast: false }); hull.rotation.x = Math.PI / 2; hull.rotation.y = Math.PI;
  for (let z = -6; z <= 6; z += 1.0) { const w = add(new THREE.PlaneGeometry(0.28, 0.42), toon({ map: winTex, emissive: '#ffffff', emissiveMap: winTex, emissiveIntensity: 0.8 }), -1.62, 1.55, z, PLN, { cast: false }); w.rotation.y = Math.PI / 2 - 0.25; }
  add(box(1.0, 0.35, 14), toon({ color: '#dfe2e8' }), -1.3, 2.3, 0, PLN); add(box(1.0, 0.35, 14), toon({ color: '#dfe2e8' }), 1.3, 2.3, 0, PLN);
  const seatB = toon({ color: '#2a4a8a' }), head = toon({ color: '#e8ecf4' });
  for (let r = -5; r <= 5; r++) for (const x of [-1.15, -0.55, 0.55, 1.15]) { const z = r * 0.9;
    add(box(0.52, 0.12, 0.5), seatB, x, 0.48, z, PLN); add(box(0.52, 0.95, 0.12), seatB, x, 1.0, z + 0.25, PLN); add(box(0.4, 0.2, 0.13), head, x, 1.38, z + 0.25, PLN, { cast: false }); }
}
// boss chair (office)
const BOSS = new THREE.Group(); OFFICE.add(BOSS); BOSS.position.set(3.2, 0, -2.6);
{ const lea = toon({ color: '#1e1e24' }); add(box(0.7, 0.12, 0.65), lea, 0, 0.55, 0, BOSS); add(box(0.7, 1.0, 0.14), lea, 0, 1.1, -0.3, BOSS); add(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8), toon({ color: '#888' }), 0, 0.3, 0, BOSS);
  add(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 5), toon({ color: '#555' }), 0, 0.06, 0, BOSS); }
{ const _ws5 = worldState; worldState = function (S, f) { _ws5(S, f);
  const nb = S.nb; cinLight.intensity = S.cinema ? 2.2 + 0.4 * Math.sin(f * 0.7) : 0;
  NBF.visible = !!(nb && nb.fall);
  if (nb && nb.fall) { const F = nb.fall; NBF.position.set(F[0], F[1], F[2]); NBF.rotation.set(F[3] || 0, F[4] || 0, F[5] || 0); }
  if (nb && nb.page) { const key = JSON.stringify(nb); if (key !== nbKey) { nbKey = key; paintPages(nbCanvas.getContext('2d'), nb); nbTex.needsUpdate = true; }
    const w = nb.write ?? 1, i = Math.max(0, (nb.n ?? 1) - 1); nbPen.position.set(-0.22 + 0.2 * w, 1.03 + 0.01 * Math.sin(f * 1.7), 0.05 - 0.12 + i * 0.055); nbPen.visible = nb.pen !== false; }
  BOSS.rotation.y = S.bossSpin ?? 0;
}; }

// ---------- per-frame state ----------
const tmpV = new THREE.Vector3();
function applyLight(L, f) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000');
  waterU.deep.value.set(L.waterDeep); waterU.shal.value.set(L.waterShal); waterU.glint.value.set(L.glint);
}
function placeSun(L, focus) {
  // sun direction from azimuth/elevation in world space
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 80); sun.target.position.copy(focus);
  const ext = L.shadowExt || 30, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 200; sc.updateProjectionMatrix();
}

function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = getCard(i);
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1;
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false && a.ground !== undefined) { c.blob.visible = true; c.blob.position.set(a.x, a.ground + 0.02, a.z); c.blob.scale.set(0.95 * s, 0.6 * s, 1); }
  });
}

const helmetState = (h) => {
  helmet.visible = !!h; if (!h) return;
  helmet.position.set(h.x, h.y, h.z); helmet.rotation.set(h.rx || 0, h.ry || 0, h.rz || 0); helmet.scale.setScalar(h.s || 0.17);
};

const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip) { o.userData.vis0 = o.visible; o.visible = false; return; }
      if (o === sky || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || ndMat;
    } else {
      o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; }
    }
  });
};

window.renderFrame = (f) => {
  const S = shotAt(f), L = lightFor(S, f), C = camAt(f);
  applyLight(L, f);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const W_ = worldAt(f); worldState(W_, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors([...actorsAt(f, T), ...fxAt(f, T)], camera);
  helmetState(W_.helmet);
  { const hp = host3dAt ? host3dAt(f) : null; HOST3D.root.visible = !!hp; rim.intensity = hp ? 1.3 : 0;
    if (hp) { HOST3D.pose(hp); rim.target.position.set(hp.x, 1, hp.z); rim.position.set(hp.x - 2.5, 3.5, hp.z - 4); } }
  sky.position.copy(camera.position);
  for (const c of clouds) c.quaternion.copy(camera.quaternion);
  // pass A: colour
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  // pass B: normal + depth
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  if (window.DEBUG_ND) { const dm = new THREE.MeshBasicMaterial({ map: rtNd.texture }); const ds = fs(dm); renderer.setRenderTarget(null); renderer.render(ds, fsCam); return true; }
  // ink + grade
  const D = dofAt(f);
  inkU.px.value = 2.5 * SS; inkU.flash.value = window.DEBUG_E ? -1 : (C.flash || 0); inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  // lens
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf * SS; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
