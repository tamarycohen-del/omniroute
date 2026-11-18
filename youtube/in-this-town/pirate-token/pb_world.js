// ================= WORLD (night town) =================
import { RoomEnvironment } from './package/examples/jsm/environments/RoomEnvironment.js';
const pm = new THREE.PMREMGenerator(R); const ENV = pm.fromScene(new RoomEnvironment(), 0.04).texture;
S.background = new THREE.Color('#0a1130'); S.fog = new THREE.Fog('#101a40', 45, 150);
R.toneMappingExposure = 1.0;
S.add(cam);
const hemi = new THREE.HemisphereLight('#7f90e8', '#24351f', 1.05); S.add(hemi);
const moonL = new THREE.DirectionalLight('#a9bcff', 1.5); moonL.castShadow = true; moonL.shadow.mapSize.set(2048, 2048); moonL.shadow.bias = -0.0006;
Object.assign(moonL.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 140 }); S.add(moonL); S.add(moonL.target);
const fill = new THREE.DirectionalLight('#9fb0ff', 0.55); S.add(fill); S.add(fill.target);
const keyL = new THREE.PointLight('#ffbf6e', 0, 22, 1.6); S.add(keyL);
const lampPool = []; for (let k = 0; k < 6; k++) { const l = new THREE.PointLight('#ffb35c', 20, 16, 1.8); S.add(l); lampPool.push(l); }
const EM = (c, i = 1.6) => new THREE.MeshStandardMaterial({ color: '#000000', emissive: c, emissiveIntensity: i });
const BASIC = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
const gold = new THREE.MeshStandardMaterial({ color: '#e9a722', metalness: 0.9, roughness: 0.42, emissive: '#140b00', envMap: ENV, envMapIntensity: 0.28 });
const goldDark = new THREE.MeshStandardMaterial({ color: '#c98a1c', metalness: 0.85, roughness: 0.35, envMap: ENV, envMapIntensity: 0.6 });
const gem = new THREE.MeshStandardMaterial({ color: '#b04dff', emissive: '#7a22e0', emissiveIntensity: 1.3, roughness: 0.15, metalness: 0.2, envMap: ENV });

// sky: stars + moon live in camera space so every vertical frame has its moon
const skyG = new THREE.Group(); cam.add(skyG);
{ const r = rng(7), pos = []; for (let k = 0; k < 700; k++) pos.push((r() - 0.5) * 300, (r() - 0.2) * 420, -195); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  skyG.add(new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 1.1, sizeAttenuation: true, fog: false, transparent: true, opacity: 0.9 }))); }
const moonTex = canvasTex(512, 512, (g) => { const grd = g.createRadialGradient(256, 256, 150, 256, 256, 256); grd.addColorStop(0, 'rgba(190,215,255,0.55)'); grd.addColorStop(1, 'rgba(120,160,255,0)'); g.fillStyle = grd; g.fillRect(0, 0, 512, 512);
  g.fillStyle = '#eef4ff'; g.beginPath(); g.arc(256, 256, 150, 0, 7); g.fill(); const r = rng(3); for (let k = 0; k < 26; k++) { g.fillStyle = `rgba(150,170,205,${0.25 + r() * 0.35})`; const a = r() * 7, d = r() * 125; g.beginPath(); g.arc(256 + Math.cos(a) * d, 256 + Math.sin(a) * d, 6 + r() * 26, 0, 7); g.fill(); } });
const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, fog: false, toneMapped: false, depthWrite: false })); moon.renderOrder = -1; skyG.add(moon);
const moonAt = (x = 0.42, y = 0.78, s = 34) => { moon.visible = true; const h = Math.tan(cam.fov * PI / 360) * 190; moon.position.set(x * h * W / H, y * h, -190); moon.scale.setScalar(s * h / 85); };

// ground, roads, sidewalks
const grassTex = canvasTex(256, 256, (g) => { g.fillStyle = '#3f8a34'; g.fillRect(0, 0, 256, 256); const r = rng(11); for (let k = 0; k < 900; k++) { g.fillStyle = r() < 0.5 ? '#357a2c' : '#4c9a3c'; g.fillRect(r() * 256, r() * 256, 3, 6); } }, 60);
add(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.95 }), 0, 0, 0, S, false).rotation.x = -PI / 2;
const roadTex = canvasTex(512, 128, (g) => { g.fillStyle = '#2a2c33'; g.fillRect(0, 0, 512, 128); g.fillStyle = '#f2c43a'; for (let x = 0; x < 512; x += 128) g.fillRect(x + 20, 60, 70, 8); }, 0); roadTex.wrapS = THREE.RepeatWrapping; roadTex.repeat.set(40, 1);
const road = add(new THREE.PlaneGeometry(320, 8), new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.22, metalness: 0.35 }), 0, 0.03, 0, S, false); road.rotation.x = -PI / 2;
for (const s of [-1, 1]) { bx(320, 0.25, 2, '#8d9099', 0, 0.12, s * 5, S, { sh: false }); }
for (const s of [-1, 1]) bx(320, 0.26, 0.2, '#b9bcc4', 0, 0.13, s * 4.05, S, { sh: false });

// lamps
const LAMPS = []; const lampHead = BASIC('#ffd58a');
const LAMPM = []; const lamp = (x, z) => { LAMPM.push({ x, z, m: [cyl(0.13, 6, '#20232a', x, 3, z), bx(0.9, 0.35, 0.9, '#20232a', x, 6.1, z), add(new THREE.BoxGeometry(0.7, 0.3, 0.7), lampHead, x, 5.85, z, S, false)] }); LAMPS.push([x, 5.4, z]); };
for (let x = -96; x <= 96; x += 12) { if (x < -60 || x > -40) lamp(x, -5.6); lamp(x + 6, 5.6); }
const focus = (x, z, opt = {}) => { moonL.target.position.set(x, 0, z); moonL.position.set(x - 22, 42, z - 26); fill.target.position.set(x, 2, z); fill.position.set(x + 10, 14, z + 30);
  const L = LAMPS.map((p) => [p, (p[0] - x) ** 2 + (p[2] - z) ** 2]).sort((a, b) => a[1] - b[1]); lampPool.forEach((l, i) => { const p = L[i][0]; l.position.set(p[0], p[1], p[2]); l.intensity = opt.lamp ?? 20; });
  keyL.intensity = 0; moon.visible = true; skyG.visible = true; };
const key = (x, y, z, i = 40, c = '#ffbf6e') => { keyL.position.set(x, y, z); keyL.intensity = i; keyL.color.set(c); };

// houses
const winTex = BASIC('#d9a24e'), winPink = BASIC('#ff7ad9');
const house = (x, z, face, o = {}) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = face; S.add(g); const w = o.w || 9, d = 7, h = o.h || 5;
  bx(w, h, d, o.c || '#c9a07a', 0, h / 2, 0, g); const roofC = o.roof || '#5b3b36';
  const sh = new THREE.Shape(); sh.moveTo(-w / 2 - 0.6, 0); sh.lineTo(0, o.peak || 3.4); sh.lineTo(w / 2 + 0.6, 0); sh.lineTo(-w / 2 - 0.6, 0);
  const rf = add(new THREE.ExtrudeGeometry(sh, { depth: d + 1, bevelEnabled: false }), M(roofC, { r: 0.8 }), 0, h, -d / 2 - 0.5, g); rf.castShadow = true;
  const wm = o.pink ? winPink : winTex;
  for (const wx of o.wins || [-w / 3, w / 3]) { add(new THREE.BoxGeometry(1.6, 1.5, 0.1), wm, wx, h * 0.55, d / 2 + 0.02, g, false); bx(1.9, 0.18, 0.2, '#f4ead8', wx, h * 0.55 - 0.85, d / 2 + 0.06, g); bx(0.12, 1.5, 0.12, '#f4ead8', wx, h * 0.55, d / 2 + 0.08, g, { sh: false }); }
  add(new THREE.BoxGeometry(1.4, 0.9, 0.1), wm, 0, h + 1.2, d / 2 + 0.6, g, false);
  bx(1.4, 2.5, 0.12, '#6b4128', 0, 1.25, d / 2 + 0.03, g); bx(3, 0.25, 2, '#a7a9b0', 0, 0.12, d / 2 + 1, g); return g; };
const SOUTH = []; const HC_ = ['#c9a07a', '#d7c6a8', '#b98a6e', '#e3b08e', '#a9b8c9', '#cfa5b8', '#c4c08c'], RF_ = ['#5b3b36', '#3f4a66', '#6e3b2b', '#4f4040', '#3b5a48'];
{ let i = 0; for (const x of [-98, -86, -74, -28, -14, 0, 28, 42, 56, 70, 84]) { house(x, -15.5, 0, { c: HC_[i % 7], roof: RF_[i % 5], pink: i % 5 === 3, w: 9 + (i % 3) }); i++; }
  for (const x of [-92, -78, -64, -50, -36, -22, -8, 6, 20, 34, 48, 62, 76]) { SOUTH.push(house(x, 15.5, PI, { c: HC_[(i + 2) % 7], roof: RF_[i % 5], pink: i % 4 === 1 })); i++; } }
// cozy A-frame house for the ending
const cozy = house(14, -15.5, 0, { c: '#e8d3a8', roof: '#7a4a2a', peak: 6.5, wins: [-2.6, 2.6], w: 9 }); 
// fences
for (let x = -100; x < 100; x += 2.2) { if (x > -60 && x < -40) continue; bx(0.18, 1.1, 0.18, '#e9e2d0', x, 0.55, -11.2); }
bx(140, 0.14, 0.12, '#e9e2d0', 30, 0.8, -11.2); bx(60, 0.14, 0.12, '#e9e2d0', -80, 0.8, -11.2);

// blocky trees
const leafM = [M('#2f8f3a', { r: 0.9 }), M('#3aa045', { r: 0.9 }), M('#257a33', { r: 0.9 })];
const tree = (x, z, s = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); S.add(g); bx(0.9, 4, 0.9, '#6b4423', 0, 2, 0, g); bx(3.6, 2.6, 3.6, leafM[0], 0, 4.8, 0, g, { rad: 0.15 }); bx(2.8, 2, 2.8, leafM[1], 0.3, 6.6, -0.2, g, { rad: 0.15 }); bx(1.8, 1.4, 1.8, leafM[2], -0.2, 7.9, 0.2, g, { rad: 0.15 }); return g; };
{ const r = rng(21); for (let k = 0; k < 46; k++) { const x = -100 + r() * 200; if (x > -64 && x < -36) continue; tree(x, -21 - r() * 10, 0.9 + r() * 0.5); }
  for (let k = 0; k < 30; k++) tree(-100 + r() * 200, 21 + r() * 10, 0.9 + r() * 0.5);
  for (const [x, z] of [[-21, -9], [7, -9.5], [35, -9.2], [-90, -9], [64, -9.3], [-30, 9.5], [13, 9.3]]) tree(x, z, 0.8); }
{ const r = rng(31); for (let k = 0; k < 26; k++) tree(104 + r() * 40, -15 - r() * 12, 1 + r() * 0.5); for (let k = 0; k < 10; k++) tree(106 + r() * 36, 12 + r() * 10, 1 + r() * 0.4); }

// ---- treasure chest ----
const chainLink = new THREE.TorusGeometry(0.13, 0.045, 6, 12);
const skullTex = canvasTex(256, 256, (g) => { g.fillStyle = '#f3e6f0'; g.beginPath(); g.arc(128, 110, 78, 0, 7); g.fill(); g.fillRect(84, 150, 88, 60); g.fillStyle = '#c23bff'; g.beginPath(); g.ellipse(98, 112, 24, 28, 0, 0, 7); g.ellipse(158, 112, 24, 28, 0, 0, 7); g.fill(); g.fillStyle = '#3a1046'; g.beginPath(); g.moveTo(128, 140); g.lineTo(116, 166); g.lineTo(140, 166); g.fill(); for (const x of [96, 120, 144]) g.fillRect(x, 182, 14, 30); });
const skullM = new THREE.MeshStandardMaterial({ map: skullTex, transparent: true, emissive: '#ffffff', emissiveMap: skullTex, emissiveIntensity: 0.35, roughness: 0.4 });
const makeChest = (x = 0, z = 0, ry = 0, s = 1.25, o = {}) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; g.scale.setScalar(s); S.add(g);
  bx(2.2, 1.25, 1.4, goldDark, 0, 0.63, 0, g, { rad: 0.06 }); for (const sx of [-1, 1]) bx(0.8, 0.9, 0.06, '#4a2a6e', sx * 0.55, 0.62, 0.71, g);
  for (const sx of [-1.02, 0, 1.02]) bx(0.18, 1.3, 1.46, gold, sx, 0.64, 0, g); bx(2.26, 0.16, 1.46, gold, 0, 1.2, 0, g); bx(2.26, 0.16, 1.46, gold, 0, 0.1, 0, g);
  const glow = add(new THREE.PlaneGeometry(2, 1.2), BASIC('#ffdf7e'), 0, 1.23, 0, g, false); glow.material = BASIC('#ffdf7e'); glow.rotation.x = -PI / 2; glow.visible = false;
  const lid = new THREE.Group(); lid.position.set(0, 1.28, -0.7); g.add(lid);
  const lg = new THREE.CylinderGeometry(0.7, 0.7, 2.2, 20, 1, false, 0, PI); const lm = add(lg, o.lid || goldDark, 0, 0, 0.7, lid); lm.rotation.set(0, 0, PI / 2); lm.rotation.order = 'ZXY'; lm.rotation.x = PI / 2;
  for (const sx of [-1.02, 1.02]) { const b = add(new THREE.CylinderGeometry(0.74, 0.74, 0.2, 20, 1, false, 0, PI), gold, sx, 0, 0.7, lid); b.rotation.set(0, 0, PI / 2); b.rotation.order = 'ZXY'; b.rotation.x = PI / 2; }
  if (o.skull !== false) add(new THREE.PlaneGeometry(0.7, 0.7), skullM, 0, 0.66, 0.745, g, false); else ball(0.16, o.gem || gem, 0, 0.62, 0.78, g); for (const sx of [-0.55, 0.55]) ball(0.11, gem, sx, 0.62, 0.76, g); const lg2 = ball(o.lidGem ? 0.2 : 0.13, o.lidGem || gem, 0, 0.35, 1.38, lid);
  for (let k = 0; k < 9; k++) { const l = add(chainLink, gold, -1.05 + k * 0.26, 0.42 + Math.sin(k / 8 * PI) * -0.18, 0.76, g, false); l.rotation.y = k % 2 ? PI / 2 : 0; }
  bx(0.3, 0.36, 0.12, gold, 0, 1.12, 0.74, g);
  g.userData = { lid, glow, lm }; return g; };
const chestOpen = (c, a, glow = 0) => { c.userData.lid.rotation.x = -a * 1.95; c.userData.glow.visible = glow > 0; };
const BGCH = []; { const r = rng(5); for (let k = 0; k < 34; k++) { const side = r() < 0.65 ? -1 : 1, x = -95 + r() * 190; if (x > -62 && x < -38) continue; const c = makeChest(x, side * (6.6 + r() * 3.6), (r() - 0.5) * 1.2 + (side > 0 ? PI : 0), 1.0 + r() * 0.3); chestOpen(c, r() < 0.5 ? 0.6 + r() * 0.4 : 0); BGCH.push(c); } }
const HC = makeChest(0, 0, 0, 1.3); const hcLight = new THREE.PointLight('#ffc04a', 0, 12, 1.6); HC.add(hcLight); hcLight.position.set(0, 2.2, 0.4);
const hcGlowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color: '#ffd36a', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); HC.add(hcGlowS); hcGlowS.position.set(0, 1.6, 0);
const heroChest = (x, z, ry, open, glow = 0, col = '#ffc04a', lidM = goldDark) => { HC.visible = true; hcLight.color.set(col); HC.userData.glow.material.color.set(col); hcGlowS.material.color.set(col); HC.userData.lm.material = lidM; HC.position.set(x, 0, z); HC.rotation.y = ry; chestOpen(HC, open, glow); hcLight.intensity = glow * 18; hcGlowS.visible = glow > 0.02; hcGlowS.scale.setScalar(2.6 * glow); hcGlowS.material.opacity = 0.45 * glow; };

// ---- pirate token ----
const tokenFace = canvasTex(512, 512, (g) => { const grd = g.createRadialGradient(220, 200, 20, 256, 256, 256); grd.addColorStop(0, '#fff2a8'); grd.addColorStop(0.6, '#f2b52c'); grd.addColorStop(1, '#b77712'); g.fillStyle = grd; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = '#8a5a0c'; g.lineWidth = 22; g.beginPath(); g.arc(256, 256, 210, 0, 7); g.stroke(); g.lineWidth = 8; g.beginPath(); g.arc(256, 256, 180, 0, 7); g.stroke();
  g.strokeStyle = '#5a3606'; g.lineWidth = 30; g.lineCap = 'round'; g.beginPath(); g.moveTo(150, 170); g.lineTo(362, 380); g.moveTo(362, 170); g.lineTo(150, 380); g.stroke();
  for (const [x, y] of [[150, 170], [362, 170], [150, 380], [362, 380]]) { g.fillStyle = '#5a3606'; g.beginPath(); g.arc(x - 8, y, 18, 0, 7); g.arc(x + 8, y, 18, 0, 7); g.fill(); }
  g.fillStyle = '#fff6dc'; g.beginPath(); g.arc(256, 238, 86, 0, 7); g.fill(); g.fillRect(208, 270, 96, 70); g.fillStyle = '#5a3606'; g.beginPath(); g.ellipse(222, 238, 24, 28, 0, 0, 7); g.ellipse(290, 238, 24, 28, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(256, 266); g.lineTo(244, 290); g.lineTo(268, 290); g.fill(); for (const x of [226, 250, 274]) g.fillRect(x, 312, 10, 28);
  g.fillStyle = '#5a3606'; for (let k = 0; k < 24; k++) { const a = k / 24 * PI * 2; g.beginPath(); g.arc(256 + Math.cos(a) * 232, 256 + Math.sin(a) * 232, 7, 0, 7); g.fill(); } });
const gemTex = canvasTex(512, 512, (g) => { const grd = g.createRadialGradient(200, 170, 20, 256, 256, 260); grd.addColorStop(0, '#fff3a0'); grd.addColorStop(0.45, '#ffc42a'); grd.addColorStop(1, '#f07a10'); g.fillStyle = grd; g.fillRect(0, 0, 512, 512);
  const r = rng(17); for (let k = 0; k < 26; k++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,255,220' : '200,90,0'},${0.08 + r() * 0.14})`; g.beginPath(); g.moveTo(r() * 512, r() * 512); g.lineTo(r() * 512, r() * 512); g.lineTo(r() * 512, r() * 512); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(170, 150, 40, 26, -0.6, 0, 7); g.fill();
  g.font = '900 330px "Inter Display", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(120,50,0,0.35)'; g.fillText('F', 268, 282); g.fillStyle = '#ffffff'; g.fillText('F', 256, 268); });
const token = new THREE.Group(); S.add(token); { const gm = new THREE.MeshStandardMaterial({ map: gemTex, emissive: '#ffffff', emissiveMap: gemTex, emissiveIntensity: 0.55, roughness: 0.25, metalness: 0.1 });
  const T_ = new THREE.Group(); token.add(T_); T_.scale.setScalar(0.62);
  // 8-point compass star (gold), behind everything
  const star = new THREE.Shape(); for (let k = 0; k < 16; k++) { const a = k / 16 * PI * 2 + PI / 2, rr = k % 2 ? 0.34 : (k % 4 === 0 ? 1.55 : 1.05); const x = Math.cos(a) * rr, y = Math.sin(a) * rr; k ? star.lineTo(x, y) : star.moveTo(x, y); }
  add(new THREE.ExtrudeGeometry(star, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2 }), gold, 0, 0, -0.12, T_, false);
  cyl(0.98, 0.14, '#3a2208', 0, 0, -0.02, T_, { seg: 40 }).rotation.x = PI / 2; // dark ring background
  for (const [a0, a1] of [[0.25, 2.55], [2.9, 3.55], [3.8, 4.25], [4.55, 5.95]]) { const t = add(new THREE.TorusGeometry(1.0, 0.13, 10, 40, a1 - a0), gold, 0, 0, 0.05, T_, false); t.rotation.z = a0; t.scale.z = 0.6; } // broken gold ring
  const gemD = cyl(0.66, 0.2, gold, 0, 0, 0.08, T_, { seg: 40 }); gemD.rotation.x = PI / 2; // gold bezel
  const face = add(new THREE.CircleGeometry(0.58, 48), gm, 0, 0, 0.19, T_, false);
  const dome = add(new THREE.SphereGeometry(0.58, 32, 16, 0, PI * 2, 0, PI / 2), new THREE.MeshStandardMaterial({ color: '#ffd060', transparent: true, opacity: 0.18, roughness: 0.05, envMap: ENV }), 0, 0, 0.19, T_, false); dome.rotation.x = PI / 2; dome.scale.y = 0.35;
}
const raysTex = canvasTex(512, 512, (g) => { g.translate(256, 256); for (let k = 0; k < 18; k++) { g.rotate(PI * 2 / 18); const grd = g.createLinearGradient(0, 0, 250, 0); grd.addColorStop(0, 'rgba(255,230,140,0.95)'); grd.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = grd; g.beginPath(); g.moveTo(0, 0); g.lineTo(250, -18); g.lineTo(250, 18); g.fill(); } });
const rays = new THREE.Sprite(new THREE.SpriteMaterial({ map: raysTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); S.add(rays);
const glowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color: '#ffe08a', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); S.add(glowS);
const rayAt = (pos, s, rot = 0, a = 1) => { rays.visible = s > 0.01; rays.position.copy(pos); rays.scale.setScalar(s); rays.material.rotation = rot; rays.material.opacity = a; glowS.visible = rays.visible; glowS.position.copy(pos); glowS.scale.setScalar(s * 0.55); glowS.material.opacity = a; };

// ---- job application paper ----
const paperTex = canvasTex(256, 340, (g) => { g.fillStyle = '#fbfbf6'; g.fillRect(0, 0, 256, 340); g.fillStyle = '#222'; g.font = '900 34px "Inter Display", sans-serif'; g.fillText('Job', 26, 52); g.fillText('Application', 26, 92); g.fillStyle = '#9aa0aa'; for (let y = 130; y < 320; y += 22) g.fillRect(26, y, 150 + ((y * 7) % 60), 6); });
const paper = add(new THREE.PlaneGeometry(1.4, 1.86), new THREE.MeshStandardMaterial({ map: paperTex, side: THREE.DoubleSide, emissive: '#ffffff', emissiveMap: paperTex, emissiveIntensity: 0.55 }), 0, 0, 0, S, false);

// ---- calculator ----
const calcC = document.createElement('canvas'); calcC.width = 512; calcC.height = 200; const calcG = calcC.getContext('2d'); const calcT = new THREE.CanvasTexture(calcC); calcT.colorSpace = THREE.SRGBColorSpace; let calcStr = null;
const calcText = (s) => { if (s === calcStr) return; calcStr = s; calcG.fillStyle = '#8fe36a'; calcG.fillRect(0, 0, 512, 200); const gr = calcG.createLinearGradient(0, 0, 0, 200); gr.addColorStop(0, 'rgba(255,255,255,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0.12)'); calcG.fillStyle = gr; calcG.fillRect(0, 0, 512, 200);
  calcG.fillStyle = '#1d2a14'; calcG.font = `italic 700 ${s.length > 8 ? 70 : 92}px "DejaVu Sans Mono", monospace`; calcG.textAlign = 'right'; calcG.textBaseline = 'middle'; calcG.fillText(s, 490, 104); calcT.needsUpdate = true; };
const keysTex = canvasTex(512, 640, (g) => { const L = ['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '=', '=']; L.forEach((t, i) => { const cx = 64 + (i % 4) * 128, cy = 64 + Math.floor(i / 4) * 128;
  g.fillStyle = i % 4 === 3 ? '#f08a24' : i < 4 ? '#8b9099' : '#4c5058'; g.beginPath(); g.roundRect(cx - 54, cy - 54, 108, 108, 22); g.fill(); g.fillStyle = '#fff'; g.font = '700 56px "Inter Display", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, cx, cy + 3); }); });
const calc = new THREE.Group(); S.add(calc); bx(2.4, 3.6, 0.35, '#2b2e35', 0, 0, 0, calc, { rad: 0.14 }); bx(2.05, 0.85, 0.06, '#15171b', 0, 1.2, 0.17, calc);
add(new THREE.PlaneGeometry(1.9, 0.72), new THREE.MeshStandardMaterial({ map: calcT, emissive: '#ffffff', emissiveMap: calcT, emissiveIntensity: 0.55 }), 0, 1.2, 0.21, calc, false);
add(new THREE.PlaneGeometry(2.1, 2.55), new THREE.MeshStandardMaterial({ map: keysTex, transparent: true, roughness: 0.5 }), 0, -0.45, 0.18, calc, false); calcText('0');

// ---- restaurant "W Chews" ----
const RX = -50, RZ = -14;
const signTex = canvasTex(1024, 420, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(560, 70, 70, 52, 0, 0, 7); g.ellipse(500, 82, 50, 40, 0, 0, 7); g.ellipse(620, 82, 50, 40, 0, 0, 7); g.fill(); g.fillRect(470, 92, 180, 52);
  g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.font = '900 260px "Inter Display", sans-serif'; g.lineWidth = 26; g.strokeStyle = '#ffd23f'; g.strokeText('W', 40, 360); g.fillStyle = '#e8242c'; g.fillText('W', 40, 360);
  g.font = 'italic 900 170px "Inter Display", sans-serif'; g.lineWidth = 22; g.strokeStyle = '#e8242c'; g.strokeText('Chews', 330, 330); g.fillStyle = '#ffffff'; g.fillText('Chews', 330, 330); });
const awnTex = canvasTex(256, 64, (g) => { for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? '#ffffff' : '#e3262f'; g.fillRect(k * 32, 0, 32, 64); } }, 0); awnTex.wrapS = THREE.RepeatWrapping; awnTex.repeat.set(3, 1);
const rest = new THREE.Group(); rest.position.set(RX, 0, RZ); S.add(rest);
bx(18, 7, 10, '#8a4a3a', 0, 3.5, 0, rest); bx(18.4, 0.8, 10.4, '#3a2420', 0, 7.2, 0, rest); bx(18.6, 1.1, 0.4, '#ffffff', 0, 6.1, 5.1, rest);
for (const wx of [-6, -2.6, 2.6, 6]) add(new THREE.BoxGeometry(3, 3, 0.1), winTex, wx, 2.6, 5.03, rest, false);
add(new THREE.BoxGeometry(2.2, 3.4, 0.1), BASIC('#fff1c2'), 0, 1.7, 5.03, rest, false);
const aw = add(new THREE.BoxGeometry(18, 0.12, 2.6), new THREE.MeshStandardMaterial({ map: awnTex, roughness: 0.7 }), 0, 4.6, 6.1, rest); aw.rotation.x = 0.38;
const signM = new THREE.MeshBasicMaterial({ map: signTex, transparent: true, toneMapped: false, color: '#ffffff' }); const sign = add(new THREE.PlaneGeometry(11, 4.5), signM, 0, 9.9, 3.8, rest, false);
bx(11, 0.3, 0.3, '#333', 0, 7.7, 3.6, rest); for (const sx of [-4, 4]) bx(0.25, 2, 0.25, '#333', sx, 8.4, 3.6, rest);
{ const bulbs = BASIC('#ffe9a8'); for (let k = 0; k < 24; k++) add(new THREE.SphereGeometry(0.11, 8, 6), bulbs, -8.8 + k * 0.765, 5.6, 5.4, rest, false); }
const restLight = new THREE.PointLight('#ffb070', 25, 18, 1.6); restLight.position.set(RX, 4, RZ + 8); S.add(restLight);
// car
const car = new THREE.Group(); car.position.set(RX - 7, 0, 2.2); S.add(car); bx(5.2, 1.2, 2.4, '#6cc04a', 0, 0.95, 0, car, { rad: 0.25 }); bx(3, 1, 2.2, '#6cc04a', -0.3, 2, 0, car, { rad: 0.25 });
bx(2.8, 0.75, 2.26, '#203040', -0.3, 2.05, 0, car, { rad: 0.15 }); for (const [x, z] of [[-1.7, 1.1], [1.7, 1.1], [-1.7, -1.1], [1.7, -1.1]]) { const w = cyl(0.5, 0.4, '#151515', x, 0.5, z, car); w.rotation.x = PI / 2; }
for (const z of [-0.8, 0.8]) add(new THREE.BoxGeometry(0.1, 0.35, 0.5), BASIC('#fff6d0'), 2.62, 1.05, z, car, false);
// plaza + fountain
const PX = -50, PZ = -38;
const tileTex = canvasTex(128, 128, (g) => { g.fillStyle = '#9a9aa4'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#7b7c86'; g.lineWidth = 4; g.strokeRect(0, 0, 64, 64); g.strokeRect(64, 64, 64, 64); g.strokeRect(64, 0, 64, 64); g.strokeRect(0, 64, 64, 64); }, 14);
const plaza = add(new THREE.PlaneGeometry(40, 28), new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.8 }), PX, 0.04, PZ, S, false); plaza.rotation.x = -PI / 2;
cyl(5, 1, '#8c909c', PX, 0.5, PZ, S, { seg: 32 }); const water = cyl(4.6, 0.1, EM('#3fc9ff', 1.2), PX, 1.0, PZ, S, { seg: 32, sh: false }); cyl(0.6, 3, '#9ca0ac', PX, 1.5, PZ); cyl(1.8, 0.4, '#9ca0ac', PX, 3.1, PZ, S, { seg: 24 }); cyl(1.6, 0.06, EM('#5fd8ff', 1.4), PX, 3.32, PZ, S, { sh: false });
const fLight = new THREE.PointLight('#56c8ff', 40, 16, 1.5); fLight.position.set(PX, 4, PZ); S.add(fLight);
for (const [x, z] of [[-18, -12], [18, -12], [-18, 12], [18, 12]]) lamp(PX + x, PZ + z);

// ---- crowd (instanced, for big shots) ----
const NCR = 320, crowdParts = [RB(2, 2, 1, 0.04), RB(4, 2, 1, 0.04), RB(1.3, 1.25, 1.3, 0.3)];
const crowdM = crowdParts.map((g) => { const m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ roughness: 0.6 }), NCR); m.castShadow = true; m.receiveShadow = true; S.add(m); m.visible = false; return m; });
const CR = []; { const r = rng(99), sk = ['#f5cd30', '#e7b98c', '#c98c5c', '#8a5a3c', '#f2d2b0'], cl = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#ecf0f1', '#34495e', '#e84393', '#fdcb6e', '#222222'];
  for (let k = 0; k < NCR; k++) { let x, z; const zone = r(); if (zone < 0.55) { x = PX + (r() - 0.5) * 38; z = PZ + (r() - 0.5) * 26; if (Math.hypot(x - PX, z - PZ) < 6) { x += 8; } }
    else if (zone < 0.85) { x = PX + (r() - 0.5) * 60; z = (r() - 0.5) * 9; } else { x = PX + (r() - 0.5) * 24; z = -6 - r() * 3; }
    const gld = r() < 0.12; CR.push({ x, z, ry: r() * 7, ph: r() * 7, cols: gld ? ['#e0a526', '#f2b632', '#f2b632'] : [cl[(r() * 11) | 0], cl[(r() * 11) | 0], sk[(r() * 5) | 0]] }); } }
const crowdShow = (on, crazy = 0) => { crowdM.forEach((m) => (m.visible = on)); if (!on) return; const o = new THREE.Object3D(), col = new THREE.Color();
  CR.forEach((p, i) => { const j = crazy * Math.abs(Math.sin(T * 9 + p.ph)) * 1.4, dx = crazy * Math.sin(T * 3 + p.ph) * 1.5;
    [[1, 0], [2, 3], [4.66, 2]].forEach(([y, ci], k) => { o.position.set(p.x + dx, y + j, p.z); o.rotation.set(0, p.ry + crazy * T * 2, 0); o.updateMatrix(); crowdM[k].setMatrixAt(i, o.matrix); crowdM[k].setColorAt(i, col.set(p.cols[ci] || p.cols[2])); }); });
  crowdM.forEach((m) => { m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }); };

// ---- characters ----
P.toString(); // (pose helper from core)
const woodTex = canvasTex(256, 256, (g) => { g.fillStyle = '#d98a33'; g.fillRect(0, 0, 256, 256); const r = rng(4); for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(${140 + r() * 40},${70 + r() * 30},20,${0.25 + r() * 0.3})`; g.lineWidth = 2 + r() * 4; g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 10, 80, x - 12, 170, x + 6, 256); g.stroke(); } });
const woodM = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.55, color: '#ffffff' });
const faceWood = (g, skin, f) => { g.drawImage(woodTex.image, 0, 0, 512, 512); const ex = f.expr, K = '#1a0f08', lx = (f.look?.[0] || 0) * 18, ly = (f.look?.[1] || 0) * 14;
  const big = ex === 'shocked' ? 1.12 : 1;
  for (const [x, i] of [[178, 0], [334, 1]]) { const side = i ? 1 : -1;
    if (f.blink) { g.strokeStyle = K; g.lineWidth = 12; g.beginPath(); g.moveTo(x - 50, 200); g.quadraticCurveTo(x, 224, x + 50, 200); g.stroke(); }
    else { g.fillStyle = '#fff'; g.strokeStyle = '#6a3a10'; g.lineWidth = 10; g.beginPath(); g.arc(x, 200, 66 * big, 0, 7); g.fill(); g.stroke();
      g.fillStyle = K; g.beginPath(); g.arc(x + lx, 206 + ly, 38, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + lx + 14, 190 + ly, 13, 0, 7); g.fill(); g.beginPath(); g.arc(x + lx - 12, 222 + ly, 5, 0, 7); g.fill(); }
    const br = ex === 'angry' ? 34 : ex === 'sad' ? -26 : ex === 'shocked' ? -30 : -8; g.strokeStyle = '#4a2a10'; g.lineWidth = 24; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + side * 56, 112 - (ex === 'angry' ? 0 : 6)); g.quadraticCurveTo(x, 96 - 6, x - side * 50, 112 + br); g.stroke(); }
  g.fillStyle = '#2a1206'; g.strokeStyle = K; g.lineWidth = 8; const my = 360; g.beginPath();
  if (ex === 'shocked') { g.ellipse(256, my + 10, 36, 48, 0, 0, 7); g.fill(); }
  else if (ex === 'angry') { g.roundRect(186, my - 18, 140, 56, 16); g.fill(); g.fillStyle = '#fff'; g.fillRect(196, my - 10, 120, 18); g.fillRect(196, my + 14, 120, 16); g.fillStyle = K; for (let x = 216; x < 316; x += 22) g.fillRect(x, my - 10, 4, 40); }
  else if (ex === 'sad') { g.lineWidth = 12; g.moveTo(196, my + 30); g.quadraticCurveTo(256, my - 8, 316, my + 30); g.stroke(); }
  else { g.moveTo(176, my - 30); g.quadraticCurveTo(256, my + 70, 336, my - 30); g.closePath(); g.fill(); g.fillStyle = '#c94a4a'; g.beginPath(); g.ellipse(256, my + 14, 40, 14, 0, 0, 7); g.fill(); } };
const recolorArms = (c, mat) => c.arms.forEach((a) => (a.children[0].material = mat));
const ME = makeChar({ skin: '#c98c5c', shirt: '#1c1c21', pants: '#141418', build: (c) => { recolorArms(c, M('#1c1c21', { r: 0.6 }));
  bx(1.7, 1.2, 0.6, '#16161a', 0, 0.35, -0.75, c.neck, { rad: 0.25 }); for (const s of [-0.3, 0.3]) bx(0.07, 0.8, 0.07, '#e8e8e8', s, 1.45, 0.54, c.torso, { sh: false }); bx(0.05, 1.9, 0.06, '#8a8a90', 0, 1.0, 0.53, c.torso, { sh: false }); bx(1.2, 0.5, 0.08, '#141418', 0, 0.55, 0.53, c.torso);
  const r = rng(12), hm = M('#3a2416', { r: 0.8 }); for (let k = 0; k < 70; k++) { const a = r() * PI * 2, e = r() * 1.25; const x = Math.cos(a) * Math.cos(e) * 0.78, z = Math.sin(a) * Math.cos(e) * 0.78, y = 0.66 + 0.42 + Math.sin(e) * 0.42;
    if (z > 0.3 && y < 1.2) continue; ball(0.2 + r() * 0.08, hm, x, y, z - 0.05, c.neck); } } });
const WOOD = makeChar({ skin: '#d98a33', shirt: '#d98a33', pants: '#d98a33', faceFn: faceWood, build: (c) => { c.root.traverse((m) => { if (m.isMesh && m !== c.head) m.material = woodM; }); c.head.material = c.head.material.map((mm, i) => (i === 4 ? mm : woodM)); c.head.scale.set(1.05, 1.5, 1.05); c.head.position.y = 0.96; } });
const KID = makeChar({ skin: '#7a4a2e', shirt: '#a6e8c0', pants: '#cfae7c', sleeves: true, face: { glasses: '#111' }, build: (c) => { bx(1.38, 0.34, 1.38, '#15110f', 0, 1.3, 0, c.neck, { rad: 0.14 }); bx(1.38, 0.8, 0.3, '#15110f', 0, 0.95, -0.55, c.neck, { rad: 0.1 }); } });
const vestTex = canvasTex(128, 128, (g) => { g.fillStyle = '#26282a'; g.fillRect(0, 0, 128, 128); const r = rng(9); for (let k = 0; k < 160; k++) { g.fillStyle = ['#1a1b1c', '#3a3d40', '#4a4d50'][(r() * 3) | 0]; g.fillRect(((r() * 16) | 0) * 8, ((r() * 16) | 0) * 8, 8, 8); } });
const camoTex = canvasTex(256, 256, (g) => { g.fillStyle = '#c4232b'; g.fillRect(0, 0, 256, 256); const r = rng(8); for (let k = 0; k < 40; k++) { g.fillStyle = r() < 0.5 ? '#7a1016' : '#e0474c'; g.beginPath(); g.ellipse(r() * 256, r() * 256, 10 + r() * 22, 6 + r() * 14, r() * 3, 0, 7); g.fill(); } });
const richBuild = (golden) => (c) => { const camo = golden ? gold : new THREE.MeshStandardMaterial({ map: camoTex, roughness: 0.7 }), blk = golden ? goldDark : M('#151515', { r: 0.5 }), vest = golden ? goldDark : new THREE.MeshStandardMaterial({ map: vestTex, roughness: 0.85 });
  bx(1.4, 0.42, 1.4, camo, 0, 1.36, -0.02, c.neck, { rad: 0.18 }); bx(1.3, 0.09, 0.75, camo, 0, 1.18, 0.82, c.neck, { rad: 0.03 });
  const band = add(new THREE.TorusGeometry(0.82, 0.08, 8, 24, PI), blk, 0, 0.72, -0.05, c.neck); for (const s of [-1, 1]) { const e = cyl(0.36, 0.3, blk, s * 0.75, 0.62, 0, c.neck); e.rotation.z = PI / 2; }
  c.userData = {}; c.userData.lenses = [-1, 1].map((s) => { const l = add(RB(0.3, 0.3, 0.03, 0.05), new THREE.MeshStandardMaterial({ color: golden ? '#e8c547' : '#9b3cff', transparent: true, opacity: 0.55, emissive: golden ? '#7a5a00' : '#5a10a0', roughness: 0.1 }), s * 0.155, 0.78, 0.67, c.neck, false); l.visible = golden; return l; });
  bx(2.1, 1.85, 1.1, vest, 0, 1.0, 0, c.torso, { rad: 0.06 }); for (const s of [-0.55, 0, 0.55]) bx(0.5, 0.45, 0.14, golden ? gold : M('#1c1d1f'), s, 0.7, 0.58, c.torso); for (const s of [-0.62, 0.62]) bx(0.3, 2.0, 1.2, golden ? goldDark : M('#3a3226', { r: 0.8 }), s, 1.05, 0, c.torso); bx(1.7, 1.6, 0.7, golden ? goldDark : M('#3a3226', { r: 0.8 }), 0, 1.1, -0.85, c.torso, { rad: 0.12 });
  if (golden) { c.root.traverse((m) => { if (m.isMesh && m !== c.head && !m.geometry.parameters?.depth?.toFixed?.call) {} }); c.root.traverse((m) => { if (m.isMesh && m.material !== gold && m.material !== goldDark && m !== c.head && !(m.material.color && m.material.color.getHexString() === 'e8c547')) m.material = gold; }); c.head.material = c.head.material.map((mm, i) => (i === 4 ? mm : gold)); } };
const RICH = makeChar({ skin: '#e7b98c', shirt: '#1d1d1f', pants: '#1a1a1a', sleeves: true, face: { beard: '#4a3426', glasses: '#111' }, build: richBuild(false) });
const RICHG = makeChar({ skin: '#f0b43a', shirt: '#f2b632', pants: '#f2b632', sleeves: true, face: { beard: '#b47812', glasses: '#6a4206' }, build: richBuild(true) });
const NOOB = makeChar({ skin: '#f5cd30', shirt: '#1f6fd6', pants: '#93c13a' });
const GRAN = makeChar({ skin: '#f0cfa8', shirt: '#9b5fb8', pants: '#5b4a6e', cardigan: true, build: (c) => { const h = M('#d9d9df', { r: 0.9 }); bx(1.4, 0.3, 1.4, h, 0, 1.3, 0, c.neck, { rad: 0.14 }); ball(0.38, h, 0, 1.45, -0.55, c.neck); } });
const COP = makeChar({ skin: '#c98c5c', shirt: '#26428f', pants: '#1a2440', sleeves: true, build: (c) => { bx(1.45, 0.4, 1.45, '#1a2440', 0, 1.36, 0, c.neck, { rad: 0.1 }); bx(1.4, 0.08, 0.6, '#111', 0, 1.18, 0.8, c.neck); bx(0.3, 0.3, 0.06, gold, 0, 1.38, 0.74, c.neck); bx(0.3, 0.36, 0.06, gold, 0.55, 1.5, 0.52, c.torso); } });
const CHEF = makeChar({ skin: '#f2d2b0', shirt: '#f4f4f4', pants: '#333', sleeves: true, face: { mustache: '#3a2a1a' }, build: (c) => { cyl(0.62, 1.2, '#ffffff', 0, 1.8, 0, c.neck); ball(0.75, '#ffffff', 0, 2.5, 0, c.neck); } });
const G1 = makeChar({ skin: '#f5cd30', shirt: '#e74c3c', pants: '#2c3e50', build: (c) => bx(1.4, 0.36, 1.4, '#6b3a1e', 0, 1.3, 0, c.neck, { rad: 0.14 }) });
const G2 = makeChar({ skin: '#e7b98c', shirt: '#f39c12', pants: '#34495e', toff: 1.3, build: (c) => { bx(1.42, 0.4, 1.42, '#111', 0, 1.32, 0, c.neck, { rad: 0.16 }); bx(1.3, 0.08, 0.6, '#111', 0, 1.15, 0.8, c.neck); } });
const G3 = makeChar({ skin: '#8a5a3c', shirt: '#9b59b6', pants: '#222', toff: 2.1, build: (c) => bx(1.4, 0.45, 1.4, '#e84393', 0, 1.34, 0, c.neck, { rad: 0.2 }) });
const G4 = makeChar({ skin: '#f2d2b0', shirt: '#1abc9c', pants: '#7f8c8d', toff: 0.6, build: (c) => { bx(1.4, 0.3, 1.4, '#c0782a', 0, 1.3, 0, c.neck, { rad: 0.14 }); bx(1.4, 1.2, 0.3, '#c0782a', 0, 0.75, -0.55, c.neck, { rad: 0.1 }); } });
const GG = makeChar({ skin: '#f0b43a', shirt: '#f2b632', pants: '#f2b632', toff: 0.9, build: (c) => { c.root.traverse((m) => { if (m.isMesh && m !== c.head) m.material = gold; }); c.head.material = c.head.material.map((mm, i) => (i === 4 ? mm : gold)); } });
const GG2 = makeChar({ skin: '#f0b43a', shirt: '#f2b632', pants: '#f2b632', toff: 1.7, build: (c) => { c.root.traverse((m) => { if (m.isMesh && m !== c.head) m.material = gold; }); c.head.material = c.head.material.map((mm, i) => (i === 4 ? mm : gold)); bx(1.42, 0.4, 1.42, gold, 0, 1.32, 0, c.neck, { rad: 0.16 }); } });
// blocky dog
const dog = new THREE.Group(); S.add(dog); { const b = M('#a8682e'), d = M('#5a3416'); bx(2.2, 1.0, 1.0, b, 0, 1.3, 0, dog, { rad: 0.15 }); bx(1.0, 1.0, 1.0, b, 1.3, 2.0, 0, dog, { rad: 0.2 }); bx(0.5, 0.4, 0.6, '#d9a066', 1.9, 1.85, 0, dog, { rad: 0.1 }); ball(0.12, '#111', 2.15, 1.98, 0, dog);
  for (const s of [-1, 1]) { bx(0.2, 0.6, 0.35, d, 1.1, 2.3, s * 0.5, dog); ball(0.08, '#111', 1.82, 2.2, s * 0.24, dog); } for (const [x, z] of [[-0.8, -0.3], [-0.8, 0.3], [0.8, -0.3], [0.8, 0.3]]) bx(0.32, 0.9, 0.32, b, x, 0.45, z, dog); const tl = bx(0.18, 0.18, 0.8, b, -1.2, 1.7, 0, dog); tl.rotation.set(0, PI / 2, 0.6); }
// potion
const potion = new THREE.Group(); S.add(potion); { ball(0.42, new THREE.MeshStandardMaterial({ color: '#ffcf33', emissive: '#ffb000', emissiveIntensity: 1.2, transparent: true, opacity: 0.9, roughness: 0.1 }), 0, 0, 0, potion); cyl(0.14, 0.4, '#e9f4ff', 0, 0.5, 0, potion); cyl(0.17, 0.16, '#8a5a2a', 0, 0.76, 0, potion); }
// flashlight
const flashL = new THREE.SpotLight('#fff3d0', 0, 30, 0.45, 0.6, 1.2); S.add(flashL); S.add(flashL.target); const flashBody = new THREE.Group(); S.add(flashBody); { const m = cyl(0.14, 0.7, '#222', 0, 0, 0, flashBody); m.rotation.x = PI / 2; add(new THREE.CircleGeometry(0.13, 16), BASIC('#fffbe6'), 0, 0, 0.36, flashBody, false); }
const flashS = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color: '#fff2c0', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); S.add(flashS);

