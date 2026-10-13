'use strict';
/* =========================================================
   THEME WEDDING — chiptune audio: SFX + a little music engine
   ========================================================= */
const AU = {
  ctx: null, master: null, mbus: null, sbus: null, noiseBuf: null,
  music: store.get('tw_music', true), sfx: store.get('tw_sfx', true),
  track: null, step: 0, next: 0, quietUntil: 0,
};
function auInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    AU.ctx = new C();
    AU.master = AU.ctx.createGain(); AU.master.gain.value = 0.5; AU.master.connect(AU.ctx.destination);
    AU.sbus = AU.ctx.createGain(); AU.sbus.gain.value = 0.26; AU.sbus.connect(AU.master);
    const lp = AU.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; lp.Q.value = 0.4; lp.connect(AU.master);
    AU.mbus = AU.ctx.createGain(); AU.mbus.gain.value = 0.16; AU.mbus.connect(lp);
    const len = AU.ctx.sampleRate * 0.5; AU.noiseBuf = AU.ctx.createBuffer(1, len, AU.ctx.sampleRate);
    const d = AU.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  } catch (e) { AU.ctx = null; }
}
// generic voice with attack / release envelope
function voice(f, d, type, vol, when, bus, atk) {
  if (!AU.ctx) return;
  const t = AU.ctx.currentTime + (when || 0);
  const o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
  const a = atk || 0.008;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + a);
  g.gain.setValueAtTime(vol, t + Math.max(a, d * 0.5)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(bus); o.start(t); o.stop(t + d + 0.03);
}
function tone(f, d, type, vol, when) { if (AU.sfx) voice(f, d, type, (vol == null ? 0.5 : vol), when, AU.sbus); }
function noiseHit(d, vol, when, hp, bus) {
  if (!AU.ctx) return;
  const t = AU.ctx.currentTime + (when || 0);
  const s = AU.ctx.createBufferSource(); s.buffer = AU.noiseBuf;
  const g = AU.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  if (hp) { const f = AU.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; s.connect(f); f.connect(g); } else s.connect(g);
  g.connect(bus); s.start(t); s.stop(t + d + 0.02);
}
function kick(when, vol) {
  if (!AU.ctx) return;
  const t = AU.ctx.currentTime + when;
  const o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  o.connect(g); g.connect(AU.mbus); o.start(t); o.stop(t + 0.18);
}
const SFX = {
  click() { tone(880, 0.04, 'square', 0.35); },
  place() { tone(523, 0.06, 'square', 0.5); tone(784, 0.08, 'square', 0.5, 0.06); },
  cash() { tone(1046, 0.05, 'square', 0.4); tone(1318, 0.09, 'square', 0.4, 0.05); },
  bad() { tone(220, 0.15, 'sawtooth', 0.4); tone(165, 0.22, 'sawtooth', 0.4, 0.12); },
  good() { [523, 659, 784].forEach((f, i) => tone(f, 0.1, 'square', 0.4, i * 0.07)); },
  triumph() { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, i === 5 ? 0.4 : 0.1, 'square', 0.45, i * 0.08)); },
  disaster() { [392, 370, 349, 330].forEach((f, i) => tone(f, i === 3 ? 0.6 : 0.22, 'sawtooth', 0.4, i * 0.24)); },
  memory() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.12, 'triangle', 0.6, i * 0.08)); },
  phase() { tone(660, 0.1, 'triangle', 0.6); tone(880, 0.16, 'triangle', 0.6, 0.1); },
  fax() { for (let i = 0; i < 6; i++) tone(i % 2 ? 1250 : 1850, 0.055, 'square', 0.22, i * 0.06); },
  bells() { [1046, 1318, 1568, 2093, 1568, 1318, 1046].forEach((f, i) => { tone(f, 0.6, 'sine', 0.45, i * 0.17); tone(f * 2, 0.3, 'sine', 0.12, i * 0.17); }); },
  march() {
    const n = [[392, 1], [523, 0.75], [523, 0.25], [523, 2], [392, 1], [587, 0.75], [494, 0.25], [523, 2],
      [392, 1], [523, 0.75], [698, 0.25], [698, 2], [659, 0.75], [587, 0.25], [523, 0.75], [494, 0.25], [523, 2]];
    let t = 0; const b = 0.42;
    for (const [f, d] of n) { tone(f, d * b * 0.95, 'triangle', 0.8, t); tone(f / 2, d * b * 0.95, 'square', 0.15, t); t += d * b; }
    if (AU.ctx) AU.quietUntil = AU.ctx.currentTime + t + 0.3;
  },
  boom() { if (AU.sfx) noiseHit(0.5, 0.35, 0, 0, AU.sbus); tone(80, 0.3, 'sine', 0.5); },
  shot() { if (AU.sfx && AU.ctx) { noiseHit(0.25, 0.6, 0, 300, AU.sbus); tone(140, 0.12, 'square', 0.5); } },
  squeak() { tone(1800, 0.06, 'square', 0.3); tone(2200, 0.08, 'square', 0.3, 0.07); tone(1900, 0.05, 'square', 0.25, 0.16); },
  thunder() { if (AU.sfx && AU.ctx) { noiseHit(1.6, 0.5, 0, 0, AU.sbus); noiseHit(1.0, 0.35, 0.3, 0, AU.sbus); tone(55, 1.2, 'sine', 0.5); } },
  siren() { for (let i = 0; i < 6; i++) tone(i % 2 ? 660 : 880, 0.22, 'square', 0.3, i * 0.24); }, // nee-naw nee-naw
  waah() { [0, 0.55].forEach(w => { tone(620, 0.12, 'sawtooth', 0.22, w); tone(760, 0.3, 'sawtooth', 0.22, w + 0.1); tone(540, 0.14, 'sawtooth', 0.2, w + 0.38); }); },
  sick() { tone(180, 0.25, 'sawtooth', 0.3); tone(120, 0.35, 'sawtooth', 0.3, 0.15); },
};

// ---------- music ----------
const NOTE_IX = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const _nf = {};
function nf(n) {
  if (_nf[n]) return _nf[n];
  const m = n.match(/^([A-G][#b]?)(\d)$/);
  const midi = 12 * (+m[2] + 1) + NOTE_IX[m[1]];
  return (_nf[n] = 440 * Math.pow(2, (midi - 69) / 12));
}
const toks = (s) => s.trim().split(/\s+/).filter(t => t !== '|');
const chords = (s) => s.trim().split('|').map(c => c.trim().split(/\s+/));

const TRACKS = {
  // jazzy daytime swing (F major) — Theme Hospital lift-music vibes
  day: {
    bpm: 112, spb: 8, swing: 0.3,
    lead: toks(`A4 . C5 . F5 . E5 D5 | C5 . A4 . F4 . - - | G4 A4 Bb4 D5 . . C5 Bb4 | A4 . G4 . E4 . - -
                E5 . C5 . A4 . C5 E5 | F#5 . E5 D5 C5 . A4 - | Bb4 . D5 . G5 . F5 E5 | F5 . . . - - C5 -`),
    bass: toks(`F2 . A2 . C3 . D3 . | D2 . F2 . A2 . C3 . | G2 . Bb2 . D3 . F3 . | C2 . E2 . G2 . Bb2 .
                A2 . C3 . E3 . G3 . | D2 . F#2 . A2 . C3 . | G2 . Bb2 . D3 . E3 . | C3 . Bb2 . G2 . E2 .`),
    chords: chords(`A3 C4 E4 | F3 A3 C4 | F3 Bb3 D4 | E3 G3 Bb3 | G3 C4 E4 | F#3 A3 C4 | F3 Bb3 D4 | E3 G3 Bb3`),
    comp: [2, 6], compLen: 0.8, compType: 'triangle', compVol: 0.32,
    leadType: 'square', leadVol: 0.22, bassType: 'triangle', bassVol: 0.75, drums: 'brush',
  },
  // Pachelbel's Canon (D major)
  ceremony: {
    bpm: 64, spb: 8, swing: 0,
    lead: toks(`F#5 . . . E5 . . . | D5 . . . C#5 . . . | B4 . . . A4 . . . | B4 . . . C#5 . . .
                D5 . . . C#5 . . . | B4 . . . A4 . . . | G4 . . . F#4 . . . | G4 . . . E4 . . .`),
    bass: toks(`D3 . . . . . . . | A2 . . . . . . . | B2 . . . . . . . | F#2 . . . . . . .
                G2 . . . . . . . | D2 . . . . . . . | G2 . . . . . . . | A2 . . . . . . .`),
    chords: chords(`D4 F#4 A4 | C#4 E4 A4 | D4 F#4 B4 | C#4 F#4 A4 | D4 G4 B4 | D4 F#4 A4 | D4 G4 B4 | C#4 E4 A4`),
    arp: true, arpVol: 0.2, leadType: 'triangle', leadVol: 0.42, leadAtk: 0.06, bassType: 'sine', bassVol: 0.9, drums: 'none',
  },
  // gentle dinner waltz (C major, 3/4)
  dinner: {
    bpm: 138, spb: 6, swing: 0,
    lead: toks(`E5 . . . D5 C5 | C5 . . . B4 A4 | A4 . . . C5 F5 | F5 . . . E5 D5
                E5 . G5 . E5 C5 | D5 . B4 . G#4 B4 | A4 . C5 . E5 A5 | G5 . F5 . D5 B4`),
    bass: toks(`C3 . - - - - | A2 . - - - - | F2 . - - - - | G2 . - - - - | C3 . - - - - | E2 . - - - - | A2 . - - - - | G2 . - - - -`),
    chords: chords(`E4 G4 C5 | E4 A4 C5 | F4 A4 C5 | F4 B4 D5 | E4 G4 C5 | E4 G#4 D5 | E4 A4 C5 | F4 B4 D5`),
    comp: [2, 4], compLen: 0.9, compType: 'triangle', compVol: 0.26,
    leadType: 'triangle', leadVol: 0.4, bassType: 'triangle', bassVol: 0.75, drums: 'none',
  },
  // disco (A minor)
  disco: {
    bpm: 124, spb: 8, swing: 0,
    lead: toks(`E5 . E5 D5 E5 . A5 . | G5 . F5 . E5 . C5 . | D5 . E5 . G5 . E5 D5 | B4 . . . - - D5 E5
                E5 . E5 D5 E5 . A5 . | C6 . B5 . A5 . G5 . | E5 . G5 . C6 . G5 E5 | D5 . B4 . G4 . - -`),
    bass: toks(`A2 A3 A2 A3 A2 A3 A2 A3 | F2 F3 F2 F3 F2 F3 F2 F3 | C3 C4 C3 C4 C3 C4 C3 C4 | G2 G3 G2 G3 G2 G3 G2 G3
                A2 A3 A2 A3 A2 A3 A2 A3 | F2 F3 F2 F3 F2 F3 F2 F3 | C3 C4 C3 C4 C3 C4 C3 C4 | G2 G3 G2 G3 G2 G3 G2 G3`),
    chords: chords(`A3 C4 E4 | A3 C4 F4 | G3 C4 E4 | G3 B3 D4`),
    comp: [1, 3, 5, 7], compLen: 0.5, compType: 'square', compVol: 0.12,
    leadType: 'square', leadVol: 0.24, bassType: 'square', bassVol: 0.32, drums: 'disco',
  },
  // euro-pop (D minor)
  euro: {
    bpm: 128, spb: 8, swing: 0,
    lead: toks(`A4 . D5 . F5 . E5 D5 | D5 . F5 . A5 . G5 F5 | F5 . C5 . A4 . C5 F5 | E5 . . . G5 . E5 C5
                D5 F5 A5 F5 D5 F5 A5 F5 | D5 F5 Bb5 F5 D5 F5 Bb5 F5 | C5 F5 A5 F5 C5 F5 A5 F5 | C5 E5 G5 E5 C6 . - -`),
    bass: toks(`D2 . D3 D2 . D2 D3 . | Bb1 . Bb2 Bb1 . Bb1 Bb2 . | F2 . F3 F2 . F2 F3 . | C2 . C3 C2 . C2 C3 .
                D2 . D3 D2 . D2 D3 . | Bb1 . Bb2 Bb1 . Bb1 Bb2 . | F2 . F3 F2 . F2 F3 . | C2 . C3 C2 . C2 C3 .`),
    chords: chords(`D4 F4 A4 | D4 F4 Bb4 | C4 F4 A4 | C4 E4 G4`),
    comp: [2, 6], compLen: 1.6, compType: 'sawtooth', compVol: 0.08,
    leadType: 'square', leadVol: 0.22, bassType: 'sawtooth', bassVol: 0.3, drums: 'disco',
  },
  // Korobeiniki (traditional Russian), accelerates while it plays
  korob: {
    bpm: 132, spb: 8, swing: 0, accel: true,
    lead: toks(`E5 . B4 C5 D5 . C5 B4 | A4 . A4 C5 E5 . D5 C5 | B4 . . C5 D5 . E5 . | C5 . A4 . A4 . - -
                - D5 . F5 A5 . G5 F5 | E5 . . C5 E5 . D5 C5 | B4 . B4 C5 D5 . E5 . | C5 . A4 . A4 . - -`),
    bass: toks(`E2 . - - B2 . - - | A2 . - - E3 . - - | E2 . - - B2 . - - | A2 . - - E3 . - -
                D2 . - - A2 . - - | C3 . - - G2 . - - | E2 . - - B2 . - - | A2 . - - E3 . - -`),
    chords: chords(`G#3 B3 E4 | A3 C4 E4 | G#3 B3 E4 | A3 C4 E4 | A3 D4 F4 | G3 C4 E4 | G#3 B3 E4 | A3 C4 E4`),
    comp: [2, 6], compLen: 0.6, compType: 'square', compVol: 0.14,
    leadType: 'square', leadVol: 0.26, bassType: 'triangle', bassVol: 0.8, drums: 'oompah',
  },
};
TRACKS.slow = Object.assign({}, TRACKS.ceremony, { bpm: 72 });
// a jaunty ceilidh jig (original tune) for the live band twist
TRACKS.ceilidh = {
  bpm: 132, spb: 6, swing: 0,
  lead: toks(`D5 . F#5 A5 . F#5 | D5 . F#5 A5 . D6 | C#6 . A5 B5 . G5 | A5 . F#5 E5 . D5
              G5 . B5 D6 . B5 | A5 . F#5 D5 . F#5 | E5 . G5 F#5 . E5 | D5 . . . - A4`),
  bass: toks(`D3 . . A2 . . | D3 . . A2 . . | A2 . . E3 . . | D3 . . A2 . .
              G2 . . D3 . . | D3 . . A2 . . | A2 . . E3 . . | D3 . . . . .`),
  chords: chords(`D4 F#4 A4 | D4 F#4 A4 | C#4 E4 A4 | D4 F#4 A4 | D4 G4 B4 | D4 F#4 A4 | C#4 E4 A4 | D4 F#4 A4`),
  comp: [2, 5], compLen: 0.8, compType: 'triangle', compVol: 0.2,
  leadType: 'square', leadVol: 0.24, bassType: 'triangle', bassVol: 0.8, drums: 'oompah',
};

function currentTrack() {
  if (!G) return 'day';
  if (!G.running) return 'slow';
  if (G.powerOut > 0) return null;
  if (G.musicOverride && G.time < G.musicOverride.until) return G.musicOverride.track;
  switch (G.phase) {
    case 'seat': case 'ceremony': return 'ceremony';
    case 'dinner': case 'speeches': return 'dinner';
    case 'firstdance': case 'sendoff': return 'slow';
    case 'evening': case 'party': return G.djOn ? (G.band ? 'ceilidh' : (Math.floor(G.time / 25) % 2 ? 'euro' : 'disco')) : 'day';
    default: return 'day';
  }
}
function playTok(arr, i, type, vol, dur, w, atk) {
  const tk = arr[i % arr.length];
  if (tk === '.' || tk === '-') return;
  let n = 1; while (n < 16 && arr[(i + n) % arr.length] === '.') n++;
  voice(nf(tk), n * dur * 0.92, type, vol, w, AU.mbus, atk);
}
function scheduleStep(tr, s, w, dur) {
  const bar = Math.floor(s / tr.spb), ib = s % tr.spb;
  playTok(tr.lead, s, tr.leadType, tr.leadVol, dur, w, tr.leadAtk);
  playTok(tr.bass, s, tr.bassType, tr.bassVol, dur, w);
  const ch = tr.chords[bar % tr.chords.length];
  if (tr.comp && tr.comp.includes(ib)) for (const n of ch) voice(nf(n), dur * tr.compLen, tr.compType, tr.compVol, w, AU.mbus);
  if (tr.arp) { const order = [0, 1, 2, 1, 2, 1, 0, 1]; voice(nf(ch[order[ib % 8]]) * (ib === 4 ? 2 : 1), dur * 1.6, 'sine', tr.arpVol, w, AU.mbus, 0.02); }
  switch (tr.drums) {
    case 'brush': if (ib === 2 || ib === 6) noiseHit(0.08, 0.07, w, 4000, AU.mbus); if (ib % 2 === 0) noiseHit(0.03, 0.03, w, 8000, AU.mbus); break;
    case 'disco':
      if (ib % 2 === 0) kick(w, 0.9);
      if (ib % 2 === 1) noiseHit(0.06, 0.1, w, 7000, AU.mbus);
      if (ib === 2 || ib === 6) noiseHit(0.14, 0.2, w, 1800, AU.mbus);
      break;
    case 'oompah': if (ib === 0 || ib === 4) kick(w, 0.6); if (ib === 2 || ib === 6) noiseHit(0.05, 0.12, w, 5000, AU.mbus); break;
  }
}
function musicTick() {
  if (!AU.ctx || AU.ctx.state !== 'running') return;
  const id = AU.music ? currentTrack() : null;
  const now = AU.ctx.currentTime;
  if (id !== AU.track) { AU.track = id; AU.step = 0; AU.next = now + 0.1; }
  if (!id || now < AU.quietUntil) { AU.next = Math.max(AU.next, now + 0.05); return; }
  const tr = TRACKS[id];
  let bpm = tr.bpm;
  if (tr.accel && G && G.musicOverride) bpm += 110 * clamp((G.time - G.musicOverride.start) / Math.max(1, G.musicOverride.until - G.musicOverride.start), 0, 1);
  const dur = 60 / bpm / 2;
  if (AU.next < now) AU.next = now + 0.03;
  while (AU.next < now + 0.2) {
    const odd = AU.step % 2 === 1;
    const w = AU.next - now + (odd ? tr.swing * dur : 0);
    scheduleStep(tr, AU.step, w, dur);
    AU.step++; AU.next += dur;
  }
}
