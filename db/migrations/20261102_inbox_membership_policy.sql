-- Pokrenuti kroz Supabase SQL Editor kao postgres (vlasnik s BYPASSRLS pravom).
-- Ispravlja samo prikazano rekurzivno SELECT pravilo za SUGOVORNIK.
-- Ostala pravila, uključujući administratorska, ostaju kakva jesu.
begin;

create schema if not exists costay_private;
revoke all on schema costay_private from public, anon;
grant usage on schema costay_private to authenticated;

-- Pomoćna funkcija vraća samo je li PRIJAVLJENI korisnik član zadanog razgovora.
-- Ne prima ID korisnika i ne otkriva popis sudionika.
-- Shemu costay_private ne dodavati u Supabase Exposed schemas.
create or replace function costay_private.je_sudionik_razgovora(razgovor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public."SUGOVORNIK" as s
    where s.id_razgovor = razgovor_id
      and s.id_sugovornik = (select auth.uid())
  );
$$;

-- Vlasnik funkcije treba zaobići RLS za ovu provjeru da se ne pozove isto pravilo.
alter function costay_private.je_sudionik_razgovora(uuid) owner to postgres;
revoke all on function costay_private.je_sudionik_razgovora(uuid) from public, anon;
grant execute on function costay_private.je_sudionik_razgovora(uuid) to authenticated;

alter policy "Samo članovi razgovora mogu vidjeti sudionike tog razgovora"
on public."SUGOVORNIK"
to authenticated
using (costay_private.je_sudionik_razgovora(id_razgovor));

commit;
