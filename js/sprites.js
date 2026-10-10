'use strict';
/* =========================================================
   THEME WEDDING — open-source pixel art layer
   Swaps the procedural art for sprite assets (see assets/CREDITS.md):
     - hawkbirdtree isometric tiles/furniture (CC0)
     - Kenney Furniture Kit, pixelised (CC0)
     - Universal LPC characters (CC-BY-SA / OGA-BY / GPL, credited)
   Anything without an asset is still drawn procedurally, but rendered at
   1 pixel per world unit and scaled up so it matches the pixel-art look.
   If an image fails to load we fall back to the procedural renderer.
   ========================================================= */
const ASSET = { imgs: {}, total: 0, done: 0, onReady: [] };
function loadImg(key, src) {
  if (ASSET.imgs[key]) return ASSET.imgs[key];
  const im = new Image();
  ASSET.total++;
  im.onload = () => { ASSET.done++; assetsMaybeReady(); };
  im.onerror = () => { im._bad = true; ASSET.done++; assetsMaybeReady(); };
  im.src = src;
  ASSET.imgs[key] = im;
  return im;
}
function imgOk(im) { return !!(im && !im._bad && im.complete && im.naturalWidth > 0); }
function assetsReady() { return ASSET.total > 0 && ASSET.done >= ASSET.total; }
function assetsMaybeReady() {
  if (!assetsReady()) return;
  const cbs = ASSET.onReady; ASSET.onReady = [];
  for (const f of cbs) { try { f(); } catch (e) { /* ignore */ } }
}
function whenAssetsReady(f) { if (assetsReady()) f(); else ASSET.onReady.push(f); }

// ---------- sprite sheets & rects ----------
const SHEET_FURN = 'assets/vendor/hawkbirdtree-iso-furniture-walls/furnitureandwalls.png';
const SHEET_TILES = 'assets/vendor/hawkbirdtree-iso-tileset-32x32/big_isometric_tileset64x32.png';
const KEN = 'assets/derived/kenney-furniture-pixelized/';
// name: [sheet, x, y, w, h, anchorX, anchorY]   (sheet: 'F' furniture, 'T' tileset, or a file path)
const SR = {
  // floors (64x32 diamonds)
  wood_light: ['F', 192, 640, 64, 32, 32, 16], wood_dark: ['F', 192, 672, 64, 32, 32, 16],
  tiles_cream: ['F', 192, 704, 64, 32, 32, 16], tiles_mint: ['F', 192, 736, 64, 32, 32, 16], tiles_lilac: ['F', 192, 768, 64, 32, 32, 16],
  grass_lime: ['F', 256, 640, 64, 32, 32, 16], grass_green: ['F', 256, 672, 64, 32, 32, 16],
  // ground blocks (64x64 cubes: top face + earth sides)
  blk_grass_a: ['T', 0, 128, 64, 64, 32, 16], blk_grass_b: ['T', 64, 128, 64, 64, 32, 16], blk_grass_c: ['T', 128, 128, 64, 64, 32, 16],
  blk_grass_d: ['T', 192, 128, 64, 64, 32, 16], blk_grass_e: ['T', 0, 192, 64, 64, 32, 16],
  blk_grass_fl_r: ['T', 64, 192, 64, 64, 32, 16], blk_grass_fl_p: ['T', 128, 192, 64, 64, 32, 16], blk_grass_fl_y: ['T', 192, 192, 64, 64, 32, 16],
  blk_grass_speck: ['T', 0, 256, 64, 64, 32, 16],
  blk_sand: ['T', 256, 320, 64, 64, 32, 16], blk_sand_speck: ['T', 320, 320, 64, 64, 32, 16], blk_dirt_peb: ['T', 384, 320, 64, 64, 32, 16],
  // walls (64x64 cell; left half = NW wall, right half = NE wall)
  wall_orange: ['F', 0, 704, 64, 64, 0, 0], wall_orange_dt: ['F', 0, 832, 64, 64, 0, 0],
  wall_teal: ['F', 128, 704, 64, 64, 0, 0], wall_teal_dt: ['F', 128, 832, 64, 64, 0, 0],
  wall_pink: ['F', 64, 704, 64, 64, 0, 0], wall_pink_dt: ['F', 64, 832, 64, 64, 0, 0],
  // furniture
  table_white: ['F', 194, 399, 57, 42, 28, 28], table_peach: ['F', 129, 399, 57, 42, 28, 28],
  table_sq_cream: ['F', 69, 273, 51, 33, 25, 22],
  rug_red_long: ['F', 193, 585, 91, 47, 45, 32], rug_red: ['F', 2, 649, 91, 47, 45, 32],
  vase_flowers: ['F', 295, 333, 20, 40, 10, 27], potted_tree: ['F', 256, 394, 32, 44, 16, 30], vase_blue: ['F', 264, 325, 17, 22, 8, 15],
  banner_red: ['F', 168, 64, 16, 60, 8, 44], banner_purple: ['F', 136, 64, 16, 60, 8, 44], curtains: ['F', 294, 391, 20, 49, 10, 33],
  lantern: ['F', 265, 196, 14, 23, 7, 16], barrel: ['F', 194, 65, 27, 29, 13, 20], side_table: ['F', 129, 320, 30, 31, 15, 21],
  chair_sw: ['F', 39, 193, 18, 30, 9, 20], chair_se: ['F', 72, 193, 17, 30, 8, 20],
  counter_L: ['F', 198, 12, 50, 42, 25, 28], market_stall: ['F', 261, 7, 54, 77, 27, 61],
  // garden objects
  bush_green: ['T', 778, 6, 46, 38, 23, 30], bush_autumn: ['T', 842, 10, 46, 38, 23, 30],
  tree_green: ['T', 768, 208, 64, 94, 32, 86], tree_teal: ['T', 832, 200, 64, 102, 32, 94], tree_autumn: ['T', 896, 200, 64, 102, 32, 94],
  lamp_post: ['T', 916, 960, 24, 64, 12, 58], stone_column: ['T', 846, 1088, 36, 64, 18, 58], sign_board: ['T', 974, 962, 40, 60, 20, 54],
  rope_post: ['T', 854, 896, 24, 62, 12, 56],
  // Kenney (pixelised), one file each
  k_toilet_sw: [KEN + 'toilet_SW.png', 0, 0, 25, 32, 12, 26], k_toiletsq_sw: [KEN + 'toiletSquare_SW.png', 0, 0, 22, 31, 11, 26],
  k_sink_sw: [KEN + 'bathroomSink_SW.png', 0, 0, 20, 27, 10, 22],
  k_chair_ne: [KEN + 'chairCushion_NE.png', 0, 0, 15, 22, 7, 19], k_chair_nw: [KEN + 'chairCushion_NW.png', 0, 0, 15, 23, 7, 20],
  k_chair_se: [KEN + 'chairCushion_SE.png', 0, 0, 15, 26, 7, 23], k_chair_sw: [KEN + 'chairCushion_SW.png', 0, 0, 15, 26, 7, 23],
  k_trash: [KEN + 'trashcan_SE.png', 0, 0, 12, 22, 6, 19], k_fridge: [KEN + 'kitchenFridge_SW.png', 0, 0, 24, 47, 12, 41],
  k_speaker: [KEN + 'speaker_SW.png', 0, 0, 12, 30, 6, 27], k_speaker_s: [KEN + 'speakerSmall_SW.png', 0, 0, 11, 18, 5, 15],
  k_stool: [KEN + 'stoolBar_SE.png', 0, 0, 14, 23, 7, 20], k_lamp: [KEN + 'lampRoundFloor_SE.png', 0, 0, 9, 35, 4, 32],
  k_plant: [KEN + 'pottedPlant_SE.png', 0, 0, 11, 28, 5, 25], k_coffee: [KEN + 'kitchenCoffeeMachine_SE.png', 0, 0, 13, 15, 6, 12],
  k_doormat: [KEN + 'rugDoormat_SE.png', 0, 0, 22, 17, 11, 12], k_radio: [KEN + 'radio_SW.png', 0, 0, 15, 18, 7, 15],
};
function srImg(r) { const s = r[0]; return loadImg(s, s === 'F' ? SHEET_FURN : s === 'T' ? SHEET_TILES : s); }
function preloadSR() { for (const k in SR) srImg(SR[k]); }
// draw sprite `name` with its anchor at world point (wx, wy). 1 sprite px = 0.5 world unit (= 1 backing px at RS 2)
function spr(c, name, wx, wy, flip) {
  const r = SR[name]; if (!r) return false;
  const im = srImg(r); if (!imgOk(im)) return false;
  const w = r[3] / 2, h = r[4] / 2;
  const x = Math.round((wx - r[5] / 2) * 2) / 2, y = Math.round((wy - r[6] / 2) * 2) / 2;
  if (flip) { c.save(); c.translate(x + w, y); c.scale(-1, 1); c.drawImage(im, r[1], r[2], r[3], r[4], 0, 0, w, h); c.restore(); }
  else c.drawImage(im, r[1], r[2], r[3], r[4], x, y, w, h);
  return true;
}
// draw a sub-rect of a sprite (for cut-down walls) with its top-left at world (wx, wy)
function sprPart(c, name, sx, sy, sw, sh, wx, wy) {
  const r = SR[name]; if (!r) return false;
  const im = srImg(r); if (!imgOk(im)) return false;
  c.drawImage(im, r[1] + sx, r[2] + sy, sw, sh, Math.round(wx * 2) / 2, Math.round(wy * 2) / 2, sw / 2, sh / 2);
  return true;
}
// set true to use the sprite-sheet scenery (slower); false keeps the original vector scenery
const SPRITE_SCENERY = false;
function spritesOk() { return SPRITE_SCENERY && imgOk(ASSET.imgs.F) && imgOk(ASSET.imgs.T); }

// ---------- procedural art at pixel resolution ----------
const PIXC = new Map();
function pixSprite(key, w, h, ax, ay, fn) {
  let s = PIXC.get(key); if (s) return s;
  const cv = mkCanvas(w, h); const c = cv.getContext('2d'); c.__pix = true;
  const o = iso(0, 0); c.translate(ax - o.x, ay - o.y); fn(c);
  s = { cv, w, h, ax, ay }; PIXC.set(key, s); return s;
}
let _scr = null;
function pixDynamic(cOut, w, h, ax, ay, tx, ty, fn) {
  if (!_scr || _scr.width !== w || _scr.height !== h) { _scr = mkCanvas(w, h); }
  const c = _scr.getContext('2d'); c.__pix = true;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
  const o = iso(0, 0); c.translate(ax - o.x, ay - o.y); fn(c);
  const p = iso(tx, ty); cOut.drawImage(_scr, Math.round(p.x - ax), Math.round(p.y - ay), w, h);
}
function blitPix(c, s, tx, ty) { const p = iso(tx, ty); c.drawImage(s.cv, Math.round(p.x - s.ax), Math.round(p.y - s.ay), s.w, s.h); }
// thicker outlines when drawing at 1px per unit
ink = (function (orig) {
  return function (c, lw) { if (SPRITE_SCENERY && c.__pix) { c.lineWidth = Math.max(1, (lw || OLW) * 1.4); c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); } else orig(c, lw); };
})(ink);

// ---------- floor tiles, garden edges & back walls (baked) ----------
bakeBackWalls = (function (orig) {
  return function (c) {
    if (!spritesOk()) { orig(c); return; }
    c.imageSmoothingEnabled = false;
    const GRASS = ['blk_grass_a', 'blk_grass_b', 'blk_grass_c', 'blk_grass_d', 'blk_grass_e', 'blk_grass_a', 'blk_grass_b', 'blk_grass_speck', 'blk_grass_fl_r', 'blk_grass_fl_p', 'blk_grass_fl_y'];
    // 1) floor tiles
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const t = map[y][x]; if (t === T.VOID) continue;
      const p = iso(x, y), v = tvar[y][x];
      const edge = y === MH - 1 || x === MW - 1;
      let name = null;
      if (edge || t === T.GRASS || t === T.HEDGE) name = GRASS[Math.floor(v * GRASS.length) % GRASS.length];
      else if (t === T.PATH) name = v < 0.5 ? 'blk_sand' : 'blk_sand_speck';
      else if (t === T.WOOD || t === T.DOOR || t === T.WALL) name = (x >= 24 && y >= 17) ? 'tiles_mint' : 'wood_light';
      else if (t === T.RUG) name = 'wood_dark';
      else if (t === T.TILE) name = 'tiles_mint';
      if (!name) continue;
      const r = SR[name];
      if (r[4] === 64) {
        if (edge) spr(c, name, p.x, p.y + 8);       // full block: earth sides show at the map edge
        else sprPart(c, name, 0, 0, 64, 32, p.x - 16, p.y);
      } else spr(c, name, p.x, p.y + 8);
    }
    // 2) rugs under the dining tables and a doormat at each door
    for (const o of G.objects) {
      if (o.type === 'table') { const q = iso(o.x + 1.5, o.y + 0.5); spr(c, 'rug_red_long', q.x, q.y + 2); }
      if (o.type === 'ttable') for (let i = 1; i < 8; i += 3) { const q = iso(o.x + i + 0.5, o.y + 0.9); spr(c, 'rug_red', q.x, q.y + 2); }
    }
    for (const [x, y] of [[14, 6], [14, 16], [26, 18]]) { const q = iso(x + 0.5, y + 0.5); spr(c, 'k_doormat', q.x, q.y); }
    // 3) back hedges: rows of bushes along the garden's back edges
    for (let x = 1; x <= 12; x++) for (const f of [0.25, 0.75]) { const q = iso(x + f, 0.65); spr(c, hash2(x, f * 4) < 0.15 ? 'bush_autumn' : 'bush_green', q.x, q.y); }
    for (let y = 1; y <= MH - 1; y++) for (const f of [0.25, 0.75]) { const q = iso(0.65, y + f); spr(c, hash2(y, f * 7) < 0.12 ? 'bush_autumn' : 'bush_green', q.x, q.y); }
    // 4) hall back wall: brick, with banners, curtains and bunting
    for (let x = 14; x <= MW - 2; x++) {
      const q = iso(x, 1);                       // NE edge of tile (x,1) runs from iso(x,1) to iso(x+1,1)
      sprPart(c, 'wall_orange', 32, 0, 32, 64, q.x, q.y - 24);
    }
    { const q = iso(14, 1); sprPart(c, 'wall_orange', 0, 0, 32, 64, q.x - 16, q.y - 24); } // corner piece above the side wall
    for (let x = 14; x <= MW - 2; x++) {
      const m = iso(x + 0.5, 1);
      if (x % 4 === 1) spr(c, 'curtains', m.x, m.y - 6);
      else if (x % 4 === 3) spr(c, x % 8 === 3 ? 'banner_red' : 'banner_purple', m.x, m.y - 7);
    }
    for (let x = 14; x <= MW - 2; x++) for (let k = 0; k < 4; k++) {
      const a = iso(x + k / 4 + 0.06, 1), col = BUNTING[(x + k) % 5];
      c.fillStyle = col; c.beginPath(); c.moveTo(a.x, a.y - 22); c.lineTo(a.x + 3.5, a.y - 20.2); c.lineTo(a.x + 1.2, a.y - 17.6); c.closePath(); c.fill();
    }
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.4; c.beginPath(); { const a = iso(14, 1), b = iso(MW - 1, 1); c.moveTo(a.x, a.y - 22); c.lineTo(b.x, b.y - 22); } c.stroke();
  };
})(bakeBackWalls);

// ---------- walls drawn in the depth pass (low, cut-away like Theme Hospital) ----------
const WALL_CUT = 26;           // px of a 64px wall cell kept (out of 48 visible) for cut-away walls
drawWallPiece = (function (orig) {
  return function (c, x, y) {
    if (!spritesOk()) { orig(c, x, y); return; }
    c.imageSmoothingEnabled = false;
    const t = map[y][x];
    const low = (name, half, tx, ty, front) => {
      // half: 'L' = NW wall (cell x 0..31), 'R' = NE wall (cell x 32..63) for back-type walls of tile (tx,ty)
      // front walls: 'SE' uses cell x 0..31, 'SW' uses cell x 32..63
      const tl = iso(tx, ty); const lx = tl.x - 16, ly = tl.y;     // top-left of the tile's diamond bbox
      const sy = 64 - WALL_CUT;
      if (half === 'L') sprPart(c, name, 0, sy, 32, WALL_CUT, lx, ly - 24 + sy / 2);
      else if (half === 'R') sprPart(c, name, 32, sy, 32, WALL_CUT, lx + 16, ly - 24 + sy / 2);
      else if (half === 'SE') sprPart(c, name, 0, sy, 32, WALL_CUT, lx + 16, ly - 16 + sy / 2);
      else if (half === 'SW') sprPart(c, name, 32, sy, 32, WALL_CUT, lx, ly - 16 + sy / 2);
    };
    if (t === T.HEDGE) {
      if (y === MH - 1) {
        for (const f of [0.2, 0.7]) { const q = iso(x + f, y + 0.35); spr(c, hash2(x, 9) < 0.15 ? 'bush_autumn' : 'bush_green', q.x, q.y); }
        if (x === 5 || x === 8) { const q = iso(x === 5 ? x + 0.85 : x + 0.15, y + 0.3); spr(c, 'stone_column', q.x, q.y); }
      }
      return;
    }
    if (t === T.DOOR) return;                                     // doors are gaps in the wall
    if (t !== T.WALL) return;
    if (y === MH - 1) { if (x >= 14) low('wall_orange_dt', 'SW', x, y - 1); return; }
    if (x === MW - 1) { low('wall_orange_dt', 'SE', x - 1, y); return; }
    if (x === 13) { low('wall_orange_dt', 'L', 14, y); return; }
    if (x === 24 && y === 17) { low('wall_teal_dt', 'L', 25, 18); return; }
    if (x === 24) { low('wall_teal_dt', 'L', 25, y); return; }
    if (y === 17) { low('wall_teal_dt', 'R', x, 18); return; }
  };
})(drawWallPiece);

// ---------- furniture ----------
const PIX_W = 72, PIX_H = 104, PIX_AX = 36, PIX_AY = 82;
function plateDots(c, cx, cy, food) {
  c.fillStyle = '#2a1d2c'; c.fillRect(cx - 2.5, cy - 1, 5, 2.5);
  c.fillStyle = '#ffffff'; c.fillRect(cx - 2, cy - 0.5, 4, 1.5);
  if (food) { c.fillStyle = '#c07040'; c.fillRect(cx - 1, cy - 0.5, 1.5, 1); c.fillStyle = '#6ab040'; c.fillRect(cx + 0.5, cy, 1, 0.5); }
}
const SPRITE_OBJ = {
  table(c, o, tx, ty, dx) {
    const p = iso(tx + 0.5, ty + 0.5);
    if (!spr(c, o.type === 'ttable' ? 'table_peach' : 'table_white', p.x, p.y + 1)) return false;
    const dinner = G && (G.phase === 'dinner' || G.phase === 'speeches');
    plateDots(c, p.x - 5, p.y - 9, dinner); plateDots(c, p.x + 5, p.y - 7, dinner);
    if (dx === 1 || (o.type === 'ttable' && dx % 3 === 1)) spr(c, 'vase_blue', p.x, p.y - 7);
    return true;
  },
  chair(c, o, tx, ty) { const p = iso(tx + 0.5, ty + 0.5); return spr(c, 'k_chair_ne', p.x, p.y); },
  dchair(c, o, tx, ty) {
    const p = iso(tx + 0.5, ty + 0.5);
    const below = inBounds(tx, ty + 1) ? occ[ty + 1][tx] : null;
    const facesDown = below && (below.type === 'table' || below.type === 'ttable');
    return spr(c, facesDown ? 'k_chair_sw' : 'k_chair_ne', p.x, p.y);
  },
  plant(c, o, tx, ty) { const p = iso(tx + 0.5, ty + 0.5); return spr(c, o.id % 2 ? 'potted_tree' : 'vase_flowers', p.x, p.y); },
  tree(c, o, tx, ty) { const p = iso(tx + 0.5, ty + 0.5); return spr(c, ['tree_green', 'tree_teal', 'tree_green', 'tree_autumn'][o.id % 4], p.x, p.y); },
  bin(c, o, tx, ty) { const p = iso(tx + 0.5, ty + 0.5); return spr(c, 'k_trash', p.x, p.y); },
  lamp(c, o, tx, ty) {
    const p = iso(tx + 0.5, ty + 0.5);
    if (!spr(c, 'lamp_post', p.x, p.y)) return false;
    if (nightAlpha() > 0.15) { c.fillStyle = 'rgba(255,240,150,.85)'; c.fillRect(p.x - 2, p.y - 29, 4, 4); }
    return true;
  },
  toilet(c, o, tx, ty) {
    const p = iso(tx + 0.5, ty + 0.5);
    if (!spr(c, 'k_toilet_sw', p.x + 1, p.y)) return false;
    const busy = o.slots && o.slots[0] && o.slots[0].user;
    c.fillStyle = INK; c.fillRect(p.x - 1.5, p.y - 21.5, 3, 3); c.fillStyle = busy ? '#ff3030' : '#30e050'; c.fillRect(p.x - 1, p.y - 21, 2, 2);
    return true;
  },
  canape(c, o, tx, ty) {
    const p = iso(tx + 0.5, ty + 0.5);
    if (!spr(c, 'table_sq_cream', p.x, p.y + 1)) return false;
    const cols = ['#f0a040', '#e05a5a', '#8ac050', '#f7e070', '#c88aff'];
    for (let i = 0; i < 7; i++) { c.fillStyle = cols[i % 5]; c.fillRect(p.x - 6 + (i % 4) * 3, p.y - 9 + Math.floor(i / 4) * 2, 1.5, 1); }
    return true;
  },
  kitchen(c, o, tx, ty, dx) {
    const p = iso(tx + 0.5, ty + 0.5);
    const s = pixSprite('pc:kitchen:' + dx + ':' + ((G.phase === 'dinner') ? 'd' : 'n'), PIX_W, PIX_H, PIX_AX, PIX_AY, (sc) => drawPiece(sc, o, 0, 0, dx, 0, 0));
    blitPix(c, s, tx, ty);
    if (dx === 1) spr(c, 'k_coffee', p.x + 3, p.y - 13);
    return true;
  },
  dj(c, o, tx, ty, dx, dy, t) {
    const p = iso(tx + 0.5, ty + 0.5);
    if (dx !== 1) {
      if (!spr(c, 'k_speaker', p.x - 3, p.y)) return false;
      spr(c, 'k_speaker', p.x + 4, p.y + 2);
      if (G.djOn && Math.floor(t * 4) % 2) { c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(p.x - 6, p.y - 13, 13, 12); }
      return true;
    }
    pixDynamic(c, PIX_W, PIX_H, PIX_AX, PIX_AY, tx, ty, (sc) => drawPiece(sc, o, 0, 0, dx, dy, t));
    return true;
  },
};
SPRITE_OBJ.ttable = SPRITE_OBJ.table;

drawPieceCached = (function (orig) {
  return function (c, o, tx, ty, dx, dy, t) {
    if (!SPRITE_SCENERY) { orig(c, o, tx, ty, dx, dy, t); return; }
    c.imageSmoothingEnabled = false;
    if (spritesOk() && SPRITE_OBJ[o.type] && SPRITE_OBJ[o.type](c, o, tx, ty, dx, dy, t)) return;
    const k = pieceKey(o);
    if (k === null) { pixDynamic(c, PIX_W, PIX_H, PIX_AX, PIX_AY, tx, ty, (sc) => drawPiece(sc, o, 0, 0, dx, dy, t)); return; }
    const s = pixSprite('pc:' + o.type + ':' + dx + ':' + dy + ':' + k, PIX_W, PIX_H, PIX_AX, PIX_AY, (sc) => drawPiece(sc, o, 0, 0, dx, dy, 0));
    blitPix(c, s, tx, ty);
  };
})(drawPieceCached);
drawSingleCached = SPRITE_SCENERY ? function (c, o) {
  c.imageSmoothingEnabled = false;
  const s = pixSprite('single:' + o.type, 100, 100, 32, 64, (sc) => drawArch(sc, Object.assign({}, o, { x: 0, y: 0 })));
  blitPix(c, s, o.x, o.y);
} : drawSingleCached;
drawObjPreview = (function (orig) {
  return function (c, type, cx, cy) {
    if (!spritesOk() || !G) { orig(c, type, cx, cy); return; }
    const d = OT[type];
    const o = { type, x: 0, y: 0, w: d.w, h: d.h, slots: [], fake: true, id: 1 };
    const ctr = iso(d.w / 2, d.h / 2);
    c.save(); c.imageSmoothingEnabled = false; c.translate(Math.round(cx - ctr.x), Math.round(cy - ctr.y));
    dpath(c, 0, 0, d.w, d.h); c.fillStyle = '#58b44a'; c.fill();
    const pieces = [];
    for (let dy = 0; dy < d.h; dy++) for (let dx = 0; dx < d.w; dx++) pieces.push([dx, dy]);
    pieces.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
    for (const [dx, dy] of pieces) drawPieceCached(c, o, dx, dy, dx, dy, 0);
    c.restore();
  };
})(drawObjPreview);

// ---------- characters (Universal LPC) ----------
const CHAR_FALLBACK = {
  frame: 64, anchor: [32, 60],
  anims: { walk: { cols: 9, rows: 4 }, idle: { cols: 2, rows: 4 }, cast: { cols: 7, rows: 4 }, hurt: { cols: 6, rows: 1 }, sit: { cols: 3, rows: 4 } },
  dirRows: { up: 0, left: 1, down: 2, right: 3 },
  chars: {},
  pools: { m: ['guest_man_navy', 'grandpa'], f: ['guest_woman_blue', 'guest_woman_red'], om: ['grandpa'], of: ['grandma'], kb: ['kid_boy'], kg: ['kid_girl'] },
};
for (const id of ['groom', 'groom_frock', 'bride', 'bride_updo', 'guest_man_navy', 'guest_woman_blue', 'guest_woman_red', 'grandpa', 'grandma', 'kid_boy', 'kid_girl', 'waiter', 'bartender', 'cleaner', 'bouncer', 'dj']) {
  CHAR_FALLBACK.chars[id] = { walk: `assets/characters/${id}_walk.png`, idle: `assets/characters/${id}_idle.png`, cast: null, hurt: null, sit: null };
}
function CI() { return window.CHAR_INDEX && window.CHAR_INDEX.chars ? window.CHAR_INDEX : CHAR_FALLBACK; }
function preloadChars() {
  const ci = CI();
  for (const id in ci.chars) for (const a of ['walk', 'idle', 'cast', 'hurt', 'sit']) { const src = ci.chars[id][a]; if (src) loadImg('ch:' + id + ':' + a, src); }
}
function charSheet(id, anim) { const ci = CI(); const e = ci.chars[id]; if (!e || !e[anim]) return null; const im = loadImg('ch:' + id + ':' + anim, e[anim]); return imgOk(im) ? im : null; }
const NAMED_SHEETS = [['bestMan', 'bestman'], ['moh', 'moh'], ['fob', 'fob'], ['mob', 'mob'], ['gmum', 'gmum'], ['gdad', 'gdad'], ['gerald', 'gerald'],
  ['gran', 'gran'], ['babushka', 'babushka'], ['dmitri', 'dmitri'], ['jess', 'jess'], ['kyle', 'kyle'], ['registrar', 'registrar'], ['magician', 'magician'], ['celeb', 'celebchef']];
const LIGHT_OLD = new Set(['g_m_01', 'g_m_03', 'g_m_07', 'g_m_11', 'g_m_14', 'g_f_01', 'g_f_05', 'g_f_09', 'g_f_11', 'g_f_15', 'g_om_01', 'g_om_03', 'g_of_01', 'g_of_03', 'g_of_05']);
function isLightGuest(id) { return LIGHT_OLD.has(id) || /_w\d/.test(id); }
function charIdFor(p) {
  if (p._cid !== undefined) return p._cid;
  const ci = CI(), has = (id) => !!(ci.chars[id] && ci.chars[id].walk);
  let id = null;
  if (p.kind === 'couple') id = p.role === 'groom' ? 'groom' : 'bride';
  else if (p.kind === 'staff') id = has(p.role) ? p.role : (p.role === 'planner' && has('planner') ? 'planner' : null);
  if (!id && G && p.role === 'Bridesmaid' && G.bridesmaids) { const i = G.bridesmaids.indexOf(p); if (i >= 0 && has('bridesmaid' + (i + 1))) id = 'bridesmaid' + (i + 1); }
  if (!id && G && G.bestMan2 === p && has('bestman2')) id = 'bestman2';
  if (!id && G) for (const [k, sid] of NAMED_SHEETS) if (G[k] === p && has(sid)) { id = sid; break; }
  if (!id && p.role === 'registrar') id = has('registrar') ? 'registrar' : 'grandpa';
  if (!id && p.role === 'Flower Girl' && has('flowergirl')) id = 'flowergirl';
  if (!id && p.role === 'Page Boy' && has('pageboy')) id = 'pageboy';
  if (!id && p.role === 'Hen Party') id = has('hen1') ? (p.id % 2 ? 'hen1' : 'hen2') : null;
  if (!id && p.rival) { const r = ['rival1', 'rival2', 'rival3'].filter(has); if (r.length) id = r[p.id % r.length]; }
  if (!id && p.look) {
    const L = p.look, age = L.age || (L.kid ? 'kid' : 'adult');
    const key = L.kid ? (L.sex === 'f' ? 'kg' : 'kb') : (age === 'old' || age === 'gran') ? (L.sex === 'f' ? 'of' : 'om') : (L.sex === 'f' ? 'f' : 'm');
    const pool = (ci.pools[key] || []).filter(has);
    const alt = (ci.pools[L.sex === 'f' ? 'f' : 'm'] || []).filter(has);
    let use = pool.length ? pool : alt;
    // ~75% of guests drawn from the light-skinned part of each pool
    const lt = use.filter(isLightGuest), dk = use.filter((x) => !isLightGuest(x));
    if (lt.length && dk.length) use = ((p.id * 53 + 17) % 100) < 75 ? lt : dk;
    if (use.length) id = use[(p.id * 7 + 3) % use.length];
  }
  p._cid = id && has(id) ? id : null;
  return p._cid;
}
const SIT_OY = 10, SIT_CROP = 2, SIT_SHOULDER = 10; // LPC chair-sitting frames are drawn lower (seated height) with the legs trimmed
const PERSON_SCALE = 1.3; // everyone is drawn 1.3x as tall as the raw 32x32 frame (same width)
let _tint = null;
function drawFrame(c, im, col, row, x, y, w, h, opts) {
  const F = CI().frame || 64;
  const sh = opts && opts.cropBottom ? F - opts.cropBottom : F;
  if (opts && opts.tint) {
    if (!_tint) _tint = mkCanvas(F, F);
    const tc = _tint.getContext('2d'); tc.globalCompositeOperation = 'source-over'; tc.clearRect(0, 0, F, F);
    tc.drawImage(im, col * F, row * F, F, F, 0, 0, F, F);
    tc.globalCompositeOperation = 'source-atop'; tc.fillStyle = opts.tint; tc.fillRect(0, 0, F, F); tc.globalCompositeOperation = 'source-over';
    c.drawImage(_tint, 0, 0, F, sh, x, y, w, h * sh / F);
  } else c.drawImage(im, col * F, row * F, F, sh, x, y, w, h * sh / F);
}
function lpcPose(p, t) {
  const ci = CI(), rows = ci.dirRows || CHAR_FALLBACK.dirRows;
  let dir = p.dir || (p.face === 'b' ? 'up' : 'down');
  const lying = p.state === 'sleep' || p.state === 'fallen';
  const sick = p.state === 'sick';
  let anim = 'idle', col = 0, row = rows[dir] !== undefined ? rows[dir] : 2;
  const castOk = !!charSheet(p._cid, 'cast'), hurtOk = !!charSheet(p._cid, 'hurt');
  const cheer = p.state === 'conga' || p.state === 'fight' || (p.state === 'watch' && G && (G.phase === 'firstdance' || G.phase === 'sendoff'));
  const slowDance = p.state === 'dance' && p.kind === 'couple' && G && G.phase === 'firstdance';
  if (lying && hurtOk) { anim = 'hurt'; col = 5; row = 0; }
  else if (sick && hurtOk) { anim = 'hurt'; col = 1; row = 0; }
  else if (p.sitting && charSheet(p._cid, 'sit')) { anim = 'sit'; col = 2; } // sat on a chair
  else if ((p.state === 'dance' && !slowDance || cheer) && castOk) {
    anim = 'cast'; const seq = [1, 2, 3, 4, 5, 4, 3, 2]; col = seq[Math.floor(t * (p.state === 'fight' ? 14 : 8) + p.id) % seq.length];
    if (p.state === 'dance') { const turn = ['down', 'left', 'down', 'right']; row = rows[turn[Math.floor(t * 0.8 + p.id) % 4]]; }
  } else if (p.state === 'dance') { anim = 'walk'; col = 1 + Math.floor(t * 10 + p.id) % 8; const turn = ['down', 'left', 'up', 'right']; row = rows[turn[Math.floor(t * (slowDance ? 0.6 : 1.2) + p.id) % 4]]; }
  else if (p.moving && !p.sitting) { anim = 'walk'; col = 1 + Math.floor(t * 11 + p.id) % 8; }
  else if (charSheet(p._cid, 'idle')) { anim = 'idle'; col = Math.floor(t * 1.6 + p.id * 0.37) % 2; }
  else { anim = 'walk'; col = 0; }
  return { anim, col, row, dir, lying, sick };
}

// ---------- facial expressions (painted onto the facing-camera frames; see assets/tools/lpc_faces.py) ----------
const EXPR_M = '#6e2428', EXPR_W = '#fafaf5', EXPR_P = '#f08c96', EXPR_T = '#78beff', EXPR_K = '#3c1e1e';
// [colour, dx, dy] relative to (eye-centre x, first row of eye whites)
const SMILE = [[EXPR_M, -2, 3], [EXPR_M, 2, 3], [EXPR_M, -1, 4], [EXPR_M, 0, 4], [EXPR_M, 1, 4]];
const EXPRS = {
  smile: SMILE,
  grin: [[EXPR_M, -2, 3], [EXPR_M, -1, 3], [EXPR_M, 0, 3], [EXPR_M, 1, 3], [EXPR_M, 2, 3], [EXPR_W, -1, 4], [EXPR_W, 0, 4], [EXPR_W, 1, 4]],
  laugh: [[EXPR_W, -2, 3], [EXPR_W, -1, 3], [EXPR_W, 0, 3], [EXPR_W, 1, 3], [EXPR_W, 2, 3], [EXPR_M, -1, 4], [EXPR_M, 0, 4], [EXPR_M, 1, 4], [EXPR_M, -2, 2], [EXPR_M, 2, 2]],
  blush: SMILE.concat([[EXPR_P, -4, 2], [EXPR_P, -3, 2], [EXPR_P, 3, 2], [EXPR_P, 4, 2]]),
  tears: SMILE.concat([[EXPR_T, -4, 2], [EXPR_T, -4, 3], [EXPR_T, 4, 2], [EXPR_T, 4, 3]]),
  nervous: [[EXPR_M, -2, 4], [EXPR_M, -1, 3], [EXPR_M, 0, 4], [EXPR_M, 1, 3], [EXPR_M, 2, 4], [EXPR_T, 6, -2], [EXPR_T, 6, -1]],
  shocked: [[EXPR_M, -1, 3], [EXPR_M, 0, 3], [EXPR_M, -1, 4], [EXPR_M, 0, 4]],
  sad: [[EXPR_M, -2, 4], [EXPR_M, 2, 4], [EXPR_M, -1, 3], [EXPR_M, 0, 3], [EXPR_M, 1, 3]],
};
const _exprCache = new Map();
function faceInfo(id, anim, col) { const f = window.FACES && window.FACES[id]; const a = f && f[anim]; return a && a[col] ? a[col] : null; }
// returns a 64x64 canvas of the frame with the expression painted on, or null
function exprFrame(id, im, anim, col, row, expr) {
  if (!expr || !EXPRS[expr] || row !== 2) return null;
  const fi = faceInfo(id, anim, col); if (!fi) return null;
  const key = id + '|' + anim + '|' + col + '|' + expr;
  let cv = _exprCache.get(key);
  if (!cv) {
    const F = CI().frame || 64;
    cv = mkCanvas(F, F); const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(im, col * F, row * F, F, F, 0, 0, F, F);
    for (const [colr, dx, dy] of EXPRS[expr]) { x.fillStyle = colr; x.fillRect(fi[0] + dx, fi[1] + dy, 1, 1); }
    if (_exprCache.size > 900) _exprCache.clear();
    _exprCache.set(key, cv);
  }
  return cv;
}
// pick a face from how the person is feeling
function exprFor(p, P) {
  if (P.dir !== 'down' || P.lying || P.sick || P.anim === 'hurt') return null;
  if (p.state === 'fight') return 'shocked';
  if (p.queasy > 0) return 'nervous';
  const ph = G && G.phase, dancing = p.state === 'dance' || p.state === 'conga';
  if (p.kind === 'couple') {
    if (ph === 'ceremony') return 'tears';
    if (p.role === 'bride') { if (p.drunk > 65) return 'laugh'; if (p.drunk > 35) return 'blush'; return null; } // bride keeps a neutral face
    if (p.state === 'dance' || ph === 'firstdance' || ph === 'sendoff') return 'grin';
  }
  if (p.drunk > 65) return 'laugh';
  if (p.happy < 28) return 'sad';
  if (p.drunk > 35) return 'blush';
  if (p.happy < 42) return 'nervous';
  if (dancing && p.happy > 55) return (p.id + Math.floor((G.time || 0) / 20)) % 3 === 0 ? 'laugh' : 'grin';
  if (p.happy > 88 && p.id % 3 === 0) return 'grin';
  if (p.happy > 70 && p.id % 4 !== 0) return 'smile';
  return null;
}
function drawLPC(c, p, t, sx, sy) {
  const id = charIdFor(p); if (!id) return false;
  const P = lpcPose(p, t);
  let im = charSheet(id, P.anim);
  if (!im) { im = charSheet(id, 'walk'); if (!im) return false; P.anim = 'walk'; if (P.col > 8) P.col = 0; }
  const anc = CI().anchor || [32, 60];
  const TS = PERSON_SCALE;
  let lift = 0, dx = 0;
  if (p.onCastle) lift = 6 + Math.abs(Math.sin(t * 7 + p.id)) * 7;
  else if (p.state === 'dance') lift = Math.abs(Math.sin(t * (p.danceSpeed || 8) + p.id)) * 1.5;
  else if (p.hyper > 0 && p.moving) lift = Math.abs(Math.sin(t * 16)) * 1.4;
  if (p.drunk > 45 && !p.sitting && !P.sick && !P.lying) dx += Math.sin(t * 2.3 + p.id) * (p.drunk - 40) / 22;
  if (p.state === 'fight') dx += Math.sin(t * 20 + p.id) * 1.4;
  const sitting = p.sitting && !P.lying;
  const sitSheet = sitting && P.anim === 'sit';
  const oy = sitting ? (sitSheet ? SIT_OY : 4.5) : 0;
  const x = Math.round((sx + dx - anc[0] / 2) * 2) / 2, y = Math.round((sy - lift + oy - anc[1] / 2 * TS) * 2) / 2;
  const tint = (p.sooty && G && G.time < p.sooty) ? 'rgba(40,28,18,.5)' : (P.sick || p.queasy > 0) ? 'rgba(120,200,60,.38)' : (p.drunk > 70 ? 'rgba(255,60,60,.12)' : null);
  c.imageSmoothingEnabled = false;
  const ef = exprFrame(id, im, P.anim, P.col, P.row, exprFor(p, P));
  if (ef) drawFrame(c, ef, 0, 0, x, y, 32, 32 * TS, { tint, cropBottom: sitSheet ? SIT_CROP : sitting ? (P.dir === 'up' ? 18 : 12) : 0 });
  else drawFrame(c, im, P.col, P.row, x, y, 32, 32 * TS, { tint, cropBottom: sitSheet ? SIT_CROP : sitting ? (P.dir === 'up' ? 18 : 12) : 0 });
  // sat with their back to us: the chair back goes in front of them
  if (sitSheet && P.dir === 'up' && typeof occ !== 'undefined') {
    const tx = Math.floor(p.x), ty = Math.floor(p.y), o = occ[ty] && occ[ty][tx];
    if (o && (o.type === 'chair' || o.type === 'dchair')) { // only up to shoulder height, so heads stay visible
      c.save(); c.beginPath(); c.rect(sx - 40, sy - SIT_SHOULDER, 80, 60); c.clip(); drawPieceCached(c, o, tx, ty, tx - o.x, ty - o.y, t); c.restore();
    }
  }
  // props drawn over the sprite
  const hx = sx + dx + (P.dir === 'left' ? -5 : 5), hy = sy - lift + oy - 13 * TS;
  if (p.role === 'waiter' && (p.carry === 'tray' || p.carry === 'plate') && !sitting) {
    c.fillStyle = INK; c.fillRect(hx - 4, hy - 4.5, 8, 2); c.fillStyle = '#d8dce4'; c.fillRect(hx - 3.5, hy - 4, 7, 1);
    if (p.carry === 'plate') { c.fillStyle = '#fff'; c.fillRect(hx - 2, hy - 5.5, 4, 1.5); c.fillStyle = '#c07040'; c.fillRect(hx - 1, hy - 6, 2, 0.8); }
    else { c.fillStyle = 'rgba(245,215,120,.95)'; for (const gx of [-2.5, 0, 2.5]) c.fillRect(hx + gx - 0.5, hy - 7, 1, 3); }
  }
  if (p.look && p.look.mop && !sitting) {
    c.strokeStyle = '#8a5a2a'; c.lineWidth = 0.8; c.beginPath(); const mx = sx + dx + 6 + (p.cleaning ? Math.sin(t * 12) * 1.5 : 0); c.moveTo(sx + dx + 5, sy - 16 * TS); c.lineTo(mx, sy - 1); c.stroke();
    c.fillStyle = '#e0e0e0'; c.fillRect(mx - 2.5, sy - 1.5, 5, 1.5);
  }
  if (p.state === 'chat' && p.drinkInHand && !sitting) { c.fillStyle = 'rgba(240,200,90,.95)'; c.fillRect(hx - 0.5, hy - 1, 1.2, 2.5); }
  if (p.look && p.look.groom && G && G.groomStain && P.dir === 'down' && !P.lying) { c.fillStyle = 'rgba(122,16,32,.9)'; c.fillRect(sx + dx - 0.5, sy - lift + oy - 17 * TS, 2, 2); }
  if (p.kind === 'couple' && !p.thoughtT && !P.lying) heart(c, sx + dx, sy - lift + oy - 25.5 * TS + Math.sin(t * 3), 2, '#ff3a7a');
  p._top = P.lying ? sy - 10 : sy - lift + oy - 27 * TS;
  p._mouth = { x: sx + dx + (P.dir === 'left' ? -2 : P.dir === 'right' ? 2 : 0), y: sy - lift + oy - 21 * TS };
  if (p.state === 'fallen') for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.1; star(c, sx + Math.cos(a) * 5, sy - 12 + Math.sin(a) * 1.5, 1.1, '#ffe040'); }
  return true;
}
drawPersonFull = (function (orig) {
  return function (c, p, t) {
    if (p.kind === 'animal') { orig(c, p, t); return; }
    const s = iso(p.x, p.y);
    if (!drawLPC(c, p, t, s.x, s.y)) orig(c, p, t);
  };
})(drawPersonFull);
drawPersonDirect = (function (orig) {
  return function (c, p, t) {
    const s = iso(p.x, p.y);
    if (!drawLPC(c, p, t || 0, s.x, s.y)) orig(c, p, t);
  };
})(drawPersonDirect);
// hire-panel portraits: draw the standing frame at a clean 2x, centred in the card
drawPersonPreview = (function (orig) {
  return function (c, look, cx, cy, role) {
    const p = { id: 1, kind: 'staff', role, look, x: 0, y: 0, state: 'idle', present: true, happy: 80, drunk: 0, dir: 'down' };
    const id = charIdFor(p); const im = id && (charSheet(id, 'idle') || charSheet(id, 'walk'));
    if (!im) { orig(c, look, cx, cy, role); return; }
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false;
    const cw = c.canvas.width, chh = c.canvas.height;
    const ky = chh / 44, kx = ky / PERSON_SCALE; // head to knees, same tall/slim shape as in the game
    c.drawImage(im, 0, 2 * 64, 64, 64, Math.round(cw / 2 - 32 * kx), Math.round(2 - 12 * ky), Math.round(64 * kx), Math.round(64 * ky));
    c.restore();
  };
})(drawPersonPreview);

// ---------- boot: start loading everything ----------
preloadSR();
preloadChars();
whenAssetsReady(() => {
  // re-bake the floor and redraw any open title-screen art now the images exist
  if (typeof G !== 'undefined' && G) { drawFloor(); markStaticDirty(); }
  const tc = document.getElementById('tcouple'); if (tc && typeof drawCouple === 'function') { tc.getContext('2d').clearRect(0, 0, tc.width, tc.height); drawCouple(tc); }
});
