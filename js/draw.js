'use strict';
/* =========================================================
   THEME WEDDING — rendering
   Smooth, outlined, shaded cartoon art in the spirit of Theme Hospital.
   Everything is drawn in "world units" onto canvases with RS× backing
   resolution, so shapes stay crisp and anti-aliased rather than blocky.
   ========================================================= */
const RS = 2;                 // backing resolution per world unit
const INK = '#2a1d2c';        // outline colour
const OLW = 0.6;              // outline width (world units)
const MASK_S = 4;             // night mask is rendered at 1/4 world resolution
let wc, wctx, floorC, fctx, maskC, mctx;
let staticList = [], staticDirty = true;
function markStaticDirty() { staticDirty = true; }
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function initCanvases() {
  wc = mkCanvas(WORLD_W * RS, WORLD_H * RS); wctx = wc.getContext('2d');
  floorC = mkCanvas(WORLD_W * RS, WORLD_H * RS); fctx = floorC.getContext('2d');
  maskC = mkCanvas(Math.ceil(WORLD_W / MASK_S), Math.ceil(WORLD_H / MASK_S)); mctx = maskC.getContext('2d');
}

// ---------- primitives ----------
function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
function P(c, pts) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); }
function poly(c, pts, col) { P(c, pts); c.fillStyle = col; c.fill(); }
function ink(c, lw) { c.lineWidth = lw || OLW; c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
function fillInk(c, fill, lw) { c.fillStyle = fill; c.fill(); if (lw !== 0) ink(c, lw); }
function ell(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, Math.PI * 2); }
function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(0.01, r), 0, Math.PI * 2); }
function rr(c, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function lg(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); for (const [o, col] of stops) g.addColorStop(o, col); return g; }
const _shc = new Map();
function shade(hex, f) {
  const k = hex + '|' + f; let v = _shc.get(k); if (v) return v;
  if (typeof hex !== 'string' || hex[0] !== '#' || hex.length !== 7) { _shc.set(k, hex); return hex; }
  let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  v = '#' + [r, g, b].map(x => Math.round(clamp(x, 0, 255)).toString(16).padStart(2, '0')).join('');
  _shc.set(k, v); return v;
}
function hshade(c, x0, x1, col) { return lg(c, x0, 0, x1, 0, [[0, shade(col, 0.25)], [0.45, col], [1, shade(col, -0.32)]]); }
function vshade(c, y0, y1, col) { return lg(c, 0, y0, 0, y1, [[0, shade(col, 0.12)], [1, shade(col, -0.16)]]); }
function hash2(x, y) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function limb(c, pts, w, col) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.lineWidth = w + OLW * 2; c.strokeStyle = INK; c.stroke();
  c.lineWidth = w; c.strokeStyle = col; c.stroke();
}
function heart(c, x, y, s, col) {
  c.beginPath(); c.moveTo(x, y + s * 0.9);
  c.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.35);
  c.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.9);
  fillInk(c, col, 0.4);
}
function star(c, x, y, r, col) {
  c.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
  c.closePath(); fillInk(c, col, 0.3);
}
function dpath(c, tx, ty, w, h) { const a = iso(tx, ty), b = iso(tx + (w || 1), ty), d = iso(tx + (w || 1), ty + (h || 1)), e = iso(tx, ty + (h || 1)); P(c, [a.x, a.y, b.x, b.y, d.x, d.y, e.x, e.y]); }
function diamond(c, cx, top, col) { P(c, [cx, top, cx + 16, top + 8, cx, top + 16, cx - 16, top + 8]); c.fillStyle = col; c.fill(); }

// iso box centred on ground point (cx,cy); hw = half width on screen
function box(c, cx, cy, hw, h, top, left, right, lift, noOutline) {
  const hh = hw / 2, y = cy - (lift || 0);
  P(c, [cx - hw, y, cx, y + hh, cx, y + hh - h, cx - hw, y - h]); c.fillStyle = vshade(c, y - h, y + hh, left); c.fill();
  P(c, [cx, y + hh, cx + hw, y, cx + hw, y - h, cx, y + hh - h]); c.fillStyle = vshade(c, y - h, y + hh, right); c.fill();
  P(c, [cx, y - hh - h, cx + hw, y - h, cx, y + hh - h, cx - hw, y - h]); c.fillStyle = top; c.fill();
  if (noOutline) return;
  c.beginPath(); c.moveTo(cx - hw, y - h); c.lineTo(cx, y + hh - h); c.lineTo(cx + hw, y - h);
  c.lineWidth = 0.5; c.strokeStyle = 'rgba(255,255,255,.45)'; c.stroke();
  if (h > 1) { c.beginPath(); c.moveTo(cx, y + hh - h); c.lineTo(cx, y + hh); c.lineWidth = 0.4; c.strokeStyle = 'rgba(0,0,0,.25)'; c.stroke(); }
  P(c, [cx - hw, y, cx, y + hh, cx + hw, y, cx + hw, y - h, cx, y - hh - h, cx - hw, y - h]); ink(c);
}
// a vertical cylinder standing at (x,y)
function cyl(c, x, y, rx, ry, h, col, topCol, noTop) {
  c.beginPath(); c.moveTo(x - rx, y - h); c.lineTo(x - rx, y); c.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); c.lineTo(x + rx, y - h); c.closePath();
  fillInk(c, hshade(c, x - rx, x + rx, col));
  if (!noTop) { ell(c, x, y - h, rx, ry); fillInk(c, topCol || shade(col, 0.18)); }
}
// prism with an arbitrary footprint in tile coords. painters draw in face-local space (u along, v up = negative)
function prism(c, x0, y0, x1, y1, h, o) {
  const lift = o.lift || 0;
  const T = iso(x0, y0), Rr = iso(x1, y0), B = iso(x1, y1), L = iso(x0, y1);
  for (const p of [T, Rr, B, L]) p.y -= lift;
  P(c, [L.x, L.y, B.x, B.y, B.x, B.y - h, L.x, L.y - h]); c.fillStyle = o.left; c.fill();
  if (o.lpaint) { c.save(); c.clip(); c.transform(1, 0.5, 0, 1, L.x, L.y); o.lpaint(c, B.x - L.x, h); c.restore(); }
  P(c, [B.x, B.y, Rr.x, Rr.y, Rr.x, Rr.y - h, B.x, B.y - h]); c.fillStyle = o.right; c.fill();
  if (o.rpaint) { c.save(); c.clip(); c.transform(1, -0.5, 0, 1, B.x, B.y); o.rpaint(c, Rr.x - B.x, h); c.restore(); }
  P(c, [B.x, B.y, Rr.x, Rr.y, Rr.x, Rr.y - h, B.x, B.y - h]); c.fillStyle = 'rgba(0,0,0,.12)'; c.fill();
  P(c, [T.x, T.y - h, Rr.x, Rr.y - h, B.x, B.y - h, L.x, L.y - h]); c.fillStyle = o.top; c.fill();
  if (o.tpaint) { c.save(); c.clip(); o.tpaint(c, T, Rr, B, L, h); c.restore(); }
  c.beginPath(); c.moveTo(L.x, L.y - h); c.lineTo(B.x, B.y - h); c.lineTo(Rr.x, Rr.y - h);
  c.lineWidth = 0.45; c.strokeStyle = 'rgba(255,255,255,.5)'; c.stroke();
  c.beginPath(); c.moveTo(B.x, B.y - h); c.lineTo(B.x, B.y); c.lineWidth = 0.4; c.strokeStyle = 'rgba(0,0,0,.3)'; c.stroke();
  P(c, [L.x, L.y, B.x, B.y, Rr.x, Rr.y, Rr.x, Rr.y - h, T.x, T.y - h, L.x, L.y - h]); ink(c, o.olw || OLW);
  return { T, Rr, B, L };
}

// ---------- face painters ----------
function paintBrick(base, seed) {
  return (c, len, h) => {
    c.fillStyle = '#d6c6ae'; c.fillRect(-1, -h - 1, len + 2, h + 2);
    const bh = 1.7, bw = 4.2;
    for (let r = 0; r * bh < h + bh; r++) {
      const y = -(r + 1) * bh, off = (r % 2) * bw / 2;
      for (let u = -off; u < len; u += bw) {
        c.fillStyle = shade(base, (hash2(r * 17 + Math.round(u * 5), seed) - 0.5) * 0.24);
        c.fillRect(u + 0.25, y + 0.25, bw - 0.5, bh - 0.5);
      }
    }
    c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, -1.5, len, 1.5);
  };
}
function paintHall(x, night) {
  return (c, len, h) => {
    // TH-style: clean plaster upper wall, green trim, tiled dado
    c.fillStyle = '#f3ecdc'; c.fillRect(0, -h, len, h);
    for (let u = 1; u < len; u += 3) { c.fillStyle = 'rgba(200,170,150,.18)'; c.fillRect(u, -h, 1, h - 12); }
    c.fillStyle = '#e7eef0'; c.fillRect(0, -12, len, 12);
    c.strokeStyle = 'rgba(120,140,150,.35)'; c.lineWidth = 0.25;
    for (let v = -10; v < 0; v += 2.4) { c.beginPath(); c.moveTo(0, v); c.lineTo(len, v); c.stroke(); }
    for (let u = 0; u < len; u += 2.4) { c.beginPath(); c.moveTo(u, -12); c.lineTo(u, 0); c.stroke(); }
    c.fillStyle = '#2f8a4e'; c.fillRect(0, -12.8, len, 1.3);
    c.fillStyle = '#5fbf7a'; c.fillRect(0, -12.8, len, 0.4);
    c.fillStyle = '#2f6a40'; c.fillRect(0, -1.6, len, 1.6);
    if (x % 3 === 1) {
      // window with green frame, as in TH
      rr(c, 3, -31, 10, 14, 0.8); c.fillStyle = '#2f8a4e'; c.fill(); ink(c, 0.4);
      const g = night ? lg(c, 0, -30, 0, -18, [[0, '#1c2350'], [1, '#2c3a78']]) : lg(c, 0, -30, 0, -18, [[0, '#cfeeff'], [1, '#7fc4ea']]);
      c.fillStyle = g; c.fillRect(4, -30, 8, 12);
      c.fillStyle = '#2f8a4e'; c.fillRect(7.6, -30, 0.8, 12); c.fillRect(4, -24.4, 8, 0.8);
      if (!night) { c.fillStyle = 'rgba(255,255,255,.55)'; P(c, [4.5, -29.5, 6.5, -29.5, 4.5, -26]); c.fill(); }
      else { c.fillStyle = '#fff6a0'; circ(c, 10, -27, 0.4); c.fill(); circ(c, 5.6, -21.5, 0.3); c.fill(); }
      c.fillStyle = '#c2185b'; P(c, [2, -32, 5, -32, 3.6, -16, 2, -16]); c.fill(); ink(c, 0.3);
      P(c, [11, -32, 14, -32, 14, -16, 12.4, -16]); c.fill(); ink(c, 0.3);
      c.fillStyle = '#e8e0d0'; c.fillRect(2.5, -17, 11, 1);
    } else if (x % 3 === 2) {
      rr(c, 4, -30, 8, 11, 0.4); c.fillStyle = '#c9a24a'; c.fill(); ink(c, 0.4);
      const domes = x % 2 === 0;
      c.fillStyle = domes ? '#8cc4ec' : '#a8dcf2'; c.fillRect(5, -29, 6, 6);
      c.fillStyle = domes ? '#e8e0d0' : '#5aa04a'; c.fillRect(5, -23, 6, 3);
      if (domes) {
        const dc = ['#d03030', '#30a050', '#e0b020'];
        for (let i = 0; i < 3; i++) { c.fillStyle = dc[i]; ell(c, 6.2 + i * 1.8, -24, 0.9, 1.3); c.fill(); c.fillStyle = '#ffd84a'; c.fillRect(6.1 + i * 1.8, -26, 0.25, 1.2); }
      } else { c.fillStyle = '#ffffff'; circ(c, 9, -26.5, 1); c.fill(); }
    }
    for (let k = 0; k < 4; k++) {
      c.fillStyle = BUNTING[(x + k) % 5];
      P(c, [1 + k * 4, -33, 4 + k * 4, -33, 2.5 + k * 4, -30.4]); c.fill(); ink(c, 0.2);
    }
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(0, -33); c.lineTo(len, -33); c.stroke();
  };
}
function paintInner(c, len, h) {
  c.fillStyle = '#e7eef0'; c.fillRect(0, -h, len, h);
  c.strokeStyle = 'rgba(120,140,150,.35)'; c.lineWidth = 0.25;
  for (let v = -h + 2.4; v < 0; v += 2.4) { c.beginPath(); c.moveTo(0, v); c.lineTo(len, v); c.stroke(); }
  for (let u = 0; u < len; u += 2.4) { c.beginPath(); c.moveTo(u, -h); c.lineTo(u, 0); c.stroke(); }
  c.fillStyle = '#2f8a4e'; c.fillRect(0, -12.8, len, 1.3); c.fillStyle = '#2f6a40'; c.fillRect(0, -1.6, len, 1.6);
}
function paintTiles(c, len, h) {
  c.fillStyle = '#f2f6f8'; c.fillRect(0, -h, len, h);
  c.strokeStyle = 'rgba(110,140,160,.45)'; c.lineWidth = 0.25;
  for (let v = -h + 2; v < 0; v += 2) { c.beginPath(); c.moveTo(0, v); c.lineTo(len, v); c.stroke(); }
  for (let u = 0; u < len; u += 2) { c.beginPath(); c.moveTo(u, -h); c.lineTo(u, 0); c.stroke(); }
  c.fillStyle = '#5a8fc0'; c.fillRect(0, -9, len, 0.9);
}
function paintHedge(seed) {
  return (c, len, h) => {
    c.fillStyle = '#3a8f30'; c.fillRect(0, -h, len, h);
    const n = Math.floor(len * h * 0.55);
    for (let i = 0; i < n; i++) {
      const u = hash2(i, seed) * len, v = -hash2(seed + 3, i) * h, k = hash2(i * 3, seed + 9);
      c.fillStyle = k < 0.33 ? '#2a6e22' : k < 0.66 ? '#4aa63c' : '#62bf4c';
      circ(c, u, v, 0.6 + hash2(i, 7) * 0.7); c.fill();
    }
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(0, -2.5, len, 2.5);
  };
}
function hedgeTop(seed) {
  return (c, T, Rr, B, L) => {
    for (let i = 0; i < 60; i++) {
      const a = hash2(i, seed), b = hash2(seed, i);
      const x = L.x + (Rr.x - L.x) * a, y = T.y + (B.y - T.y) * b;
      c.fillStyle = hash2(i * 5, seed) < 0.5 ? '#5cbf48' : '#78d45c';
      circ(c, x, y, 0.7 + hash2(i, 3) * 0.6); c.fill();
    }
  };
}

// ---------- sprite cache (world-unit sprites at RS resolution) ----------
const SPR = new Map();
function sprite(key, w, h, ax, ay, fn) {
  let s = SPR.get(key);
  if (!s) {
    const cv = mkCanvas(Math.ceil(w * RS), Math.ceil(h * RS));
    const c = cv.getContext('2d');
    c.scale(RS, RS);
    const o = iso(0, 0);
    c.translate(ax - o.x, ay - o.y);
    fn(c);
    s = { cv, w, h, ax, ay }; SPR.set(key, s);
  }
  return s;
}
function blitTile(c, s, tx, ty) { const p = iso(tx, ty); c.drawImage(s.cv, p.x - s.ax, p.y - s.ay, s.w, s.h); }

// ---------- pixel icons for thought bubbles ----------
const ICON_COL = { r: '#d0283c', w: '#9aa4b0', b: '#a0622a', y: '#e8c020', k: '#2a2a2a', R: '#e03030', g: '#3aa040', p: '#ff6fa0', B: '#3a7ad8', W: '#ffffff', o: '#f08a20' };
const ICONS = {
  drink: ['.rrrrr.', '.rrrrr.', '..rrr..', '...w...', '...w...', '...w...', '..www..'],
  food: ['...bbb.', '..bbbbb', '..bbbbb', '...bbb.', '..w....', '.w.....', 'ww.....'],
  loo: ['...y...', '...y...', '..yyy..', '.yyyyy.', '.yyyyy.', '.yyyyy.', '..yyy..'],
  bored: ['.kkkkk.', 'k.....k', 'k.k.k.k', 'k.....k', 'k.kkk.k', 'k.....k', '.kkkkk.'],
  angry: ['.RRRRR.', 'RR...RR', 'R.R.R.R', 'R.....R', 'R.RRR.R', 'RR...RR', '.RRRRR.'],
  heart: ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...', '.......'],
  note: ['...kkkk', '...k..k', '...k..k', '...k..k', '.kkk.kk', 'kkkk.kk', '.kk....'],
  zzz: ['kkkk...', '..k....', '.k.....', 'kkkk...', '....kkk', '.....k.', '....kkk'],
  drunk: ['.ggggg.', 'g.....g', 'g.ggg.g', 'g.g.g.g', 'g.g...g', 'g.gggg.', '.......'],
  bang: ['...R...', '...R...', '...R...', '...R...', '.......', '...R...', '.......'],
  rain: ['.BBBBB.', 'BBBBBBB', '...k...', '...k...', '...k...', '.k.k...', '..k....'],
  wait: ['.kkkkk.', '.k...k.', '..k.k..', '...k...', '..k.k..', '.k...k.', '.kkkkk.'],
  cash: ['..ggg..', '.g...g.', '.g.....', 'gggg...', '.g.....', '.g.....', 'gggggg.'],
  sick: ['.ggggg.', 'gg...gg', 'g.g.g.g', 'g.....g', 'g.ggg.g', 'gg...gg', '.ggggg.'],
  rat: ['.......', '.kk....', 'kkkkk..', 'kkkkkkk', '.kkkk.k', '.k..k..', '.......'],
};
function drawIcon(c, name, x, y, s) {
  const m = ICONS[name]; if (!m) return;
  s = s || 1;
  for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) { const ch = m[j][i]; if (ch !== '.') R(c, x + i * s, y + j * s, s, s, ICON_COL[ch]); }
}
function drawBubble(c, sx, top, icon) {
  const bx = sx - 5.5, by = top - 12;
  rr(c, bx, by, 11, 9.5, 3); fillInk(c, '#ffffff', 0.5);
  circ(c, sx - 0.5, by + 11, 1.1); fillInk(c, '#ffffff', 0.4);
  circ(c, sx + 0.3, by + 13.2, 0.6); fillInk(c, '#ffffff', 0.3);
  drawIcon(c, icon, bx + 2.2, by + 1.4, 0.95);
}
function pixHeart(c, x, y, col) { heart(c, x + 2.5, y + 1.6, 1.8, col); }

// ---------- floor (per-pixel textures, baked at RS) ----------
const TX = [0, 0, 0];
function setC(r, g, b) { TX[0] = r; TX[1] = g; TX[2] = b; return TX; }
function floorTex(t, x, y, u, v, px, py) {
  const n = hash2(px, py);
  switch (t) {
    case T.GRASS: {
      const stripe = ((x + y) >> 1) & 1;
      let r = 78, g = 176, b = 56;
      if (stripe) { r = 88; g = 188; b = 62; }
      const blade = hash2(px >> 1, py);
      if (blade < 0.12) { r -= 18; g -= 26; b -= 12; } else if (blade > 0.92) { r += 22; g += 24; b += 10; }
      return setC(r, g, b);
    }
    case T.PATH: {
      const fu = (u * 2) % 1, fv = (v * 2) % 1;
      if (fu < 0.04 || fv < 0.04) return setC(150, 150, 142);
      const k = hash2(Math.floor((x + u) * 2), Math.floor((y + v) * 2)) * 14;
      const nn = (n - 0.5) * 10;
      return setC(198 - k + nn, 198 - k + nn, 188 - k + nn);
    }
    case T.WOOD: case T.DOOR: case T.WALL: {
      const pv = (y + v) * 4, pi = Math.floor(pv), fv = pv - pi;
      const pu = (x + u) * 0.5 + hash2(pi, 7) * 3, fu = pu - Math.floor(pu);
      if (fv < 0.08 || fu < 0.015) return setC(110, 66, 34);
      const k = hash2(pi * 3, Math.floor(pu));
      const gr = (n - 0.5) * 8 + Math.sin((x + u) * 50 + pi * 2) * 5;
      const hl = fv < 0.3 ? 8 : 0;
      return setC(172 + k * 24 + gr + hl, 112 + k * 16 + gr * 0.7 + hl, 58 + k * 8 + gr * 0.4 + hl * 0.5);
    }
    case T.RUG: {
      const du = Math.abs(u - 0.5), dv = Math.abs(v - 0.5), d = du + dv;
      const nn = (n - 0.5) * 6;
      if (Math.abs(d - 0.34) < 0.03) return setC(222, 182, 90);
      if (d < 0.08) return setC(230, 196, 110);
      if (Math.abs(d - 0.2) < 0.015) return setC(196, 80, 92);
      if (du > 0.47 || dv > 0.47) return setC(108, 22, 40);
      return setC(150 + nn, 34 + nn, 52 + nn);
    }
    case T.TILE: {
      const tu = u * 2, tv = v * 2, fu = tu - Math.floor(tu), fv = tv - Math.floor(tv);
      if (fu < 0.05 || fv < 0.05) return setC(160, 176, 186);
      const lit = (fu + fv < 0.6) ? 10 : 0;
      return ((Math.floor(tu) + Math.floor(tv)) & 1) ? setC(236 + lit * 0.5, 242, 248) : setC(170 + lit, 206 + lit, 228);
    }
    case T.CARPET: {
      if (u < 0.06 || u > 0.94) return setC(110, 20, 32);
      if (u < 0.14 || u > 0.86) return setC(222, 182, 90);
      return n < 0.12 ? setC(170, 32, 52) : setC(192, 40, 62);
    }
    case T.DANCE: {
      if (u < 0.03 || v < 0.03) return setC(90, 90, 110);
      const gloss = (u + v < 0.5) ? 14 : 0;
      return ((x + y) & 1) ? setC(36 + gloss, 36 + gloss, 52 + gloss) : setC(236, 236, 244);
    }
    case T.HEDGE: return n < 0.3 ? setC(70, 52, 34) : setC(88, 66, 42);
  }
  return setC(40, 30, 26);
}
function drawFloor() {
  const c = fctx;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, floorC.width, floorC.height);
  const W2 = floorC.width, H2 = floorC.height;
  const img = c.createImageData(W2, H2), d = img.data;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    let t = map[y][x]; if (t === T.VOID) continue;
    if (t === T.WALL && (y === 0 || x === MW - 1 || y === MH - 1)) t = T.HEDGE;
    if (t === T.WALL && x >= 24 && y >= 17) t = T.TILE;
    const p = iso(x, y), cx2 = p.x * RS, top2 = p.y * RS;
    for (let r = 0; r < 16 * RS; r++) {
      const hw = r < 8 * RS ? (r + 1) * 2 : (16 * RS - r) * 2, py = top2 + r;
      if (py < 0 || py >= H2) continue;
      for (let px = cx2 - hw; px < cx2 + hw; px++) {
        const dxw = (px + 0.5 - cx2) / RS, dyw = (r + 0.5) / RS;
        let u = (dyw / 8 + dxw / 16) / 2, v = (dyw / 8 - dxw / 16) / 2;
        u = u < 0 ? 0 : u > 0.999 ? 0.999 : u; v = v < 0 ? 0 : v > 0.999 ? 0.999 : v;
        const col = floorTex(t, x, y, u, v, px, py);
        const i = (py * W2 + px) * 4;
        d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
      }
    }
  }
  c.putImageData(img, 0, 0);
  c.setTransform(RS, 0, 0, RS, 0, 0);
  // flowers & tufts on the lawn
  const FL = ['#ff8fb8', '#ffffff', '#ffd84a', '#b08aff', '#ff6a5a'];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (map[y][x] !== T.GRASS) continue;
    const p = iso(x + 0.5, y + 0.5), v = tvar[y][x];
    if (v < 0.22) {
      for (let k = 0; k < 3; k++) {
        const fx = p.x - 7 + hash2(x * 9 + k, y) * 14, fy = p.y - 3 + hash2(y * 5 + k, x) * 6;
        c.strokeStyle = '#2f7a2a'; c.lineWidth = 0.35; c.beginPath(); c.moveTo(fx, fy + 1.4); c.lineTo(fx, fy); c.stroke();
        circ(c, fx, fy, 0.75); c.fillStyle = FL[(Math.floor(v * 100) + k) % 5]; c.fill();
      }
    } else if (v < 0.45) {
      const fx = p.x - 5 + v * 12, fy = p.y + (v * 40) % 4 - 2;
      c.strokeStyle = '#3c8f30'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(fx - 0.8, fy + 0.5); c.lineTo(fx - 1.2, fy - 1.2); c.moveTo(fx, fy + 0.5); c.lineTo(fx, fy - 1.6); c.moveTo(fx + 0.8, fy + 0.5); c.lineTo(fx + 1.3, fy - 1.1); c.stroke();
    }
  }
  bakeBackWalls(c);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
function bakeBackWalls(c) {
  const night = G && nightAlpha() > 0.25;
  const hedge = (x0, y0, x1, y1, seed) => prism(c, x0, y0, x1, y1, 15, { top: '#56b244', left: '#3a8f30', right: '#348428', lpaint: paintHedge(seed), rpaint: paintHedge(seed + 50), tpaint: hedgeTop(seed) });
  for (let y = MH - 1; y >= 1; y--) hedge(0.4, y, 1, y + 1, y);
  hedge(0.4, 0.4, 1, 1, 0);
  for (let x = 1; x <= 12; x++) hedge(x, 0.4, x + 1, 1, x + 40);
  for (let x = 13; x <= MW - 1; x++) {
    const w = x === MW - 1 ? 0.3 : 1;
    prism(c, x, 0.7, x + w, 1, 34, { top: '#d8cfc0', left: '#f3ecdc', right: '#ddd2bf', lpaint: x >= 14 && x < MW - 1 ? paintHall(x, night) : null });
  }
}

// ---------- walls drawn in the depth pass ----------
const BUNTING = ['#ff6fa0', '#ffd84a', '#7ad0ff', '#ffffff', '#b08aff'];
function wallKind(x, y) {
  const t = map[y][x];
  if (t === T.HEDGE) {
    if (y === MH - 1) return x === 5 ? 'hedgeGateL' : x === 8 ? 'hedgeGateR' : 'hedgeFront' + (x % 3);
    return null;
  }
  if (t !== T.WALL) return null;
  if (y === MH - 1) return 'frontY';
  if (x === MW - 1) return 'frontX';
  if (x === 13) return 'inner';
  if (x === 24 && y === 17) return 'tCorner';
  if (x === 24) return 'tCol';
  if (y === 17) return 'tRow';
  return null;
}
const BRICK = '#b0573a';
function wallSprite(kind) {
  return sprite('wall:' + kind, 52, 66, 26, 48, (c) => {
    const brickW = { top: '#d9cbb4', left: BRICK, right: shade(BRICK, -0.15) };
    switch (kind) {
      case 'inner': prism(c, 0.32, 0, 0.68, 1, 26, { top: '#d9cbb4', left: '#e7eef0', right: '#e7eef0', rpaint: paintInner }); break;
      case 'innerDoor':
        prism(c, 0.32, 0, 0.68, 0.14, 26, { top: '#d9cbb4', left: '#e7eef0', right: '#e7eef0' });
        prism(c, 0.32, 0.86, 0.68, 1, 26, { top: '#d9cbb4', left: '#e7eef0', right: '#e7eef0' });
        prism(c, 0.32, 0, 0.68, 1, 4, { top: '#d9cbb4', left: '#2f8a4e', right: '#2f8a4e', lift: 22 });
        break;
      case 'frontY': prism(c, 0, 0, 1, 0.3, 9, Object.assign({ lpaint: paintBrick(BRICK, 3) }, brickW)); break;
      case 'frontX': prism(c, 0, 0, 0.3, 1, 9, Object.assign({ rpaint: paintBrick(BRICK, 5) }, brickW)); break;
      case 'tCol': prism(c, 0.36, 0, 0.64, 1, 24, { top: '#c8d2d8', left: '#f2f6f8', right: '#f2f6f8', rpaint: paintTiles }); break;
      case 'tRow': prism(c, 0, 0.36, 1, 0.64, 24, { top: '#c8d2d8', left: '#f2f6f8', right: '#f2f6f8', lpaint: paintTiles }); break;
      case 'tCorner':
        prism(c, 0.36, 0.36, 0.64, 1, 24, { top: '#c8d2d8', left: '#f2f6f8', right: '#f2f6f8', rpaint: paintTiles });
        prism(c, 0.36, 0.36, 1, 0.64, 24, { top: '#c8d2d8', left: '#f2f6f8', right: '#f2f6f8', lpaint: paintTiles });
        break;
      case 'tDoor': {
        prism(c, 0, 0.36, 0.12, 0.64, 24, { top: '#c8d2d8', left: '#f2f6f8', right: '#f2f6f8' });
        prism(c, 0.88, 0.36, 1, 0.64, 24, { top: '#c8d2d8', left: '#f2f6f8', right: '#f2f6f8' });
        prism(c, 0, 0.36, 1, 0.64, 3, { top: '#c8d2d8', left: '#5a8fc0', right: '#5a8fc0', lift: 21 });
        const p = iso(0.5, 0.64); rr(c, p.x - 3.5, p.y - 23.4, 7, 2.6, 0.6); fillInk(c, '#2a5ab0', 0.3);
        c.fillStyle = '#fff'; c.font = '2px sans-serif'; c.textAlign = 'center'; c.fillText('WC', p.x, p.y - 21.4);
        break;
      }
      case 'hedgeGateL': case 'hedgeGateR': {
        const L = kind === 'hedgeGateL';
        prism(c, L ? 0 : 0.3, 0, L ? 0.7 : 1, 0.4, 8, { top: '#56b244', left: '#3a8f30', right: '#348428', lpaint: paintHedge(7), tpaint: hedgeTop(7) });
        prism(c, L ? 0.64 : 0, 0, L ? 1 : 0.36, 0.4, 28, Object.assign({ lpaint: paintBrick('#c8b89a', 9), rpaint: paintBrick('#c8b89a', 10) }, { top: '#e8dcc6', left: '#c8b89a', right: '#b0a080' }));
        const p = iso(L ? 0.82 : 0.18, 0.2); ell(c, p.x, p.y - 29.5, 2.2, 1.2); fillInk(c, '#e8dcc6', 0.4); circ(c, p.x, p.y - 31, 1.4); fillInk(c, '#ff8fb8', 0.4);
        break;
      }
      default:
        if (kind.indexOf('hedgeFront') === 0) { const s = +kind.slice(-1) + 11; prism(c, 0, 0, 1, 0.4, 8, { top: '#56b244', left: '#3a8f30', right: '#348428', lpaint: paintHedge(s), tpaint: hedgeTop(s) }); }
    }
  });
}
function drawWallPiece(c, x, y) {
  let k = wallKind(x, y);
  if (!k && map[y][x] === T.DOOR && x === 13) k = 'innerDoor';
  if (!k && map[y][x] === T.DOOR && y === 17) k = 'tDoor';
  if (!k) return;
  blitTile(c, wallSprite(k), x, y);
}

// ---------- furniture ----------
const BOTTLES = ['#2a7a3a', '#7a2a2a', '#d8c060', '#3a4a8a', '#e0e0e0', '#a04a1a'];
function bottle(c, x, y, col) {
  rr(c, x - 0.9, y - 5, 1.8, 5, 0.6); fillInk(c, hshade(c, x - 0.9, x + 0.9, col), 0.35);
  rr(c, x - 0.35, y - 7, 0.7, 2.2, 0.2); fillInk(c, col, 0.3);
  c.fillStyle = '#f4ecd0'; c.fillRect(x - 0.8, y - 3.4, 1.6, 1.2);
}
function glass(c, x, y, liquid) {
  P(c, [x - 0.9, y - 2.8, x + 0.9, y - 2.8, x + 0.6, y, x - 0.6, y]); c.fillStyle = 'rgba(220,240,255,.8)'; c.fill(); ink(c, 0.25);
  if (liquid) { P(c, [x - 0.75, y - 1.8, x + 0.75, y - 1.8, x + 0.6, y, x - 0.6, y]); c.fillStyle = liquid; c.fill(); }
}
function plate(c, x, y, food) {
  ell(c, x, y, 2.6, 1.3); fillInk(c, '#ffffff', 0.35); ell(c, x, y, 1.7, 0.85); c.strokeStyle = '#d8d8e0'; c.lineWidth = 0.25; c.stroke();
  if (food) { ell(c, x - 0.4, y - 0.1, 0.9, 0.5); c.fillStyle = '#b8683a'; c.fill(); ell(c, x + 0.7, y + 0.1, 0.6, 0.35); c.fillStyle = '#6ab040'; c.fill(); }
}
function flowers(c, x, y, s) {
  s = s || 1;
  ell(c, x, y, 2.6 * s, 1.6 * s); fillInk(c, '#3f9a3a', 0.35);
  const cols = ['#ff8fb8', '#ffffff', '#c2185b', '#ffd84a', '#ff8fb8'];
  for (let i = 0; i < 5; i++) { circ(c, x - 1.6 * s + i * 0.8 * s, y - 1 * s - (i % 2) * 0.8 * s, 0.75 * s); fillInk(c, cols[i], 0.25); }
}
function drawPiece(c, o, tx, ty, dx, dy, t) {
  const p = iso(tx + 0.5, ty + 0.5); const cx = p.x, cy = p.y;
  switch (o.type) {
    case 'bar': {
      box(c, cx, cy, 15, 14, '#9a6430', '#7a4a24', '#5a3418');
      c.strokeStyle = '#d8a840'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(cx - 14, cy - 2); c.lineTo(cx, cy + 5); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 0.4;
      for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(cx - 15 + k * 3.75, cy - 12 + k * 1.9); c.lineTo(cx - 15 + k * 3.75, cy - 1 + k * 1.9); c.stroke(); }
      for (let i = 0; i < 4; i++) bottle(c, cx - 7 + i * 4, cy - 14.5 - (i % 2), BOTTLES[(i + dx * 3) % BOTTLES.length]);
      glass(c, cx + 5, cy - 11, 'rgba(240,200,90,.9)'); glass(c, cx - 3, cy - 9.5, 'rgba(200,40,60,.85)');
      if (dx === 1) { rr(c, cx - 2, cy - 20, 4, 5, 0.6); fillInk(c, '#c8c8d0', 0.35); circ(c, cx, cy - 20.5, 0.9); fillInk(c, '#d8a840', 0.3); }
      if (dx === 0 && !o.fake && !o.ghost && !barOpen(o)) {
        rr(c, cx - 7, cy - 29, 14, 5.5, 1); fillInk(c, '#c0283c', 0.45);
        c.fillStyle = '#fff'; c.font = 'bold 3.2px sans-serif'; c.textAlign = 'center'; c.fillText('CLOSED', cx, cy - 25.1);
      }
      break;
    }
    case 'canape': {
      box(c, cx, cy, 12, 10, '#ffffff', '#ece6d8', '#d6cebc');
      for (let k = 0; k < 4; k++) { ell(c, cx - 10.5 + k * 3, cy - 4.5 + k * 1.5, 1.4, 1.2); c.fillStyle = '#f4efe2'; c.fill(); }
      ell(c, cx, cy - 10.5, 6.5, 3); fillInk(c, lg(c, cx - 6, 0, cx + 6, 0, [[0, '#f4f4f8'], [1, '#b8bcc8']]), 0.4);
      const cols = ['#f0a040', '#e05a5a', '#8ac050', '#f7e070', '#c88aff'];
      for (let i = 0; i < 7; i++) { circ(c, cx - 4 + (i % 4) * 2.6, cy - 11.5 + Math.floor(i / 4) * 1.8, 0.85); fillInk(c, cols[i % 5], 0.25); }
      break;
    }
    case 'fountain': {
      box(c, cx, cy, 11, 8, '#ffffff', '#ece6d8', '#d6cebc');
      cyl(c, cx, cy - 9, 7, 3.2, 2.5, '#c0c4cc', '#5a2e14');
      cyl(c, cx, cy - 12, 4.5, 2, 3, '#6a3a1e', '#7a4422');
      cyl(c, cx, cy - 16, 2.6, 1.2, 3.2, '#7a4422', '#8a5030');
      cyl(c, cx, cy - 19.5, 1.1, 0.5, 3, '#c0c4cc');
      const k = (t * 6) % 4;
      c.strokeStyle = '#4a2410'; c.lineWidth = 0.6;
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.6; c.beginPath(); c.moveTo(cx + Math.cos(a) * 4.4, cy - 12 + Math.sin(a) * 1.9); c.lineTo(cx + Math.cos(a) * 4.6, cy - 10.5 + (k + i) % 2); c.stroke(); }
      circ(c, cx + 8, cy - 9, 1.1); fillInk(c, '#e05a7a', 0.3); circ(c, cx - 8.5, cy - 8.5, 1.1); fillInk(c, '#f0d050', 0.3);
      break;
    }
    case 'portaloo': {
      box(c, cx, cy, 10, 26, '#6aa0f0', '#3a7ad8', '#2a5ab0');
      ell(c, cx, cy - 26, 9, 4.2); fillInk(c, '#8ab8ff', 0.45);
      P(c, [cx - 8.5, cy - 22.5, cx - 2.5, cy - 19.5, cx - 2.5, cy - 1.5, cx - 8.5, cy - 4.5]); fillInk(c, '#2f6ac8', 0.4);
      c.strokeStyle = '#1c4a90'; c.lineWidth = 0.4; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(cx - 7.5, cy - 20 + i * 1.2); c.lineTo(cx - 3.5, cy - 18 + i * 1.2); c.stroke(); }
      circ(c, cx - 3.6, cy - 10, 0.5); fillInk(c, '#e0e0e0', 0.25);
      const busy = o.slots && o.slots[0] && o.slots[0].user;
      circ(c, cx, cy - 31.5, 1.2); fillInk(c, busy ? '#ff3030' : '#30e050', 0.35);
      break;
    }
    case 'toilet': {
      box(c, cx, cy, 13, 21, '#f6f6f0', '#e4e4dc', '#c8c8c0');
      P(c, [cx - 11, cy - 18.5, cx - 3, cy - 14.5, cx - 3, cy - 1.5, cx - 11, cy - 5.5]); fillInk(c, '#d8d8cc', 0.4);
      circ(c, cx - 4.4, cy - 8.5, 0.5); fillInk(c, '#a0a0a0', 0.25);
      const busy = o.slots && o.slots[0] && o.slots[0].user;
      circ(c, cx, cy - 27.5, 1.1); fillInk(c, busy ? '#ff3030' : '#30e050', 0.35);
      break;
    }
    case 'booth': {
      const busy = o.slots && o.slots[0] && o.slots[0].user;
      box(c, cx, cy, 13, 27, busy && Math.floor(t * 3) % 4 === 0 ? '#fff6a0' : '#e0384c', '#c02a3e', '#8a1a2a');
      P(c, [cx - 12, cy - 23, cx - 2, cy - 18, cx - 2, cy - 1.5, cx - 12, cy - 6.5]); fillInk(c, '#7a1426', 0.4);
      c.strokeStyle = '#a8203a'; c.lineWidth = 0.6; for (let i = 0; i < 5; i++) { const u = cx - 11 + i * 2; c.beginPath(); c.moveTo(u, cy - 22 + i); c.quadraticCurveTo(u + 0.8, cy - 13 + i, u, cy - 6 + i); c.stroke(); }
      P(c, [cx + 2, cy - 27, cx + 12, cy - 32, cx + 12, cy - 28, cx + 2, cy - 23]); fillInk(c, '#ffd84a', 0.4);
      c.save(); c.transform(1, -0.5, 0, 1, cx + 2, cy - 23.6); c.fillStyle = '#a81c2e'; c.font = 'bold 3px sans-serif'; c.textAlign = 'left'; c.fillText('PHOTO', 0.6, -0.2); c.restore();
      break;
    }
    case 'castle': {
      const cols = [['#ff5a6a', '#e83a4a', '#b02a3a'], ['#4a9aff', '#2a7ae0', '#1a5ab0'], ['#ffd84a', '#f0b830', '#c08a20'], ['#5ad070', '#3ab050', '#2a8a3a']];
      const k = dy * 2 + dx, cc = cols[k % 4];
      box(c, cx, cy, 16, 7, cc[0], cc[1], cc[2]);
      for (let i = 0; i < 4; i++) { ell(c, cx - 12 + i * 4, cy - 6.5 + i * 2, 2.2, 1.6); fillInk(c, shade(cc[0], 0.2), 0.35); }
      if (!(dx === 1 && dy === 1)) {
        const ox = dx === 0 ? -9 : 9, oy = dy === 0 ? -4 : 4, tc = cols[(k + 1) % 4];
        cyl(c, cx + ox, cy + oy - 6, 3.4, 1.7, 15, tc[1], tc[0]);
        P(c, [cx + ox - 3.8, cy + oy - 21, cx + ox + 3.8, cy + oy - 21, cx + ox, cy + oy - 28]); fillInk(c, hshade(c, cx + ox - 4, cx + ox + 4, cols[(k + 2) % 4][1]), 0.45);
        P(c, [cx + ox, cy + oy - 28, cx + ox, cy + oy - 32, cx + ox + 3, cy + oy - 30.5]); fillInk(c, '#ffffff', 0.3);
      }
      break;
    }
    case 'plant': {
      cyl(c, cx, cy - 0.5, 4, 2, 6, '#c0703a', '#5a3a20');
      for (const [ox, oy, r, col] of [[-2.6, -9, 3.2, '#3f9a3a'], [2.6, -9.5, 3.2, '#3a8e34'], [0, -12, 3.6, '#48a842'], [0, -8, 3, '#3f9a3a']]) { circ(c, cx + ox, cy + oy, r); fillInk(c, lg(c, cx + ox - r, cy + oy - r, cx + ox + r, cy + oy + r, [[0, shade(col, 0.3)], [1, shade(col, -0.25)]]), 0.45); }
      for (const [ox, oy, col] of [[-2, -11, '#ff8fb8'], [1.8, -12.5, '#ffffff'], [0.6, -9, '#ff6fa0'], [-3, -8, '#ffd84a'], [2.8, -9, '#ff8fb8']]) { circ(c, cx + ox, cy + oy, 0.9); fillInk(c, col, 0.25); }
      break;
    }
    case 'tree': {
      cyl(c, cx, cy, 2.2, 1.1, 16, '#7a5030', '#5a3820', true);
      const v = o.id % 3;
      const blobs = v === 0 ? [[0, -26, 11], [-8, -20, 7.5], [8, -20, 7.5], [0, -18, 8]] : v === 1 ? [[0, -28, 10], [-7, -22, 8], [7, -23, 8], [-3, -17, 7], [4, -17, 7]] : [[0, -24, 12], [-6, -32, 6], [6, -31, 6]];
      for (const [ox, oy, r] of blobs) { circ(c, cx + ox, cy + oy, r + 0.5); c.fillStyle = INK; c.fill(); }
      for (const [ox, oy, r] of blobs) {
        const g = c.createRadialGradient(cx + ox - r * 0.4, cy + oy - r * 0.45, r * 0.1, cx + ox, cy + oy, r);
        g.addColorStop(0, '#9ae26a'); g.addColorStop(0.55, '#4cad3a'); g.addColorStop(1, '#2a7424');
        circ(c, cx + ox, cy + oy, r); c.fillStyle = g; c.fill();
      }
      for (let i = 0; i < 26; i++) {
        const a = hash2(i, o.id) * Math.PI * 2, rad = hash2(o.id, i) * 9;
        circ(c, cx + Math.cos(a) * rad, cy - 23 + Math.sin(a) * rad * 0.8, 0.9);
        c.fillStyle = hash2(i * 3, o.id) < 0.5 ? 'rgba(30,90,30,.5)' : 'rgba(170,240,120,.5)'; c.fill();
      }
      if (v === 1) for (let i = 0; i < 6; i++) { circ(c, cx - 7 + hash2(i, 5) * 14, cy - 30 + hash2(5, i) * 14, 0.8); fillInk(c, '#ffd0e0', 0.2); }
      break;
    }
    case 'lamp': {
      ell(c, cx, cy, 2.5, 1.2); fillInk(c, '#2a3a2a', 0.4);
      rr(c, cx - 0.8, cy - 28, 1.6, 28, 0.6); fillInk(c, hshade(c, cx - 1, cx + 1, '#3a4a3a'), 0.4);
      const lit = nightAlpha() > 0.15;
      P(c, [cx - 3, cy - 34, cx + 3, cy - 34, cx + 2.2, cy - 28, cx - 2.2, cy - 28]); fillInk(c, lit ? '#fff4a0' : '#e8f0e0', 0.45);
      P(c, [cx - 3.6, cy - 34, cx + 3.6, cy - 34, cx, cy - 37]); fillInk(c, '#2a3a2a', 0.4);
      c.strokeStyle = '#2a3a2a'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(cx, cy - 34); c.lineTo(cx, cy - 28); c.stroke();
      break;
    }
    case 'samovar': {
      box(c, cx, cy, 8, 7, '#f0e6d0', '#d8c8a8', '#b8a888');
      ell(c, cx, cy - 15, 5.5, 6.2); fillInk(c, lg(c, cx - 5.5, 0, cx + 5.5, 0, [[0, '#fff0b0'], [0.35, '#e0b048'], [1, '#8a5a1a']]), 0.5);
      c.strokeStyle = '#c03030'; c.lineWidth = 0.7; c.beginPath(); c.ellipse(cx, cy - 15, 5.2, 1.4, 0, 0, Math.PI); c.stroke();
      cyl(c, cx, cy - 20.5, 2.2, 1, 2, '#d4a040'); cyl(c, cx, cy - 23, 1.6, 0.8, 3, '#e8c060');
      ell(c, cx + 0.2, cy - 27, 2.2, 1.6); fillInk(c, '#ffffff', 0.4); circ(c, cx - 0.4, cy - 27.4, 0.5); c.fillStyle = '#3060c0'; c.fill();
      limb(c, [cx + 4.5, cy - 12, cx + 7, cy - 11.5, cx + 7, cy - 10], 0.7, '#a0702a');
      limb(c, [cx - 5.5, cy - 18, cx - 7, cy - 16, cx - 5.6, cy - 13.5], 0.6, '#a0702a');
      if (Math.floor(t * 2) % 3) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(cx, cy - 29); c.quadraticCurveTo(cx + 1.5, cy - 31, cx, cy - 33); c.stroke(); }
      break;
    }
    case 'lights': {
      rr(c, cx - 0.6, cy - 26, 1.2, 26, 0.4); fillInk(c, '#6a5a4a', 0.35);
      const BC = ['#ffef80', '#ff8fb8', '#8fd8ff', '#b8ff8f'];
      c.strokeStyle = '#444'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(cx - 10, cy - 24); c.quadraticCurveTo(cx, cy - 16, cx + 10, cy - 24); c.stroke();
      for (let k = 0; k < 7; k++) {
        const u = k / 6, bx = cx - 10 + 20 * u, by = cy - 24 + 8 * 4 * u * (1 - u) * 0.5 + 1;
        circ(c, bx, by, 0.9); c.fillStyle = BC[(k + Math.floor(t * 2)) % 4]; c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 0.25; c.stroke();
      }
      break;
    }
    case 'parasol': {
      cyl(c, cx, cy, 5, 2.5, 6, '#ffffff', '#f4f4f0');
      rr(c, cx - 0.4, cy - 26, 0.8, 21, 0.3); fillInk(c, '#e0e0e0', 0.3);
      for (let i = 0; i < 8; i++) {
        const a0 = Math.PI + i * Math.PI / 8, a1 = a0 + Math.PI / 8;
        P(c, [cx, cy - 31, cx + Math.cos(a0) * 13, cy - 24 + Math.sin(a0) * -1.5, cx + Math.cos(a1) * 13, cy - 24 + Math.sin(a1) * -1.5]);
        c.fillStyle = i % 2 ? '#ffffff' : '#e0384c'; c.fill();
      }
      c.strokeStyle = INK; c.lineWidth = OLW; c.beginPath(); c.moveTo(cx - 13, cy - 24); c.quadraticCurveTo(cx, cy - 20, cx + 13, cy - 24); c.lineTo(cx, cy - 31); c.closePath(); c.stroke();
      break;
    }
    case 'bin': {
      cyl(c, cx, cy, 3.8, 1.9, 9, '#6a7480', '#4a525c');
      ell(c, cx, cy - 9.5, 4.3, 2.1); fillInk(c, '#8a949e', 0.45); rr(c, cx - 1, cy - 11.5, 2, 1.4, 0.5); fillInk(c, '#8a949e', 0.3);
      break;
    }
    case 'chair': {
      P(c, [cx - 4.5, cy - 3.5, cx, cy - 1.2, cx + 4.5, cy - 3.5, cx, cy - 5.8]); fillInk(c, '#ffffff', 0.45);
      c.strokeStyle = '#c8c8c8'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(cx - 3.5, cy - 3.2); c.lineTo(cx - 3.5, cy); c.moveTo(cx + 3.5, cy - 3.2); c.lineTo(cx + 3.5, cy); c.moveTo(cx, cy - 1.4); c.lineTo(cx, cy + 1.5); c.stroke();
      rr(c, cx - 4, cy - 13.5, 8, 9, 2.5); fillInk(c, lg(c, cx - 4, 0, cx + 4, 0, [[0, '#ffffff'], [1, '#d8d8de']]), 0.45);
      ell(c, cx - 1.3, cy - 9, 1.3, 1); fillInk(c, '#ff8fb8', 0.3); ell(c, cx + 1.3, cy - 9, 1.3, 1); fillInk(c, '#ff8fb8', 0.3);
      c.strokeStyle = '#ff6fa0'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(cx - 0.3, cy - 8.5); c.lineTo(cx - 1, cy - 6); c.moveTo(cx + 0.3, cy - 8.5); c.lineTo(cx + 1.2, cy - 6); c.stroke();
      break;
    }
    case 'dchair': {
      P(c, [cx - 4.5, cy - 3.5, cx, cy - 1.2, cx + 4.5, cy - 3.5, cx, cy - 5.8]); fillInk(c, '#f4d47a', 0.45);
      c.strokeStyle = '#b08a30'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(cx - 3.5, cy - 3.2); c.lineTo(cx - 3.5, cy); c.moveTo(cx + 3.5, cy - 3.2); c.lineTo(cx + 3.5, cy); c.moveTo(cx, cy - 1.4); c.lineTo(cx, cy + 1.5); c.stroke();
      limb(c, [cx - 3.8, cy - 4, cx - 3.8, cy - 13], 0.8, '#e0b84a'); limb(c, [cx + 3.8, cy - 4, cx + 3.8, cy - 13], 0.8, '#c89a30');
      limb(c, [cx - 3.8, cy - 12.6, cx + 3.8, cy - 12.6], 0.9, '#e8c460');
      for (let i = 0; i < 3; i++) limb(c, [cx - 3.8, cy - 10.5 + i * 2, cx + 3.8, cy - 10.5 + i * 2], 0.4, '#d8b050');
      break;
    }
    case 'table': case 'ttable': {
      box(c, cx, cy, 16, 11, '#ffffff', '#f2ede2', '#d8d0c0');
      for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(cx - 13 + k * 4, cy - 9 + k * 2); c.quadraticCurveTo(cx - 11 + k * 4, cy - 4.5 + k * 2, cx - 13 + k * 4, cy - 0.5 + k * 2); c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 0.6; c.stroke(); }
      if (o.type === 'ttable') {
        for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(cx - 16 + k * 8, cy - 9 + k * 4); c.quadraticCurveTo(cx - 12 + k * 8, cy - 4.5 + k * 4, cx - 8 + k * 8, cy - 5 + k * 4); c.strokeStyle = '#ff8fb8'; c.lineWidth = 1.1; c.stroke(); circ(c, cx - 8 + k * 8, cy - 5.5 + k * 4, 1); fillInk(c, '#e05a8a', 0.3); }
      }
      const dinner = G && (G.phase === 'dinner' || G.phase === 'speeches');
      plate(c, cx - 5, cy - 13, dinner); plate(c, cx + 5, cy - 9.5, dinner);
      glass(c, cx + 1, cy - 13.5, 'rgba(200,40,60,.8)'); glass(c, cx - 1, cy - 9.5, 'rgba(240,210,120,.85)');
      c.strokeStyle = '#a0a8b0'; c.lineWidth = 0.35; c.beginPath(); c.moveTo(cx - 8.4, cy - 13.5); c.lineTo(cx - 8, cy - 12); c.moveTo(cx + 8.3, cy - 10); c.lineTo(cx + 8, cy - 8.5); c.stroke();
      if (dx === 1 || (o.type === 'ttable' && dx % 2 === 1)) {
        flowers(c, cx, cy - 13.5, 1.3);
        rr(c, cx + 2.6, cy - 18, 0.9, 3.5, 0.3); fillInk(c, '#fff8e0', 0.25); circ(c, cx + 3.05, cy - 18.6, 0.5); c.fillStyle = '#ffb030'; c.fill();
      }
      break;
    }
    case 'cake': {
      box(c, cx, cy, 11, 9, '#ffffff', '#f2ede2', '#d8d0c0');
      const tiers = !G ? 3 : (G.cakeEaten ? 0 : !G.cakeCut ? 3 : Math.max(0, Math.ceil(G.cakeSlices / 17)));
      for (let i = 0; i < tiers; i++) {
        const rx = 8 - i * 2.2, y = cy - 9 - i * 5;
        cyl(c, cx, y, rx, rx * 0.5, 5, '#fffaf0', '#fffdf8');
        for (let k = 0; k < 4; k++) { circ(c, cx - rx * 0.75 + k * rx * 0.5, y - 2.5 + Math.sin(k) * 0.4, 0.75); fillInk(c, '#c2185b', 0.2); }
      }
      if (tiers === 3) heart(c, cx, cy - 27, 1.8, '#c2185b');
      if (G && G.cakeEaten) { ell(c, cx, cy - 10, 6, 2.6); c.fillStyle = '#f8f0e0'; c.fill(); for (let k = 0; k < 6; k++) { circ(c, cx - 5 + hash2(k, 3) * 10, cy - 11 + hash2(3, k) * 3, 0.6); c.fillStyle = '#e8d8b8'; c.fill(); } }
      break;
    }
    case 'dj': {
      const on = G && G.djOn;
      if (dx !== 1) {
        box(c, cx, cy, 10, 22, '#3a3a3a', '#262626', '#1a1a1a');
        const pulse = on && Math.floor(t * 4) % 2 ? 0.6 : 0;
        for (const [oy, r] of [[-15, 3 + pulse], [-7, 2.4]]) {
          const ex = cx - 5, ey = cy + oy - 0.5;
          ell(c, ex, ey, r, r * 1.1, 0.46); fillInk(c, lg(c, ex - r, ey - r, ex + r, ey + r, [[0, '#888'], [1, '#222']]), 0.4);
          ell(c, ex, ey, r * 0.35, r * 0.4, 0.46); c.fillStyle = '#111'; c.fill();
        }
      } else {
        box(c, cx, cy, 15, 12, '#4a4a4a', '#2a2a2a', '#1e1e1e');
        for (const ox of [-5, 5]) { ell(c, cx + ox, cy - 12.5 + (ox > 0 ? 1.2 : -0.2), 3.2, 1.6); fillInk(c, '#222', 0.4); ell(c, cx + ox, cy - 12.5 + (ox > 0 ? 1.2 : -0.2), 1, 0.5); c.fillStyle = '#c03030'; c.fill(); }
        const LC = ['#ff3a6a', '#3affb0', '#3a8aff', '#ffd83a'];
        for (let i = 0; i < 5; i++) { circ(c, cx - 13 + i * 2.8, cy - 7 + i * 1.4, 0.8); c.fillStyle = on ? LC[(i + Math.floor(t * 6)) % 4] : '#555'; c.fill(); }
      }
      break;
    }
    case 'kitchen': {
      box(c, cx, cy, 15, 14, '#e4e8ee', '#b8bec8', '#98a0ac');
      c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(cx - 14, cy - 8); c.lineTo(cx, cy - 1); c.stroke();
      const dinner = G && G.phase === 'dinner';
      limb(c, [cx, cy - 34, cx, cy - 24], 0.4, '#666');
      P(c, [cx - 3, cy - 24, cx + 3, cy - 24, cx + 2, cy - 21.5, cx - 2, cy - 21.5]); fillInk(c, dinner ? '#ff9a3a' : '#888', 0.4);
      if (dinner) { plate(c, cx - 4, cy - 14, true); plate(c, cx + 4, cy - 12, true); c.fillStyle = 'rgba(255,160,60,.18)'; ell(c, cx, cy - 14, 9, 4); c.fill(); }
      break;
    }
  }
}
function drawArch(c, o) {
  const gate = o.type === 'gate';
  const a = iso(o.x + 0.5, o.y + 0.5), b = iso(o.x + o.w - 0.5, o.y + 0.5);
  const hgt = gate ? 34 : 38;
  for (const q of [a, b]) { rr(c, q.x - 1.4, q.y - hgt, 2.8, hgt, 0.8); fillInk(c, lg(c, q.x - 1.4, 0, q.x + 1.4, 0, [[0, '#ffffff'], [1, '#cfc8b8']]), 0.5); }
  const pt = (u) => [a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u - hgt - Math.sin(u * Math.PI) * (gate ? 10 : 14)];
  c.beginPath(); for (let i = 0; i <= 24; i++) { const [x, y] = pt(i / 24); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
  c.lineCap = 'round'; c.lineWidth = 5.4; c.strokeStyle = INK; c.stroke(); c.lineWidth = 4.2; c.strokeStyle = '#3f8a35'; c.stroke();
  const FC = ['#ff8fb8', '#ffffff', '#c2185b', '#ffd84a'];
  for (let i = 0; i <= 18; i++) { const [x, y] = pt(i / 18); circ(c, x + (i % 2 ? 0.8 : -0.8), y + (i % 3 - 1) * 0.6, 1.1); fillInk(c, FC[i % 4], 0.3); }
  for (const q of [a, b]) for (let i = 0; i < 5; i++) { circ(c, q.x + (i % 2 ? 1 : -1), q.y - hgt + 5 + i * 4.5, 1); fillInk(c, FC[(i + 1) % 4], 0.3); }
  if (gate) {
    const m = iso(o.x + o.w / 2, o.y + 0.5);
    rr(c, m.x - 12, m.y - hgt - 16, 24, 6.5, 1.2); fillInk(c, '#fdf6e3', 0.5);
    c.fillStyle = '#c2185b'; c.font = 'bold 4px sans-serif'; c.textAlign = 'center'; c.fillText('WELCOME', m.x, m.y - hgt - 11.3);
  }
}
function pieceKey(o) {
  switch (o.type) {
    case 'chair': case 'dchair': case 'plant': case 'bin': case 'parasol': case 'canape': case 'castle': return '';
    case 'tree': return '' + (o.id % 3);
    case 'table': case 'ttable': case 'kitchen': return (G.phase === 'dinner' || G.phase === 'speeches') ? 'd' : 'n';
    case 'bar': return barOpen(o) ? 'o' : 'c';
    case 'portaloo': case 'toilet': return (o.slots[0] && o.slots[0].user) ? 'b' : 'f';
    case 'cake': return (!G.cakeCut ? 3 : Math.max(0, Math.ceil(G.cakeSlices / 17))) + (G.cakeEaten ? 'e' : '');
    case 'lamp': return nightAlpha() > 0.15 ? 'n' : 'd';
  }
  return null;
}
function drawPieceCached(c, o, tx, ty, dx, dy, t) {
  const k = pieceKey(o);
  if (k === null) { drawPiece(c, o, tx, ty, dx, dy, t); return; }
  const spr = sprite('pc:' + o.type + ':' + dx + ':' + dy + ':' + k, 72, 104, 36, 82, (sc) => drawPiece(sc, o, 0, 0, dx, dy, 0));
  blitTile(c, spr, tx, ty);
}
function drawSingleCached(c, o) {
  const spr = sprite('single:' + o.type, 100, 100, 32, 64, (sc) => drawArch(sc, Object.assign({}, o, { x: 0, y: 0 })));
  blitTile(c, spr, o.x, o.y);
}

function buildStatic() {
  staticList = [];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (y === 0 || x === 0) continue;
    const t = map[y][x];
    if (t === T.HEDGE || t === T.WALL || (t === T.DOOR && (x === 13 || y === 17))) staticList.push({ d: x + y + 1, k: 0, f: (c) => drawWallPiece(c, x, y) });
  }
  for (const o of G.objects) {
    const d = OT[o.type];
    if (d.single) { staticList.push({ d: o.x + o.w + o.y + o.h - 1, k: 0, f: (c) => drawSingleCached(c, o) }); continue; }
    for (let dy = 0; dy < o.h; dy++) for (let dx = 0; dx < o.w; dx++) {
      const tx = o.x + dx, ty = o.y + dy;
      staticList.push({ d: tx + ty + 1, k: 0, f: (c, t) => drawPieceCached(c, o, tx, ty, dx, dy, t) });
    }
  }
  staticDirty = false;
}

// ---------- people ----------
const SICK_SKIN = '#a9c26e';
const PSW = 60, PSH = 50, PAX = 30, PAY = 42;
const PCACHE = new Map();
function clearPeopleCache() { PCACHE.clear(); }
function personPose(p, t) {
  const L = p.look;
  const sick = p.state === 'sick';
  const lying = p.state === 'sleep' || p.state === 'fallen';
  const cossack = p.state === 'dance' && G && G.musicOverride && G.musicOverride.track === 'korob' && G.time < G.musicOverride.until;
  const squat = !!(cossack && !L.kid);
  let lift = 0, dx = 0;
  if (p.onCastle) lift = 6 + Math.abs(Math.sin(t * 7 + p.id)) * 7;
  else if (p.state === 'dance') lift = Math.abs(Math.sin(t * (p.danceSpeed || 8) + p.id)) * 2;
  else if (p.hyper > 0 && p.moving) lift = Math.abs(Math.sin(t * 16)) * 1.4;
  if (p.drunk > 45 && !p.sitting && !sick && !lying) dx += Math.sin(t * 2.3 + p.id) * (p.drunk - 40) / 18;
  if (p.state === 'fight') dx += Math.sin(t * 20 + p.id) * 1.6;
  const moving = !!(p.moving && !p.sitting) && !lying;
  const step = moving ? Math.floor(t * 9 + p.id) % 4 : 0;
  const mode = lying ? 'down' : sick ? 'sick' : squat ? 'cross' : armMode(p, t);
  const alt = mode === 'up' ? Math.floor(t * 4 + p.id) % 2 : mode === 'clap' ? Math.floor(t * 6 + p.id) % 2 : 0;
  const kick = squat ? Math.floor(t * 6 + p.id) % 2 : 0;
  const mop = L.mop && p.cleaning ? Math.round(Math.sin(t * 12) * 2) : 0;
  const hb = (p.kind === 'couple' && !p.thoughtT && !lying) ? Math.round(Math.sin(t * 3) * 2) / 2 : 9;
  const green = sick || p.queasy > 0;
  const face = lying && p.state === 'sleep' ? 'z' : sick ? 's' : p.state === 'fight' ? 'a' : L.kid ? 'k' : (p.happy > 65 || p.kind === 'couple') ? 'h' : p.happy < 30 ? 'a' : 'n';
  const blush = p.drunk > 55 && !sick;
  const stain = !!(L.groom && G && G.groomStain);
  const back = !lying && p.face === 'b';
  const flip = !!p.flip;
  const key = (lying ? 'L' : '') + (sick ? 'S' : '') + (p.sitting ? 's' : '') + (squat ? 'q' : '') + (moving ? 'm' : '') + step + mode + alt + kick + mop + hb + face +
    (blush ? 'b' : '') + (green ? 'g' : '') + (p.carry || '') + (stain ? 'x' : '') + (back ? 'B' : '') + (flip ? 'F' : '');
  return { key, lift, dx, sick, lying, squat, moving, step, mode, alt, kick, mop, hb, green, blush, stain, back, flip, face };
}
function renderPoseSprite(p, P) {
  const cv = mkCanvas(PSW * RS, PSH * RS);
  const c = cv.getContext('2d');
  c.scale(RS, RS); c.translate(PAX, PAY);
  let info;
  if (P.lying) { c.save(); c.translate(1, -2.2); c.rotate(-Math.PI / 2); drawBody(c, p, P); c.restore(); info = { top: -10, mouth: { x: -19, y: -2 } }; }
  else { if (P.flip) c.scale(-1, 1); info = drawBody(c, p, P); if (P.flip) info.mouth.x = -info.mouth.x; }
  return { cv, top: info.top, mouth: info.mouth };
}
function drawPersonFull(c, p, t) {
  if (p.kind === 'animal') { drawAnimal(c, p, t); return; }
  const s = iso(p.x, p.y); const fx = s.x, fy = s.y;
  const P = personPose(p, t);
  ell(c, fx + (P.lying ? -9 : 0), fy, P.lying ? 12 : 5, P.lying ? 2.6 : 2.1); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill();
  const key = p.id + '|' + (p.lookV || 0) + '|' + P.key;
  let spr = PCACHE.get(key);
  if (spr) { PCACHE.delete(key); PCACHE.set(key, spr); }
  else { spr = renderPoseSprite(p, P); PCACHE.set(key, spr); if (PCACHE.size > 700) PCACHE.delete(PCACHE.keys().next().value); }
  c.drawImage(spr.cv, fx + P.dx - PAX, fy - P.lift - PAY, PSW, PSH);
  p._top = spr.top + fy - P.lift;
  p._mouth = { x: spr.mouth.x + fx + P.dx, y: spr.mouth.y + fy - P.lift };
  if (p.state === 'fallen') for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.1; star(c, fx - 18 + Math.cos(a) * 4, fy - 8 + Math.sin(a) * 1.5, 1.1, '#ffe040'); }
}
// draw without the cache (title screen, portraits, previews)
function drawPersonDirect(c, p, t) {
  const s = iso(p.x, p.y);
  const P = personPose(p, t || 0);
  ell(c, s.x, s.y, 5, 2.1); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill();
  c.save(); c.translate(s.x, s.y - P.lift); if (P.flip) c.scale(-1, 1); drawBody(c, p, P); c.restore();
}
function armMode(p, t) {
  if (p.state === 'dance') return (p.kind === 'couple' && G && G.phase === 'firstdance') ? 'hold' : 'up';
  if (p.state === 'fight') return 'up';
  if (p.state === 'watch' && G && (G.phase === 'firstdance' || G.phase === 'sendoff')) return 'clap';
  if (p.state === 'conga') return 'up';
  if (p.role === 'waiter' && (p.carry === 'tray' || p.carry === 'plate')) return 'tray';
  if (p.state === 'chat' && p.drinkInHand) return 'drink';
  if (p.look && p.look.bride) return 'bouquet';
  return 'down';
}
function hairCap(c, hx, hy, r, col) {
  c.beginPath();
  c.arc(hx, hy, r + 0.25, Math.PI * 0.93, Math.PI * 2.07);
  c.quadraticCurveTo(hx + r * 0.5, hy - r * 0.55, hx + r * 0.1, hy - r * 0.35);
  c.quadraticCurveTo(hx - r * 0.5, hy - r * 0.55, hx - r - 0.2, hy + r * 0.25);
  c.closePath();
  fillInk(c, lg(c, hx - r, hy - r, hx + r, hy, [[0, shade(col, 0.3)], [0.5, col], [1, shade(col, -0.25)]]), 0.5);
}
function drawBody(c, p, Q) {
  const L = p.look;
  const kid = !!L.kid;
  if (kid) { c.save(); c.scale(0.72, 0.72); }
  const back = Q.back;
  const oy = p.sitting ? 3.6 : Q.squat ? 4 : 0;
  const sick = Q.sick;
  const big = L.big ? 1.3 : 0;
  const tw = 3.8 + big;
  const hipY = -7.4 + oy, shY = -14.8 + oy;
  const hr = kid ? 4.1 : 3.6;
  const hx = sick ? 2 : 0, hy = -19.9 + oy + (sick ? 2.4 : 0) - (kid ? 0.6 : 0);
  const skin = Q.green ? SICK_SKIN : L.skin;
  const top = L.top || '#555', trouser = L.bottom || L.top || '#333', shoes = L.shoes || '#222';
  const hc = L.hair || '#333';
  const sleeve = L.sleeve || (L.dress ? skin : top);

  const veil = () => {
    c.beginPath(); c.moveTo(hx - 2.2, hy - hr + 0.6);
    c.quadraticCurveTo(hx - 7, hy + 4, hx - 6.4, hipY + 2); c.lineTo(hx + 6.4, hipY + 2);
    c.quadraticCurveTo(hx + 7, hy + 4, hx + 2.2, hy - hr + 0.6); c.closePath();
    c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); c.strokeStyle = 'rgba(160,160,190,.8)'; c.lineWidth = 0.35; c.stroke();
  };
  if (L.bride && !back) veil();
  if (L.veilL && !back) { c.beginPath(); c.moveTo(hx - 2, hy - hr); c.quadraticCurveTo(hx - 5, hy + 2, hx - 4.5, shY + 4); c.lineTo(hx + 4.5, shY + 4); c.quadraticCurveTo(hx + 5, hy + 2, hx + 2, hy - hr); c.closePath(); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill(); }
  if (!back && (L.style === 'long' || L.style === 'bob')) {
    const len = L.style === 'long' ? 8.5 : 5;
    rr(c, hx - hr - 0.8, hy - 1.5, hr * 2 + 1.6, len + 1.5, 2); fillInk(c, shade(hc, -0.1), 0.5);
  }
  if (!back && L.style === 'pony') { ell(c, hx + hr + 0.8, hy + 1.2, 1.3, 2.8); fillInk(c, hc, 0.45); }

  // legs
  const sw = Q.moving ? [0, 1, 0, -1][Q.step] : 0;
  if (!L.dress) {
    const trD = shade(trouser, -0.25);
    if (p.sitting) {
      if (!back) {
        limb(c, [-1.6, hipY, -1.9, hipY + 3.2], 2.3, trouser); limb(c, [1.6, hipY, 1.9, hipY + 3.2], 2.3, trD);
        ell(c, -1.9, hipY + 3.6, 1.4, 0.9); fillInk(c, shoes, 0.4); ell(c, 1.9, hipY + 3.6, 1.4, 0.9); fillInk(c, shoes, 0.4);
      }
    } else if (Q.squat) {
      const k = Q.kick ? 1 : -1;
      limb(c, [1.6 * k, hipY, 7 * k, hipY + 2], 2.2, trD); ell(c, 7.6 * k, hipY + 1.8, 1.5, 0.9); fillInk(c, shoes, 0.4);
      limb(c, [-1.6 * k, hipY, -2.6 * k, hipY + 3.6], 2.2, trouser); ell(c, -2.8 * k, hipY + 4, 1.5, 0.9); fillInk(c, shoes, 0.4);
    } else {
      const lx = -1.6 + sw * 0.9, rx = 1.6 - sw * 0.9, ll = sw > 0 ? 0.9 : 0, rl = sw < 0 ? 0.9 : 0;
      limb(c, [-1.5, hipY, lx, -1.2 - ll], 2.4, trouser); limb(c, [1.5, hipY, rx, -1.2 - rl], 2.4, trD);
      ell(c, lx - 0.2, -0.9 - ll, 1.6, 0.95); fillInk(c, shoes, 0.4); ell(c, rx + 0.2, -0.9 - rl, 1.6, 0.95); fillInk(c, shoes, 0.4);
      if (!back) { ell(c, lx - 0.6, -1.2 - ll, 0.5, 0.25); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); }
    }
  } else if (!p.sitting) {
    ell(c, -1.6 + sw * 0.6, -0.8, 1.4, 0.85); fillInk(c, shoes, 0.4); ell(c, 1.6 - sw * 0.6, -0.8, 1.4, 0.85); fillInk(c, shoes, 0.4);
  }
  if (L.dress) {
    const waistY = hipY - 2.3, hemY = p.sitting ? hipY + 3.5 : -1.3, hemW = L.bride ? 6.6 : 4.4 + (sw ? 0.3 : 0);
    c.beginPath(); c.moveTo(-tw + 0.9, waistY); c.lineTo(tw - 0.9, waistY);
    c.quadraticCurveTo(hemW * 0.8, (waistY + hemY) / 2, hemW, hemY);
    c.quadraticCurveTo(0, hemY + 1.4, -hemW, hemY);
    c.quadraticCurveTo(-hemW * 0.8, (waistY + hemY) / 2, -tw + 0.9, waistY);
    c.closePath(); fillInk(c, hshade(c, -hemW, hemW, top), 0.55);
    if (L.bride) {
      c.strokeStyle = 'rgba(170,170,200,.6)'; c.lineWidth = 0.35;
      for (const fx of [-2.5, 0, 2.5]) { c.beginPath(); c.moveTo(fx * 0.4, waistY + 1); c.quadraticCurveTo(fx * 0.8, (waistY + hemY) / 2, fx * 1.6, hemY); c.stroke(); }
      for (let i = 0; i < 7; i++) { circ(c, -hemW + 0.6 + i * (hemW * 2 - 1.2) / 6, hemY + 0.3 + Math.sin(i) * 0.3, 0.45); c.fillStyle = '#ffffff'; c.fill(); }
    }
  }
  if (L.apron && !back) { rr(c, -tw + 0.4, hipY - 2.6, tw * 2 - 0.8, 6.5, 1); fillInk(c, '#f4f4f4', 0.45); }

  const hand = (x, y) => { circ(c, x, y, 0.95); fillInk(c, L.gloves || skin, 0.4); };
  const shL = [-(tw - 0.5), shY + 0.9], shR = [tw - 0.5, shY + 0.9];
  const armsFn = () => {
    const sD = shade(sleeve, -0.22);
    switch (Q.mode) {
      case 'up': {
        const a = Q.alt;
        limb(c, [shL[0], shL[1], shL[0] - 1.4, shY - (a ? 6.5 : 3.5)], 1.9, sleeve); hand(shL[0] - 1.6, shY - (a ? 7.2 : 4.2));
        limb(c, [shR[0], shR[1], shR[0] + 1.4, shY - (a ? 3.5 : 6.5)], 1.9, sD); hand(shR[0] + 1.6, shY - (a ? 4.2 : 7.2));
        break;
      }
      case 'clap': {
        const g = Q.alt ? 1.6 : 0.6;
        limb(c, [shL[0], shL[1], shL[0] - 0.8, shY + 4, -g, shY + 3], 1.8, sleeve); limb(c, [shR[0], shR[1], shR[0] + 0.8, shY + 4, g, shY + 3], 1.8, sD);
        hand(-g, shY + 3); hand(g, shY + 3); break;
      }
      case 'cross':
        limb(c, [shL[0], shL[1], shL[0] - 0.5, shY + 4, 2, shY + 3.2], 1.8, sleeve); limb(c, [shR[0], shR[1], shR[0] + 0.5, shY + 4, -2, shY + 3.4], 1.8, sD);
        hand(2, shY + 3.2); hand(-2, shY + 3.4); break;
      case 'sick':
        limb(c, [shL[0], shL[1], -2.6, hipY + 2.5], 1.8, sleeve); limb(c, [shR[0], shR[1], 2.6, hipY + 2.5], 1.8, sD);
        hand(-2.6, hipY + 2.5); hand(2.6, hipY + 2.5); break;
      case 'hold':
        limb(c, [shL[0], shL[1], shL[0] - 1.2, shY - 1.5], 1.8, sleeve); hand(shL[0] - 1.4, shY - 2);
        limb(c, [shR[0], shR[1], shR[0] + 1.5, shY + 4, shR[0] + 0.5, shY + 5.5], 1.8, sD); hand(shR[0] + 0.5, shY + 5.5); break;
      case 'bouquet':
        limb(c, [shL[0], shL[1], shL[0] - 0.5, shY + 4.5, -0.8, hipY - 1.4], 1.8, sleeve); limb(c, [shR[0], shR[1], shR[0] + 0.5, shY + 4.5, 0.8, hipY - 1.4], 1.8, sD);
        hand(-0.8, hipY - 1.4); hand(0.8, hipY - 1.4);
        if (!back) {
          for (let i = 0; i < 3; i++) { c.strokeStyle = '#3f8a35'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(-0.4 + i * 0.4, hipY - 0.8); c.lineTo(-0.6 + i * 0.6, hipY + 1.4); c.stroke(); }
          for (const [bx, by, col] of [[-1.1, -2.6, '#ff8fb8'], [0.9, -2.8, '#ffffff'], [0, -3.4, '#c2185b'], [-0.1, -2, '#ffffff'], [1.6, -2, '#ff8fb8'], [-1.8, -1.9, '#ffffff']]) { circ(c, bx, hipY + by, 0.85); fillInk(c, col, 0.25); }
        }
        break;
      case 'tray': {
        limb(c, [shL[0], shL[1], shL[0] - 0.6, hipY - 0.6], 1.8, sleeve); hand(shL[0] - 0.6, hipY - 0.6);
        limb(c, [shR[0], shR[1], shR[0] + 1.6, shY + 4.5, shR[0] + 3.2, shY + 2.6], 1.8, sD); hand(shR[0] + 3.2, shY + 2.6);
        const tx = shR[0] + 3.6, ty = shY + 1.7;
        ell(c, tx, ty, 3.6, 1.2); fillInk(c, lg(c, tx - 3.6, 0, tx + 3.6, 0, [[0, '#f4f4f8'], [1, '#9aa0ac']]), 0.4);
        if (p.carry === 'plate') { ell(c, tx, ty - 0.6, 2.4, 0.9); fillInk(c, '#ffffff', 0.3); ell(c, tx - 0.3, ty - 0.9, 1.1, 0.5); c.fillStyle = '#b8683a'; c.fill(); }
        else for (const gx of [-1.6, 0, 1.6]) { P(c, [tx + gx - 0.5, ty - 4, tx + gx + 0.5, ty - 4, tx + gx + 0.2, ty - 0.5, tx + gx - 0.2, ty - 0.5]); c.fillStyle = 'rgba(245,215,120,.95)'; c.fill(); ink(c, 0.2); }
        break;
      }
      default: {
        const swing = Q.moving ? sw * 0.6 : 0;
        limb(c, [shL[0], shL[1], shL[0] - 0.7 + swing, hipY - 0.4], 1.9, sleeve); hand(shL[0] - 0.7 + swing, hipY - 0.4);
        if (Q.mode === 'drink') {
          limb(c, [shR[0], shR[1], shR[0] + 1.2, shY + 4.6, shR[0] + 1.6, shY + 3], 1.9, sD); hand(shR[0] + 1.6, shY + 3);
          glass(c, shR[0] + 1.8, shY + 2.4, 'rgba(240,200,90,.95)');
        } else { limb(c, [shR[0], shR[1], shR[0] + 0.7 - swing, hipY - 0.4], 1.9, sD); hand(shR[0] + 0.7 - swing, hipY - 0.4); }
      }
    }
    if (L.mop) {
      c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(tw + 2, shY - 3); c.lineTo(tw + 2 + Q.mop, -0.6); c.stroke();
      c.strokeStyle = '#a0703a'; c.lineWidth = 0.6; c.stroke();
      ell(c, tw + 2 + Q.mop, -0.7, 2.4, 0.9); fillInk(c, '#e0e0e0', 0.4);
    }
  };
  if (back) armsFn();

  // torso
  const torsoBottom = L.dress ? hipY - 2.0 : hipY + 0.6;
  rr(c, -tw, shY - 0.6, tw * 2, torsoBottom - (shY - 0.6), 2.6);
  fillInk(c, hshade(c, -tw, tw, top), 0.6);
  if (!back) {
    if (L.groom) {
      P(c, [-1.4, shY - 0.6, 1.4, shY - 0.6, 0, shY + 3.4]); fillInk(c, '#ffffff', 0.35);
      rr(c, -2.1, shY + 0.6, 4.2, torsoBottom - shY - 1.4, 0.8); fillInk(c, hshade(c, -2, 2, '#dccaa0'), 0.4);
      P(c, [-1.3, shY - 0.6, 1.3, shY - 0.6, 0.5, shY + 1.6, -0.5, shY + 1.6]); fillInk(c, '#ffffff', 0.3);
      P(c, [-0.45, shY + 0.4, 0.45, shY + 0.4, 0.55, shY + 3.8, 0, shY + 4.6, -0.55, shY + 3.8]); fillInk(c, '#1f5a2a', 0.3);
      for (let i = 0; i < 3; i++) { circ(c, 0, shY + 4.8 + i * 1.3, 0.3); c.fillStyle = '#8a7a56'; c.fill(); }
      circ(c, -3, shY + 1.8, 0.85); fillInk(c, '#ff6fa0', 0.3); ell(c, -2.4, shY + 2.6, 0.5, 0.3); c.fillStyle = '#3f8a35'; c.fill();
      if (Q.stain) { ell(c, 0.6, shY + 4.5, 1.3, 1.6); c.fillStyle = 'rgba(122,16,32,.85)'; c.fill(); }
    } else if (L.waiter) {
      rr(c, -1.8, shY - 0.6, 3.6, torsoBottom - shY + 0.6, 0.6); fillInk(c, '#f6f6f6', 0.35);
      P(c, [-1.1, shY + 0.1, 0, shY + 0.6, 1.1, shY + 0.1, 1.1, shY + 1.3, 0, shY + 0.8, -1.1, shY + 1.3]); c.fillStyle = '#111'; c.fill();
      for (let i = 0; i < 3; i++) { circ(c, 0, shY + 3 + i * 1.5, 0.28); c.fillStyle = '#888'; c.fill(); }
    } else if (L.shirt) {
      P(c, [-1.4, shY - 0.6, 1.4, shY - 0.6, 0, shY + 4]); fillInk(c, L.shirt, 0.35);
      if (L.tie) { P(c, [-0.45, shY + 0.2, 0.45, shY + 0.2, 0.55, shY + 3.6, 0, shY + 4.6, -0.55, shY + 3.6]); fillInk(c, L.tie, 0.3); }
      c.strokeStyle = shade(top, -0.35); c.lineWidth = 0.4; c.beginPath(); c.moveTo(-1.4, shY - 0.4); c.lineTo(-0.3, shY + 5); c.moveTo(1.4, shY - 0.4); c.lineTo(0.3, shY + 5); c.stroke();
      if (L.rubashka) { c.strokeStyle = '#d03030'; c.lineWidth = 0.6; c.beginPath(); for (let i = 0; i < 6; i++) c.lineTo(-1.6 + i * 0.64, shY - 0.2 + (i % 2) * 0.6); c.stroke(); }
    } else if (L.dress) {
      c.beginPath(); c.arc(0, shY - 0.6, 1.9, 0, Math.PI); c.fillStyle = skin; c.fill();
      if (L.bride) { c.strokeStyle = 'rgba(170,170,200,.7)'; c.lineWidth = 0.35; c.beginPath(); c.moveTo(-tw + 0.6, shY + 2); c.quadraticCurveTo(0, shY + 3.2, tw - 0.6, shY + 2); c.stroke(); for (let i = 0; i < 4; i++) { circ(c, -1.5 + i, shY + 2.9, 0.3); c.fillStyle = '#ffffff'; c.fill(); } }
      if (L.collar) { rr(c, -1, shY - 0.6, 0.8, 2.4, 0.2); c.fillStyle = '#fff'; c.fill(); rr(c, 0.2, shY - 0.6, 0.8, 2.4, 0.2); c.fill(); }
    }
    if (L.bow && !L.waiter) { P(c, [-1.2, shY - 0.1, 0, shY + 0.5, 1.2, shY - 0.1, 1.2, shY + 1.1, 0, shY + 0.6, -1.2, shY + 1.1]); fillInk(c, L.bow, 0.25); }
    if (L.neon) { c.fillStyle = L.neon; c.fillRect(-tw + 0.8, shY + 2.4, tw * 2 - 1.6, 1.3); }
    if (L.sash) { c.beginPath(); c.moveTo(-tw + 0.4, shY + 0.2); c.lineTo(-tw + 2, shY + 0.2); c.lineTo(tw - 0.4, torsoBottom - 0.6); c.lineTo(tw - 2, torsoBottom - 0.4); c.closePath(); fillInk(c, '#ff5aa8', 0.3); }
    if (L.mop) { rr(c, -2.2, shY + 1.4, 4.4, torsoBottom - shY - 1.6, 0.6); c.fillStyle = shade(top, 0.15); c.fill(); limb(c, [-2, shY + 1.4, -2.6, shY - 0.4], 0.7, shade(top, 0.15)); limb(c, [2, shY + 1.4, 2.6, shY - 0.4], 0.7, shade(top, 0.15)); }
  }

  if (!back) armsFn();

  // neck + head
  rr(c, hx - 1.1, hy + hr - 1.4, 2.2, 2.4, 0.6); c.fillStyle = shade(skin, -0.12); c.fill();
  if (!back) { circ(c, hx - hr * 0.97, hy + 0.4, 0.85); fillInk(c, skin, 0.4); circ(c, hx + hr * 0.97, hy + 0.4, 0.85); fillInk(c, shade(skin, -0.1), 0.4); }
  circ(c, hx, hy, hr);
  const hg = c.createRadialGradient(hx - hr * 0.35, hy - hr * 0.4, hr * 0.15, hx, hy, hr);
  hg.addColorStop(0, shade(skin, 0.22)); hg.addColorStop(0.7, skin); hg.addColorStop(1, shade(skin, -0.18));
  fillInk(c, hg, 0.6);
  if (!back) {
    const f = Q.face;
    if (f === 'z' || f === 's') {
      c.strokeStyle = INK; c.lineWidth = 0.4;
      c.beginPath(); c.arc(hx - 1.3, hy - 0.4, 0.55, 0.1, Math.PI - 0.1); c.moveTo(hx + 1.8, hy - 0.4); c.arc(hx + 1.3, hy - 0.4, 0.55, 0.1, Math.PI - 0.1); c.stroke();
    } else {
      for (const ex of [-1.3, 1.3]) { ell(c, hx + ex, hy - 0.5, 0.52, 0.72); c.fillStyle = INK; c.fill(); circ(c, hx + ex - 0.15, hy - 0.75, 0.16); c.fillStyle = '#fff'; c.fill(); }
      if (f === 'a') { c.strokeStyle = INK; c.lineWidth = 0.4; c.beginPath(); c.moveTo(hx - 2, hy - 2); c.lineTo(hx - 0.7, hy - 1.4); c.moveTo(hx + 2, hy - 2); c.lineTo(hx + 0.7, hy - 1.4); c.stroke(); }
    }
    ell(c, hx + 0.25, hy + 0.7, 0.5, 0.42); c.fillStyle = shade(skin, -0.2); c.fill();
    c.strokeStyle = '#6a2a24'; c.lineWidth = 0.42;
    if (f === 'h' || f === 'k') { c.beginPath(); c.arc(hx + 0.1, hy + 1.1, 1.15, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
    else if (f === 'a') { c.beginPath(); c.arc(hx + 0.1, hy + 2.8, 1, 1.2 * Math.PI, 1.8 * Math.PI); c.stroke(); }
    else if (f === 's') { ell(c, hx + 0.3, hy + 2, 0.75, 0.6); c.fillStyle = '#3a5a20'; c.fill(); }
    else if (f === 'n') { c.beginPath(); c.moveTo(hx - 0.7, hy + 2); c.lineTo(hx + 0.9, hy + 2); c.stroke(); }
    if (Q.blush) { for (const bx of [-2.2, 2.2]) { ell(c, hx + bx, hy + 1.1, 0.8, 0.5); c.fillStyle = 'rgba(255,90,90,.45)'; c.fill(); } }
  }
  const hcD = shade(hc, -0.2);
  if (back) {
    if (L.style !== 'bald') {
      circ(c, hx, hy, hr + 0.25); fillInk(c, lg(c, hx - hr, hy - hr, hx + hr, hy + hr, [[0, shade(hc, 0.2)], [1, hcD]]), 0.55);
      if (L.style === 'long') { rr(c, hx - hr - 0.3, hy, hr * 2 + 0.6, 9, 2.2); fillInk(c, hc, 0.5); }
      if (L.style === 'bob') { rr(c, hx - hr - 0.3, hy, hr * 2 + 0.6, 4.5, 2); fillInk(c, hc, 0.5); }
      if (L.style === 'bun') { circ(c, hx, hy - hr - 0.6, 1.7); fillInk(c, hc, 0.45); }
      if (L.style === 'pony') { ell(c, hx, hy + hr + 1.5, 1.2, 2.6); fillInk(c, hc, 0.45); }
    } else { ell(c, hx - 1, hy - 1.5, 1.2, 0.8); c.fillStyle = 'rgba(255,255,255,.3)'; c.fill(); }
  } else {
    switch (L.style) {
      case 'short': case 'long': case 'bob': case 'pony': hairCap(c, hx, hy, hr, hc); break;
      case 'quiff': hairCap(c, hx, hy, hr, hc); ell(c, hx + 0.6, hy - hr - 0.3, 2.6, 1.6, -0.2); fillInk(c, lg(c, hx - 2, hy - hr - 2, hx + 3, hy - hr + 1, [[0, shade(hc, 0.35)], [1, hcD]]), 0.5); break;
      case 'bun': hairCap(c, hx, hy, hr, hc); circ(c, hx, hy - hr - 1.1, 1.8); fillInk(c, hc, 0.45); break;
      case 'spiky': hairCap(c, hx, hy, hr, hc); for (let i = 0; i < 5; i++) { const a = Math.PI * (1.1 + i * 0.2); P(c, [hx + Math.cos(a - 0.15) * hr, hy + Math.sin(a - 0.15) * hr, hx + Math.cos(a) * (hr + 1.8), hy + Math.sin(a) * (hr + 1.8), hx + Math.cos(a + 0.15) * hr, hy + Math.sin(a + 0.15) * hr]); fillInk(c, hc, 0.35); } break;
      case 'bald': ell(c, hx - 1.1, hy - 2.2, 1.2, 0.7); c.fillStyle = 'rgba(255,255,255,.4)'; c.fill(); break;
    }
    if (L.beard) {
      c.beginPath(); c.arc(hx, hy, hr + 0.15, 0.08 * Math.PI, 0.92 * Math.PI); c.arc(hx + 0.1, hy + 1.6, 1.4, 0.95 * Math.PI, 0.05 * Math.PI, true); c.closePath();
      fillInk(c, hc, 0.4);
    }
    if (L.glasses) { c.strokeStyle = INK; c.lineWidth = 0.35; c.beginPath(); c.arc(hx - 1.3, hy - 0.4, 0.95, 0, 6.3); c.moveTo(hx + 2.25, hy - 0.4); c.arc(hx + 1.3, hy - 0.4, 0.95, 0, 6.3); c.moveTo(hx - 0.35, hy - 0.5); c.lineTo(hx + 0.35, hy - 0.5); c.stroke(); }
    if (L.shades) { rr(c, hx - 2.6, hy - 1.3, 5.2, 1.6, 0.6); c.fillStyle = '#111'; c.fill(); }
  }
  if (L.hat) { ell(c, hx + hr * 0.55, hy - hr * 0.85, 1.8, 1, -0.4); fillInk(c, L.hat, 0.35); c.strokeStyle = shade(L.hat, -0.2); c.lineWidth = 0.5; c.beginPath(); c.moveTo(hx + hr * 0.6, hy - hr * 0.9); c.quadraticCurveTo(hx + hr + 1, hy - hr - 2, hx + hr + 2, hy - hr - 3.4); c.stroke(); circ(c, hx + hr * 0.4, hy - hr * 0.8, 0.5); c.fillStyle = '#fff'; c.fill(); }
  if (L.scarf) {
    if (back) { circ(c, hx, hy, hr + 0.5); fillInk(c, L.scarf, 0.5); P(c, [hx - hr, hy + 1, hx + hr, hy + 1, hx, hy + hr + 3.5]); fillInk(c, L.scarf, 0.45); }
    else {
      c.beginPath(); c.arc(hx, hy, hr + 0.5, Math.PI * 0.85, Math.PI * 2.15);
      c.lineTo(hx + hr * 0.75, hy + hr + 0.4); c.lineTo(hx + hr * 0.2, hy + hr + 0.4); c.lineTo(hx + hr * 0.62, hy - 0.5);
      c.quadraticCurveTo(hx, hy - hr * 0.75, hx - hr * 0.62, hy - 0.5); c.lineTo(hx - hr * 0.2, hy + hr + 0.4); c.lineTo(hx - hr * 0.75, hy + hr + 0.4); c.closePath();
      fillInk(c, lg(c, hx - hr, 0, hx + hr, 0, [[0, shade(L.scarf, 0.2)], [1, shade(L.scarf, -0.2)]]), 0.5);
      P(c, [hx - 0.9, hy + hr + 0.2, hx + 0.9, hy + hr + 0.2, hx + 0.3, hy + hr + 2, hx - 0.3, hy + hr + 2]); fillInk(c, L.scarf, 0.35);
    }
    for (let i = 0; i < 6; i++) { const a = Math.PI * (1.05 + i * 0.17); circ(c, hx + Math.cos(a) * (hr - 0.2), hy + Math.sin(a) * (hr - 0.2), 0.42); c.fillStyle = i % 2 ? '#ffd84a' : '#ffffff'; c.fill(); }
  }
  if (L.cap) { c.beginPath(); c.arc(hx, hy - 0.3, hr + 0.3, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); fillInk(c, L.cap, 0.45); ell(c, hx - hr * 0.8, hy - hr * 0.5, 1.6, 0.6, 0.3); fillInk(c, shade(L.cap, -0.2), 0.3); }
  if (L.phones) { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.arc(hx, hy, hr + 0.8, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); for (const s of [-1, 1]) { ell(c, hx + s * (hr + 0.4), hy + 0.2, 1, 1.4); fillInk(c, '#222', 0.3); } }
  if (L.bride) {
    c.beginPath(); c.moveTo(hx - 2, hy - hr + 0.4); c.lineTo(hx - 1.2, hy - hr - 1); c.lineTo(hx - 0.4, hy - hr + 0.1); c.lineTo(hx, hy - hr - 1.6); c.lineTo(hx + 0.4, hy - hr + 0.1); c.lineTo(hx + 1.2, hy - hr - 1); c.lineTo(hx + 2, hy - hr + 0.4);
    c.strokeStyle = '#e8c040'; c.lineWidth = 0.55; c.stroke(); circ(c, hx, hy - hr - 1.6, 0.45); c.fillStyle = '#ff6fa0'; c.fill();
    if (back) veil();
  }
  if (Q.hb !== 9) heart(c, hx, hy - hr - 5.5 + Q.hb, 1.9, '#ff3a7a');
  if (kid) c.restore();
  const k = kid ? 0.72 : 1;
  return { top: (hy - hr - 2.5) * k, mouth: { x: (hx + 0.2) * k, y: (hy + 1.9) * k } };
}

// ---------- animals ----------
function drawAnimal(c, a, t) {
  const s = iso(a.x, a.y); const sx = s.x, sy = s.y;
  ell(c, sx, sy, a.role === 'rat' ? 3.5 : 6, a.role === 'rat' ? 1.2 : 2); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill();
  const st = a.moving ? Math.sin(t * (a.role === 'rat' ? 30 : 14)) : 0;
  const AS = a.role === 'rat' ? 1 : (typeof PERSON_SCALE !== 'undefined' ? PERSON_SCALE : 1);
  c.save(); c.translate(sx, sy); if (a.flip) c.scale(-1, 1); c.scale(AS, AS);
  if (a.role === 'dog') {
    const wag = Math.sin(t * 16) * 2.2;
    c.strokeStyle = INK; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-5.8, -8.6); c.quadraticCurveTo(-8.5, -10 + wag * 0.3, -10 + wag * 0.3, -12.5 + wag); c.stroke();
    c.strokeStyle = '#d89a44'; c.lineWidth = 1.7; c.stroke();
    for (const [lx, ph] of [[-4.2, 1], [-2, -1], [2.4, 1], [4.4, -1]]) limb(c, [lx, -5.5, lx + st * ph * 0.9, -0.4], 1.25, '#c8883a');
    ell(c, 0, -7.6, 6.6, 3.3); fillInk(c, lg(c, 0, -11, 0, -4, [[0, '#f0c070'], [1, '#c8883a']]), 0.55);
    ell(c, 4.6, -7.2, 2.2, 2.6); c.fillStyle = '#f6d690'; c.fill();
    ell(c, 6.2, -11.2, 2.8, 2.4); fillInk(c, '#e8b460', 0.5);
    ell(c, 8.8, -10.4, 1.9, 1.2); fillInk(c, '#f6d690', 0.35);
    circ(c, 10.4, -10.7, 0.6); c.fillStyle = INK; c.fill();
    circ(c, 7, -12.1, 0.45); c.fillStyle = INK; c.fill();
    ell(c, 5, -10.6, 1.2, 2.3, 0.25); fillInk(c, '#b87828', 0.35);
    ell(c, 4.4, -9, 1.6, 0.6, 0.4); c.fillStyle = '#c0283c'; c.fill();
    if (!a.moving || Math.floor(t * 2) % 2) { ell(c, 9.4, -9.1, 0.55, 0.9); c.fillStyle = '#ff7a9a'; c.fill(); }
    c.restore();
    a._top = sy - 17 * AS; return;
  }
  if (a.role === 'goat') {
    for (const [lx, ph] of [[-4, 1], [-1.5, -1], [1.5, 1], [4, -1]]) limb(c, [lx, -5, lx + st * ph * 0.8, -0.5], 1.1, '#c8c0b0');
    ell(c, 0, -7.5, 6.5, 3.6); fillInk(c, lg(c, 0, -11, 0, -4, [[0, '#ffffff'], [1, '#d8d0c0']]), 0.55);
    ell(c, 6.3, -11, 2.6, 2.1, 0.3); fillInk(c, '#f4f0e6', 0.5);
    c.strokeStyle = '#6a5a3a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(5.5, -13); c.quadraticCurveTo(4, -16, 2.6, -15.4); c.moveTo(6.8, -13); c.quadraticCurveTo(6.2, -16.6, 4.6, -16.4); c.stroke();
    ell(c, 4.6, -12, 1.4, 0.6, 0.6); fillInk(c, '#e8e0d0', 0.35);
    circ(c, 7, -11.6, 0.4); c.fillStyle = INK; c.fill();
    P(c, [7.4, -9.6, 8.2, -9.6, 7.8, -7.6]); fillInk(c, '#d8d0c0', 0.3);
    ell(c, -6.3, -9, 1.2, 0.8); fillInk(c, '#f4f0e6', 0.35);
    if (a.friendly) { circ(c, 3.6, -9.5, 1); fillInk(c, '#ff6fa0', 0.3); }
    if (a.munch && Math.floor(t * 4) % 2) { ell(c, 8.8, -9.8, 1.4, 0.6); c.fillStyle = '#3f9a3a'; c.fill(); }
    c.restore();
    if (a.cakeRun && Math.floor(t * 3) % 2) drawIcon(c, 'bang', sx - 3.5, sy - 26 * AS, 1);
    a._top = sy - 18 * AS; return;
  } else if (a.role === 'cat') {
    for (const lx of [-2.5, 2]) limb(c, [lx, -3, lx + st * 0.6, -0.3], 0.9, '#d07a24');
    ell(c, 0, -4, 4, 2.2); fillInk(c, '#e88a30', 0.5);
    circ(c, 4, -6.2, 2); fillInk(c, '#e88a30', 0.5);
    P(c, [2.6, -7.5, 3, -9.6, 4, -8]); fillInk(c, '#e88a30', 0.3); P(c, [4.4, -8, 5.4, -9.6, 5.6, -7.4]); fillInk(c, '#e88a30', 0.3);
    circ(c, 4.6, -6.4, 0.35); c.fillStyle = INK; c.fill();
    c.strokeStyle = INK; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-3.6, -4.5); c.quadraticCurveTo(-6.5, -6 + Math.sin(t * 4), -5.5, -9); c.stroke();
    c.strokeStyle = '#e88a30'; c.lineWidth = 0.8; c.stroke();
  } else if (a.role === 'rat') {
    c.strokeStyle = '#e8a0a8'; c.lineWidth = 0.55; c.beginPath(); c.moveTo(-3, -1.6); c.quadraticCurveTo(-6, -1 + st * 1.5, -8, -2.5 - st); c.stroke();
    for (const lx of [-1.6, 1.4]) limb(c, [lx, -1.4, lx + st * 0.8, -0.2], 0.6, '#7a7a80');
    ell(c, 0, -2.2, 3.4, 1.8); fillInk(c, lg(c, 0, -4, 0, -0.5, [[0, '#9a9aa4'], [1, '#5a5a64']]), 0.5);
    P(c, [2.4, -3.4, 5.4, -2, 2.4, -0.9]); fillInk(c, '#8a8a94', 0.45);
    circ(c, 2.4, -3.8, 0.9); fillInk(c, '#e8a0a8', 0.35);
    circ(c, 3.7, -2.5, 0.3); c.fillStyle = INK; c.fill(); circ(c, 5.4, -2, 0.35); c.fillStyle = '#ff8fa0'; c.fill();
    c.restore();
    if (Math.floor(t * 3) % 2) drawIcon(c, 'bang', sx - 3.5, sy - 16, 1);
    a._top = sy - 10; return;
  }
  c.restore();
  a._top = sy - 18 * AS;
}

// ---------- messes ----------
function blob(c, x, y, rx, ry, seed, col) {
  c.beginPath();
  for (let i = 0; i <= 12; i++) {
    const a = i / 12 * Math.PI * 2, k = 0.75 + hash2(seed, i % 12) * 0.45;
    const px = x + Math.cos(a) * rx * k, py = y + Math.sin(a) * ry * k;
    if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.closePath(); c.fillStyle = col; c.fill();
}
function drawMess(c, m) {
  const s = iso(m.x, m.y); const x = s.x, y = s.y;
  switch (m.type) {
    case 'vomit':
      blob(c, x, y, 6.5, 3, m.id, '#5a7a22'); blob(c, x, y - 0.2, 5.6, 2.5, m.id + 1, '#9cc040');
      for (let i = 0; i < 6; i++) { circ(c, x - 4 + hash2(i, m.id) * 8, y - 1.5 + hash2(m.id, i) * 3, 0.5); c.fillStyle = i % 2 ? '#e0c050' : '#c8e070'; c.fill(); }
      break;
    case 'spill': blob(c, x, y, 6, 2.8, m.id, 'rgba(120,180,255,.7)'); ell(c, x - 1.5, y - 0.6, 1.6, 0.5); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); break;
    case 'puddle': blob(c, x, y, 6, 2.8, m.id, 'rgba(240,215,80,.7)'); break;
    case 'litter':
      P(c, [x - 2.6, y - 3.5, x - 0.6, y - 3.5, x - 0.9, y, x - 2.3, y]); c.fillStyle = 'rgba(220,240,255,.9)'; c.fill(); ink(c, 0.3);
      P(c, [x + 1.2, y - 0.6, x + 4, y - 1, x + 3.6, y + 1, x + 1.4, y + 1]); fillInk(c, '#ffffff', 0.3);
      circ(c, x - 4, y + 1, 0.7); c.fillStyle = '#ff8fb8'; c.fill();
      break;
    case 'choc': blob(c, x, y, 4.5, 2, m.id, '#5a3018'); ell(c, x - 1, y - 0.5, 1, 0.4); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); break;
    case 'cake': blob(c, x, y, 6, 2.8, m.id, '#fffaf0'); circ(c, x - 2, y - 0.5, 0.8); c.fillStyle = '#c2185b'; c.fill(); circ(c, x + 2, y + 0.4, 0.7); c.fill(); break;
    case 'mud': blob(c, x, y, 6, 2.8, m.id, '#6a4a2a'); break;
    case 'poop':
      blob(c, x, y, 3.6, 1.7, m.id, '#5a3416'); ell(c, x, y - 1.5, 2.6, 1.3); fillInk(c, '#6a4020', 0.3); ell(c, x + 0.2, y - 2.8, 1.6, 0.9); fillInk(c, '#7a4a26', 0.3); circ(c, x + 0.4, y - 3.8, 0.7); fillInk(c, '#7a4a26', 0.25);
      c.strokeStyle = 'rgba(140,170,60,.8)'; c.lineWidth = 0.4; for (const ox of [-2, 1.5]) { c.beginPath(); c.moveTo(x + ox, y - 5); c.quadraticCurveTo(x + ox + 1, y - 7, x + ox, y - 8.5); c.stroke(); }
      break;
    case 'petals': for (let i = 0; i < 8; i++) { ell(c, x - 6 + hash2(i, m.id) * 12, y - 2 + hash2(m.id, i) * 4, 0.9, 0.5, i); c.fillStyle = i % 2 ? '#ff8fb8' : '#ffffff'; c.fill(); } break;
    case 'crumbs': for (let i = 0; i < 10; i++) { circ(c, x - 5 + hash2(i, m.id) * 10, y - 2 + hash2(m.id, i) * 4, 0.5); c.fillStyle = '#e8d8b0'; c.fill(); } break;
  }
}

function drawShout(c, x, y, text, t) {
  c.save();
  c.font = 'bold 6px "Press Start 2P", "Courier New", monospace';
  const w = c.measureText(text).width + 8, h = 11, pulse = 1 + Math.abs(Math.sin(t * 5)) * 0.06;
  c.translate(x, y - h); c.scale(pulse, pulse); c.rotate(Math.sin(t * 3) * 0.03);
  P(c, [-3, h / 2 - 1, 3, h / 2 - 1, 0, h / 2 + 5]); c.fillStyle = '#c0283c'; c.fill();
  rr(c, -w / 2 - 1.2, -h / 2 - 1.2, w + 2.4, h + 2.4, 3); c.fillStyle = '#c0283c'; c.fill();
  rr(c, -w / 2, -h / 2, w, h, 2.4); c.fillStyle = '#fff36a'; c.fill();
  c.fillStyle = '#1a0a0a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, 0.5);
  c.restore();
}

// ---------- particles ----------
const CONF = ['#ff6fa0', '#ffd84a', '#7ad0ff', '#ffffff', '#b08aff', '#7aff9a'];
function drawParticles(c) {
  for (const q of G.parts) {
    const a = clamp(q.life / q.max, 0, 1);
    c.globalAlpha = q.type === 'rain' ? 0.6 : Math.min(1, a * 1.5);
    const x = q.x, y = q.y;
    switch (q.type) {
      case 'conf': c.fillStyle = q.col; c.fillRect(x, y, 1.6, 0.8 + (Math.floor(q.life * 10) % 2) * 0.6); break;
      case 'heart': heart(c, x, y, 1.6, q.col || '#ff3a7a'); break;
      case 'spark': circ(c, x, y, 0.6); c.fillStyle = q.col; c.fill(); break;
      case 'rocket': c.fillStyle = '#ffe0a0'; c.fillRect(x - 0.4, y, 0.8, 3); break;
      case 'rain': c.strokeStyle = '#bcd8ff'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 1, y + 4); c.stroke(); break;
      case 'note': drawIcon(c, 'note', x, y, 1); break;
      case 'star': star(c, x, y, 1.3, '#ffe680'); break;
      case 'flash': c.globalAlpha = a * 0.8; circ(c, x, y, 10); c.fillStyle = '#ffffff'; c.fill(); break;
      case 'dust': circ(c, x, y, 2.4); c.fillStyle = '#e8e0d0'; c.fill(); break;
      case 'puke': circ(c, x, y, 0.9); c.fillStyle = q.col; c.fill(); break;
      case 'poof': circ(c, x, y, 2 + (1 - a) * 5); c.fillStyle = 'rgba(240,240,240,.85)'; c.fill(); break;
      case 'lightning': c.globalAlpha = a * 0.6; c.fillStyle = '#ffffff'; c.fillRect(0, 0, WORLD_W, WORLD_H); break;
      case 'text':
        c.font = 'bold 7px sans-serif'; c.textAlign = 'center'; c.lineWidth = 2; c.strokeStyle = '#000'; c.strokeText(q.text, x, y); c.fillStyle = q.col; c.fillText(q.text, x, y); break;
    }
  }
  c.globalAlpha = 1;
}

// ---------- night ----------
function nightAlpha() {
  if (!G) return 0;
  const t = G.time;
  return t > 1170 ? Math.min(0.62, (t - 1170) / 90 * 0.62) : 0;
}
function glowHole(x, y, r, s) {
  const g = mctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, 'rgba(0,0,0,' + s + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
  mctx.fillStyle = g; mctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function drawNight(c, t) {
  let a = nightAlpha();
  const power = G.powerOut > 0;
  if (power) a = Math.max(a, 0.45);
  if (G.raining && G.storm) a = Math.max(a, 0.28);
  if (a < 0.01) {
    if (G.time > 1080 && G.time <= 1170) { c.fillStyle = 'rgba(255,140,60,' + ((G.time - 1080) / 90 * 0.12) + ')'; c.fillRect(0, 0, WORLD_W, WORLD_H); }
    return;
  }
  mctx.setTransform(1, 0, 0, 1, 0, 0);
  mctx.globalCompositeOperation = 'source-over';
  mctx.clearRect(0, 0, maskC.width, maskC.height);
  mctx.fillStyle = 'rgba(14,10,46,' + a + ')'; mctx.fillRect(0, 0, maskC.width, maskC.height);
  mctx.setTransform(1 / MASK_S, 0, 0, 1 / MASK_S, 0, 0);
  mctx.globalCompositeOperation = 'destination-out';
  if (!power) for (const [x, y] of [[17, 4], [23, 4], [17, 10], [24, 10], [19, 16], [26, 15], [16, 20], [26, 20]]) { const p = iso(x, y); glowHole(p.x, p.y, 120, 0.85); }
  else for (let i = 0; i < 6; i++) { const p = iso(rnd(15, 27), rnd(2, 20)); glowHole(p.x, p.y - 10, 18, 0.7); }
  for (const o of G.objects) {
    if (o.type === 'lights') { const p = iso(o.x + 0.5, o.y + 0.5); glowHole(p.x, p.y - 18, 70, 0.9); }
    if (o.type === 'lamp') { const p = iso(o.x + 0.5, o.y + 0.5); glowHole(p.x, p.y - 22, 60, 0.85); }
    if (o.type === 'bar' && !power) { const p = iso(o.x + 1, o.y + 0.5); glowHole(p.x, p.y - 10, 40, 0.6); }
  }
  for (const q of G.parts) if (q.type === 'spark' || q.type === 'rocket' || q.type === 'star') glowHole(q.x, q.y, 14, 0.5);
  mctx.globalCompositeOperation = 'source-over';
  c.drawImage(maskC, 0, 0, maskC.width * MASK_S, maskC.height * MASK_S);
  if (G.djOn) {
    c.globalCompositeOperation = 'lighter';
    const p = iso(19.5, 17), hue = (t * 60) % 360;
    const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 110);
    g.addColorStop(0, 'hsla(' + hue + ',90%,60%,' + (0.25 * a / 0.62) + ')'); g.addColorStop(1, 'hsla(' + hue + ',90%,60%,0)');
    c.fillStyle = g; c.fillRect(p.x - 110, p.y - 110, 220, 220);
    c.globalCompositeOperation = 'source-over';
  }
}

// ---------- dance floor ----------
const DCOL = ['#ff3a8a', '#3affc0', '#3a8aff', '#ffd83a', '#b03aff', '#ff7a3a'];
function drawDanceFloor(c, t) {
  if (!G.djOn) return;
  const beat = Math.floor(t * 2.2);
  c.globalAlpha = 0.62;
  for (let y = DANCE.y0; y <= DANCE.y1; y++) for (let x = DANCE.x0; x <= DANCE.x1; x++) {
    if ((x * 7 + y * 3 + beat) % 3 === 0) continue;
    dpath(c, x, y); c.fillStyle = DCOL[(x + y + beat) % DCOL.length]; c.fill();
  }
  c.globalAlpha = 1;
}

// ---------- full world render ----------
function renderWorld(t) {
  const nightNow = nightAlpha() > 0.25;
  if (nightNow !== !!G.floorNight) { G.floorNight = nightNow; drawFloor(); }
  if (staticDirty) buildStatic();
  const c = wctx;
  c.setTransform(RS, 0, 0, RS, 0, 0);
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, WORLD_W, WORLD_H);
  c.drawImage(floorC, 0, 0, WORLD_W, WORLD_H);
  drawDanceFloor(c, t);
  for (const m of G.messes) drawMess(c, m);

  if (G.sel && G.sel.present) {
    dpath(c, Math.floor(G.sel.x), Math.floor(G.sel.y)); c.fillStyle = 'rgba(255,224,64,.45)'; c.fill();
  } else if (G.sel && G.sel.type) {
    dpath(c, G.sel.x, G.sel.y, G.sel.w, G.sel.h); c.fillStyle = 'rgba(255,224,64,.4)'; c.fill();
  }
  const gh = G.build ? ghostInfo() : null;
  if (gh) { dpath(c, gh.x, gh.y, gh.w, gh.h); c.fillStyle = gh.ok ? 'rgba(64,255,96,.45)' : 'rgba(255,48,48,.45)'; c.fill(); }

  const list = staticList.slice();
  for (const p of G.people) if (p.present && !p.hidden) list.push({ d: p.x + p.y + 0.01, k: 1, p });
  list.sort((a, b) => a.d - b.d || a.k - b.k);
  for (const it of list) { if (it.p) drawPersonFull(c, it.p, t); else it.f(c, t); }

  if (gh) {
    c.globalAlpha = 0.7;
    const o = { type: G.build, x: gh.x, y: gh.y, w: gh.w, h: gh.h, slots: [], ghost: true, id: 0 };
    for (let dy = 0; dy < gh.h; dy++) for (let dx = 0; dx < gh.w; dx++) drawPiece(c, o, gh.x + dx, gh.y + dy, dx, dy, t);
    c.globalAlpha = 1;
  }

  for (const p of G.people) {
    if (!p.present || p.hidden || p._top === undefined) continue;
    const s = iso(p.x, p.y);
    if (p.thoughtT > 0 && p.thought) drawBubble(c, s.x, p._top, p.thought);
    else if (p.state === 'chat' && Math.floor(t * 1.5 + p.id) % 4 === 0) { rr(c, s.x - 4, p._top - 6, 8, 4.5, 2); fillInk(c, '#fff', 0.4); for (let i = -1; i <= 1; i++) { circ(c, s.x + i * 2, p._top - 3.8, 0.5); c.fillStyle = '#555'; c.fill(); } }
    if (p === G.sel) {
      const y = p._top - 14 + Math.sin(t * 6) * 1.5;
      P(c, [s.x - 3.5, y, s.x + 3.5, y, s.x, y + 4.5]); fillInk(c, '#ffe040', 0.5);
    }
  }
  // shouted catchphrases: drawn last so they sit on top of everything
  for (const p of G.people) if (p.present && p.shout && G.time < p.shoutUntil && p._top !== undefined) { const s = iso(p.x, p.y); drawShout(c, s.x, p._top - 4, p.shout, t); }
  for (const f of G.fights) {
    const s = iso(f.x, f.y);
    for (let i = 0; i < 6; i++) { const a = t * 6 + i * 1.05; circ(c, s.x + Math.cos(a) * 7, s.y - 10 + Math.sin(a) * 4, 3.2); fillInk(c, '#f0ece4', 0.4); }
    for (let i = 0; i < 3; i++) star(c, s.x - 6 + i * 6, s.y - 22 + Math.sin(t * 9 + i) * 1.5, 1.4, '#ffe040');
  }
  drawParticles(c);
  drawNight(c, t);

  if (G.hand && G.mouseW) {
    const u = unIso(G.mouseW.x, G.mouseW.y + 4);
    G.hand.x = u.x; G.hand.y = u.y;
    drawPersonFull(c, G.hand, t);
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- previews for menus ----------
function drawObjPreview(c, type, cx, cy) {
  const d = OT[type];
  const o = { type, x: 0, y: 0, w: d.w, h: d.h, slots: [], fake: true, id: 1 };
  const ctr = iso(d.w / 2, d.h / 2);
  c.save(); c.translate(cx - ctr.x, cy - ctr.y);
  dpath(c, 0, 0, d.w, d.h); c.fillStyle = '#5cb048'; c.fill();
  const pieces = [];
  for (let dy = 0; dy < d.h; dy++) for (let dx = 0; dx < d.w; dx++) pieces.push([dx, dy]);
  pieces.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
  for (const [dx, dy] of pieces) drawPiece(c, o, dx, dy, dx, dy, 0);
  c.restore();
}
function drawPersonPreview(c, look, cx, cy, role) {
  const p = { id: 1, kind: 'staff', role, look, x: 0, y: 0, state: 'idle', present: true, happy: 80, drunk: 0, carry: role === 'waiter' ? 'tray' : null };
  const o = iso(0, 0);
  c.save(); c.translate(cx - o.x, cy - o.y); drawPersonDirect(c, p, 0); c.restore();
}
