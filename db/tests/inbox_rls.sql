-- SAMO za praznu, izoliranu lokalnu testnu bazu kao postgres.
-- Ne pokretati u zajedničkom Supabase projektu: ovo stvara testne tablice i uloge.
\set ON_ERROR_STOP on
create role authenticated nologin;
create role anon nologin;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
grant usage on schema auth to authenticated, anon;
create table public."RAZGOVOR" (id_razgovor uuid primary key);
create table public."SUGOVORNIK" (
  id_razgovor uuid references public."RAZGOVOR", id_sugovornik uuid,
  primary key(id_razgovor, id_sugovornik)
);
create table public."PORUKA" (
  id_poruka uuid primary key default gen_random_uuid(),
  id_razgovor uuid references public."RAZGOVOR", id_posiljatelj uuid, poruka text
);
alter table public."RAZGOVOR" enable row level security;
alter table public."SUGOVORNIK" enable row level security;
alter table public."PORUKA" enable row level security;
grant select on public."RAZGOVOR", public."SUGOVORNIK", public."PORUKA" to authenticated, anon;
grant insert on public."PORUKA" to authenticated;

-- Izrazi iz dostavljenih slika.
create policy "Samo članovi razgovora mogu vidjeti sudionike tog razgovora"
on public."SUGOVORNIK" for select to public using (
  exists(select 1 from public."SUGOVORNIK" s
    where s.id_razgovor = "SUGOVORNIK".id_razgovor and s.id_sugovornik = auth.uid())
);
create policy razgovor_select on public."RAZGOVOR" for select to public using (
  exists(select 1 from public."SUGOVORNIK" s
    where s.id_razgovor = "RAZGOVOR".id_razgovor and s.id_sugovornik = auth.uid())
);
create policy poruka_select on public."PORUKA" for select to public using (
  exists(select 1 from public."SUGOVORNIK" s
    where s.id_razgovor = "PORUKA".id_razgovor and s.id_sugovornik = auth.uid())
);
create policy poruka_insert on public."PORUKA" for insert to public with check (
  exists(select 1 from public."SUGOVORNIK" s
    where s.id_razgovor = "PORUKA".id_razgovor and s.id_sugovornik = auth.uid())
  and id_posiljatelj = auth.uid()
);
insert into public."RAZGOVOR" values ('33333333-3333-4333-8333-333333333333');
insert into public."SUGOVORNIK" values
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111'),
  ('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222');
insert into public."PORUKA" (id_razgovor,id_posiljatelj,poruka) values
  ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Prva poruka');

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
do $$ begin
  begin
    perform 1 from public."SUGOVORNIK";
    raise exception 'Očekivana rekurzija nije nastala';
  exception when sqlstate '42P17' then null;
  end;
end $$;
reset role;
\echo 'PASS: originalna politika reproducira rekurziju 42P17'

\ir ../migrations/20261102_inbox_message_time.sql
\ir ../migrations/20261102_inbox_membership_policy.sql
-- Ponovno izvođenje mora biti dopušteno.
\ir ../migrations/20261102_inbox_membership_policy.sql
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
do $$ begin
  if (select count(*) from public."SUGOVORNIK") <> 2 then raise exception 'Član ne vidi oba sudionika'; end if;
  if (select count(*) from public."RAZGOVOR") <> 1 then raise exception 'Član ne vidi razgovor'; end if;
  if (select count(*) from public."PORUKA") <> 1 then raise exception 'Član ne vidi poruku'; end if;
  if not costay_private.je_sudionik_razgovora('33333333-3333-4333-8333-333333333333') then raise exception 'Pogrešna provjera članstva'; end if;
end $$;
insert into public."PORUKA" (id_razgovor,id_posiljatelj,poruka) values
  ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Druga poruka');
do $$ begin
  begin
    insert into public."PORUKA" (id_razgovor,id_posiljatelj,poruka) values
      ('33333333-3333-4333-8333-333333333333','22222222-2222-4222-8222-222222222222','Podmetnuti pošiljatelj');
    raise exception 'Podmetanje pošiljatelja dopušteno';
  exception when insufficient_privilege then null;
  end;
end $$;
\echo 'PASS: član vidi sudionike i poruke, šalje svoju poruku, ne može podmetnuti pošiljatelja'

set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
do $$ begin
  if (select count(*) from public."PORUKA") <> 2 then raise exception 'Drugi član ne vidi novu poruku'; end if;
end $$;
\echo 'PASS: drugi član vidi novu poruku'

set request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';
do $$ begin
  if (select count(*) from public."SUGOVORNIK") <> 0 then raise exception 'Otkriveni tuđi sudionici'; end if;
  if (select count(*) from public."RAZGOVOR") <> 0 then raise exception 'Otkriven tuđi razgovor'; end if;
  if (select count(*) from public."PORUKA") <> 0 then raise exception 'Otkrivene tuđe poruke'; end if;
  if costay_private.je_sudionik_razgovora('33333333-3333-4333-8333-333333333333') then raise exception 'Nečlan ima članstvo'; end if;
  begin
    insert into public."PORUKA" (id_razgovor,id_posiljatelj,poruka) values
      ('33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444','Nedopuštena poruka');
    raise exception 'Nečlan smije slati';
  exception when insufficient_privilege then null;
  end;
end $$;
\echo 'PASS: treći korisnik nema pristup čitanju ni slanju'

reset role;
set role anon;
set request.jwt.claim.sub = '';
do $$ begin
  if (select count(*) from public."SUGOVORNIK") <> 0 then raise exception 'Anon vidi sudionike'; end if;
  if (select count(*) from public."PORUKA") <> 0 then raise exception 'Anon vidi poruke'; end if;
  begin
    perform costay_private.je_sudionik_razgovora('33333333-3333-4333-8333-333333333333');
    raise exception 'Anon smije pozvati helper';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
do $$ begin
  if has_function_privilege('anon','costay_private.je_sudionik_razgovora(uuid)','execute') then raise exception 'Anon ima execute pravo'; end if;
end $$;
\echo 'PASS: anonimni korisnik ne vidi podatke i ne može pozvati pomoćnu funkciju'
