# Početni inbox

Implementirani su popis postojećih izravnih razgovora, pregled zadnjih 100 poruka i slanje tekstualne poruke (do 2000 znakova). Sučelje osvježava podatke svakih pet sekundi dok je kartica vidljiva. Grupe, pokretanje razgovora iz objave i WebSocket komunikacija još nisu implementirani.

## Priprema baze

1. Pregledaj i pokreni `migrations/20261102_inbox_message_time.sql` u Supabase SQL Editoru. Dopuna dodaje vrijeme poruke i indekse. Stvarno vrijeme i redoslijed starih poruka nisu poznati; kod jednakih vremena koristi se UUID kao dosljedan dodatni redoslijed.
2. Korisnik je potvrdio da je `KORISNIK.id_korisnik = auth.users.id`. Profil ipak mora postojati u KORISNIK. Registracija sprema profil, a inbox provjerava odgovara li prijavljenom računu.
3. Za početni razgovor pregledaj `inbox-test-conversation.sql`, zamijeni tri oznake stvarnim ID-jevima pa izvrši jednom. Razgovor se povezuje s postojećom objavom jer je `RAZGOVOR.id_objava NOT NULL`. Ako postoje razgovori s oba sudionika, ovaj korak preskoči.
4. Pregledaj i pokreni `migrations/20261102_inbox_membership_policy.sql` kao postgres kroz SQL Editor. Dopuna ispravlja rekurziju prikazanog SELECT pravila za SUGOVORNIK. Kod ne isključuje RLS i ne koristi service-role ključ.
5. Pokreni aplikaciju iz backend mape naredbom `npm start`. Ponovno se prijavi kako bi nova sesija sadržavala pristupni token pa otvori `/inbox`.
6. Prijavi drugog sudionika u zasebnom pregledniku ili privatnom prozoru. Provjeri slanje u oba smjera i pojavu novih poruka nakon najviše pet sekundi. Treći korisnik ne smije vidjeti razgovor niti dohvatiti poruke poznatim ID-jem razgovora.

## Potrebna RLS pravila

Pregledana su četiri pravila sa slika:

- PORUKA INSERT provjerava članstvo i `id_posiljatelj = auth.uid()`; izraz odgovara potrebama inboxa.
- PORUKA SELECT i RAZGOVOR SELECT provjeravaju članstvo kroz SUGOVORNIK; izrazi odgovaraju potrebama inboxa nakon ispravka rekurzije.
- SUGOVORNIK SELECT izravno čita istu tablicu, zbog čega nastaje RLS rekurzija. Pripremljena migracija mijenja samo to pravilo da poziva pomoćnu funkciju iz sheme `costay_private`. Funkcija koristi identitet trenutačnog korisnika, vraća samo boolean i izvodi provjeru s pravima vlasnika postgres. `search_path` je prazan, objekti imaju pune nazive, a izvršavanje je dopušteno samo ulozi authenticated. Tu shemu ne dodavati u Supabase Exposed schemas.
- KORISNIK SELECT još nije pregledan. Mora omogućiti čitanje vlastitog profila i imena sugovornika. Ako se razgovor prikazuje kao „Korisnik”, provjeriti to pravilo.
- Administratorska ALL pravila nisu pregledana niti promijenjena. Ako sama uključuju rekurzivne upite, trebaju zaseban pregled.
- Običnim korisnicima za ovu početnu verziju nisu potrebni INSERT na RAZGOVOR/SUGOVORNIK niti UPDATE/DELETE na PORUKA. Testni razgovor priprema administrator kroz SQL Editor.

Rješenje s pomoćnom funkcijom u neizloženoj shemi slijedi [Supabase dokumentaciju za RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

Za pregled izraza može se koristiti ovaj upit (nema korisničkih poruka ni ključeva):

```sql
select tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('KORISNIK', 'RAZGOVOR', 'SUGOVORNIK', 'PORUKA');
```

## Dogovor s dijelom za prijavu

Za daljnji razvoj inboxa nije potrebno čekati završetak prijave. Za isprobavanje sa stvarnim računima kolegičin dio treba:

- nakon uspješne i provjerene Supabase prijave spremiti `req.session.user.id = user.id` i `req.session.accessToken = accessToken` u poslužiteljsku Express sesiju; to već radi izmijenjeni `authController.js`;
- osigurati da u KORISNIK postoji dovršen profil s istim ID-jem;
- zadržati sesijski kolačić `app.sid` i omogućiti prijavljenom korisniku pristup `/inbox`;
- pri odjavi uništiti sesiju; middleware `refreshSession` prije API ruta obnavlja token i zapisuje ga u isto polje sesije koje čita inbox.

Token ne spremati u `req.session.user` jer endpoint `/api/current-user` vraća taj objekt pregledniku. Ne uvoditi zajednički Supabase klijent s promjenjivim korisničkim tokenom: inbox koristi zaseban klijent po zahtjevu.

Ruta `/inbox` koristi `requireRegistered` i otvara inbox korisniku s dovršenim profilom. API provjerava valjani token, postojanje profila i članstvo u razgovoru.

## Ograničenja

Supabase token ostaje na poslužitelju. Svaki zahtjev ima zaseban Supabase klijent s korisnikovim tokenom; `getUser` provjerava njegov identitet. Ako obnova sesije više nije moguća, korisnik se mora ponovno prijaviti.

API ne prima ID pošiljatelja od preglednika i dodatno provjerava članstvo, ali RLS i dalje mora zasebno štititi izravne pozive bazi. Stvarna integracija s udaljenom bazom još nije potvrđena: prethodni pokušaj čitanja strukture s konfiguriranim ključem vratio je HTTP 401. Ako se to ponovi, provjeri SUPABASE_URL i SUPABASE_ANON_KEY u lokalnom backend/.env bez dijeljenja ključeva u chatu.

## Lokalne provjere

`npm test` u backend mapi izvršava 10 testova API-ja s testnim podacima.

`bash db/tests/run-inbox-rls.sh` iz korijena projekta stvara zasebnu privremenu PostgreSQL bazu, reproducira originalnu rekurziju 42P17, primjenjuje SQL dopune i provjerava pristup obaju članova, odbijanje lažnog pošiljatelja te zabranu pristupa trećem i anonimnom korisniku. Provjerava i ponovljeno izvršavanje SQL ispravka. Potrebni su lokalni PostgreSQL alati `initdb`, `pg_ctl` i `psql`. Skripta ne koristi `.env`, ne spaja se na Supabase i gasi privremenu bazu nakon završetka.

Obje provjere prolaze. SQL test koristi izraze četiriju poslanih pravila u izoliranoj bazi; ne obuhvaća nepoznata administratorska pravila ni KORISNIK pravila u zajedničkom projektu.
