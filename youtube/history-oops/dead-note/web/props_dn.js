// "The notebook" short: page painter (canvas texture), ghost with halo, drill, speech bubble, rain overlay.
const INK = '#241726';
const hand = (g, px, w = 700) => { g.font = `${w} ${px}px "Comic Sans MS", "Chalkboard", "Marker Felt", sans-serif`; };
/** paint the open notebook spread (1024x700). st: { page, n, write, turn } */
export const paintPages = (g, st) => {
  const W = 1024, H = 700;
  g.fillStyle = '#efe6d2'; g.fillRect(0, 0, W, H);
  const sh = g.createLinearGradient(W / 2 - 60, 0, W / 2 + 60, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.5, 'rgba(60,40,20,0.35)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(W / 2 - 60, 0, 120, H);
  g.strokeStyle = 'rgba(120,140,190,0.35)'; g.lineWidth = 2; for (let y = 90; y < H; y += 46) { g.beginPath(); g.moveTo(30, y); g.lineTo(W / 2 - 30, y); g.moveTo(W / 2 + 30, y); g.lineTo(W - 30, y); g.stroke(); }
  g.strokeStyle = 'rgba(200,60,60,0.45)'; for (const x of [80, W / 2 + 80]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  g.textBaseline = 'middle';
  const p = st.page || 'rule';
  if (p === 'rule') {
    g.textAlign = 'center'; hand(g, 64, 900); g.shadowColor = 'rgba(255,40,40,0.7)'; g.shadowBlur = 24 * (st.glow ?? 1); g.fillStyle = '#9a0e18';
    g.fillText('WRITE A NAME.', W * 0.75, 300); g.fillText('THEY DIE.', W * 0.75, 400); g.shadowBlur = 0;
    hand(g, 30); g.fillStyle = 'rgba(40,30,30,0.5)'; g.fillText('rule no. 1', W * 0.25, 120);
  } else if (p === 'list' || p === 'his') {
    const L = ['the neighbor (7am drill)', 'the movie spoiler guy', 'the seat-kicking kid', 'my boss'];
    g.textAlign = 'left'; hand(g, 34);
    const n = st.n ?? 0, w = st.write ?? 1;
    for (let i = 0; i < Math.min(n, 4); i++) {
      const s = i === n - 1 ? L[i].slice(0, Math.ceil(L[i].length * w)) : L[i];
      g.fillStyle = '#1a1830'; g.fillText((i + 1) + '. ' + s, 100, 136 + i * 92);
      if (i < n - 1 || w >= 1) { g.strokeStyle = 'rgba(160,20,30,0.75)'; g.lineWidth = 5; g.beginPath(); g.moveTo(130, 140 + i * 92); g.lineTo(130 + g.measureText((i + 1) + '. ' + L[i]).width - 30, 132 + i * 92); g.stroke(); }
    }
    if (p === 'his') { // someone else's handwriting + a sketch of our host
      const k = st.reveal ?? 1; g.save(); g.globalAlpha = k; g.translate(W * 0.75, 340); g.rotate(-0.06);
      g.textAlign = 'center'; g.font = 'italic 900 40px Georgia, serif'; g.fillStyle = '#5a0a12'; g.fillText('next:', 0, -200);
      g.strokeStyle = '#2a1018'; g.lineWidth = 7; g.lineCap = 'round';
      g.beginPath(); g.arc(0, 20, 110, 0, 7); g.stroke();                                  // head
      g.fillStyle = 'rgba(240,122,18,0.85)'; g.beginPath(); g.arc(0, -10, 112, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); g.fill(); g.stroke(); // cap
      g.beginPath(); g.moveTo(-130, -30); g.quadraticCurveTo(0, -55, 130, -30); g.stroke();   // brim
      for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 42, 25, 30, 0, 7); g.stroke(); g.beginPath(); g.arc(s * 42, 25, 6, 0, 7); g.fillStyle = '#2a1018'; g.fill(); }
      g.beginPath(); g.moveTo(-12, 25); g.lineTo(12, 25); g.stroke(); g.beginPath(); g.arc(0, 75, 28, 0.2, Math.PI - 0.2); g.stroke();
      g.strokeStyle = 'rgba(200,20,30,0.85)'; g.lineWidth = 9; g.beginPath(); g.ellipse(0, 20, 170, 160, 0.1, 0, 7); g.stroke();
      g.restore();
    }
  } else if (p === 'blank') {
    g.textAlign = 'center'; hand(g, 38, 700); g.fillStyle = 'rgba(30,25,40,0.6)'; g.fillText('1. _______________', W * 0.75, 470);
    const k = st.cta ?? 1; g.save(); g.globalAlpha = k; g.translate(W * 0.75, 250); g.rotate(-0.05); hand(g, 66, 900); g.fillStyle = '#b01020';
    g.fillText('What would', 0, -45); g.fillText('YOU do?', 0, 45); g.restore();
    g.save(); g.globalAlpha = 0.6; hand(g, 30); g.textAlign = 'center'; g.fillStyle = '#2a2030'; g.fillText('(comments below)', W * 0.25, 360); g.restore();
  }
  if (st.turn) { // page turning: a lighter page sweeping over the right half
    const k = st.turn, x = W / 2 + (W / 2) * (1 - k); g.fillStyle = '#f6efde'; g.fillRect(W / 2, 0, (W / 2) * k * 0.9, H);
    const gr = g.createLinearGradient(x - 40, 0, x + 20, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.25)'); g.fillStyle = gr; g.fillRect(x - 40, 0, 60, H);
  }
};
/** little ghost with a halo floating up */
export const ghostCard = (p, o = {}) => {
  const g = p.g, k = o.k ?? 1; g.save(); g.globalAlpha = 0.9 * Math.min(1, k * 2);
  const y = 620 - 120 * k, wob = Math.sin((o.t || 0) * 0.3) * 10;
  g.fillStyle = '#ffffff'; g.strokeStyle = INK; g.lineWidth = 12; g.beginPath();
  g.moveTo(200, y + 140); g.quadraticCurveTo(190 + wob, y - 120, 300, y - 130); g.quadraticCurveTo(410 + wob, y - 120, 400, y + 140);
  for (let i = 0; i < 4; i++) g.quadraticCurveTo(375 - i * 50, y + 175 * (i % 2 ? 1 : 0.85), 350 - i * 50, y + 140);
  g.closePath(); g.fill(); g.stroke();
  for (const s of [-1, 1]) { g.fillStyle = INK; g.beginPath(); g.ellipse(300 + s * 38, y - 30, 12, 18, 0, 0, 7); g.fill(); }
  g.beginPath(); g.ellipse(300, y + 20, 16, 10, 0, 0, 7); g.fill();
  g.strokeStyle = '#f2c230'; g.lineWidth = 14; g.beginPath(); g.ellipse(300, y - 175, 80, 20, 0, 0, 7); g.stroke();
  g.restore();
};
export const drillCard = (p) => {
  p.poly([[180, 470], [400, 470], [400, 540], [180, 540]], '#e8c030', 10);
  p.poly([[230, 540], [300, 540], [290, 680], [240, 680]], '#2a2a30', 10);
  p.poly([[400, 485], [520, 495], [520, 515], [400, 525]], '#a8b0b8', 8);
};
export const bubbleCard = (p, o = {}) => {
  const g = p.g; g.save(); g.fillStyle = '#ffffff'; g.strokeStyle = INK; g.lineWidth = 12;
  g.beginPath(); g.roundRect(60, 300, 480, 230, 60); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(220, 525); g.lineTo(170, 640); g.lineTo(300, 525); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#ffffff'; g.fillRect(222, 515, 74, 16);
  g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${o.size || 54}px "Arial Black", Impact, sans-serif`;
  const lines = (o.t || '').split('\n'); lines.forEach((s, i) => g.fillText(s, 300, 415 + (i - (lines.length - 1) / 2) * 66)); g.restore();
};
/** rain streaks overlay (put right in front of the camera) */
export const rainCard = (p, o = {}) => {
  const g = p.g, t = o.t || 0; g.save(); g.strokeStyle = 'rgba(200,215,240,0.55)'; g.lineWidth = 3; g.lineCap = 'round';
  for (let i = 0; i < 90; i++) { const x = (i * 137 + t * 9) % 640 - 20, y = (i * 211 + t * 61) % 1060 - 40; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y + 46); g.stroke(); }
  g.restore();
};
