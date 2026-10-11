'use strict';
/* =========================================================
   THEME WEDDING — trailer director
   Plays the real game through a fixed shot list with camera moves, captions and title cards.
   record.js steps it one frame at a time (window.TR.step) and screenshots each frame.
   ========================================================= */
const FPS = 30;
const ov = document.getElementById('ov'), oc = ov.getContext('2d');
const FONT = '"Press Start 2P", monospace';
const TR = window.TR = { shots: [], ix: -1, frame: 0, toasts: [], flags: {}, fdReady: false, soReady: false, cam: null };

// ---------- helpers ----------
const ease = (u) => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
const lerp = (a, b, u) => a + (b - a) * u;
const byName = (n) => G.people.find(p => p.name === n || p.name.split(' ')[0] === n);
const here = (p) => p && p.present && !p.hidden;
function ff(cond, cap) { // fast-forward the sim silently until cond() (or game time reaches cap)
  const ctx = AU.ctx; AU.ctx = null;
  let n = 0;
  while (G.running && !cond() && G.time < cap && n++ < 40000) update(0.05);
  AU.ctx = ctx;
  G.parts = []; // no stray confetti across a cut
}
const ffTo = (t) => ff(() => G.time >= t, t);
function danceFloor(frac, filter) {
  for (const p of guests()) if (here(p) && !p.sitting && ['idle', 'chat', 'walk', 'watch'].includes(p.state) && (!filter || filter(p)) && chance(frac)) { interrupt(p); goDance(p); }
}
// camera targets are in tile coords; a person is aimed at their middle
const at = (x, y, z) => ({ x, y, z });
const on = (p, z, dy) => ({ x: p.x, y: p.y, z, lift: dy == null ? 12 : dy });

// ---------- game hooks ----------
toast = function (text, cls) { if (text.indexOf(': "') < 0) TR.toasts.push({ text, cls, t: TRA.vt }); }; // catchphrases already show as a speech bubble
const _circ = circ;
circ = (c, x, y, r) => _circ(c, x, y, TR.bigSparks && r === 0.6 ? 1.7 : r); // fireworks sparks, sized up for the finale
const _evFirstDance = evFirstDance, _evSendoff = evSendoff;
evFirstDance = () => ({ __fd: true });
evSendoff = () => ({ __so: true });
queueEvent = function (ev) { // no faxes in the trailer: scripted beats are triggered by the shots below
  if (!ev) return;
  if (ev.__fd) { TR.fdReady = true; return; }
  if (ev.__so) { TR.soReady = true; return; }
  if (ev.after) { try { ev.after(); } catch (e) { console.error(e); } }
};
const _dogAisleWalk = dogAisleWalk;
dogAisleWalk = function () { const c = chance; chance = () => true; try { _dogAisleWalk(); } finally { chance = c; } }; // Barnie always stops for a poo

function setupDay() {
  pickTwist = () => TWISTS.find(t => t.id === 'magician') || TWISTS[0]; // a gentle twist that doesn't reshuffle the timetable
  startDay(1, (GUEST_LIST && GUEST_LIST.groom) || 'Nick', (GUEST_LIST && GUEST_LIST.bride) || 'Olga'); closeModal();
  G.weather = 'Sunny'; G.rainSpells = []; G.sickPlan = []; G.goatAt = 0; G.goatTimes = []; G.nextEvent = 1e9; G.explodeAt = 0;
  G.money = 99999;
  const buy = (t, x, y) => { if (canPlace(t, x, y)) placeObj(t, x, y); };
  const hd = (r, x, y) => { const p = mkPerson('staff', r, r, staffLook(r)); p.baseSpd = p.spd = 1.8; G.people.push(p); p.present = true; p.x = x + .5; p.y = y + .5; p.state = 'idle'; if (r === 'dj') G.djHired = true; };
  buy('bar', 26, 13); buy('bar', 9, 13); hd('bartender', 25, 12); hd('bartender', 9, 12);
  buy('portaloo', 2, 20); buy('portaloo', 3, 20); buy('canape', 10, 19); buy('fountain', 23, 8); buy('booth', 15, 21); buy('castle', 2, 13);
  buy('plant', 14, 2); buy('lights', 23, 18); buy('lights', 11, 20); buy('lights', 16, 13); buy('parasol', 4, 17); buy('bin', 11, 13);
  hd('waiter', 20, 12); hd('waiter', 20, 12); hd('waiter', 20, 12); hd('cleaner', 15, 12); hd('cleaner', 10, 16); hd('bouncer', 14, 15); hd('dj', 19, 11);
  TR.glen = byName('Glen');
  TR.rob = G.exploder || G.bestMan2 || G.bestMan;
  if (TR.glen) { const a = G.arrivals.find(a => a.p === TR.glen); if (a) a.t = 640; }
  G.dogAt = 601.2;
}

// ---------- the shot list ----------
const card = (lines) => (c, lt, W, H) => {
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  lines.forEach((l, i) => {
    const a = ease((lt - l.t) / 0.45);
    if (a <= 0) return;
    c.globalAlpha = a;
    text(c, l.s, W / 2, H / 2 + (i - (lines.length - 1) / 2) * 64 + (1 - a) * 10, l.size || 30, l.col || '#fff');
    c.globalAlpha = 1;
  });
};
function logo(c, W, H, a, sub) {
  c.globalAlpha = a;
  text(c, 'THEME', W / 2, H / 2 - 64, 56, '#ffffff');
  text(c, 'WEDDING', W / 2, H / 2 + 14, 72, '#ffd84a');
  if (sub) text(c, sub, W / 2, H / 2 + 96, 18, '#ff8fc0');
  c.globalAlpha = 1;
}

TR.shots = [
  { id: 'cold', dur: 5.2, mult: 0, card: card([{ t: 0.3, s: 'ONE DAY.' }, { t: 1.6, s: 'THE SAME DAY.' }, { t: 2.9, s: 'OVER AND OVER.', col: '#ffd84a' }]) },
  { id: 'logo', dur: 3.6, mult: 1, setup() { ffTo(596); },
    cam: (lt) => at(lerp(10, 8, ease(lt / 3.6)), lerp(8, 12, ease(lt / 3.6)), 1.7),
    overlay(c, lt, W, H) { c.fillStyle = 'rgba(10,8,30,' + (0.62 - 0.25 * ease((lt - 2.4) / 1.2)) + ')'; c.fillRect(0, 0, W, H); logo(c, W, H, ease(lt / 0.6) * (1 - ease((lt - 2.9) / 0.6)), 'Nick & Olga\'s big day'); } },
  { id: 'arrive', dur: 5, mult: 3, setup() { ffTo(600.5); },
    cam: (lt) => at(lerp(7, 7.5, ease(lt / 5)), lerp(20, 16, ease(lt / 5)), lerp(3.2, 2.6, ease(lt / 5))),
    caption: [[0.3, 4.6, 'THE GATES OPEN AT TEN...']] },
  { id: 'glen', dur: 5.4, mult: 1.6, setup() { if (TR.glen) ff(() => G.time >= 639.3, 639.3); },
    cam: (lt) => (TR.glen && here(TR.glen) ? on(TR.glen, 5) : at(6.5, 22, 5)), snapFollow: true,
    caption: [[0.2, 2.2, 'SOME GUESTS KNOW HOW'], [2.2, 5.2, 'TO MAKE AN ENTRANCE.']] },
  { id: 'aisle', dur: 5.8, mult: 2.1, smooth: 0.12, setup() { ffTo(664.95); },
    cam: (lt) => (G.bride.present ? on(G.bride, 3.8, 6) : at(6.5, 21, 3.8)),
    caption: [[0.3, 3, 'HERE COMES THE BRIDE...'], [3.1, 5.6, '...AND BARNIE.']] },
  { id: 'vows', dur: 6.4, mult: 0.8, setup() { ff(() => G.brideArrived, 760); G.parts = []; },
    cam: (lt) => Object.assign(at(lerp(6.6, 6.5, ease(lt / 6)), lerp(3.6, 3.1, ease(lt / 6)), lerp(4.6, 5.4, ease(lt / 6))), { lift: 14 }),
    caption: [[0.4, 3.9, 'SAY "I DO"...'], [4.3, 6.3, 'JUST MARRIED!']] },
  { id: 'firstdance', dur: 6.5, mult: 1, setup() {
      ff(() => TR.fdReady, 1180);
      for (const c of [G.groom, G.bride]) { c.path = []; c.state = 'fdwait'; } G.groom.x = 19.3; G.groom.y = 16.75; G.bride.x = 19.75; G.bride.y = 16.3;
      firstDanceAfter();
    },
    at: [[0.4, () => heartsAt(19.5, 16.5, 10)], [2.2, () => heartsAt(19.5, 16.5, 10)], [4, () => heartsAt(19.5, 16.5, 12)]],
    cam: (lt) => at(19.6, lerp(15.6, 16.2, ease(lt / 6.5)), lerp(4.2, 5, ease(lt / 6.5))),
    caption: [[0.4, 6.2, 'NAIL THE FIRST DANCE.']] },
  { id: 'party', dur: 5.2, mult: 1.4, setup() { ffTo(1196); danceFloor(0.85); ffTo(1199); },
    at: [[0.1, () => danceFloor(0.8)]],
    cam: (lt) => at(lerp(17, 21, ease(lt / 5.2)), lerp(17.5, 15.5, ease(lt / 5.2)), 3.2),
    caption: [[0.3, 4.9, 'KEEP THE DANCE FLOOR FULL.']] },
  { id: 'cossack', dur: 4.8, mult: 1.2, setup() {
      G.musicOverride = { track: 'korob', start: G.time, until: G.time + 30 };
      danceFloor(1, p => p.russian); danceFloor(0.5); ffTo(G.time + 2.5);
    },
    cam: (lt) => at(19.2, 16.8, lerp(3.6, 4.4, ease(lt / 4.8))),
    caption: [[0.3, 4.6, 'THE RUSSIAN SIDE WILL OUT-DANCE YOU.']] },
  { id: 'boom', dur: 5.4, mult: 0.9, setup() {
      G.musicOverride = null;
      const r = TR.rob, X = 18.5, Y = 19.5; interrupt(r); r.present = true; r.hidden = false; r.sitting = false; r.path = [];
      r.x = X; r.y = Y; r.state = 'dance'; r.danceSpeed = 14; r.timer = 99; r.onTimer = null; r.drunk = Math.max(r.drunk, 60);
      for (const p of G.people) if (p !== r && p.present && dist(p.x, p.y, X, Y) < 2.2) { interrupt(p); p.x = p.x < X ? X - 2.4 : X + 2.4; p.y = Y - 2.2; p.path = []; p.state = 'idle'; p.idleT = 3; } // give him the floor
    },
    at: [[0.2, () => shout(TR.rob, 'BEST. WEDDING. EVER!', 6)], [2.4, () => explodeGuest(TR.rob)]],
    cam: (lt) => Object.assign(lt < 2.4 ? at(18.5, 19.5, lerp(4.4, 5.4, ease(lt / 2.4))) : at(18.5, 19.2, lerp(5.4, 4.4, ease((lt - 2.4) / 0.6))), { lift: 22 }),
    caption: [[0.2, 2.3, 'AND WHATEVER YOU DO...'], [2.6, 5.3, "DON'T LET THE BEST MAN EXPLODE."]] },
  { id: 'back', dur: 4.6, mult: 1.2, setup() {
      ff(() => here(TR.rob), G.time + 20); G.parts = [];
      shout(TR.rob, "I'm back! What did I miss?", 8);
    },
    cam: () => on(TR.rob, 5.2), snapFollow: true,
    caption: [[0.6, 4.4, '(HE GOT BETTER.)']] },
  { id: 'sendoff', dur: 6.6, mult: 1.2, smooth: 0.06, setup() {
      ff(() => TR.soReady, 1430);
      G.bigFireworks = true; coupleExit(); G.fireworks = 90; TR.bigSparks = true;
    },
    cam: (lt) => lt < 3.6 ? on(G.groom, 3.6, 10) : at(8, 9, 2.2),
    caption: [[0.4, 3.4, 'MAKE IT PERFECT.'], [3.6, 6.4, 'THEN DO IT ALL AGAIN TOMORROW.']] },
  { id: 'end', dur: 5.6, mult: 1.2,
    cam: (lt) => at(8, 9, lerp(2.2, 2, ease(lt / 5.6))),
    overlay(c, lt, W, H) {
      c.fillStyle = 'rgba(8,6,24,' + 0.7 * ease(lt / 0.8) + ')'; c.fillRect(0, 0, W, H);
      logo(c, W, H, ease((lt - 0.3) / 0.8), 'NICK & OLGA');
      const a = ease((lt - 1.5) / 0.6); c.globalAlpha = a;
      text(c, 'PLAY FREE IN YOUR BROWSER', W / 2, H - 140, 16, '#ffffff');
      text(c, 'kb-bear.github.io/theme-wedding', W / 2, H - 108, 16, '#9dff8a');
      c.globalAlpha = 1;
      if (lt > 4.6) { c.fillStyle = 'rgba(0,0,0,' + ease((lt - 4.6) / 1) + ')'; c.fillRect(0, 0, W, H); }
    } },
];
let acc = 0; for (const s of TR.shots) { s.start = acc; acc += s.dur; }
TR.duration = acc;
TR.frames = Math.round(acc * FPS);

// ---------- drawing ----------
function text(c, s, x, y, size, col) {
  c.font = size + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
  const sh = Math.max(2, Math.round(size / 8));
  c.fillStyle = '#000'; c.fillText(s, x + sh, y + sh);
  c.fillStyle = col; c.fillText(s, x, y);
}
const BAR = 0.075; // letterbox height as a fraction of the frame
function drawOverlay(sh, lt) {
  const W = ov.width, H = ov.height;
  oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, W, H);
  if (sh.card) { sh.card(oc, lt, W, H); return; }
  // toasts from the game (KABOOM!, catchphrases, JUST MARRIED!)
  TR.toasts = TR.toasts.filter(t => TRA.vt - t.t < 2.2);
  TR.toasts.forEach((t, i) => {
    const u = (TRA.vt - t.t) / 2.2;
    oc.globalAlpha = u < 0.75 ? 1 : 1 - (u - 0.75) / 0.25;
    const col = { bad: '#ff5a5a', good: '#9dff8a', pink: '#ff8fc0' }[t.cls] || '#ffd84a';
    text(oc, t.text, W / 2, H * 0.27 - u * 40 + i * 34, 22, col);
    oc.globalAlpha = 1;
  });
  if (sh.overlay) sh.overlay(oc, lt, W, H);
  // letterbox
  oc.fillStyle = '#000'; oc.fillRect(0, 0, W, H * BAR); oc.fillRect(0, H * (1 - BAR), W, H * BAR);
  for (const [t0, t1, s] of sh.caption || []) {
    if (lt < t0 || lt > t1) continue;
    const a = Math.min(ease((lt - t0) / 0.3), ease((t1 - lt) / 0.3));
    oc.globalAlpha = a;
    text(oc, s, W / 2, H * (1 - BAR) - 46 + (1 - a) * 8, 24, '#ffffff');
    oc.globalAlpha = 1;
  }
  // quick fade through black on each cut
  const fin = 1 - ease(lt / 0.18), fout = ease((lt - (sh.dur - 0.12)) / 0.12);
  const f = Math.max(fin, fout);
  if (f > 0.01) { oc.fillStyle = 'rgba(0,0,0,' + f + ')'; oc.fillRect(0, 0, W, H); }
}
function camTarget(sh, lt) {
  const t = sh.cam(lt), s = iso(t.x, t.y);
  return { x: s.x, y: s.y - (t.lift || 0), z: t.z };
}
function drawWorld(sh, lt, dt) {
  if (sh.mult) { G.clock += dt * Math.min(sh.mult, 2); update(dt * sh.mult); }
  for (const [t, f, ] of sh.at || []) { const k = sh.id + t; if (lt >= t && !TR.flags[k]) { TR.flags[k] = true; f(); } }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#16301a'; ctx.fillRect(0, 0, cv.width, cv.height);
  if (!sh.cam) return;
  const tg = camTarget(sh, lt);
  if (!TR.cam) TR.cam = Object.assign({}, tg);
  else { const k = sh.smooth || (sh.snapFollow ? 0.2 : 1); TR.cam.x = lerp(TR.cam.x, tg.x, k); TR.cam.y = lerp(TR.cam.y, tg.y, k); TR.cam.z = lerp(TR.cam.z, tg.z, k); }
  cam.x = TR.cam.x; cam.y = TR.cam.y; zoom = TR.cam.z;
  renderWorld(G.clock);
  const o = viewOrigin();
  if (G.shake > 0) { G.shake -= dt; const a = Math.max(0, G.shake) * 14; o.x += rnd(-a, a); o.y += rnd(-a, a); }
  const k = DPR * zoom / RS;
  ctx.imageSmoothingEnabled = k < 0.99;
  ctx.setTransform(k, 0, 0, k, Math.round(o.x * DPR), Math.round(o.y * DPR));
  ctx.drawImage(wc, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- stepping API for record.js ----------
TR.begin = async function () {
  await document.fonts.load('24px "Press Start 2P"');
  await new Promise(r => whenAssetsReady(r));
  ov.width = innerWidth; ov.height = innerHeight;
  TRA.off = new OfflineAudioContext(2, Math.ceil(44100 * (TR.duration + 0.5)), 44100);
  auInit();
  AU.master.gain.setValueAtTime(0.0001, 0); AU.master.gain.linearRampToValueAtTime(0.55, 0.6);
  AU.master.gain.setValueAtTime(0.55, TR.duration - 1.4); AU.master.gain.linearRampToValueAtTime(0.0001, TR.duration);
  setupDay();
  hudH = 0;
  return { frames: TR.frames, duration: TR.duration, glen: !!TR.glen, rob: TR.rob && TR.rob.name };
};
TR.step = function () {
  const i = TR.frame++, dt = 1 / FPS;
  TRA.vt = i / FPS;
  let ix = TR.shots.findIndex(s => TRA.vt >= s.start && TRA.vt < s.start + s.dur);
  if (ix < 0) ix = TR.shots.length - 1;
  const sh = TR.shots[ix];
  if (ix !== TR.ix) { TR.ix = ix; TR.cam = null; if (sh.setup) sh.setup(); }
  const lt = TRA.vt - sh.start;
  if (sh.card) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height); }
  else drawWorld(sh, lt, dt);
  musicTick();
  drawOverlay(sh, lt);
  return { shot: sh.id, time: fmtTime(G.time) };
};
TR.audio = async function () { // render the offline mix and hand it back as a base64 WAV
  const buf = await TRA.off.startRendering();
  const n = buf.length, ch = [buf.getChannelData(0), buf.getChannelData(1)];
  const out = new DataView(new ArrayBuffer(44 + n * 4));
  const w = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
  out.setUint32(24, 44100, true); out.setUint32(28, 44100 * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * 4, true);
  for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < 2; c++, o += 2) out.setInt16(o, Math.max(-1, Math.min(1, ch[c][i])) * 32767, true);
  const bytes = new Uint8Array(out.buffer); let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
