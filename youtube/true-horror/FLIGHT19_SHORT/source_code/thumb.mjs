// node thumb.mjs <dir with page + json> <out.png> [page.html]
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, root, out, page = "f19.html"] = process.argv;
const srv = http.createServer((q, s) => { const p = path.join(root, q.url.split('?')[0]); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise((r) => srv.on('listening', r));
const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
await pg.goto(`http://localhost:${srv.address().port}/${page}`); await pg.waitForFunction(() => window.ready);
const d = await pg.evaluate(() => { window.renderThumb(); return document.getElementById('c').toDataURL('image/png'); });
fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); await br.close(); srv.close(); console.log('thumb', out);
