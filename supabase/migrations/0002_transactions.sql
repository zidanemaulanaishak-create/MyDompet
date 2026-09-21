-- Langkah 2: transaksi -> Supabase
-- Jalankan di Supabase SQL Editor.

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  category_id text,
  icon text,
  note text,
  type text not null check (type in ('expense', 'income')),
  currency text not null default 'IDR',
  amount numeric not null check (amount > 0),
  tx_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, tx_date desc);

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);