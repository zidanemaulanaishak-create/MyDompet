-- Langkah 5: target keuangan (financial goals) -> Supabase
-- Jalankan di Supabase SQL Editor setelah 0003_categories_budgets.sql.

create table if not exists public.financial_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) >= 3),
  target_amount numeric not null check (target_amount > 0),
  saved_amount numeric not null default 0 check (saved_amount >= 0),
  deadline_label text not null default '',
  deadline_ts bigint not null default 0,
  icon text not null default 'ph:piggy-bank-bold',
  icon_bg text not null default '#FDF2E9',
  icon_color text not null default '#C2410C',
  image_uri text,
  created_at timestamptz not null default now()
);

create index if not exists financial_goals_user_created_idx
  on public.financial_goals (user_id, created_at desc);

alter table public.financial_goals enable row level security;

drop policy if exists "financial_goals_select_own" on public.financial_goals;
create policy "financial_goals_select_own" on public.financial_goals
  for select using (auth.uid() = user_id);

drop policy if exists "financial_goals_insert_own" on public.financial_goals;
create policy "financial_goals_insert_own" on public.financial_goals
  for insert with check (auth.uid() = user_id);

drop policy if exists "financial_goals_update_own" on public.financial_goals;
create policy "financial_goals_update_own" on public.financial_goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "financial_goals_delete_own" on public.financial_goals;
create policy "financial_goals_delete_own" on public.financial_goals
  for delete using (auth.uid() = user_id);
