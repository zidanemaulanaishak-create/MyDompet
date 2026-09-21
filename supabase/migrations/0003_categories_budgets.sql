-- Langkah 3: kategori & budget -> Supabase
-- Jalankan di Supabase SQL Editor setelah 0002_transactions.sql.

-- 1) Tabel kategori (lookup/referensi ERD)
create table if not exists public.categories (
  id text primary key,
  label text not null,
  icon text not null,
  type text not null check (type in ('expense', 'income'))
);

alter table public.categories enable row level security;

drop policy if exists "categories_read" on public.categories;
create policy "categories_read" on public.categories
  for select using (true);

insert into public.categories (id, label, icon, type) values
  ('food', 'Makanan & Minuman', 'twemoji:pot-of-food', 'expense'),
  ('shopping', 'Belanja', 'twemoji:shopping-bags', 'expense'),
  ('transport', 'Transportasi', 'twemoji:oncoming-automobile', 'expense'),
  ('bills', 'Tagihan & Bayar', 'twemoji:receipt', 'expense'),
  ('health', 'Kesehatan', 'twemoji:medical-symbol', 'expense'),
  ('entertainment', 'Hiburan', 'twemoji:clapper-board', 'expense'),
  ('education', 'Pendidikan', 'twemoji:open-book', 'expense'),
  ('personal', 'Perawatan Diri', 'twemoji:person-getting-haircut', 'expense'),
  ('gift', 'Hadiah & Amal', 'twemoji:wrapped-gift', 'expense'),
  ('other', 'Lainnya', 'twemoji:label', 'expense'),
  ('salary', 'Gaji', 'twemoji:briefcase', 'income'),
  ('freelance', 'Freelance / Sampingan', 'twemoji:laptop', 'income'),
  ('investment', 'Investasi', 'twemoji:chart-increasing', 'income'),
  ('gift_income', 'Hadiah', 'twemoji:wrapped-gift', 'income'),
  ('refund', 'Pengembalian', 'twemoji:counterclockwise-arrows-button', 'income'),
  ('other_income', 'Lainnya', 'twemoji:money-with-wings', 'income')
on conflict (id) do nothing;

-- 2) FK transaksi -> kategori (nullable; hapus kategori = set null)
alter table public.transactions drop constraint if exists transactions_category_id_fkey;
alter table public.transactions
  add constraint transactions_category_id_fkey
  foreign key (category_id) references public.categories(id) on delete set null;

-- 3) Tabel budget
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,
  category_id text not null references public.categories(id) on delete cascade,
  limit_amount numeric not null check (limit_amount >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, month_key, category_id)
);

create index if not exists budgets_user_month_idx
  on public.budgets (user_id, month_key);

alter table public.budgets enable row level security;

drop policy if exists "budgets_select_own" on public.budgets;
create policy "budgets_select_own" on public.budgets
  for select using (auth.uid() = user_id);

drop policy if exists "budgets_insert_own" on public.budgets;
create policy "budgets_insert_own" on public.budgets
  for insert with check (auth.uid() = user_id);

drop policy if exists "budgets_update_own" on public.budgets;
create policy "budgets_update_own" on public.budgets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "budgets_delete_own" on public.budgets;
create policy "budgets_delete_own" on public.budgets
  for delete using (auth.uid() = user_id);