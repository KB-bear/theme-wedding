'use strict';
/* =========================================================
   THEME WEDDING — core: helpers, world geometry, map, paths
   ========================================================= */

// ---------- helpers ----------
function rnd(a, b) { return a + Math.random() * (b - a); }
function ri(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function chance(p) { return Math.random() < p; }
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function weighted(opts) { // [[value, weight], ...]
  let tot = 0; for (const o of opts) tot += Math.max(0, o[1]);
  if (tot <= 0) return null;
  let r = Math.random() * tot;
  for (const o of opts) { r -= Math.max(0, o[1]); if (r <= 0) return o[0]; }
  return opts[opts.length - 1][0];
}
function fmtTime(m) {
  m = Math.floor(m); const h = Math.floor(m / 60) % 24, mm = m % 60;
  return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}
function fmtMoney(n) { return (n < 0 ? '-£' : '£') + Math.abs(Math.round(n)).toLocaleString('en-GB'); }
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
};

// Real seconds per game minute at 1x speed
const SEC_PER_MIN = 0.55;

// ---------- world geometry (isometric) ----------
const MW = 30, MH = 24;
const OX = MH * 16 + 24, OY = 84;
const WORLD_W = (MW + MH) * 16 + 48;
const WORLD_H = (MW + MH) * 8 + OY + 40;
function iso(px, py) { return { x: (px - py) * 16 + OX, y: (px + py) * 8 + OY }; }
function unIso(wx, wy) { const dx = (wx - OX) / 16, dy = (wy - OY) / 8; return { x: (dy + dx) / 2, y: (dy - dx) / 2 }; }

// ---------- map ----------
const T = { VOID: 0, GRASS: 1, PATH: 2, WOOD: 3, HEDGE: 4, WALL: 5, DANCE: 6, TILE: 7, CARPET: 8, DOOR: 9, RUG: 10 };
const DANCE = { x0: 16, x1: 22, y0: 14, y1: 19 };
const GATE = { x: 6, y: MH - 1 };
let map = [], occ = [], blocked = [], tvar = [];

function buildMap() {
  map = []; occ = []; blocked = []; tvar = [];
  for (let y = 0; y < MH; y++) {
    map.push(new Array(MW).fill(T.VOID));
    occ.push(new Array(MW).fill(null));
    blocked.push(new Array(MW).fill(false));
    tvar.push(Array.from({ length: MW }, () => Math.random()));
  }
  // garden
  for (let y = 0; y < MH; y++) for (let x = 0; x <= 12; x++)
    map[y][x] = (x === 0 || y === 0 || y === MH - 1) ? T.HEDGE : T.GRASS;
  // hall
  for (let y = 0; y < MH; y++) for (let x = 13; x < MW; x++)
    map[y][x] = (x === 13 || x === MW - 1 || y === 0 || y === MH - 1) ? T.WALL : T.WOOD;
  // banqueting carpet in the dining half of the hall
  for (let y = 1; y <= 11; y++) for (let x = 14; x <= 28; x++) map[y][x] = T.RUG;
  // gate + main path
  map[MH - 1][6] = T.PATH; map[MH - 1][7] = T.PATH;
  for (let y = 11; y < MH - 1; y++) { map[y][6] = T.PATH; map[y][7] = T.PATH; }
  for (let x = 8; x <= 12; x++) { map[11][x] = T.PATH; map[16][x] = T.PATH; }
  for (let y = 6; y <= 11; y++) map[y][12] = T.PATH;
  // aisle
  for (let y = 2; y <= 10; y++) map[y][6] = T.CARPET;
  // hall doors
  map[6][13] = T.DOOR; map[16][13] = T.DOOR;
  // dance floor
  for (let y = DANCE.y0; y <= DANCE.y1; y++) for (let x = DANCE.x0; x <= DANCE.x1; x++) map[y][x] = T.DANCE;
  // toilets
  for (let y = 17; y <= 22; y++) map[y][24] = T.WALL;
  for (let x = 24; x <= 28; x++) map[17][x] = T.WALL;
  map[17][26] = T.DOOR;
  for (let y = 18; y <= 22; y++) for (let x = 25; x <= 28; x++) map[y][x] = T.TILE;
}

function isFloorT(t) {
  return t === T.GRASS || t === T.PATH || t === T.WOOD || t === T.DANCE || t === T.TILE || t === T.CARPET || t === T.DOOR || t === T.RUG;
}
function inBounds(x, y) { return x >= 0 && y >= 0 && x < MW && y < MH; }
function walk(x, y) { return inBounds(x, y) && isFloorT(map[y][x]) && !blocked[y][x]; }
function isOutdoor(x, y) { return x < 13; }
function inDance(x, y) { return x >= DANCE.x0 && x <= DANCE.x1 && y >= DANCE.y0 && y <= DANCE.y1; }

function wallH(x, y) {
  const t = map[y][x];
  if (t === T.HEDGE) return y === MH - 1 ? 7 : 16;
  if (t === T.WALL) {
    if (y === 0) return 30;
    if (x === MW - 1 || y === MH - 1) return 6;
    if (x === 13) return 10;
    return 12;
  }
  return 0;
}

// ---------- pathfinding (BFS, 8-way, no corner cutting) ----------
const _prev = new Int32Array(MW * MH);
const _q = new Int32Array(MW * MH);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
function findPath(sx, sy, tx, ty) {
  if (!inBounds(tx, ty) || !isFloorT(map[ty][tx])) return null;
  sx = clamp(sx, 0, MW - 1); sy = clamp(sy, 0, MH - 1);
  if (sx === tx && sy === ty) return [[tx, ty]];
  _prev.fill(-2);
  let h = 0, t = 0;
  const s = sy * MW + sx, g = ty * MW + tx;
  _q[t++] = s; _prev[s] = -1;
  while (h < t) {
    const c = _q[h++];
    if (c === g) break;
    const cx = c % MW, cy = (c / MW) | 0;
    for (let d = 0; d < 8; d++) {
      const dx = DIRS[d][0], dy = DIRS[d][1];
      const nx = cx + dx, ny = cy + dy;
      if (!inBounds(nx, ny)) continue;
      const ni = ny * MW + nx;
      if (_prev[ni] !== -2) continue;
      if (ni !== g && !walk(nx, ny)) continue;
      if (dx && dy && (!walk(cx + dx, cy) || !walk(cx, cy + dy))) continue;
      _prev[ni] = c; _q[t++] = ni;
    }
  }
  if (_prev[g] === -2) return null;
  const path = [];
  let c = g;
  while (c !== s) { path.push([c % MW, (c / MW) | 0]); c = _prev[c]; }
  path.reverse();
  return path;
}

// ---------- zones ----------
const ZONES = {
  lawn: [[1, 11, 12, 22]],
  garden: [[1, 1, 12, 22]],
  hall: [[14, 1, 28, 16], [14, 17, 23, 22]],
  dance: [[16, 14, 22, 19]],
  watch: [[15, 13, 23, 20]],
  photo: [[2, 13, 11, 17]],
  lineup: [[5, 12, 5, 21], [8, 12, 8, 21]],
  outside: [[1, 11, 12, 22]],
};
function zoneTile(name, filter) {
  const rects = ZONES[name];
  for (let i = 0; i < 50; i++) {
    const r = pick(rects);
    const x = ri(r[0], r[2]), y = ri(r[1], r[3]);
    if (!walk(x, y) || occ[y][x]) continue;
    if (name !== 'dance' && G && G.slotSet.has(x + ',' + y)) continue;
    if (filter && !filter(x, y)) continue;
    return { x, y };
  }
  return null;
}
