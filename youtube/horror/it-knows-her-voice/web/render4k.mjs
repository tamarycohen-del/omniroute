import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, page = 'anim.html', out = 'frames', a = '0', b = '269'] = process.argv;
const root = path.dirname(new URL(import.meta.url).pathname); fs.mkdirSync(path.join(root, out), { recursive: true });
const srv = http.createServer((q, s) => { const p = path.join(root, q.url.split('?')[0]); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise((r) => srv.on('listening', r));
const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 2160, height: 3840 } });
await pg.addInitScript(() => { const K = 2, P = CanvasRenderingContext2D.prototype, st = P.setTransform; P.setTransform = function (a, b, c, d, e, f) { if (typeof a === 'object') return st.call(this, a); return st.call(this, a * K, b * K, c * K, d * K, e * K, f * K); }; const sb = Object.getOwnPropertyDescriptor(P, 'shadowBlur'); Object.defineProperty(P, 'shadowBlur', { get() { return sb.get.call(this) / K; }, set(v) { sb.set.call(this, v * K); } }); document.addEventListener('DOMContentLoaded', () => { const c = document.getElementById('c'); c.width = 2160; c.height = 3840; }); });
pg.on('pageerror', (e) => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/${page}`); await pg.waitForFunction(() => window.ready);
const t0 = Date.now();
for (let f = +a; f <= +b; f++) { const d = await pg.evaluate((f) => { window.renderFrame(f); return document.getElementById('c').toDataURL('image/jpeg', 0.97); }, f); fs.writeFileSync(path.join(root, out, `f${String(f).padStart(4, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64')); }
console.log(`done ${+b - +a + 1} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`); await br.close(); srv.close();
