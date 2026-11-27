// Stickman characters (original design). Card space 600x1000, feet on y=975.
const INK = '#141018';
/** o: { v: 'classic'|'host'|'chunky', expr: 'neutral'|'scared'|'shock', look, R: arm pose, flash: true } */
export const stickCard = (p, o = {}) => {
  const g = p.g, v = o.v || 'host', cx = 300, sole = 975;
  const headR = v === 'chunky' ? 92 : 78, neckY = v === 'chunky' ? 560 : 590, hipY = 790, hc = neckY - headR + 6;
  const lw = v === 'chunky' ? 16 : 14;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = INK;
  // legs
  g.lineWidth = lw; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 6, hipY); g.lineTo(cx + s * 52, sole - 8); g.stroke(); }
  // body
  if (v === 'chunky') { g.fillStyle = '#f2f0ec'; g.beginPath(); g.roundRect(cx - 52, neckY + 4, 104, hipY - neckY + 10, 40); g.fill(); g.lineWidth = 10; g.stroke(); }
  else if (v === 'host') { g.lineWidth = lw; g.beginPath(); g.moveTo(cx, neckY); g.lineTo(cx, hipY); g.stroke();
    g.fillStyle = '#17a39a'; g.beginPath(); g.moveTo(cx - 34, neckY + 18); g.lineTo(cx + 34, neckY + 18); g.lineTo(cx + 26, neckY + 120); g.lineTo(cx - 26, neckY + 120); g.closePath(); g.fill(); g.lineWidth = 7; g.stroke(); }
  else { g.lineWidth = lw; g.beginPath(); g.moveTo(cx, neckY); g.lineTo(cx, hipY); g.stroke(); }
  // arms
  const sh = neckY + 40; g.lineWidth = lw;
  const armL = [[cx - 70, sh + 120]], armR = o.R === 'flash' ? [[cx + 70, sh + 30], [cx + 125, sh + 20]] : [[cx + 70, sh + 120]];
  g.beginPath(); g.moveTo(cx, sh); g.lineTo(...armL[0]); g.stroke();
  g.beginPath(); g.moveTo(cx, sh); armR.forEach((q) => g.lineTo(...q)); g.stroke();
  if (o.R === 'flash') { g.fillStyle = '#3a3a44'; g.save(); g.translate(cx + 140, sh + 18); g.rotate(-0.1); g.fillRect(-14, -16, 56, 32); g.fillStyle = '#fff6c8'; g.fillRect(40, -18, 10, 36); g.restore(); }
  // head
  g.fillStyle = v === 'host' ? '#ffe2c2' : '#f7f5f2'; g.lineWidth = 12; g.beginPath(); g.arc(cx, hc, headR, 0, 7); g.fill(); g.stroke();
  // face
  const lx = (o.look || 0) * 10, ex = cx + lx, ey = hc + 6;
  g.fillStyle = INK;
  if (o.expr === 'shock' || o.expr === 'scared') {
    for (const s of [-1, 1]) { g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(ex + s * 26, ey - 4, 17, 21, 0, 0, 7); g.fill(); g.lineWidth = 5; g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(ex + s * 26 + lx * 0.4, ey - 2, 6, 0, 7); g.fill(); }
    g.beginPath(); g.ellipse(ex, ey + 42, 13, o.expr === 'shock' ? 18 : 6, 0, 0, 7); g.fill();
    if (o.expr === 'scared') { g.fillStyle = '#9fd4ff'; g.beginPath(); g.ellipse(cx + headR - 10, hc - 30, 7, 11, 0, 0, 7); g.fill(); }
  } else {
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(ex + s * 24, ey - 2, 8, 11, 0, 0, 7); g.fill(); }
    g.lineWidth = 6; g.beginPath(); g.moveTo(ex - 16, ey + 36); g.lineTo(ex + 16, ey + 36); g.stroke();
  }
  // host identity: orange cap + round glasses
  if (v === 'host') {
    g.lineWidth = 6; for (const s of [-1, 1]) { g.beginPath(); g.arc(ex + s * 26, ey - 3, 24, 0, 7); g.stroke(); }
    g.beginPath(); g.moveTo(ex - 3, ey - 6); g.lineTo(ex + 3, ey - 6); g.stroke();
    g.fillStyle = '#f07a12'; g.lineWidth = 10; g.beginPath(); g.arc(cx, hc - 10, headR + 2, Math.PI * 1.08, Math.PI * 1.92); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(cx - headR - 6, hc - 30); g.quadraticCurveTo(cx, hc - 44, cx + headR + 34, hc - 34); g.stroke();
  }
  g.restore();
};
