// Factopia host as a real 3D character: rounded body, joints, 3D eyes, painted face decal for
// brows / mouth / blush. Original design: orange cap, round glasses, teal top.
// usage: const H = createHost(THREE, ndNoInk); scene.add(H.root); H.pose({...}) every frame.

const SKIN = '#ffd6b4', TEAL = '#17a39a', TEAL_D = '#0f7a74', PANTS = '#2c3550', SHOE = '#3a2a22', CAP = '#f07a12', INK = '#241726';

export function createHost(THREE, ndNoInk) {
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0, ...o });
  const M = {
    skin: std(SKIN, { roughness: 0.62, emissive: '#7a3a22', emissiveIntensity: 0.12 }),
    teal: std(TEAL, { roughness: 0.75 }), tealD: std(TEAL_D, { roughness: 0.75 }), pants: std(PANTS, { roughness: 0.8 }),
    shoe: std(SHOE, { roughness: 0.45 }), cap: std(CAP, { roughness: 0.6 }), capD: std('#c95e08', { roughness: 0.6 }),
    white: std('#ffffff', { roughness: 0.25 }), pupil: std('#1a1220', { roughness: 0.2 }), frame: std('#221a24', { roughness: 0.35, metalness: 0.2 }),
    glint: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    lens: new THREE.MeshStandardMaterial({ color: '#d8ecff', roughness: 0.05, transparent: true, opacity: 0.12, depthWrite: false }),
    belt: std('#e2c27a', { roughness: 0.5 }),
  };
  const meshes = [];
  const mk = (geo, mat, parent, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; parent.add(m); meshes.push(m); return m;
  };
  const G = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const cap = (r, len) => new THREE.CapsuleGeometry(r, len, 8, 20);

  const root = new THREE.Group();
  const body = G(root);                 // squash & stretch lives here
  const hips = G(body, 0, 0.46, 0);
  // legs
  const legs = [-1, 1].map((s) => {
    const hip = G(hips, s * 0.1, 0, 0);
    mk(cap(0.075, 0.14), M.pants, hip, 0, -0.1, 0);
    const knee = G(hip, 0, -0.22, 0);
    mk(cap(0.068, 0.12), M.pants, knee, 0, -0.1, 0);
    const foot = G(knee, 0, -0.2, 0);
    mk(new THREE.SphereGeometry(1, 24, 16), M.shoe, foot, 0, -0.01, 0.05, 0.085, 0.06, 0.14);
    return { hip, knee, foot };
  });
  // torso
  const spine = G(hips, 0, 0.02, 0);
  mk(cap(0.22, 0.2), M.teal, spine, 0, 0.24, 0, 1.06, 1, 0.84);
  mk(new THREE.TorusGeometry(0.205, 0.022, 10, 40), M.belt, spine, 0, 0.1, 0, 1.06, 0.84, 1).rotation.x = Math.PI / 2;
  mk(new THREE.ConeGeometry(0.06, 0.08, 3), M.tealD, spine, 0, 0.47, 0.17, 1, 1, 0.3).rotation.set(Math.PI, 0, 0); // collar V
  // arms
  const arms = [-1, 1].map((s) => {
    const sh = G(spine, s * 0.235, 0.42, 0);
    mk(new THREE.SphereGeometry(0.07, 20, 14), M.teal, sh);
    mk(cap(0.058, 0.14), M.teal, sh, 0, -0.11, 0);
    const el = G(sh, 0, -0.22, 0);
    mk(new THREE.SphereGeometry(0.056, 18, 12), M.teal, el);
    mk(cap(0.052, 0.13), M.teal, el, 0, -0.1, 0);
    const hand = G(el, 0, -0.21, 0);
    mk(new THREE.SphereGeometry(0.066, 20, 14), M.skin, hand, 0, -0.01, 0, 1, 1.05, 0.85);
    const thumb = mk(cap(0.022, 0.04), M.skin, hand, -s * 0.045, 0.0, 0.035); thumb.rotation.z = s * 0.6;
    return { sh, el, hand, thumb };
  });
  // head
  const neck = G(spine, 0, 0.5, 0);
  mk(new THREE.CylinderGeometry(0.06, 0.07, 0.08, 16), M.skin, neck, 0, 0.02, 0);
  const head = G(neck, 0, 0.3, 0);
  mk(new THREE.SphereGeometry(0.3, 64, 48), M.skin, head, 0, 0, 0, 1, 0.96, 0.95);
  for (const s of [-1, 1]) { mk(new THREE.SphereGeometry(0.07, 20, 14), M.skin, head, s * 0.29, -0.01, -0.01, 0.45, 1, 0.8); }
  mk(new THREE.SphereGeometry(0.042, 20, 14), M.skin, head, 0, -0.045, 0.29, 1, 0.85, 0.9); // nose
  // face decal (brows, mouth, blush) painted on a canvas, wrapped on a sphere segment over the face
  const FC = document.createElement('canvas'); FC.width = 1024; FC.height = 1024; const fg = FC.getContext('2d');
  const ftex = new THREE.CanvasTexture(FC); ftex.colorSpace = THREE.SRGBColorSpace; ftex.anisotropy = 8;
  const P0 = Math.PI / 2 - 0.9, PL = 1.8, T0 = 0.9, TL = 1.6;
  const faceM = new THREE.MeshStandardMaterial({ map: ftex, transparent: true, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const face = mk(new THREE.SphereGeometry(0.3015, 64, 48, P0, PL, T0, TL), faceM, head, 0, 0, 0, 1, 0.96, 0.95); face.castShadow = false;
  // 3D eyes
  const eyes = [-1, 1].map((s) => {
    const g = G(head, s * 0.105, 0.035, 0.252);
    const w = mk(new THREE.SphereGeometry(0.07, 32, 24), M.white, g, 0, 0, 0, 1, 1.1, 0.6);
    const pup = G(g, 0, 0, 0.038);
    mk(new THREE.SphereGeometry(0.038, 24, 16), M.pupil, pup, 0, 0, 0, 1, 1.1, 0.5);
    const gl = mk(new THREE.SphereGeometry(0.011, 10, 8), M.glint, pup, -0.014, 0.018, 0.02); gl.castShadow = false;
    return { g, pup };
  });
  // glasses
  for (const s of [-1, 1]) {
    mk(new THREE.TorusGeometry(0.088, 0.011, 12, 40), M.frame, head, s * 0.105, 0.035, 0.298);
    const l = mk(new THREE.CircleGeometry(0.088, 32), M.lens, head, s * 0.105, 0.035, 0.297); l.castShadow = false;
  }
  mk(cap(0.009, 0.03), M.frame, head, 0, 0.045, 0.302).rotation.z = Math.PI / 2;
  // cap
  const capG = G(head, 0, 0.035, 0); capG.rotation.x = -0.3;
  mk(new THREE.SphereGeometry(0.312, 48, 24, 0, Math.PI * 2, 0, 1.32), M.cap, capG, 0, 0, 0, 1, 0.96, 0.97);
  for (let i = 0; i < 6; i++) { const seam = mk(new THREE.TorusGeometry(0.313, 0.003, 4, 48, 1.2), M.capD, capG); seam.rotation.set(0, i * Math.PI / 3, Math.PI / 2 - 0.0); seam.scale.set(1, 0.96, 0.97); }
  mk(new THREE.SphereGeometry(0.03, 16, 10), M.capD, capG, 0, 0.295, 0);
  const brim = mk(new THREE.CylinderGeometry(0.24, 0.24, 0.024, 40, 1, false, -Math.PI / 2, Math.PI), M.capD, capG, 0, 0.085, 0.2, 1.12, 1, 1.0);
  brim.rotation.x = 0.16;
  meshes.forEach((m) => { m.userData.nd = ndNoInk; });

  // ---------- face painting ----------
  let faceKey = '';
  const U = (a) => (a + PL / 2) / PL * 1024;            // horizontal angle offset -> canvas x
  const V = (y) => (Math.acos(Math.max(-1, Math.min(1, y / (0.3 * 0.96)))) - T0) / TL * 1024; // head-space y -> canvas y
  const paintFace = (F) => {
    const key = JSON.stringify(F); if (key === faceKey) return; faceKey = key;
    fg.clearRect(0, 0, 1024, 1024); fg.lineCap = 'round'; fg.lineJoin = 'round';
    // blush
    for (const s of [-1, 1]) { const x = U(s * 0.62), y = V(-0.07), gr = fg.createRadialGradient(x, y, 0, x, y, 70); gr.addColorStop(0, `rgba(255,110,110,${0.42 * (F.blush ?? 1)})`); gr.addColorStop(1, 'rgba(255,110,110,0)'); fg.fillStyle = gr; fg.fillRect(x - 80, y - 80, 160, 160); }
    // brows: F.brow = [innerLift, outerLift] in px (+ = up), F.browY extra lift
    for (const s of [-1, 1]) {
      const yb = V(0.14) - (F.browY || 0), xi = U(s * 0.16), xo = U(s * 0.52);
      fg.strokeStyle = '#3a2418'; fg.lineWidth = 30; fg.beginPath();
      fg.moveTo(xi, yb - (F.brow?.[0] || 0)); fg.quadraticCurveTo((xi + xo) / 2, yb - 12 - ((F.brow?.[0] || 0) + (F.brow?.[1] || 0)) / 2, xo, yb - (F.brow?.[1] || 0)); fg.stroke();
    }
    // mouth
    const mx = U(0), my = V(-0.13), w = 150 * (F.mw || 1), o = F.open || 0;
    fg.strokeStyle = INK; fg.fillStyle = '#5a1e28'; fg.lineWidth = 14;
    if (F.mouth === 'smile') { fg.beginPath(); fg.moveTo(mx - w * 0.7, my - 10); fg.quadraticCurveTo(mx, my + 55, mx + w * 0.7, my - 10); fg.stroke(); }
    else if (F.mouth === 'O') {
      fg.beginPath(); fg.ellipse(mx, my + 10, w * 0.38, 40 + 70 * o, 0, 0, 7); fg.fill(); fg.stroke();
      fg.save(); fg.clip(); fg.fillStyle = '#e86e78'; fg.beginPath(); fg.ellipse(mx, my + 50 + 60 * o, w * 0.3, 34, 0, 0, 7); fg.fill(); fg.restore();
    } else { // 'grin' / 'laugh': open D mouth with teeth and tongue
      const h = 60 + 150 * o;
      fg.beginPath(); fg.moveTo(mx - w, my - 14); fg.quadraticCurveTo(mx, my - 4, mx + w, my - 14); fg.quadraticCurveTo(mx + w * 0.8, my + h, mx, my + h); fg.quadraticCurveTo(mx - w * 0.8, my + h, mx - w, my - 14); fg.closePath();
      fg.fill(); fg.save(); fg.clip();
      fg.fillStyle = '#ffffff'; fg.fillRect(mx - w, my - 30, 2 * w, 34);
      fg.fillStyle = '#e86e78'; fg.beginPath(); fg.ellipse(mx, my + h, w * 0.6, h * 0.42, 0, 0, 7); fg.fill(); fg.restore();
      fg.stroke();
    }
    ftex.needsUpdate = true;
  };

  // ---------- posing ----------
  const pose = (p) => {
    root.position.set(p.x ?? 0, 0, p.z ?? 0); root.rotation.y = p.yaw ?? 0;
    const sq = p.squash ?? 1; body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    hips.position.y = 0.46 + (p.bounce ?? 0);
    spine.rotation.set(p.lean ?? 0, p.twist ?? 0, p.sway ?? 0);
    neck.rotation.set(p.headX ?? 0, p.headY ?? 0, p.headZ ?? 0);
    const es = p.eyeScale ?? 1, bl = p.blink ?? 0;
    eyes.forEach((e, i) => {
      const b = i ? (p.blinkR ?? bl) : bl; e.g.scale.set(es, es * Math.max(0.06, 1 - b), es);
      const ps = p.pupil ?? 1; e.pup.scale.setScalar(ps);
      e.pup.position.set(0.025 * (p.lookX ?? 0), 0.022 * (p.lookY ?? 0), 0.038);
    });
    const A = [p.armL || {}, p.armR || {}];
    arms.forEach((a, i) => { const s = i ? 1 : -1, q = A[i]; a.sh.rotation.set(q.fwd ?? 0, 0, s * (q.out ?? 0.12)); a.el.rotation.set(q.bendF ?? 0, 0, s * (q.bend ?? 0)); a.hand.rotation.set(0, 0, s * (q.wrist ?? 0)); if (q.thumbUp) { a.thumb.position.set(0, -0.075, 0.015); a.thumb.rotation.set(0, 0, 0); a.thumb.scale.setScalar(1.5); } else { a.thumb.position.set(-s * 0.045, 0, 0.035); a.thumb.rotation.set(0, 0, s * 0.6); a.thumb.scale.setScalar(1); } });
    const Lg = [p.legL || {}, p.legR || {}];
    legs.forEach((l, i) => { const q = Lg[i]; l.hip.rotation.set(q.lift ?? 0, 0, (i ? 1 : -1) * (q.out ?? 0.03)); l.knee.rotation.x = q.knee ?? 0; l.foot.rotation.x = q.toe ?? 0; });
    paintFace({ mouth: p.mouth || 'smile', open: +(p.open ?? 0).toFixed(2), mw: +(p.mw ?? 1).toFixed(2), brow: (p.brow || [0, 0]).map((v) => Math.round(v)), browY: Math.round(p.browY ?? 0), blush: p.blush ?? 1 });
  };
  return { root, pose };
}
