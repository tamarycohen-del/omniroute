import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { SHOTS, TOTAL, shotAt, camAt, dofAt, LIGHTS, lightFor, actorsAt, worldAt, fxAt } from './story.js';

const W = 1080, H = 1920;
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
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 40, 600);

// ---------- world: Western Australia wheat farm, 1932 ----------
// Layout: road along x at z = 4 (width 7); wire fence at z = -4; wheat field z < -6; farmhouse (-40, -60);
// windmill (30, -70); army camp z 12..28 (tent, crates, chalk board at (8, 0, 16) facing -z);
// open scrub paddock z > 30 (ambush gun on tripod at (0, 0, 40) pointing +z); ridge hill at (0, 0, 120).
const world = new THREE.Group(); scene.add(world);
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color() }, shal: { value: new THREE.Color() }, glint: { value: new THREE.Color() } };
const dirtM = texM(P.dirt(7), 60, 60, '#d08a56'), roadM = texM(P.dirt(17), 2, 40, '#b98a62');
const wheatM = toon({ color: '#e8c25a' }), wheatDk = toon({ color: '#c99a3a' }), stubM = toon({ color: '#d9b25e' });
const scrubM = toon({ color: '#8a9a5a' }), gumLeaf = toon({ color: '#8fa878' }), gumBark = toon({ color: '#e6ddd0' });
const tinM = toon({ color: '#a8b0b4' }), wallM = toon({ color: '#e9dcc0' }), khaki = toon({ color: '#8a7a4a' }), canvasM = toon({ color: '#cfc29a', side: THREE.DoubleSide });
const steel = toon({ color: '#3a3a36' }), truckM = toon({ color: '#5e6a3a' }), tyreM = toon({ color: '#222020' }), glassM = toon({ color: '#9ec4d6' });
// ground
add(new THREE.PlaneGeometry(2400, 2400), dirtM, 0, 0, 0, world, { cast: false }).rotation.x = -Math.PI / 2;
add(new THREE.PlaneGeometry(400, 7), roadM, 0, 0.02, 4, world, { cast: false }).rotation.x = -Math.PI / 2;
add(new THREE.PlaneGeometry(260, 200), stubM, 0, 0.01, -106, world, { cast: false }).rotation.x = -Math.PI / 2;
// merged geometry helper (no InstancedMesh: the ink pass needs plain meshes)
const merge = (parts) => {
  const pos = [], nor = [];
  for (const [g, m] of parts) { const n = g.index ? g.toNonIndexed() : g; n.applyMatrix4(m); pos.push(...n.attributes.position.array); nor.push(...n.attributes.normal.array); }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return out;
};
const mtx = (x, y, z, sx = 1, sy = 1, sz = 1, ry = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, rz)), new THREE.Vector3(sx, sy, sz));
{ // wheat: tufts in rows, two tones
  const r = P.rng(3), A = [], B = [];
  for (let x = -130; x <= 130; x += 1.6) for (let z = -8; z >= -200; z -= z > -60 ? 1.5 : 3) {
    if (Math.hypot(x + 40, z + 60) < 14) continue;
    const h = 0.9 + r() * 0.35, g = new THREE.ConeGeometry(0.55, h, 5);
    (r() < 0.5 ? A : B).push([g, mtx(x + (r() - 0.5) * 0.8, h / 2, z + (r() - 0.5) * 0.6, 1, 1, 1, r() * 3, (r() - 0.5) * 0.25)]);
  }
  add(merge(A), wheatM, 0, 0, 0, world, { cast: false }); add(merge(B), wheatDk, 0, 0, 0, world, { cast: false });
}
{ // scrub bushes in the paddock and beyond
  const r = P.rng(8), parts = [];
  for (let i = 0; i < 260; i++) { const x = (r() - 0.5) * 360, z = 30 + r() * 260; if (Math.abs(x) < 14 && z < 70) continue; if (Math.abs(x) < 30 && z > 95 && z < 150) continue;
    const s = 0.6 + r() * 1.2; parts.push([new THREE.IcosahedronGeometry(1, 0), mtx(x, s * 0.4, z, s * 1.3, s * 0.7, s * 1.2, r() * 3)]); }
  add(merge(parts), scrubM, 0, 0, 0, world);
}
// fence: posts + two wires along the field
for (let x = -130; x <= 130; x += 4) add(new THREE.CylinderGeometry(0.08, 0.1, 1.3, 6), M.wood, x, 0.65, -4, world);
for (const y of [0.55, 1.05]) { const w = add(new THREE.CylinderGeometry(0.018, 0.018, 260, 4), steel, 0, y, -4, world, { cast: false }); w.rotation.z = Math.PI / 2; }
// gum trees
const gum = (x, z, h = 9, s = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
  const t = add(new THREE.CylinderGeometry(0.25 * s, 0.45 * s, h, 7), gumBark, 0, h / 2, 0, g); t.rotation.z = 0.08;
  const r = P.rng(Math.round(x * 7 + z));
  for (let i = 0; i < 5; i++) { const c = add(new THREE.IcosahedronGeometry(2.2 * s, 1), gumLeaf, (r() - 0.5) * 4 * s, h * (0.75 + r() * 0.3), (r() - 0.5) * 4 * s, g); c.scale.y = 0.6; }
  return g; };
[[-60, -30, 11], [-22, -70, 9], [52, -40, 12], [-80, 20, 10], [70, 26, 11], [-34, 60, 9], [40, 80, 12], [-70, 110, 10], [90, 140, 13], [20, -120, 10], [-110, -90, 12], [120, -20, 11]].forEach(([x, z, h]) => gum(x, z, h));
// farmhouse: weatherboard walls, tin roof, veranda, water tank, windmill
{ const g = new THREE.Group(); g.position.set(-40, 0, -60); world.add(g);
  add(tbox(14, 4, 10, 2), wallM, 0, 2, 0, g);
  const roof = add(new THREE.CylinderGeometry(0.01, 8.6, 3, 4, 1), tinM, 0, 5.5, 0, g); roof.rotation.y = Math.PI / 4; roof.scale.set(1.15, 1, 0.82);
  add(box(14, 0.15, 3), tinM, 0, 3.4, 6.4, g); for (const x of [-6.5, -2, 2, 6.5]) add(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 6), M.wood, x, 1.7, 7.7, g);
  add(box(1.2, 2.2, 0.1), M.door, 0, 1.1, 5.05, g, { cast: false }); for (const x of [-4, 4]) add(box(1.6, 1.2, 0.1), M.window, x, 2.2, 5.05, g, { cast: false });
  add(new THREE.CylinderGeometry(0.9, 0.9, 6, 6), M.stone, 4, 5, -2, g); // chimney
  const tk = add(new THREE.CylinderGeometry(2.2, 2.2, 3.2, 18), tinM, 11, 3.4, -1, g); add(tbox(4.6, 1.8, 4.6, 1), M.wood, 11, 0.9, -1, g); }
const windmill = (() => { const g = new THREE.Group(); g.position.set(30, 0, -70); world.add(g);
  for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) { const l = add(new THREE.CylinderGeometry(0.1, 0.12, 14.4, 5), steel, x * 0.55, 7, z * 0.55, g); l.rotation.set(-z * 0.06, 0, x * 0.06); }
  const head = new THREE.Group(); head.position.set(0, 14.4, 0.6); g.add(head);
  for (let i = 0; i < 16; i++) { const b = add(box(0.5, 2.6, 0.06), tinM, 0, 0, 0, head); const a = i / 16 * Math.PI * 2; b.position.set(Math.sin(a) * 1.6, Math.cos(a) * 1.6, 0); b.rotation.z = -a; b.rotation.y = 0.4; }
  add(box(0.15, 0.6, 3.6), tinM, 0, 0, -2.2, head);
  return head; })();
// army camp: tent, crates, chalk board
{ const g = new THREE.Group(); g.position.set(-10, 0, 24); world.add(g);
  const sh = new THREE.Shape([new THREE.Vector2(-3, 0), new THREE.Vector2(3, 0), new THREE.Vector2(0, 3.4)]);
  const tg = new THREE.ExtrudeGeometry(sh, { depth: 6, bevelEnabled: false }); tg.translate(0, 0, -3); add(tg, canvasM, 0, 0, 0, g); }
const crates = [];
for (const [x, z, h] of [[-2, 18, 0], [-0.6, 18.3, 0], [-1.3, 18.1, 1], [3, 21, 0]]) crates.push(add(tbox(1.3, 0.9, 0.9, 1), M.plank, x, 0.45 + h * 0.9, z, world));
const boardTex = (() => { const c = document.createElement('canvas'); c.width = 640; c.height = 400; const g = c.getContext('2d');
  g.fillStyle = '#2f3b33'; g.fillRect(0, 0, 640, 400); g.strokeStyle = '#f2efe4'; g.fillStyle = '#f2efe4'; g.lineWidth = 6; g.lineCap = 'round';
  g.font = 'bold 64px "Comic Sans MS", "Chalkboard", sans-serif'; g.fillText('THE PLAN', 170, 80);
  g.font = 'bold 54px "Comic Sans MS", "Chalkboard", sans-serif'; g.fillText('1. Find emus', 60, 190); g.fillText('2. Shoot emus', 60, 290);
  g.beginPath(); g.moveTo(170, 100); g.lineTo(470, 100); g.stroke();
  return P.tex(c); })();
const tallyTex = (() => { const c = document.createElement('canvas'); c.width = 640; c.height = 400; const g = c.getContext('2d');
  g.fillStyle = '#2f3b33'; g.fillRect(0, 0, 640, 400); g.fillStyle = '#f2efe4'; g.strokeStyle = '#f2efe4'; g.lineWidth = 6; g.lineCap = 'round';
  g.font = 'bold 56px "Comic Sans MS", "Chalkboard", sans-serif'; g.fillText('BULLETS: 9,860', 40, 120); g.fillText('EMUS:       986', 40, 220);
  g.font = 'bold 50px "Comic Sans MS", "Chalkboard", sans-serif'; g.fillStyle = '#ffd36a'; g.fillText('= 10 per bird!?', 40, 330);
  return P.tex(c); })();
const board = new THREE.Group(); board.position.set(8, 0, 16); board.rotation.y = Math.PI; world.add(board);
for (const x of [-1.1, 1.1]) add(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 5), M.wood, x, 1.4, -0.05, board);
const boardFace = add(new THREE.PlaneGeometry(2.4, 1.5), toon({ map: boardTex }), 0, 1.95, 0.05, board, { cast: false });
add(tbox(2.6, 1.7, 0.08, 1), M.wood, 0, 1.95, -0.01, board);
// Lewis gun model (barrel along +z), on a tripod at the ambush site and one on the truck bed
const lewis = (parent) => { const g = new THREE.Group(); parent.add(g);
  const sh = add(new THREE.CylinderGeometry(0.13, 0.13, 1.1, 10), steel, 0, 0, 0.35, g); sh.rotation.x = Math.PI / 2;
  const br = add(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 6), steel, 0, 0, 1.1, g); br.rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 16), steel, 0, 0.17, 0.1, g);
  add(box(0.1, 0.16, 0.7), M.wood, 0, -0.05, -0.5, g);
  return g; };
const tripod = new THREE.Group(); tripod.position.set(0, 0, 40); world.add(tripod);
for (const a of [0, 2.1, 4.2]) { const l = add(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 5), steel, Math.sin(a) * 0.3, 0.45, Math.cos(a) * 0.3 - 0.1, tripod); l.rotation.set(Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5); }
const gunA = lewis(tripod); gunA.position.set(0, 0.95, 0);
// truck: 1930s army lorry, faces +x, origin at the ground under its centre
const truck = new THREE.Group(); scene.add(truck);
const tBody = new THREE.Group(); truck.add(tBody);
add(tbox(1.8, 1.0, 1.9, 1), truckM, 2.0, 1.15, 0, tBody); // bonnet
add(box(0.12, 0.8, 1.6), steel, 2.95, 1.05, 0, tBody, { cast: false }); // grille
add(tbox(1.4, 1.5, 2.0, 1), truckM, 0.5, 1.45, 0, tBody); // cab
add(box(0.06, 0.6, 1.6), glassM, 1.22, 1.85, 0, tBody, { cast: false });
add(tbox(3.4, 0.3, 2.2, 1), M.plank, -1.9, 0.85, 0, tBody); // bed
for (const s of [-1, 1]) add(tbox(3.4, 0.5, 0.1, 1), M.plank, -1.9, 1.2, s * 1.05, tBody);
add(tbox(0.1, 0.5, 2.2, 1), M.plank, -3.6, 1.2, 0, tBody);
for (const s of [-1, 1]) { add(new THREE.SphereGeometry(0.62, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), truckM, 2.0, 0.62, s * 1.0, tBody, { cast: false }).scale.set(1.2, 0.6, 0.4); }
const wheels = [];
for (const [x, s] of [[2.1, -1], [2.1, 1], [-2.2, -1], [-2.2, 1]]) { const w = add(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 14), tyreM, x, 0.5, s * 1.0, truck); w.rotation.x = Math.PI / 2; wheels.push(w); }
const gunPost = new THREE.Group(); gunPost.position.set(-1.6, 1.0, 0); tBody.add(gunPost);
add(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 6), steel, 0, 0.5, 0, gunPost);
const gunB = lewis(gunPost); gunB.position.set(0, 1.05, 0);
// ridge hill (emus waiting on it) with a flagpole
const ridge = add(new THREE.SphereGeometry(40, 28, 12), toon({ color: '#c47a48' }), 0, -32, 128, world); ridge.scale.set(1.6, 1, 0.6);
const RIDGE_Y = 8;
const flagEmu = (() => { const c = document.createElement('canvas'); c.width = 300; c.height = 200; const g = c.getContext('2d');
  g.fillStyle = '#2a6a3a'; g.fillRect(0, 0, 300, 200); g.fillStyle = '#e8c25a'; g.beginPath(); g.ellipse(140, 120, 60, 40, 0, 0, 7); g.fill();
  g.fillStyle = '#7d9cc0'; g.fillRect(180, 40, 18, 70); g.beginPath(); g.ellipse(196, 40, 22, 18, 0, 0, 7); g.fill(); g.fillStyle = '#241726'; g.beginPath(); g.arc(200, 36, 5, 0, 7); g.fill();
  g.fillStyle = '#3a3030'; g.beginPath(); g.moveTo(214, 34); g.lineTo(246, 42); g.lineTo(214, 48); g.fill();
  return P.tex(c); })();
const flagG = new THREE.Group(); flagG.position.set(4, RIDGE_Y - 0.4, 127); world.add(flagG);
add(new THREE.CylinderGeometry(0.06, 0.06, 6, 6), M.wood, 0, 3, 0, flagG);
const flagM = add(new THREE.PlaneGeometry(2.2, 1.45, 8, 2), new THREE.MeshToonMaterial({ gradientMap: grad, map: flagEmu, side: THREE.DoubleSide }), 1.15, 5, 0, flagG, { cast: false });
flagM.userData.base = flagM.geometry.attributes.position.array.slice();
// distant red mesas
{ const r = P.rng(21);
  for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, d = 520 + r() * 200, R_ = 50 + r() * 70, h = 20 + r() * 35;
    add(new THREE.CylinderGeometry(R_ * 0.7, R_, h, 9), toon({ color: i % 2 ? '#c9805a' : '#b9734f' }), Math.cos(a) * d, h / 2 - 2, Math.sin(a) * d, world, { cast: false }); } }
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

function worldState(S, f) {
  truck.visible = S.truck !== undefined;
  if (S.truck) { const [x, z, yaw] = S.truck; truck.position.set(x, 0, z); truck.rotation.y = yaw || 0;
    const b = S.bump || 0; tBody.position.y = b * 0.18 * Math.abs(Math.sin(f * 0.9)); tBody.rotation.x = b * 0.12 * Math.sin(f * 0.7); tBody.rotation.z = b * 0.06 * Math.sin(f * 1.1 + 1);
    wheels.forEach((w) => { w.rotation.y = (S.wheelSpin || 0) * f; });
    gunB.rotation.set(b * 0.6 * Math.sin(f * 0.53), b * 1.2 * Math.sin(f * 0.37) + (S.gunYaw || 0), 0); }
  gunA.rotation.set(0, S.gunAYaw || 0, 0); gunA.position.z = S.recoil ? -0.06 * Math.abs(Math.sin(f * 2.4)) : 0;
  boardFace.material.map = S.tally ? tallyTex : boardTex;
  windmill.rotation.z = f * 0.05;
  flagG.visible = S.flag !== undefined; flagG.position.y = RIDGE_Y - 0.4; flagM.position.y = 1.0 + (S.flag || 0) * 4.2;
  const pa = flagM.geometry.attributes.position, b0 = flagM.userData.base;
  for (let k = 0; k < pa.count; k++) { const x = b0[k * 3]; pa.setZ(k, Math.sin(f * 0.25 + x * 2.4) * 0.15 * (x + 1.1)); } pa.needsUpdate = true;
  waterU.t.value = f / 30;
}

// ---------- cards ----------
const CW = 1200, CH = 2000, CM = 2.25; // canvas px, card height in metres (design 600x1000 -> 2.25 m)
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
  inkU.px.value = 2.5; inkU.flash.value = window.DEBUG_E ? -1 : (C.flash || 0); inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  // lens
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
