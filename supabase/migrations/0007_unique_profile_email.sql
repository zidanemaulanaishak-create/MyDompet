-- Langkah 7: pastikan 1 email = 1 akun di level profiles
-- Auth (auth.users) sudah menegakkan unik email; ini pengaman tambahan untuk data profil.
-- Catatan: jika ada duplikat email di profiles, statement index unik akan gagal — bersihkan dulu.

create unique index if not exists profiles_email_unique_idx
  on public.profiles (lower(email))
  where email is not null;
