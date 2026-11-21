// ---------- world: "What If Gravity Turned Off" ----------
// Areas: STREET (origin, road along x at z = 0, houses at z = -16 and +16), HIGHWAY (x = 400), BEACH (x = -400, sea toward -z),
// SPACE station (z = 3000, y = 0, dark sky via light preset), BEDROOM (x = 0, z = -600, interior box).
const world = new THREE.Group(); scene.add(world);
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') } };
const asph = toon({ color: '#5a5c62' }), walk = toon({ color: '#c9c2b4' }), lawnM = toon({ color: '#7cb84e' }), lineM = toon({ color: '#f4f0e0' }), yel = toon({ color: '#f2c230' });
const roofs = ['#b8483a', '#3d6e8a', '#6a4a3a', '#4a6a3a'].map((c) => toon({ color: c })), walls = ['#f2e6c8', '#cfe2ee', '#f2cfc0', '#e0eac8', '#f6f0e0'].map((c) => toon({ color: c }));
const dark = toon({ color: '#2a2a30' }), glassM = toon({ color: '#9ec4d6' }), tyreM = toon({ color: '#222020' }), chrome = toon({ color: '#d0d4d8' });
const sandM = toon({ color: '#ecd29a' }), waterBlobM = new THREE.MeshToonMaterial({ gradientMap: grad, color: '#5fb8d8', transparent: true, opacity: 0.82 });
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
  { const b = add(new THREE.SphereGeometry(0.3, 14, 10), toon({ color: '#e8452a' }), 7, 0.3, -4.6); fl(b, 7, 2); }
  // parked cars (car A lands on car B later)
  const cA = car('#d84a3a'); cA.position.set(-9, 0, 3.4); fl(cA, 5, 0.6, 'street', { carA: true });
  const cB = car('#3a7ad8'); cB.position.set(-14, 0, -3.4); fl(cB, 4, 0.5, 'street', { carB: true });
  const cC = car('#f2c230'); cC.position.set(14, 0, 3.4); fl(cC, 6, 0.8);
  // cafe table + chairs (coffee cup is a card)
  { const g = new THREE.Group(); g.position.set(6, 0, -7.4); world.add(g); add(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 16), toon({ color: '#ffffff' }), 0, 0.95, 0, g); add(new THREE.CylinderGeometry(0.05, 0.05, 0.95, 6), dark, 0, 0.47, 0, g); fl(g, 3, 0.6); }
  for (const x of [5, 7]) { const g = new THREE.Group(); g.position.set(x, 0, -7.4); world.add(g); add(tbox(0.5, 0.06, 0.5, 1), toon({ color: '#e86a3a' }), 0, 0.5, 0, g); add(tbox(0.5, 0.5, 0.06, 1), toon({ color: '#e86a3a' }), 0, 0.78, -0.22, g); fl(g, 4, 1.4); }
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
const sea = new THREE.Mesh(new THREE.PlaneGeometry(1400, 800), waterMat); sea.rotation.x = -Math.PI / 2; sea.position.set(BX, 0.05, -420); sea.userData.nd = new THREE.ShaderMaterial({
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }` }); scene.add(sea);
const blobs = [];
for (let i = 0; i < 9; i++) { const m = add(new THREE.SphereGeometry(1, 24, 16), waterBlobM, BX - 24 + i * 6 + (i % 2) * 2, 0, -12 - (i % 3) * 7, world, { cast: false }); m.userData.base = m.position.clone(); m.userData.r = 1.6 + (i % 3) * 0.9; blobs.push(m); }
for (let i = 0; i < 6; i++) { const u = add(new THREE.ConeGeometry(1.4, 1.0, 10, 1, true), toon({ color: ['#e84a4a', '#f2c230', '#4a8ae8'][i % 3], side: THREE.DoubleSide }), BX - 18 + i * 7, 2.6, 14 + (i % 2) * 3, world); add(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 5), chrome, BX - 18 + i * 7, 1.3, 14 + (i % 2) * 3, world); }
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
  add(tbox(10, 0.2, 8, 2), floorR, 0, -0.1, 0, ROOM, { cast: false });
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
function worldState(S, f) {
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
