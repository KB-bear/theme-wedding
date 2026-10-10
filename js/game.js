'use strict';
/* =========================================================
   THEME WEDDING — day setup, schedule, main update
   ========================================================= */
const PHASES = [
  { id: 'setup', t: 570, name: 'Setting Up' },
  { id: 'arrive', t: 600, name: 'Guests Arriving' },
  { id: 'seat', t: 650, name: 'Take Your Seats' },
  { id: 'ceremony', t: 665, name: 'The Ceremony' },
  { id: 'reception', t: 680, name: 'Drinks Reception' },
  { id: 'dinner', t: 810, name: 'Wedding Breakfast' },
  { id: 'speeches', t: 960, name: 'Speeches' },
  { id: 'evening', t: 1020, name: 'Cake & Evening Do' },
  { id: 'firstdance', t: 1140, name: 'First Dance' },
  { id: 'party', t: 1160, name: 'Party Time!' },
  { id: 'sendoff', t: 1405, name: 'Sparkler Send-off' },
  { id: 'end', t: 1440, name: 'The End' },
];
const OMENS = [
  { id: 'gerald', t: 'Uncle Gerald started on the prosecco at breakfast.', apply() { G.gerald.drunk = 55; } },
  { id: 'heat', t: 'Heatwave! Guests outdoors get thirsty fast.', apply() { G.weather = 'Scorching'; } },
  { id: 'kitchen', t: 'The kitchen is short-staffed. Dinner plates take longer.' },
  { id: 'notes', t: 'The Best Man has lost his speech notes. Risky jokes are riskier.' },
  { id: 'jess', t: 'Cousin Jess has bought a new ring light. It is very, very bright.', apply() { if (G.jess) G.jess.needs.fun = 70; } },
  { id: 'hen', t: "There's a hen do at the venue next door..." },
  { id: 'cat', t: 'The venue cat is wandering about. Guests love it.', apply() { const c = spawnAnimal('cat', true); c.x = 20.5; c.y = 12.5; } },
  { id: 'mob', t: 'The Mother of the Bride is inspecting everything. Mess upsets the couple.' },
  { id: 'gift', t: 'A rich great-aunt sent a cheque! +£500 budget.', apply() { G.money += 500; } },
  { id: 'goat', t: 'The farm next door has a very curious goat.', apply() { G.goatAt = ri(700, 1250); } },
  { id: 'djfav', t: 'The DJ owes the groom a favour. Half price DJ!' },
  { id: 'lightweights', t: "Half the guests haven't been out since lockdown. Lightweights!" },
];

// One twist per day changes the rules. Recently seen twists are avoided on replay.
const TWISTS = [
  { id: 'traffic', name: 'Registrar Stuck in Traffic', desc: 'The ceremony starts 30 minutes late. Guests will get restless (and thirsty) waiting.',
    apply() { for (const ph of G.phases) if (ph.id === 'seat' || ph.id === 'ceremony' || ph.id === 'reception') ph.t += 30; G.scripts.push({ t: 650, f() { msg('The registrar has rung: stuck behind a tractor. 30 minutes late!', 'bad'); } }); } },
  { id: 'prawns', name: 'Dodgy Prawns', desc: 'The prawn starter smelled... off. Expect several dodgy tummies this evening. Have loos and cleaners ready.',
    apply() { G.sickPlan.push(ri(1080, 1150), ri(1160, 1220), ri(1230, 1290)); G.scripts.push({ t: 1060, f() { msg('Rumour has it the prawns were "a bit warm". Uh oh.', 'bad'); } }); } },
  { id: 'celeb', name: 'Celebrity Guest', desc: 'A famous TV chef is coming to the evening do! Guests will be thrilled. The paparazzi might follow...',
    apply() { addCeleb(); G.scripts.push({ t: 1215, f() { if (G.celeb && G.celeb.present) queueEvent(evPaparazzi()); } }); } },
  { id: 'band', name: 'Live Ceilidh Band', desc: 'A live ceilidh band plays the evening instead of a DJ, for free! But they take a break every hour.',
    apply() { G.band = true; G.djHired = true; } },
  { id: 'storm', name: 'Thunderstorm Forecast', desc: 'A big storm is due this evening. The garden will be soaked for an hour and lightning may knock the power out.',
    apply() { G.weather = 'Showers'; G.rainSpells = [{ t: ri(720, 880), len: 15 }, { t: ri(1080, 1200), len: 60, storm: true }]; } },
  { id: 'kids', name: 'Kids Everywhere', desc: 'Six extra kids have been brought along. Sugar rushes guaranteed. A Bouncy Castle would be a lifesaver.',
    apply() { addExtraKids(6); } },
  { id: 'sponsor', name: "Dmitri's Treat", desc: 'Uncle Dmitri is paying for a FREE BAR until 20:00! Guests will drink a lot more...',
    apply() { G.sponsorUntil = 1200; G.scripts.push({ t: 1200, f() { msg("Dmitri's free bar is over. Back to normal prices!", ''); } }); } },
  { id: 'rival', name: 'Double-Booked!', desc: 'The venue double-booked. Guests from another wedding keep wandering in and helping themselves to your bar. Bouncers will show them out.',
    apply() { for (const t of [ri(720, 760), ri(1060, 1100), ri(1240, 1300)]) G.scripts.push({ t, f() { spawnRivals(3); } }); } },
  { id: 'influencer', name: 'Live-Streamed Wedding', desc: 'Cousin Jess is livestreaming the whole day to 200,000 followers. Give the internet a show... but keep it classy.',
    apply() { G.scripts.push({ t: ri(700, 790), f() { const e = evJessLive(); if (e) queueEvent(e); } }, { t: ri(860, 940), f() { const e = evJessFuse(); if (e) queueEvent(e); } }, { t: ri(1200, 1320), f() { const e = G.phase === 'party' && evJessViral(); if (e) queueEvent(e); } }); } },
  { id: 'flashmob', name: 'Secret Flash Mob', desc: 'The bridesmaids have planned a surprise flash mob for 20:00. Make sure there is music!',
    apply() { G.scripts.push({ t: 1200, f() { if (G.phase === 'party' || G.phase === 'evening') queueEvent(evFlashmob()); } }); } },
  { id: 'birthday', name: "Best Man's 30th", desc: "It's also the best man's 30th birthday! Do something for him... or he'll sulk.",
    apply() { G.scripts.push({ t: 1050, f() { queueEvent(evBirthday()); } }); } },
  { id: 'goats', name: 'Goat Escape', desc: 'The farm next door left the gate open. Expect goats. Plural. Guard that cake!',
    apply() { G.goatTimes = [ri(700, 800), ri(960, 1100)]; } },
  { id: 'heat', name: 'Record Heatwave', desc: 'Hottest day of the year! Outdoor guests get very thirsty. Parasols are a must.',
    apply() { G.weather = 'Scorching'; G.rainSpells = []; } },
  { id: 'magician', name: 'Close-up Magician', desc: 'A cousin hired a close-up magician for the drinks reception. Guests near him are amazed. Mostly.',
    apply() { G.magicianDay = true; } },
  { id: 'budget', name: 'Tight Budget', desc: 'The deposit bounced! You only have £4,000 today, but every £1 left over counts DOUBLE at the end.',
    apply() { G.money = 4000; G.moneyMult = 2; } },
  { id: 'inspector', name: 'The Wedding Critic', desc: 'A critic from Wedding Weekly is attending. A spotless venue (hardly any mess) at 17:00 earns a glowing review.',
    apply() { G.scripts.push({ t: 1015, f: inspection }); } },
];
function pickTwist() {
  const hist = store.get('tw_twists', []);
  let pool = TWISTS.filter(t => !hist.includes(t.id));
  if (!pool.length) pool = TWISTS.slice();
  const tw = pick(pool);
  store.set('tw_twists', [tw.id].concat(hist).slice(0, TWISTS.length - 4));
  return tw;
}
function recency(id) {
  const seen = store.get('tw_seen', {});
  const d = G.day - (seen[id] || -99);
  return d <= 1 ? 0.12 : d === 2 ? 0.35 : d === 3 ? 0.7 : 1;
}
function markSeen(id) { G.seenToday.push(id); }
function parseGuest(str) {
  if (!str || typeof str !== 'string') return null;
  let name = str.trim(), tags = [];
  const m = str.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
  if (m) {
    const t = m[2].toLowerCase().split(/[,\s]+/).filter(Boolean);
    if (t.some(x => ['m', 'f', 'old', 'kid', 'russian', 'male', 'female'].includes(x))) { name = m[1].trim(); tags = t; }
  }
  if (!name) return null;
  const sex = (tags.includes('f') || tags.includes('female')) ? 'f' : (tags.includes('m') || tags.includes('male')) ? 'm' : (chance(0.5) ? 'm' : 'f');
  return { name, sex, age: tags.includes('kid') ? 'kid' : tags.includes('old') ? 'old' : 'adult', russian: tags.includes('russian') };
}
function addCeleb() {
  const L = randLook('m', 'adult'); Object.assign(L, { top: '#f4f4f4', bottom: '#222', shirt: '#222', tie: null, shades: true, style: 'quiff', hair: '#2b1b10' });
  const p = mkPerson('guest', 'Celebrity Chef', 'TV Chef Rocco Bellini', L);
  p.celeb = true; p.evening = true; p.trait = 'party'; p.baseSpd = p.spd = 1.3; p.drinkMult = 1.2;
  G.celeb = p; G.people.push(p); G.arrivals.push({ t: 1100, p });
}
function addExtraKids(n) {
  for (let i = 0; i < n; i++) {
    const sex = chance(0.5) ? 'm' : 'f';
    const p = mkPerson('guest', 'Guest', 'Little ' + pick(sex === 'f' ? KIDS_F : KIDS_M), randLook(sex, 'kid'));
    p.baseSpd = p.spd = 1.7; p.drinkMult = 1; p.seatC = G.seatsC.find(s => !G.people.some(q => q.seatC === s)) || null;
    G.people.push(p); G.arrivals.push({ t: rnd(605, 645), p });
  }
}
function spawnRivals(n) {
  if (G.phase === 'sendoff' || G.phase === 'end') return;
  const names = ['Rival Guest Darren', 'Rival Guest Kerry', 'Rival Guest Tony', 'Rival Guest Leanne', 'Rival Guest Mick', 'Rival Guest Chantal'];
  for (let i = 0; i < n; i++) {
    const sex = chance(0.5) ? 'm' : 'f';
    const L = randLook(sex, 'adult'); L.top = sex === 'f' ? '#a87ad8' : '#5a3a8a'; if (sex === 'm') L.bottom = L.top;
    const p = mkPerson('guest', 'From the OTHER wedding', pick(names), L);
    p.rival = true; p.evening = true; p.trait = 'party'; p.baseSpd = p.spd = 1.4; p.drinkMult = 1.2;
    G.people.push(p); G.arrivals.push({ t: G.time + i * 0.6, p });
    later(55, () => { if (p.present && p.state !== 'leave') { interrupt(p); leave(p, 'done'); } });
  }
  msg('Guests from the OTHER wedding are wandering in again...', 'bad');
  if (!staffOf('bouncer').length) hint('rivals', 'Gatecrashers from the other wedding! A Bouncer will show them out.', 60);
}
function spawnMagician() {
  const L = { skin: pick(SKINS), hair: '#1a1a1a', style: 'short', top: '#1a1a1a', bottom: '#1a1a1a', shirt: '#ffffff', tie: '#c0283c', shoes: '#111', hat: null, sex: 'm', beard: true };
  const p = mkPerson('npc', 'magician', 'The Great Mysterio', L);
  p.present = true; p.state = 'idle'; p.x = 6.5; p.y = 22.5; p.spd = 1.2;
  G.magician = p; G.people.push(p);
  msg('The Great Mysterio the magician has arrived. Prepare to be amazed (mildly).', 'good');
}
function npcBrain(p) {
  if (p.role !== 'magician') return;
  if (G.phase !== 'reception') { if (p.state !== 'leave') { interrupt(p); leave(p, 'done'); } return; }
  if (p.state === 'walk') { p.walkT++; if (p.walkT > 40) interrupt(p); return; }
  if ((p.idleT -= 1) <= 0) { p.idleT = rnd(3, 7); wander(p, 'lawn'); }
  for (const q of guests()) if (dist(q.x, q.y, p.x, p.y) < 2.8) { q.needs.fun = Math.max(0, q.needs.fun - 2.5); q.happy = clamp(q.happy + 0.4, 0, 100); if (chance(0.03)) think(q, 'heart', 3); }
}
function inspection() {
  const n = G.messes.length;
  if (n <= 2) { joy(150, true); memory('Glowing review in Wedding Weekly', 80); msg('The critic is IMPRESSED. "Spotless!" Five stars in Wedding Weekly.', 'gold'); }
  else if (n <= 6) { joy(40, true); msg('The critic jots down "Pleasant, if a little sticky." Three stars.', ''); }
  else { joy(-80, true); bliss(-6, true); msg('The critic stepped in something. "A shambles." One star. Ouch.', 'bad'); }
}
function newDay(day, gName, bName) {
  usedNames.clear(); usedNames.add(gName); usedNames.add(bName); OID = 1; PID = 1; FID = 1; MID = 1;
  if (typeof clearPeopleCache === 'function') clearPeopleCache();
  G = {
    day, time: 570, phaseIdx: 0, phase: 'setup', phaseName: 'Setting Up', money: 5000, joy: 0, bliss: 70, avgHappy: 75,
    people: [], objects: [], messes: [], parts: [], fights: [], arrivals: [], memories: [], scripts: [],
    slotSet: new Set(), reserved: new Set(), hints: {}, complaints: {}, omens: new Set(), omenList: [],
    stats: { drinks: 0, vomits: 0, fights: 0, stormed: 0, accidents: 0, taxis: 0, meals: 0, cleaned: 0, photos: 0, falls: 0, sleepers: 0 },
    barMode: 'cash', barTake: 0, barSpend: 0, speed: 1, running: false, modalOpen: false, modalQueue: [], sel: null, build: null, hand: null,
    raining: false, rainUntil: 0, rainSpells: [], powerOut: 0, djOn: false, djHired: false, cakeCut: false, cakeDone: false, cakeSlices: 50,
    firstDanceDone: false, kissed: false, brideArrived: false, conga: null, lastConga: 0, litterQueue: [], nextEvent: 700, usedEvents: new Set(),
    gName, bName, groomStain: false, coupleGone: false, fireworks: 0, fwT: 0, seatedFrac: 0, weather: 'Sunny', goatAt: 0,
    happySum: 0, happyN: 0, clock: 0, buffs: [], later: [], musicOverride: null, inChoice: false, shake: 0,
    sickPlan: [ri(1225, 1290), ri(1300, 1385)],
    phases: PHASES.map(ph => Object.assign({}, ph)), twist: null, sponsorUntil: 0, moneyMult: 1, goatTimes: [], band: false, storm: false,
    cakeEaten: false, seenToday: [], celeb: null, magician: null, magicianDay: false,
  };
  buildMap();
  for (const k of ['12,6', '14,6', '12,16', '14,16', '26,18', '26,16', '5,2', '6,2', '7,2', '5,3', '6,3', '7,3', '19,12'])
    G.reserved.add(k);
  rebuildSlotSet();

  // ----- fixed furniture -----
  placeObj('arch', 5, 1, true);
  G.seatsC = [];
  for (let y = 4; y <= 9; y++) for (const x of [2, 3, 4, 5, 7, 8, 9, 10]) G.seatsC.push({ x, y, obj: placeObj('chair', x, y, true) });
  placeObj('ttable', 17, 2, true);
  G.seatsTop = [];
  for (let x = 17; x <= 24; x++) G.seatsTop.push({ x, y: 1, obj: placeObj('dchair', x, 1, true) });
  G.seatsD = [];
  for (const [tx, ty] of [[15, 5], [20, 5], [25, 5], [15, 9], [20, 9]]) {
    placeObj('table', tx, ty, true);
    for (let x = tx; x < tx + 3; x++) for (const y of [ty - 1, ty + 1]) G.seatsD.push({ x, y, obj: placeObj('dchair', x, y, true) });
  }
  G.cake = placeObj('cake', 26, 2, true);
  G.djBooth = placeObj('dj', 18, 13, true);
  G.kitchen = placeObj('kitchen', 26, 9, true);
  for (const y of [18, 20, 22]) placeObj('toilet', 28, y, true);
  // garden scenery & the samovar
  for (const [x, y] of [[1, 1], [11, 1], [1, 10], [1, 22], [12, 22]]) placeObj('tree', x, y, true);
  for (const [x, y] of [[5, 13], [8, 19], [12, 13]]) placeObj('lamp', x, y, true);
  placeObj('gate', 6, MH - 1, true);
  placeObj('samovar', 16, 1, true);

  // ----- couple -----
  G.groom = mkPerson('couple', 'groom', gName, { skin: '#f7dcc6', hair: '#d9661f', style: 'quiff', top: '#2f7d3a', bottom: '#276b31', shoes: '#5a3418', groom: true, sex: 'm' });
  G.bride = mkPerson('couple', 'bride', bName, { skin: '#fbe6d8', hair: '#3a2214', style: 'long', dress: true, top: '#ffffff', dressShade: '#e6e6ee', shoes: '#b0174f', bride: true, sex: 'f' });
  for (const c of [G.groom, G.bride]) { c.spd = c.baseSpd = 1.2; c.happy = 100; }
  G.groom.present = true; G.groom.state = 'idle'; G.groom.x = 20.5; G.groom.y = 3.5;
  G.groom.seatD = G.seatsTop[3]; G.bride.seatD = G.seatsTop[4];
  G.people.push(G.groom, G.bride);

  makeRoster();
  setupSpecials();

  // registrar
  G.registrar = mkPerson('npc', 'registrar', 'The Registrar', { skin: pick(SKINS), hair: '#9a9a9a', style: 'short', dress: true, top: '#1a1a1a', shoes: '#111', collar: true, glasses: true });
  G.people.push(G.registrar);

  // ----- weather & omens -----
  G.weather = weighted([['Sunny', 4], ['Cloudy', 3.5], ['Showers', 2.5]]);
  const lastOm = store.get('tw_lastomens', []);
  const om = shuffle(OMENS.filter(o => !lastOm.includes(o.id))).slice(0, 2);
  store.set('tw_lastomens', om.map(o => o.id));
  for (const o of om) { G.omens.add(o.id); G.omenList.push(o.t); if (o.apply) o.apply(); }
  if (G.weather === 'Showers') {
    G.rainSpells.push({ t: ri(720, 900), len: ri(20, 35) });
    G.rainSpells.push({ t: ri(1060, 1300), len: ri(20, 40) });
  }

  // ----- timed scripts -----
  G.scripts = [
    { t: 600, f() { msg('The gates are open! Guests are arriving.', 'gold'); } },
    { t: 965, f() { queueEvent(evFOB()); } },
    { t: 982, f() { queueEvent(evGroomSpeech()); } },
    { t: 998, f() { queueEvent(evBestMan()); } },
    { t: 1110, f() { msg('The evening guests are arriving!', 'gold'); } },
    { t: 1240, f() { if (G.phase === 'party') queueEvent(evBouquet()); } },
    { t: 1380, f() { msg('Last orders at the bar!', ''); } },
  ];
  G.nextEvent = 700;
  // today's twist
  G.twist = pickTwist();
  G.twist.apply();
  drawFloor(); markStaticDirty();
}

function makeRoster() {
  const GL = window.GUEST_LIST || {};
  const V = GL.vips || {}, C = GL.characters || {};
  const list = [];
  const add = (role, name, sex, age, extra) => {
    const p = mkPerson('guest', role, name, randLook(sex, age));
    Object.assign(p, extra || {});
    p.baseSpd = p.spd = age === 'gran' ? 0.9 : (age === 'kid' ? 1.6 : rnd(1.25, 1.5));
    p.drinkMult = rnd(0.8, 1.5) * (p.trait === 'party' ? 1.3 : 1);
    usedNames.add(name.split(' ')[0]);
    list.push(p); return p;
  };
  const sp = (str, name, sex, age, russian) => parseGuest(str) || { name, sex, age, russian: !!russian };
  const vip = (role, g, extra) => add(role, g.name, g.sex, g.age, Object.assign({ vip: true, russian: g.russian }, extra || {}));
  // wedding party: two best men, three bridesmaids (older guest-names.js files used bestMan / maidOfHonour)
  const bmList = Array.isArray(V.bestMen) ? V.bestMen : [V.bestMan, V.bestMan2];
  G.bestMan = vip('Best Man', sp(bmList[0], pick(MALE), 'm', 'adult'), { trait: 'party' });
  G.bestMan2 = vip('Best Man', sp(bmList[1], pick(MALE.filter(n => !usedNames.has(n))) || pick(MALE), 'm', 'adult'), { trait: 'party' });
  const bmdList = Array.isArray(V.bridesmaids) ? V.bridesmaids : [V.maidOfHonour];
  const bmdDefault = [pick(['Anya', 'Masha', 'Katya', 'Dasha']), pick(['Lucy', 'Hannah', 'Emma', 'Sophie']), pick(['Polina', 'Vera', 'Alina'])];
  G.bridesmaids = [0, 1, 2].map(i => { const b = vip('Bridesmaid', sp(bmdList[i], bmdDefault[i], 'f', 'adult', i !== 1)); b.look.top = '#c2185b'; b.look.hat = null; return b; });
  G.moh = G.bridesmaids[0]; // lead bridesmaid - the events written around the "maid of honour" use her
  G.fob = vip('Father of the Bride', sp(V.fatherOfBride, pick(['Sergei', 'Vladimir', 'Alexei', 'Yuri']), 'm', 'old', true));
  G.mob = vip('Mother of the Bride', sp(V.motherOfBride, pick(['Svetlana', 'Natasha', 'Irina', 'Tatiana', 'Lyudmila']), 'f', 'old', true)); G.mob.look.hat = '#c2185b';
  G.gmum = vip("Groom's Mum", sp(V.groomsMum, pick(['Maureen', 'Brenda', 'Wendy', 'Gill']), 'f', 'old'));
  G.gdad = null; // no father of the groom
  const ch = (str, name, sex, age, russian, extra) => { const g = sp(str, name, sex, age, russian); return add('Guest', g.name, g.sex, age === 'gran' ? 'gran' : g.age, Object.assign({ russian: g.russian }, extra || {})); };
  G.babushka = null; // no Babushka character any more (an old guest-names.js entry just becomes a regular guest)
  if (C.babushka) { const g = parseGuest(C.babushka); if (g) add('Guest', g.name, g.sex, g.age, { russian: g.russian }); }
  G.dmitri = ch(C.vodkaUncle, 'Uncle Dmitri', 'm', 'old', true, { trait: 'party' });
  Object.assign(G.dmitri.look, { beard: true, hair: '#4a3a2a', top: '#2a2a2a', bottom: '#2a2a2a', rubashka: true, big: true });
  G.gerald = ch(C.drunkUncle, 'Uncle Gerald', 'm', 'old', false, { trait: 'party' }); G.gerald.drinkMult = 2; G.gerald.look.top = G.gerald.look.bottom = '#7a5a2a';
  G.dmitri.drinkMult = 1.3;
  G.gran = null; // no Gran character any more (an old guest-names.js entry just becomes a regular guest)
  if (C.gran) { const g = parseGuest(C.gran); if (g) add('Guest', g.name, g.sex, g.age, { russian: g.russian }); }
  G.jess = ch(C.influencer, 'Cousin Jess', 'f', 'adult', false, { trait: 'party' }); // the influencer, see the 'Live-Streamed' twist
  G.kyle = ch(C.fightyCousin, 'Cousin Kyle', 'm', 'adult', false, { trait: 'fighter' });
  const fgs = sp(C.flowerGirl, 'Little ' + pick(KIDS_F), 'f', 'kid');
  const fg = add('Flower Girl', fgs.name, 'f', 'kid'); fg.look.top = '#fff0f6'; fg.look.hat = '#ff8fb8';
  const pbs = sp(C.pageBoy, 'Little ' + pick(KIDS_M), 'm', 'kid');
  const pb = add('Page Boy', pbs.name, 'm', 'kid'); pb.look.top = pb.look.bottom = '#2f7d3a';

  // day guests: a random selection from the guest list each day, topped up with made-up guests
  const splitG = (arr) => (Array.isArray(arr) ? arr : []).flatMap(x => typeof x === 'string' ? x.split(/(?<=\))\s*,\s*/) : []);
  const vipNames = new Set(list.map(p => p.name));
  const must = new Set(Object.keys(GL.catchphrases || {}).concat(GL.explodingGuest ? [GL.explodingGuest] : []).map(n => n.toLowerCase()));
  const pool = shuffle(splitG(GL.guests).map(parseGuest).filter(g => g && !vipNames.has(g.name)));
  pool.sort((a, b) => (must.has(b.name.toLowerCase()) ? 1 : 0) - (must.has(a.name.toLowerCase()) ? 1 : 0)); // always invite Glen & co
  for (const g of pool) { if (list.length >= 36) break; add('Guest', g.name, g.sex, g.age, { russian: g.russian }); }
  let ru = list.filter(p => p.russian).length;
  while (list.length < 36) {
    const sex = chance(0.5) ? 'm' : 'f';
    if (ru < 6) {
      const fn = pick((sex === 'f' ? RU_F : RU_M).filter(n => !usedNames.has(n))) || pick(sex === 'f' ? RU_F : RU_M);
      usedNames.add(fn); ru++;
      add('Guest', pick(['Cousin ' + fn, fn, fn + ' (' + G.bName + "'s " + (sex === 'f' ? 'aunt' : 'uncle') + ')']), sex, chance(0.3) ? 'old' : 'adult', { russian: true });
    } else add('Guest', guestName(sex), sex, chance(0.2) ? 'old' : (chance(0.08) ? 'kid' : 'adult'));
  }
  const tk = Object.keys(TRAITS);
  for (const p of list) if (!p.trait && !p.look.kid && chance(0.55)) p.trait = pick(tk);
  for (const p of list) if (p.russian && p.trait === 'teetotal') p.trait = 'party';

  // seats
  const front = { 5: G.mob, 4: G.gmum, 3: G.bestMan2, 2: G.bridesmaids[1], 7: G.fob, 8: G.bestMan, 9: G.bridesmaids[0], 10: G.bridesmaids[2] };
  const freeC = [];
  for (const s of G.seatsC) { if (s.y === 4 && front[s.x]) front[s.x].seatC = s; else freeC.push(s); }
  shuffle(freeC);
  for (const p of list) if (!p.seatC) p.seatC = freeC.pop();
  const top = [G.bestMan2, G.gmum, G.bestMan, null, null, G.bridesmaids[0], G.fob, G.mob];
  G.seatsTop.forEach((s, i) => { if (top[i]) top[i].seatD = s; });
  const freeD = shuffle(G.seatsD.slice());
  for (const p of list) if (!p.seatD) p.seatD = freeD.pop();

  // arrivals
  for (const p of list) G.arrivals.push({ t: p.vip ? rnd(600, 615) : rnd(602, 646), p });
  const epool = shuffle(splitG(GL.eveningGuests).map(parseGuest).filter(Boolean));
  for (let i = 0; i < 10; i++) {
    const g = epool[i] || (() => { const sex = chance(0.5) ? 'm' : 'f'; return { name: guestName(sex), sex, age: chance(0.15) ? 'old' : 'adult', russian: false }; })();
    const p = mkPerson('guest', 'Evening Guest', g.name, randLook(g.sex, g.age));
    p.evening = true; p.russian = g.russian; p.baseSpd = p.spd = rnd(1.25, 1.5); if (chance(0.55)) p.trait = pick(tk); p.drinkMult = rnd(0.9, 1.6); p.drunk = rnd(5, 25);
    G.people.push(p); G.arrivals.push({ t: rnd(1110, 1140), p });
  }
  G.people.push(...list);
}

function arrive(p) {
  G.stats.arrived = (G.stats.arrived || 0) + 1;
  p.present = true; p.x = rnd(6.2, 7.8); p.y = 23.4; p.state = 'idle'; p.idleT = 0;
  if (G.phase === 'setup' || G.phase === 'arrive') think(p, 'heart', 3);
  const line = catchphraseFor(p);
  if (line) later(4, () => { // wait until they've walked in a bit
    if (!p.present || p.hidden) return;
    shout(p, line, 9); msg(p.name + ': "' + line + '"', 'gold'); toast(p.name.toUpperCase() + ': "' + line.toUpperCase() + '"', 'gold'); SFX.boom();
  });
}

// ---------- guest-names.js specials: catchphrases, the exploding guest, the dog ----------
function catchphraseFor(p) {
  const cp = (window.GUEST_LIST || {}).catchphrases || {};
  const first = p.name.split(' ')[0].toLowerCase();
  for (const k in cp) if (k.toLowerCase() === p.name.toLowerCase() || k.toLowerCase() === first) return String(cp[k]).replace(/\{groom\}/g, G.gName).replace(/\{bride\}/g, G.bName);
  return null;
}
function shout(p, text, mins) { p.shout = text; p.shoutUntil = G.time + (mins || 6); }
function setupSpecials() {
  const GL = window.GUEST_LIST || {};
  const en = (GL.explodingGuest || '').toLowerCase();
  G.exploder = en ? G.people.find(p => p.kind === 'guest' && (p.name.toLowerCase() === en || p.name.split(' ')[0].toLowerCase() === en)) : null;
  G.explodeAt = G.exploder ? rnd(1185, 1350) : 0;
  G.dogAt = GL.dog === '' ? 0 : rnd(603, 612);
}
function explodeGuest(p) {
  interrupt(p);
  const s = iso(p.x, p.y);
  confettiAt(p.x, p.y, 60);
  spawnP('flash', s.x, s.y - 14, { life: 0.5, max: 0.5 });
  for (let i = 0; i < 14; i++) { const l = rnd(0.8, 1.6); spawnP('dust', s.x + rnd(-6, 6), s.y - rnd(4, 22), { vx: rnd(-25, 25), vy: rnd(-25, 5), life: l, max: l }); }
  G.shake = 0.6; SFX.boom(); SFX.boom();
  msg(p.name + ' got SO excited they literally EXPLODED!', 'gold');
  toast('KABOOM! ' + p.name.toUpperCase() + ' HAS EXPLODED!', 'gold');
  crowdReact('bang', 0.6); joy(15); memory(p.name + ' exploded with excitement', 30);
  p.present = false; p.exploded = true;
  later(14, () => {
    if (!G.running) return;
    p.present = true; p.x = rnd(6.4, 7.6); p.y = 23.4; p.state = 'idle'; p.idleT = 0; p.sooty = G.time + 90;
    p.happy = Math.max(p.happy, 90); p.needs.fun = 100;
    shout(p, pick(["I'm back! What did I miss?", 'Right, where was I?', 'Sorry about that. Got a bit excited.', 'Is the bar still open?']), 7);
    msg(p.name + ' has strolled back in, slightly singed, and carried on partying.', 'good');
  });
}
function spawnDog() {
  const GL = window.GUEST_LIST || {};
  const d = spawnAnimal('dog', true); d.name = GL.dog || 'Barnie'; G.dogSeen = d;
  d.x = 7.2; d.y = 23.2; d.spd = 1.7; d.poopAt = G.time + rnd(30, 150);
  msg(d.name + ' the golden retriever has arrived with the guests. Good boy!', 'good');
}

// ---------- phases ----------
function checkPhase() {
  const nx = G.phases[G.phaseIdx + 1]; if (!nx) return;
  if (G.time < nx.t) return;
  if (nx.id === 'reception' && !(G.kissed && G.time >= G.kissTime + 5)) return;
  if (nx.id === 'party' && !G.firstDanceDone && G.time < nx.t + 40) return;
  G.phaseIdx++;
  enterPhase(nx);
}
function releaseGuests() {
  for (const p of G.people) {
    if (!p.present || p.kind !== 'guest') continue;
    const st = p.state;
    if (['idle', 'walk', 'dance', 'chat', 'queue', 'watch', 'seated', 'conga'].includes(st) || (st === 'use' && p.useObj && OT[p.useObj.type].use !== 'loo')) interrupt(p);
  }
  if (G.conga && G.phase !== 'party' && G.phase !== 'evening') G.conga = null;
}
function enterPhase(ph) {
  G.phase = ph.id; G.phaseName = ph.name;
  if (ph.id !== 'end') { msg('— ' + ph.name.toUpperCase() + ' —', 'phase'); SFX.phase(); }
  releaseGuests();
  switch (ph.id) {
    case 'seat': {
      msg('Please take your seats for the ceremony!', '');
      const r = G.registrar; r.present = true; r.x = 6.5; r.y = 1.6; r.state = 'script';
      G.fob.fobWalk = true;
      break;
    }
    case 'ceremony': startBrideWalk(); break;
    case 'reception': {
      const r = G.registrar; r.state = 'idle'; leave(r, 'done');
      for (const c of [G.groom, G.bride]) if (c.state !== 'script') { c.state = 'idle'; c.idleT = 0; }
      msg('Drinks on the lawn! Keep everyone fed, watered and entertained.', '');
      later(4, () => queueEvent(evKaravai()));
      if (G.magicianDay) spawnMagician();
      break;
    }
    case 'dinner':
      for (const p of G.people) { p.course = 0; p.needServe = false; p.plate = false; p.eating = 0; p.waitServe = 0; p.serveClaim = null; }
      for (const c of [G.groom, G.bride]) { interrupt(c); }
      msg('Dinner is served! Guests are heading to their tables.', '');
      if (!staffOf('waiter').length) hint('waiters', 'Nobody is serving dinner! Hire some Waiters, quick!', 20);
      break;
    case 'speeches': msg('Pin drop. Time for the speeches...', ''); break;
    case 'evening':
      for (const p of G.people) { p.needServe = false; p.serveClaim = null; p.plate = false; p.eating = 0; }
      for (const w of staffOf('waiter')) if (w.job && w.job.type === 'serve') { interrupt(w); }
      if (G.cakeEaten) { G.cakeDone = true; later(3, () => queueEvent(evNoCake())); }
      else {
        coupleTo(G.groom, 25, 2, 0.5, 0.6, 'cakewait');
        coupleTo(G.bride, 26, 3, 0.5, 0.4, 'cakewait');
        msg('Time to cut the cake! The evening do begins.', '');
      }
      if (G.band) {
        const b = mkPerson('staff', 'dj', 'The Ceilidh Band (DJ)', { skin: pick(SKINS), hair: '#c45a1e', style: 'short', beard: true, top: '#2a4a8a', bottom: '#b02a2a', shoes: '#111', sex: 'm', shirt: '#ffffff', tie: '#2a6a3a' });
        b.present = true; b.state = 'idle'; b.x = 19.5; b.y = 11.5; b.baseSpd = b.spd = 1.5; b.cost = 0; G.people.push(b);
        msg('The ceilidh band are setting up. Strip the Willow!', 'good');
      }
      if (!G.djHired) hint('dj', 'The evening needs music! Hire a DJ before the first dance at 19:00.', 60);
      break;
    case 'firstdance':
      coupleTo(G.groom, 19, 16, 0.3, 0.75, 'fdwait');
      coupleTo(G.bride, 19, 16, 0.75, 0.3, 'fdwait');
      msg('Everyone gather round for the first dance!', 'gold');
      break;
    case 'party':
      msg("Let's PARTY! Keep the bar open and the floor full.", 'gold');
      for (const c of [G.groom, G.bride]) if (c.state === 'fdwait') { c.state = 'idle'; }
      break;
    case 'sendoff':
      if (G.conga) { for (const m of G.conga.members) { m.state = 'idle'; } G.conga = null; }
      for (const c of [G.groom, G.bride]) c.spd = 1.2;
      coupleTo(G.groom, 6, 11, 0.3, 0.7, 'sowait');
      coupleTo(G.bride, 6, 11, 0.7, 0.3, 'sowait');
      msg('Grab a sparkler and line the path for the send-off!', 'gold');
      break;
    case 'end': endDay(); break;
  }
}
function startBrideWalk() {
  const b = G.bride;
  b.present = true; b.x = 6.5; b.y = 23.5; b.spd = 0.9; b.state = 'script';
  const path = []; for (let y = 22; y >= 3; y--) path.push([6, y]); path.push([7, 2]);
  b.path = path; b.onArrive = (q) => { q.state = 'altar'; q.x = 7.5; q.y = 2.5; brideArrives(); };
  const f = G.fob;
  G.arrivals = G.arrivals.filter(a => a.p !== f);
  interrupt(f); f.fobWalk = false; f.present = true; f.x = 6.5; f.y = 24.4; f.spd = 0.9; f.state = 'walk';
  const fp = []; for (let y = 23; y >= 4; y--) fp.push([6, y]); fp.push([7, 4]);
  f.path = fp; f.onArrive = (q) => { q.state = 'seated'; q.sitting = true; q.x = 7.5; q.y = 4.5; q.spd = q.baseSpd; };
  const g = G.groom;
  if (g.state !== 'altar') { interrupt(g); g.x = 5.5; g.y = 2.5; g.state = 'altar'; }
  SFX.march();
  msg('Here comes the bride! ' + G.bName + ' walks down the aisle.', 'gold');
}
function brideArrives() {
  G.brideArrived = true; G.kissAt = G.time + 6;
  later(3, () => { if (G.groom.present) shout(G.groom, 'I do!', 2.5); });
  later(4.5, () => { if (G.bride.present) shout(G.bride, 'I do!', 2.5); });
  const all = guests().filter(p => !p.evening);
  const seated = all.filter(p => p.state === 'seated').length;
  G.seatedFrac = all.length ? seated / all.length : 0;
  const pool = EVENTS.filter(e => e.pool === 'ceremony');
  for (let i = 0; i < 6 && pool.length; i++) {
    const e = weighted(pool.map(x => [x, recency(x.id)]));
    pool.splice(pool.indexOf(e), 1);
    const ev = e.build(); if (ev) { markSeen(e.id); queueEvent(ev); break; }
  }
}
function doKiss() {
  G.kissed = true; G.kissTime = G.time;
  heartsAt(6.5, 2.5, 26); confettiAt(6.5, 3, 90); SFX.bells();
  const ru = randGuest(p => p.russian && !p.look.kid);
  if (ru) later(1, () => shout(ru, 'GORKO! GORKO!', 3)); // Russian side demand another kiss
  msg('"You may now kiss the bride!" JUST MARRIED!', 'gold');
  memory('Just married!', Math.round(40 + G.seatedFrac * 110));
  if (G.seatedFrac < 0.75) msg('Only ' + Math.round(G.seatedFrac * 100) + '% of guests were seated for the vows.', 'bad');
  moodAll(8);
  let delay = 0;
  for (const c of [G.bride, G.groom]) {
    const path = []; for (let y = 3; y <= 12; y++) path.push([6, y]);
    c.state = 'script'; c.path = path; c.spd = 1.0;
    c.onArrive = (q) => { q.state = 'idle'; q.idleT = 1; q.spd = 1.2; };
    if (delay) { c.path.unshift([6, 2]); }
    delay++;
  }
}
function coupleExit() {
  for (const c of [G.groom, G.bride]) {
    const path = []; for (let y = 12; y <= MH - 1; y++) path.push([6, y]);
    c.state = 'script'; c.path = path; c.spd = 0.9;
    c.onArrive = (q) => { q.present = false; q.state = 'gone'; G.coupleGone = true; };
  }
  G.fireworks = G.bigFireworks ? 60 : 14;
  msg('Off they go! Congratulations, ' + G.gName + ' & ' + G.bName + '!', 'gold');
  SFX.bells();
}

// ---------- minute tick ----------
function minuteTick() {
  const t = G.time;
  for (let i = G.arrivals.length - 1; i >= 0; i--) if (G.arrivals[i].t <= t) { arrive(G.arrivals[i].p); G.arrivals.splice(i, 1); }
  checkPhase();
  if (!G.running) return;
  for (const s of G.scripts) if (!s.done && t >= s.t) { s.done = true; s.f(); }
  for (const l of G.later.slice()) if (t >= l.t) { G.later.splice(G.later.indexOf(l), 1); l.f(); }
  if (G.buffs.length) G.buffs = G.buffs.filter(b => b.until > t);
  if (G.musicOverride && t >= G.musicOverride.until) G.musicOverride = null;
  for (let i = 0; i < G.sickPlan.length; i++) {
    if (t < G.sickPlan[i] || G.phase === 'sendoff') continue;
    G.sickPlan.splice(i, 1); i--;
    const c = guests().filter(p => !p.look.kid && !p.hidden && ['idle', 'dance', 'chat', 'walk', 'watch'].includes(p.state)).sort((a, b) => b.drunk - a.drunk);
    const v = c[0];
    if (v) { queasy(v, 3); msg(v.name + ' is looking a bit green...', 'bad'); }
  }

  // ceremony safety & kiss
  if (G.phase === 'ceremony' && !G.brideArrived && t > 735) { const b = G.bride; b.path = []; b.x = 7.5; b.y = 2.5; b.state = 'altar'; brideArrives(); }
  if (G.brideArrived && !G.kissed && t >= G.kissAt && !G.modalOpen) doKiss();
  if (G.kissed && t < G.kissTime + 8) confettiAt(G.bride.x, G.bride.y, 6);

  // cake / first dance / send-off triggers
  if (G.phase === 'evening' && !G.cakeDone) {
    if (G.groom.state === 'cakewait' && G.bride.state === 'cakewait') { G.cakeDone = 'pending'; queueEvent(evCake()); }
    else if (t > 1075) { for (const c of [G.groom, G.bride]) { c.path = []; c.state = 'cakewait'; } G.groom.x = 25.5; G.groom.y = 2.6; G.bride.x = 26.5; G.bride.y = 3.4; }
  }
  if (G.phase === 'firstdance' && !G.fdQueued) {
    if (G.groom.state === 'fdwait' && G.bride.state === 'fdwait') { G.fdQueued = true; queueEvent(evFirstDance()); }
    else if (t > 1165) { for (const c of [G.groom, G.bride]) { c.path = []; c.state = 'fdwait'; } G.groom.x = 19.3; G.groom.y = 16.75; G.bride.x = 19.75; G.bride.y = 16.3; }
  }
  if (G.phase === 'sendoff' && !G.soQueued && t >= 1413) {
    if (!(G.groom.state === 'sowait' && G.bride.state === 'sowait')) { for (const c of [G.groom, G.bride]) { c.path = []; c.state = 'sowait'; } G.groom.x = 6.3; G.groom.y = 11.7; G.bride.x = 6.7; G.bride.y = 11.3; }
    G.soQueued = true; queueEvent(evSendoff());
  }

  // weather
  for (const s of G.rainSpells) if (!s.done && t >= s.t) { s.done = true; startRain(s.len, s.storm); }
  if (G.raining && t >= G.rainUntil) { G.raining = false; G.storm = false; msg('The rain has stopped. Phew!', 'good'); }
  if (G.powerOut > 0) { G.powerOut--; if (G.powerOut <= 0) msg('The power is back on!', 'good'); }
  if (G.goatAt && t >= G.goatAt && !G.people.some(a => a.role === 'goat' && a.present)) { G.goatAt = 0; spawnAnimal('goat', false); msg('A goat has wandered in from next door!', 'bad'); }
  if (G.dogAt && t >= G.dogAt) { G.dogAt = 0; spawnDog(); }
  if (G.explodeAt && t >= G.explodeAt) {
    const p = G.exploder;
    if (!p || !p.present && !p.exploded && G.time > 1380) G.explodeAt = 0;
    else if (p.present && !p.hidden && !p.sitting && ['idle', 'dance', 'chat', 'walk', 'watch'].includes(p.state) && (G.phase === 'party' || G.phase === 'evening')) { G.explodeAt = 0; explodeGuest(p); }
    else G.explodeAt = t + 3;
  }
  for (let i = 0; i < G.goatTimes.length; i++) if (t >= G.goatTimes[i]) { G.goatTimes.splice(i, 1); i--; spawnAnimal('goat', false); msg('ANOTHER goat has wandered in!', 'bad'); }
  if (G.storm && G.raining && chance(0.12)) {
    spawnP('lightning', 0, 0, { life: 0.3, max: 0.3 }); SFX.thunder();
    if (!G.stormCut && chance(0.25)) { G.stormCut = true; G.powerOut = 10; msg('Lightning strike! The power has gone!', 'bad'); }
  }
  ratCheck();

  const dj = staffOf('dj').find(d => d.present && d.state === 'atpost');
  const bandBreak = G.band && Math.floor(t) % 60 >= 48;
  if (G.band && bandBreak && !G.bandBreakMsg && G.phase === 'party') { G.bandBreakMsg = true; msg('The band are on their break. 12 minutes of silence...', ''); }
  if (!bandBreak) G.bandBreakMsg = false;
  G.djOn = !!dj && !bandBreak && G.powerOut <= 0 && ['evening', 'firstdance', 'party', 'sendoff'].includes(G.phase);

  // brains
  let hs = 0, hn = 0;
  for (const p of G.people) {
    if (!p.present) continue;
    if (p.kind === 'guest') {
      if (p.state !== 'leave') { needsTick(p); guestBrain(p); moodTick(p); chaosTick(p); }
      if (p.rival) { if (p.state !== 'leave') moodNear(p, 3, -0.3); continue; }
      if (p.celeb && p.state !== 'leave') { moodNear(p, 3, 0.35); }
      hs += p.happy; hn++;
    } else if (p.kind === 'npc') npcBrain(p);
    else if (p.kind === 'staff') staffBrain(p);
    else if (p.kind === 'couple') coupleBrain(p);
    else if (p.kind === 'animal') animalBrain(p);
  }
  G.avgHappy = hn ? hs / hn : G.avgHappy;
  if (hn) { G.happySum += G.avgHappy; G.happyN++; }
  G.joy += hs / 100 * 0.1;
  for (const f of G.fights.slice()) fightTick(f);

  // couple bliss
  if (hn) G.bliss = clamp(G.bliss + (G.avgHappy - G.bliss) * 0.004, 0, 100);
  for (const c of [G.groom, G.bride]) {
    if (!c.present) continue;
    let m = 0; for (const ms of G.messes) if (dist(ms.x, ms.y, c.x, c.y) < 3) m++;
    G.bliss = clamp(G.bliss - m * (G.omens.has('mob') ? 0.12 : 0.04), 0, 100);
  }
  if (G.omens.has('mob') && G.messes.length > 6) G.bliss = clamp(G.bliss - 0.05, 0, 100);

  // random events
  if (!G.modalOpen && t >= G.nextEvent) {
    const pool = G.phase === 'reception' ? 'reception' : G.phase === 'dinner' ? 'dinner' : (G.phase === 'evening' || G.phase === 'party') ? 'party' : null;
    if (pool) {
      const c = EVENTS.filter(e => e.pool === pool && !G.usedEvents.has(e.id) && (!e.cond || e.cond()));
      if (c.length) {
        const e = weighted(c.map(x => [x, (typeof x.weight === 'function' ? x.weight() : (x.weight || 1)) * recency(x.id)]));
        const ev = e.build();
        G.usedEvents.add(e.id);
        if (ev) { markSeen(e.id); queueEvent(ev); }
      }
      G.nextEvent = t + rnd(28, 48);
    } else G.nextEvent = t + 5;
  }
  // ambient conga
  if (G.phase === 'party' && !G.conga && t - G.lastConga > 80 && chance(0.012)) { G.lastConga = t; startConga(); }

  if (Math.floor(t) % 10 === 0) hintsTick();
}
function hintsTick() {
  const t = G.time;
  const bars = G.objects.filter(o => o.type === 'bar');
  if (t >= 575 && !bars.length) hint('bar', 'Guests will want a drink! Furnish a Bar and hire a Bartender.', 60);
  else if (bars.length && !bars.some(barOpen) && t >= 590 && G.powerOut <= 0) hint('bartender', 'Your Bar is closed! Hire a Bartender to run it.', 45);
  if ((G.complaints.loo || 0) > 4) { hint('loo', 'Long loo queues! Buy a Portaloo or two.', 60); G.complaints.loo = 0; }
  if ((G.complaints.drink || 0) > 8 && bars.length) { hint('drink2', 'The bar is swamped. Another Bar & Bartender would help.', 90); G.complaints.drink = 0; }
  if ((G.complaints.food || 0) > 6) { hint('food', 'Hungry guests! A Canapé Table or Choc Fountain will help.', 90); G.complaints.food = 0; }
  if ((G.complaints.fun || 0) > 8) { hint('fun', 'Guests are bored! Try a Photo Booth or Bouncy Castle.', 90); G.complaints.fun = 0; }
  if (G.messes.length > 5 && !staffOf('cleaner').length) hint('clean', "It's getting grim in here. Hire a Cleaner.", 60);
  if (G.phase === 'dinner' && !staffOf('waiter').length) hint('waiters', 'Nobody is serving dinner! Hire some Waiters, quick!', 30);
  if (G.phase === 'dinner' && staffOf('waiter').length < 3 && guests().filter(p => p.needServe && p.waitServe > 15).length > 8) hint('morewaiters', 'Dinner is slow. More Waiters would speed things up.', 60);
  if (t >= 1000 && !G.djHired) hint('dj', 'The evening needs music! Hire a DJ.', 60);
  if (G.people.some(a => a.role === 'goat' && a.present && !a.friendly) && !staffOf('bouncer').length) hint('goat', 'There is a goat loose. A Bouncer could chase it off.', 60);
  const drunks = guests().filter(p => p.drunk > 85).length;
  if (drunks > 3) hint('drunk', 'Some guests are very drunk. Select one to cut them off or send them home.', 90);
}

// ---------- per-frame ----------
function update(dt) {
  const gdt = dt / SEC_PER_MIN;
  const before = Math.floor(G.time);
  G.time += gdt;
  const after = Math.floor(G.time);
  for (let m = before + 1; m <= after; m++) { minuteTick(); if (!G.running) return; }
  for (const p of G.people) if (p.present) movePerson(p, gdt);
  updateConga();
  updateParts(dt);
  ambientParticles(dt);
}
function movePerson(p, gdt) {
  if (p.state === 'conga' && G.conga && G.conga.members[0] !== p) { tickTimer(p, gdt); return; }
  if (p.path.length) {
    const n = p.path[0]; const tx = n[0] + 0.5, ty = n[1] + 0.5;
    const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy), step = p.spd * gdt;
    if (d <= step) {
      p.x = tx; p.y = ty; p.path.shift();
      if (p.kind === 'guest') onTile(p, n[0], n[1]);
      if (!p.path.length) { p.moving = false; const cb = p.onArrive; p.onArrive = null; if (cb) cb(p); }
    } else { p.x += dx / d * step; p.y += dy / d * step; }
    const vx = dx - dy, vy = dx + dy;
    if (Math.abs(vx) + Math.abs(vy) > 0.01 && !p.sitting) { // sitting down sets its own facing
      p.face = vy < -0.05 ? 'b' : 'f'; p.flip = vx < -0.05;
      const ssx = (dx - dy) * 16, ssy = (dx + dy) * 8;   // screen-space heading picks one of the 4 sprite directions
      p.dir = ssy < -0.02 * d ? 'up' : Math.abs(ssx) > Math.abs(ssy) * 1.2 ? (ssx < 0 ? 'left' : 'right') : 'down';
    }
    p.moving = p.path.length > 0;
    if (!p.moving && p.kind === 'couple') { p.face = 'f'; p.flip = false; p.dir = 'down'; }
  } else p.moving = false;
  tickTimer(p, gdt);
}
function tickTimer(p, gdt) {
  if (p.timer > 0) { p.timer -= gdt; if (p.timer <= 0) { p.timer = 0; const cb = p.onTimer; p.onTimer = null; if (cb) cb(p); } }
}
function onTile(p, x, y) {
  if (p.state === 'leave' || p.state === 'script') return;
  for (const m of G.messes) {
    if (Math.floor(m.x) === x && Math.floor(m.y) === y && ['spill', 'vomit', 'puddle', 'choc', 'mud', 'cake'].includes(m.type) && chance(0.1 + p.drunk / 400)) {
      const cb = p.onArrive; fall(p);
      msg(p.name + ' slipped in the ' + ({ spill: 'spilt drink', vomit: 'sick', puddle: 'puddle', choc: 'chocolate', mud: 'mud', cake: 'cake' })[m.type] + '!', 'bad');
      if (m.type === 'vomit') memory('Someone slipped in sick', 20);
      void cb; return;
    }
  }
}
function updateConga() {
  const c = G.conga; if (!c) return;
  c.members = c.members.filter(m => m.present && m.state === 'conga');
  if (G.time > c.until || c.members.length < 2) {
    for (const m of c.members) { m.state = 'idle'; m.idleT = 1; m.path = []; m.moving = false; }
    G.conga = null; return;
  }
  const lead = c.members[0];
  lead.spd = 1.3;
  if (!lead.path.length) { const z = zoneTile('hall'); if (z) goTo(lead, z.x, z.y, null); }
  const last = c.trail[0];
  if (!last || dist(last.x, last.y, lead.x, lead.y) > 0.12) { c.trail.unshift({ x: lead.x, y: lead.y }); if (c.trail.length > 200) c.trail.pop(); }
  for (let i = 1; i < c.members.length; i++) {
    const q = c.trail[Math.min(c.trail.length - 1, i * 5)];
    const m = c.members[i];
    if (q) { m.moving = dist(m.x, m.y, q.x, q.y) > 0.01; m.x = q.x; m.y = q.y; }
  }
}
let _fx = 0;
function ambientParticles(dt) {
  if (dt <= 0) return;
  for (const p of G.people) {
    if (!p.present || p.state !== 'sick' || !p._mouth) continue;
    for (let k = 0; k < 2; k++) spawnP('puke', p._mouth.x + rnd(-1, 1), p._mouth.y, { vx: rnd(4, 22), vy: rnd(-12, 4), grav: 120, life: 0.45, max: 0.45, col: pick(['#8ab03a', '#9cc040', '#c8d860', '#7a9a30']) });
  }
  if (G.raining) {
    for (let i = 0; i < 5; i++) { const s = iso(rnd(1, 13), rnd(1, 23)); spawnP('rain', s.x, s.y - rnd(20, 60), { vy: 160, vx: -20, life: 0.35, max: 0.35 }); }
  }
  _fx += dt;
  if (_fx > 0.35) {
    _fx = 0;
    if (G.djOn) { const s = iso(rnd(16, 23), rnd(14, 20)); spawnP('note', s.x, s.y - 30, { vy: -14, life: 1.5, max: 1.5 }); }
    if (G.phase === 'sendoff') {
      for (const p of guests()) if (p.state === 'watch' && chance(0.5)) { const s = iso(p.x, p.y); spawnP('star', s.x + 4 + rnd(-2, 2), s.y - 22 + rnd(-3, 3), { life: 0.4, max: 0.4, vy: rnd(-10, 10), vx: rnd(-10, 10) }); }
    }
    if (G.fireworks > 0) { G.fireworks--; const s = iso(rnd(2, 20), rnd(2, 14)); fireworkAt(s.x, s.y - rnd(60, 120)); }
    for (const p of G.people) if (p.present && p.state === 'sleep' && chance(0.3)) { const s = iso(p.x, p.y); spawnP('text', s.x - 4, s.y - 10, { text: 'z', col: '#ffffff', vy: -10, life: 1.2, max: 1.2 }); }
  }
}

// ---------- end of day ----------
function computeScore() {
  const joyPts = Math.round(G.joy);
  const arrived = Math.max(1, G.stats.arrived || 1);
  const stayed = clamp(1 - G.stats.stormed / arrived, 0, 1);
  const blissPts = Math.round(G.bliss * 8 * stayed);
  const moneyPts = Math.round(G.money > 0 ? G.money / 5 * stayed * (G.moneyMult || 1) : G.money / 2);
  const total = joyPts + blissPts + moneyPts;
  const stars = total >= 6000 ? 5 : total >= 4800 ? 4 : total >= 3500 ? 3 : total >= 2200 ? 2 : 1;
  const titles = ['', 'Disaster at the Altar', 'Bit of a Shambles', 'A Lovely Do', 'An Absolute Belter', 'WEDDING OF THE CENTURY!'];
  return { joyPts, blissPts, moneyPts, total, stars, stayed, title: titles[stars], avg: G.happyN ? G.happySum / G.happyN : 0 };
}
function endDay() {
  G.running = false; G.sel = null; G.build = null; if (G.hand) cancelHand();
  $('info').classList.add('hidden'); $('side').classList.add('hidden'); sideMode = null;
  const s = computeScore();
  const hs = store.get('tw_scores', []);
  hs.push({ score: s.total, day: G.day, couple: G.gName + ' & ' + G.bName, player: store.get('tw_player', ''), title: s.title, date: new Date().toLocaleDateString('en-GB') });
  hs.sort((a, b) => b.score - a.score);
  store.set('tw_scores', hs.slice(0, 8));
  store.set('tw_day', G.day + 1);
  G.lbSent = LB.submit(store.get('tw_player', ''), s.total, G.day, s.title);
  const seen = store.get('tw_seen', {});
  for (const id of G.seenToday) seen[id] = G.day;
  store.set('tw_seen', seen);
  showEndScreen(s);
}
function queueEvent(ev) { G.modalQueue.push(ev); if (!G.modalOpen) nextModal(); }
