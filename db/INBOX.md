# Početni inbox

Implementirani su popis postojećih izravnih i grupnih razgovora, pregled zadnjih 100 poruka i slanje tekstualne poruke (do 2000 znakova). Grupa prikazuje sudionike i ime autora uz svaku poruku. Supabase Realtime preko WebSocketa javlja pregledniku kad je dodana nova poruka. Pokretanje razgovora iz objave i automatsko stvaranje grupa još nisu implementirani.

## Raspored koda prema timskom tutorijalu

- `backend/src/routes/inbox.js` je izravno izvezeni router za cijelu karticu. `GET /inbox` prikazuje EJS, `GET /inbox/razgovori` vraća razgovore, a GET i POST na `/inbox/razgovori/:id/poruke` čitaju i spremaju poruke.
- `app.js` uključuje router jednom pod `/inbox`, nakon sesije i `refreshSession`. Ruta je premještena iz `pages.js`, a inbox je uklonjen iz `api.js`.
- Svaka zaštićena ruta koristi postojeći `requireRegistered`. Profil dolazi iz `req.korisnik`, a token iz `req.session.accessToken`.
- Rute koje čitaju ili pišu bazu izravno stvaraju `korisnickiSupabase` pozivom bibliotečnog `createClient`. Nakon svakog upita provjerava se `error`, koji se prosljeđuje zajedničkoj obradi grešaka inboxa. Ponovljene provjere identiteta i pomoćni `createUserClient` uklonjeni su iz inbox implementacije.
- `frontend/src/pages/inbox.ejs` sadrži strukturu prikaza, `inbox.css` izgled, a `frontend/src/services/inbox.js` događaje obrasca i HTTP pozive prema `/inbox/...`.

## Priprema baze

1. Pregledaj i pokreni `migrations/20261102_inbox_message_time.sql` u Supabase SQL Editoru. Dopuna dodaje vrijeme poruke i indekse. Stvarno vrijeme i redoslijed starih poruka nisu poznati; kod jednakih vremena koristi se UUID kao dosljedan dodatni redoslijed.
2. Korisnik je potvrdio da je `KORISNIK.id_korisnik = auth.users.id`. Profil ipak mora postojati u KORISNIK. Registracija sprema profil, a inbox provjerava odgovara li prijavljenom računu.
3. Za početni razgovor pregledaj `inbox-test-conversation.sql`, zamijeni tri oznake stvarnim ID-jevima pa izvrši jednom. Razgovor se povezuje s postojećom objavom jer je `RAZGOVOR.id_objava NOT NULL`. Ako postoje razgovori s oba sudionika, ovaj korak preskoči.
4. Pregledaj i pokreni `migrations/20261102_inbox_membership_policy.sql` kao postgres kroz SQL Editor. Dopuna ispravlja rekurziju prikazanog SELECT pravila za SUGOVORNIK. Kod ne isključuje RLS i ne koristi service-role ključ.
5. Pokreni aplikaciju iz backend mape naredbom `npm start`. Ponovno se prijavi kako bi nova sesija sadržavala pristupni token pa otvori `/inbox`.
6. Prijavi drugog sudionika u zasebnom pregledniku ili privatnom prozoru. Provjeri slanje u oba smjera i pojavu novih poruka bez ručnog osvježavanja. Treći korisnik ne smije vidjeti razgovor niti dohvatiti poruke poznatim ID-jem razgovora.

## Postojeći grupni razgovor

- U RAZGOVOR treba postojati grupni redak povezan s objavom. Tip različit od `izravan` označava grupu; prazna vrijednost tipa prikazuje se kao izravni razgovor radi kompatibilnosti.
- Za svakog člana, uključujući autora putovanja, u SUGOVORNIK mora postojati redak s istim `id_razgovor` i njegovim `id_sugovornik`. Sam redak u RAZGOVOR ne daje članstvo.
- Naziv se sastavlja iz imena ostalih sudionika uz oznaku „Grupa”. Zaglavlje prikazuje sve dostupne sudionike, a poruke ime pošiljatelja. Postojeća shema nema stupac za vlastiti naziv grupe.
- Čitanje i slanje provjeravaju članstvo za obje vrste razgovora. Ista postojeća RLS pravila vrijede i za grupe. KORISNIK SELECT treba omogućiti čitanje imena autora poruka.
- Za testiranje otvori isti grupni razgovor s računima članova u odvojenim preglednicima. Poruka jednog člana treba automatski postati vidljiva ostalima. Korisnik bez članstva ne smije dohvatiti grupu ni poslati poruku.

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

## Realtime i sesija

- U Supabase publikaciji `supabase_realtime` uključi `public."PORUKA"`. Postgres Changes šalje INSERT događaje prema postojećem SELECT RLS pravilu za `PORUKA`. Uključi RLS i primijeni ispravak rekurzije za `SUGOVORNIK` prije testiranja pristupa.
- `/inbox/supabase.js` poslužuje već instaliranu Supabase biblioteku za preglednik. `inbox.ejs` učitava je prije inbox skripte i predaje adresu projekta te javni ključ.
- `/inbox/realtime-session` koristi `requireRegistered` i vraća samo korisnikov trenutačni pristupni token. `refreshSession` po potrebi obnavlja token prije te rute. Token za obnovu ostaje u sesiji, a preglednik drži pristupni token u memoriji dok je veza otvorena.
- Događaj o novoj poruci poziva postojeći dohvat razgovora i poruka. Isto se dogodi nakon ponovne pretplate, kako bi se dohvatilo što je stiglo tijekom prekida. Gumb „Osvježi” i povratak na karticu također pokreću dohvat.
- U DevTools → Network → WS možeš provjeriti vezu i INSERT događaj. Testiraj s dva člana razgovora i računom koji mu ne pripada. Dostava događaja u zajedničkoj bazi ovisi o ispravnom RLS-u i publikaciji.
