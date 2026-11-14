// Cartoon emu card, side view facing right, drawn on the 600x1000 card canvas (sole at y = 975).
// o: { run: 0..1 (leg cycle phase, undefined = standing), expr: neutral|shock|smug|angry|blink, look: -1..1,
//      helmet: bool, salute: bool, gun: bool, peck: 0..1, neck: lean -1..1, seed }
const INK = '#241726';
const BODY = '#5b4a3c', BODY2 = '#7a6450', NECK = '#7d9cc0', LEG = '#9a8a6a', BEAK = '#3a3030';

const shag = (cx, cy, rx, ry, n, seed, amp = 0.12) => {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, r = 1 + (i % 2 ? amp : -amp * 0.3) * (0.7 + 0.3 * Math.sin(i * 1.7 + seed));
    pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
  }
  return pts;
};

const leg = (p, hip, ph, lift) => {
  // ph: 0..1 cycle. Knee (ankle) bends backward like a real emu.
  const a = ph * Math.PI * 2, sw = Math.sin(a), up = Math.max(0, Math.cos(a)) * lift;
  const foot = [hip[0] + 10 + sw * 120, 965 - up * 160];
  const knee = [hip[0] - 40 + sw * 40, (hip[1] + foot[1]) / 2 - 10 - up * 40];
  p.line([hip, knee, foot], LEG, 26);
  // toes
  for (const d of [-0.35, 0, 0.35]) p.line([foot, [foot[0] + Math.cos(d) * 48, foot[1] + Math.sin(d) * 10 + 4]], LEG, 12);
};

export const emuCard = (p, o = {}) => {
  const { run, expr = 'neutral', look = 0, helmet = false, salute = false, gun = false, peck = 0, neck = 0, seed = 1 } = o;
  const running = run !== undefined;
  const bob = running ? Math.abs(Math.sin(run * Math.PI * 2)) * 18 : 0;
  const lean = (running ? 0.35 : 0) + neck * 0.4 + peck * 1.1;
  const by = 500 - bob, bx = 260;
  // far leg, then body, then near leg
  if (running) leg(p, [bx + 10, by + 70], (run + 0.5) % 1, 1); else leg(p, [bx + 10, by + 70], 0.25, 0);
  // tail droop + body
  p.poly(shag(bx, by, 175, 118, 30, seed), BODY, 7);
  p.poly(shag(bx + 10, by - 20, 120, 70, 22, seed + 3, 0.1), BODY2, 0);
  for (let i = 0; i < 6; i++) p.stroke([[bx - 120 + i * 40, by - 30 + (i % 2) * 20], [bx - 150 + i * 40, by + 40 + (i % 2) * 20]], 5, '#3e3128');
  if (running) leg(p, [bx + 30, by + 80], run, 1); else leg(p, [bx + 40, by + 80], 0.75, 0);
  // neck: from the front of the body up to the head, leaning forward with `lean`
  const n0 = [bx + 130, by - 40];
  const hx = n0[0] + 40 + lean * 170, hy = n0[1] - 300 + lean * 190 + bob * 0.3;
  const mid = [n0[0] + 40 + lean * 60, n0[1] - 160 + lean * 60];
  p.line([n0, mid, [hx - 10, hy + 20]], NECK, 46);
  p.stroke([n0, mid, [hx - 10, hy + 20]], 20, '#94b2d2');
  // head
  p.ell(hx, hy, 68, 56, NECK, 7);
  p.ell(hx - 24, hy - 42, 40, 20, BODY, 0); // fluffy crown
  // beak
  const bk = peck > 0.5 ? 0.2 : 0;
  p.poly([[hx + 52, hy - 8], [hx + 132, hy + 4 + bk * 30], [hx + 54, hy + 22]], BEAK, 6);
  if (expr === 'shock') p.poly([[hx + 52, hy + 22], [hx + 118, hy + 46], [hx + 48, hy + 40]], BEAK, 6);
  // eye
  const ex = hx + 10, ey = hy - 8;
  if (expr === 'blink') p.stroke([[ex - 18, ey], [ex + 18, ey]], 7);
  else {
    const r = expr === 'shock' ? 36 : 29;
    p.ell(ex, ey, r, r, '#ffffff', 6);
    p.dot(ex + 6 + look * 8, ey + 2, expr === 'shock' ? 9 : 13, INK);
    p.dot(ex + 9 + look * 8, ey - 2, 3, '#ffffff');
    if (expr === 'smug') p.poly([[ex - 26, ey - 6], [ex + 26, ey - 10], [ex + 26, ey - 26], [ex - 26, ey - 26]], NECK, 0), p.stroke([[ex - 24, ey - 6], [ex + 24, ey - 10]], 7);
    if (expr === 'angry') p.stroke([[ex - 22, ey - 30], [ex + 22, ey - 16]], 9);
  }
  if (helmet) { // tiny army helmet (Brodie style)
    p.ell(hx - 4, hy - 38, 62, 12, '#6b6a3a', 6);
    p.ell(hx - 4, hy - 44, 38, 26, '#7a7a44', 6, 180, 360);
  }
  if (salute) p.line([[hx - 10, hy + 70], [hx - 50, hy + 10], [hx - 20, hy - 30]], BODY, 22);
  if (gun) { // carrying the machine gun under a wing
    p.poly([[bx - 40, by + 10], [bx + 230, by - 10], [bx + 232, by + 12], [bx - 38, by + 34]], '#2e2c28', 6);
    p.ell(bx + 30, by + 22, 50, 30, '#3a3a34', 6);
    p.line([[bx - 10, by - 20], [bx + 60, by + 20]], BODY, 30);
  }
};
