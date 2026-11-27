// ---------- world ----------
// Vasa: Stockholm harbour 1628, the ship (hull lofted from sections), a seabed, and a museum hall far away (x = 800).
const DECK = 2; // quay height
const world = new THREE.Group(); scene.add(world);
// sea
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') } };
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
    void main(){ vec2 p = vW.xz*vec2(.16,.22) + vec2(t*.12, -t*.18);
      float n = noise(p) * .6 + noise(p*2.3 + 7.) * .4;
      vec3 c = mix(deep, shal, .3 + .45*n);
      float streak = smoothstep(.74, .8, noise(vW.xz*vec2(.35,.5) + vec2(t*.3, -t*.4)));
      c = mix(c, glint, streak*.6);
      if (!gl_FrontFacing) c = mix(shal, glint, .35 + .3*n);  // seen from below: bright surface
      gl_FragColor = vec4(c,1.);
      #include <fog_fragment>
    }`,
});
const water = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), waterMat); water.rotation.x = -Math.PI / 2; water.position.y = 0;
water.userData.nd = waterNd; water.receiveShadow = false; scene.add(water);
// seabed (under the launch site) with rocks and weed
const sand = toon({ color: '#7d8460' }), rockM = toon({ color: '#5e6658' }), weedM = toon({ color: '#3e6a3a' });
add(new THREE.PlaneGeometry(500, 500), sand, 40, -31, 0, world, { cast: false }).rotation.x = -Math.PI / 2;
{ const r = P.rng(5); for (let i = 0; i < 40; i++) { const x = 40 + (r() - 0.5) * 140, z = (r() - 0.5) * 140; if (Math.hypot(x - 40, z) < 26) continue;
  const k = add(new THREE.SphereGeometry(1 + r() * 2.5, 8, 6), rockM, x, -31, z, world); k.scale.y = 0.6;
  if (i % 2) { const w = add(new THREE.ConeGeometry(0.4, 3 + r() * 4, 5), weedM, x + 1.5, -29, z, world); w.rotation.z = (r() - 0.5) * 0.5; } } }
// quay and land (x < -28): stone edge, cobbles, grass behind
add(tbox(700, DECK + 8, 1200, 3), M.stone, -28 - 350, (DECK - 8) / 2, 0, world, { cast: false });
const cobble = add(new THREE.PlaneGeometry(26, 1200), M.dirt, -41, DECK + 0.01, 0, world, { cast: false }); cobble.rotation.x = -Math.PI / 2;
const lawn = M.grass.clone(); lawn.map = M.grass.map.clone(); lawn.map.repeat.set(0.3, 0.3); lawn.map.needsUpdate = true;
const field = add(new THREE.PlaneGeometry(600, 1200), lawn, -54 - 300, DECK + 0.02, 0, world, { cast: false }); field.rotation.x = -Math.PI / 2;
for (let z = -60; z <= 60; z += 8) add(new THREE.CylinderGeometry(0.28, 0.32, 0.9, 10), M.wood, -29.2, DECK + 0.45, z, world);
// a wooden pier the ship is moored to
add(tbox(14, 0.4, 5, 1), M.plank, -22, DECK - 0.2, -11, world);
for (const x of [-27, -22, -17]) for (const z of [-13.2, -8.8]) add(new THREE.CylinderGeometry(0.25, 0.28, 8, 8), M.rot, x, DECK - 4, z, world);
// town
const houses = [];
const house = (x, z, w, d, h, rot, mat = M.plaster) => {
  const g = new THREE.Group(); g.position.set(x, DECK, z); g.rotation.y = rot; world.add(g);
  add(tbox(w, h, d, 2), mat, 0, h / 2, 0, g);
  const rf = add(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.5, 2.6, 4), M.roof, 0, h + 1.3, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
  add(box(0.9, 1.8, 0.1), M.door, 0, 0.9, d / 2 + 0.03, g, { cast: false });
  for (const s of [-1, 1]) for (const k of [0.4, 0.75]) add(box(0.6, 0.7, 0.1), M.window, s * w * 0.28, h * k, d / 2 + 0.03, g, { cast: false });
  houses.push(g); return g;
};
const rh = P.rng(12), wallMats = [M.plaster, M.plaster2, toon({ color: '#d98b5f' }), toon({ color: '#e7c66a' })];
for (let row = 0; row < 3; row++) for (let i = 0; i < 16; i++) {
  const z = -90 + i * 11 + rh() * 3, x = -60 - row * 13 - rh() * 3;
  house(x, z, 6 + rh() * 2, 7 + rh() * 2, 6 + rh() * 5, Math.PI / 2 + (rh() - 0.5) * 0.1, wallMats[(i + row) % 4]);
}
// church with a tall spire, and a castle
{ const g = new THREE.Group(); g.position.set(-82, DECK, 24); world.add(g);
  add(tbox(9, 10, 18, 2), M.plaster, 0, 5, 0, g); add(tbox(6, 22, 6, 2), M.plaster2, 0, 11, -11, g);
  add(new THREE.ConeGeometry(4.4, 16, 4), toon({ color: '#3d6e6a' }), 0, 30, -11, g).rotation.y = Math.PI / 4; }
{ const g = new THREE.Group(); g.position.set(-120, DECK, -70); world.add(g);
  add(tbox(40, 16, 26, 3), M.stone, 0, 8, 0, g);
  for (const [x, z] of [[-20, -13], [20, -13], [-20, 13], [20, 13]]) { add(new THREE.CylinderGeometry(4, 4.4, 24, 14), M.stone, x, 12, z, g); add(new THREE.ConeGeometry(5, 7, 14), M.roof, x, 27.5, z, g); } }
// islands and far shores
const cypress = (x, z, h = 7, y = DECK, parent = world) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); add(new THREE.CylinderGeometry(0.15, 0.2, 1, 6), M.trunk, 0, 0.5, 0, g); const c = add(new THREE.SphereGeometry(1, 10, 10), M.cypress, 0, 0.9 + h / 2, 0, g); c.scale.set(1.4, h / 2, 1.4); return g; };
const pine = (x, z, h = 6, y = DECK) => { const g = new THREE.Group(); g.position.set(x, y, z); world.add(g); add(new THREE.CylinderGeometry(0.2, 0.3, h, 6), M.trunk, 0, h / 2, 0, g); const c = add(new THREE.ConeGeometry(2.6, h * 1.2, 8), M.pine, 0, h * 1.1, 0, g); return g; };
{ const r = P.rng(44);
  for (let i = 0; i < 9; i++) { const a = -1.2 + i * 0.32 + (r() - 0.5) * 0.2, d = 230 + r() * 160, R_ = 40 + r() * 50;
    const hx = Math.cos(a) * d + 60, hz = Math.sin(a) * d;
    const h = add(new THREE.SphereGeometry(R_, 20, 10), i % 2 ? M.hill : M.hillFar, hx, -R_ * 0.55, hz, world, { cast: false }); h.scale.y = 0.55;
    for (let k = 0; k < 6; k++) pine(hx + (r() - 0.5) * R_, hz + (r() - 0.5) * R_ * 0.8, 6 + r() * 4, R_ * 0.12); }
  for (let i = 0; i < 40; i++) { const x = -56 - r() * 120, z = (r() - 0.5) * 260; if (x > -100 && Math.abs(z) < 100) continue; (i % 2 ? pine : cypress)(x, z, 6 + r() * 4); }
  for (let i = 0; i < 12; i++) { const a = r() * Math.PI * 2, d = 560 + r() * 200, hh = 80 + r() * 90, r_ = 120 + r() * 70; const g = new THREE.Group(); g.position.set(Math.cos(a) * d, -5, Math.sin(a) * d); world.add(g); add(new THREE.ConeGeometry(r_, hh, 7), M.mount, 0, hh / 2, 0, g, { cast: false }); } }
// clouds: painted billboards far away (no fog, no ink)
const clouds = [];
{ const r = P.rng(90);
  for (let i = 0; i < 14; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 120 + r() * 160, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ---------- the ship ----------
// Local frame: bow at +x (t = 0), stern at -x (t = 1), waterline y = 0, keel at y = -4.2. Rotation.x of shipG = heel.
const SL = 40, SB = 4.6, KEEL = -4.2;
const hullW = (t) => SB * (t < 0.55 ? Math.pow(Math.sin(t / 0.55 * Math.PI / 2), 0.62) : 1 - 0.28 * Math.pow((t - 0.55) / 0.45, 2));
const hullTop = (t) => 5.3 + 4.2 * Math.pow(Math.max(0, (t - 0.68) / 0.32), 1.4) + 1.6 * Math.pow(Math.max(0, (0.18 - t) / 0.18), 2);
const hullX = (t) => SL / 2 - t * SL;
const sideZ = (t, y) => { const top = hullTop(t), r = Math.min(1, Math.max(0, (y - KEEL) / (top - KEEL))); const c = 1 - Math.pow(r, 1 / 0.7); return hullW(t) * Math.sqrt(Math.max(0, 1 - c * c)); };
const shipG = new THREE.Group(); scene.add(shipG);
const hullMat = toon({ map: P.tex(P.planks(51), 1, 1), color: '#8a6040' });
hullMat.map.wrapS = hullMat.map.wrapT = THREE.RepeatWrapping;
const gold = toon({ color: '#e8b83a' }), redM = toon({ color: '#b8282b' }), darkM = toon({ color: '#1e1814' }), bronzeM = toon({ color: '#b08a4a' }), sailM = toon({ color: '#efe6cf', side: THREE.DoubleSide });
{ // lofted hull
  const NS = 64, NC = 18, pos = [], uv = [], idx = [];
  for (let i = 0; i <= NS; i++) { const t = i / NS, x = hullX(t), w = hullW(t), top = hullTop(t); let arc = 0, prev = null;
    for (let j = 0; j <= NC; j++) { const th = -Math.PI / 2 + Math.PI * j / NC, z = w * Math.sin(th), y = KEEL + (top - KEEL) * Math.pow(1 - Math.cos(th), 0.7);
      if (prev) arc += Math.hypot(z - prev[0], y - prev[1]); prev = [z, y];
      pos.push(x, y, z); uv.push(x / 3, arc / 1.6); } }
  for (let i = 0; i < NS; i++) for (let j = 0; j < NC; j++) { const a = i * (NC + 1) + j, b = a + NC + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const hm = add(g, new THREE.MeshToonMaterial({ gradientMap: grad, map: hullMat.map, color: '#8a6040', side: THREE.DoubleSide }), 0, 0, 0, shipG);
  // transom (stern cap): the last section outline as a flat shape, facing -x
  { const sh = new THREE.Shape(), last = NS * (NC + 1);
    for (let j = 0; j <= NC; j++) { const z = pos[(last + j) * 3 + 2], y = pos[(last + j) * 3 + 1]; j ? sh.lineTo(z, y) : sh.moveTo(z, y); }
    const tg = new THREE.ShapeGeometry(sh); tg.rotateY(-Math.PI / 2); tg.translate(hullX(1) + 0.02, 0, 0);
    add(tg, toon({ color: '#6a4628', side: THREE.DoubleSide }), 0, 0, 0, shipG); }
  // deck: strip between the sides at main-deck height
  const dp = [], di = [], DY = 4.9; let n = 0;
  for (let i = 2; i <= NS - 4; i++) { const t = i / NS, z = sideZ(t, DY) * 0.98; dp.push(hullX(t), DY, -z, hullX(t), DY, z); if (n) di.push(n * 2 - 2, n * 2, n * 2 - 1, n * 2, n * 2 + 1, n * 2 - 1); n++; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3)); dg.setIndex(di); dg.computeVertexNormals();
  const dpu = []; for (let k = 0; k < dp.length; k += 3) dpu.push(dp[k] / 2, dp[k + 2] / 2); dg.setAttribute('uv', new THREE.Float32BufferAttribute(dpu, 2));
  add(dg, new THREE.MeshToonMaterial({ gradientMap: grad, map: M.plank.map, side: THREE.DoubleSide }), 0, 0, 0, shipG, { cast: false });
}
// wales (dark bands) and gold rails along the sides
const ship = { ports: [], lids: [], cannons: [], sails: [], flags: [], crates: [], scaff: null, puffs: [] };
for (const s of [-1, 1]) for (let i = 4; i <= 58; i += 2) { const t = i / 64, x = hullX(t);
  add(box(SL / 32 + 0.05, 0.22, 0.1), darkM, x, 1.0, s * sideZ(t, 1.0) + s * 0.03, shipG, { cast: false });
  const ty = hullTop(t) - 0.15; add(box(SL / 32 + 0.05, 0.18, 0.12), gold, x, ty, s * sideZ(t, ty) + s * 0.02, shipG, { cast: false }); }
// two rows of gun ports, red lids that open, bronze cannons
for (const [row, y] of [[0, 2.1], [1, 3.7]]) for (let k = 0; k < 16; k++) { const t = 0.2 + k * 0.036; if (t > 0.76) break; const x = hullX(t);
  for (const s of [-1, 1]) { const z = s * (sideZ(t, y) + 0.04);
    const port = add(box(0.72, 0.7, 0.08), darkM, x, y, z, shipG, { cast: false }); ship.ports.push(port);
    const hinge = new THREE.Group(); hinge.position.set(x, y + 0.36, z + s * 0.03); shipG.add(hinge);
    add(box(0.8, 0.76, 0.08), redM, 0, -0.38, 0, hinge); hinge.userData.s = s; ship.lids.push(hinge);
    const c = add(new THREE.CylinderGeometry(0.15, 0.19, 1.5, 10), bronzeM, x, y, z + s * 0.5, shipG); c.rotation.x = Math.PI / 2; c.userData.base = c.position.clone(); c.userData.s = s; c.userData.k = k + row * 16; ship.cannons.push(c); } }
// stern castle with gold carvings, forecastle, lion figurehead
{ const t0 = 0.74, x0 = hullX(t0), x1 = hullX(0.995), w = sideZ(0.86, 6) * 0.95;
  add(tbox(x0 - x1, 3.6, w * 2, 2), toon({ color: '#5a3a24' }), (x0 + x1) / 2, 6.6, 0, shipG);
  add(tbox(x0 - x1 - 2.5, 2.2, w * 1.7, 2), toon({ color: '#6a4628' }), (x0 + x1) / 2 - 1.2, 9.4, 0, shipG);
  const sx = x1 - 0.12; // carved gold on the stern face
  for (let r = 0; r < 5; r++) for (let c = -3; c <= 3; c++) { const y = 2.8 + r * 1.3, z = c * w * 0.26;
    const o = add(r % 2 ? new THREE.SphereGeometry(0.28, 10, 8) : new THREE.OctahedronGeometry(0.34), gold, sx, y, z, shipG, { cast: false }); }
  add(box(0.2, 1.6, w * 1.6), toon({ color: '#2d4f9e' }), sx - 0.05, 8.4, 0, shipG, { cast: false });
  for (const z of [-0.9, 0.9]) add(new THREE.SphereGeometry(0.5, 12, 10), gold, sx - 0.2, 8.4, z, shipG, { cast: false });
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) add(new THREE.SphereGeometry(0.24, 8, 6), gold, x0 - 1 - k * 1.5, 8.6, s * w, shipG, { cast: false });
  const fx0 = hullX(0.06), fx1 = hullX(0.2); add(tbox(fx0 - fx1, 1.6, sideZ(0.13, 6) * 1.9, 2), toon({ color: '#5a3a24' }), (fx0 + fx1) / 2, 5.7, 0, shipG);
  const lion = new THREE.Group(); lion.position.set(SL / 2 + 0.8, 4.9, 0); shipG.add(lion);
  add(new THREE.SphereGeometry(0.9, 14, 12), gold, 0.4, 0.4, 0, lion); add(new THREE.ConeGeometry(0.55, 2.2, 10), gold, -0.6, -0.2, 0, lion).rotation.z = Math.PI / 2;
  const bs = add(new THREE.CylinderGeometry(0.18, 0.3, 13, 10), M.wood, SL / 2 + 4.5, 7.6, 0, shipG); bs.rotation.z = -1.15; }
// masts, yards, sails, flags, shrouds
const rope = (a, b, r = 0.05, parent = shipG) => { const d = new THREE.Vector3(...b).sub(new THREE.Vector3(...a)), L = d.length(); const m = add(new THREE.CylinderGeometry(r, r, L, 5), darkM, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, parent, { cast: false }); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
const flagTex = (() => { const c = document.createElement('canvas'); c.width = 96; c.height = 60; const g = c.getContext('2d'); g.fillStyle = '#2f6fb8'; g.fillRect(0, 0, 96, 60); g.fillStyle = '#f2c230'; g.fillRect(28, 0, 14, 60); g.fillRect(0, 23, 96, 14); return P.tex(c); })();
for (const [t, h, yards] of [[0.24, 25, [10, 17, 22]], [0.48, 30, [11, 19, 26]], [0.77, 19, [12, 17]]]) {
  const x = hullX(t), base = t > 0.7 ? 8.4 : 4.9;
  add(new THREE.CylinderGeometry(0.34, 0.5, h, 12), M.wood, x, base + h / 2, 0, shipG);
  add(new THREE.CylinderGeometry(0.9, 0.9, 0.35, 12), M.wood, x, yards[0] + 0.8, 0, shipG); // fighting top
  for (let k = 0; k < yards.length; k++) { const y = yards[k], span = (t > 0.7 ? 7 : 11) * (1 - k * 0.22);
    const yd = add(new THREE.CylinderGeometry(0.16, 0.16, span, 8), M.wood, x + 0.45, y, 0, shipG); yd.rotation.x = Math.PI / 2;
    if (k < yards.length - 1 || yards.length === 2) { const hgt = (k < yards.length - 1 ? yards[k + 1] - y : 3.4) - 0.5;
      const sg = new THREE.PlaneGeometry(span * 0.92, hgt, 8, 6); sg.translate(0, -hgt / 2, 0);
      const pa = sg.attributes.position; for (let i = 0; i < pa.count; i++) { const zz = pa.getX(i) / (span * 0.46), yy = -pa.getY(i) / hgt; pa.setZ(i, 0.9 * (1 - zz * zz) * Math.sin(Math.PI * Math.min(1, yy + 0.15))); }
      sg.computeVertexNormals(); sg.rotateY(Math.PI / 2);
      const sail = add(sg, sailM, x + 0.75, y - 0.1, 0, shipG); sail.userData.sail = true; sail.userData.h = hgt; ship.sails.push(sail); } }
  const fl = add(new THREE.PlaneGeometry(2.4, 1.5, 6, 2), new THREE.MeshToonMaterial({ gradientMap: grad, map: flagTex, side: THREE.DoubleSide }), x - 1.3, base + h + 0.4, 0, shipG, { cast: false });
  fl.userData.base = fl.geometry.attributes.position.array.slice(); ship.flags.push(fl);
  for (const s of [-1, 1]) for (let k = -1; k <= 1; k++) rope([x + k * 1.2, base + h * 0.78, 0], [x + k * 1.6 - 0.6, hullTop(t) - 0.1, s * (sideZ(t, hullTop(t) - 0.1) + 0.05)]);
}
rope([hullX(0.24), 4.9 + 25, 0], [SL / 2 + 9, 10.4, 0]); rope([hullX(0.48), 4.9 + 30, 0], [hullX(0.24), 4.9 + 22, 0]); rope([hullX(0.77), 8.4 + 19, 0], [hullX(0.48), 4.9 + 24, 0]);
// weight crates dropped onto the deck (shot "stacking weight")
for (let i = 0; i < 4; i++) { const c = add(tbox(2.2, 1.4, 2.2, 1), M.plank, hullX(0.32 + i * 0.09), 5.6, (i % 2 ? 1 : -1) * 0.8, shipG); c.userData.base = c.position.clone(); ship.crates.push(c); }
// building scaffold around the hull (shipyard shots)
{ const g = new THREE.Group(); shipG.add(g); ship.scaff = g;
  for (const s of [-1, 1]) for (let x = -18; x <= 18; x += 4) { add(new THREE.CylinderGeometry(0.14, 0.14, 12, 6), M.wood, x, 1.5, s * (SB + 1.6), g); }
  for (const s of [-1, 1]) for (const y of [2, 5, 8]) add(tbox(38, 0.18, 1.0, 1), M.plank, 0, y, s * (SB + 1.9), g); }
// museum hall far away with a second ship (sails furled)
const museum = new THREE.Group(); museum.position.set(800, 0, 0); scene.add(museum);
{ const wallM = toon({ color: '#5e4c6a' }), floorM = toon({ color: '#3a3240' });
  add(tbox(90, 0.6, 50, 3), floorM, 0, 0.3, 0, museum, { cast: false });
  add(tbox(90, 40, 1, 3), wallM, 0, 20, -25, museum); add(tbox(1, 40, 50, 3), wallM, -45, 20, 0, museum); add(tbox(1, 40, 50, 3), wallM, 45, 20, 0, museum);
  add(tbox(90, 1, 50, 3), toon({ color: '#2a2230' }), 0, 40.5, 0, museum, { cast: false });
  for (let x = -40; x <= 40; x += 10) add(box(3, 0.4, 3), toon({ color: '#fff3c4', emissive: '#fff0c0', emissiveIntensity: 0.8 }), x, 40, 6, museum, { cast: false });
  for (const x of [-12, 0, 12]) add(tbox(3, 4.6, 6, 1), M.beamDark, x, 2.6, 0, museum); }
ship.scaff.visible = false;
const shipM = shipG.clone(true); museum.add(shipM); shipM.position.set(0, 9.2, 0);
shipM.traverse((o) => { if (o.userData.sail) o.visible = false; });
ship.scaff.visible = true;

// ---------- props ----------
const helmet = new THREE.Group(); scene.add(helmet); helmet.visible = false; // kept for the engine's helmetState()

