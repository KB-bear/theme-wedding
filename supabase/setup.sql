-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
create table if not exists public.scores (
  id         bigint generated always as identity primary key,
  player     text   not null check (char_length(player) between 1 and 14),
  score      int    not null check (score between 0 and 50000),
  day        int    not null check (day between 1 and 999),
  title      text   check (char_length(title) <= 40),
  created_at timestamptz not null default now()
);

alter table public.scores enable row level security;

-- Anyone with the public key may add a score. Nobody can edit or delete.
create policy "anyone can insert scores" on public.scores
  for insert to anon with check (true);

-- Leaderboard = each player's best score. Readers see only this view, not the table.
create or replace view public.leaderboard as
  select distinct on (lower(player)) player, score, day, title
  from public.scores
  order by lower(player), score desc;

grant insert on public.scores to anon;
grant select on public.leaderboard to anon;
