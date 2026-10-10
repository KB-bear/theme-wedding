'use strict';
/* =========================================================
   THEME WEDDING — UI, input (mouse + touch), camera, main loop
   ========================================================= */
const cv = document.getElementById('screen');
const ctx = cv.getContext('2d');
const $ = (id) => document.getElementById(id);
const IS_TOUCH = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const ZMIN = 0.5, ZMAX = 4;
let zoom = 2, cam = { x: WORLD_W / 2, y: WORLD_H / 2 }, hudH = 70, DPR = 1, VW = 800, VH = 600;
const mouse = { x: 0, y: 0, down: false, drag: false, sx: 0, sy: 0, cx: 0, cy: 0, btn: 0, type: 'mouse' };
const pointers = new Map();
let pinch = null;
const keys = {};
let sideMode = null, infoFor = null, lastHud = 0, lastInfo = 0, lastSideRefresh = 0;
const SPEEDS = [0, 1, 2, 4];

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }

// ---------- camera ----------
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  VW = innerWidth; VH = innerHeight;
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  hudH = $('hud').offsetHeight || 70;
  document.documentElement.style.setProperty('--hudh', (hudH + 6) + 'px');
  clampCam();
}
function viewOrigin() { return { x: VW / 2 - cam.x * zoom, y: (VH - hudH) / 2 - cam.y * zoom }; }
function s2w(mx, my) { const o = viewOrigin(); return { x: (mx - o.x) / zoom, y: (my - o.y) / zoom }; }
function clampCam() { cam.x = clamp(cam.x, 60, WORLD_W - 60); cam.y = clamp(cam.y, 40, WORLD_H - 40); }
function zoomAt(nz, mx, my) {
  nz = clamp(nz, ZMIN, ZMAX);
  const before = s2w(mx, my);
  zoom = nz;
  const after = s2w(mx, my);
  cam.x += before.x - after.x; cam.y += before.y - after.y; clampCam();
}
function defaultZoom() {
  // crisp 1:1 pixel art on normal screens; slightly zoomed out on small phones
  zoom = zoomForK(VW >= 900 ? 1 : 0.75);
}

// ---------- input ----------
cv.addEventListener('pointerdown', (e) => {
  auInit();
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: zoom, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, cx: cam.x, cy: cam.y };
    mouse.drag = true; return;
  }
  if (e.pointerType === 'touch') $('tip').style.display = 'none'; // no hover labels on touch
  mouse.down = true; mouse.btn = e.button; mouse.type = e.pointerType;
  mouse.x = mouse.sx = e.clientX; mouse.y = mouse.sy = e.clientY; mouse.cx = cam.x; mouse.cy = cam.y; mouse.drag = false;
});
cv.addEventListener('pointermove', (e) => {
  if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && pointers.size >= 2) {
    const [a, b] = [...pointers.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    zoom = clamp(pinch.z * d / Math.max(10, pinch.d), ZMIN, ZMAX);
    cam.x = pinch.cx - (mx - pinch.mx) / zoom; cam.y = pinch.cy - (my - pinch.my) / zoom; clampCam();
    return;
  }
  mouse.x = e.clientX; mouse.y = e.clientY; mouse.type = e.pointerType;
  if (mouse.down) {
    const dx = e.clientX - mouse.sx, dy = e.clientY - mouse.sy;
    if (!mouse.drag && Math.hypot(dx, dy) > (e.pointerType === 'touch' ? 12 : 7)) mouse.drag = true;
    if (mouse.drag) { cam.x = mouse.cx - dx / zoom; cam.y = mouse.cy - dy / zoom; clampCam(); }
  }
  if (e.pointerType !== 'touch') updateHover();
});
function endPointer(e) {
  pointers.delete(e.pointerId);
  if (pinch) { if (pointers.size < 2) { pinch = null; mouse.down = false; snapZoom(); } return; }
  if (!mouse.down) return;
  mouse.down = false;
  if (!mouse.drag) { if (e.button === 2) rightClick(); else { mouse.x = e.clientX; mouse.y = e.clientY; leftClick(e.pointerType); } }
}
cv.addEventListener('pointerup', endPointer);
cv.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); pinch = null; mouse.down = false; });
cv.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') { $('tip').style.display = 'none'; if (G && !IS_TOUCH) G.hover = null; } });
cv.addEventListener('contextmenu', (e) => e.preventDefault());
// pixel-art friendly zoom levels: K = screen pixels per art pixel
const KSTEPS = [0.5, 0.75, 1, 1.5, 2, 3];
function kOf(z) { return DPR * z / RS; }
function zoomForK(k) { return k * RS / DPR; }
function stepZoom(dir, mx, my) {
  const k = kOf(zoom); let i = 0, bd = 1e9;
  KSTEPS.forEach((s, j) => { const d = Math.abs(s - k); if (d < bd) { bd = d; i = j; } });
  i = clamp(i + dir, 0, KSTEPS.length - 1);
  zoomAt(zoomForK(KSTEPS[i]), mx, my);
}
function snapZoom() { const k = kOf(zoom); let best = KSTEPS[0]; for (const s of KSTEPS) if (Math.abs(s - k) < Math.abs(best - k)) best = s; zoomAt(zoomForK(best), VW / 2, (VH - hudH) / 2); }
cv.addEventListener('wheel', (e) => { e.preventDefault(); stepZoom(e.deltaY < 0 ? 1 : -1, e.clientX, e.clientY); }, { passive: false });
addEventListener('resize', () => { resize(); renderSide(); });
addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  keys[k] = true;
  if (!G || !G.running || G.modalOpen) return;
  if (k === ' ') { e.preventDefault(); setSpeed(G.speed === 0 ? (G.lastSpeed || 1) : 0); }
  else if (k === '1' || k === '2' || k === '3') setSpeed(+k);
  else if (k === 'b') toggleSide('build');
  else if (k === 'h') toggleSide('hire');
  else if (k === 'Escape') rightClick();
  else if (k === '+' || k === '=') stepZoom(1, VW / 2, (VH - hudH) / 2);
  else if (k === '-') stepZoom(-1, VW / 2, (VH - hudH) / 2);
  else if ((k === 'Delete' || k === 'Backspace') && G.sel && G.sel.type && !G.sel.fixed) sellObj(G.sel);
});
// pause automatically if the tab is hidden, so the day doesn't run away while you're elsewhere
document.addEventListener('visibilitychange', () => { if (document.hidden && G && G.running && !G.modalOpen && G.speed > 0) setSpeed(0); });
addEventListener('keyup', (e) => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; keys[k] = false; });

function nearestRat(wx, wy, r) {
  let best = null, bd = r;
  for (const a of G.people) {
    if (a.kind !== 'animal' || a.role !== 'rat' || !a.present || a.dead) continue;
    const s = iso(a.x, a.y); const d = Math.hypot(s.x - wx, s.y - 3 - wy);
    if (d < bd) { bd = d; best = a; }
  }
  return best;
}
function updateHover() {
  if (!G) return;
  const w = s2w(mouse.x, mouse.y);
  G.mouseW = w;
  const t = unIso(w.x, w.y);
  G.hover = { x: Math.floor(t.x), y: Math.floor(t.y) };
  const tip = $('tip');
  let txt = '';
  const rat = nearestRat(w.x, w.y, 14);
  cv.style.cursor = rat ? 'crosshair' : (G.build || G.hand ? 'cell' : 'default');
  if (rat) txt = 'RAT! Click to shoot it';
  else if (G.hand) txt = 'Drop ' + G.hand.name.split(' (')[0] + ' here · right-click to cancel';
  else if (G.build) { const d = OT[G.build]; txt = d.name + ' · ' + fmtMoney(d.cost) + ' · right-click to stop'; }
  else { const p = pickPerson(w.x, w.y); if (p) txt = p.name + (p.kind === 'guest' && p.role !== 'Guest' ? ' · ' + p.role : ''); }
  if (mouse.type !== 'mouse' && (IS_TOUCH || mouse.type === 'touch')) txt = ''; // a tap has no hover, so the label would never go away
  if (txt) { tip.textContent = txt; tip.style.display = 'block'; tip.style.left = (mouse.x + 16) + 'px'; tip.style.top = (mouse.y + 14) + 'px'; }
  else tip.style.display = 'none';
}
function ghostInfo() {
  if (!G.hover) return null;
  const d = OT[G.build];
  return { x: G.hover.x, y: G.hover.y, w: d.w, h: d.h, ok: canPlace(G.build, G.hover.x, G.hover.y) && G.money >= d.cost };
}
function pickPerson(wx, wy, slop) {
  slop = slop || 0;
  let best = null, bd = -1e9;
  for (const p of G.people) {
    if (!p.present || p.hidden) continue;
    const s = iso(p.x, p.y);
    const h = (p.look && p.look.kid ? 18 : 24) * PERSON_SCALE;
    if (wx >= s.x - 6 - slop && wx <= s.x + 6 + slop && wy >= s.y - h - slop && wy <= s.y + 2 + slop) {
      const d = p.x + p.y; if (d > bd) { bd = d; best = p; }
    }
  }
  return best;
}
function leftClick(ptype) {
  if (!G || !G.running || G.modalOpen) return;
  const touch = ptype === 'touch';
  const w = s2w(mouse.x, mouse.y); const t = unIso(w.x, w.y);
  const tx = Math.floor(t.x), ty = Math.floor(t.y);
  G.mouseW = w;
  // rats first: you shoot them!
  const rat = nearestRat(w.x, w.y, touch ? 18 : 12);
  if (rat) { shootRat(rat); return; }
  if (nearestRat(w.x, w.y, 40)) { const s = { x: w.x, y: w.y }; spawnP('poof', s.x, s.y, { life: 0.35, max: 0.35 }); SFX.shot(); }
  if (G.hand) { dropHand(tx, ty); return; }
  if (G.build) {
    // touch: first tap previews, second tap on the same spot places
    if (touch && !(G.hover && G.hover.x === tx && G.hover.y === ty)) { G.hover = { x: tx, y: ty }; renderPlaceBar(); return; }
    G.hover = { x: tx, y: ty };
    tryBuild(G.build, tx, ty); return;
  }
  const p = pickPerson(w.x, w.y, touch ? 4 : 0);
  if (p) { select(p); SFX.click(); return; }
  const m = G.messes.find(m => Math.floor(m.x) === tx && Math.floor(m.y) === ty);
  if (m) { priorityClean(m); return; }
  if (inBounds(tx, ty) && occ[ty][tx]) { select(occ[ty][tx]); SFX.click(); return; }
  select(null);
}
function rightClick() {
  if (!G) return;
  if (G.hand) { cancelHand(); return; }
  if (G.build) { stopBuild(); return; }
  if (sideMode) { toggleSide(null); return; }
  select(null);
}

// ---------- actions ----------
function setSpeed(s) {
  if (s > 0) G.lastSpeed = s;
  G.speed = s; SFX.click(); updateHud(true);
}
function startBuild(type) {
  G.build = type; select(null); sideMode = null; G.hover = IS_TOUCH ? null : G.hover;
  renderSide(); renderPlaceBar(); SFX.click();
}
function stopBuild() { G.build = null; renderPlaceBar(); renderSide(); }
function tryBuild(type, tx, ty) {
  const d = OT[type];
  if (G.money < d.cost) { msg("You can't afford a " + d.name + '!', 'bad'); SFX.bad(); return; }
  if (!canPlace(type, tx, ty)) { SFX.bad(); toast("Can't place it there", 'bad'); return; }
  const o = placeObj(type, tx, ty);
  G.money -= d.cost; SFX.place();
  for (const p of G.people) {
    if (!p.present || p.hidden || p.state === 'use') continue;
    if (occ[Math.floor(p.y)][Math.floor(p.x)] === o && OT[o.type].block) { stepOut(p); if (p.state === 'walk') interrupt(p); }
  }
  if (G.money < d.cost) stopBuild();
  updateHud(true); renderPlaceBar();
}
function sellObj(o) {
  if (o.fixed) return;
  const refund = Math.round(OT[o.type].cost * 0.5);
  removeObj(o); G.money += refund; SFX.cash();
  msg('Sold ' + OT[o.type].name + ' for ' + fmtMoney(refund) + '.', '');
  select(null);
}
function hire(role) {
  if (!G || !G.running || G.modalOpen) return;
  if (G.hand) cancelHand();
  let cost = STAFF[role].cost;
  if (role === 'dj') { if (G.djHired) { msg('You already have a DJ!', 'bad'); SFX.bad(); return; } if (G.omens.has('djfav')) cost = cost / 2; }
  if (G.money < cost) { msg("You can't afford a " + STAFF[role].name + '!', 'bad'); SFX.bad(); return; }
  G.money -= cost;
  const p = mkPerson('staff', role, pick(staffNames(role)) + ' (' + STAFF[role].name + ')', staffLook(role));
  p.baseSpd = p.spd = role === 'bouncer' ? 1.6 : (role === 'waiter' ? 1.9 : 1.7); p.newHire = true; p.cost = cost; p.present = false; p.state = 'idle';
  G.people.push(p); G.hand = p; G.build = null; sideMode = null;
  if (role === 'dj') G.djHired = true;
  if (IS_TOUCH) G.mouseW = { x: cam.x, y: cam.y };
  SFX.cash(); updateHud(true); renderSide(); renderPlaceBar(); updateHover();
}
function dropHand(tx, ty) {
  const p = G.hand;
  if (!walk(tx, ty)) { SFX.bad(); toast("Can't stand there", 'bad'); return; }
  p.present = true; p.x = tx + 0.5; p.y = ty + 0.5; p.path = []; p.state = 'idle'; p.idleT = 0; p.newHire = false;
  G.hand = null; SFX.place(); updateHover();
  if (p.role === 'bartender') {
    let best = null, bd = 1e9;
    for (const o of G.objects) if (o.type === 'bar' && !(o.bartender && o.bartender.present && !o.bartender.fired && o.bartender !== p)) { const d = dist(o.x, o.y, p.x, p.y); if (d < bd) { bd = d; best = o; } }
    if (best) { best.bartender = p; p.postObj = best; }
  }
  renderSide(); renderPlaceBar();
}
function cancelHand() {
  const p = G.hand; if (!p) return;
  if (p.newHire) {
    G.money += p.cost; G.people.splice(G.people.indexOf(p), 1);
    if (p.role === 'dj') G.djHired = false;
  } else { p.present = true; p.x = p.prev.x; p.y = p.prev.y; p.state = 'idle'; p.idleT = 0; }
  G.hand = null; updateHud(true); renderSide(); renderPlaceBar(); updateHover();
}
function pickUp(p) {
  interrupt(p);
  if (p.postObj && p.postObj.bartender === p) p.postObj.bartender = null;
  p.postObj = null; p.prev = { x: p.x, y: p.y }; p.present = false; p.newHire = false;
  G.hand = p; select(null); SFX.click(); renderPlaceBar();
}
function sack(p) {
  interrupt(p);
  if (p.postObj && p.postObj.bartender === p) p.postObj.bartender = null;
  p.postObj = null; p.fired = true; leave(p, 'fired');
  if (p.role === 'dj') G.djHired = false;
  msg(p.name + ' has been sacked. They take it well.', ''); select(null); renderSide();
}
function priorityClean(m) {
  m.priority = true;
  const cs = staffOf('cleaner').filter(c => c.present && c.state !== 'leave');
  if (!cs.length) { msg('You need a Cleaner to clean that up!', 'bad'); SFX.bad(); return; }
  let best = null, bd = 1e9;
  for (const c of cs) { const d = dist(c.x, c.y, m.x, m.y) + (c.job ? 6 : 0); if (d < bd) { bd = d; best = c; } }
  if (m.claim && m.claim !== best) { const old = m.claim; m.claim = null; if (old.job && old.job.m === m) { interrupt(old); } }
  interrupt(best); cleanJob(best, m, 1.5);
  msg(best.name.split(' (')[0] + ' is on it!', ''); SFX.click();
}

// ---------- placing bar (compact, so the map stays usable on phones) ----------
function renderPlaceBar() {
  const el = $('placebar');
  if (!G || (!G.build && !G.hand)) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  if (G.hand) {
    el.innerHTML = `<span class="pt">Place <b>${esc(G.hand.name.split(' (')[0])}</b> · ${IS_TOUCH ? 'tap a floor tile' : 'click a floor tile'}</span><button data-pb="cancel">Cancel</button>`;
  } else {
    const d = OT[G.build];
    const hint = IS_TOUCH ? (G.hover ? (ghostInfo() && ghostInfo().ok ? 'Tap the green spot again to place' : 'Red = blocked, tap elsewhere') : 'Tap where it should go') : 'Click to place (repeat for more)';
    el.innerHTML = `<span class="pt"><b>${esc(d.name)}</b> ${fmtMoney(d.cost)} · ${hint}</span><button data-pb="change">Change</button><button data-pb="done">Done</button>`;
  }
}
$('placebar').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  SFX.click();
  if (b.dataset.pb === 'cancel') cancelHand();
  if (b.dataset.pb === 'done') stopBuild();
  if (b.dataset.pb === 'change') { G.build = null; renderPlaceBar(); toggleSide('build'); }
});

// ---------- side panel (build / hire) ----------
function toggleSide(mode) {
  if (!G || !G.running) return;
  sideMode = (sideMode === mode) ? null : mode;
  if (sideMode) { G.build = null; if (G.hand) cancelHand(); select(null); }
  renderSide(); renderPlaceBar(); SFX.click();
}
function hiCanvas(w, h, attr, val) { return `<canvas width="${w * 2}" height="${h * 2}" style="width:${w}px;height:${h}px" ${attr}="${val}"></canvas>`; }
function renderSide() {
  const el = $('side');
  $('bBuild').classList.toggle('on', sideMode === 'build' || !!(G && G.build));
  $('bHire').classList.toggle('on', sideMode === 'hire');
  if (!sideMode || !G) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  let html = '';
  if (sideMode === 'build') {
    html += `<div class="ph">FURNISH <span class="sub">pick an item, then ${IS_TOUCH ? 'tap' : 'click'} the map</span><button class="x" data-act="close">×</button></div><div class="grid">`;
    for (const t of BUY_ORDER) {
      const d = OT[t];
      html += `<button class="item ${G.money < d.cost ? 'poor' : ''}" data-build="${t}" title="${esc(d.desc)}">${hiCanvas(72, 62, 'data-prev', t)}<span class="nm">${esc(d.name)}</span><span class="cost">${fmtMoney(d.cost)}</span></button>`;
    }
    html += `</div><div class="desc">${IS_TOUCH ? 'Tip: select a placed item to sell it.' : 'Hover an item for details. Right-click to stop placing. Select a placed item to sell it.'}</div>`;
  } else {
    html += `<div class="ph">HIRE STAFF <span class="sub">then ${IS_TOUCH ? 'tap' : 'click'} where they start</span><button class="x" data-act="close">×</button></div><div class="grid">`;
    for (const r of Object.keys(STAFF)) {
      const s = STAFF[r];
      let cost = s.cost; if (r === 'dj' && G.omens.has('djfav')) cost /= 2;
      const n = staffOf(r).length;
      const dis = (r === 'dj' && G.djHired);
      html += `<button class="item ${G.money < cost || dis ? 'poor' : ''}" data-hire="${r}" title="${esc(s.desc)}">${hiCanvas(72, 62, 'data-staff', r)}<span class="nm">${esc(s.name)}${n ? ' ×' + n : ''}</span><span class="cost">${dis ? 'HIRED' : fmtMoney(cost)}</span></button>`;
    }
    html += '</div><div class="desc">Waiters serve dinner &amp; canapés · Bartenders run bars · Cleaners mop (and keep rats away) · Bouncers stop fights &amp; goats · The DJ makes the party.</div>';
  }
  el.innerHTML = html;
  el.querySelectorAll('canvas[data-prev]').forEach(c => { const x = c.getContext('2d'); x.scale(2, 2); drawObjPreview(x, c.dataset.prev, 36, 42); });
  el.querySelectorAll('canvas[data-staff]').forEach(c => { const x = c.getContext('2d'); x.scale(3.6, 3.6); drawPersonPreview(x, PREVIEW_LOOKS[c.dataset.staff], 20, 32.5, c.dataset.staff); });
}
const PREVIEW_LOOKS = {};
for (const r of Object.keys(STAFF)) PREVIEW_LOOKS[r] = staffLook(r);
$('side').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.act === 'close') { toggleSide(null); return; }
  if (b.dataset.build) startBuild(b.dataset.build);
  if (b.dataset.hire) hire(b.dataset.hire);
});
$('side').addEventListener('mouseover', (e) => {
  const b = e.target.closest('button[data-build],button[data-hire]'); if (!b) return;
  const d = b.dataset.build ? OT[b.dataset.build] : STAFF[b.dataset.hire];
  const de = $('side').querySelector('.desc'); if (de) de.innerHTML = '<b>' + esc(d.name) + ':</b> ' + esc(d.desc);
});

// ---------- info panel ----------
function select(x) {
  if (!G) return;
  G.sel = x; infoFor = null;
  if (x) renderInfo(true); else $('info').classList.add('hidden');
}
const STATE_TXT = { idle: 'Mingling', walk: 'Walking', queue: 'Queueing', seated: 'Sitting down', dance: 'Dancing!', chat: 'Chatting', sleep: 'Asleep (zzz)', fight: 'FIGHTING!', leave: 'Leaving', watch: 'Watching', conga: 'In the conga line!', fallen: 'On the floor', atpost: 'At their post', work: 'Working', script: 'Walking the aisle', altar: 'At the altar', cakewait: 'At the cake', fdwait: 'On the dance floor', sowait: 'Ready to leave', off: 'Not arrived', sick: 'Being sick!' };
function stateText(p) {
  if (p.state === 'use' && p.useObj) {
    return { bar: 'At the bar', toilet: 'In the loo', portaloo: 'In the portaloo', booth: 'In the photo booth', castle: 'Bouncing!', canape: 'Eating canapés', fountain: 'At the choc fountain', cake: 'Eating cake', samovar: 'Having tea' }[p.useObj.type] || 'Busy';
  }
  if (p.state === 'walk' && p.useObj) return 'Heading to the ' + OT[p.useObj.type].name;
  if (p.state === 'chat' && p.chatWith) return 'Chatting with ' + p.chatWith.name;
  if (p.kind === 'staff' && p.job) return { serve: 'Serving dinner', clean: 'Cleaning up', fight: 'Breaking up a fight' }[p.job.type] || 'Working';
  if (p.eating > 0) return 'Eating';
  if (p.needServe) return 'Waiting for food (' + Math.floor(p.waitServe) + ' min)';
  if (p.role === 'goat' && p.cakeRun) return 'HEADING FOR THE CAKE!';
  return STATE_TXT[p.state] || p.state;
}
function bar(label, v, good) {
  v = clamp(v, 0, 100);
  const col = good ? (v > 60 ? '#5fd068' : v > 30 ? '#ffd25a' : '#ff5a5a') : (v > 70 ? '#ff5a5a' : v > 45 ? '#ffd25a' : '#5fd068');
  return `<div class="br"><span>${label}</span><div class="meter"><i style="width:${v}%;background:${col}"></i></div></div>`;
}
function renderInfo(full) {
  const x = G.sel; const el = $('info');
  if (!x) { el.classList.add('hidden'); return; }
  if (x.present === false && x.kind) { select(null); return; }
  el.classList.remove('hidden');
  if (full || infoFor !== x) {
    infoFor = x;
    let h = '';
    if (x.kind) {
      const role = x.kind === 'couple' ? (x.role === 'groom' ? 'The Groom' : 'The Bride') : x.kind === 'staff' ? STAFF[x.role].name : x.kind === 'animal' ? (x.friendly ? 'Honoured guest' : 'Intruder') : x.role;
      h += `<div class="ph"><span class="nm">${esc(x.name)}</span><button class="x" data-act="close">×</button></div>`;
      h += `<div class="who">${x.kind !== 'animal' ? '<canvas id="portrait" width="120" height="120" style="width:60px;height:60px"></canvas>' : ''}<div><div class="role">${esc(role)}</div>`;
      if (x.trait) h += `<div class="trait">${esc(TRAITS[x.trait])}</div>`;
      if (x.role === 'groom') h += '<div class="trait">Ginger. Green suit. Beige waistcoat.</div>';
      if (x.role === 'bride') h += '<div class="trait">Dark brown hair. White dress. Dark pink shoes.</div>';
      h += '<div id="ilive_state" class="state"></div></div></div><div id="ilive"></div><div class="acts">';
      if (x.kind === 'guest') h += `<button data-act="cutoff">${x.cutOff ? 'Allow drinks' : 'Cut off drinks'}</button><button data-act="home">Send home</button>`;
      if (x.kind === 'staff') h += '<button data-act="pickup">Move</button><button data-act="sack">Sack</button>';
      h += '</div>';
    } else {
      const d = OT[x.type];
      h += `<div class="ph"><span class="nm">${esc(d.name)}</span><button class="x" data-act="close">×</button></div>`;
      h += `<div class="trait">${esc(d.desc || '')}</div><div id="ilive"></div><div class="acts">`;
      if (!x.fixed) h += `<button data-act="sell">Sell (+${fmtMoney(Math.round(d.cost / 2))})</button>`;
      h += '</div>';
    }
    el.innerHTML = h;
    const pc = $('portrait');
    if (pc) {
      const c = pc.getContext('2d');
      c.fillStyle = lgPortrait(c); c.fillRect(0, 0, 120, 120);
      c.save(); c.scale(4.4, 4.4);
      const prev = Object.assign({}, x, { x: 0, y: 0, state: 'idle', sitting: false, moving: false, onCastle: false, thoughtT: 0, face: 'f', flip: false, dir: 'down' });
      const o = iso(0, 0); c.translate(13.6 - o.x, 32.3 - o.y); drawPersonDirect(c, prev, 0); c.restore();
    }
  }
  const live = $('ilive'); if (!live) return;
  let h = '';
  if (x.kind === 'guest') {
    const n = x.needs;
    h += bar('Happy', x.happy, true) + bar('Thirst', n.thirst) + bar('Hunger', n.hunger) + bar('Bladder', n.bladder) + bar('Bored', n.fun) + bar('Tipsy', x.drunk);
  } else if (x.kind === 'couple') {
    h += bar('Bliss', G.bliss, true);
  } else if (x.kind === 'staff') {
    h += `<div class="line">Cost today: ${fmtMoney(x.cost || STAFF[x.role].cost)}</div>`;
    if (x.role === 'bartender') h += `<div class="line">${x.state === 'atpost' ? 'Serving at the bar' : (countObj('bar') ? 'Heading to a bar' : 'No bar to work at!')}</div>`;
  } else if (x.kind === 'animal') {
    if (x.role === 'goat') h += `<div class="line">${x.cakeRun ? '<b class="r">Going for the cake!</b> Get a Bouncer on it!' : 'Munching. Watch the cake...'}</div>`;
  } else {
    const d = OT[x.type];
    if (x.type === 'bar') h += `<div class="line">${barOpen(x) ? '<b class="g">OPEN</b> · ' + (G.barMode === 'free' || sponsorOn() ? 'Free bar' : 'Cash bar') : '<b class="r">CLOSED</b> · needs a Bartender'}</div>`;
    if (x.type === 'cake') h += `<div class="line">${G.cakeEaten ? '<b class="r">EATEN BY A GOAT</b>' : G.cakeCut ? G.cakeSlices + ' slices left' : 'Not cut yet'}</div>`;
    if (x.type === 'dj') h += `<div class="line">${G.djOn ? '<b class="g">PUMPING</b>' : (G.djHired ? 'Waiting for the evening' : 'No DJ hired')}</div>`;
    if (d.use) h += `<div class="line">Used ${x.uses} times · ${x.slots.filter(s => s.user).length}/${x.slots.length} in use</div>`;
  }
  live.innerHTML = h;
  const st = $('ilive_state'); if (st && x.kind) st.textContent = stateText(x);
}
function lgPortrait(c) { const g = c.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, '#bfe6ff'); g.addColorStop(1, '#7fbfe8'); return g; }
$('info').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b || !G.sel) return;
  const x = G.sel; SFX.click();
  switch (b.dataset.act) {
    case 'close': select(null); break;
    case 'cutoff': x.cutOff = !x.cutOff; msg(x.cutOff ? x.name + ' has been cut off. Soft drinks only!' : x.name + ' can drink again.', ''); if (x.cutOff) x.happy -= 5; renderInfo(true); break;
    case 'home': sendHome(x); select(null); break;
    case 'pickup': pickUp(x); break;
    case 'sack': sack(x); break;
    case 'sell': sellObj(x); break;
  }
});

// ---------- HUD ----------
document.querySelectorAll('[data-speed]').forEach(b => b.addEventListener('click', () => { if (G && G.running) setSpeed(+b.dataset.speed); }));
$('bBuild').addEventListener('click', () => toggleSide('build'));
$('bHire').addEventListener('click', () => toggleSide('hire'));
$('bBar').addEventListener('click', () => {
  if (!G || !G.running) return;
  G.barMode = G.barMode === 'cash' ? 'free' : 'cash';
  msg(G.barMode === 'free' ? 'FREE BAR! Guests are delighted. It costs you £6 a drink.' : 'Cash bar. Guests pay, you earn £4 a drink, but they grumble.', G.barMode === 'free' ? 'good' : '');
  SFX.click(); updateHud(true);
});
$('bMusic').addEventListener('click', () => { auInit(); AU.music = !AU.music; store.set('tw_music', AU.music); updateHud(true); });
$('bSfx').addEventListener('click', () => { auInit(); AU.sfx = !AU.sfx; store.set('tw_sfx', AU.sfx); updateHud(true); });
document.addEventListener('pointerdown', () => auInit());
document.addEventListener('keydown', () => auInit());
$('bHelp').addEventListener('click', () => { if (G && G.running) showHelp(); });
function updateHud(force) {
  if (!G) return;
  const now = performance.now(); if (!force && now - lastHud < 200) return; lastHud = now;
  $('hClock').textContent = fmtTime(G.time);
  $('hPhase').textContent = G.phaseName;
  const m = $('hMoney'); m.textContent = fmtMoney(G.money); m.classList.toggle('neg', G.money < 0);
  $('hGuests').textContent = guests().length;
  const hb = $('hHappy'); hb.style.width = G.avgHappy + '%'; hb.style.background = G.avgHappy > 60 ? '#5fd068' : G.avgHappy > 35 ? '#ffd25a' : '#ff5a5a';
  const full = Math.round(G.bliss / 20);
  $('hBliss').innerHTML = '<span class="on">' + '♥'.repeat(full) + '</span><span class="off">' + '♥'.repeat(5 - full) + '</span>';
  $('hJoy').textContent = Math.round(G.joy).toLocaleString('en-GB');
  document.querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('on', +b.dataset.speed === G.speed));
  $('bBar').textContent = sponsorOn() ? 'BAR: DMITRI' : G.barMode === 'free' ? 'BAR: FREE' : 'BAR: CASH';
  $('bBar').classList.toggle('on', G.barMode === 'free' || sponsorOn());
  $('bMusic').textContent = AU.music ? 'MUSIC' : 'MUSIC OFF'; $('bMusic').classList.toggle('on', !AU.music);
  $('bSfx').textContent = AU.sfx ? 'SFX' : 'SFX OFF'; $('bSfx').classList.toggle('on', !AU.sfx);
  const W = { Sunny: 'Sunny', Cloudy: 'Cloudy', Showers: 'Showers', Scorching: 'Heatwave' }[G.weather];
  const buffs = G.buffs.map(b => `<span class="buff ${b.d >= 0 ? 'pos' : 'neg'}">${esc(b.name)}</span>`).join('');
  const rats = G.people.filter(a => a.role === 'rat' && a.present && !a.dead).length;
  $('topinfo').innerHTML = `DAY ${G.day} · ${W}${G.twist ? ' · ' + esc(G.twist.name) : ''}${G.raining ? ' · <b>RAINING</b>' : ''}${G.powerOut > 0 ? ' · <b>POWER CUT</b>' : ''}${rats ? ' · <b class="paused">RATS: ' + rats + '</b>' : ''}${G.speed === 0 ? ' · <b class="paused">PAUSED</b>' : ''}${buffs ? '<div class="buffs">' + buffs + '</div>' : ''}`;
  if (sideMode && now - lastSideRefresh > 1000) { lastSideRefresh = now; $('side').querySelectorAll('.item[data-build]').forEach(b => b.classList.toggle('poor', G.money < OT[b.dataset.build].cost)); }
  if (G.build && IS_TOUCH) renderPlaceBar();
}

// ---------- feed, toasts, advisor ----------
function msg(text, cls) {
  const f = $('feed'); if (!f) return;
  if (cls === 'hint') { showAdvisor(text.replace(/^PLANNER:\s*/, '')); }
  const d = document.createElement('div'); d.className = 'fm ' + (cls || ''); d.textContent = text;
  f.prepend(d);
  const max = VW < 700 ? 3 : 6;
  while (f.children.length > max) f.lastChild.remove();
  setTimeout(() => d.classList.add('fade'), 9000);
  setTimeout(() => d.remove(), 10000);
}
function toast(text, cls) {
  const t = $('toasts'); const d = document.createElement('div');
  d.className = 'toast ' + (cls || ''); d.textContent = text; t.appendChild(d);
  setTimeout(() => d.remove(), 1900);
}
let advisorT = 0;
const PLANNER_LOOK = { skin: '#f4d2b8', hair: '#5a2a1a', style: 'bun', dress: true, top: '#c2185b', shoes: '#222', glasses: true, sex: 'f' };
function showAdvisor(text) {
  const a = $('advisor');
  a.querySelector('.say').textContent = text;
  a.classList.remove('hidden');
  const c = a.querySelector('canvas').getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 160, 160);
  c.save(); c.scale(6, 6); // head-and-shoulders
  const p = { id: 999, kind: 'staff', role: 'planner', look: PLANNER_LOOK, x: 0, y: 0, state: 'idle', present: true, happy: 90, drunk: 0, face: 'f' };
  const o = iso(0, 0); c.translate(13.3 - o.x, 34.2 - o.y); drawPersonDirect(c, p, 0);
  c.restore();
  // clipboard
  c.fillStyle = '#8a5a2a'; c.fillRect(104, 112, 30, 36); c.fillStyle = '#fff'; c.fillRect(108, 118, 22, 26);
  c.fillStyle = '#888'; for (let i = 0; i < 4; i++) c.fillRect(111, 123 + i * 5, 16, 1.5);
  clearTimeout(advisorT);
  advisorT = setTimeout(() => a.classList.add('hidden'), 9000);
}
$('advisor').addEventListener('click', () => $('advisor').classList.add('hidden'));

// ---------- modals ----------
function openModal(html, cls) {
  const m = $('modal'), box = $('mbox');
  box.className = cls || ''; box.innerHTML = html; m.classList.remove('hidden');
  box.scrollTop = 0;
  if (G) G.modalOpen = true;
  return box;
}
function closeModal() { $('modal').classList.add('hidden'); if (G) G.modalOpen = false; }
function nextModal() {
  if (!G || G.modalOpen || !G.running) return;
  const ev = G.modalQueue.shift(); if (!ev) return;
  SFX.fax();
  const box = openModal(`<div class="faxhead"><span>INCOMING FAX</span><span>${fmtTime(G.time)}</span></div><h2>${esc(ev.title)}</h2><p class="evt">${esc(ev.text)}</p><div class="choices"></div>`, 'fax');
  const ch = box.querySelector('.choices');
  ev.choices.forEach((c) => {
    const b = document.createElement('button'); b.textContent = c.label;
    b.onclick = () => {
      const snap = { joy: G.joy, bliss: G.bliss, money: G.money, mood: avgMood(), mem: G.memories.length };
      let res;
      G.inChoice = true;
      try { res = c.fn(); } finally { G.inChoice = false; }
      const d = { joy: Math.round(G.joy - snap.joy), bliss: Math.round(G.bliss - snap.bliss), money: Math.round(G.money - snap.money), mems: G.memories.slice(snap.mem) };
      const v = applyImpact(d);
      d.mood = Math.round(avgMood() - snap.mood);
      updateHud(true);
      ch.remove();
      const r = document.createElement('div'); r.className = 'result';
      const chip = (label, n, unit) => n ? `<span class="chip ${n > 0 ? 'pos' : 'neg'}">${label} ${n > 0 ? '+' : ''}${n}${unit || ''}</span>` : '';
      r.innerHTML = `<div class="verdict ${v.cls}">${v.label}</div><p>${esc(res || '')}</p><div class="chips">`
        + chip('JOY', d.joy) + chip('BLISS', d.bliss) + chip('CROWD MOOD', d.mood, '%')
        + (d.money ? `<span class="chip ${d.money > 0 ? 'pos' : 'neg'}">${d.money > 0 ? '+' : ''}${fmtMoney(d.money)}</span>` : '')
        + d.mems.map(m => `<span class="chip mem">★ ${esc(m.text)}</span>`).join('')
        + (v.buff ? `<span class="chip ${v.buff[3] > 0 ? 'pos' : 'neg'}">${esc(v.buff[1])} · ${v.buff[2]} min</span>` : '')
        + '</div>';
      box.classList.remove('shake', 'glow'); void box.offsetWidth;
      if (v.cls === 'bad' || v.cls === 'disaster') box.classList.add('shake');
      if (v.cls === 'triumph') box.classList.add('glow');
      const ok = document.createElement('button'); ok.className = 'ok'; ok.textContent = 'Carry on';
      ok.onclick = () => { closeModal(); if (ev.after) ev.after(); nextModal(); };
      r.appendChild(ok); box.appendChild(r); ok.focus();
      r.scrollIntoView({ block: 'nearest' });
    };
    ch.appendChild(b);
  });
}
function avgMood() { const g = guests(); return g.length ? g.reduce((a, p) => a + p.happy, 0) / g.length : 0; }
function applyImpact(d) {
  const sc = d.joy + d.bliss * 5 + Math.min(0, d.money) / 8;
  let v;
  if (sc >= 90) v = { cls: 'triumph', label: 'TRIUMPH!', buff: ['buzz', 'Buzzing!', 45, 0.3], mood: 10, react: ['heart', 0.6] };
  else if (sc >= 35) v = { cls: 'good', label: 'NICE ONE!', buff: ['vibes', 'Good Vibes', 25, 0.15], mood: 5, react: ['heart', 0.3] };
  else if (sc >= 0) v = { cls: 'ok', label: 'PHEW...', mood: 1 };
  else if (sc >= -30) v = { cls: 'bad', label: 'OH DEAR...', buff: ['awk', 'Awkward...', 25, -0.2], mood: -6, react: ['angry', 0.3], shake: 0.3 };
  else v = { cls: 'disaster', label: 'DISASTER!', buff: ['awk', 'Awkward...', 40, -0.35], mood: -12, react: ['angry', 0.6], shake: 0.7 };
  moodAll(v.mood);
  if (v.buff) addBuff(v.buff[0], v.buff[1], v.buff[2], v.buff[3]);
  if (v.react) crowdReact(v.react[0], v.react[1]);
  if (v.shake) G.shake = v.shake;
  const c = G.groom.present ? G.groom : { x: 13, y: 11 };
  if (v.cls === 'triumph') { confettiAt(c.x, c.y, 70); heartsAt(c.x, c.y, 12); SFX.triumph(); }
  else if (v.cls === 'good') { confettiAt(c.x, c.y, 25); SFX.good(); }
  else if (v.cls === 'bad') SFX.bad();
  else if (v.cls === 'disaster') SFX.disaster();
  else SFX.click();
  return v;
}
const GROOM_LOOK = { skin: '#f7dcc6', hair: '#d9661f', style: 'quiff', top: '#2f7d3a', bottom: '#276b31', shoes: '#5a3418', groom: true, sex: 'm' };
const BRIDE_LOOK = { skin: '#fbe6d8', hair: '#3a2214', style: 'long', dress: true, top: '#ffffff', shoes: '#b0174f', bride: true, sex: 'f' };
function drawCouple(canvas) {
  const c = canvas.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, canvas.width, canvas.height);
  c.imageSmoothingEnabled = false;
  const k = 8 * canvas.width / 432; // canvas pixels per world unit
  c.save(); c.scale(k, k);
  const o = iso(0, 0), feet = (canvas.height - 14) / k;
  for (const [look, x, role] of [[GROOM_LOOK, 146, 'groom'], [BRIDE_LOOK, 286, 'bride']]) {
    const p = { id: 3, kind: 'couple', role, look, x: 0, y: 0, state: 'idle', present: true, happy: 100, drunk: 0, thoughtT: 0, face: 'f', dir: 'down' };
    c.save(); c.translate(x * canvas.width / 432 / k - o.x, feet - o.y); drawPersonDirect(c, p, 0); c.restore();
  }
  c.restore();
}
// Global leaderboard table (falls back silently to the local one already on screen)
function lbTable(rows, meName, meScore) {
  return '<table class="hs">' + rows.map((h, i) => `<tr class="${h.player === meName && h.score === meScore ? 'me' : ''}"><td>${i + 1}.</td><td>${esc(h.player)}</td><td>Day ${h.day}</td><td class="r">${h.score.toLocaleString('en-GB')}</td></tr>`).join('') + '</table>';
}
function fillGlobalBoard(box, wait, meScore) {
  const el = box.querySelector('.hsbox'); if (!el || !LB.on) return;
  el.insertAdjacentHTML('afterbegin', '<p class="dim">Loading global scores…</p>');
  Promise.resolve(wait).then(() => LB.top(10)).then(rows => {
    if (!box.isConnected) return;
    if (rows && rows.length) el.innerHTML = lbTable(rows, store.get('tw_player', ''), meScore);
    else el.querySelector('.dim') && el.querySelector('.dim').remove();
  });
}
// Title screen "Hall of Fame": top 3 on a podium + a button for the full board
function hofCards(rows) {
  const me = store.get('tw_player', '').toLowerCase();
  return [0, 1, 2].map(i => {
    const h = rows[i], medal = `<span class="medal m${i + 1}"><i></i><b>${i + 1}</b></span>`;
    if (!h) return `<div class="hrow r${i + 1} empty">${medal}<span class="hname">Up for grabs</span></div>`;
    return `<div class="hrow r${i + 1}${h.player.toLowerCase() === me ? ' me' : ''}">${medal}<span class="hname">${esc(h.player)}</span><span class="hpts"><b>${h.score.toLocaleString('en-GB')}</b><small>Day ${h.day}</small></span></div>`;
  }).join('');
}
function localBoard() { return store.get('tw_scores', []).map(x => ({ player: x.player || x.couple, score: x.score, day: x.day })); }
function fillHof(box) {
  const el = box.querySelector('#hofCards'); if (!el) return;
  el.innerHTML = hofCards(localBoard());
  if (!LB.on) return;
  LB.top(3).then(rows => { if (rows && rows.length && box.querySelector('#hofCards') === el) el.innerHTML = hofCards(rows); });
}
function showFullBoard() {
  const box = openModal(`
    <div class="logo hofh">HALL OF FAME</div>
    <p class="tag">${LB.on ? 'The best weddings from everyone who has played.' : 'Your best weddings on this device.'}</p>
    <div id="fullBoard"><p class="dim">Loading…</p></div>
    <div class="row"><button id="bBack" class="big">BACK</button></div>`, 'title');
  box.querySelector('#bBack').onclick = () => showTitle();
  const me = store.get('tw_player', '');
  const draw = (rows) => { const el = box.querySelector('#fullBoard'); if (el) el.innerHTML = rows && rows.length ? lbTable(rows, me, -1) : '<p class="dim">No scores yet.</p>'; };
  if (!LB.on) return draw(localBoard());
  LB.top(50).then(rows => draw(rows || localBoard()));
}
function showTitle() {
  $('topinfo').innerHTML = ''; $('feed').innerHTML = ''; $('side').classList.add('hidden'); $('info').classList.add('hidden'); $('placebar').classList.add('hidden'); $('advisor').classList.add('hidden'); sideMode = null;
  const GL = window.GUEST_LIST || {};
  const gn = GL.groom || 'Nick', bn = GL.bride || 'Olga'; // the couple's names are fixed
  const pn = store.get('tw_player', '');
  const day = store.get('tw_day', 1);
  const box = openModal(`
    <div class="logo">THEME<br><span>WEDDING</span></div>
    <div class="lang"><button data-lang="en" class="${LANG === 'en' ? 'on' : ''}">English</button><button data-lang="ru" class="${LANG === 'ru' ? 'on' : ''}">Русский</button></div>
    <p class="tag">One day. The same day. Over and over. Make it perfect.</p>
    <canvas id="tcouple" width="432" height="336" style="width:216px;height:168px"></canvas>
    <div class="names"><label>Groom<input id="nG" value="${esc(gn)}" readonly tabindex="-1"></label><span class="amp">&amp;</span><label>Bride<input id="nB" value="${esc(bn)}" readonly tabindex="-1"></label></div>
    <div class="names player"><label>Your name<input id="nP" maxlength="14" placeholder="Enter your name" autocomplete="nickname" value="${esc(pn)}"></label></div>
    <button id="bStart" class="big">${day > 1 ? 'RELIVE THE BIG DAY (Day ' + day + ')' : 'BEGIN THE BIG DAY'}</button>
    <div class="cols"><div class="hof"><div class="hofh">HALL OF FAME</div>${LB.on ? '<div class="hofsub">Best weddings from everyone</div>' : ''}<div id="hofCards"></div><button id="bFull" class="hofbtn">FULL LEADERBOARD</button></div>
      <div><h3>HOW TO PLAY</h3><ul>
      <li>Run the wedding day from 09:30 to midnight.</li>
      <li><b>Furnish</b> bars, portaloos, fun stuff. <b>Hire</b> staff and drop them in.</li>
      <li>Keep guests fed, watered, relieved and entertained.</li>
      <li>Random chaos will happen. Every day has a different <b>twist</b>.</li>
      <li>Not enough cleaners? <b>Rats!</b> ${IS_TOUCH ? 'Tap' : 'Click'} them to shoot them.</li>
      <li>Olga's Russian family have <b>traditions</b>. Respect them.</li></ul></div></div>
  `, 'title');
  fillHof(box);
  const pin = box.querySelector('#nP');
  pin.oninput = () => { pin.classList.remove('need'); store.set('tw_player', pin.value.trim().slice(0, 14)); };
  box.querySelector('#bFull').onclick = () => showFullBoard();
  drawCouple(box.querySelector('#tcouple'));
  box.querySelectorAll('[data-lang]').forEach(b => { b.onclick = () => { if (b.dataset.lang !== LANG) setLang(b.dataset.lang); }; });
  box.querySelector('#bStart').onclick = () => {
    auInit(); SFX.bells();
    const pi = box.querySelector('#nP'), player = pi.value.trim().slice(0, 14);
    if (!player) { pi.focus(); pi.classList.add('need'); return; }
    store.set('tw_player', player);
    startDay(store.get('tw_day', 1), gn, bn);
  };
}
const DAY_LINES = [
  "You wake up. Birds are singing. It's your wedding day. Again.",
  'Déjà vu? The same wedding day starts all over again... but something feels different.',
  'The alarm goes off. Same day. Same goat next door. Same Uncle Gerald. Different chaos.',
  'Somehow, impossibly, it is the wedding day once more.',
  'Groundhog Day, but with more prosecco.',
];
function startDay(day, g, b) {
  closeModal();
  newDay(day, g, b);
  sideMode = null; renderSide(); renderPlaceBar(); select(null);
  $('feed').innerHTML = '';
  resize(); defaultZoom();
  cam.x = iso(13, 11).x; cam.y = iso(13, 11).y;
  clampCam();
  G.running = true; G.speed = 1;
  const W = { Sunny: 'Sunny and warm', Cloudy: 'Overcast', Showers: 'Showers expected', Scorching: 'HEATWAVE' }[G.weather];
  const box = openModal(`
    <div class="faxhead"><span>DAY ${day}</span><span>09:30</span></div>
    <h2>THE BIG DAY</h2>
    <p class="evt">${day === 1 ? `It's the morning of ${esc(g)} &amp; ${esc(b)}'s wedding. Everything must go perfectly. (It won't.)` : esc(pick(DAY_LINES))}</p>
    <div class="twist"><div class="tl">TODAY'S TWIST</div><div class="tn">${esc(G.twist.name)}</div><div class="td">${esc(G.twist.desc)}</div></div>
    <div class="omens"><div><b>Weather:</b> ${W}</div>${G.omenList.map(o => '<div>★ ' + esc(o) + '</div>').join('')}</div>
    <ul class="tips"><li>Gates open at <b>10:00</b>. Ceremony at <b>${fmtTime(G.phases[3].t - 5)}</b>. Use the next half hour to prepare!</li>
    <li>You start with <b>${fmtMoney(G.money)}</b>. Leftover money adds to your score.</li>
    <li>Guests will want a <b>Bar</b> (with a <b>Bartender</b>) and dinner needs <b>Waiters</b>.</li></ul>
    <button class="ok big" id="bGo">LET'S GET MARRIED!</button>`, 'fax');
  box.querySelector('#bGo').onclick = () => { closeModal(); SFX.phase(); msg('PLANNER: Tap FURNISH to buy a Bar, then HIRE a Bartender to run it.', 'hint'); };
  updateHud(true);
}
function showHelp() {
  const prev = G.speed;
  const box = openModal(`<div class="faxhead"><span>PLANNER'S HANDBOOK</span><span>${fmtTime(G.time)}</span></div>
    <h2>HOW IT WORKS</h2>
    <ul class="tips">
      ${IS_TOUCH ? '<li><b>Touch:</b> drag to scroll, pinch to zoom, tap people &amp; things for info. To place furniture, tap a spot, then tap it again.</li>'
      : '<li><b>Mouse:</b> drag to scroll, wheel to zoom, click people &amp; things for info.</li><li><b>Keys:</b> Space pause · 1/2/3 speed · B furnish · H hire · Esc cancel · WASD/arrows scroll · Delete sells selected item.</li>'}
      <li><b>Thought bubbles</b> show what guests need: a glass = thirsty, a drumstick = hungry, yellow drop = needs the loo.</li>
      <li><b>Bars</b> only open with a Bartender behind them. Free bar = happier guests, but costs you.</li>
      <li><b>Dinner</b> is served by Waiters from the kitchen pass. No waiters, no food.</li>
      <li><b>Messes</b>: ${IS_TOUCH ? 'tap' : 'click'} one to send a Cleaner. Let them pile up and <b>rats</b> appear: ${IS_TOUCH ? 'tap' : 'click'} to shoot them!</li>
      <li><b>Goats</b> will eventually eat the wedding cake. Bouncers chase them off.</li>
      <li><b>Drunk guests</b> get fun... then messy. Cut them off or send them home from their info card.</li>
      <li><b>Score</b> = Joy + Bliss × 8 + leftover money ÷ 5 (both reduced if guests storm off).</li>
    </ul><button class="ok big" id="bOk">BACK TO THE WEDDING</button>`, 'fax');
  box.querySelector('#bOk').onclick = () => { closeModal(); G.speed = prev; nextModal(); };
}
// ---------- the wedding photo (end of day) ----------
// Everyone still at the party lines up in front of the flower arch: guests at the back,
// the wedding party in the middle, kids (and Barnie, if he came) at the front.
function drawWeddingPhoto(canvas) {
  const c = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, B = 22, PH = H - 110; // white border, photo height
  c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false;
  // polaroid card
  c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, W, H);
  c.save(); c.beginPath(); c.rect(B, B, W - B * 2, PH - B); c.clip();
  // sky, hedge, lawn
  const sky = c.createLinearGradient(0, B, 0, PH * 0.5); sky.addColorStop(0, '#8fcaf4'); sky.addColorStop(1, '#e4f4ff');
  c.fillStyle = sky; c.fillRect(0, 0, W, PH);
  c.fillStyle = '#3d8a33'; c.fillRect(0, PH * 0.36, W, PH * 0.2);
  for (let i = 0; i < 40; i++) { c.fillStyle = i % 2 ? '#47993b' : '#357a2c'; c.beginPath(); c.arc(B + i * 24 + (i % 3) * 5, PH * 0.37 + (i % 4) * 3, 15, 0, Math.PI * 2); c.fill(); }
  const lawn = c.createLinearGradient(0, PH * 0.55, 0, PH); lawn.addColorStop(0, '#5fb04a'); lawn.addColorStop(1, '#4a9a3a');
  c.fillStyle = lawn; c.fillRect(0, PH * 0.55, W, PH);
  // flower arch behind the couple
  const ax = W / 2, aTop = PH * 0.2, aw = 150, FC = ['#ff8fb8', '#ffffff', '#c2185b', '#ffd84a'];
  c.fillStyle = '#f4f0e6'; c.fillRect(ax - aw - 5, aTop + 40, 10, PH * 0.62 - aTop); c.fillRect(ax + aw - 5, aTop + 40, 10, PH * 0.62 - aTop);
  c.strokeStyle = '#3f8a35'; c.lineWidth = 14; c.beginPath(); c.arc(ax, aTop + 50, aw, Math.PI, 0); c.stroke();
  for (let i = 0; i <= 24; i++) { const a = Math.PI + Math.PI * i / 24; c.fillStyle = FC[i % 4]; c.beginPath(); c.arc(ax + Math.cos(a) * aw, aTop + 50 + Math.sin(a) * aw, 6, 0, Math.PI * 2); c.fill(); }
  // the people
  const k = 3.4, o = iso(0, 0);
  const snap = (p, x, y) => {
    const q = Object.assign({}, p, { x: 0, y: 0, state: 'idle', sitting: false, moving: false, dir: 'down', face: 'f', flip: false, thoughtT: 0, onCastle: false, hidden: false, present: true, queasy: 0, leaving: false, happy: Math.max(p.happy || 80, 80) });
    if (p.exploded) q.sooty = G.time + 1; // still a bit singed
    c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(k, k); c.translate(-o.x, -o.y);
    if (p.kind === 'animal') drawAnimal(c, q, 0); else drawPersonDirect(c, q, 0);
    c.restore();
  };
  const here = (p) => p && p.present && !p.gone && !p.hidden;
  const party = [G.bridesmaids && G.bridesmaids[2], G.bridesmaids && G.bridesmaids[1], G.bridesmaids && G.bridesmaids[0], G.fob, G.bride, G.groom, G.mob, G.gmum, G.bestMan, G.bestMan2].filter(here);
  const inParty = new Set(party);
  const crowd = shuffle(guests().filter(p => here(p) && !inParty.has(p) && !p.rival));
  const kids = crowd.filter(p => p.look && p.look.kid).slice(0, 5);
  const adults = crowd.filter(p => !(p.look && p.look.kid));
  const row = (list, y, x0, x1) => { const n = list.length; list.forEach((p, i) => snap(p, n === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * i / (n - 1), y)); };
  row(adults.slice(0, 13), PH * 0.6, 90, W - 90);
  row(adults.slice(13, 25), PH * 0.68, 120, W - 120);
  // wedding party, couple in the middle
  const sp = Math.min(84, (W - 160) / Math.max(1, party.length - 1));
  party.forEach((p, i) => snap(p, W / 2 + (i - (party.length - 1) / 2) * sp, PH * 0.82));
  const front = kids.slice();
  if (G.dogSeen) front.splice(Math.floor(front.length / 2), 0, G.dogSeen);
  row(front, PH * 0.97, W / 2 - front.length * 45, W / 2 + front.length * 45);
  // a little camera flash vignette
  const vg = c.createRadialGradient(W / 2, PH / 2, PH * 0.3, W / 2, PH / 2, W * 0.7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,20,0,.28)');
  c.fillStyle = vg; c.fillRect(0, 0, W, PH);
  c.restore();
  // caption, handwritten-ish
  const best = G.memories.filter(m => m.text !== 'Just married!').sort((a, b) => b.pts - a.pts)[0];
  c.fillStyle = '#2a2230'; c.textAlign = 'center';
  c.font = '40px ' + UI_FONT;
  c.fillText(`${G.gName} & ${G.bName}  ·  ${tr('Day')} ${G.day}`, W / 2, PH + 40);
  c.font = '30px ' + UI_FONT; c.fillStyle = '#6a5a70';
  c.fillText(best ? tr('Best bit:') + ' ' + tr(best.text) : tr('A quiet one.'), W / 2, PH + 78);
}
function photoDownloadLink(canvas) {
  try { return canvas.toDataURL('image/png'); } catch (e) { return null; } // blocked when the game is opened straight from a file
}
function showEndScreen(s) {
  const st = G.stats;
  const starStr = '★'.repeat(s.stars) + '☆'.repeat(5 - s.stars);
  const mem = G.memories.length ? G.memories.map(m => `<li><span>${fmtTime(m.time)}</span> ${esc(m.text)} <b>+${m.pts}</b></li>`).join('') : '<li class="dim">Nothing memorable happened. Somehow.</li>';
  const hs = store.get('tw_scores', []);
  const tbl = '<table class="hs">' + hs.slice(0, 5).map((h, i) => `<tr class="${h.score === s.total && h.day === G.day ? 'me' : ''}"><td>${i + 1}.</td><td>${esc(h.player || h.couple)}</td><td>Day ${h.day}</td><td class="r">${h.score.toLocaleString('en-GB')}</td></tr>`).join('') + '</table>';
  const box = openModal(`
    <div class="faxhead"><span>DAY ${G.day} COMPLETE</span><span>00:00</span></div>
    <h2>${esc(s.title)}</h2>
    <div class="stars">${starStr}</div>
    <div class="photo"><canvas id="ephoto" width="960" height="600"></canvas><a id="bPhoto" class="hidden" download="wedding-photo.png">Save the photo</a></div>
    <div class="score">
      <div><span>Joy</span><b>${s.joyPts.toLocaleString('en-GB')}</b></div>
      <div><span>Couple's Bliss (${Math.round(G.bliss)} × 8${s.stayed < 1 ? ' × ' + Math.round(s.stayed * 100) + '% stayed' : ''})</span><b>${s.blissPts.toLocaleString('en-GB')}</b></div>
      <div><span>Budget left (${fmtMoney(G.money)}${s.stayed < 1 && G.money > 0 ? ' × ' + Math.round(s.stayed * 100) + '% stayed' : ''})</span><b>${s.moneyPts.toLocaleString('en-GB')}</b></div>
      <div class="tot"><span>FINAL SCORE</span><b>${s.total.toLocaleString('en-GB')}</b></div>
    </div>
    <div class="cols"><div><h3>MEMORIES</h3><ul class="mem">${mem}</ul></div>
    <div><h3>THE DAY IN NUMBERS</h3><ul class="nums">
      <li>Today's twist <b>${esc(G.twist.name)}</b></li>
      <li>Average happiness <b>${Math.round(s.avg)}%</b></li><li>Drinks poured <b>${st.drinks}</b></li><li>Meals served <b>${st.meals}</b></li>
      <li>Photo booth snaps <b>${st.photos}</b></li><li>Times someone was sick <b>${st.vomits}</b></li><li>Fights <b>${st.fights}</b></li>
      <li>Rats shot <b>${st.rats || 0}</b></li><li>Loo accidents <b>${st.accidents}</b></li><li>Slips &amp; falls <b>${st.falls}</b></li><li>Stormed off <b>${st.stormed}</b></li>
      <li>Sent home in a taxi <b>${st.taxis}</b></li><li>Messes cleaned <b>${st.cleaned}</b></li></ul>
      <h3>BEST WEDDINGS${LB.on ? ' (EVERYONE)' : ''}</h3><div class="hsbox">${tbl}</div></div></div>
    <div class="row"><button class="ok big" id="bAgain">RELIVE THE DAY (Day ${G.day + 1})</button><button id="bTitle">Title screen</button></div>`, 'fax end');
  const ph = box.querySelector('#ephoto'); drawWeddingPhoto(ph);
  const url = photoDownloadLink(ph); if (url) { const l = box.querySelector('#bPhoto'); l.href = url; l.classList.remove('hidden'); }
  box.querySelector('#bAgain').onclick = () => { SFX.bells(); startDay(G.day + 1, G.gName, G.bName); };
  box.querySelector('#bTitle').onclick = () => { closeModal(); G = null; showTitle(); };
  fillGlobalBoard(box, G.lbSent, s.total);
  SFX.memory();
}

// ---------- main loop ----------
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#16301a'; ctx.fillRect(0, 0, cv.width, cv.height);
  if (G) {
    const pan = 500 * dt / zoom;
    if (keys.ArrowLeft || keys.a) cam.x -= pan;
    if (keys.ArrowRight || keys.d) cam.x += pan;
    if (keys.ArrowUp || keys.w) cam.y -= pan;
    if (keys.ArrowDown || keys.s) cam.y += pan;
    clampCam();
    const sp = SPEEDS[G.speed] || 0;
    if (G.running && !G.modalOpen && sp > 0) { G.clock += dt * Math.min(sp, 2); update(dt * sp); }
    renderWorld(G.clock);
    const o = viewOrigin();
    if (G.shake > 0) { G.shake -= dt; const a = Math.max(0, G.shake) * 14; o.x += rnd(-a, a); o.y += rnd(-a, a); }
    const k = DPR * zoom / RS;
    ctx.imageSmoothingEnabled = k < 0.99; ctx.imageSmoothingQuality = 'high';
    ctx.setTransform(k, 0, 0, k, Math.round(o.x * DPR), Math.round(o.y * DPR));
    ctx.drawImage(wc, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    updateHud(false);
    if (G.sel && now - lastInfo > 250) { lastInfo = now; renderInfo(false); }
  }
  musicTick();
  requestAnimationFrame(frame);
}

// ---------- boot ----------
initCanvases();
resize();
showTitle();
requestAnimationFrame(frame);
