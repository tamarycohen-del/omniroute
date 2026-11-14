// node frames.mjs out.jpg t1 t2 ...  -> contact sheet of frames at those seconds (3 per row, 360x640 each)
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
const [,, out, ...ts] = process.argv; const root = path.dirname(new URL(import.meta.url).pathname);
const srv = http.createServer((q, s) => { const p = path.join(root, q.url.split('?')[0]); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise((r) => srv.on('listening', r));
const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } }); pg.on('pageerror', (e) => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/ep1.html`); await pg.waitForFunction(() => window.ready);
const tmp = fs.mkdtempSync('/tmp/cs'); const files = [];
for (const [i, t] of ts.entries()) { const d = await pg.evaluate((f) => { window.renderFrame(f); return document.getElementById('c').toDataURL('image/jpeg', 0.85); }, Math.round(+t * 30)); const p = path.join(tmp, `${i}.jpg`); fs.writeFileSync(p, Buffer.from(d.split(',')[1], 'base64')); files.push(p); }
await br.close(); srv.close();
const cols = 3, rows = Math.ceil(files.length / cols);
execFileSync('ffmpeg', ['-v', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex', files.map((_, i) => `[${i}]scale=360:640,drawtext=text='${ts[i]}s':x=10:y=10:fontsize=28:fontcolor=yellow[v${i}]`).join(';') + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * 360}_${Math.floor(i / cols) * 640}`).join('|')}:fill=black`, '-q:v', '3', out]);
console.log('ok', out);
