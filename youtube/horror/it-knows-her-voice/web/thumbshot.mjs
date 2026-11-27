import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, root, outDir, ...parts] = process.argv;
const srv = http.createServer((q, s) => { const p = path.join(root, q.url.split('?')[0]); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise((r) => srv.on('listening', r));
const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } }); pg.on('pageerror', (e) => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/thumbs.html`); await pg.waitForFunction(() => window.ready);
for (const n of parts) { const d = await pg.evaluate((n) => { window.renderThumb(n, 2); return document.getElementById('c').toDataURL('image/png'); }, n); fs.writeFileSync(path.join(outDir, `thumb${n}_2x.png`), Buffer.from(d.split(',')[1], 'base64')); }
await br.close(); srv.close(); console.log('ok');
