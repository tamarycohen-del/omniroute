import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.dirname(new URL(import.meta.url).pathname), out = process.argv[2];
const srv = http.createServer((q, s) => { const p = path.join(root, q.url.split('?')[0]); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise((r) => srv.on('listening', r));
const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 800, height: 800 } }); pg.on('pageerror', (e) => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/avatar.html`); await pg.waitForFunction(() => window.ready);
for (const k of [9, 10]) { const d = await pg.evaluate((k) => { window.renderFrame(k); return document.getElementById('c').toDataURL('image/png'); }, k); fs.writeFileSync(path.join(out, `avatar_${'ABCDEFGHIJK'[k]}.png`), Buffer.from(d.split(',')[1], 'base64')); }
await br.close(); srv.close(); console.log('ok');
