-- RUČNI PRIMJER za Supabase SQL Editor. Zamijeni sva tri UUID-a stvarnim ID-jevima.
-- Pokrenuti jednom: svako izvršavanje stvara novi razgovor.
-- Oba korisnika moraju već postojati u KORISNIK, a objava u OBJAVA.
-- Njihov id_korisnik za ovu implementaciju treba odgovarati auth.users.id.
begin;
do $$
declare
  prvi uuid := 'OVDJE-ID-PRVOG-KORISNIKA';
  drugi uuid := 'OVDJE-ID-DRUGOG-KORISNIKA';
  objava uuid := 'OVDJE-ID-POSTOJECE-OBJAVE';
  razgovor uuid;
begin
  if prvi = drugi then raise exception 'Odaberi dva različita korisnika'; end if;
  insert into public."RAZGOVOR" (razgovor_tip, id_objava)
    values ('izravan', objava) returning id_razgovor into razgovor;
  insert into public."SUGOVORNIK" (id_razgovor, id_sugovornik)
    values (razgovor, prvi), (razgovor, drugi);
end $$;
commit;
