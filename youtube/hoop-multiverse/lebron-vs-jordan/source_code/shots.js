// ---------- Jordan vs LeBron: shots (each voice line = one shot; times come from lines.json) ----------
let LINES = [], SH = [], BEATS = [0, 1, 2, 3, 4], CLIPS = [];
const clipOn = (i) => (CLIPS[i] && T >= CLIPS[i].s && T <= CLIPS[i].e ? Math.max(0, 1 - Math.abs((T - CLIPS[i].s) / (CLIPS[i].e - CLIPS[i].s) - 0.45) * 1.4) : 0); // 1 while the user's 'LeBron James!' sound plays
const SJ = 0.8 * 78 / 83, SL = 0.8 * 81 / 83, GY = 1500; // 6'6" and 6'9" relative to the 6'11" rig at 0.8
const RED = '#ff3b4a', GOLDL = '#fdb927', VIO = '#9b6bff';
const POSE = { fade: { ...P.shoot, lean: -0.3, hip: [0.3, 0.0], kn: [-0.2, -0.35] }, guard: { lean: 0.05, sh: [-1.7, 1.7], el: [-1.0, 1.0], hip: [-0.3, 0.3], kn: [-0.5, -0.5], head: 0 }, crouch: { lean: 0.12, sh: [-0.45, 0.3], el: [-0.55, 0.3], hip: [0.5, -0.4], kn: [-0.7, -0.55], head: 0.05, ball: 0 } };
const jord = (x, pose, o = {}) => player(x, GY, SJ * (o.k || 1), pose, { look: LOOK.jordan, ...o });
const lebr = (x, pose, o = {}) => player(x, GY, SL * (o.k || 1), pose, { look: LOOK.lebron, flip: true, ...o });
const arena = (k = 0, floorW = 1900) => { nebula(-k * 30, 0); glow(540, 900, 1000, '150,110,255', 0.2); glow(180, 1300, 600, '255,60,80', 0.1); glow(900, 1300, 600, '253,185,39', 0.1); court(540, GY + 60, floorW); };
const rrect = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath(); };
const board = (a, b, alpha = 1, pa = 0, pb = 0) => { g.save(); g.globalAlpha = alpha; g.fillStyle = 'rgba(8,8,26,0.85)'; rrect(70, 70, 940, 190, 24); g.fill(); g.strokeStyle = '#7fe7ff'; g.lineWidth = 5; g.shadowColor = '#7fe7ff'; g.shadowBlur = 20; g.stroke(); g.restore();
  g.save(); g.globalAlpha = alpha; txt('JORDAN', 270, 140, 48, RED, { stroke: 8, maxW: 380 }); txt('LEBRON', 810, 140, 48, GOLDL, { stroke: 8, maxW: 380 });
  g.save(); g.translate(270, 238); g.scale(1 + pa * 0.4, 1 + pa * 0.4); txt(String(a), 0, 0, 110, C.white, { stroke: 10 }); g.restore(); g.save(); g.translate(810, 238); g.scale(1 + pb * 0.4, 1 + pb * 0.4); txt(String(b), 0, 0, 110, C.white, { stroke: 10 }); g.restore();
  txt('FIRST TO 11', 540, 150, 34, '#7fe7ff', { stroke: 6, maxW: 260 }); txt('–', 540, 232, 90, C.white, { stroke: 8 }); g.restore(); };
const flightPt = (sx, sy, ex, ey, k, arc) => [lerp(sx, ex, k), lerp(sy, ey, k) - Math.sin(k * Math.PI) * arc];
const HX = 1020, HKS = 0.78; // hoop post x, real scale (same as the players)
const rimPos = () => [HX - 240 * HKS, GY - 1300 * HKS];
const HXL = 60, rimPosL = () => [HXL + 240 * HKS, GY - 1300 * HKS];                    // left hoop (mirrored): LeBron attacks this one, Jordan the right one
const hoopL = (net) => { g.save(); g.translate(HXL, 0); g.scale(-1, 1); hoop(0, GY, HKS, net); g.restore(); };
const crown = (x, y, s, a = 1) => { g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s); g.fillStyle = GOLDL; g.beginPath(); g.moveTo(-90, 40); g.lineTo(-100, -50); g.lineTo(-45, -5); g.lineTo(0, -75); g.lineTo(45, -5); g.lineTo(100, -50); g.lineTo(90, 40); g.closePath(); g.fill(); g.strokeStyle = '#7a5200'; g.lineWidth = 6; g.stroke(); g.fillStyle = '#fff3b0'; for (const px of [-100, 0, 100]) { g.beginPath(); g.arc(px, px === 0 ? -82 : -56, 11, 0, 7); g.fill(); } g.restore(); };
const bigNum = (s, x, y, size, col, u, o = {}) => { if (u <= 0) return; const k = back(u / 0.3); g.save(); g.translate(x, y); g.scale(lerp(1.8, 1, clamp(k)), lerp(1.8, 1, clamp(k))); g.globalAlpha = clamp(u / 0.1); txt(s, 0, 0, size, col, { glow: col, ...o }); g.restore(); };
const portrait = (cx, cy, r, look, flip) => { g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip(); const gr = g.createRadialGradient(cx, cy, 10, cx, cy, r); gr.addColorStop(0, look === LOOK.jordan ? '#5a1020' : '#3a1a66'); gr.addColorStop(1, '#0a0620'); g.fillStyle = gr; g.fillRect(cx - r, cy - r, 2 * r, 2 * r); const s = 1.75; player(cx + (flip ? -10 : 10), cy + 835 * s - 20, s, { ...P.stand, ball: undefined }, { look, flip, noBall: true }); g.restore(); g.save(); g.strokeStyle = look === LOOK.jordan ? RED : GOLDL; g.lineWidth = 12; g.shadowColor = g.strokeStyle; g.shadowBlur = 30; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); g.restore(); };

const ss = (i) => (i === 0 ? 0 : LINES[i].s);
const wt = (i, re, nth = 0, dflt = 0) => { const a = LINES[i].s - 0.05, b = LINES[i + 1] ? LINES[i + 1].s : 1e9; const m = WORDS.filter((w) => w.s >= a && w.s < b && re.test(w.w)); return m[nth] ? m[nth].s - ss(i) : dflt; };
const buildShots = () => {
  const S = [];
  { const d7 = LINES[8].s - LINES[7].s; const nm = WORDS.filter((w) => w.s >= LINES[7].s - 0.1 && w.s <= LINES[7].e + 0.2 && /^(jordan|lebron)/i.test(w.w.replace(/[^a-z]/gi, ''))); BEATS = nm.length >= 4 ? [0, nm[1].s - LINES[7].s, nm[2].s - LINES[7].s, nm[3].s - LINES[7].s, d7] : [0, d7 * 0.25, d7 * 0.5, d7 * 0.75, d7]; }
  // 0 hook: the open loop first (tied 10-10, one shot left), then the title; fast from frame 0
  S.push((u, d) => { const k = ease(u / d); g.save(); cam(lerp(0.9, 1.1, k), 540, 1120); arena(u); hoop(HX, GY, HKS, 9); hoopL(9); jord(300, POSE.guard); glow(760, 1050, 420, '253,185,39', 0.6 * clipOn(0)); lebr(760, mixP(P.dribA, P.dribB, Math.abs(Math.sin(T * 5))), { bspeed: 6 }); g.restore(); speedLines(540, 1100, 0.14, 40); board(10, 10, 1, 0, 0);
    slam('WHO WINS?', 540, 400, 180, C.white, u + 0.3); slam('PRIME JORDAN', 540, 540, 100, RED, u + 0.15, { glow: RED, maxW: 980 }); slam('vs PRIME LEBRON', 540, 660, 100, GOLDL, u + 0.05, { glow: GOLDL, maxW: 980 }); });
  // 1 who takes it
  S.push((u, d) => { g.save(); cam(lerp(1.0, 1.25, ease(u / d)), 540, 1150, 0.02 * Math.sin(T * 2)); arena(u); jord(360, P.stand); lebr(720, P.stand); const by = 840 + Math.sin(T * 4) * 25; glow(540, by, 220, '255,170,60', 0.5); ball(540, by, 44, T * 5); g.restore(); speedLines(540, 900, 0.18, 50);
    slam('WHO TAKES IT?', 540, 360, 130, C.white, u); const tN = wt(1, /^let/, 0, 0.7); if (u > tN) slam("LET'S FIND OUT.", 540, 520, 110, GOLDL, u - tN, { glow: GOLDL, maxW: 980 }); });
  // 2 Jordan resume
  S.push((u, d) => { g.save(); cam(1.0, 540, 1100); arena(u); const t0 = wt(2, /^6'6/, 0, 1.0), t1 = wt(2, /^trips/, 0, 2.2), t2 = wt(2, /^championships/, 0, 3.4), t3 = wt(2, /^never/, 0, 4.6); jord(540, mixP(P.stand, P.flex, ease((u - t0) / 0.7)), { k: 1.12 }); measure(110, GY, GY - 900 * SJ * 1.12, '6\'6"', RED, (u - t0) / 0.7, 1, 78); g.restore();
    glow(540, 800, 700, '255,59,74', 0.12); bigNum('6 FINALS', 540, 300, 120, C.white, u - t1 + 0.35); bigNum('6 TITLES', 540, 440, 120, RED, u - t2 + 0.3); bigNum('NEVER LOST', 540, 600, 120, GOLDL, u - t3); });
  // 3 Jordan numbers
  S.push((u, d) => { g.save(); cam(1.0, 540, 1100); arena(u); const a10 = wt(3, /^10/, 0, 0.2), a30 = wt(3, /^30/, 0, 1.6), aHi = wt(3, /^highest/, 0, 3.3); jord(540, mixP(P.stand, P.flex, ease((u - a10) / 0.7)), { k: 1.12 }); g.restore(); glow(540, 700, 700, '255,59,74', 0.12);
    if (u < a30 - 0.05) { bigNum('10', 540, 400, 260, RED, u - a10); bigNum('SCORING TITLES', 540, 530, 86, C.white, u - a10 - 0.25); } else { const n = lerp(0, 30.1, ease((u - a30) / 0.9)); bigNum(n.toFixed(1), 540, 400, 250, RED, u - a30); bigNum('POINTS PER GAME', 540, 530, 80, C.white, u - a30 - 0.2); if (u > aHi) bigNum('#1 IN NBA HISTORY', 540, 660, 70, GOLDL, u - aHi, { maxW: 980 }); } });
  // 4 LeBron resume
  S.push((u, d) => { g.save(); cam(1.0, 540, 1100); arena(u); const b69 = wt(4, /^6'9/, 0, 1.0), b250 = wt(4, /^250/, 0, 2.2), b4 = wt(4, /^4$/, 0, 3.6); glow(540, 1000, 480, '253,185,39', 0.6 * clipOn(1)); lebr(540, mixP(P.stand, P.flex, ease((u - b69) / 0.7)), { k: 1.12 }); measure(970, GY, GY - 900 * SL * 1.12, '6\'9"', GOLDL, (u - b69) / 0.7, -1, 78); g.restore();
    glow(540, 800, 700, '253,185,39', 0.12); bigNum('250 LBS', 540, 300, 130, C.white, u - b250); bigNum('4 TITLES', 540, 460, 130, GOLDL, u - b4); });
  // 5 LeBron scoring king
  S.push((u, d) => { g.save(); cam(1.0, 540, 1100); arena(u); const c40 = wt(5, /^40/, 0, 0.5), cKing = wt(5, /^all-time/, 0, 2.6); lebr(540, mixP(P.stand, P.flex, ease((u - c40) / 0.7)), { k: 1.12 }); g.restore(); glow(540, 700, 700, '253,185,39', 0.12);
    const n = Math.round(lerp(0, 40000, ease((u - c40) / 1.2))); bigNum(n.toLocaleString('en-US') + '+', 540, 420, 190, GOLDL, u - c40); bigNum('CAREER POINTS', 540, 540, 82, C.white, u - c40 - 0.2); crown(540, 220, 1.05, clamp((u - c40 - 1.2) / 0.2)); if (u > cKing) bigNum('ALL-TIME SCORING KING', 540, 680, 66, C.white, u - cKing, { maxW: 980 }); });
  // 6 tip-off
  S.push((u, d) => { const tOff = wt(6, /^off/, 0, 1.0), jp = Math.sin(clamp((u - tOff) / 1.2) * Math.PI); g.save(); cam(1.0, 540, 1100); arena(u); jord(360, jp > 0.02 ? P.shoot : P.stand, { jump: 190 * jp, noBall: true }); lebr(720, jp > 0.02 ? P.shoot : P.stand, { jump: 215 * jp, noBall: true });
    const bk = clamp((u - tOff - 0.4) / 1.2); ball(540, 1000 - Math.sin(bk * Math.PI) * 360 + (bk > 0.9 ? 0 : 0), 44, T * 8); g.restore(); board(0, 0, ease(u / 0.5)); if (u > tOff + 0.8) shock(540, 640, (u - tOff - 0.8) / 0.7, 500, '255,230,160'); });
  // 7 four beats of 1-on-1: Jordan attacks the RIGHT hoop, LeBron the LEFT hoop
  S.push((u, d) => { let b = 0; while (b < 3 && u >= BEATS[b + 1]) b++; const bd = BEATS[b + 1] - BEATS[b], v = (u - BEATS[b]) / bd; const scores = [[0, 0], [2, 0], [2, 2], [4, 2], [4, 4]]; const rimR = rimPos(), rimLf = rimPosL();
    const sc = scores[b + (v > 0.78 ? 1 : 0)]; const pulseA = (b === 0 || b === 2) && v > 0.78 ? 1 - (v - 0.78) / 0.22 : 0, pulseB = (b === 1 || b === 3) && v > 0.78 ? 1 - (v - 0.78) / 0.22 : 0;
    const net = (v > 0.78 ? (v - 0.78) * 0.9 * bd : 9); g.save(); if (v > 0.78 && v < 0.86) shake(10); cam(1.0, 540, 1100); arena(u, 2100); hoop(HX, GY, HKS, b % 2 === 0 ? net : 9); hoopL(b % 2 === 1 ? net : 9);
    const arcBall = (sx, sy, rim, k, arc) => { const pts = []; for (let i = 0; i <= 12; i++) pts.push(flightPt(sx, sy, rim[0], rim[1], k * i / 12, arc)); if (k > 0 && k < 1) comet(pts, 22); const p = pts[12]; ball(p[0], p[1], 36, T * 10); };
    if (b === 0 || b === 2) { // Jordan: jumper / fadeaway at the right hoop, LeBron contests
      const x0 = b === 0 ? 380 : 330, rel = 0.45, jp = Math.sin(clamp(v / 0.62) * Math.PI), pose = v < 0.2 ? mixP(P.load, b === 2 ? POSE.fade : P.shoot, ease(v / 0.2)) : (b === 2 ? POSE.fade : P.shoot);
      lebr(x0 + 350 - 50 * clamp(v / 0.4), v < 0.4 ? POSE.guard : P.flex, { jump: 70 * jp });
      jord(x0, pose, { jump: 160 * jp, holdBall: v < rel, noBall: v >= rel });
      if (v >= rel && v < 0.97) arcBall(x0 + (b === 2 ? 30 : 60), GY - 160 * jp - 790 * SJ / 0.8 * 0.98, rimR, clamp((v - rel) / 0.33), 420);
    } else if (b === 1) { // LeBron drives to the LEFT hoop and dunks; Jordan chases
      const lx = lerp(700, 330, ease(clamp(v / 0.6))), jp = Math.sin(clamp((v - 0.35) / 0.4) * Math.PI), pose = v < 0.35 ? mixP(P.dribA, P.drive, ease(v / 0.35)) : v < 0.8 ? P.follow : P.stand;
      jord(lx + 230, v < 0.35 ? P.drive : POSE.guard, { flip: true, jump: 40 * jp }); const draw = (i) => lebr(lx + i * 55, pose, { jump: 300 * jp, holdBall: v < 0.7, noBall: v >= 0.7 || i > 0, bspeed: 9 }); if (v > 0.1 && v < 0.6) ghost(draw, 3); else draw(0);
      if (v >= 0.7) { const hk = clamp((v - 0.7) / 0.1); ball(lerp(lx - 70, rimLf[0], hk), lerp(GY - 300 * jp - 900 * SL / 0.8 * 0.95, rimLf[1] + 20 * hk, hk), 36, T * 8); } if (v > 0.74 && v < 1.0) { shock(rimLf[0], rimLf[1], (v - 0.74) / 0.26, 700); burst(rimLf[0], rimLf[1], (v - 0.74) / 0.26, 36, '253,185,39', 500); }
    } else { // LeBron pull-up jumper at the LEFT hoop, Jordan between him and the rim
      const lx = 610, jp = Math.sin(clamp(v / 0.62) * Math.PI), rel = 0.45; jord(lx - 380 + 40 * clamp(v / 0.4), v < 0.4 ? POSE.guard : P.flex, { jump: 60 * jp });
      lebr(lx, v < 0.2 ? mixP(P.load, P.shoot, ease(v / 0.2)) : P.shoot, { jump: 170 * jp, holdBall: v < rel, noBall: v >= rel }); if (v >= rel && v < 0.97) arcBall(lx - 62, GY - 170 * jp - 790 * SL / 0.8 * 0.98, rimLf, clamp((v - rel) / 0.33), 400); }
    g.restore(); board(sc[0], sc[1], 1, pulseA, pulseB); if (v > 0.8 && b === 1) slam('DUNK!', 540, 470, 150, GOLDL, (v - 0.8) * 4, { glow: GOLDL }); if (v > 0.8 && b === 2) slam('FADEAWAY!', 540, 470, 120, RED, (v - 0.8) * 4, { glow: RED }); if (v > 0.8 && b === 3) slam('RIGHT BACK!', 540, 470, 130, GOLDL, (v - 0.8) * 4, { glow: GOLDL, maxW: 980 }); });
  // 8 ten all
  S.push((u, d) => { const k = ease(u / d); g.save(); cam(lerp(1.0, 1.1, k), 540, 1150); arena(u, 2000); jord(300, mixP(POSE.crouch, P.dribB, Math.abs(Math.sin(T * 6))), { bspeed: 6 }); lebr(700, POSE.guard); g.restore(); const n10 = wt(8, /^10/, 0, 0.1), nx = wt(8, /^next/, 0, 0.9), ups = u < n10 ? [4, 4] : [10, 10];
    board(ups[0], ups[1], 1, u < n10 ? 0 : clamp(1 - (u - n10) / 0.3), u < n10 ? 0 : clamp(1 - (u - n10) / 0.3)); if (u > nx) slam('NEXT BUCKET WINS', 540, 400, 100, C.white, u - nx, { maxW: 980, glow: '#7fe7ff' }); });
  // 9 the last shot: LeBron rises up at the LEFT hoop and shoots; we cut away before we see it land
  S.push((u, d) => { const rim = rimPosL(); const tR = wt(9, /^shoots/, 0, 3.0), tJ = tR - 0.45, lx = 610, jp = Math.sin(clamp((u - tJ) / 0.62) * Math.PI), tCut = tR + 0.34;
    g.save(); cam(lerp(1.0, 1.03, ease(u / (tR + 0.5))), 540, 1100); arena(u, 2100); hoop(HX, GY, HKS, 9); hoopL(9);
    jord(lx - 380 + 50 * clamp((u - tJ) / 0.4), u < tJ - 0.2 ? POSE.guard : P.flex, { jump: 55 * jp });
    lebr(lx, u < tJ ? mixP(P.dribA, P.dribB, Math.abs(Math.sin(T * 5))) : u < tJ + 0.2 ? mixP(P.load, P.shoot, ease((u - tJ) / 0.2)) : P.shoot, { jump: 175 * jp, holdBall: u >= tJ && u < tR, noBall: u >= tR, bspeed: 6 });
    if (u >= tR) { const k = clamp((u - tR) / 0.9); const sx = lx - 62, sy = GY - 175 * jp - 790 * SL / 0.8 * 0.98; const pts = []; for (let i = 0; i <= 12; i++) pts.push(flightPt(sx, sy, rim[0], rim[1], k * i / 12, 430)); comet(pts, 22); ball(pts[12][0], pts[12][1], 36, T * 10); }
    g.restore(); board(10, 10, 1, 0, 0); if (u > tCut) { g.fillStyle = `rgba(3,2,12,${clamp((u - tCut) / 0.18)})`; g.fillRect(0, 0, W, H); } });
  // 10 did it go in? (dark: we never see it)
  S.push((u, d) => { g.fillStyle = '#03020c'; g.fillRect(0, 0, W, H); const pul = 1 + 0.04 * Math.sin(T * 5); glow(540, 900, 700 * pul, '150,110,255', 0.16 + 0.05 * Math.sin(T * 5)); g.save(); g.translate(540, 900); g.scale(pul, pul); g.globalAlpha = 0.95; txt('?', 0, 190, 620, '#2a1d52', { stroke: 0, glow: '#9b6bff' }); g.restore();
    const tD = wt(10, /^did/, 0, 0.1), tY = wt(10, /^you/, 0, 1.4); bigNum('DID IT GO IN?', 540, 420, 112, C.white, u - tD, { maxW: 980, glow: '#9b6bff' }); if (u > tY) bigNum('YOU DECIDE.', 540, 1400, 120, GOLDL, u - tY, { maxW: 980 }); });
  // 11 CTA / end card
  S.push((u, d) => { nebula(T * 20, 0); glow(540, 1000, 900, '150,110,255', 0.22); bigNum('WHO WINS?', 540, 400, 190, C.white, u + 0.3); bigNum('COMMENT YOUR PICK', 540, 540, 70, '#7fe7ff', u, { maxW: 980 });
    const pul = 1 + 0.03 * Math.sin(T * 6); g.save(); g.translate(270, 1000); g.scale(pul, pul); portrait(0, 0, 210, LOOK.jordan, false); g.restore(); g.save(); g.translate(810, 1000); g.scale(2 - pul, 2 - pul); portrait(0, 0, 210, LOOK.lebron, true); g.restore();
    bigNum('PRIME JORDAN', 270, 1320, 64, RED, u - 0.3, { maxW: 440 }); bigNum('PRIME LEBRON', 810, 1320, 64, GOLDL, u - 0.4, { maxW: 440 }); if (u > d - 1.1) { g.fillStyle = `rgba(5,4,20,${clamp((u - (d - 1.1)) / 0.25) * 0.85})`; g.fillRect(0, 0, W, H); bigNum('MULTIVERSE HOOPS', 540, 960, 96, C.white, u - (d - 1.0), { maxW: 980, glow: VIO }); } });
  S.splice(10); // the video now ends on the last shot (cut to black) + the sign-off sound; shots 10/11 (question + CTA card) are unused
  SH = S.map((fn, i) => [i === 0 ? 0 : LINES[i].s, fn]);
  SH.dur = (i) => (i + 1 < SH.length ? LINES[i + 1].s : window.TOTAL) - SH[i][0];
};
const shotAt = (t) => { let i = 0; while (i + 1 < SH.length && t >= SH[i + 1][0]) i++; return [(u) => SH[i][1](u, SH.dur(i)), t - SH[i][0], i]; };
