// Cards for "How many times you will ever see them again": number tag, phone video call, math board.
const INK = '#241726';
const font = (g, px, w = 900) => { g.font = `${w} ${px}px "Arial Black", Impact, sans-serif`; };

/** glowing number tag that floats over a head. o: { t: text, col } */
export const tagCard = (p, o = {}) => {
  const g = p.g, t = String(o.t), col = o.col || '#ffd23a';
  g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; font(g, t.length > 3 ? 150 : 190);
  const w = Math.max(220, g.measureText(t).width + 110), h = 230, x = 300 - w / 2, y = 560;
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.ellipse(300, y + h / 2, w / 2 + 40, h / 2 + 40, 0, 0, 7); g.fill();
  g.fillStyle = INK; g.beginPath(); g.roundRect(x - 12, y - 12, w + 24, h + 24, 70); g.fill();
  g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, 60); g.fill();
  g.fillStyle = '#ffffff'; g.globalAlpha = 0.35; g.beginPath(); g.roundRect(x + 20, y + 16, w - 40, 50, 25); g.fill(); g.globalAlpha = 1;
  g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 20; g.strokeText(t, 300, y + h / 2 + 8); g.fillStyle = '#ffffff'; g.fillText(t, 300, y + h / 2 + 8);
  g.beginPath(); g.moveTo(270, y + h + 10); g.lineTo(330, y + h + 10); g.lineTo(300, y + h + 60); g.closePath(); g.fillStyle = INK; g.fill();
  g.restore();
};

/** phone held up, video call with mom. o: { T, mom (outfit), tag: '?' | '288', k: tag pop 0..1, opts } */
export const phoneCard = (p, o = {}) => {
  const g = p.g;
  g.save();
  g.fillStyle = INK; g.beginPath(); g.roundRect(70, 40, 460, 920, 70); g.fill();
  g.fillStyle = '#1e1e28'; g.beginPath(); g.roundRect(88, 58, 424, 884, 56); g.fill();
  g.save(); g.beginPath(); g.roundRect(100, 70, 400, 860, 48); g.clip();
  const sky = g.createLinearGradient(0, 70, 0, 930); sky.addColorStop(0, '#f6d9b8'); sky.addColorStop(1, '#e8b890'); g.fillStyle = sky; g.fillRect(100, 70, 400, 860);
  g.fillStyle = '#c99a70'; g.fillRect(100, 640, 400, 300); // sofa back
  g.fillStyle = '#8a5a3a'; g.fillRect(380, 150, 80, 110); g.fillStyle = '#f2e6c8'; g.fillRect(390, 160, 60, 90); // picture frame
  g.translate(300, 960); g.scale(0.82, 0.82); g.translate(-300, -1000 + 40);
  o.T.romanFront(p, o.mom, o.opts || {});
  g.restore();
  // call UI
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.roundRect(120, 90, 220, 60, 30); g.fill();
  g.fillStyle = '#ffffff'; font(g, 34, 800); g.textBaseline = 'middle'; g.fillText('Mom ❤', 145, 121);
  g.fillStyle = '#e8453a'; g.beginPath(); g.arc(300, 860, 46, 0, 7); g.fill();
  g.strokeStyle = '#ffffff'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(278, 866); g.quadraticCurveTo(300, 846, 322, 866); g.stroke();
  g.restore();
  if (o.tag) { const k = o.k ?? 1; g.save(); g.translate(300, 300); g.scale(0.62 * k, 0.62 * k); g.translate(-300, -680); tagCard(p, { t: o.tag, col: o.tag === '?' ? '#a8a8b8' : '#ff8a5a' }); g.restore(); }
};

/** chalk-style math card. o: { lines: [str], hi: index of highlighted line } */
export const mathCard = (p, o = {}) => {
  const g = p.g, L = o.lines || [];
  g.save();
  g.fillStyle = INK; g.beginPath(); g.roundRect(20, 250, 560, 120 + L.length * 130, 50); g.fill();
  g.fillStyle = '#2f3b5a'; g.beginPath(); g.roundRect(34, 264, 532, 92 + L.length * 130, 40); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  L.forEach((s, i) => { font(g, s.length > 12 ? 60 : 76); g.fillStyle = i === o.hi ? '#ffd23a' : '#ffffff'; g.fillText(s, 300, 340 + i * 130); });
  g.restore();
};

/** small word burst (laugh etc) */
export const wordCard = (p, o = {}) => {
  const g = p.g; g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.translate(300, 500); g.rotate(o.rot || -0.12);
  font(g, o.size || 130); g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 22; g.strokeText(o.t, 0, 0); g.fillStyle = o.col || '#ffffff'; g.fillText(o.t, 0, 0);
  g.restore();
};

/** lawn mower (side view, facing right) */
export const mowerCard = (p) => {
  p.line([[180, 640], [330, 860]], '#3a3a40', 18);
  p.poly([[300, 820], [520, 820], [540, 900], [290, 900]], '#d8402a', 8);
  p.ell(330, 920, 46, 46, '#222', 7); p.ell(500, 920, 46, 46, '#222', 7);
  p.line([[170, 640], [230, 620]], '#222', 22);
};
