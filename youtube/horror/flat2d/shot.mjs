import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.dirname(new URL(import.meta.url).pathname);
const srv = http.createServer((q, s) => { const p = path.join(root, q.url.split('?')[0]); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise((r) => srv.on('listening', r));
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on('pageerror', (e) => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/index.html`); await pg.waitForFunction(() => window.ready);
for (const [t, shot, name] of [[0.5, 'wide', 'a'], [2.0, 'face', 'b']]) { const d = await pg.evaluate(([t, s]) => { window.renderFrame(t, s); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, [t, shot]); fs.writeFileSync(path.join(root, name + '.jpg'), Buffer.from(d.split(',')[1], 'base64')); }
await b.close(); srv.close(); console.log('ok');
