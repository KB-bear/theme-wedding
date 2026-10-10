// Global leaderboard on Supabase (see supabase/setup.sql). Leave LB_URL empty to use local scores only.
const LB_URL = '';   // e.g. https://abcdxyz.supabase.co
const LB_KEY = '';   // the project's public "anon" key (safe to publish)
const LB = {
  on: !!(LB_URL && LB_KEY),
  _h() { return { apikey: LB_KEY, Authorization: 'Bearer ' + LB_KEY, 'Content-Type': 'application/json' }; },
  // resolves to [{player, score, day, title}] best-first, or null if unavailable
  top(n) {
    if (!LB.on) return Promise.resolve(null);
    return fetch(`${LB_URL}/rest/v1/leaderboard?select=player,score,day,title&order=score.desc&limit=${n || 10}`, { headers: LB._h() })
      .then(r => r.ok ? r.json() : null).catch(() => null);
  },
  submit(player, score, day, title) {
    if (!LB.on || !player) return Promise.resolve(false);
    return fetch(`${LB_URL}/rest/v1/scores`, { method: 'POST', headers: { ...LB._h(), Prefer: 'return=minimal' },
      body: JSON.stringify({ player: String(player).slice(0, 14), score: Math.round(score), day, title: String(title || '').slice(0, 40) }) })
      .then(r => r.ok).catch(() => false);
  },
};
