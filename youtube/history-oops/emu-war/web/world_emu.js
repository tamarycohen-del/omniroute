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
  add(box(0.15, 0.6, 3.6), tinM, 0, 0, -2.2, g.children[g.children.length - 1].parent === g ? head : head);
  return head; })();
// army camp: tent, crates, chalk board
{ const g = new THREE.Group(); g.position.set(-10, 0, 24); world.add(g);
  const tent = add(new THREE.CylinderGeometry(3.2, 3.2, 7, 3, 1, false), canvasM, 0, 1.6, 0, g); tent.rotation.set(0, 0, Math.PI / 2); tent.rotation.order = 'ZYX';
  tent.rotation.x = Math.PI / 2; tent.scale.set(1, 1, 0.8); }
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
for (const x of [-1.5, 1.5]) add(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 5), M.wood, x, 1.6, -0.05, board);
const boardFace = add(new THREE.PlaneGeometry(3.4, 2.1), toon({ map: boardTex }), 0, 2.1, 0.04, board, { cast: false });
add(tbox(3.6, 2.3, 0.08, 1), M.wood, 0, 2.1, -0.02, board);
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
const flagG = new THREE.Group(); flagG.position.set(4, RIDGE_Y - 0.4, 116); world.add(flagG);
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
