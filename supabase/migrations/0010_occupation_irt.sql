do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%occupation%'
  loop
    execute format('alter table public.profiles drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.profiles
  add constraint profiles_occupation_check
  check (occupation is null or occupation in ('pekerja', 'pelajar', 'mahasiswa', 'irt'));
