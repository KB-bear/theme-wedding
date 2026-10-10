'use strict';
/* =========================================================
   THEME WEDDING — language support
   The game is written in English. When Russian is picked, every piece of
   text that reaches the screen is looked up in lang/ru.js:
     - exact strings:  "Dancing!"           -> "Танцует!"
     - patterns:       "{0} has been sick!" -> "{0} стошнило!"   ({0} = a name etc.)
   Page text is translated as it appears (a MutationObserver), and canvas text
   goes through tr() where it is drawn. Anything without a translation stays English.
   ========================================================= */
const LANG = (() => { try { return localStorage.getItem('tw_lang') === 'ru' ? 'ru' : 'en'; } catch (e) { return 'en'; } })();
const I18N = { exact: new Map(), pats: [], cache: new Map(), ready: false };
function setLang(l) { try { localStorage.setItem('tw_lang', l); } catch (e) {} location.reload(); }
function i18nInit() {
  if (I18N.ready) return; I18N.ready = true;
  const D = window.LANG_RU || {};
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const en in D) {
    const ru = D[en]; if (!ru) continue;
    if (!/\{\d+\}/.test(en)) {
      I18N.exact.set(en.trim(), ru);
      if (/^[a-z]/.test(en.trim()) && /\s/.test(en.trim())) addPat('{0} ' + en.trim(), '{0} ' + ru); // "is doing the worm!" after a name
      continue;
    }
    addPat(en, ru);
  }
  function addPat(en, ru) {
    const parts = en.split(/(\{\d+\})/), order = [];
    const lits = parts.filter((p, i) => i % 2 === 0);
    const litLen = lits.join('').replace(/\s/g, '').length;
    if (litLen < 3 || /\}\{/.test(en)) return; // "{0} {1}" or "{0}{1}" would match anything
    const re = '^' + parts.map((p, i) => { if (i % 2) { order.push(+p.slice(1, -1)); return '([\\s\\S]*?)'; } return esc(p); }).join('') + '$';
    const anchor = lits.slice().sort((a, b) => b.length - a.length)[0];
    I18N.pats.push({ re: new RegExp(re), order, ru, anchor, len: litLen });
  }
  I18N.pats.sort((a, b) => b.len - a.len);
}
function trCore(s, depth) {
  if (I18N.exact.has(s)) return I18N.exact.get(s);
  for (const p of I18N.pats) {
    if (p.anchor && s.indexOf(p.anchor) < 0) continue;
    const m = p.re.exec(s); if (!m) continue;
    const vals = {};
    p.order.forEach((k, i) => { vals[k] = depth < 3 ? trAny(m[i + 1], depth + 1) : m[i + 1]; });
    return p.ru.replace(/\{(\d+)\}/g, (x, k) => vals[k] !== undefined ? vals[k] : x);
  }
  return null;
}
function trAny(s, depth) {
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s); const core = m[2];
  if (!core || !/[A-Za-z]/.test(core)) return s;
  if (depth && / and /.test(core) && core.split(' ').length <= 5 && !/[.!?]/.test(core)) return s.replace(/ and /g, ' и '); // "Dan and Rob"
  let r = trCore(core, depth || 0);
  if (r === null) { // a choice label with its risk tag: "Tell the Prague story  [Risky]"
    const t = /^([\s\S]*?)(\s+)\[([A-Za-z\- ]+)\]$/.exec(core);
    if (t) r = trAny(t[1], (depth || 0) + 1) + t[2] + '[' + trAny(t[3], (depth || 0) + 1) + ']';
  }
  if (r === null && core.indexOf('·') >= 0) { // "DAY 1 · Sunny · Goat Escape": translate each part
    const bits = core.split(/(\s*·\s*)/); const t = bits.map((b, i) => i % 2 ? b : trAny(b, (depth || 0) + 1));
    if (t.some((x, i) => x !== bits[i])) r = t.join('');
  }
  if (r === null && (depth || 0) < 2) { // try sentence by sentence
    const bits = core.split(/(?<=[.!?…"])\s+(?=[A-Z"'(])/);
    if (bits.length > 1) { const t = bits.map(b => trAny(b, (depth || 0) + 1)); if (t.some((x, i) => x !== bits[i])) r = t.join(' '); }
  }
  return r === null ? s : m[1] + r + m[3];
}
// translate one string (no-op in English)
function tr(s) {
  if (LANG !== 'ru' || typeof s !== 'string' || !s) return s;
  i18nInit();
  const c = I18N.cache.get(s); if (c !== undefined) return c;
  const r = trAny(s, 0);
  if (I18N.cache.size > 4000) I18N.cache.clear();
  I18N.cache.set(s, r);
  return r;
}
// fonts that have Cyrillic letters
const UI_FONT = LANG === 'ru' ? '"Tiny5", "Courier New", monospace' : '"VT323", "Courier New", monospace';

// ---------- page text ----------
(function () {
  if (LANG !== 'ru') return;
  document.documentElement.lang = 'ru';
  const l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Tiny5&display=swap'; document.head.appendChild(l);
  document.body.classList.add('ru');
  const SKIP = { INPUT: 1, TEXTAREA: 1, SCRIPT: 1, STYLE: 1 };
  const doText = (n) => { if (n.parentNode && SKIP[n.parentNode.nodeName]) return; const v = n.nodeValue, t = tr(v); if (t !== v) n.nodeValue = t; };
  const doEl = (el) => {
    if (el.nodeType !== 1 || SKIP[el.nodeName]) return;
    for (const a of ['title', 'placeholder']) { const v = el.getAttribute(a); if (v) { const t = tr(v); if (t !== v) el.setAttribute(a, t); } }
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n; while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else for (const a of ['title', 'placeholder']) { const v = n.getAttribute(a); if (v) { const t = tr(v); if (t !== v) n.setAttribute(a, t); } } }
  };
  doEl(document.body);
  document.title = tr(document.title);
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === 'characterData') doText(m.target);
      else if (m.type === 'attributes') doEl(m.target);
      else for (const n of m.addedNodes) { if (n.nodeType === 3) doText(n); else doEl(n); }
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'placeholder'] });
})();
