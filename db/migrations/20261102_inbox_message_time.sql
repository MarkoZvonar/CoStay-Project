-- Pokrenuti jednom kroz Supabase SQL Editor prije korištenja inboxa.
-- Za postojeće poruke stvarno vrijeme slanja nije moguće rekonstruirati.
-- Njima dodjela stupca postavlja vrijeme izvođenja ove migracije.
begin;
alter table public."PORUKA"
  add column if not exists vrijeme_slanja timestamptz not null default now();
create index if not exists poruka_razgovor_vrijeme_idx
  on public."PORUKA" (id_razgovor, vrijeme_slanja desc, id_poruka desc);
create index if not exists sugovornik_korisnik_idx
  on public."SUGOVORNIK" (id_sugovornik, id_razgovor);
commit;
