// Nursery cards: swaddled babies (original design), in the channel's ink style.
const INK = '#241726';
const COLS = ['#9fd0f0', '#f6b0c8', '#fff0a8', '#b8e8c0'];
/** swaddled baby peeking over the crib rail. o: { i: index, t: frame for little wiggles, awake } */
export const babyCard = (p, o = {}) => {
  const g = p.g, i = o.i || 0, col = COLS[i % 4], t = o.t || 0, wig = Math.sin(t * 0.15 + i) * 6;
  // swaddle
  p.ell(300 + wig * 0.3, 820, 150, 170, col, 14);
  g.save(); g.globalAlpha = 0.25; p.ell(250, 760, 40, 90, '#ffffff', 0); g.restore();
  p.stroke([[190, 760], [300, 820], [410, 760]], 8, 'rgba(36,23,38,0.45)');
  // head
  const hx = 300 + wig * 0.5, hy = 600;
  p.ell(hx, hy, 118, 112, '#ffd9bc', 14);
  // beanie
  p.ell(hx, hy - 70, 112, 62, col, 12, 180, 360);
  p.dot(hx, hy - 138, 20, '#ffffff');
  // face
  const awake = o.awake ?? (i % 3 !== 1);
  if (awake) { for (const s of [-1, 1]) { p.ell(hx + s * 38, hy + 4, 13, 17, INK, 0); p.dot(hx + s * 38 - 4, hy - 3, 5, '#ffffff'); } }
  else for (const s of [-1, 1]) p.arc(hx + s * 38, hy + 4, 16, 9, 200, 340, 8);
  for (const s of [-1, 1]) { const gr = g.createRadialGradient(hx + s * 62, hy + 36, 0, hx + s * 62, hy + 36, 28); gr.addColorStop(0, 'rgba(255,120,130,0.5)'); gr.addColorStop(1, 'rgba(255,120,130,0)'); g.fillStyle = gr; g.fillRect(hx + s * 62 - 30, hy + 6, 60, 60); }
  if (i % 4 === 2) { p.ell(hx, hy + 52, 26, 18, '#7ad0f0', 7); p.dot(hx, hy + 52, 8, '#ffffff'); } // pacifier
  else p.arc(hx, hy + 42, 18, 12, 20, 160, 7);
};
/** big HUD number */
export const bigNum = (p, o = {}) => {
  const g = p.g; g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.translate(300, 500); g.rotate(o.rot || -0.08);
  g.font = `900 ${o.size || 300}px "Arial Black", Impact, sans-serif`; g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 34; g.strokeText(o.t, 0, 0); g.fillStyle = o.col || '#ff6a8a'; g.fillText(o.t, 0, 0); g.restore();
};
