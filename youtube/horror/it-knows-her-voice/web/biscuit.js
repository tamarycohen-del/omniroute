// Biscuit: small brown long-bodied dog, our own flat 2D design (matches whiteStick's dark outline).
// biscuit(g, o) draws with the origin on the ground under the middle of the body, facing right.
// o: { pose: 'stand'|'walk'|'stare'|'crouch', t (seconds, for walk/shake), shake (0..1), flip, look (-1..1 eye shift),
//      ears ('down'|'up'), tail (wag amount 0..1), eyesOnly (draw only the glinting eyes, for the dark under the bed) }
const O = '#121018', FUR = '#9a6236', FUR_D = '#73452a', BELLY = '#c48a58', NOSE = '#1a1014', EYE = '#121018';

export const biscuit = (g, o = {}) => {
  const t = o.t || 0, pose = o.pose || 'stand';
  const jit = (o.shake || 0) * 4;
  const jx = jit * Math.sin(t * 61), jy = jit * Math.sin(t * 47 + 1);
  const crouch = pose === 'crouch' ? 1 : 0;
  g.save();
  g.translate(jx, jy);
  if (o.flip) g.scale(-1, 1);
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (o.eyesOnly) { eyes(g, 128, -112 + crouch * 30, o, true); g.restore(); return; }
  const bodyY = -86 + crouch * 30, step = pose === 'walk' ? Math.sin(t * 12) : 0;
  // shadow
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(0, 2, 170, 16, 0, 0, 7); g.fill();
  // far legs (darker)
  for (const [x, ph] of [[-92, 1], [74, -1]]) leg(g, x + 10, bodyY + 30, ph * step, FUR_D, crouch);
  // tail
  const wag = (o.tail || 0) * Math.sin(t * 18) * 0.5;
  g.save(); g.translate(-150, bodyY - 6); g.rotate(-0.5 + wag - crouch * 0.6);
  g.strokeStyle = O; g.lineWidth = 22; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-40, -30, -66, -36); g.stroke();
  g.strokeStyle = FUR; g.lineWidth = 11; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-40, -30, -66, -36); g.stroke();
  g.restore();
  // body: long sausage
  g.fillStyle = FUR; g.strokeStyle = O; g.lineWidth = 9;
  g.beginPath(); g.roundRect(-160, bodyY - 46, 300, 96, 48); g.fill(); g.stroke();
  g.fillStyle = BELLY; g.beginPath(); g.ellipse(-10, bodyY + 30, 110, 16, 0, 0, Math.PI); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.ellipse(-20, bodyY - 26, 110, 12, 0, 0, 7); g.fill();
  // near legs
  for (const [x, ph] of [[-108, -1], [58, 1]]) leg(g, x, bodyY + 34, ph * step, FUR, crouch);
  // neck + head
  const hx = 150, hy = bodyY - 46 + crouch * 18, lift = pose === 'stare' ? -10 : 0;
  g.fillStyle = FUR; g.strokeStyle = O; g.lineWidth = 9;
  g.beginPath(); g.moveTo(96, bodyY - 30); g.quadraticCurveTo(130, bodyY - 70, hx, hy + lift - 4); g.lineTo(hx + 26, hy + lift + 40); g.quadraticCurveTo(120, bodyY + 20, 96, bodyY + 10); g.closePath(); g.fill(); g.stroke();
  // head (round skull + long snout)
  g.save(); g.translate(hx, hy + lift);
  g.beginPath(); g.ellipse(0, 0, 50, 44, 0, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(26, -18); g.quadraticCurveTo(70, -14, 76, 10); g.quadraticCurveTo(72, 28, 30, 32); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = FUR; g.beginPath(); g.ellipse(18, 6, 30, 22, 0, 0, 7); g.fill(); // hides the seam
  g.fillStyle = BELLY; g.beginPath(); g.ellipse(52, 22, 20, 7, 0, 0, 7); g.fill();
  g.fillStyle = NOSE; g.beginPath(); g.ellipse(76, 4, 12, 10, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(73, 0, 3, 0, 7); g.fill();
  if (o.growl) { // bared teeth along the snout + wrinkled nose
    g.fillStyle = '#f4f2ee'; g.strokeStyle = O; g.lineWidth = 3; g.beginPath(); g.moveTo(34, 24); for (let k = 0; k < 6; k++) { g.lineTo(38 + k * 6, 31); g.lineTo(41 + k * 6, 24); } g.lineTo(34, 24); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = O; g.lineWidth = 3; for (const k of [0, 1]) { g.beginPath(); g.moveTo(46 + k * 9, -8); g.quadraticCurveTo(50 + k * 9, -14, 54 + k * 9, -8); g.stroke(); } }
  // ear (floppy, or perked when staring)
  const up = (o.ears || (pose === 'stare' ? 'up' : 'down')) === 'up';
  g.fillStyle = FUR_D; g.strokeStyle = O; g.lineWidth = 8;
  g.beginPath();
  if (up) { g.moveTo(-26, -30); g.quadraticCurveTo(-58, -58, -48, -6); g.quadraticCurveTo(-30, 4, -12, -20); }
  else { g.moveTo(-20, -34); g.quadraticCurveTo(-62, -20, -50, 44); g.quadraticCurveTo(-30, 56, -12, 20); g.quadraticCurveTo(-6, -10, -20, -34); }
  g.closePath(); g.fill(); g.stroke();
  g.restore();
  eyes(g, hx + 22, hy + lift - 8, o, false);
  g.restore();
};

const leg = (g, x, y, ph, col, crouch) => {
  const len = 54 - crouch * 26, sw = ph * 14;
  g.strokeStyle = O; g.lineWidth = 34; g.beginPath(); g.moveTo(x, y - 10); g.lineTo(x + sw, y + len); g.stroke();
  g.strokeStyle = col; g.lineWidth = 20; g.beginPath(); g.moveTo(x, y - 10); g.lineTo(x + sw, y + len); g.stroke();
  g.fillStyle = col; g.strokeStyle = O; g.lineWidth = 7; g.beginPath(); g.ellipse(x + sw + 8, y + len + 2, 20, 10, 0, 0, 7); g.fill(); g.stroke();
};

const eyes = (g, x, y, o, glow) => {
  const lx = (o.look || 0) * 5, big = o.pose === 'stare' || glow;
  if (glow) { // only two glints in the dark
    g.save(); g.shadowColor = 'rgba(255,230,160,0.9)'; g.shadowBlur = 18; g.fillStyle = '#ffe9a8';
    for (const s of [0, 26]) { g.beginPath(); g.ellipse(x + s, y, 9, 11, 0, 0, 7); g.fill(); }
    g.shadowBlur = 0; g.fillStyle = EYE; for (const s of [0, 26]) { g.beginPath(); g.ellipse(x + s + lx + 1, y + 1, 4, 7, 0, 0, 7); g.fill(); }
    g.restore(); return;
  }
  g.fillStyle = '#f4f2ee'; g.strokeStyle = O; g.lineWidth = 4;
  g.beginPath(); g.ellipse(x, y, big ? 13 : 11, big ? 15 : 12, 0, 0, 7); g.fill(); g.stroke();
  g.fillStyle = EYE; g.beginPath(); g.ellipse(x + 3 + lx, y + 1, big ? 7 : 6, big ? 9 : 8, 0, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 5 + lx, y - 3, 2.5, 0, 7); g.fill();
  if (o.worried || o.shake || o.growl) { g.strokeStyle = O; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 12, y - 14); g.lineTo(x + 10, y - 22); g.stroke(); }
};

// Front view (looking at the camera), for under the bed. Origin = midpoint between the eyes.
// o: { t, shake (0..1: body, ears and paws tremble; head and eyes stay still), dark (0..1: 1 = only the eye glints) }
export const biscuitFront = (g, o = {}) => {
  const t = o.t || 0, sh = o.shake || 0, dark = o.dark ?? 0;
  const q = (f, ph = 0) => sh * Math.sin(t * f + ph);
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if (dark < 1) {
    g.save(); g.globalAlpha = 1 - dark;
    // body lying behind the head (trembles)
    g.save(); g.translate(q(57) * 3, q(43, 1) * 2);
    g.fillStyle = FUR; g.strokeStyle = O; g.lineWidth = 8;
    g.beginPath(); g.ellipse(0, 84, 84, 44, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.ellipse(-14, 62, 52, 9, 0, 0, 7); g.fill();
    for (const s of [-1, 1]) { g.fillStyle = FUR; g.beginPath(); g.ellipse(s * 30 + q(71, s) * 2, 124, 22, 13, 0, 0, 7); g.fill(); g.stroke(); }
    g.restore();
    // ears (tremble)
    for (const s of [-1, 1]) {
      g.save(); g.translate(s * 46, -30); g.rotate(s * (0.12 + 0.06 * q(64, s)));
      g.fillStyle = FUR_D; g.strokeStyle = O; g.lineWidth = 8;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 40, 10, s * 30, 78); g.quadraticCurveTo(s * 12, 92, s * 2, 60); g.closePath(); g.fill(); g.stroke(); g.restore();
    }
    // head (still)
    g.fillStyle = FUR; g.strokeStyle = O; g.lineWidth = 8;
    g.beginPath(); g.ellipse(0, 4, 58, 52, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = BELLY; g.beginPath(); g.ellipse(0, 34, 30, 22, 0, 0, 7); g.fill();
    g.fillStyle = NOSE; g.beginPath(); g.ellipse(0, 24, 13, 10, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(-4, 21, 3, 0, 7); g.fill();
    g.strokeStyle = O; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 34); g.lineTo(0, 42); g.moveTo(-10, 46); g.quadraticCurveTo(0, 40, 10, 46); g.stroke();
    // worried brows
    g.lineWidth = 5; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 6, -16); g.lineTo(s * 24, -10); g.stroke(); }
    // tremble marks
    if (sh > 0 && Math.floor(t * 12) % 2 === 0) { g.strokeStyle = 'rgba(230,220,255,0.7)'; g.lineWidth = 5; for (const s of [-1, 1]) for (const k of [0, 1]) { g.beginPath(); g.moveTo(s * (106 + k * 16), 60 + k * 8); g.lineTo(s * (116 + k * 16), 96 + k * 8); g.stroke(); } }
    g.restore();
  }
  // eyes: same place in the dark and in the light
  for (const s of [-13, 13]) {
    if (dark < 1) { g.save(); g.globalAlpha = 1 - dark; g.fillStyle = '#f4f2ee'; g.strokeStyle = O; g.lineWidth = 4; g.beginPath(); g.ellipse(s, 0, 11, 13, 0, 0, 7); g.fill(); g.stroke(); g.restore(); }
    g.save(); g.shadowColor = 'rgba(255,230,160,0.9)'; g.shadowBlur = 18 * dark; g.fillStyle = `rgba(255,233,168,${dark})`; g.beginPath(); g.ellipse(s, 0, 9, 11, 0, 0, 7); g.fill(); g.restore();
    g.fillStyle = EYE; g.beginPath(); g.ellipse(s, 1, 5, 7, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(s + 2, -3, 2, 0, 7); g.fill();
  }
  g.restore();
};
