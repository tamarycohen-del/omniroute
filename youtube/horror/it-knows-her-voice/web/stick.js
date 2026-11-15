// Stickman characters (original design). Card space 600x1000, feet on y=975.
const INK = '#141018';
/** o: { v: 'classic'|'host'|'chunky', expr: 'neutral'|'scared'|'shock', look, R: arm pose, flash: true } */
export const stickCard = (p, o = {}) => {
  const g = p.g, v = o.v || 'host', cx = 300, sole = 975;
  const headR = v === 'chunky' ? 92 : 78, neckY = v === 'chunky' ? 560 : 590, hipY = 790, hc = neckY - headR + 6;
  const lw = v === 'chunky' ? 16 : 14;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = INK;
  // legs
  g.lineWidth = lw; if (!o.sitting) for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 6, hipY); g.lineTo(cx + s * 52, sole - 8); g.stroke(); }
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
/** bold uppercase caption, one highlighted word (lime). o: { words: [..], hi: index } */
export const capCard = (p, o = {}) => {
  const g = p.g, ws = o.words || [], hi = o.hi ?? -1; g.save(); g.textBaseline = 'middle'; g.textAlign = 'left'; g.font = '900 52px "Inter Display Black", "DejaVu Sans", sans-serif';
  const sp = 16, lines = [[]]; let lw = 0;
  ws.forEach((w, i) => { const wd = g.measureText(w).width; if (lw + wd > 540 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(i); lw += wd + sp; });
  g.lineJoin = 'round';
  lines.forEach((L, li) => { const widths = L.map((i) => g.measureText(ws[i]).width), total = widths.reduce((a, b) => a + b, 0) + sp * (L.length - 1); let x = 300 - total / 2; const y = 500 + (li - (lines.length - 1) / 2) * 64;
    L.forEach((i, j) => { g.lineWidth = 12; g.strokeStyle = '#0a0610'; g.strokeText(ws[i], x, y); g.fillStyle = i === hi ? '#c6ff3a' : (o.color || '#ffffff'); g.fillText(ws[i], x, y); x += widths[j] + sp; }); });
  g.restore();
};
/** chapter label: red digital time + small caps title */
export const chapterCard = (p, o = {}) => {
  const g = p.g; g.save(); g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  g.fillStyle = '#ff2a3a'; g.shadowColor = '#ff2a3a'; g.shadowBlur = 16; g.font = '700 92px "DejaVu Sans Mono", monospace'; const tw = g.measureText(o.time || '3:33').width; g.fillText(o.time || '3:33', 40, 860);
  g.shadowBlur = 0; g.font = '700 30px "DejaVu Sans Mono", monospace'; g.fillText('AM', 50 + tw, 860);
  g.fillRect(40, 880, 300, 3); g.fillStyle = '#ece6f6'; g.font = '800 34px "DejaVu Sans", sans-serif'; g.fillText(o.title || 'NIGHT ONE', 40, 926);
  if (o.sub) { g.fillStyle = 'rgba(216,208,232,0.75)'; g.font = '600 20px "DejaVu Sans", sans-serif'; g.fillText(o.sub.split('').join(' '), 42, 960); }
  g.restore();
};
/** white stickman (thick white limbs with dark outline), original design with a beanie.
 *  o: { beanie: '#2a2a36' | '#f2f0ec', expr: 'neutral'|'worried'|'scared'|'shock', look, arm: 'hang'|'reach'|'flash' } */
export const whiteStick = (p, o = {}) => {
  const g = p.g, cx = 300, sole = 975, hipY = 760, neckY = 560, headR = 70, hc = neckY - headR + 4;
  const O = '#121018', Wc = '#f4f2ee', ow = 30, iw = 18;
  const limb = (pts) => { for (const [w, c] of [[ow, O], [iw, Wc]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); } };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const step = o.step || 0;
  limb([[cx - 4, hipY], [cx - 26 - 18 * step, 870], [cx - 38 - 30 * step, sole - 10]]);
  limb([[cx + 4, hipY], [cx + 22 + 14 * step, 870], [cx + 30 + 26 * step, sole - 10]]);
  limb([[cx, neckY + 6], [cx + 2, hipY]]);
  const sh = neckY + 44;
  limb([[cx, sh], [cx - 46, sh + 90], [cx - 52, sh + 170]]);
  if (o.arm === 'reach' || o.arm === 'flash') limb([[cx, sh], [cx + 70, sh + 40], [cx + 140, sh + 30]]);
  else limb([[cx, sh], [cx + 46, sh + 90], [cx + 52, sh + 170]]);
  if (o.arm === 'flash') { g.save(); g.translate(cx + 150, sh + 28); g.rotate(-0.08); g.fillStyle = '#2a2a32'; g.strokeStyle = O; g.lineWidth = 6; g.beginPath(); g.roundRect(-10, -16, 64, 32, 6); g.fill(); g.stroke(); g.fillStyle = '#fff2b0'; g.fillRect(52, -18, 10, 36); g.restore(); }
  // head
  g.fillStyle = Wc; g.strokeStyle = O; g.lineWidth = 9; g.beginPath(); g.arc(cx, hc, headR, 0, 7); g.fill(); g.stroke();
  g.fillStyle = 'rgba(0,0,0,0.06)'; g.beginPath(); g.arc(cx + 18, hc + 14, headR - 14, 0, 7); g.fill();
  // face
  const lx = (o.look || 0) * 12, ex = cx + 8 + lx, ey = hc + 8 - (o.lookY || 0) * 16, e = o.expr || 'neutral';
  g.fillStyle = O; g.strokeStyle = O;
  const big = e === 'scared' || e === 'shock';
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(ex + s * 22, ey, big ? 9 : 7, big ? 12 : 9, 0, 0, 7); g.fill(); }
  g.lineWidth = 7; // brows
  const by = ey - 26, tilt = e === 'neutral' ? -4 : e === 'worried' ? 10 : 14;
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(ex + s * 10, by - (s > 0 ? 0 : 0) + (e === 'neutral' ? 4 : -tilt * 0.4)); g.lineTo(ex + s * 34, by + (e === 'neutral' ? -2 : tilt * 0.6)); g.stroke(); }
  g.lineWidth = 6;
  if (e === 'shock') { g.beginPath(); g.ellipse(ex, ey + 32, 9, 13, 0, 0, 7); g.fill(); }
  else if (e === 'scared') { g.beginPath(); g.moveTo(ex - 14, ey + 34); g.quadraticCurveTo(ex, ey + 26, ex + 14, ey + 34); g.stroke(); g.fillStyle = '#9fd4ff'; g.beginPath(); g.ellipse(cx - headR + 12, hc - 18, 6, 10, 0, 0, 7); g.fill(); }
  else if (e === 'worried') { g.beginPath(); g.moveTo(ex - 12, ey + 32); g.lineTo(ex + 12, ey + 30); g.stroke(); }
  else { g.beginPath(); g.moveTo(ex - 10, ey + 30); g.lineTo(ex + 12, ey + 30); g.stroke(); }
  // beanie: dome + folded cuff + small fold lines
  const bc = o.beanie || '#2a2a36', dark = bc === '#f2f0ec' ? '#cfcac2' : '#1a1a22';
  g.fillStyle = bc; g.strokeStyle = O; g.lineWidth = 8;
  g.beginPath(); g.moveTo(cx - headR - 4, hc - 18); g.bezierCurveTo(cx - headR + 4, hc - headR - 46, cx + headR - 4, hc - headR - 46, cx + headR + 4, hc - 18); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.roundRect(cx - headR - 10, hc - 34, 2 * headR + 20, 30, 12); g.fillStyle = bc; g.fill(); g.stroke();
  g.strokeStyle = dark; g.lineWidth = 4; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(cx + k * 18, hc - 30); g.lineTo(cx + k * 18, hc - 8); g.stroke(); }
  g.restore();
};
