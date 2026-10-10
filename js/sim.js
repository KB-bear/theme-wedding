'use strict';
/* =========================================================
   THEME WEDDING — simulation: objects, people, AI, phases
   ========================================================= */
let G = null;
let OID = 1, PID = 1, FID = 1, MID = 1;

// ---------- object types ----------
const OT = {
  bar: { name: 'Bar', cost: 800, w: 2, h: 1, block: true, buy: true, desc: 'Pours drinks all day. Needs a Bartender standing behind it.', slots: [[0, 1], [1, 1]], staff: [0, -1], use: 'drink', time: 2 },
  canape: { name: 'Canapé Table', cost: 300, w: 1, h: 1, block: true, buy: true, desc: 'Nibbles for peckish guests. £2 a serving.', slots: 'adj', use: 'food', time: 2, price: 2 },
  portaloo: { name: 'Portaloo', cost: 250, w: 1, h: 1, block: true, buy: true, enter: true, desc: 'When you gotta go... Stops queues (and accidents).', use: 'loo', time: 3 },
  fountain: { name: 'Choc Fountain', cost: 400, w: 1, h: 1, block: true, buy: true, desc: 'Food AND fun. Gets messy.', slots: 'adj', use: 'food', time: 2, fun: 20, price: 1 },
  booth: { name: 'Photo Booth', cost: 450, w: 1, h: 1, block: true, buy: true, enter: true, desc: 'Silly hats and props. Big fun.', use: 'fun', time: 3, fun: 55 },
  castle: { name: 'Bouncy Castle', cost: 700, w: 2, h: 2, block: true, buy: true, onTop: true, desc: 'Kids love it. Tipsy adults love it more. Risky!', use: 'fun', time: 5, fun: 65 },
  plant: { name: 'Flower Pot', cost: 60, w: 1, h: 1, block: true, buy: true, desc: 'Pretty. Guests nearby are a little happier.' },
  lights: { name: 'Fairy Lights', cost: 150, w: 1, h: 1, block: true, buy: true, desc: 'Magical after dark. Cheers up guests nearby at night.' },
  parasol: { name: 'Parasol', cost: 120, w: 1, h: 1, block: true, buy: true, desc: 'Outdoor shade from sun & shelter from rain.' },
  bin: { name: 'Bin', cost: 40, w: 1, h: 1, block: true, buy: true, desc: 'Guests nearby drop far less litter.' },
  arch: { name: 'Flower Arch', w: 3, h: 1, block: true, single: true },
  chair: { name: 'Ceremony Chair', w: 1, h: 1, block: false },
  dchair: { name: 'Dining Chair', w: 1, h: 1, block: false },
  table: { name: 'Dining Table', w: 3, h: 1, block: true },
  ttable: { name: 'Top Table', w: 8, h: 1, block: true },
  cake: { name: 'Wedding Cake', w: 1, h: 1, block: true, slots: [[0, 1], [-1, 0]], use: 'cake', time: 2 },
  dj: { name: 'DJ Booth', w: 3, h: 1, block: true, staff: [1, -1] },
  kitchen: { name: 'Kitchen Pass', w: 2, h: 1, block: true, slots: [[0, 1], [1, 1]] },
  toilet: { name: 'Toilet', w: 1, h: 1, block: true, enter: true, use: 'loo', time: 3 },
  tree: { name: 'Old Oak Tree', w: 1, h: 1, block: true, desc: 'A fine old oak. Great for photos.' },
  lamp: { name: 'Lamp Post', w: 1, h: 1, block: true, desc: 'Lights up the garden after dark.' },
  gate: { name: 'Garden Gate', w: 2, h: 1, block: false, single: true, desc: 'Welcome!' },
  samovar: { name: 'Russian Samovar', w: 1, h: 1, block: true, slots: 'adj', use: 'tea', time: 2, desc: 'Hot sweet tea, Russian style. Free for everyone.' },
};
const BUY_ORDER = ['bar', 'portaloo', 'canape', 'fountain', 'booth', 'castle', 'plant', 'lights', 'parasol', 'bin'];

const STAFF = {
  waiter: { name: 'Waiter', cost: 250, desc: 'Serves dinner, hands out fizz & canapés, clears glasses.' },
  bartender: { name: 'Bartender', cost: 300, desc: 'Runs a Bar. You need one per Bar.' },
  cleaner: { name: 'Cleaner', cost: 200, desc: 'Mops up spills, sick and worse.' },
  bouncer: { name: 'Bouncer', cost: 350, desc: 'Breaks up fights. Removes trouble (and goats).' },
  dj: { name: 'DJ', cost: 600, desc: 'Gets the dance floor going in the evening. Only one.' },
};
function staffLook(role) {
  const sk = pick(SKINS);
  switch (role) {
    case 'waiter': return { skin: sk, hair: pick(HAIRS), style: pick(['short', 'bun', 'spiky']), top: '#1a1a1a', bottom: '#1a1a1a', shoes: '#111', waiter: true, sleeve: '#f4f4f4' };
    case 'bartender': return { skin: sk, hair: pick(HAIRS), style: pick(['quiff', 'pony', 'short']), top: '#262626', bottom: '#262626', shoes: '#111', bow: '#c0283c', apron: true };
    case 'cleaner': return { skin: sk, hair: pick(HAIRS), style: pick(['short', 'bob']), top: '#3a6ad0', bottom: '#3a6ad0', shoes: '#333', gloves: '#ffd84a', mop: true };
    case 'bouncer': return { skin: pick(SKINS), hair: '#111', style: 'bald', top: '#111', bottom: '#111', shoes: '#000', shades: true, big: true };
    case 'dj': return { skin: sk, hair: pick(HAIRS), style: 'short', top: '#222', bottom: '#3a3a5a', shoes: '#eee', cap: '#e03060', phones: true, neon: '#30e0c0' };
  }
  return {};
}

// ---------- names & looks ----------
const SKINS = ['#f6d7c3', '#efc3a2', '#d9a07a', '#b97a50', '#8d5a3b', '#5e3b26'];
const HAIRS = ['#2b1b10', '#4a2e1a', '#7a4a24', '#c8a060', '#e8d8a0', '#1a1a1a', '#8a2a1a', '#c45a1e'];
const SUITS = ['#1f2a4a', '#333338', '#555b66', '#4a2030', '#2a4a3a', '#6b5a3a', '#26364f', '#7a7a80'];
const DRESSES = ['#e05a8a', '#5aa0e0', '#f0c040', '#8a5ad0', '#40b080', '#e07040', '#f2a6c0', '#3a3a8a', '#c02a3a', '#9ad0c0', '#ffb070', '#6ad0e0'];
const TIES = ['#c0283c', '#e0a030', '#3a6ad0', '#ff8fb8', '#2a8a4a', '#8a5ad0'];
const MALE = ['Dave', 'Steve', 'Gary', 'Phil', 'Kev', 'Tom', 'Jamie', 'Rob', 'Craig', 'Darren', 'Ian', 'Neil', 'Barry', 'Mo', 'Raj', 'Liam', 'Sean', 'Owen', 'Gav', 'Terry', 'Nigel', 'Ade', 'Wes', 'Callum', 'Rhys', 'Dom'];
const FEMALE = ['Sharon', 'Tracey', 'Karen', 'Jess', 'Becky', 'Lauren', 'Chloe', 'Amy', 'Priya', 'Sian', 'Denise', 'Jackie', 'Bev', 'Holly', 'Gemma', 'Nicola', 'Fiona', 'Lou', 'Kat', 'Sam', 'Marion', 'Elaine', 'Jo', 'Shaz', 'Aisha', 'Megan'];
const RU_F = ['Olesya', 'Daria', 'Yulia', 'Ksenia', 'Polina', 'Vera'], RU_M = ['Ivan', 'Boris', 'Mikhail', 'Artem', 'Nikolai', 'Pavel'];
const KIDS_M = ['Alfie', 'Archie', 'Freddie', 'Timmy', 'Ollie'], KIDS_F = ['Poppy', 'Isla', 'Ruby', 'Daisy', 'Maisie'];
const TRAITS = {
  party: 'Party Animal', teetotal: 'Teetotal', foodie: 'Foodie', bladder: 'Weak Bladder', wallflower: 'Wallflower',
  lightweight: 'Lightweight', romantic: 'Romantic', grumpy: 'Grumpy', dancer: 'Dancing Queen', gossip: 'Gossip', fighter: 'Short Fuse',
};

function randLook(sex, age) {
  const L = { skin: pick(SKINS), sex, age };
  if (age === 'kid') L.kid = true;
  if (age === 'gran') { return Object.assign(L, { hair: '#dcdcdc', style: 'bun', dress: true, top: pick(['#8a6ab0', '#5a7ab0', '#b05a7a', '#7a9a6a']), shoes: '#4a3a2a', glasses: true }); }
  L.hair = age === 'old' ? pick(['#9a9a9a', '#c8c8c8', '#5a4030', '#2b1b10']) : pick(HAIRS);
  if (sex === 'm') {
    L.style = pick(age === 'old' ? ['short', 'bald', 'short'] : (L.kid ? ['short', 'spiky'] : ['short', 'short', 'spiky', 'quiff', 'bald']));
    L.top = pick(SUITS); L.bottom = L.top; L.shirt = '#f4f4f4'; L.tie = pick(TIES); L.shoes = '#1a1a1a';
    if (!L.kid && chance(0.25)) L.beard = true;
    if (!L.kid && chance(0.12)) L.glasses = true;
  } else {
    L.style = pick(['long', 'bob', 'bun', 'pony', 'long']); L.dress = true; L.top = pick(DRESSES);
    L.shoes = pick(['#1a1a1a', '#c0283c', '#d4b070', '#eeeeee']);
    if (!L.kid && chance(0.35)) L.hat = pick(DRESSES);
  }
  return L;
}
const usedNames = new Set();
function guestName(sex) {
  for (let i = 0; i < 20; i++) {
    const f = sex === 'f' ? pick(FEMALE) : pick(MALE);
    if (usedNames.has(f)) continue;
    usedNames.add(f);
    const r = Math.random();
    if (r < 0.2) return (sex === 'f' ? 'Auntie ' : 'Uncle ') + f;
    if (r < 0.34) return 'Cousin ' + f;
    if (r < 0.48) return f + ' from work';
    if (r < 0.58) return f + ' (uni)';
    if (r < 0.65) return f + ' next door';
    return f;
  }
  return sex === 'f' ? pick(FEMALE) : pick(MALE);
}

// ---------- objects ----------
function objTiles(o) { const a = []; for (let dy = 0; dy < o.h; dy++) for (let dx = 0; dx < o.w; dx++) a.push([o.x + dx, o.y + dy]); return a; }
function rebuildSlotSet() {
  G.slotSet = new Set(G.reserved);
  for (const o of G.objects) {
    for (const s of o.slots) G.slotSet.add(s.x + ',' + s.y);
    if (o.staffSpot) G.slotSet.add(o.staffSpot.x + ',' + o.staffSpot.y);
  }
}
function canPlace(type, x, y) {
  const d = OT[type];
  for (let dy = 0; dy < d.h; dy++) for (let dx = 0; dx < d.w; dx++) {
    const tx = x + dx, ty = y + dy;
    if (!inBounds(tx, ty)) return false;
    const t = map[ty][tx];
    if (!(t === T.GRASS || t === T.WOOD || t === T.TILE || t === T.RUG)) return false;
    if (occ[ty][tx] || G.slotSet.has(tx + ',' + ty)) return false;
  }
  const need = [];
  if (Array.isArray(d.slots) && !d.enter && !d.onTop) for (const s of d.slots) need.push([x + s[0], y + s[1]]);
  if (d.staff) need.push([x + d.staff[0], y + d.staff[1]]);
  for (const [tx, ty] of need) {
    if (!inBounds(tx, ty) || !isFloorT(map[ty][tx]) || occ[ty][tx] || blocked[ty][tx]) return false;
    if (tx >= x && tx < x + d.w && ty >= y && ty < y + d.h) return false;
  }
  if (d.slots === 'adj' && !adjFree(x, y).length) return false;
  // must leave an entrance to anything you walk into
  if (d.enter || d.onTop) {
    let ok = false;
    for (let dy = -1; dy <= d.h; dy++) for (let dx = -1; dx <= d.w; dx++) {
      const tx = x + dx, ty = y + dy;
      if (dx >= 0 && dx < d.w && dy >= 0 && dy < d.h) continue;
      if (walk(tx, ty) && !occ[ty][tx]) ok = true;
    }
    if (!ok) return false;
  }
  return true;
}
function adjFree(x, y) {
  return [[x, y + 1], [x + 1, y], [x - 1, y], [x, y - 1]].filter(([tx, ty]) => walk(tx, ty) && !occ[ty][tx]);
}
function placeObj(type, x, y, fixed) {
  const d = OT[type];
  const o = { id: OID++, type, x, y, w: d.w, h: d.h, fixed: !!fixed, slots: [], staffSpot: null, bartender: null, uses: 0 };
  if (d.slots === 'adj') o.slots = adjFree(x, y).map(([tx, ty]) => ({ x: tx, y: ty, user: null }));
  else if (Array.isArray(d.slots)) o.slots = d.slots.map(s => ({ x: x + s[0], y: y + s[1], user: null }));
  else if (d.enter || d.onTop) o.slots = objTiles(o).map(([tx, ty]) => ({ x: tx, y: ty, user: null }));
  if (d.staff) o.staffSpot = { x: x + d.staff[0], y: y + d.staff[1] };
  for (const [tx, ty] of objTiles(o)) { occ[ty][tx] = o; if (d.block) blocked[ty][tx] = true; }
  G.objects.push(o);
  rebuildSlotSet();
  markStaticDirty();
  return o;
}
function removeObj(o) {
  for (const [tx, ty] of objTiles(o)) { if (occ[ty][tx] === o) { occ[ty][tx] = null; blocked[ty][tx] = false; } }
  for (const p of G.people) {
    if (p.useObj === o || p.queueObj === o) { if (p.hidden || p.onCastle) stepOut(p); interrupt(p); }
    if (p.postObj === o) { p.postObj = null; if (p.state === 'atpost') p.state = 'idle'; }
  }
  G.objects.splice(G.objects.indexOf(o), 1);
  if (G.sel === o) G.sel = null;
  rebuildSlotSet();
  markStaticDirty();
}
function barOpen(o) {
  const b = o.bartender;
  return !!(b && b.present && b.state === 'atpost' && b.postObj === o && G.powerOut <= 0);
}
function hasUse(use) {
  return G.objects.some(o => OT[o.type].use === use && (use !== 'drink' || barOpen(o)) && (use !== 'cake' || (G.cakeCut && G.cakeSlices > 0)));
}
function nearObj(p, type, r) { return G.objects.some(o => o.type === type && dist(o.x + o.w / 2, o.y + o.h / 2, p.x, p.y) < r); }
function countObj(type) { return G.objects.filter(o => o.type === type).length; }

// ---------- people ----------
function mkPerson(kind, role, name, look) {
  return {
    id: PID++, kind, role, name, look, x: 6.5, y: 23.5, path: [], spd: 1.4, state: 'off', timer: 0, onTimer: null, onArrive: null,
    needs: { thirst: rnd(5, 25), hunger: rnd(10, 30), bladder: rnd(0, 20), fun: rnd(0, 15) },
    drunk: 0, happy: rnd(68, 82), thought: null, thoughtT: 0, hidden: false, sitting: false, present: false, moving: false,
    trait: null, lowT: 0, seatC: null, seatD: null, useObj: null, useSlot: null, course: 0, eating: 0, serveClaim: null,
    needServe: false, waitServe: 0, plate: false, lastServed: -99, queueT: 0, carry: null, job: null, chatWith: null,
    fight: null, cutOff: false, idleT: 0, walkT: 0, hyper: 0, postObj: null,
  };
}
function guests() { return G.people.filter(p => p.present && p.kind === 'guest' && !p.rival); }
function staffOf(role) { return G.people.filter(p => p.kind === 'staff' && p.role === role && !p.fired); }
function randGuest(f) { const a = guests().filter(p => !p.hidden && (!f || f(p))); return a.length ? pick(a) : null; }
function alcoholOK(p) { return !p.look.kid && p.trait !== 'teetotal' && !p.cutOff; }
function think(p, icon, dur) { p.thought = icon; p.thoughtT = dur || 5; }

function goTo(p, tx, ty, cb, opts) {
  const sx = Math.floor(p.x), sy = Math.floor(p.y);
  let path = findPath(sx, sy, tx, ty);
  if (!path) return false;
  if (opts && opts.stopShort && path.length > 1) path.pop();
  else if (opts && opts.stopShort && path.length === 1 && !(sx === tx && sy === ty)) path = [];
  p.path = path; p.onArrive = cb || null; p.walkT = 0;
  if (!path.length) { p.onArrive = null; if (cb) cb(p); }
  return true;
}
function wander(p, zone) {
  const z = zoneTile(zone);
  if (!z) { p.state = 'idle'; p.idleT = 2; return false; }
  p.state = 'walk';
  const ok = goTo(p, z.x, z.y, (q) => { q.state = 'idle'; q.idleT = rnd(2, 6); });
  if (!ok) { p.state = 'idle'; p.idleT = 2; }
  return ok;
}
function stepOut(p) {
  const fx = Math.floor(p.x), fy = Math.floor(p.y);
  for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1], [0, 2], [2, 0], [-2, 0], [0, -2]]) {
    if (walk(fx + dx, fy + dy)) { p.x = fx + dx + 0.5; p.y = fy + dy + 0.5; break; }
  }
  p.hidden = false; p.onCastle = false;
}
function releaseUse(p) {
  if (p.useSlot && p.useSlot.user === p) p.useSlot.user = null;
  p.useObj = null; p.useSlot = null; p.hidden = false; p.onCastle = false;
}
function interrupt(p) {
  if (p.state === 'use' && (p.hidden || p.onCastle)) stepOut(p);
  releaseUse(p);
  if (p.chatWith) {
    const q = p.chatWith; p.chatWith = null;
    if (q.chatWith === p) { q.chatWith = null; if (q.state === 'chat') { q.state = 'idle'; q.idleT = 0; q.onTimer = null; q.timer = 0; } }
  }
  if (p.job) endJob(p);
  if (p.state === 'conga' && G.conga) G.conga.members = G.conga.members.filter(m => m !== p);
  p.path = []; p.onArrive = null; p.onTimer = null; p.timer = 0; p.sitting = false; p.queueObj = null;
  p.state = 'idle'; p.idleT = 0;
}

// ---------- using objects ----------
function findObj(p, use, filter) {
  let best = null, bd = 1e9, bq = null, bqd = 1e9;
  for (const o of G.objects) {
    const d = OT[o.type];
    if (d.use !== use) continue;
    if (filter && !filter(o)) continue;
    const dd = dist(p.x, p.y, o.x + o.w / 2, o.y + o.h / 2) + (isOutdoor(o.x, o.y) !== isOutdoor(Math.floor(p.x), Math.floor(p.y)) ? 4 : 0);
    const free = o.slots.find(s => !s.user);
    if (free) { if (dd < bd) { bd = dd; best = { o, s: free }; } }
    else if (dd < bqd) { bqd = dd; bq = o; }
  }
  if (best && (!bq || bd < bqd + 10)) return best;
  return bq ? { o: bq, s: null } : null;
}
function useObject(p, use, filter) {
  const r = findObj(p, use, filter);
  if (!r) return false;
  if (!r.s) {
    p.state = 'queue'; p.queueObj = r.o; p.queueUse = use; p.queueT = 0;
    const o = r.o;
    const near = zoneNear(o.x + o.w / 2, o.y + o.h / 2, 2);
    if (near) goTo(p, near.x, near.y, null);
    if (use === 'loo') think(p, 'wait', 6);
    return true;
  }
  const s = r.s;
  s.user = p; p.useObj = r.o; p.useSlot = s; p.state = 'walk';
  if (!goTo(p, s.x, s.y, startUse)) { s.user = null; p.useObj = null; p.useSlot = null; p.state = 'idle'; return false; }
  return true;
}
function zoneNear(cx, cy, r) {
  for (let i = 0; i < 25; i++) {
    const x = Math.floor(cx + rnd(-r - 1, r + 1)), y = Math.floor(cy + rnd(-r - 1, r + 1));
    if (walk(x, y) && !occ[y][x] && !G.slotSet.has(x + ',' + y)) return { x, y };
  }
  return null;
}
function startUse(p) {
  const o = p.useObj;
  if (!o || !G.objects.includes(o)) { releaseUse(p); p.state = 'idle'; return; }
  const d = OT[o.type];
  if (d.use === 'drink' && !barOpen(o)) { releaseUse(p); p.state = 'idle'; p.idleT = 1; think(p, 'drink'); return; }
  if (d.use === 'cake' && !(G.cakeCut && G.cakeSlices > 0)) { releaseUse(p); p.state = 'idle'; return; }
  p.state = 'use'; p.timer = d.time;
  if (o.type === 'portaloo' || o.type === 'toilet' || o.type === 'booth') p.hidden = true;
  if (o.type === 'castle') { p.onCastle = true; p.x = p.useSlot.x + 0.5; p.y = p.useSlot.y + 0.5; }
  p.onTimer = finishUse;
}
function finishUse(p) {
  const o = p.useObj; if (!o) { p.state = 'idle'; return; }
  const d = OT[o.type], n = p.needs;
  o.uses++;
  switch (d.use) {
    case 'drink':
      n.thirst = Math.max(0, n.thirst - 55); n.bladder += 13; n.fun = Math.max(0, n.fun - 5);
      if (alcoholOK(p)) p.drunk += (p.trait === 'lightweight' || G.omens.has('lightweights') ? 17 : 11) * (p.drinkMult || 1);
      G.stats.drinks++;
      if (sponsorOn()) { p.happy += 3; }
      else if (G.barMode === 'free') { G.money -= 6; G.barSpend += 6; p.happy += 3; }
      else { G.money += 4; G.barTake += 4; p.happy -= 1.5; if (chance(0.15)) think(p, 'cash', 3); }
      if (G.money < 30 && G.barMode === 'free') { G.barMode = 'cash'; msg('Budget nearly gone! The bar has switched to a cash bar.', 'bad'); }
      if (chance(nearObj(p, 'bin', 4) ? 0.05 : 0.3)) G.litterQueue.push(p.id);
      p.drinkInHand = 8;
      break;
    case 'food':
      n.hunger = Math.max(0, n.hunger - 35); G.money -= d.price || 0;
      if (d.fun) { n.fun = Math.max(0, n.fun - d.fun); if (p.look.kid) p.hyper = 12; if (chance(0.12)) spawnMess('choc', p.x, p.y); }
      break;
    case 'loo': n.bladder = 0; p.happy += 3; break;
    case 'tea': n.thirst = Math.max(0, n.thirst - 40); n.bladder += 8; p.happy += p.russian ? 5 : 2; p.drunk = Math.max(0, p.drunk - 4); break;
    case 'fun':
      n.fun = Math.max(0, n.fun - d.fun); p.happy += 7;
      if (o.type === 'booth') { const s = iso(o.x + 0.5, o.y + 0.5); spawnP('flash', s.x, s.y - 14, { life: 0.4, max: 0.4 }); G.stats.photos++; }
      if (o.type === 'castle' && p.drunk > 55 && chance(0.12)) { G.sickAfterUse = p; }
      break;
    case 'cake':
      n.hunger = Math.max(0, n.hunger - 25); n.fun = Math.max(0, n.fun - 10); G.cakeSlices--; p.happy += 4; if (p.look.kid) p.hyper = 15;
      break;
  }
  const wasIn = p.hidden || p.onCastle;
  releaseUse(p);
  if (wasIn) stepOut(p);
  p.state = 'idle'; p.idleT = rnd(0, 2);
  if (G.sickAfterUse === p) { G.sickAfterUse = null; msg(p.name + ' bounced one time too many...', 'bad'); makeSick(p); }
  if (d.use === 'drink' && G.litterQueue.length && G.litterQueue[G.litterQueue.length - 1] === p.id) { G.litterQueue.pop(); p.dropLitter = rnd(3, 12); }
}
function seekDrink(p) {
  const teaFirst = !alcoholOK(p) || (p.russian && chance(0.25));
  if (teaFirst && hasUse('tea') && useObject(p, 'tea')) return true;
  if (hasUse('drink') && useObject(p, 'drink', o => barOpen(o))) return true;
  return hasUse('tea') && useObject(p, 'tea');
}
function seekFood(p) {
  if (G.cakeCut && G.cakeSlices > 0 && chance(0.5) && useObject(p, 'cake')) return true;
  return useObject(p, 'food');
}
function queueTick(p) {
  p.queueT++;
  const o = p.queueObj;
  if (!o || !G.objects.includes(o)) { p.state = 'idle'; p.idleT = 0; p.queueObj = null; return; }
  const free = o.slots.find(s => !s.user);
  if (free && (p.queueUse !== 'drink' || barOpen(o))) {
    free.user = p; p.useObj = o; p.useSlot = free; p.state = 'walk'; p.queueObj = null;
    if (!goTo(p, free.x, free.y, startUse)) { releaseUse(p); p.state = 'idle'; }
    return;
  }
  if (p.queueT % 3 === 0) { const r = findObj(p, p.queueUse, p.queueUse === 'drink' ? barOpen : null); if (r && r.s) { p.state = 'idle'; p.idleT = 0; p.queueObj = null; return; } }
  if (p.queueT > 18) { p.happy -= 8; think(p, 'angry'); p.state = 'idle'; p.idleT = 3; p.queueObj = null; complain(p.queueUse === 'loo' ? 'loo' : p.queueUse); }
}

// ---------- seating & activities ----------
function phaseMode() {
  switch (G.phase) {
    case 'seat': case 'ceremony': return 'ceremony';
    case 'dinner': case 'speeches': return 'dinner';
    case 'firstdance': return 'watchdance';
    case 'sendoff': return 'sendoff';
    default: return 'free';
  }
}
function danceOpen() { return G.phase === 'evening' || G.phase === 'party'; }
function goSeat(p, seat) {
  p.state = 'walk'; p.sitting = false;
  const sit = (q) => {
    q.face = seatFace(seat); q.flip = false; q.dir = q.face === 'b' ? 'up' : 'down';
    q.state = 'seated'; q.sitting = true; q.x = seat.x + 0.5; q.y = seat.y + 0.5;
    if (G.phase === 'dinner' && q.seatD === seat) {
      if (q.plate) { q.plate = false; q.eating = 12; }
      else if (q.course < 3 && q.eating <= 0 && !q.needServe) q.needServe = true;
    }
  };
  if (!goTo(p, seat.x, seat.y, sit)) { p.x = seat.x + 0.5; p.y = seat.y + 0.5; sit(p); }
}
function goWatch(p, zone) {
  const z = zoneTile(zone, zone === 'watch' ? (x, y) => !inDance(x, y) : null);
  if (!z) { wander(p, 'hall'); return; }
  p.state = 'walk';
  if (!goTo(p, z.x, z.y, (q) => { q.state = 'watch'; })) { p.state = 'idle'; p.idleT = 2; }
}
function goDance(p) {
  const t = zoneTile('dance');
  if (!t) return false;
  p.state = 'walk';
  return goTo(p, t.x, t.y, (q) => {
    q.state = 'dance'; q.timer = rnd(8, 20); q.danceSpeed = rnd(6, 11) + q.drunk / 20;
    q.onTimer = (r) => { r.state = 'idle'; r.idleT = rnd(1, 3); };
  });
}
function tryChat(p) {
  const c = G.people.filter(q => q !== p && q.present && q.kind === 'guest' && q.state === 'idle' && dist(p.x, p.y, q.x, q.y) < 5);
  if (!c.length) return false;
  const q = pick(c);
  q.state = 'chat'; q.chatWith = p; q.timer = 12; q.onTimer = endChat; q.path = [];
  p.state = 'walk'; p.chatWith = q;
  const ok = goTo(p, Math.floor(q.x), Math.floor(q.y), (r) => {
    if (q.chatWith !== r || q.state !== 'chat') { r.state = 'idle'; r.chatWith = null; return; }
    r.state = 'chat'; const d = rnd(5, 10); r.timer = d; q.timer = d; r.onTimer = endChat;
  }, { stopShort: true });
  if (!ok) { q.state = 'idle'; q.chatWith = null; q.onTimer = null; p.chatWith = null; p.state = 'idle'; return false; }
  return true;
}
function endChat(p) { p.state = 'idle'; p.chatWith = null; p.idleT = rnd(1, 4); }
function prefZone(p) {
  if (G.raining || G.time > 1260) return chance(0.08) && !G.raining ? 'lawn' : 'hall';
  if (G.phase === 'arrive' || G.phase === 'reception') return chance(0.75) ? 'lawn' : 'hall';
  return chance(0.25) ? 'lawn' : 'hall';
}

// ---------- guest brain ----------
function decideGuest(p) {
  const n = p.needs, mode = phaseMode();
  p.idleT = rnd(2, 5);
  if (n.bladder > (mode === 'free' ? 62 : 85)) { if (useObject(p, 'loo')) return; think(p, 'loo'); complain('loo'); }
  if (mode === 'ceremony' && p.seatC && !p.fobWalk) { goSeat(p, p.seatC); return; }
  if (mode === 'dinner' && p.seatD) { goSeat(p, p.seatD); return; }
  if (mode === 'watchdance') { goWatch(p, 'watch'); return; }
  if (mode === 'sendoff') { goWatch(p, 'lineup'); return; }
  if (mode !== 'free') { wander(p, mode === 'ceremony' ? 'lawn' : 'hall'); return; }
  if (G.raining && isOutdoor(Math.floor(p.x), Math.floor(p.y)) && !nearObj(p, 'parasol', 1.8)) { think(p, 'rain', 3); wander(p, 'hall'); return; }

  const thirsty = n.thirst > (danceOpen() ? 45 : 55), hungry = n.hunger > 55;
  if (thirsty && n.thirst >= n.hunger) { if (seekDrink(p)) return; think(p, 'drink'); complain('drink'); }
  if (hungry) { if (seekFood(p)) return; think(p, 'food'); complain('food'); }
  if (thirsty && n.thirst < n.hunger) { if (seekDrink(p)) return; think(p, 'drink'); complain('drink'); }
  if (n.fun > 30) {
    const opts = [];
    if (danceOpen()) opts.push(['dance', (p.trait === 'dancer' || p.trait === 'party') ? 6 : (p.trait === 'wallflower' ? 0.4 : 2.5) + p.drunk / 25 + (G.djOn ? 2 : -1.5)]);
    if (hasUse('fun')) opts.push(['fun', p.look.kid ? 5 : 1.3 + (p.drunk > 40 ? 1 : 0)]);
    opts.push(['chat', p.trait === 'gossip' ? 3 : 1.5]);
    if (hasUse('drink') && alcoholOK(p) && n.thirst > 15 && G.phase !== 'arrive') opts.push(['drink', (p.trait === 'party' ? 2.5 : 0.8) * (danceOpen() ? 3.5 : 1) * (G.barMode === 'free' ? 1.5 : 1)]);
    const c = weighted(opts);
    if (c === 'dance' && goDance(p)) return;
    if (c === 'fun' && useObject(p, 'fun')) return;
    if (c === 'drink' && seekDrink(p)) return;
    if (tryChat(p)) return;
    if (n.fun > 70) { think(p, 'bored'); complain('fun'); }
  }
  if (p.look.kid && chance(0.5)) { wander(p, prefZone(p)); return; }
  if (chance(0.5)) wander(p, prefZone(p));
}
function guestBrain(p) {
  const n = p.needs;
  if (p.thoughtT > 0) p.thoughtT--;
  if (p.drinkInHand > 0) p.drinkInHand--;
  if (p.dropLitter > 0) { p.dropLitter--; if (p.dropLitter <= 0 && !p.sitting && !p.hidden) spawnMess('litter', p.x, p.y); }
  if (p.hyper > 0) { p.hyper--; p.spd = p.hyper > 0 ? 2.6 : p.baseSpd; }
  if (p.queasy > 0) { p.queasy--; if (p.queasy <= 0 && !makeSick(p)) p.queasy = 1; }
  switch (p.state) {
    case 'idle':
      if (n.bladder > 80) p.idleT = 0;
      if ((p.idleT -= 1) > 0) return;
      decideGuest(p); return;
    case 'walk':
      p.walkT++; if (p.walkT > 45) interrupt(p); return;
    case 'queue': queueTick(p); return;
    case 'seated':
      if (phaseMode() === 'free') { p.sitting = false; p.state = 'idle'; p.idleT = 0; return; }
      if (n.bladder > 88 && !(G.phase === 'ceremony' && G.brideArrived && !G.kissed && chance(0.6))) {
        p.sitting = false;
        if (!useObject(p, 'loo')) { p.sitting = true; p.state = 'seated'; think(p, 'loo'); }
      }
      return;
    case 'watch':
      if (phaseMode() === 'free') { p.state = 'idle'; p.idleT = 0; }
      return;
    case 'dance':
      if (!danceOpen() && G.phase !== 'firstdance') { p.state = 'idle'; p.idleT = 0; p.onTimer = null; return; }
      if (chance(0.15)) { const nx = Math.floor(p.x) + ri(-1, 1), ny = Math.floor(p.y) + ri(-1, 1); if (inDance(nx, ny)) p.path = [[nx, ny]]; }
      return;
  }
}
function needsTick(p) {
  const n = p.needs;
  const tx = Math.floor(p.x), ty = Math.floor(p.y);
  const out = isOutdoor(tx, ty) && !p.hidden;
  const seated = p.state === 'seated', asleep = p.state === 'sleep';
  const shade = out && nearObj(p, 'parasol', 2);
  let heat = 1;
  if (out && !shade && G.time < 1150) { if (G.weather === 'Scorching') heat = 1.6; else if (G.weather === 'Sunny') heat = 1.25; }
  n.thirst += 0.3 * heat * (seated ? 0.6 : 1) * (p.trait === 'party' ? 1.2 : 1);
  n.hunger += 0.19 * (p.trait === 'foodie' ? 1.4 : 1) * (p.look.kid ? 1.2 : 1);
  n.bladder += 0.17 * (p.trait === 'bladder' ? 1.7 : 1);
  if (!asleep) n.fun += (seated ? (G.phase === 'speeches' ? 0.12 : 0.2) : 0.28) * (p.trait === 'party' ? 1.4 : 1) * (p.look.kid ? 1.3 : 1);
  if (p.state === 'dance') { n.fun -= G.djOn ? 3 : 1.2; n.thirst += 0.25; }
  if (p.state === 'chat') n.fun -= 1.3 * (p.trait === 'gossip' ? 1.6 : 1);
  if (p.state === 'conga') n.fun -= 3;
  if (p.state === 'watch' && (G.phase === 'firstdance' || G.phase === 'sendoff')) n.fun -= 1.5;
  if (seated && (G.phase === 'dinner' || G.phase === 'speeches')) { n.thirst = Math.max(0, n.thirst - 0.55); if (alcoholOK(p)) p.drunk += 0.12 * (p.drinkMult || 1); }
  eatTick(p);
  if (p.needServe) p.waitServe++;
  p.drunk = Math.max(0, p.drunk - 0.05);
  for (const k in n) n[k] = clamp(n[k], 0, 100);
  p.drunk = Math.min(100, p.drunk);
  if (n.bladder >= 100) accident(p);
}
function eatTick(p) {
  if (p.eating > 0) {
    p.eating--; p.needs.hunger = Math.max(0, p.needs.hunger - 3.5);
    if (p.eating <= 0) { p.course++; if (p.course < 3 && (G.phase === 'dinner' || G.phase === 'speeches')) p.needServe = true; }
  }
}
function moodTick(p) {
  const n = p.needs;
  let d = 0.12;
  for (const k of ['thirst', 'hunger', 'bladder', 'fun']) { const v = n[k]; if (v > 60) d -= (v - 60) / 40 * (k === 'fun' ? 0.45 : 0.6); }
  if (p.drunk > 15 && p.drunk < 70) d += 0.12;
  if (p.drunk > 85) d -= 0.15;
  if (p.state === 'dance') d += G.djOn ? 0.6 : 0.2;
  if (p.state === 'chat' || p.state === 'conga') d += 0.25;
  if (p.needServe && p.waitServe > 20) d -= 0.3;
  let mess = 0;
  for (const m of G.messes) if (Math.abs(m.x - p.x) < 2.5 && Math.abs(m.y - p.y) < 2.5) mess += m.type === 'vomit' ? 2 : 1;
  d -= Math.min(1.2, mess * 0.2);
  for (const f of G.fights) if (dist(f.x, f.y, p.x, p.y) < 5) d -= 0.6;
  let decor = 0;
  for (const o of G.objects) {
    if (o.type === 'plant' && dist(o.x + 0.5, o.y + 0.5, p.x, p.y) < 3) decor += 0.04;
    if (o.type === 'lights' && nightAlpha() > 0.2 && dist(o.x + 0.5, o.y + 0.5, p.x, p.y) < 4.5) decor += 0.15;
  }
  d += Math.min(0.35, decor);
  if (G.raining && isOutdoor(Math.floor(p.x), Math.floor(p.y)) && !p.hidden && !nearObj(p, 'parasol', 1.8)) d -= 0.5;
  for (const c of [G.groom, G.bride]) if (c.present && dist(c.x, c.y, p.x, p.y) < 3) d += p.trait === 'romantic' ? 0.35 : 0.12;
  for (const a of G.people) if (a.kind === 'animal' && a.present && dist(a.x, a.y, p.x, p.y) < 3) d += 0.15;
  if (p.trait === 'grumpy') d -= 0.07;
  for (const b of G.buffs) d += b.d;
  p.happy = clamp(p.happy + d, 0, 100);
  if (p.happy < 8 && p.state !== 'leave') { p.lowT++; if (p.lowT > 25) stormOff(p); } else p.lowT = 0;
}
function chaosTick(p) {
  if (!['idle', 'dance', 'chat', 'walk', 'watch'].includes(p.state) || p.hidden) return;
  const dr = p.drunk;
  if (dr > 66 && G.stats.vomits < 4 && chance((dr - 60) / 40 * 0.004)) { makeSick(p); return; }
  if (dr > 62 && chance(0.003 * (p.trait === 'fighter' ? 4 : 1))) {
    const foe = G.people.find(q => q !== p && q.present && q.kind === 'guest' && q.drunk > 42 && !q.fight && dist(q.x, q.y, p.x, p.y) < 3 && ['idle', 'dance', 'chat', 'walk'].includes(q.state));
    if (foe) { startFight(p, foe); return; }
  }
  if (dr > 76 && chance(0.004)) { interrupt(p); p.state = 'sleep'; p.timer = rnd(20, 40); p.onTimer = (q) => { q.state = 'idle'; q.drunk -= 20; }; msg(p.name + ' has fallen asleep in a corner.', ''); G.stats.sleepers++; return; }
  if (p.state === 'dance' && dr > 40 && chance(0.005)) {
    const tricks = p.russian ? ['is doing a Cossack squat-kick!', 'is shouting "OPA!" and stamping', 'is spinning a napkin over their head!'] : ['is doing the worm!', 'is breakdancing!', 'has taken their shoes off and is spinning!', 'is doing the splits!', 'is moonwalking across the floor!'];
    msg(p.name + ' ' + pick(tricks), 'good'); joy(8, true); moodNear(p, 3, 3);
    if (p.name.indexOf('Gran') >= 0) memory('Gran tore up the dance floor', 60);
  }
  if (p.state === 'dance' && p.drinkInHand > 0 && chance(0.03)) { spawnMess('spill', p.x, p.y); }
}

// ---------- staff brains ----------
function endJob(w) {
  const j = w.job;
  if (j) {
    if (j.gs) for (const g of j.gs) if (g.serveClaim === w) g.serveClaim = null;
    if (j.m && j.m.claim === w) j.m.claim = null;
    if (j.f && j.f.claim === w) j.f.claim = null;
  }
  w.job = null; w.cleaning = false;
  if (w.role === 'waiter') w.carry = null;
}
function staffIdleWander(w) {
  if ((w.idleT -= 1) > 0) return;
  w.idleT = rnd(3, 8);
  const z = (G.phase === 'arrive' || G.phase === 'reception') ? (G.raining ? 'hall' : 'lawn') : 'hall';
  wander(w, z);
  w.state = 'walk';
}
function waiterBrain(w) {
  if (w.state !== 'idle') { if (w.state === 'walk') { w.walkT++; if (w.walkT > 50) { interrupt(w); } } return; }
  if (G.phase === 'dinner' || G.phase === 'speeches') { if (waiterDinner(w)) return; }
  w.carry = ['arrive', 'reception', 'evening', 'party'].includes(G.phase) ? 'tray' : null;
  const m = nearestMess(w, ['litter'], 9);
  if (m && chance(0.6)) { cleanJob(w, m, 1); return; }
  if (w.carry === 'tray' && waiterTray(w)) return;
  staffIdleWander(w);
}
function waiterDinner(w) {
  let best = null, bw = -1;
  for (const g of G.people) if (g.present && g.needServe && !g.serveClaim && g.seatD) { if (g.waitServe > bw) { bw = g.waitServe; best = g; } }
  if (!best || !G.kitchen) return false;
  const batch = [best];
  const near = G.people.filter(g => g !== best && g.present && g.needServe && !g.serveClaim && g.seatD && dist(g.seatD.x, g.seatD.y, best.seatD.x, best.seatD.y) < 4.5)
    .sort((a, b) => dist(a.seatD.x, a.seatD.y, best.seatD.x, best.seatD.y) - dist(b.seatD.x, b.seatD.y, best.seatD.x, best.seatD.y));
  batch.push(...near.slice(0, 3));
  for (const g of batch) g.serveClaim = w;
  w.job = { type: 'serve', gs: batch };
  const spot = pick(G.kitchen.slots);
  w.state = 'walk'; w.carry = null;
  const ok = goTo(w, spot.x, spot.y, () => {
    w.state = 'work'; w.timer = G.omens.has('kitchen') ? 3 : 1;
    w.onTimer = () => { w.carry = 'plate'; serveNext(w); };
  });
  if (!ok) { endJob(w); return false; }
  return true;
}
function serveNext(w) {
  const j = w.job;
  if (!j || !j.gs) { endJob(w); w.state = 'idle'; return; }
  while (j.gs.length && (!j.gs[0].present || !j.gs[0].needServe)) { const g = j.gs.shift(); if (g.serveClaim === w) g.serveClaim = null; }
  if (!j.gs.length) { endJob(w); w.state = 'idle'; w.idleT = 0; return; }
  const g = j.gs[0];
  w.state = 'walk';
  const ok = goTo(w, g.seatD.x, g.seatD.y, () => { serveCourse(g); j.gs.shift(); serveNext(w); }, { stopShort: true });
  if (!ok) { j.gs.shift(); g.serveClaim = null; serveNext(w); }
}
function serveCourse(g) {
  g.needServe = false; g.serveClaim = null;
  if (g.state === 'seated' && g.sitting) { g.eating = 12; } else g.plate = true;
  g.happy = clamp(g.happy + (g.waitServe < 10 ? 6 : 2), 0, 100);
  g.waitServe = 0; G.stats.meals++;
}
function waiterTray(w) {
  const drinks = G.phase === 'arrive' || G.phase === 'reception';
  let best = null, bs = 40;
  for (const g of G.people) {
    if (!g.present || g.kind !== 'guest' || g.hidden) continue;
    if (!['idle', 'chat', 'queue', 'watch'].includes(g.state)) continue;
    if (G.time - g.lastServed < 15) continue;
    const d = dist(w.x, w.y, g.x, g.y); if (d > 9) continue;
    const need = Math.max(drinks ? g.needs.thirst : 0, g.needs.hunger) - d * 2;
    if (need > bs) { bs = need; best = g; }
  }
  if (!best) return false;
  best.lastServed = G.time;
  w.state = 'walk';
  return goTo(w, Math.floor(best.x), Math.floor(best.y), () => {
    if (best.present && dist(w.x, w.y, best.x, best.y) < 2.5) {
      const n = best.needs;
      if (drinks && n.thirst >= n.hunger) { n.thirst = Math.max(0, n.thirst - 35); if (alcoholOK(best)) best.drunk += 5; n.bladder += 8; best.drinkInHand = 6; }
      else { n.hunger = Math.max(0, n.hunger - 30); G.money -= 1; }
      best.happy = clamp(best.happy + 3, 0, 100); think(best, 'heart', 3);
    }
    w.state = 'idle'; w.idleT = 1;
  }, { stopShort: true }) || (w.state = 'idle', false);
}
function nearestMess(p, types, maxD) {
  let best = null, bd = maxD || 1e9;
  for (const m of G.messes) {
    if (m.claim && m.claim !== p) continue;
    if (types && !types.includes(m.type)) continue;
    if (m.unreach > G.time) continue;
    const d = dist(p.x, p.y, m.x, m.y) * (m.priority ? 0.2 : 1);
    if (d < bd) { bd = d; best = m; }
  }
  return best;
}
function cleanJob(c, m, dur) {
  m.claim = c; c.job = { type: 'clean', m }; c.state = 'walk';
  const ok = goTo(c, Math.floor(m.x), Math.floor(m.y), () => {
    c.state = 'work'; c.cleaning = true; c.timer = dur;
    c.onTimer = () => { removeMess(m); endJob(c); c.state = 'idle'; c.idleT = 0; };
  }, blocked[Math.floor(m.y)][Math.floor(m.x)] ? { stopShort: true } : null);
  if (!ok) { m.claim = null; m.unreach = G.time + 30; c.job = null; c.state = 'idle'; c.idleT = 2; }
}
function cleanerBrain(c) {
  if (c.state !== 'idle') { if (c.state === 'walk') { c.walkT++; if (c.walkT > 50) interrupt(c); } return; }
  const m = nearestMess(c);
  if (m) { cleanJob(c, m, 1.5); return; }
  staffIdleWander(c);
}
function bartenderBrain(b) {
  if (b.state === 'atpost') {
    if (!b.postObj || !G.objects.includes(b.postObj) || b.postObj.bartender !== b) { b.state = 'idle'; b.postObj = null; }
    return;
  }
  if (b.state !== 'idle') { if (b.state === 'walk') { b.walkT++; if (b.walkT > 50) interrupt(b); } return; }
  let bar = b.postObj && G.objects.includes(b.postObj) ? b.postObj : null;
  if (!bar) {
    let bd = 1e9;
    for (const o of G.objects) {
      if (o.type !== 'bar') continue;
      if (o.bartender && o.bartender !== b && o.bartender.present && !o.bartender.fired) continue;
      const d = dist(b.x, b.y, o.x, o.y); if (d < bd) { bd = d; bar = o; }
    }
  }
  if (!bar) { staffIdleWander(b); if (countObj('bar') === 0) hint('nobar2', 'Your Bartender has no Bar to work at! Furnish a Bar.', 60); return; }
  bar.bartender = b; b.postObj = bar; b.state = 'walk';
  const sp = bar.staffSpot;
  if (!goTo(b, sp.x, sp.y, () => { b.state = 'atpost'; b.x = sp.x + 0.5; b.y = sp.y + 0.5; })) { b.state = 'idle'; b.idleT = 3; }
}
function djBrain(d) {
  if (d.state === 'atpost') return;
  if (d.state !== 'idle') { if (d.state === 'walk') { d.walkT++; if (d.walkT > 50) interrupt(d); } return; }
  const sp = G.djBooth.staffSpot;
  d.state = 'walk'; d.postObj = G.djBooth;
  if (!goTo(d, sp.x, sp.y, () => { d.state = 'atpost'; d.x = sp.x + 0.5; d.y = sp.y + 0.5; })) { d.state = 'idle'; d.idleT = 3; }
}
function bouncerBrain(b) {
  if (b.state !== 'idle') { if (b.state === 'walk') { b.walkT++; if (b.walkT > 50) interrupt(b); } return; }
  const f = G.fights.find(f => !f.claim);
  if (f) {
    f.claim = b; b.job = { type: 'fight', f }; b.state = 'walk';
    const ok = goTo(b, Math.floor(f.x), Math.floor(f.y), () => {
      b.state = 'work'; b.timer = 1;
      b.onTimer = () => { if (G.fights.includes(f)) resolveFight(f, true); b.job = null; b.state = 'idle'; b.idleT = 0; };
    }, { stopShort: true });
    if (!ok) { f.claim = null; b.job = null; b.state = 'idle'; b.idleT = 2; }
    return;
  }
  const e = G.people.find(p => p.present && (p.escort || p.rival) && !p.escortClaim && p.state !== 'leave');
  if (e) {
    e.escortClaim = b; b.state = 'walk';
    const ok = goTo(b, Math.floor(e.x), Math.floor(e.y), () => {
      if (e.present && e.state !== 'leave') { interrupt(e); leave(e, 'taxi'); msg('The bouncer has poured ' + e.name + ' into a taxi.', ''); }
      b.state = 'idle'; b.idleT = 0;
    }, { stopShort: true });
    if (!ok) { e.escortClaim = null; b.state = 'idle'; b.idleT = 2; }
    return;
  }
  const a = G.people.find(q => q.kind === 'animal' && q.present && q.role === 'goat' && (!q.friendly || q.cakeRun) && !q.leaving && !q.claim);
  if (a) {
    a.claim = b; b.state = 'walk';
    const ok = goTo(b, Math.floor(a.x), Math.floor(a.y), () => {
      if (a.present && dist(a.x, a.y, b.x, b.y) < 3) { a.leaving = true; msg('The bouncer is chasing the goat out!', 'good'); joy(10, true); }
      else a.claim = null;
      b.state = 'idle'; b.idleT = 0;
    }, { stopShort: true });
    if (!ok) { a.claim = null; b.state = 'idle'; }
    return;
  }
  staffIdleWander(b);
}
function staffBrain(s) {
  if (!s.present) return;
  switch (s.role) {
    case 'waiter': waiterBrain(s); break;
    case 'cleaner': cleanerBrain(s); break;
    case 'bartender': bartenderBrain(s); break;
    case 'bouncer': bouncerBrain(s); break;
    case 'dj': djBrain(s); break;
  }
}

// ---------- animals ----------
function spawnAnimal(role, friendly) {
  const names = { goat: 'The Goat', cat: 'Venue Cat', rat: 'A Rat', dog: 'Barnie' };
  const a = mkPerson('animal', role, names[role] || role, {});
  a.present = true; a.state = 'idle'; a.friendly = !!friendly; a.spd = role === 'cat' ? 1.2 : role === 'rat' ? 3.2 : 1.1;
  a.x = 6.5; a.y = 22.5; a.spawnT = G.time;
  G.people.push(a);
  return a;
}
const CAKE_SPOT = { x: 26, y: 3 };
function goatCakeLimit(a) { return a.friendly ? 150 : 80; }
function animalBrain(a) {
  if (a.leaving) {
    if (a.state !== 'leave') { interrupt(a); a.state = 'leave'; a.spd = a.role === 'rat' ? 3.6 : 2.4; if (!goTo(a, GATE.x, GATE.y, (q) => { q.present = false; q.gone = true; })) { a.present = false; a.gone = true; } }
    return;
  }
  a.munch = false;
  if (a.role === 'rat') { ratBrain(a); return; }
  if (a.role === 'dog') {
    if (a.aisle) return; // walking down the aisle (dogAisleWalk)
    if (['dinner', 'speeches', 'evening', 'firstdance', 'party', 'sendoff', 'end'].includes(G.phase)) { a.leaving = true; msg(a.name + ' has been taken home for his dinner. Bye, ' + a.name + '!', 'good'); return; }
    if (a.poopAt && G.time >= a.poopAt && !a.moving) {
      a.poopAt = 0;
      if (!staffOf('cleaner').some(c => c.present)) { spawnMess('poop', a.x, a.y); a.munch = true; crowdReact('angry', 0.2); msg(a.name + ' has done a massive poo! If only someone had hired a Cleaner...', 'bad'); }
    }
    if (a.state === 'walk') { a.walkT++; if (a.walkT > 40) interrupt(a); return; }
    if ((a.idleT -= 1) <= 0) {
      a.idleT = rnd(1, 4);
      const g = chance(0.6) ? randGuest(q => !q.sitting) : null; // trot over to someone for a fuss
      if (g && goTo(a, Math.floor(g.x), Math.floor(g.y) + 1, (q) => { q.state = 'idle'; if (g.present) think(g, 'heart', 3); })) a.state = 'walk', a.walkT = 0;
      else wander(a, pick(['lawn', 'lawn', 'garden', 'hall']));
    }
    return;
  }
  if (a.role === 'goat') {
    const age = G.time - a.spawnT, lim = goatCakeLimit(a);
    if (!G.cakeEaten && !a.cakeRun) {
      if (age > lim - 25 && !a.warned) { a.warned = true; msg('The goat is eyeing up the wedding cake...', 'bad'); hint('goatcake', 'That goat is after the cake! Get a Bouncer to chase it off - quick!', 20); }
      if (age > lim) { a.cakeRun = true; interrupt(a); msg('THE GOAT IS GOING FOR THE CAKE!', 'bad'); SFX.bad(); }
    }
    if (a.cakeRun && !G.cakeEaten) {
      if (a.state !== 'walk') {
        a.state = 'walk'; a.spd = 1.6;
        if (!goTo(a, CAKE_SPOT.x, CAKE_SPOT.y, eatCake)) { a.cakeRun = false; a.state = 'idle'; }
      }
      return;
    }
    if (a.state === 'walk') { a.walkT++; if (a.walkT > 40) interrupt(a); return; }
    const pl = G.objects.find(o => o.type === 'plant' && dist(o.x + 0.5, o.y + 0.5, a.x, a.y) < 1.8);
    if (pl && chance(0.2)) { removeObj(pl); msg('The goat has eaten a flower pot. Pot and all.', 'bad'); a.munch = true; }
    const g = G.people.find(q => q.kind === 'guest' && q.present && !q.hidden && dist(q.x, q.y, a.x, a.y) < 1.5 && ['idle', 'chat', 'walk', 'dance'].includes(q.state));
    if (g && chance(0.05)) { fall(g); msg('The goat headbutted ' + g.name + '!', 'bad'); memory('Headbutted by a goat', 40); }
  } else if (a.state === 'walk') { a.walkT++; if (a.walkT > 40) interrupt(a); return; }
  if ((a.idleT -= 1) <= 0) { a.idleT = rnd(1, 5); wander(a, a.role === 'cat' ? pick(['hall', 'hall', 'lawn']) : pick(['lawn', 'garden', 'hall'])); }
}
function eatCake(a) {
  if (G.cakeEaten || !a.present) return;
  a.state = 'idle'; a.munch = true;
  G.cakeEaten = true; G.cakeSlices = 0; G.cakeCut = true;
  spawnMess('crumbs', 26.5, 3.5); spawnMess('cake', 25.5, 3.2);
  bliss(-25); joy(-100);
  G.shake = 0.8; SFX.disaster();
  msg('DISASTER! The goat has eaten the WEDDING CAKE!', 'bad');
  msg(G.bName + ' is in tears. ' + G.gName + ' is chasing the goat round the hall.', 'bad');
  moodAll(-10);
  crowdReact('angry', 0.5);
  a.cakeRun = false;
  later(4, () => { a.leaving = true; });
}
// rats come out when the mess gets out of hand
function ratCheck() {
  const cleaners = staffOf('cleaner').filter(c => c.present).length;
  const old = G.messes.filter(m => G.time - m.t > 18);
  const rats = G.people.filter(a => a.role === 'rat' && a.present && !a.dead).length;
  if (old.length >= 2 && G.messes.length > cleaners * 3 + 2 && rats < 3 && G.time - (G.lastRat || 0) > 12 && chance(Math.min(0.12, 0.03 + 0.01 * old.length))) {
    G.lastRat = G.time;
    const m = pick(old);
    spawnRat(m.x, m.y);
  }
}
function spawnRat(x, y) {
  const a = spawnAnimal('rat', false);
  a.x = x; a.y = y; a.idleT = 0;
  G.stats.ratsSeen = (G.stats.ratsSeen || 0) + 1;
  msg('A RAT has crawled out of the mess! ' + (typeof IS_TOUCH !== 'undefined' && IS_TOUCH ? 'Tap' : 'Click') + ' it to shoot it!', 'bad');
  if (G.stats.ratsSeen === 1) hint('rats', 'RATS! Shoot them before they ruin everything, and hire more Cleaners!', 10);
  SFX.squeak();
  moodNear(a, 4, -6);
}
function ratBrain(a) {
  if (G.time - a.spawnT > 18) {
    a.leaving = true; joy(-25, true); bliss(-3, true);
    msg('A rat got away... and it told its friends.', 'bad');
    return;
  }
  for (const q of G.people) {
    if (q.kind !== 'guest' || !q.present || q.hidden || dist(q.x, q.y, a.x, a.y) > 2.5) continue;
    q.happy = clamp(q.happy - 3, 0, 100); think(q, 'rat', 3);
    if (chance(0.15) && ['idle', 'chat'].includes(q.state)) { interrupt(q); wander(q, 'hall'); }
  }
  for (const c of [G.groom, G.bride]) if (c.present && dist(c.x, c.y, a.x, a.y) < 3) bliss(-1, true);
  // scurry somewhere nearby
  if (a.state !== 'walk' || !a.path.length) {
    const fx = Math.floor(a.x), fy = Math.floor(a.y);
    for (let i = 0; i < 10; i++) {
      const x = fx + ri(-4, 4), y = fy + ri(-4, 4);
      if (walk(x, y)) { a.state = 'walk'; goTo(a, x, y, (q) => { q.state = 'idle'; }); break; }
    }
  }
}
function shootRat(a) {
  if (a.dead) return;
  a.dead = true; a.present = false; a.gone = true;
  const s = iso(a.x, a.y);
  for (let i = 0; i < 8; i++) spawnP('poof', s.x + rnd(-4, 4), s.y - 3 + rnd(-3, 2), { life: 0.5, max: 0.5, vx: rnd(-10, 10), vy: rnd(-12, 0) });
  for (let i = 0; i < 5; i++) spawnP('star', s.x + rnd(-5, 5), s.y - 6 + rnd(-4, 2), { life: 0.6, max: 0.6, vx: rnd(-20, 20), vy: rnd(-20, -5) });
  spawnP('text', s.x, s.y - 14, { text: 'GOTCHA!', col: '#ffe040', vy: -14, life: 1.2, max: 1.2 });
  SFX.shot(); joy(15, true);
  G.stats.rats = (G.stats.rats || 0) + 1;
  if (G.stats.rats === 3) memory('Rat sharpshooter', 40);
  if (G.stats.rats === 6) memory('Pied Piper of the wedding', 60);
}
function sponsorOn() { return !!(G && G.sponsorUntil && G.time < G.sponsorUntil); }
const DEFAULT_STAFF_NAMES = {
  waiter: ['Pierre', 'Jules', 'Marco', 'Ellie', 'Tasha', 'Hugo', 'Nina'],
  bartender: ['Shane', 'Zoe', 'Luca', 'Bex', 'Dev', 'Mia'],
  cleaner: ['Mrs Mopp', 'Brian', 'Doreen', 'Stan', 'Pat'],
  bouncer: ['Big Steve', 'Tiny', 'Tank', 'Big Sue', 'Moose'],
  dj: ['DJ Spinz', 'DJ Dave', 'MC Brenda', 'DJ Kev-Lar'],
};
function staffNames(role) {
  const L = window.GUEST_LIST && window.GUEST_LIST.staff && window.GUEST_LIST.staff[role];
  return (Array.isArray(L) && L.length) ? L : DEFAULT_STAFF_NAMES[role];
}
function seatFace(seat) {
  if (!seat || !seat.obj) return 'f';
  if (seat.obj.type === 'chair') return 'b';
  const below = inBounds(seat.x, seat.y + 1) ? occ[seat.y + 1][seat.x] : null;
  return below && (below.type === 'table' || below.type === 'ttable') ? 'f' : 'b';
}

// ---------- chaos helpers ----------
function spawnMess(type, x, y) {
  if (G.messes.length > 70) return;
  const tx = Math.floor(x), ty = Math.floor(y);
  if (!inBounds(tx, ty) || !isFloorT(map[ty][tx])) return;
  G.messes.push({ id: MID++, type, x: tx + 0.5 + rnd(-0.15, 0.15), y: ty + 0.5 + rnd(-0.15, 0.15), claim: null, t: G.time, priority: false });
}
function removeMess(m) { const i = G.messes.indexOf(m); if (i >= 0) G.messes.splice(i, 1); G.stats.cleaned++; }
function messNear(type, cx, cy, n, r) {
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 10; k++) {
      const x = Math.floor(cx + rnd(-r, r)), y = Math.floor(cy + rnd(-r, r));
      if (walk(x, y)) { spawnMess(type, x + 0.5, y + 0.5); break; }
    }
  }
}
function vomit(p) {
  spawnMess('vomit', p.x, p.y); SFX.sick(); p.drunk = Math.max(0, p.drunk - 25); p.happy -= 6; G.stats.vomits++;
  moodNear(p, 3, -3);
  if (G.time - (G.lastVomitMsg || -99) > 8) { G.lastVomitMsg = G.time; msg(p.name + ' has been sick' + (inDance(Math.floor(p.x), Math.floor(p.y)) ? ' on the dance floor!' : '!'), 'bad'); }
  if (G.stats.vomits === 1) memory(p.name + ' was sick first', 15);
  if (G.groom.present && dist(G.groom.x, G.groom.y, p.x, p.y) < 3) bliss(-2, true);
}
function makeSick(p, why) {
  if (!p.present || ['sick', 'leave', 'use', 'fight', 'sleep'].includes(p.state)) return false;
  interrupt(p);
  p.state = 'sick'; p.timer = 1.6; p.sitting = false;
  p.onTimer = (q) => { vomit(q); q.queasy = 0; q.state = 'idle'; q.idleT = 3; think(q, 'sick', 4); };
  if (why) msg(why, 'bad');
  return true;
}
function queasy(p, mins) { p.queasy = mins; think(p, 'sick', mins); }
function accident(p) {
  spawnMess('puddle', p.x, p.y); p.needs.bladder = 0; p.happy -= 25; G.stats.accidents++; joy(-10, true);
  msg(p.name + " couldn't find a loo in time...", 'bad'); complain('loo'); complain('loo');
}
function fall(p) {
  if (p.state === 'use' || p.state === 'seated' || p.state === 'leave') return;
  interrupt(p); p.state = 'fallen'; p.timer = 3; p.happy -= 8;
  p.onTimer = (q) => { q.state = 'idle'; q.idleT = 0; };
  moodNear(p, 4, 1.5);
  G.stats.falls++;
}
function moodNear(p, r, n) { for (const q of G.people) if (q !== p && q.kind === 'guest' && q.present && dist(q.x, q.y, p.x, p.y) < r) q.happy = clamp(q.happy + n, 0, 100); }
function startFight(a, b) {
  const f = { id: FID++, a, b, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, t: 0, claim: null };
  for (const p of [a, b]) { interrupt(p); p.state = 'fight'; p.fight = f; }
  G.fights.push(f); G.stats.fights++;
  msg(a.name + ' and ' + b.name + ' are FIGHTING!', 'bad'); SFX.bad();
  if (!staffOf('bouncer').length) hint('fight', 'A fight! A Bouncer would sort that out sharpish.', 30);
}
function fightTick(f) {
  f.t++;
  if (dist(G.groom.x, G.groom.y, f.x, f.y) < 6 || dist(G.bride.x, G.bride.y, f.x, f.y) < 6) bliss(-0.3, true);
  if (f.t % 3 === 0) spawnP('dust', iso(f.x, f.y).x + rnd(-8, 8), iso(f.x, f.y).y - rnd(0, 10), { life: 0.6, max: 0.6 });
  if (f.t > 15) resolveFight(f, false);
}
function resolveFight(f, byBouncer) {
  const i = G.fights.indexOf(f); if (i >= 0) G.fights.splice(i, 1);
  for (const p of [f.a, f.b]) { p.fight = null; p.drunk = Math.max(0, p.drunk - 15); p.state = 'idle'; p.idleT = 2; p.happy -= 5; }
  if (byBouncer) { msg('The bouncer broke up the fight. Handshakes all round.', 'good'); joy(15, true); }
  else {
    const loser = pick([f.a, f.b]);
    messNear('litter', f.x, f.y, 2, 1); spawnMess('spill', f.x, f.y);
    joy(-40, true); msg(loser.name + ' lost the fight and stormed off.', 'bad');
    leave(loser, 'angry'); G.stats.stormed++;
  }
}
function stormOff(p) {
  if (p.state === 'leave') return;
  interrupt(p); leave(p, 'angry'); G.stats.stormed++;
  joy(p.vip ? -120 : -60, true);
  bliss(p.vip ? -10 : -2, true);
  msg(p.name + ' has stormed off in a huff!', 'bad'); SFX.bad();
}
function leave(p, kind) {
  p.state = 'leave'; p.leaveKind = kind; p.sitting = false; p.escort = false;
  p.spd = p.baseSpd || p.spd;
  if (!goTo(p, GATE.x, GATE.y, (q) => { q.present = false; q.gone = true; if (G.sel === q) G.sel = null; })) { p.present = false; p.gone = true; }
}
function sendHome(p) {
  if (p.drunk > 70 && chance(0.6)) {
    p.escort = true; think(p, 'angry', 6);
    msg(p.name + ' refuses to go! ' + (staffOf('bouncer').length ? 'Bouncer on the way.' : 'You need a Bouncer.'), 'bad');
    return;
  }
  interrupt(p); leave(p, 'taxi'); G.stats.taxis++;
  msg(p.name + ' has been sent home in a taxi.', '');
}

// ---------- couple ----------
function coupleBrain(c) {
  if (!c.present) return;
  if (c.thoughtT > 0) c.thoughtT--;
  eatTick(c);
  if (['walk', 'script', 'use', 'altar', 'cakewait', 'fdwait', 'sowait', 'gone'].includes(c.state)) {
    if (c.state === 'walk') { c.walkT++; if (c.walkT > 50) interrupt(c); }
    return;
  }
  switch (G.phase) {
    case 'setup': case 'arrive': case 'seat': case 'ceremony':
      if (c.role === 'groom') { c.state = 'walk'; if (!goTo(c, 5, 2, (q) => { q.state = 'altar'; q.x = 5.5; q.y = 2.5; })) c.state = 'idle'; }
      return;
    case 'dinner': case 'speeches':
      if (c.state !== 'seated') goSeat(c, c.seatD);
      return;
    case 'reception':
      if (c.state === 'idle' && (c.idleT -= 1) <= 0) wander(c, G.raining ? 'hall' : 'lawn');
      return;
    case 'evening': case 'party':
      if (c.state === 'dance') return;
      if (c.state === 'idle' && (c.idleT -= 1) <= 0) {
        if (danceOpen() && chance(G.djOn ? 0.6 : 0.3) && goDance(c)) return;
        wander(c, 'hall');
      }
      return;
  }
}
function coupleTo(c, x, y, ox, oy, st) {
  interrupt(c); c.state = 'walk';
  const done = (q) => { q.state = st; q.x = x + ox; q.y = y + oy; };
  if (!goTo(c, x, y, done)) { c.x = x + ox; c.y = y + oy; c.state = st; }
}

// ---------- events helpers ----------
function joy(n, quiet) { G.joy += n; if (!quiet && !G.inChoice && n) toast((n > 0 ? '+' : '') + Math.round(n) + ' Joy', n > 0 ? 'good' : 'bad'); }
function bliss(n, quiet) { G.bliss = clamp(G.bliss + n, 0, 100); if (!quiet && !G.inChoice && n) toast((n > 0 ? '+' : '') + n + ' Bliss', n > 0 ? 'pink' : 'bad'); }
function cash(n) { G.money += n; if (n && !G.inChoice) toast((n > 0 ? '+' : '') + fmtMoney(n), 'money'); }
function moodAll(n, f) { for (const p of guests()) if (!f || f(p)) p.happy = clamp(p.happy + n, 0, 100); }
function funAll(n) { for (const p of guests()) p.needs.fun = clamp(p.needs.fun + n, 0, 100); }
function memory(text, pts) {
  if (G.memories.some(m => m.text === text)) return;
  G.memories.push({ text, pts, time: G.time }); G.joy += pts;
  msg('★ MEMORY: ' + text + ' (+' + pts + ')', 'gold'); SFX.memory();
}
function addBuff(id, name, mins, d) {
  G.buffs = G.buffs.filter(b => b.id !== id);
  G.buffs.push({ id, name, until: G.time + mins, d });
}
function later(mins, f) { G.later.push({ t: G.time + mins, f }); }
function crowdReact(icon, frac) { for (const p of guests()) if (!p.hidden && p.state !== 'sleep' && chance(frac)) think(p, icon, 4); }
function complain(type) { G.complaints[type] = (G.complaints[type] || 0) + 1; }
function hint(key, text, every) {
  const l = G.hints[key];
  if (l !== undefined && G.time - l < (every || 90)) return;
  G.hints[key] = G.time; msg('PLANNER: ' + text, 'hint');
}
function spawnP(type, x, y, o) { if (G.parts.length > 900) return; G.parts.push(Object.assign({ type, x, y, vx: 0, vy: 0, life: 1, max: 1, col: '#fff' }, o || {})); }
function confettiAt(px, py, n) {
  const s = iso(px, py);
  for (let i = 0; i < n; i++) { const l = rnd(1.4, 2.6); spawnP('conf', s.x + rnd(-8, 8), s.y - 20, { vx: rnd(-30, 30), vy: rnd(-60, -15), life: l, max: l, col: pick(CONF) }); }
}
function heartsAt(px, py, n) {
  const s = iso(px, py);
  for (let i = 0; i < n; i++) { const l = rnd(1.2, 2.2); spawnP('heart', s.x + rnd(-10, 10), s.y - 26 - rnd(0, 6), { vx: rnd(-6, 6), vy: rnd(-22, -12), life: l, max: l, col: pick(['#ff3a7a', '#ff8fb8', '#c2185b']) }); }
}
function fireworkAt(wx, wy) {
  spawnP('rocket', wx, WORLD_H * 0.7, { vy: -(WORLD_H * 0.7 - wy) / 1.0, life: 1, max: 1, burst: true, col: pick(CONF) });
}
function updateParts(dt) {
  for (let i = G.parts.length - 1; i >= 0; i--) {
    const q = G.parts[i];
    q.life -= dt;
    q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.type === 'conf') { q.vy += 50 * dt; q.vx *= 0.98; }
    if (q.type === 'spark') { q.vy += 30 * dt; q.vx *= 0.97; q.vy *= 0.97; }
    if (q.grav) q.vy += q.grav * dt;
    if (q.type === 'rocket' && q.life <= 0 && q.burst) {
      const col = pick(CONF);
      for (let k = 0; k < 34; k++) { const a = k / 34 * Math.PI * 2, sp = rnd(25, 55); spawnP('spark', q.x, q.y, { vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.6, max: 1.6, col: chance(0.3) ? '#ffffff' : col }); }
      SFX.boom();
    }
    if (q.life <= 0) G.parts.splice(i, 1);
  }
}
