import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, page = 'anim.html', out = 'frames', a = '0', b = '269'] = process.argv;
const root = path.dirname(new URL(import.meta.url).pathname); fs.mkdirSync(path.join(root, out), { recursive: true });
const srv = http.createServer((q, s) => { const p = path.join(root, q.url.split('?')[0]); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise((r) => srv.on('listening', r));
const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const pg = await br.newPage({ viewport: { width: 1920, height: 1080 } });
pg.on('pageerror', (e) => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/${page}`); await pg.waitForFunction(() => window.ready);
const t0 = Date.now();
for (let f = +a; f <= +b; f++) { const d = await pg.evaluate((f) => { window.renderFrame(f); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, f); fs.writeFileSync(path.join(root, out, `f${String(f).padStart(4, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64')); }
console.log(`done ${+b - +a + 1} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`); await br.close(); srv.close();
