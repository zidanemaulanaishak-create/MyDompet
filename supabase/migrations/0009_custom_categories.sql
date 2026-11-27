alter table public.categories
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.categories
  add column if not exists is_custom boolean not null default false;

drop policy if exists "categories_read" on public.categories;
create policy "categories_read" on public.categories
  for select using (user_id is null or auth.uid() = user_id);

drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id and user_id is not null and is_custom);

drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id and is_custom)
  with check (auth.uid() = user_id and user_id is not null and is_custom);

drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id and is_custom);

create unique index if not exists categories_user_label_type_key
  on public.categories (user_id, lower(label), type)
  where user_id is not null;

create index if not exists categories_user_id_idx
  on public.categories (user_id)
  where user_id is not null;
