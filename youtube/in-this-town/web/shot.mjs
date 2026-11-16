import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, page, out, f = '0'] = process.argv; const root = path.dirname(new URL(import.meta.url).pathname);
const srv = http.createServer((q, s) => { const p = path.join(root, q.url.split('?')[0]); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise((r) => srv.on('listening', r));
const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on('pageerror', (e) => console.log('ERR', e.message)); pg.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()));
await pg.goto(`http://localhost:${srv.address().port}/${page}`); await pg.waitForFunction(() => window.ready, null, { timeout: 30000 });
const d = await pg.evaluate((f) => { window.renderFrame(+f); return document.getElementById('c').toDataURL('image/jpeg', 0.92); }, f);
fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); console.log('ok'); await br.close(); srv.close();
