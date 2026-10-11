// Records the Theme Wedding trailer to trailer/out/theme-wedding-trailer.mp4
//   node trailer/record.js                 full render (1280x720, 30fps, with audio)
//   node trailer/record.js --stills 15     only save every 15th frame as a PNG (quick check)
//   node trailer/record.js --seed 123      different random crowd / outfits
// Needs: playwright-core (+ its Chromium) and an ffmpeg with libx264 (FFMPEG env var, or `pip install imageio-ffmpeg`).
const http = require('http'), fs = require('fs'), path = require('path'), { spawn, execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..'), OUT = path.join(__dirname, 'out');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const STILLS = +arg('stills', 0), SEED = arg('seed', ''), W = 1280, H = 720;

function findPlaywright() {
  for (const p of ['playwright-core', 'playwright', path.join(ROOT, '../../job_search/node_modules/playwright-core')]) { try { return require(p); } catch (e) { /* next */ } }
  throw new Error('playwright-core not found: npm i playwright-core');
}
function findFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { return execSync('python -c "import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())"').toString().trim(); } catch (e) { return 'ffmpeg'; }
}
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
function serve() {
  const srv = http.createServer((req, res) => {
    const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r(srv)));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serve();
  const { chromium } = findPlaywright();
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.log('[page]', m.text()); });
  page.on('pageerror', e => console.log('[page error]', e.message));
  await page.goto(`http://127.0.0.1:${srv.address().port}/trailer/trailer.html${SEED ? '?seed=' + SEED : ''}`);
  await page.waitForFunction(() => window.TR && window.TR.begin);
  const info = await page.evaluate(() => TR.begin());
  console.log('trailer:', info);
  const ffmpeg = findFfmpeg();
  const silent = path.join(OUT, 'video-silent.mp4'), final = path.join(OUT, 'theme-wedding-trailer.mp4');
  let enc = null;
  if (!STILLS) {
    enc = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  } else fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });
  const t0 = Date.now(); let last = '';
  for (let i = 0; i < info.frames; i++) {
    const st = await page.evaluate(() => TR.step());
    if (st.shot !== last) { last = st.shot; console.log(`  ${(i / 30).toFixed(1)}s  ${st.shot}  (game ${st.time})`); }
    if (STILLS) { if (i % STILLS === 0) await page.screenshot({ path: path.join(OUT, 'stills', `${String(i).padStart(5, '0')}-${st.shot}.png`) }); continue; }
    const png = await page.screenshot({ type: 'png' });
    if (!enc.stdin.write(png)) await new Promise(r => enc.stdin.once('drain', r));
  }
  console.log(`frames done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  if (!STILLS) {
    enc.stdin.end(); await new Promise(r => enc.on('close', r));
    const wav = path.join(OUT, 'audio.wav');
    fs.writeFileSync(wav, Buffer.from(await page.evaluate(() => TR.audio()), 'base64'));
    execSync(`"${ffmpeg}" -y -loglevel error -i "${silent}" -i "${wav}" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "${final}"`);
    fs.unlinkSync(silent); fs.unlinkSync(wav);
    console.log('wrote', final);
  }
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
