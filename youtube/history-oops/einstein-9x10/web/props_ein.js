// Cards for the Einstein 9 x 10 short: an original cartoon professor (wild white hair), chalkboard, NO PROOF stamp.
const INK = '#241726';
export const PROF = { tunic: '#7a5a3a', skin: '#f3d2b4', moustache: '#ececec', brows: '#ececec', stout: true };

/** professor = romanFront + a cloud of wild white hair around the head */
export const profCard = (p, T, o = {}) => {
  const seed = o.seed ?? 6, hc = T.headCenter(seed);
  const g = p.g, tufts = [[-128, -10, 34], [-138, 34, 28], [-112, -62, 34], [-62, -112, 34], [0, -128, 36], [62, -112, 34], [112, -62, 34], [138, 34, 28], [128, -10, 34]];
  for (const [dx, dy, r] of tufts) p.ell(300 + dx, hc + dy, r + 6, r, '#f4f4f4', 7);
  T.romanFront(p, PROF, { seed, ...o });
  // a few hair flicks over the top of the head
};

/** chalk text on a green board, rows appear one by one. o: { rows: n shown, red: bool on last row, w, h } */
export const boardDraw = (g, W, H, rows, redLast, stamp) => {
  g.fillStyle = '#2c4a3a'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % W, (i * 53) % H, 160, 40);
  g.font = '700 78px "Comic Sans MS", "Chalkboard", sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left';
  const L = ['9 × 1 = 9', '9 × 2 = 18', '9 × 3 = 27', '9 × 4 = 36', '9 × 5 = 45', '9 × 6 = 54', '9 × 7 = 63', '9 × 8 = 72', '9 × 9 = 81', '9 × 10 = 91'];
  for (let i = 0; i < Math.min(rows, 10); i++) {
    const x = 110, y = 70 + i * ((H - 120) / 9.2);
    const bad = i === 9 && redLast;
    g.fillStyle = bad ? '#ff6a5a' : '#f4f2ea'; g.fillText(L[i], x, y);
    if (bad) { g.strokeStyle = '#ff6a5a'; g.lineWidth = 8; g.beginPath(); g.ellipse(x + 400, y, 90, 56, -0.05, 0, 7); g.stroke(); }
  }
  if (stamp > 0) { g.save(); g.translate(W / 2, H / 2); g.rotate(-0.18); g.scale(stamp, stamp); g.globalAlpha = Math.min(1, stamp);
    g.strokeStyle = '#e8302a'; g.lineWidth = 18; g.strokeRect(-310, -90, 620, 180);
    g.font = '900 118px "Arial Black", Impact, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#e8302a'; g.fillText('NO PROOF', 0, 8); g.restore(); }
};

export const wordCard = (p, o = {}) => {
  const g = p.g; g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.translate(300, 500); g.rotate(o.rot || -0.12);
  g.font = `900 ${o.size || 130}px "Arial Black", Impact, sans-serif`; g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 22; g.strokeText(o.t, 0, 0); g.fillStyle = o.col || '#ffffff'; g.fillText(o.t, 0, 0);
  g.restore();
};

/** big "9 / 1" tally card for the ending */
export const tallyCard = (p, o = {}) => {
  const g = p.g; g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.font = '900 120px "Arial Black", Impact, sans-serif'; g.strokeStyle = INK; g.lineWidth = 22;
  g.strokeText('9 RIGHT', 300, 380); g.fillStyle = '#7ad85a'; g.fillText('9 RIGHT', 300, 380);
  g.font = '900 96px "Arial Black", Impact, sans-serif'; g.lineWidth = 18; g.globalAlpha = o.dim ? 0.45 : 1;
  g.strokeText('1 WRONG', 300, 620); g.fillStyle = '#ff6a5a'; g.fillText('1 WRONG', 300, 620);
  g.restore();
};
