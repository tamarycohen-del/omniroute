// "Mom" (the thing that copies her): our own design, same flat style as whiteStick.
// Looks like a normal mom in her night-shift scrubs from far away, but too tall and too thin, and her arms can stretch.
// momThing(g, o) draws in a 600 x 1000 card (cx 300, feet at 975) like whiteStick, but the body is taller (head above the card).
// o: { tall (1 = normal mom, 1.6 = wrong), reach (0..1 arm stretch), face ('smile'|'blank'|'dark'), t, wave (0..1 right arm up, waving), switchArm (right arm out to the side), real (the REAL Mom: warm skin, kind eyes, normal hands) }
const O = '#121018', SKIN = '#e0dce6', SCRUB = '#5f8f9a', SCRUB_D = '#4a7280', HAIR = '#2a1e1c', RING = '#e8c860';

export const momThing = (g, o = {}) => {
  const SK = o.real ? '#f1cfb2' : SKIN; const k = o.tall ?? 1.6, t = o.t || 0, reach = o.reach || 0, cx = 300, sole = 975;
  const legTop = sole - 230 * k, waist = legTop - 20, neck = waist - 250 * k * 0.8, headR = 62, hc = neck - headR + 6;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const limb = (pts, a = 26, b = 14, col = SK) => { for (const [w, c] of [[a, O], [b, col]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); } };
  // legs (scrub pants), too long
  for (const s of [-1, 1]) { // o.run = running phase (legs swing like scissors); undefined = standing
    const len = sole - 14 - legTop, sw = o.run === undefined || o.runFront ? 0 : Math.sin(o.run + (s > 0 ? Math.PI : 0)) * 0.55;
    if (o.runFront) { // running toward the camera: legs pump forward/back = knees lift up, feet come off the ground in turn
      const ph = Math.sin(o.run + (s > 0 ? Math.PI : 0)), up = Math.max(0, ph), back = Math.max(0, -ph), lift = up * len;
      // big strides: the front knee drives up almost to the hip (shin hangs short, foreshortened toward us);
      // the back leg pushes off and its foot kicks up behind her
      const ky = legTop + len * 0.5 - up * len * 0.5, kx = cx + s * (28 + 40 * up), fx = cx + s * (24 + 14 * up + 20 * back), fy = up > 0 ? ky + len * (0.5 - 0.28 * up) : sole - 14 - back * len * 0.5;
      limb([[cx + s * 16, legTop], [kx, ky], [fx, fy]], 40 + 10 * lift / len, 26 + 6 * lift / len, SCRUB_D);
      g.fillStyle = '#e8e4ee'; g.strokeStyle = O; g.lineWidth = 6; g.beginPath(); g.ellipse(fx + s * 4, fy + 8, 26 + 10 * lift / len, 11 + 8 * lift / len, 0, 0, 7); g.fill(); g.stroke(); continue; }
    const fx = cx + s * 16 + Math.sin(sw) * len, fy = legTop + Math.cos(sw) * len, kx = cx + s * 16 + Math.sin(sw) * len * 0.5 + (o.run === undefined ? 0 : 30 * Math.max(0, -Math.sin(o.run + (s > 0 ? Math.PI : 0)))), ky = legTop + Math.cos(sw) * len * 0.5;
    limb([[cx + s * 16, legTop], [kx, ky], [fx, fy]], 40, 26, SCRUB_D); g.fillStyle = '#e8e4ee'; g.strokeStyle = O; g.lineWidth = 6; g.beginPath(); g.ellipse(fx + 8, fy + 8, 26, 11, 0, 0, 7); g.fill(); g.stroke(); }
  // scrub top (long, thin)
  g.fillStyle = SCRUB; g.strokeStyle = O; g.lineWidth = 9;
  g.beginPath(); g.moveTo(cx - 44, neck + 14); g.lineTo(cx + 44, neck + 14); g.lineTo(cx + 54, legTop + 10); g.lineTo(cx - 54, legTop + 10); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = SCRUB_D; g.lineWidth = 5; g.beginPath(); g.moveTo(cx - 18, neck + 16); g.lineTo(cx, neck + 50); g.lineTo(cx + 18, neck + 16); g.stroke();
  rr(g, cx + 14, neck + 90, 34, 44, 4, '#f4f2ee'); g.fillStyle = '#c8c4d0'; g.fillRect(cx + 19, neck + 98, 24, 5); g.fillRect(cx + 19, neck + 108, 18, 4); // ID badge
  // arms: normal length at reach 0; at reach 1 they slide out sideways, impossibly long and thin
  const sh = neck + 34, L = 170 + 900 * reach, droop = 120 * (1 - reach);
  for (const s of [-1, 1]) {
    const lp = (a, b) => a + (b - a) * reach, sw = o.runFront ? Math.sin(o.run + (s > 0 ? 0 : Math.PI)) * 12 * (1 - reach) : Math.sin(t * 1.6 + s * 2);
    let ex = cx + s * lp(62, 44 + L * 0.45), ey = sh + lp(150, 60) + 10 * sw, hx = cx + s * lp(70, 44 + L), hy = sh + lp(300, 90) + lp(6, 30) * sw;
    if (o.real) { ex = cx + s * 58; ey = sh + 105 + 6 * sw; hx = cx + s * 64; hy = sh + 205 + 4 * sw; } // the real Mom: normal arm length
    if (s === 1 && o.wave) { const wv = Math.sin(t * 7) * 30 * o.wave; ex = cx + 90; ey = sh - 30; hx = cx + 110 + wv; hy = sh - 200; } // raised arm, waving slowly (o.wave 0..1)
    if (s === 1 && o.switchArm) { ex = cx + 110; ey = sh + 60; hx = cx + 230; hy = sh + 20; } // reaching sideways to a light switch
    if (reach > 0.05) { // long, wavy, snake-like arm
      const pts = []; const N = 18;
      for (let i = 0; i <= N; i++) { const k = i / N, x = cx + s * 40 + (hx - cx - s * 40) * k, y = sh + (hy - sh) * k + Math.sin(k * 7 + t * 3 * s) * 60 * reach * Math.sin(Math.PI * k); pts.push([x, y]); }
      limb(pts, 24 - 6 * reach, 12 - 4 * reach);
    } else limb([[cx + s * 40, sh], [ex, ey], [hx, hy]], 24 - 6 * reach, 12 - 4 * reach);
    if (o.real) { g.fillStyle = SK; g.strokeStyle = O; g.lineWidth = 6; g.beginPath(); g.arc(hx, hy, 18, 0, 7); g.fill(); g.stroke(); g.strokeStyle = RING; g.lineWidth = 5; g.beginPath(); g.moveTo(hx + s * 8, hy - 6); g.lineTo(hx + s * 12, hy + 4); g.stroke(); } // a normal hand, still her ring
    else hand(g, hx, hy, s, reach, t);
  }
  g.save(); g.translate(cx, hc + 40); g.rotate(-0.07); g.translate(-cx, -(hc + 40)); // head tilted a little
  // head: shoulder-length hair (open at the bottom, neck and chin visible), side part
  g.fillStyle = HAIR; g.strokeStyle = O; g.lineWidth = 8;
  g.beginPath(); g.moveTo(cx - headR - 14, hc + 70); g.lineTo(cx - headR - 14, hc); g.bezierCurveTo(cx - headR - 14, hc - headR - 30, cx + headR + 14, hc - headR - 30, cx + headR + 14, hc); g.lineTo(cx + headR + 14, hc + 70);
  g.quadraticCurveTo(cx + headR, hc + 80, cx + headR - 10, hc + 66); g.lineTo(cx - headR + 10, hc + 66); g.quadraticCurveTo(cx - headR, hc + 80, cx - headR - 14, hc + 70); g.closePath(); g.fill(); g.stroke();
  // neck + face
  g.fillStyle = SK; g.fillRect(cx - 16, hc + 50, 32, neck - hc - 40); g.strokeStyle = O; g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 16, hc + 56); g.lineTo(cx - 16, neck + 10); g.moveTo(cx + 16, hc + 56); g.lineTo(cx + 16, neck + 10); g.stroke();
  g.lineWidth = 8; g.beginPath(); g.arc(cx, hc + 8, headR - 4, 0, 7); g.fill(); g.stroke();
  // fringe swept to one side
  g.fillStyle = HAIR; g.beginPath(); g.moveTo(cx - headR + 2, hc + 4); g.bezierCurveTo(cx - headR + 6, hc - headR - 8, cx + headR - 6, hc - headR - 8, cx + headR - 2, hc + 4); g.quadraticCurveTo(cx + 20, hc - 26, cx - 10, hc - 20); g.quadraticCurveTo(cx - 40, hc - 12, cx - headR + 2, hc + 4); g.fill();
  const f = o.face || 'smile', ey = hc + 12;
  if (f === 'dark') { g.fillStyle = 'rgba(8,6,14,0.85)'; g.beginPath(); g.arc(cx, hc + 8, headR - 6, 0, 7); g.fill();
    g.save(); g.shadowColor = '#fff'; g.shadowBlur = 14; g.fillStyle = '#f4f2ee'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 20, ey, 8, 11, 0, 0, 7); g.fill(); } g.restore(); }
  else {
    if (o.real) { for (const s of [-1, 1]) { g.fillStyle = O; g.beginPath(); g.ellipse(cx + s * 21, ey + 1, 8, 10, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(cx + s * 21 + 3, ey - 3, 3, 0, 7); g.fill(); // warm eyes with a glint
        g.fillStyle = 'rgba(235,120,120,0.35)'; g.beginPath(); g.ellipse(cx + s * 34, ey + 22, 12, 8, 0, 0, 7); g.fill(); } }
    else for (const s of [-1, 1]) {
      g.fillStyle = '#f8f6fa'; g.strokeStyle = O; g.lineWidth = 3.5; g.beginPath(); g.ellipse(cx + s * 21, ey, 11, 12, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = O; g.beginPath(); g.arc(cx + s * 21, ey + 1, 4, 0, 7); g.fill();                                     // tiny staring pupils
    }
    g.strokeStyle = O; g.lineWidth = 5; g.beginPath();
    if (f === 'smile') { g.moveTo(cx - 24, ey + 30); g.quadraticCurveTo(cx, ey + 44, cx + 24, ey + 30); } else { g.moveTo(cx - 18, ey + 34); g.lineTo(cx + 18, ey + 34); }
    g.stroke();
  }
  g.restore(); // head tilt
  g.restore();
};

const rr = (g, x, y, w, h, r, fill) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); g.strokeStyle = O; g.lineWidth = 4; g.stroke(); };

// pale hand with Mom's ring; fingers grow longer with reach
export const hand = (g, x, y, s = 1, reach = 0, t = 0) => {
  const fl = (34 + 46 * reach) * (0.85 + 0.15 * Math.sin(t * 5)); // fingers slowly curl and open
  g.save(); g.translate(x, y); g.scale(s, 1); g.lineCap = 'round';
  g.fillStyle = SKIN; g.strokeStyle = O; g.lineWidth = 6; g.beginPath(); g.ellipse(0, 0, 20, 16, 0, 0, 7); g.fill(); g.stroke();
  for (let i = 0; i < 4; i++) { const a = -0.5 + i * 0.32; for (const [w, c] of [[11, O], [5, SKIN]]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(12, -8 + i * 6); g.quadraticCurveTo(12 + fl * 0.6 * Math.cos(a), -8 + i * 6 + fl * 0.4 * Math.sin(a), 14 + fl * Math.cos(a), -6 + i * 7 + fl * Math.sin(a) + 8); g.stroke(); } }
  g.strokeStyle = RING; g.lineWidth = 5; g.beginPath(); g.moveTo(22, -1); g.lineTo(26, 6); g.stroke(); // the ring
  g.restore();
};
