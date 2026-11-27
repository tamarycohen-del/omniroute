// 2D cards for "What If Gravity Turned Off": cat, fish, sandwich, coffee cup, countdown number, Zzz.
// All drawn on the 600x1000 card canvas (sole at y = 975 for things that stand).
const INK = '#241726';

/** orange tabby cat, side view facing right. o: { pose: 'stand'|'float'|'land', expr: 'calm'|'shock'|'smug' } */
export const catCard = (p, o = {}) => {
  const { pose = 'stand', expr = 'calm' } = o;
  const FUR = '#f0a050', DARK = '#c8742e';
  const fl = pose === 'float';
  const by = fl ? 640 : 800, bx = 290;
  // legs
  const legs = fl ? [[200, 30], [240, -20], [350, 30], [390, -20]] : [[210, 0], [250, 0], [340, 0], [380, 0]];
  for (const [x, a] of legs) p.line([[x, by + 50], [x + a, fl ? by + 170 : 960]], FUR, 30);
  // tail
  p.line(fl ? [[bx - 130, by], [bx - 220, by - 60], [bx - 200, by - 160]] : [[bx - 130, by - 10], [bx - 200, by - 120], [bx - 170, by - 220]], FUR, 26);
  // body
  p.ell(bx, by, 150, 80, FUR, 7);
  for (let i = 0; i < 4; i++) p.stroke([[bx - 90 + i * 45, by - 75], [bx - 70 + i * 45, by - 25]], 10, DARK);
  // head
  const hx = bx + 160, hy = by - 100;
  p.poly([[hx - 60, hy - 30], [hx - 50, hy - 110], [hx - 10, hy - 50]], FUR, 7);
  p.poly([[hx + 10, hy - 50], [hx + 45, hy - 110], [hx + 60, hy - 30]], FUR, 7);
  p.ell(hx, hy, 80, 66, FUR, 7);
  // face
  if (expr === 'shock') { p.ell(hx - 25, hy - 8, 20, 24, '#ffffff', 5); p.ell(hx + 25, hy - 8, 20, 24, '#ffffff', 5); p.dot(hx - 22, hy - 6, 7); p.dot(hx + 28, hy - 6, 7); p.ell(hx, hy + 35, 12, 16, '#5a2a2a', 4); }
  else if (expr === 'smug') { p.stroke([[hx - 40, hy - 8], [hx - 10, hy - 12]], 8); p.stroke([[hx + 10, hy - 12], [hx + 40, hy - 8]], 8); p.stroke([[hx - 16, hy + 26], [hx, hy + 34], [hx + 16, hy + 26]], 6); }
  else { p.dot(hx - 25, hy - 6, 9); p.dot(hx + 25, hy - 6, 9); p.stroke([[hx - 14, hy + 24], [hx, hy + 32], [hx + 14, hy + 24]], 6); }
  p.poly([[hx - 8, hy + 10], [hx + 8, hy + 10], [hx, hy + 20]], '#e86a7a', 3);
  for (const s of [-1, 1]) for (const k of [-1, 1]) p.stroke([[hx + s * 30, hy + 18 + k * 6], [hx + s * 90, hy + 10 + k * 16]], 3);
};

/** cartoon fish facing right. o: { col, look: -1..1, confused } */
export const fishCard = (p, o = {}) => {
  const { col = '#f2a03a', look = 0, confused = false } = o;
  p.poly([[180, 500], [90, 420], [110, 500], [90, 580]], col, 9);
  p.ell(310, 500, 150, 90, col, 9);
  p.poly([[280, 420], [340, 360], [370, 425]], col, 7);
  p.ell(380, 480, 30, 30, '#ffffff', 6); p.dot(384 + look * 12, 482, 11);
  if (confused) { p.stroke([[350, 440], [395, 432]], 6); p.g.font = 'bold 110px sans-serif'; p.g.fillStyle = '#ffffff'; p.g.strokeStyle = INK; p.g.lineWidth = 10; p.g.strokeText('?', 370, 360); p.g.fillText('?', 370, 360); }
  p.stroke([[430, 520], [450, 530]], 6);
};

/** sandwich (side view) */
export const sandwichCard = (p, o = {}) => {
  const bite = o.bite || 0;
  const g = p.g; g.save();
  p.poly([[170, 560], [430, 560], [440, 600], [160, 600]], '#e8b26a', 7);
  p.poly([[165, 540], [435, 540], [450, 562], [150, 562]], '#6fbf4a', 6);
  p.poly([[175, 520], [425, 520], [430, 545], [170, 545]], '#e85a4a', 6);
  p.poly([[170, 500], [430, 500], [436, 524], [164, 524]], '#f2d24a', 6);
  p.poly([[160, 500], [180, 440], [300, 420], [420, 440], [440, 500]], '#e8b26a', 7);
  if (bite) p.ell(440, 500, 40 * bite, 60 * bite, 'rgba(0,0,0,0)', 0);
  g.restore();
};

/** coffee cup with a floating blob of coffee above it */
export const cupCard = (p, o = {}) => {
  const k = o.blob || 0;
  p.poly([[230, 640], [370, 640], [355, 820], [245, 820]], '#ffffff', 8);
  p.arc(385, 720, 40, 50, -90, 90, 14, INK); p.arc(385, 720, 40, 50, -90, 90, 7, '#ffffff');
  p.poly([[240, 650], [360, 650], [356, 690], [244, 690]], '#ffffff', 0);
  p.ell(300, 648, 66, 12, '#6a3a1e', 4);
  if (k > 0) { p.ell(300, 600 - 220 * k, 50 + 10 * Math.sin(k * 9), 42 - 8 * Math.sin(k * 9), '#6a3a1e', 6); p.ell(285, 590 - 220 * k, 12, 8, '#a8704a', 0); for (let i = 0; i < 3; i++) p.dot(250 + i * 50, 520 - 300 * k - i * 25, 9, '#6a3a1e'); }
};

/** big countdown number (HUD) */
export const countCard = (p, o = {}) => {
  const g = p.g; g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `900 ${o.size || 520}px "Arial Black", Impact, sans-serif`;
  g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 46; g.strokeText(o.t, 300, 520);
  g.fillStyle = o.col || '#ffd23a'; g.fillText(o.t, 300, 520);
  if (o.sub) { g.font = '900 96px "Arial Black", Impact, sans-serif'; g.lineWidth = 18; g.strokeText(o.sub, 300, 860); g.fillStyle = '#ffffff'; g.fillText(o.sub, 300, 860); }
  g.restore();
};

/** honk / bang text burst */
export const wordCard = (p, o = {}) => {
  const g = p.g; g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.translate(300, 500); g.rotate(o.rot || -0.15);
  g.font = `900 ${o.size || 150}px "Arial Black", Impact, sans-serif`; g.lineJoin = 'round';
  g.strokeStyle = INK; g.lineWidth = 22; g.strokeText(o.t, 0, 0); g.fillStyle = o.col || '#ffffff'; g.fillText(o.t, 0, 0);
  g.restore();
};

/** space-station astronaut (white suit, round visor), front view */
export const astronautCard = (p, o = {}) => {
  const { expr = 'relief', wave = false } = o;
  const S = '#f2f2f2', SH = '#c9d2dc';
  for (const x of [250, 350]) p.line([[x, 760], [x, 960]], S, 56);
  for (const x of [250, 350]) p.ell(x, 965, 40, 18, SH, 6);
  p.poly([[200, 480], [400, 480], [420, 780], [180, 780]], S, 8);
  p.poly([[240, 560], [360, 560], [360, 640], [240, 640]], '#5a8ac8', 6);
  p.line([[200, 500], [150, 640], [170, 740]], S, 50);
  if (wave) p.line([[400, 500], [470, 400], [500, 300]], S, 50); else p.line([[400, 500], [450, 640], [430, 740]], S, 50);
  p.ell(300, 360, 140, 130, S, 8);
  p.ell(300, 370, 100, 85, '#f5c9a0', 6);
  if (expr === 'relief') { p.stroke([[255, 360], [285, 352]], 7); p.stroke([[315, 352], [345, 360]], 7); p.arc(300, 400, 30, 16, 20, 160, 7); }
  else { p.dot(268, 360, 9); p.dot(332, 360, 9); p.arc(300, 398, 26, 14, 20, 160, 7); }
  p.ell(300, 370, 104, 90, 'rgba(160,200,255,0.18)', 7);
};

export const zzzCard = (p, o = {}) => {
  const g = p.g, k = o.k || 0; g.save(); g.textAlign = 'center'; g.font = '900 120px "Arial Black", sans-serif'; g.lineJoin = 'round';
  for (let i = 0; i < 3; i++) { const t = (k + i / 3) % 1; g.globalAlpha = Math.sin(t * Math.PI); g.lineWidth = 14; g.strokeStyle = INK; g.fillStyle = '#ffffff';
    const x = 260 + t * 120, y = 760 - t * 520, s = 0.6 + t * 0.6; g.save(); g.translate(x, y); g.scale(s, s); g.strokeText('Z', 0, 0); g.fillText('Z', 0, 0); g.restore(); }
  g.restore();
};
