// The skinwalker that has been wearing Mrs. Hale: our own design, same flat style as hale.js / mom.js.
// skinwalker(g, o) draws in a 600 x 1000 card (cx 300, ground at 975).
// o: { pose: 'crouch' (on all fours) | 'stand' (hunched, too tall), t, eyes (0..1 glow), mouth (0..1 open),
//      smile (0..1 how far the mouth stretches past the face), cardigan (rags of Mrs. Hale's purple cardigan),
//      phone (holds Mom's phone in the front hand), reach (0..1 front arm stretched forward), look (-1..1) }
const O = '#121018', SKIN = '#e9e6ee', SKIN_D = '#c9c4d4', SHADOW = 'rgba(80,70,110,0.28)', RAG = '#6a4a8a', RAG_D = '#4a3266';

const limb = (g, pts, w1 = 30, w2 = 18, col = SKIN) => { for (const [w, c] of [[w1, O], [w2, col]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); } };
const claw = (g, x, y, dir = 1, s = 1) => { g.strokeStyle = O; g.lineWidth = 7 * s; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + dir * 18 * s, y + 6 * s + k * 10 * s, x + dir * 34 * s, y + 4 * s + k * 16 * s); g.stroke(); } };

export const skinwalker = (g, o = {}) => {
  const t = o.t || 0, pose = o.pose || 'crouch', eyes = o.eyes ?? 1, mouth = o.mouth ?? 0.5, smile = o.smile ?? 0.7, look = o.look || 0;
  const br = Math.sin(t * 2.2) * 6; // slow, heavy breathing
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  // ground shadow
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(300, 978, 230, 18, 0, 0, 7); g.fill();
  let head, shoulder, hip, frontHand;
  const spine = (pts, w) => { for (const [lw, c] of [[w + 18, O], [w, SKIN]]) { g.strokeStyle = c; g.lineWidth = lw; g.beginPath(); g.moveTo(...pts[0]); g.bezierCurveTo(...pts[1], ...pts[2], ...pts[3]); g.stroke(); } };
  const ribs = (cx, cy, n, dx, ang) => { g.strokeStyle = SHADOW; g.lineWidth = 5; for (let k = 0; k < n; k++) { g.beginPath(); g.arc(cx + k * dx, cy + Math.abs(k - n / 2) * 5, 22, ang, ang + 1.3); g.stroke(); } };
  if (pose === 'crouch') {
    // spider-like: hips high, knees bent backward and sticking up above the back
    hip = [440, 560 + br * 0.3]; shoulder = [230, 600 + br]; head = [140 + look * 10, 640 + br];
    limb(g, [[hip[0] - 10, hip[1]], [hip[0] + 70, hip[1] - 120], [hip[0] + 120, hip[1] + 150], [hip[0] + 90, 972]], 30, 18, SKIN_D);
    limb(g, [[hip[0] + 10, hip[1]], [hip[0] + 30, hip[1] - 150], [hip[0] + 40, hip[1] + 160], [hip[0], 972]], 30, 18);
    // thin, over-arched spine
    spine([[hip[0] + 10, hip[1] + 10], [hip[0] - 20, hip[1] - 170], [shoulder[0] + 60, shoulder[1] - 200], [shoulder[0], shoulder[1]]], 64);
    g.fillStyle = SHADOW; for (let k = 0; k < 6; k++) { const u = k / 6, x = lerp(hip[0] - 10, shoulder[0] + 30, u), y = shoulder[1] - 150 - Math.sin(u * Math.PI) * 30 + (1 - u) * 40; g.beginPath(); g.arc(x, y - 18, 9, 0, 7); g.fill(); } // vertebrae
    ribs(shoulder[0] + 50, shoulder[1] - 60, 4, 30, 0.3);
    const reach = o.reach || 0;
    // far arm: elbow out, hand on the ground
    limb(g, [[shoulder[0] + 10, shoulder[1]], [shoulder[0] + 40, shoulder[1] + 180], [shoulder[0] - 10, 968]], 26, 15, SKIN_D);
    claw(g, shoulder[0] - 10, 968, -1);
    frontHand = [shoulder[0] - 90 - 230 * reach, lerp(968, shoulder[1] + 60, reach)];
    limb(g, [[shoulder[0] - 10, shoulder[1] + 10], [shoulder[0] - 30 - 60 * reach, shoulder[1] + 200 - 120 * reach], frontHand], 26, 15);
    claw(g, frontHand[0], frontHand[1], -1);
  } else { // stand: far too tall, bent forward, arms hanging past the knees
    hip = [330, 560]; shoulder = [230, 250 + br]; head = [150 + look * 10, 270 + br];
    limb(g, [[hip[0] - 10, hip[1]], [hip[0] + 40, hip[1] + 190], [hip[0] - 20, 970]], 30, 18, SKIN_D);
    limb(g, [[hip[0] + 10, hip[1]], [hip[0] + 80, hip[1] + 200], [hip[0] + 40, 972]], 30, 18);
    spine([[hip[0], hip[1] + 20], [hip[0] + 30, hip[1] - 160], [shoulder[0] + 140, shoulder[1] - 40], [shoulder[0], shoulder[1]]], 60);
    ribs(shoulder[0] + 70, shoulder[1] + 40, 4, 22, 0.2);
    limb(g, [[shoulder[0] + 20, shoulder[1]], [shoulder[0] + 60, shoulder[1] + 320], [shoulder[0] + 40, 820]], 24, 14, SKIN_D);
    frontHand = [shoulder[0] - 50 - 150 * (o.reach || 0), 830 - 300 * (o.reach || 0)];
    limb(g, [[shoulder[0] - 10, shoulder[1] + 10], [shoulder[0] - 30, shoulder[1] + 300], frontHand], 24, 14);
    claw(g, shoulder[0] + 40, 820, 1); claw(g, frontHand[0], frontHand[1], -1);
  }
  // rags of Mrs. Hale's cardigan hanging off the shoulders
  if (o.cardigan !== false) { g.fillStyle = RAG; g.strokeStyle = O; g.lineWidth = 6;
    const [sx, sy] = shoulder; g.beginPath(); g.moveTo(sx - 60, sy - 40); g.lineTo(sx + 90, sy - 70); g.lineTo(sx + 70, sy + 30); g.lineTo(sx + 50, sy + 5); g.lineTo(sx + 30, sy + 60); g.lineTo(sx + 5, sy + 15); g.lineTo(sx - 25, sy + 70); g.lineTo(sx - 40, sy + 10); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = RAG_D; for (const [bx, by] of [[sx + 20, sy - 30], [sx - 10, sy - 18]]) { g.beginPath(); g.arc(bx, by, 7, 0, 7); g.fill(); } }
  // neck + head: small, bald, smooth, tilted
  const [hx, hy] = head; limb(g, [[shoulder[0] - 10, shoulder[1] - 10], [hx + 20, hy + 40]], 34, 22);
  g.save(); g.translate(hx, hy); g.rotate(-0.18 + look * 0.1);
  g.fillStyle = SKIN; g.strokeStyle = O; g.lineWidth = 9; g.beginPath(); g.ellipse(0, 0, 58, 76, 0, 0, 7); g.fill(); g.stroke();
  g.fillStyle = SHADOW; g.beginPath(); g.ellipse(-26, 4, 22, 28, 0, 0, 7); g.ellipse(26, 4, 22, 28, 0, 0, 7); g.fill(); // sunken sockets
  // glowing white eyes
  g.save(); g.shadowColor = `rgba(255,255,255,${0.95 * eyes})`; g.shadowBlur = 40 * eyes; g.fillStyle = `rgba(250,250,255,${0.25 + 0.75 * eyes})`;
  for (const ex of [-26, 26]) { g.beginPath(); g.ellipse(ex, 2, 15, 13, 0, 0, 7); g.fill(); } g.restore();
  // wide, curved grin: corners bent up toward the eyes, but it stays inside the face
  const sm1 = Math.min(1, smile), mw = 30 + 18 * sm1, mh = 5 + 18 * mouth, cy = 46, up = 6 + 8 * sm1;
  g.fillStyle = '#1a0e18'; g.strokeStyle = O; g.lineWidth = 6; g.beginPath();
  g.moveTo(-mw, cy - up); g.bezierCurveTo(-mw * 0.6, cy + mh * 1.6, mw * 0.6, cy + mh * 1.6, mw, cy - up);
  g.bezierCurveTo(mw * 0.5, cy + mh * 0.3, -mw * 0.5, cy + mh * 0.3, -mw, cy - up); g.fill(); g.stroke();
  g.fillStyle = '#efe9f2'; for (let k = -3; k <= 3; k++) { const u = k / 4, x = u * mw, y = cy + mh * 0.3 * (1 - u * u) - up * u * u + 2; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.lineTo(x, y + 8 + mh * 0.2); g.fill(); }
  g.restore();
  // Mom's phone in the front hand
  if (o.phone) { const [px, py] = frontHand; g.save(); g.translate(px + 10, py - 30); g.rotate(-0.3); g.fillStyle = O; g.beginPath(); g.roundRect(-26, -46, 52, 92, 10); g.fill(); g.fillStyle = '#2a2448'; g.beginPath(); g.roundRect(-20, -40, 40, 80, 6); g.fill();
    g.save(); g.shadowColor = 'rgba(160,170,255,0.8)'; g.shadowBlur = 18; g.fillStyle = '#d8dcff'; g.fillRect(-14, -10, 28, 16); g.restore(); g.restore(); }
  g.restore();
};
const lerp = (a, b, u) => a + (b - a) * u;
