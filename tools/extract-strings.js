// Lists every player-visible English string in the game as a pattern for translation.
//   `Hello ${name}!`        -> "Hello {0}!"
//   name + ' has left.'     -> "{0} has left."
//   '<b>FURNISH</b> items'  -> "FURNISH", "items"   (HTML is split into its text pieces)
// Usage: node tools/extract-strings.js  -> writes lang/strings-en.json
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const FILES = ['js/core.js', 'js/draw.js', 'js/sprites.js', 'js/sim.js', 'js/events.js', 'js/game.js', 'js/ui.js', 'js/audio.js', 'js/leaderboard.js'];

function scan(src) {
  const lits = [], chains = [];
  let i = 0, prevSig = '';
  const n = src.length;
  // string-concatenation tracking: lit + expr + lit ...
  let chain = null, cstate = '', depth = 0, cdepth = 0;
  function closeChain() { if (chain && chain.length > 1 && chain.some(x => x.lit)) chains.push(chain); chain = null; cstate = ''; }
  function onLiteral(s) {
    lits.push(s);
    if (chain && cstate === 'afterPlus' && depth === cdepth) { chain.push({ lit: s }); cstate = 'afterLit'; }
    else if (chain && cstate === 'expr' && depth === cdepth) { closeChain(); chain = [{ lit: s }]; cstate = 'afterLit'; cdepth = depth; }
    else if (prevSig === '+' && !chain) { chain = [{ ph: 1 }, { lit: s }]; cstate = 'afterLit'; cdepth = depth; }
    else { closeChain(); chain = [{ lit: s }]; cstate = 'afterLit'; cdepth = depth; }
  }
  function onToken(tok) {
    if (!chain) return;
    if (tok === '(' || tok === '[' || tok === '{') { if (cstate === 'afterPlus') { chain.push({ ph: 1 }); cstate = 'expr'; } return; }
    if (depth < cdepth) { closeChain(); return; }
    if (depth > cdepth) return;
    if (tok === '+') { cstate = 'afterPlus'; return; }
    if (/^[,;:?)\]}]$/.test(tok) || tok === '=' || tok === '&&' || tok === '||') { if (cstate === 'expr' && chain[chain.length - 1].ph !== 1) chain.push({ ph: 1 }); closeChain(); return; }
    if (cstate === 'afterPlus') { chain.push({ ph: 1 }); cstate = 'expr'; }
    else if (cstate === 'afterLit') closeChain();
  }
  function isRegexStart() { return prevSig === '' || /[(,=:[!&|?{};+\-*%<>~^]$/.test(prevSig) || /\b(return|typeof|case|in|of)$/.test(prevSig); }
  function readQuoted(q) { let s = ''; i++; while (i < n && src[i] !== q) { if (src[i] === '\\') { s += src[i] + src[i + 1]; i += 2; continue; } s += src[i++]; } i++; return s; }
  function readTemplate() {
    const parts = ['']; i++;
    while (i < n && src[i] !== '`') {
      if (src[i] === '\\') { parts[parts.length - 1] += src[i] + src[i + 1]; i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') {
        i += 2; let d = 1;
        while (i < n && d) {
          const ch = src[i];
          if (ch === '{') { d++; i++; } else if (ch === '}') { d--; i++; }
          else if (ch === "'" || ch === '"') lits.push(readQuoted(ch));
          else if (ch === '`') lits.push(readTemplate());
          else i++;
        }
        parts.push(''); continue;
      }
      parts[parts.length - 1] += src[i++];
    }
    i++;
    return parts.map((p, k) => k ? '{' + (k - 1) + '}' + p : p).join('');
  }
  while (i < n) {
    const ch = src[i];
    if (ch === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (ch === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 2; continue; }
    if (ch === '/' && isRegexStart()) { i++; let cls = false; while (i < n) { const c = src[i]; if (c === '\\') { i += 2; continue; } if (c === '[') cls = true; else if (c === ']') cls = false; else if (c === '/' && !cls) break; i++; } i++; while (/[a-z]/i.test(src[i])) i++; onToken('x'); prevSig = 'x'; continue; }
    if (ch === "'" || ch === '"') { onLiteral(readQuoted(ch)); prevSig = 'x'; continue; }
    if (ch === '`') { onLiteral(readTemplate()); prevSig = 'x'; continue; }
    if (/\s/.test(ch)) { i++; continue; }
    if (/[A-Za-z_$0-9]/.test(ch)) { let w = ''; while (i < n && /[\w$.]/.test(src[i])) w += src[i++]; onToken(w); prevSig = w; continue; }
    let tok = ch;
    if ((ch === '&' || ch === '|' || ch === '=') && src[i + 1] === ch) tok = ch + ch;
    if (ch === '(' || ch === '[' || ch === '{') { onToken(tok); depth++; }
    else if (ch === ')' || ch === ']' || ch === '}') { depth--; onToken(tok); }
    else if (ch === '+' && src[i + 1] === '+') { tok = '++'; onToken('x'); }
    else onToken(tok);
    prevSig = tok; i += tok.length;
  }
  closeChain();
  // render chains as patterns, renumbering placeholders
  const chainPats = [], members = new Set();
  for (const c of chains) {
    let k = 0, s = '';
    for (const x of c) {
      if (x.ph) s += '{' + (k++) + '}';
      else { members.add(x.lit); s += x.lit.replace(/\{(\d+)\}/g, () => '{' + (k++) + '}'); }
    }
    chainPats.push(s.replace(/(\{\d+\})(?:\{\d+\})+/g, '$1').replace(/\{\d+\}/g, (() => { let j = 0; return () => '{' + (j++) + '}'; })()));
  }
  return { lits, chainPats, members };
}
function unescapeJs(s) { return s.replace(/\\(['"`\\])/g, '$1').replace(/\\n/g, '\n'); }
const STOP = new Set(['INPUT', 'TEXTAREA', 'Escape', 'Delete', 'Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'SHA-256', 'PBKDF2', 'AES-GCM', 'POST', 'GET', 'Prefer', 'Content-Type', 'Authorization']);
function visible(s) {
  const t = s.replace(/\{\d+\}/g, '').replace(/&[a-z]+;/g, ' ').trim();
  if (!/[A-Za-z]{2}/.test(t) || STOP.has(t)) return false;
  if (/^(#|rgba?\(|hsla?\(|\.\/|assets\/|js\/|https?:|data:|image\/|application\/|\(pointer|\(max-|\(prefers)/.test(t)) return false;
  if (/^[a-z][a-zA-Z0-9_\-]*$/.test(t)) return false;
  if (/^[\w\-]+\.(png|js|css|json|mp3|html)$/.test(t)) return false;
  if (/(^|\s)(bold |italic )?[\d.]+px /.test(t) || /monospace|sans-serif/.test(t)) return false;
  if (/^(rest\/v1|return=|apikey|Bearer)/.test(t)) return false;
  if (/^[a-z]+(\s[a-z]+)*$/.test(t) && !/\s/.test(t.trim())) return false;
  return true;
}
function pieces(s) { // split HTML into text pieces; keep plain strings whole
  if (!/<[a-z\/][^>]*>/i.test(s)) return [s];
  return s.split(/<[^>]*>/).map(x => x.replace(/\s+/g, ' ')).filter(x => x.trim());
}
const all = new Map();
const add = (s, f) => { for (let p of pieces(unescapeJs(s))) { p = p.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'); if (p.trim() && visible(p) && !all.has(p.trim())) all.set(p.trim(), f); } };
for (const f of FILES) {
  const { lits, chainPats, members } = scan(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  const counts = {}; for (const l of lits) counts[l] = (counts[l] || 0) + 1;
  for (const c of chainPats) add(c, f);
  for (const l of lits) if (!members.has(l) || counts[l] > 1) add(l, f);
}
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
for (const m of html.matchAll(/>([^<>]*[A-Za-z][^<>]*)</g)) add(m[1].trim(), 'index.html');
for (const m of html.matchAll(/title="([^"]+)"/g)) add(m[1], 'index.html');
fs.mkdirSync(path.join(ROOT, 'lang'), { recursive: true });
const list = [...all.entries()].map(([en, file]) => ({ en, file }));
fs.writeFileSync(path.join(ROOT, 'lang', 'strings-en.json'), JSON.stringify(list, null, 1));
console.log(list.length, 'strings');
