// ---- extra set dressing (matched to the original video) ----
// party at the pink house: bunting and balloons
const PARTY = new THREE.Group(); S.add(PARTY);
{ const cols = ['#ff5fa2', '#ffd23f', '#45d0ff', '#9b6bff', '#5fe06a', '#ff8a3d'], tri = new THREE.Shape(); tri.moveTo(-0.28, 0); tri.lineTo(0.28, 0); tri.lineTo(0, -0.62); tri.lineTo(-0.28, 0);
  const tg = new THREE.ShapeGeometry(tri); const string = (a, b, sag, n) => { for (let i = 0; i <= n; i++) { const k = i / n, x = lerp(a[0], b[0], k), y = lerp(a[1], b[1], k) - Math.sin(k * PI) * sag, z = lerp(a[2], b[2], k);
    const f = add(tg, new THREE.MeshStandardMaterial({ color: cols[i % 6], side: THREE.DoubleSide, emissive: cols[i % 6], emissiveIntensity: 0.25 }), x, y, z, PARTY, false); f.rotation.y = Math.atan2(b[0] - a[0], b[2] - a[2]) - PI / 2; } };
  string([-5.6, 5.4, -11.5], [5.6, 5.4, -11.5], 0.9, 16); string([4.4, 6.0, -12.2], [6.0, 5.9, -5.8], 0.8, 9); string([-4.4, 6.0, -12.2], [-6.0, 5.9, -5.8], 0.8, 9);
  for (const [x, y, z, c] of [[-5.2, 3.6, -10.6, '#ff6fb5'], [-4.5, 4.1, -10.9, '#b06cff'], [-5.6, 4.4, -11.0, '#4fd6ff'], [5.1, 3.7, -10.6, '#ffd24a'], [4.4, 4.2, -10.9, '#ff6fb5'], [5.6, 4.5, -11.0, '#9b6bff']]) {
    const b = ball(0.42, new THREE.MeshStandardMaterial({ color: c, roughness: 0.25, emissive: c, emissiveIntensity: 0.25 }), x, y, z, PARTY); b.scale.y = 1.18; bx(0.02, y - 1.1, 0.02, '#eeeeee', x, (y - 0.45) / 2 + 0.2, z, PARTY, { sh: false }); } }
const redLid = M('#b3182b', { r: 0.35 }), cyanGem = new THREE.MeshStandardMaterial({ color: '#5ff3ff', emissive: '#18b8e0', emissiveIntensity: 1.2, roughness: 0.1 });
const PCH = [[-2.7, -8.5, 0.15], [0, -8.2, 0], [2.7, -8.6, -0.15]].map(([x, z, r]) => makeChest(x, z, r, 1.25, { lid: redLid, lidGem: cyanGem, skull: false, gem: cyanGem }));
PCH[1].userData.glow.material.color.set('#ff8a2a'); const pLight = new THREE.PointLight('#ff9a3a', 0, 10, 1.6); pLight.position.set(0, 2.4, -8); S.add(pLight);
// movable dressing chests
const XC = [0, 1, 2, 3, 4].map(() => makeChest(0, 0, 0, 1.25)); const xcAt = (i, x, z, ry, open = 0, glow = 0, col = '#b04dff') => { const c = XC[i]; c.visible = true; c.position.set(x, 0, z); c.rotation.y = ry; chestOpen(c, open, glow); c.userData.glow.material.color.set(col); };
const woodLid = M('#7a4320', { r: 0.6 });
// cars
const makeCar = (c) => { const g = new THREE.Group(); S.add(g); bx(5.2, 1.2, 2.4, c, 0, 0.95, 0, g, { rad: 0.25 }); bx(3, 1, 2.2, c, -0.3, 2, 0, g, { rad: 0.25 }); bx(2.8, 0.75, 2.26, '#203040', -0.3, 2.05, 0, g, { rad: 0.15 });
  for (const [x, z] of [[-1.7, 1.1], [1.7, 1.1], [-1.7, -1.1], [1.7, -1.1]]) { const w = cyl(0.5, 0.4, '#151515', x, 0.5, z, g); w.rotation.x = PI / 2; } for (const z of [-0.8, 0.8]) add(new THREE.BoxGeometry(0.1, 0.35, 0.5), BASIC('#fff6d0'), 2.62, 1.05, z, g, false); return g; };
const CAR2 = makeCar('#5cb83c'), CAR3 = makeCar('#4aa838');
// wheelchair
const WC = new THREE.Group(); S.add(WC); { const m = M('#2c2f36', { r: 0.4, m: 0.4 }); bx(2.3, 0.3, 2.0, '#3a3d44', 0, 1.45, 0, WC); bx(2.3, 2.2, 0.25, '#3a3d44', 0, 2.6, -1.0, WC);
  for (const s of [-1, 1]) { const w = add(new THREE.TorusGeometry(1.15, 0.11, 8, 28), m, s * 1.3, 1.2, -0.1, WC); w.rotation.y = PI / 2; const h = cyl(0.14, 0.3, '#9aa0a8', s * 1.3, 1.2, -0.1, WC); h.rotation.z = PI / 2;
    const fw = cyl(0.28, 0.16, '#1a1a1a', s * 0.9, 0.28, 1.0, WC); fw.rotation.z = PI / 2; bx(0.12, 1.2, 0.12, m, s * 1.2, 0.9, 0.9, WC); bx(0.12, 0.12, 2.1, m, s * 1.2, 2.2, -0.05, WC); } }
// golden robot-ish avatar with a little antenna
const GGR = makeChar({ skin: '#f0b43a', shirt: '#f2b632', pants: '#f2b632', toff: 0.4, build: (c) => { c.root.traverse((m) => { if (m.isMesh && m !== c.head) m.material = gold; }); c.head.material = c.head.material.map((mm, i) => (i === 4 ? mm : gold));
  cyl(0.06, 0.7, gold, 0, 1.6, 0, c.neck); ball(0.14, gold, 0, 1.98, 0, c.neck); for (const s of [-1, 1]) bx(0.12, 0.6, 0.12, gold, s * 0.35, 1.55, 0.2, c.neck); bx(1.6, 0.25, 0.3, goldDark, 0, 1.75, 0.5, c.torso); } });
// cozy timber-frame house beams
{ const bm = M('#4a2a14', { r: 0.8 }); for (const x of [-4.4, -1.2, 1.2, 4.4]) bx(0.22, 5, 0.12, bm, x, 2.5, 3.56, cozy); for (const y of [0.15, 2.8, 4.9]) bx(9.2, 0.22, 0.12, bm, 0, y, 3.56, cozy);
  for (const s of [-1, 1]) { const b = bx(0.22, 5.4, 0.12, bm, s * 2.2, 7.3, 4.06, cozy); b.rotation.z = s * 0.95; } bx(0.22, 3.6, 0.12, bm, 0, 7.0, 4.06, cozy); cozy.children[0].material = M('#f1e2c0', { r: 0.85 }); }
// smoke cloud
const CLOUD = []; for (let k = 0; k < 14; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color: '#f4f1ee', transparent: true, depthWrite: false })); s.visible = false; S.add(s); CLOUD.push(s); }
const cloudAt = (pos, k, R1 = 3.5, sc = 6) => { const r = rng(77); CLOUD.forEach((p) => { const a = r() * 7, e = r() * 2 - 0.5, rr = (0.4 + r() * 0.6) * R1 * sm(clamp(k * 3)); p.visible = k > 0; p.position.set(pos.x + Math.cos(a) * rr, pos.y + e * rr * 0.6 + k * 0.6, pos.z + Math.sin(a) * rr * 0.5); p.scale.setScalar(sc * (0.6 + r() * 0.6) * (0.4 + 0.6 * sm(clamp(k * 2.5)))); p.material.opacity = 1; }); };
// flashlight beam
{ const cg = new THREE.ConeGeometry(1.7, 7, 24, 1, true); cg.translate(0, -3.5, 0); const beam = add(cg, new THREE.MeshBasicMaterial({ color: '#fff0c0', transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }), 0, 0, 0.3, flashBody, false); beam.rotation.x = -PI / 2; beam.castShadow = false; }
const flashFrom = (c, side, target, beamOn = true) => { S.updateMatrixWorld(); const hp = handPos(c, side); flashBody.visible = true; flashBody.position.copy(hp); flashBody.lookAt(target); flashBody.children[flashBody.children.length - 1].visible = beamOn;
  flashL.intensity = 90; flashL.position.copy(hp); flashL.target.position.copy(target); flashS.visible = true; flashS.position.copy(hp).add(target.clone().sub(hp).normalize().multiplyScalar(0.45)); flashS.scale.setScalar(1.1); };
// wooden bat for the wooden guy
const bat = new THREE.Group(); S.add(bat); { const m = add(new THREE.CylinderGeometry(0.2, 0.1, 2.6, 12), woodM, 0, -1.2, 0, bat); }
// restaurant interior (built off to the side)
const IX = 220; const INTR = new THREE.Group(); S.add(INTR); INTR.visible = false;
{ const menuTex = canvasTex(512, 256, (g) => { g.fillStyle = '#1b1b1f'; g.fillRect(0, 0, 512, 256); for (let k = 0; k < 3; k++) { const x = 20 + k * 166; g.fillStyle = '#e8a33a'; g.beginPath(); g.ellipse(x + 60, 80, 50, 26, 0, PI, 0); g.fill(); g.fillStyle = '#5a2e14'; g.fillRect(x + 12, 84, 96, 14); g.fillStyle = '#ffcc33'; g.fillRect(x + 8, 98, 104, 8); g.fillStyle = '#e8a33a'; g.fillRect(x + 12, 106, 96, 16);
    g.fillStyle = '#fff'; g.font = '700 30px "Inter Display", sans-serif'; g.fillText('$' + (3 + k * 2) + '.99', x + 22, 170); g.fillStyle = '#ff3b3b'; g.fillText(['BURGER', 'COMBO', 'FRIES'][k], x + 4, 220); } });
  const chkTex = canvasTex(128, 96, (g) => { g.fillStyle = '#16323a'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#2ee66a'; g.beginPath(); g.roundRect(24, 14, 80, 68, 10); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 12; g.beginPath(); g.moveTo(42, 50); g.lineTo(60, 66); g.lineTo(88, 32); g.stroke(); });
  const fl = add(new THREE.PlaneGeometry(40, 30), M('#5a3a2a', { r: 0.5 }), IX, 0.01, 0, INTR, false); fl.rotation.x = -PI / 2;
  bx(30, 12, 0.5, '#8e1a22', IX, 6, -7, INTR); bx(30, 0.5, 14, '#2a1a16', IX, 11, 0, INTR);
  for (const x of [-6, 0, 6]) add(new THREE.PlaneGeometry(5, 2.5), new THREE.MeshBasicMaterial({ map: menuTex, toneMapped: false }), IX + x, 7.6, -6.7, INTR, false);
  add(new THREE.PlaneGeometry(8, 3.3), signM, IX - 8, 4.2, -6.7, INTR, false);
  bx(14, 2.8, 1.8, '#c0392b', IX, 1.4, 0, INTR, { rad: 0.06 }); bx(14.4, 0.25, 2.3, '#efe6d8', IX, 2.92, 0, INTR); add(new THREE.BoxGeometry(14.2, 0.12, 0.05), BASIC('#ffb347'), IX, 2.7, 0.92, INTR, false);
  for (const x of [-2.2, 2.4]) { const r = new THREE.Group(); r.position.set(IX + x, 3.05, 0.4); INTR.add(r); bx(0.5, 0.6, 0.4, '#222', 0, 0.3, 0, r); const sc = bx(1.4, 1.0, 0.12, '#222', 0, 1.1, 0, r); sc.rotation.x = -0.35; const pl = add(new THREE.PlaneGeometry(1.2, 0.85), new THREE.MeshBasicMaterial({ map: chkTex, toneMapped: false }), 0, 1.12, 0.08, r, false); pl.rotation.x = -0.35; }
  for (const x of [-8, 0, 8]) { const l = new THREE.PointLight('#ffc27a', 45, 22, 1.4); l.position.set(IX + x, 9, 2); INTR.add(l); add(new THREE.SphereGeometry(0.5, 12, 8), BASIC('#ffe2a8'), IX + x, 10.4, 1, INTR, false); }
  const fill2 = new THREE.PointLight('#ffd9b0', 25, 20, 1.5); fill2.position.set(IX, 5, 9); INTR.add(fill2); }
const WORKER = makeChar({ skin: '#f5cd30', shirt: '#d01f2c', pants: '#2a2a2a', sleeves: true, build: (c) => { const r = M('#c0161f', { r: 0.5 }); bx(1.42, 0.42, 1.42, r, 0, 1.34, 0, c.neck, { rad: 0.18 }); bx(1.3, 0.09, 0.72, r, 0, 1.16, 0.82, c.neck, { rad: 0.03 });
  const band = add(new THREE.TorusGeometry(0.8, 0.06, 6, 20, PI), M('#111'), 0, 0.7, 0, c.neck); for (const s of [-1, 1]) { const e = cyl(0.25, 0.22, '#111', s * 0.72, 0.62, 0, c.neck); e.rotation.z = PI / 2; } bx(0.06, 0.06, 0.6, '#111', 0.62, 0.4, 0.35, c.neck);
  const wl = canvasTex(128, 128, (g) => { g.font = '900 110px "Inter Display", sans-serif'; g.textAlign = 'center'; g.fillStyle = '#ffd23f'; g.fillText('W', 64, 104); }); add(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshBasicMaterial({ map: wl, transparent: true }), 0.5, 1.5, 0.52, c.torso, false); } });
const makeBurger = () => { const g = new THREE.Group(); S.add(g); const bun = M('#e3a24a', { r: 0.5 }); const t = add(new THREE.SphereGeometry(0.55, 16, 10, 0, PI * 2, 0, PI / 2), bun, 0, 0.3, 0, g); cyl(0.58, 0.14, '#4fae35', 0, 0.22, 0, g); cyl(0.56, 0.22, '#5a2e14', 0, 0.06, 0, g); bx(1.0, 0.06, 1.0, '#ffcc33', 0, 0.2, 0, g); cyl(0.55, 0.22, bun, 0, -0.14, 0, g); return g; };
const makeFries = () => { const g = new THREE.Group(); S.add(g); bx(0.7, 0.75, 0.42, '#d8262c', 0, 0, 0, g); for (let k = 0; k < 9; k++) { const f = bx(0.09, 0.8, 0.09, '#ffd23f', -0.28 + (k % 5) * 0.14, 0.5, (k > 4 ? 0.07 : -0.07), g); f.rotation.z = (k - 4) * 0.05; } return g; };
const makeCup = () => { const g = new THREE.Group(); S.add(g); add(new THREE.CylinderGeometry(0.36, 0.28, 1.1, 16), M('#d8262c', { r: 0.5 }), 0, 0, 0, g); cyl(0.38, 0.08, '#f2f2f2', 0, 0.58, 0, g); cyl(0.04, 0.6, '#ffffff', 0.08, 0.85, 0, g); return g; };
const FOODS = [makeBurger(), makeFries(), makeBurger(), makeCup(), makeFries(), makeBurger(), makeCup()];
// crowd modes
const CRM = { plaza: CR, street: [], meadow: [] };
{ const r = rng(55), sk = ['#f5cd30', '#e7b98c', '#c98c5c', '#8a5a3c', '#f2d2b0'], cl = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#ecf0f1', '#34495e', '#e84393', '#fdcb6e', '#222222'];
  for (let k = 0; k < 150; k++) { const side = r() < 0.5 ? -1 : 1; CRM.street.push({ x: -45 + r() * 80, z: side * (7 + r() * 3.5), ry: r() * 7, ph: r() * 7, cols: [cl[(r() * 11) | 0], cl[(r() * 11) | 0], sk[(r() * 5) | 0]] }); }
  for (let k = 0; k < 70; k++) CRM.meadow.push({ x: 98 + r() * 46, z: -17 - r() * 14, ry: r() * 7, ph: r() * 7, cols: ['#93c13a', '#1f6fd6', '#f5cd30'] }); }
const crowdShow2 = (mode, crazy = 0) => { const L = CRM[mode]; crowdM.forEach((m) => { m.visible = true; m.count = L.length; }); const o = new THREE.Object3D(), col = new THREE.Color();
  L.forEach((p, i) => { const j = crazy * Math.abs(Math.sin(T * 9 + p.ph)) * 1.4, dx = crazy * Math.sin(T * 3 + p.ph) * 1.5;
    [[1, 0], [3, 1], [4.66, 2]].forEach(([y, ci], k) => { o.position.set(p.x + dx, y + j, p.z); o.rotation.set(0, p.ry + crazy * T * 2, 0); o.updateMatrix(); crowdM[k].setMatrixAt(i, o.matrix); crowdM[k].setColorAt(i, col.set(p.cols[ci])); }); });
  crowdM.forEach((m) => { m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }); };

// ---- poses ----
const UP = [-3.0, 0, 0.15], PUMP = (u, s = 1) => [-2.6 - 0.35 * Math.sin(u * 14 * s), 0, 0.3], PRAY = [-1.45, 0, -0.62];
const put = (c, x, z, ry, p = {}) => P(c, { x, z, ry, ...p });
const camN = (u, d, keys) => camK(u / d, keys);
const kk = (u, d) => clamp(u / d);
const bend = { lean: 0.5, bodyY: -0.15, armL: [-0.45, 0, -0.08], armR: [-0.45, 0, -0.08], head: [0.3, 0, 0] };
const crouch = { lean: 0.45, bodyY: -0.75, legL: -1.2, legR: -0.2, head: [-0.25, 0, 0] };
const PROPS = [HC, token, rays, glowS, paper, calc, dog, potion, flashBody, flashS, WC, bat, CAR2, CAR3, ...XC, ...FOODS];
let BLUR = 0, APER = 0.0007;
const resetAll = () => { for (const c of CHARS) c.root.visible = false; for (const p of PROPS) p.visible = false; for (const s of [...sparkles, ...puffs, ...CLOUD]) s.visible = false; dizzy.visible = false;
  crowdM.forEach((m) => (m.visible = false)); hcLight.intensity = 0; flashL.intensity = 0; keyL.intensity = 0; pLight.intensity = 0; cam.rotation.z = 0; INTR.visible = false; S.background.set('#0a1130'); moonAt(0.38, 0.86, 14);
  PCH.forEach((c) => chestOpen(c, 0, 0)); RICH.userData.lenses.forEach((l) => (l.visible = false)); BLUR = 0; APER = 0.0007; };
const sparkRing = (pos, u, n = 8, r = 1.2, s = 0.5) => { for (let i = 0; i < n; i++) { const a = i / n * PI * 2 + u * 1.5, pulse = 0.5 + 0.5 * Math.sin(u * 9 + i * 2.3); spark(i, V(pos.x + Math.cos(a) * r, pos.y + Math.sin(a * 1.7) * r * 0.7, pos.z + Math.sin(a) * r * 0.5), s * pulse); } };
const puffAt = (pos, k, n = 8, R0 = 1, R1 = 4) => { puffs.forEach((p, i) => { if (i >= n) return; const a = i / n * PI * 2; const r = lerp(R0, R1, sm(k)); p.visible = k > 0 && k < 1; p.position.set(pos.x + Math.cos(a) * r, pos.y + Math.sin(a * 2) * 1.2 + (i % 3) * 0.8, pos.z + Math.sin(a) * r * 0.6 + 0.5); p.scale.setScalar(lerp(1.2, 2.2, k)); p.material.opacity = 0.95 * (1 - sm((k - 0.6) / 0.4)); }); };
const tokenAt = (pos, ry = 0, s = 1) => { token.visible = true; token.position.copy(pos); token.rotation.set(0, ry, 0); token.scale.setScalar(s); };
const holdBat = () => { S.updateMatrixWorld(); holdAt(bat, WOOD, -1, [0, 0, 0.1], [0.3, 0, 0.2]); };
const interior = () => { INTR.visible = true; skyG.visible = false; S.background.set('#2a1410'); moonL.intensity = 0; fill.intensity = 0.2; hemi.intensity = 0.6; lampPool.forEach((l) => (l.intensity = 0)); };
const outdoor = () => { skyG.visible = true; moonL.intensity = 1.5; fill.intensity = 0.55; hemi.intensity = 1.05; };
const RICHAT = [-62, 8.6];

// ================= SHOTS (one per beat of the original edit) =================
const SC = {
  A(u, d) { outdoor(); focus(0, -6); const k = kk(u, d); CAR2.visible = true; CAR2.position.set(7 - k * 3, 0, -1.9); CAR2.rotation.y = PI; CAR3.visible = true; CAR3.position.set(-9 + k * 3, 0, -2.0);
    put(GRAN, -2.7, -6.4, PI, bend); put(G3, 0.2, -6.2, PI, bend); put(G4, 2.8, -6.6, PI, bend); put(G1, 5.5, -7.8, -PI / 2, { walk: 0.8 }); put(G2, -5, -8.6, PI * 0.8, bend);
    camN(u, d, [[0, [4.2, 2.6, 7.4], [0.3, 2.6, -9], 46], [1, [3.4, 2.7, 4.6], [0.2, 2.8, -9], 44]]); moonAt(0.0, 0.84, 12); },
  B(u, d) { outdoor(); focus(0, -8); const k = kk(u, d); put(GRAN, -2.6, -6.5, PI + 0.1, bend); put(G3, 0.3, -6.1, PI, { ...bend, armR: [-0.8 + 0.3 * Math.sin(u * 9), 0, 0] }); put(G4, 2.9, -6.7, PI - 0.1, bend);
    camN(u, d, [[0, [-2.2, 4.6, 1.6], [0.4, 3.0, -9], 44], [1, [-1.6, 4.4, 0.6], [0.5, 3.0, -9], 42]]); moonAt(-0.1, 0.9, 12); },
  C(u, d) { outdoor(); focus(0, -8); const k = kk(u, d), o = ease(k, 0.35, 0.75); chestOpen(PCH[1], o, o); pLight.intensity = 22 * o;
    camN(u, d, [[0, [0.9, 2.9, -2.4], [0.1, 1.7, -8.4], 40], [1, [0.7, 2.7, -3.2], [0.1, 1.8, -8.4], 38]]); moonAt(0.3, 0.95, 10); APER = 0.0012; },
  D(u, d) { outdoor(); focus(-20, 6); const k = kk(u, d); put(ME, -20, 6.8, 0.1, { face: 'angry', armL: [0.05, 0, 0.05], armR: [0.05, 0, 0.05], head: [0.04, 0, 0] }); key(-18, 6, 11, 30);
    camN(u, d, [[0, [-19.6, 4.5, 12.6], [-20, 4.2, 6.8], 26], [0.45, [-19.7, 4.6, 11.8], [-20, 4.4, 6.8], 25], [0.55, [-19.85, 4.72, 9.9], [-20, 4.65, 6.8], 25], [1, [-19.86, 4.72, 9.7], [-20, 4.66, 6.8], 25]]); moonAt(0.4, 0.8, 12); APER = 0.0012; },
  F(u, d) { outdoor(); focus(-16, 4); const k = kk(u, d), o = ease(k, 0.0, 0.3); put(ME, -16.3, 7.3, PI, { lean: 0.45, bodyY: -0.1, face: 'angry', armL: [-0.8 - o * 0.4, 0, 0], armR: [-0.8 - o * 0.4, 0, 0], head: [0.2, 0, 0] });
    heroChest(-16, 5.0, PI, o, o * 0.45); xcAt(0, -19.6, 5.2, PI + 0.1, 0.9, 0.6, '#ffc04a'); xcAt(1, -12.5, 5.0, PI - 0.1, 0); xcAt(2, -9.2, 5.1, PI, 0.8);
    camN(u, d, [[0, [-14.6, 2.4, -0.6], [-16.1, 2.8, 5.8], 42], [1, [-14.9, 2.3, 0.4], [-16.1, 2.9, 5.8], 40]]); moonAt(0.3, 0.86, 12); APER = 0.001; },
  G(u, d) { outdoor(); const k = kk(u, d), cx = lerp(-36, 14, Math.pow(k, 1.4)); focus(cx, -6); crowdShow2('street');
    put(G1, -26, -8.4, PI, bend); put(G2, -14, -8.0, PI, bend); put(G4, -4, -8.6, PI, bend); put(COP, 6, -8.2, PI, bend); put(CHEF, -20, 8.4, 0, bend);
    for (let i = 0; i < 4; i++) xcAt(i, -24 + i * 10, -10, 0, 0.8, 0.5, '#ffc04a');
    camN(u, d, [[0, [cx - 2, 3.4, 1.5], [cx - 6, 2.4, -8], 44], [1, [cx + 2, 3.4, 1.5], [cx + 8, 2.4, -8], 44]]); BLUR = 1.5 + 12 * ease(k, 0.7, 1); moonAt(0.3, 0.86, 12); },
  I(u, d) { outdoor(); focus(-29, 0); const k = kk(u, d), o = ease(k, 0.0, 0.35), r = ease(k, 0.55, 1);
    put(WOOD, -30.6, 0.3, 0.35, { face: 'grin', armR: [-1.2 - o * 0.6, 0, 0.3], armL: [-0.4, 0, 0.3], lean: 0.1, bodyY: 0.15 * Math.abs(Math.sin(u * 9)) }); holdBat(); heroChest(-28.3, 0.9, -0.25, o, o);
    paper.visible = r > 0; paper.position.set(-28.3, lerp(1.8, 4.5, r), 1.2); paper.rotation.set(0, Math.sin(u * 3) * 0.3, 0); rayAt(paper.position.clone().add(V(0, 0, -0.2)), 5 * r, u, r);
    camN(u, d, [[0, [-28.4, 2.4, 7.4], [-29.3, 2.6, 0.6], 40], [1, [-28.6, 2.3, 6.6], [-29.2, 2.8, 0.6], 38]]); moonAt(0.3, 0.86, 12); },
  J(u, d) { outdoor(); focus(-29, 0); const k = kk(u, d); paper.visible = true; paper.position.set(-28.4, lerp(4.8, 5.4, k), 1.2); paper.rotation.set(0, Math.sin(u * 3) * 0.2, 0.05); rayAt(paper.position.clone().add(V(0, 0, -0.3)), 6.5, u * 0.8, 1);
    camN(u, d, [[0, [-28.4, 4.4, 6.2], [-28.4, 5.3, 1.2], 38], [1, [-28.4, 4.5, 5.8], [-28.4, 5.5, 1.2], 36]]); moonAt(0.5, 0.98, 30); },
  K(u, d) { outdoor(); focus(-29, 0); const k = kk(u, d); put(WOOD, -30.2, 0.3, 0.3, { face: 'happy', look: [0.5, 0], armR: [-1.6, 0, 0.3], armL: [-0.2, 0, 0.3] }); holdBat(); heroChest(-28.0, 1.2, -0.3, 1, 0.3);
    S.updateMatrixWorld(); holdAt(paper, WOOD, 1, [0.2, 0.75, 0.3], [0, -0.3, 0]); paper.visible = true;
    camN(u, d, [[0, [-28.6, 3.0, 7.0], [-29.3, 3.2, 0.6], 42], [1, [-28.8, 3.0, 6.4], [-29.3, 3.3, 0.6], 40]]); moonAt(0.3, 0.86, 12); },
  L(u, d) { outdoor(); focus(-29, 0); const k = kk(u, d); put(WOOD, -30.2, 0.3, 0.05, { face: k < 0.12 ? 'shocked' : 'happy', look: [0.3, 0.1], head: [0, -0.1 + 0.08 * Math.sin(u * 2), 0.1 * Math.sin(u * 3)], armR: [-1.9, 0, 0.35], armL: [0, 0, 0.05] });
    S.updateMatrixWorld(); holdAt(paper, WOOD, 1, [0.2, 0.75, 0.25], [0, -0.6, 0]); paper.visible = true; key(-28, 6, 6, 30);
    camN(u, d, [[0, [-30.0, 5.1, 5.6], [-30.2, 5.0, 0.3], 30], [1, [-30.05, 5.1, 4.4], [-30.2, 5.05, 0.3], 28]]); moonAt(0.38, 0.88, 12); APER = 0.0014; },
  M(u, d) { outdoor(); focus(40, 6); const k = kk(u, d); WC.visible = true; WC.position.set(40, 0, 7.8); WC.rotation.y = PI; put(KID, 40, 7.8, PI, { y: 0.95, sit: true, face: 'shocked', jaw: 0.7, armR: [-2.4, 0, 0.1], armL: [-0.6, 0, 0], look: [-0.3, -0.6], head: [-0.15, 0, 0] });
    heroChest(42.8, 7.4, PI + 0.5, 1, 0.3); S.updateMatrixWorld(); const hp = handPos(KID, 1).add(V(0, 0.65, 0)); tokenAt(hp, PI + Math.sin(u * 2) * 0.4, 1.05); rayAt(hp.clone().add(V(0, 0, 0.3)), 2.6, u, 0.5); sparkRing(hp, u, 6, 0.9, 0.35);
    camN(u, d, [[0, [40.0, 4.3, 1.2], [40.6, 3.9, 7.6], 42], [1, [40.1, 4.3, 1.9], [40.6, 4.0, 7.6], 40]]); moonAt(0.3, 0.88, 12); },
  N(u, d) { outdoor(); focus(40, 6); const k = kk(u, d); WC.visible = true; WC.position.set(40, 0, 7.8); WC.rotation.y = PI; put(KID, 40, 7.8, PI - 0.2, { y: 0.95, sit: true, face: 'shocked', jaw: 0.9, armR: [-2.2, 0, 0.5], armL: [-0.4, 0, 0], look: [-0.5, -0.4] });
    S.updateMatrixWorld(); const hp = handPos(KID, 1).add(V(0, 0.6, 0)); tokenAt(hp, PI + 0.4 + Math.sin(u * 2) * 0.3, 1.05); rayAt(hp.clone().add(V(0, 0, 0.3)), 2.2, u, 0.35); key(39.5, 5, 3, 30, '#ffe0b0');
    camN(u, d, [[0, [39.6, 4.7, 2.6], [38.8, 4.8, 7.8], 42], [1, [39.5, 4.7, 3.2], [38.8, 4.85, 7.8], 40]]); moonAt(-0.3, 0.9, 12); APER = 0.0014; },
  O(u, d) { focus(IX, 0); interior(); const k = kk(u, d); put(WORKER, IX, -2.2, 0, { face: 'laugh', armL: PUMP(u), armR: PUMP(u, 1.1), bodyY: 0.25 * Math.abs(Math.sin(u * 8)) });
    camN(u, d, [[0, [IX + 1.2, 4.4, 5.8], [IX, 4.6, -2], 46], [1, [IX + 0.9, 4.4, 5.0], [IX, 4.7, -2], 44]]); APER = 0.001; },
  P(u, d) { focus(IX, 0); interior(); const k = kk(u, d); WC.visible = true; WC.position.set(IX - 3, 0, 2.9); WC.rotation.y = PI * 0.92; put(KID, IX - 3, 2.9, PI * 0.92, { y: 0.95, sit: true, face: 'amazed', armL: UP, armR: UP, look: [0.5, -0.5] });
    put(WORKER, IX + 1, -2.2, -0.3, { face: 'grin', armR: [-1.6, 0, 0.2], armL: [-0.3, 0, 0.2] });
    FOODS.forEach((f, i) => { const t0 = i * 0.11, tt = Math.max(0, u - t0); f.visible = true; const p0 = V(IX + 0.5 - i * 0.2, 3.4, -0.8), v = V(-2.4 - (i % 3) * 0.5, 5.2 + (i % 2), 2.2 + (i % 3) * 0.6); const p = p0.clone().add(v.clone().multiplyScalar(tt)); p.y += -6 * tt * tt; f.position.copy(p); f.rotation.set(tt * (2 + i), tt * 3, tt * (1 + i)); });
    camN(u, d, [[0, [IX + 3.8, 4.4, 7.0], [IX - 1.6, 3.8, 1.4], 44], [1, [IX + 3.4, 4.4, 6.4], [IX - 1.6, 3.9, 1.4], 42]]); APER = 0.001; },
  Q(u, d) { outdoor(); focus(RX, -6); const k = kk(u, d); CAR2.visible = true; CAR2.position.set(RX - 14 + k * 14, 0, 2.0); CAR2.rotation.y = 0; xcAt(0, RX + 5.5, 6.6, PI + 0.4, 0.8, 0.8);
    put(G1, RX - 2 + k * 2, -5, PI, { walk: 1 }); put(G2, RX + 3, -6.5 + k * 1.2, 0, { walk: 1 }); put(G3, RX - 5, -6.8, 0.2, { walk: 0 });
    camN(u, d, [[0, [RX + 3.5, 8.5, 18], [RX, 5, -12], 46], [1, [RX + 2, 7.4, 13.5], [RX, 5.4, -12], 44]]); moonAt(0.22, lerp(0.84, 0.97, ease(k, 0.4, 0.75)), lerp(12, 46, ease(k, 0.4, 0.75))); BLUR = 12 * ease(k, 0.88, 1); APER = 0.0004; },
  S(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); put(RICH, -63.2, 8.2, PI - 0.6, { ...crouch, face: 'neutral', look: [0.6, 0.5], armR: [-1.5, 0, 0.1], armL: [-0.3, 0, 0.1] });
    heroChest(-61.0, 7.2, PI - 0.3, 1, 0.9, '#b04dff'); flashFrom(RICH, 1, V(-61, 1.2, 7.2)); put(GGR, -59.6, 10.6, PI + 0.3, { ...bend, face: 'happy' }); xcAt(0, -59.8, 9.0, PI + 0.3, 0.9, 0.5);
    camN(u, d, [[0, [-65.8, 3.2, 0.6], [-62, 2.6, 8.4], 44], [1, [-65.4, 3.1, 1.4], [-62, 2.6, 8.4], 42]]); moonAt(0.3, 0.86, 12); },
  T(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d), z = lerp(12.5, 10.2, k); put(RICH, -62, z, PI, { walk: 0.8, ph: u * 7, face: 'neutral', armR: [-1.4, 0, -0.05] }); flashFrom(RICH, 1, V(-62.5, 0, z - 7));
    xcAt(0, -65.5, 9.5, PI + 0.4, 0.8, 0.5); camN(u, d, [[0, [-61.2, 3.6, 5.2], [-62, 3.6, 12], 40], [1, [-61.3, 3.6, 3.8], [-62, 3.7, 10.2], 40]]); moonAt(0.38, 0.86, 12); },
  U(u, d) { outdoor(); focus(-66, 8); const k = kk(u, d); heroChest(-66, 9, PI, 0, 0); put(RICH, -66, 9.0, PI + 0.5, { y: 2.55, face: 'neutral', look: [-0.6, 0], armR: [-1.5, 0, 0.1], head: [0, 0.3, 0] }); flashFrom(RICH, 1, V(-72, 1, 6));
    camN(u, d, [[0, [-65.2, 1.6, 2.6], [-66, 4.4, 9], 44], [1, [-65.4, 1.6, 3.2], [-66, 4.5, 9], 42]]); moonAt(0.38, 0.86, 12); },
  V(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); put(RICH, -62, 8.2, PI, { ...crouch, face: 'neutral', look: [0, 0.2], armR: [-1.5, 0, 0], armL: [-0.3, 0, 0.1] }); flashFrom(RICH, 1, V(-62.6, 2.2, 2.8));
    camN(u, d, [[0, [-61.6, 2.4, 3.0], [-62, 2.5, 8.2], 40], [1, [-61.6, 2.4, 3.6], [-62, 2.5, 8.2], 40]]); moonAt(0.38, 0.86, 12); },
  W(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); put(RICH, -64.4 + k * 0.8, 8.2, PI / 2 + 0.3, { ...crouch, walk: 0.3, ph: u * 6, face: 'neutral', look: [0.3, 0.6], armR: [-1.2, 0, 0], armL: [-0.3, 0, 0.1] }); flashFrom(RICH, 1, V(-60, 0, 7.6));
    camN(u, d, [[0, [-61.8, 3.2, 1.0], [-63.4, 2.4, 8.2], 44], [1, [-61.7, 3.2, 1.5], [-63.2, 2.4, 8.2], 44]]); moonAt(0.38, 0.86, 12); },
  X(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); put(RICH, -62, 8.4, PI + 0.2, { face: 'neutral', look: [0.3, -0.6], head: [-0.3, 0, 0], armR: [-2.8, 0, 0.2], armL: [-0.2, 0, 0.1] }); flashFrom(RICH, 1, V(-58, 18, 6));
    camN(u, d, [[0, [-61.0, 1.6, 1.4], [-62, 4.0, 8.4], 44], [1, [-61.1, 1.6, 2.0], [-62, 4.1, 8.4], 44]]); moonAt(0.4, 0.84, 12); },
  Y(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); put(RICH, ...RICHAT, PI, { face: 'shocked', jaw: 1.2, armL: [-3.05, 0, -0.3], armR: [-3.05, 0, -0.3], head: [0.06 * Math.sin(u * 20), 0, 0] }); key(-62, 6, 4, 22);
    camN(u, d, [[0, [-62.2, 4.4, 3.4], [-62, 4.1, 8.6], 40], [1, [-62.1, 4.5, 4.4], [-62, 4.3, 8.6], 34]]); moonAt(0.38, 0.86, 12); },
  Z(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); put(RICH, ...RICHAT, PI, { face: k < 0.45 ? 'sad' : 'worried', look: [-0.3, 0.2], armL: [0, 0, 0.05], armR: [0, 0, 0.05] }); key(-62, 6, 4, 26);
    camN(u, d, [[0, [-62.05, 4.75, 5.4], [-62, 4.72, 8.6], 30], [1, [-62.05, 4.76, 5.9], [-62, 4.72, 8.6], 30]]); moonAt(0.38, 0.92, 10); APER = 0.0016; },
  AA(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); put(RICH, ...RICHAT, PI, { face: k > 0.3 ? 'dizzy' : 'worried', armR: [-1.25, 0, -0.35], armL: [-0.9, 0, -0.5], head: [0.15, -0.15, 0] });
    calc.visible = true; calc.scale.setScalar(0.45); S.updateMatrixWorld(); holdAt(calc, RICH, 1, [0.1, 0.75, -0.3], [-0.25, PI + 0.35, 0]); calcText(((u * 7) | 0) % 2 ? (u * 3717 % 9999).toFixed(0) : '0.00' + ((u * 91) | 0) % 99);
    heroChest(-60.4, 6.4, PI + 0.4, 0.3, 0.4, '#b04dff'); key(-62, 6, 4, 22);
    camN(u, d, [[0, [-62.6, 4.6, 3.9], [-61.9, 4.0, 8.6], 38], [1, [-62.5, 4.6, 4.5], [-61.9, 4.1, 8.6], 36]]); moonAt(0.38, 0.86, 12); APER = 0.0012; },
  AB(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); put(RICH, ...RICHAT, PI, { face: 'shocked', jaw: 1.1, armL: [0, 0, 0.05], armR: [0, 0, 0.05], look: [0.3, 0] }); key(-62, 6, 4, 26);
    camN(u, d, [[0, [-61.5, 4.5, 5.8], [-62, 4.75, 8.6], 30], [1, [-61.6, 4.55, 6.0], [-62, 4.75, 8.6], 30]]); cam.rotation.z += 0.12; shake(0.02); moonAt(0.38, 0.92, 10); APER = 0.0016; },
  AC(u, d) { outdoor(); focus(0, 30); const k = kk(u, d); calc.visible = true; calc.scale.setScalar(1); calc.position.set(0, 3, 30); calc.rotation.set(-0.15, 0.25, 0.05); calcText(k < 0.12 ? '1 in 13' : '1 in 137500');
    camN(u, d, [[0, [-0.5, 4.2, 34.0], [0.15, 3.7, 30], 34], [1, [-0.4, 4.15, 33.6], [0.15, 3.7, 30], 34]]); moonAt(0.38, 0.95, 10); APER = 0.0018; },
  AD(u, d) { outdoor(); focus(PX, -20, { lamp: 30 }); const k = kk(u, d); crowdShow2('plaza', 0.08);
    camN(u, d, [[0, [PX + 4, 30, 12], [PX, 0, -26], 48], [0.7, [PX + 2, 22, 4], [PX, 0, -28], 48], [1, [PX + 2, 10, 2], [PX, 5, -38], 46]]); moonAt(0.32, lerp(0.86, 0.96, ease(k, 0.6, 0.85)), lerp(12, 46, ease(k, 0.6, 0.85))); APER = 0.0002; },
  AE(u, d) { outdoor(); focus(-29, 0); const k = kk(u, d); heroChest(-28.4, 0.9, -0.4, 1, 0.2); put(WOOD, -30.4, 0.4, 0.9, { ...bend, lean: 0.55, face: k > 0.5 ? 'sad' : 'neutral', look: [0.5, 0.7], armR: [-0.7, 0, 0], armL: [-0.2, 0, 0.2] }); holdBat();
    camN(u, d, [[0, [-27.2, 3.2, 7.8], [-29.4, 2.6, 0.6], 42], [1, [-27.4, 3.1, 7.2], [-29.4, 2.6, 0.6], 40]]); moonAt(0.38, 0.86, 12); },
  AF(u, d) { outdoor(); focus(-29, 0); const k = kk(u, d); heroChest(-28.2, 0.9, -0.4, 1, 0.2); put(WOOD, -30.4, 0.4, 0.25, { face: 'angry', armL: [-0.3, 0, 0.35], armR: [-0.5, 0, 0.35], squash: -0.03 * Math.sin(u * 30), tilt: 0.04 * Math.sin(u * 25) }); holdBat();
    key(-29, 5, 5, 26); camN(u, d, [[0, [-29.6, 3.9, 7.0], [-29.8, 3.6, 0.4], 38], [1, [-29.7, 3.9, 6.2], [-29.8, 3.7, 0.4], 36]]); shake(0.02); moonAt(0.38, 0.86, 12); },
  AG(u, d) { outdoor(); focus(-70, 8); const k = kk(u, d), z = lerp(12.5, 10.4, k); put(RICH, -70, z, PI, { walk: 0.8, ph: u * 7, face: 'neutral', armR: [-1.4, 0, -0.05] }); flashFrom(RICH, 1, V(-70.5, 0, z - 7));
    camN(u, d, [[0, [-69.2, 3.4, 4.6], [-70, 3.6, 12], 40], [1, [-69.3, 3.5, 4.0], [-70, 3.7, 10.4], 38]]); moonAt(0.38, 0.86, 12); },
  AH(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); RICH.userData.lenses.forEach((l) => (l.visible = true)); put(RICH, ...RICHAT, PI, { face: k < 0.2 ? 'smug' : 'grin', head: [-0.05 + 0.04 * Math.sin(u * 14), 0, 0.05 * Math.sin(u * 5)], armL: [0, 0, 0.05], armR: [0, 0, 0.05] }); key(-62, 6, 4, 26, '#e0b0ff');
    camN(u, d, [[0, [-62.0, 4.7, 5.9], [-62, 4.75, 8.6], 32], [1, [-62.0, 4.72, 6.2], [-62, 4.75, 8.6], 32]]); moonAt(0.38, 0.92, 10); APER = 0.0016; },
  AI(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); put(RICH, lerp(-65, -62, k), 8.6, PI / 2 + 0.4, { ...crouch, legL: undefined, legR: undefined, bodyY: -0.4, walk: 1.2, ph: u * 12, face: 'angry' });
    camN(u, d, [[0, [-62.4, 2.4, 3.0], [-63.6, 2.4, 8.6], 40], [1, [-62.2, 2.4, 3.2], [-62.8, 2.4, 8.6], 40]]); moonAt(0.38, 0.86, 12); },
  AJ(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); put(RICH, ...RICHAT, PI, { face: 'shocked' }); cloudAt(V(-62, 3.4, 7.6), 0.35 + k, 3.2, 7.5);
    camN(u, d, [[0, [-62, 3.6, 2.6], [-62, 3.4, 8.6], 42], [1, [-62, 3.6, 3.2], [-62, 3.4, 8.6], 42]]); moonAt(0.38, 0.86, 12); APER = 0.0004; },
  AK(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); put(RICHG, ...RICHAT, PI, { face: 'shocked', armL: [0.1, 0, 0.35], armR: [0.1, 0, 0.35], look: [0.4, 0] }); puffAt(V(-62, 3.2, 8.4), 0.4 + k * 0.6, 8, 2.2, 3.6); sparkRing(V(-62, 4.2, 8.4), u, 6, 2.0, 0.4);
    camN(u, d, [[0, [-62, 3.6, 2.4], [-62, 3.2, 8.6], 42], [1, [-62, 3.6, 2.8], [-62, 3.2, 8.6], 42]]); moonAt(0.38, 0.86, 12); },
  AL(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); put(RICHG, ...RICHAT, PI, { face: 'happy', look: [0, -0.8], head: [-0.3, 0, 0], armL: PRAY, armR: PRAY }); sparkRing(V(-62, 4.4, 8.4), u, 6, 2.0, 0.3);
    camN(u, d, [[0, [-62.3, 4.4, 1.6], [-62, 3.8, 8.6], 44], [1, [-62.2, 4.5, 2.6], [-62, 3.9, 8.6], 42]]); moonAt(0.3, lerp(0.86, 1.0, ease(k, 0.5, 0.8)), lerp(12, 50, ease(k, 0.5, 0.8))); },
  AM(u, d) { outdoor(); focus(-62, 8); const k = kk(u, d); put(RICHG, ...RICHAT, PI - 0.3, { bodyY: -1.0, legL: 1.45, legR: 1.45, face: 'happy', look: [0, -0.8], head: [-0.35, 0, 0], armL: PRAY, armR: PRAY });
    camN(u, d, [[0, [-64.0, 3.0, 2.4], [-62, 2.8, 8.6], 44], [1, [-63.8, 3.0, 2.9], [-62, 2.8, 8.6], 44]]); moonAt(0.3, 0.98, 40); },
  AN(u, d) { outdoor(); focus(-62, 6); const k = kk(u, d), back_ = k < 0.78; put(RICHG, ...RICHAT, PI, { bodyY: -1.0, legL: 1.45, legR: 1.45, face: back_ ? 'happy' : 'annoyed', look: [0, back_ ? -0.8 : 0.2], head: [back_ ? -0.5 : 0.1, 0, 0], armL: PRAY, armR: PRAY });
    if (back_) { camN(u, d, [[0, [-62.6, 2.6, 15.6], [-62, 7, -20], 44], [1, [-62.6, 2.6, 15.0], [-62, 7.5, -20], 44]]); moonAt(0.0, lerp(0.55, 0.6, k), 80); } else { camN(u, d, [[0, [-62, 3.8, 3.2], [-62, 3.6, 8.6], 42], [1, [-62, 3.8, 3.5], [-62, 3.6, 8.6], 42]]); moonAt(0.05, 0.97, 60); } APER = 0.0005; },
  AO(u, d) { outdoor(); focus(19, -8); const k = kk(u, d); put(RICH, 17.4, -9.0, 0.45, { face: 'laugh', armR: [-1.6, 0.25, 0.1], armL: [-0.4, 0, -0.4], bodyRz: 0.05 * Math.sin(u * 16), head: [-0.12, 0, 0.05 * Math.sin(u * 16)] });
    put(GGR, 19.6, -9.4, 0.5, { face: 'laugh', armR: [-1.7, 0.2, 0.1], armL: [-0.5, 0, -0.5], bodyRz: 0.06 * Math.sin(u * 15 + 1) }); put(NOOB, 22.6, -8.2, -0.5, { face: 'sad', head: [0.25, 0, 0] });
    heroChest(18.8, -6.4, 0.1, 0, 0, '#b04dff'); camN(u, d, [[0, [19.8, 2.8, -0.4], [19.6, 3.8, -9], 44], [1, [19.6, 2.8, -1.0], [19.6, 3.9, -9], 42]]); moonAt(0.38, 0.86, 12); },
  AP(u, d) { outdoor(); focus(14, -8, { lamp: 14 }); const k = kk(u, d); put(NOOB, 14.8, lerp(-10.0, -7.6, k), 0, { walk: 0.6, ph: u * 6, face: 'sad', head: [0.3, 0, 0] });
    put(RICH, 11.4, -10.2, 0.6, { face: 'laugh', armR: [-1.5, 0.3, 0.1], bodyRz: 0.05 * Math.sin(u * 16) }); put(GGR, 12.6, -9.2, 0.5, { face: 'laugh', armL: [-1.4, 0, -0.2], bodyRz: 0.05 * Math.sin(u * 15) }); xcAt(0, 10.0, -7.0, 0.4, 0, 0);
    camN(u, d, [[0, [15.6, 3.6, -1.6], [14.2, 4.6, -12], 46], [1, [15.4, 3.6, -2.4], [14.2, 4.7, -12], 44]]); moonAt(0.38, 0.88, 12); },
  AR(u, d) { outdoor(); focus(120, -9); const k = kk(u, d), o = ease(k, 0.55, 0.85); crowdShow2('meadow'); heroChest(120, -8.8, 0.15, o, o * 0.5, '#ffc04a', woodLid);
    put(NOOB, 117.9, -9.8, 0.7, { lean: 0.15 + 0.2 * o, face: o > 0.4 ? 'amazed' : 'neutral', look: [0.6, 0.5], armR: [-0.4 - o * 0.7, 0, 0], armL: [-0.2, 0, 0.1] }); key(120, 5, -3, 14);
    camN(u, d, [[0, [121.4, 2.7, -2.8], [119.4, 2.6, -9], 42], [1, [121.2, 2.6, -3.4], [119.4, 2.6, -9], 40]]); moonAt(0.3, 0.86, 12); BLUR = 12 * (1 - ease(k, 0, 0.2)); },
  AS(u, d) { outdoor(); focus(120, -9); const k = kk(u, d); crowdShow2('meadow'); heroChest(120, -8.8, 0.15, 1, 0.8, '#ffc04a', woodLid);
    put(NOOB, 119.0, -10.9, 0.25, { face: 'grin', armL: PUMP(u), armR: PUMP(u, 1.2), bodyY: 0.2 * Math.abs(Math.sin(u * 7)) }); key(120, 5, -4, 10, '#ffe2b0'); sparkRing(V(120, 2.4, -8.8), u, 6, 1.3, 0.35);
    camN(u, d, [[0, [120.8, 2.2, -3.4], [119.8, 3.0, -9.6], 44], [1, [120.7, 2.2, -4.0], [119.8, 3.0, -9.6], 42]]); moonAt(0.3, 0.86, 12); },
  AT(u, d) { outdoor(); focus(120, -9); const k = kk(u, d), r = ease(k, 0, 0.6); crowdShow2('meadow'); heroChest(120, -8.8, 0.15, 1, 1, '#ffc04a', woodLid);
    put(NOOB, 119.0, -10.9, 0.25, { face: 'amazed', armL: PUMP(u), armR: UP, look: [0.3, -0.5] }); const tp = V(120.1, lerp(1.6, 3.6, r), -8.6); tokenAt(tp, u * 7, 1.15); rayAt(tp.clone().add(V(0, 0, -0.3)), 2 + 2 * r, u, 0.6); sparkRing(tp, u, 8, 1.4, 0.45);
    camN(u, d, [[0, [120.6, 2.6, -4.0], [120, 3.0, -9], 40], [1, [120.5, 2.7, -4.6], [120, 3.2, -9], 38]]); moonAt(0.3, 0.86, 12); },
  AU(u, d) { outdoor(); focus(19, -8); const k = kk(u, d); put(RICH, 17.6, -9.0, 0.2, { face: 'shocked', jaw: 1.2, armL: [-0.3, 0, 0.3], armR: [-0.3, 0, 0.3] }); put(GGR, 19.9, -9.2, -0.15, { face: 'shocked', jaw: 1.2, armL: [-0.5, 0, 0.4], armR: [-0.5, 0, 0.4] });
    heroChest(18.8, -6.4, 0.1, 1, 0.8, '#b04dff'); key(19, 5, -3, 18); camN(u, d, [[0, [18.9, 4.3, 0.2], [18.8, 4.1, -9], 44], [1, [18.9, 4.3, -0.6], [18.8, 4.1, -9], 42]]); moonAt(0.38, 0.86, 12); },
  AV(u, d) { outdoor(); focus(120, -9); const k = kk(u, d), f = ease(k, 0.0, 0.35);
    put(RICH, 119, -9, -0.4, { face: 'shocked', bodyRx: -1.45 * f, bodyY: -0.2 * f, armL: UP, armR: UP, legL: -1.2 * f, legR: -1.0 * f }); put(GGR, 121.6, -9.3, 0.4, { face: 'shocked', bodyY: Math.max(0, Math.sin(u * 7)) * 1.5, armL: UP, armR: UP });
    heroChest(120.3, -6.0, 0.4, 1, 0.8, '#b04dff'); xcAt(0, 113, -12, 0.5, 1, 1); xcAt(1, 127, -13, -0.4, 1, 1); xcAt(2, 116, -3, 1.2, 1, 1); xcAt(3, 125.5, -4, -0.8, 1, 1); xcAt(4, 109, -6, 0.2, 1, 1);
    camN(u, d, [[0, [120.5, 5, -1.5], [120.2, 2.4, -8.8], 44], [1, [120.4, 24, -5.0], [120.2, 0.5, -9.2], 46]]); moonAt(0.38, 0.86, 12); APER = 0.0003; },
  TH1(u, d) { outdoor(); focus(-62, 8); put(RICHG, ...RICHAT, PI, { face: 'sad', look: [0, 0.4], head: [0.25, 0, 0.12], armL: [0.1, 0, 0.1], armR: [0.1, 0, 0.1] }); put(GG, -66.5, 11, PI + 0.5, { ...bend }); put(GGR, -57.8, 11.2, PI - 0.4, { ...bend });
    key(-62, 6, 4, 22, '#ffe2b0'); camN(u, d, [[0, [-62.2, 4.6, 4.2], [-62, 4.2, 8.6], 40], [1, [-62.2, 4.6, 4.2], [-62, 4.2, 8.6], 40]]); moonAt(0.38, 0.9, 12); APER = 0.0012; },
  TH2(u, d) { outdoor(); focus(120, -9); crowdShow2('meadow'); heroChest(120, -9.2, 0, 1, 0.5, '#ffc04a', woodLid); put(NOOB, 120.4, -11.4, 0.15, { face: 'smug', armR: [-2.9, 0, 0.15], armL: [-0.2, 0, 0.5], look: [0.5, -0.3] });
    S.updateMatrixWorld(); const hp = handPos(NOOB, 1).add(V(0, 0.65, 0.15)); tokenAt(hp, 0.4, 1.3); rayAt(hp.clone().add(V(0, 0, -0.4)), 5, 0.3, 0.8); sparkRing(hp, 1.2, 8, 1.4, 0.5); key(121, 6, -5, 8, '#ffe6b0');
    camN(u, d, [[0, [121.3, 3.6, -3.4], [120.6, 5.0, -11], 42], [1, [121.3, 3.6, -3.4], [120.6, 5.0, -11], 42]]); moonAt(0.38, 0.9, 12); },
};
