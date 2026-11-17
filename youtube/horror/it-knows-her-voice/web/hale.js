// Mrs. Hale: old neighbor, same flat style as whiteStick (white limbs, dark outline), our own design.
// mrsHale(g, o) draws in the same 600x1000 card space as whiteStick (cx 300, feet at 975).
// o: { arm: 'cane'|'wave'|'plate', wave (0..1 phase), smile: 'kind'|'wide', t }
const O = '#121018', SKIN = '#f4f2ee', HAIR = '#cfcbd6', HAIR_D = '#a8a2b4', DRESS = '#6a4a8a', DRESS_D = '#523670', CANE = '#6b4a2a';

export const mrsHale = (g, o = {}) => {
  const cx = 300, sole = 975, hipY = 760, neckY = 575, headR = 66, hc = neckY - headR + 4, t = o.t || 0;
  const limb = (pts, w1 = 28, w2 = 16) => { for (const [w, c] of [[w1, O], [w2, SKIN]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); } };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  // legs (short below the dress), slight stoop
  limb([[cx - 14, 860], [cx - 22, sole - 8]]); limb([[cx + 14, 860], [cx + 20, sole - 8]]);
  for (const s of [-1, 1]) { g.fillStyle = '#2a1e34'; g.strokeStyle = O; g.lineWidth = 6; g.beginPath(); g.ellipse(cx + s * 22 + s * 6, sole - 4, 24, 11, 0, 0, 7); g.fill(); g.stroke(); }
  // cane (left hand)
  const caneX = cx - 92;
  g.strokeStyle = O; g.lineWidth = 18; g.beginPath(); g.moveTo(caneX, sole - 2); g.lineTo(caneX + 4, 700); g.stroke();
  g.strokeStyle = CANE; g.lineWidth = 9; g.beginPath(); g.moveTo(caneX, sole - 2); g.lineTo(caneX + 4, 700); g.stroke();
  g.strokeStyle = O; g.lineWidth = 18; g.beginPath(); g.arc(caneX + 24, 700, 20, Math.PI, 0); g.stroke(); g.strokeStyle = CANE; g.lineWidth = 9; g.beginPath(); g.arc(caneX + 24, 700, 20, Math.PI, 0); g.stroke();
  // dress / cardigan (a-line), slight lean forward
  g.fillStyle = DRESS; g.strokeStyle = O; g.lineWidth = 9;
  g.beginPath(); g.moveTo(cx - 40, neckY + 18); g.quadraticCurveTo(cx, neckY + 6, cx + 40, neckY + 18); g.lineTo(cx + 78, 880); g.quadraticCurveTo(cx, 900, cx - 78, 880); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = DRESS_D; g.fillRect(cx - 4, neckY + 20, 8, 300); for (const y of [650, 700, 750]) { g.fillStyle = '#e8d9a0'; g.beginPath(); g.arc(cx + 14, y, 6, 0, 7); g.fill(); }
  // arms
  const sh = neckY + 40;
  limb([[cx - 34, sh], [cx - 70, sh + 70], [caneX + 6, 708]]); // to the cane
  if (o.arm === 'wave') { const w = Math.sin((o.wave ?? t * 8)) * 0.35; limb([[cx + 34, sh], [cx + 92, sh - 30], [cx + 110 + 30 * w, sh - 130]]); g.fillStyle = SKIN; g.strokeStyle = O; g.lineWidth = 6; g.beginPath(); g.arc(cx + 112 + 30 * w, sh - 142, 16, 0, 7); g.fill(); g.stroke(); }
  else if (o.arm === 'plate') { limb([[cx + 34, sh], [cx + 96, sh + 60], [cx + 160, sh + 40]]);
    g.fillStyle = '#f4f2ee'; g.strokeStyle = O; g.lineWidth = 6; g.beginPath(); g.ellipse(cx + 186, sh + 34, 70, 16, 0, 0, 7); g.fill(); g.stroke();
    for (const [dx, dy] of [[-30, -8], [0, -14], [30, -8], [-14, -26], [16, -26]]) { g.fillStyle = '#c48a48'; g.beginPath(); g.ellipse(cx + 186 + dx, sh + 30 + dy, 18, 10, 0, 0, 7); g.fill(); g.strokeStyle = O; g.lineWidth = 4; g.stroke(); g.fillStyle = '#5a3418'; g.beginPath(); g.arc(cx + 182 + dx, sh + 28 + dy, 3, 0, 7); g.arc(cx + 190 + dx, sh + 31 + dy, 2.5, 0, 7); g.fill(); } }
  else limb([[cx + 34, sh], [cx + 60, sh + 90], [cx + 58, sh + 160]]);
  // head
  g.fillStyle = SKIN; g.strokeStyle = O; g.lineWidth = 9; g.beginPath(); g.arc(cx, hc, headR, 0, 7); g.fill(); g.stroke();
  g.fillStyle = 'rgba(0,0,0,0.06)'; g.beginPath(); g.arc(cx + 16, hc + 12, headR - 14, 0, 7); g.fill();
  // grey hair: cap + bun
  g.fillStyle = HAIR; g.strokeStyle = O; g.lineWidth = 8;
  g.beginPath(); g.arc(cx + 30, hc - 70, 30, 0, 7); g.fill(); g.stroke(); // bun
  g.beginPath(); g.moveTo(cx - headR - 4, hc - 6); g.bezierCurveTo(cx - headR + 2, hc - headR - 30, cx + headR - 2, hc - headR - 30, cx + headR + 4, hc - 6); g.quadraticCurveTo(cx + 30, hc - 34, cx, hc - 30); g.quadraticCurveTo(cx - 30, hc - 34, cx - headR - 4, hc - 6); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = HAIR_D; g.lineWidth = 4; for (const k of [-30, 0, 30]) { g.beginPath(); g.moveTo(cx + k, hc - 58); g.quadraticCurveTo(cx + k + 8, hc - 44, cx + k + 4, hc - 32); g.stroke(); }
  // round glasses + eyes
  const ey = hc + 6;
  g.strokeStyle = O; g.lineWidth = 5; for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + 8 + s * 24, ey, 18, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(cx + 2, ey); g.lineTo(cx + 14, ey); g.stroke();
  g.fillStyle = O; for (const s of [-1, 1]) { if (o.smile === 'kind' || !o.smile) { g.lineWidth = 5; g.beginPath(); g.arc(cx + 8 + s * 24, ey + 4, 7, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } else { g.beginPath(); g.ellipse(cx + 8 + s * 24, ey, 6, 8, 0, 0, 7); g.fill(); } }
  // cheeks + smile
  if (o.smile !== 'toowide') { g.fillStyle = 'rgba(255,140,160,0.35)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + 8 + s * 40, ey + 30, 12, 7, 0, 0, 7); g.fill(); } }
  g.strokeStyle = O; g.lineWidth = 6; g.beginPath();
  if (o.smile === 'toowide') { // a little too wide: stretched further than a normal smile, thin line of teeth, eyes not smiling
    g.fillStyle = '#2a0f1e'; g.beginPath(); g.moveTo(cx - 34, ey + 30); g.quadraticCurveTo(cx + 8, ey + 64, cx + 50, ey + 30); g.quadraticCurveTo(cx + 8, ey + 48, cx - 34, ey + 30); g.fill();
    g.fillStyle = '#f4f2ee'; g.beginPath(); g.moveTo(cx - 26, ey + 34); g.quadraticCurveTo(cx + 8, ey + 50, cx + 42, ey + 34); g.quadraticCurveTo(cx + 8, ey + 54, cx - 26, ey + 34); g.fill();
    g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 34, ey + 30); g.quadraticCurveTo(cx + 8, ey + 64, cx + 50, ey + 30); g.moveTo(cx - 34, ey + 30); g.lineTo(cx - 39, ey + 25); g.moveTo(cx + 50, ey + 30); g.lineTo(cx + 55, ey + 25); } else if (o.smile === 'wide') { g.moveTo(cx - 26, ey + 34); g.quadraticCurveTo(cx + 8, ey + 62, cx + 42, ey + 34); } else { g.moveTo(cx - 12, ey + 36); g.quadraticCurveTo(cx + 8, ey + 50, cx + 28, ey + 36); }
  g.stroke();
  g.restore();
};
