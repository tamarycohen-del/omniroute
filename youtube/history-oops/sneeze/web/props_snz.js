// Sneeze short cards: pressure gauge HUD, sneeze spray, burst word.
const INK = '#241726';
/** round pressure gauge, v 0..1 (needle), label under it */
export const gaugeCard = (p, o = {}) => {
  const g = p.g, v = Math.max(0, Math.min(1, o.v || 0)), cx = 300, cy = 520, R = 220;
  g.save(); g.lineJoin = 'round';
  g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, R + 26, 0, 7); g.fill();
  g.fillStyle = '#fbfaf4'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
  const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
  for (const [s, e, c] of [[0, 0.5, '#5ac85a'], [0.5, 0.78, '#f2c230'], [0.78, 1, '#e8303a']]) { g.strokeStyle = c; g.lineWidth = 34; g.beginPath(); g.arc(cx, cy, R - 40, a0 + (a1 - a0) * s, a0 + (a1 - a0) * e); g.stroke(); }
  g.strokeStyle = INK; g.lineWidth = 6; for (let k = 0; k <= 10; k++) { const a = a0 + (a1 - a0) * k / 10; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R - 70), cy + Math.sin(a) * (R - 70)); g.lineTo(cx + Math.cos(a) * (R - 92), cy + Math.sin(a) * (R - 92)); g.stroke(); }
  const a = a0 + (a1 - a0) * v + (o.shake || 0);
  g.strokeStyle = '#c0202a'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (R - 60), cy + Math.sin(a) * (R - 60)); g.stroke();
  g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 26, 0, 7); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 96px "Arial Black", Impact, sans-serif';
  const t = o.t || ('x' + Math.max(1, Math.round(v * 20)));
  g.strokeStyle = INK; g.lineWidth = 18; g.strokeText(t, cx, cy + R + 90); g.fillStyle = v > 0.78 ? '#ff4a4a' : '#ffffff'; g.fillText(t, cx, cy + R + 90);
  g.font = '800 46px "Arial Black", Impact, sans-serif'; g.lineWidth = 10; g.strokeText('PRESSURE', cx, cy - R - 60); g.fillStyle = '#ffffff'; g.fillText('PRESSURE', cx, cy - R - 60);
  g.restore();
};
/** sneeze spray fanning out to the right, k 0..1 */
export const sprayCard = (p, o = {}) => {
  const g = p.g, k = o.k ?? 1;
  g.save();
  for (let i = 0; i < 60; i++) { const a = -0.55 + ((i * 0.37) % 1) * 1.1, d = 40 + ((i * 0.61) % 1) * 420 * k, r = 6 + (i % 4) * 4;
    const x = 120 + Math.cos(a) * d, y = 500 + Math.sin(a) * d; g.fillStyle = `rgba(190,230,255,${0.85 - 0.5 * d / 460})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = 'rgba(36,23,38,0.35)'; g.lineWidth = 2; g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 10; g.lineCap = 'round';
  for (const a of [-0.35, 0, 0.35]) { g.beginPath(); g.moveTo(140 + Math.cos(a) * 60, 500 + Math.sin(a) * 60); g.lineTo(140 + Math.cos(a) * (120 + 280 * k), 500 + Math.sin(a) * (120 + 280 * k)); g.stroke(); }
  g.restore();
};
export const burstWord = (p, o = {}) => {
  const g = p.g; g.save(); g.translate(300, 500); g.rotate(o.rot ?? -0.1);
  g.fillStyle = o.bg || '#fff2a8'; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath();
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = i % 2 ? 190 : 270; (i ? g.lineTo : g.moveTo).call(g, Math.cos(a) * r * 1.15, Math.sin(a) * r * 0.75); }
  g.closePath(); g.fill(); g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${o.size || 120}px "Arial Black", Impact, sans-serif`; g.lineJoin = 'round';
  g.strokeStyle = INK; g.lineWidth = 20; g.strokeText(o.t, 0, 8); g.fillStyle = o.col || '#e8303a'; g.fillText(o.t, 0, 8); g.restore();
};
