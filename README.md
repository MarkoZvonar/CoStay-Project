
# CoStay

CoStay je web-aplikacija za pronalazak suputnika i organizaciju zajedničkih putovanja. Omogućuje objavljivanje planiranih putovanja, pretraživanje postojećih objava i povezivanje korisnika koji žele podijeliti troškove smještaja.

**Projekt na kolegiju:** Aplikaciju razvija studentski tim **Palačinke (L-A-10.1)** u sklopu kolegija [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz) na Fakultetu elektrotehnike i računarstva Sveučilišta u Zagrebu (FER), akademske godine 2026./2027.

## Opis aplikacije

Pronalazak suputnika sa sličnim interesima, odredištem i terminom putovanja može biti zahtjevan, a samostalno rezerviranje smještaja skupo. CoStay povezuje putnike koji žele organizirati zajednički boravak i podijeliti troškove smještaja.

**Ključne funkcionalnosti:**

- **Registracija i prijava:** prijava e-poštom i lozinkom ili putem Googlea i GitHuba (OAuth 2.0 / OpenID Connect), potvrda e-pošte, oporavak lozinke i dovršavanje obaveznog korisničkog profila.
- **Korisnički profil:** pregled i uređivanje podataka profila te interesa.
- **Objave:** kreiranje objava za putovanja, prikaz objava u Discoveru i spremanje zanimljivih objava.
- **Pretraživanje:** filtriranje objava prema lokaciji, organizatoru, datumima, cijeni, kapacitetu i oznakama (tagovima); pregled rezultata na karti te prostorno pretraživanje uz radijus od 0 do 100 km.
- **Pridruživanje i komunikacija:** slanje zahtjeva za pridruživanje te razgovori putem Inboxa uz Supabase Realtime.

Neprijavljeni korisnici mogu pregledavati Discover i koristiti Search. Za pristup zaštićenim funkcionalnostima, kao što su Create, Inbox i Profile, potrebni su prijava i dovršen profil.

Za potpuni opseg, zahtjeve, oblikovanje sustava i dokaze ispitivanja pogledajte [projektnu dokumentaciju](https://github.com/MarkoZvonar/CoStay-Project/blob/master/docs/Home.md).

## Postavljanje (engl. deployment)

**Javno dostupna aplikacija:** [https://costayx.onrender.com/](https://costayx.onrender.com/)

Aplikacija je javno postavljena na platformi **Render** te koristi **Supabase** za bazu podataka, autentifikaciju i komunikaciju u stvarnom vremenu.

**Isprobajte:**

1. Otvorite javnu adresu i odaberite **Nastavi kao Guest**. Pregledajte objave u Discoveru i isprobajte Search, uključujući filtre te pretraživanje na karti s radijusom od 0 do 100 km.
2. Odaberite **Sign up** te se registrirajte e-poštom i lozinkom ili putem Googlea odnosno GitHuba. Potvrdite identitet i dovršite obavezni korisnički profil.
3. Kao prijavljeni korisnik isprobajte kreiranje objave, spremanje objava, slanje zahtjeva za pridruživanje, Inbox i uređivanje profila.

**Demonstracija i prijava:** Za pregledavanje i pretraživanje nije potreban korisnički račun. Gost koji pokuša pristupiti zaštićenim funkcionalnostima (npr. Create, Inbox, Profile) preusmjerava se na prijavu.

Pri **registraciji e-poštom** potrebno je unijeti valjanu adresu i odabrati lozinku. Korisnik prima poveznicu za potvrdu e-pošte, koju u trenutačnoj inačici treba otvoriti **u istom pregledniku** u kojem je započeo registraciju. Nakon potvrde prijavljuje se putem Log in te dovršava profil. Pri **prijavi putem Googlea ili GitHuba** aplikacija nakon uspješne autentifikacije izravno upućuje na nadopunu profila ako je to potrebno. Nakon dovršetka profila sljedeće prijave vode u aplikaciju.

CoStay razlikuje potvrđeni identitet u **Supabase Authu** od potpuno registriranog korisnika čiji su obavezni podaci upisani u tablicu **`KORISNIK`**. Obrazloženje je u [poglavlju 4.1 – Ključne arhitekturne odluke](https://github.com/MarkoZvonar/CoStay-Project/blob/master/docs/4-Arhitektura-i-oblikovanje.md).

**Zaboravljena lozinka:** Korisnik može pokrenuti oporavak lozinke putem e-pošte. U trenutačnoj inačici poveznicu za oporavak također treba otvoriti u istom pregledniku u kojem je postupak započet.

**Sigurnosna ponašanja:** Učestali ili višestruki neuspješni pokušaji registracije, prijave i oporavka lozinke mogu uzrokovati privremeno ograničenje novih pokušaja. Pri pokušaju registracije već postojeće adrese prikazuje se neutralna poruka koja ne otkriva postoji li račun. Pri prijavi istim identitetom preko podržanih pružatelja aplikacija može prepoznati postojeći korisnički profil.

**Ograničenja trenutačne inačice:**

- Cijena se još ne prilagođava automatski broju sudionika odnosno konačnoj podjeli troškova.
- Recenzije sudionika nisu implementirane.
- Administratorsko sučelje sa statistikom nije implementirano.
- Zasebne obavijesti e-poštom o događajima vezanima uz putovanja nisu implementirane; e-pošta se koristi za potvrdu registracije i oporavak lozinke putem Supabasea.
- Poveznice za potvrdu računa i oporavak lozinke trenutačno treba otvarati u istom pregledniku u kojem je postupak započet.
- Dio ostalih funkcionalnih zahtjeva opisanih u dokumentaciji ostaje za daljnji razvoj.

[Vodič za postavljanje, instalaciju i konfiguraciju](https://github.com/MarkoZvonar/CoStay-Project/blob/master/docs/6-Postavljanje-instalacija-i-konfiguracija.md) nalazi se u projektnoj dokumentaciji.

## Brzi početak / instalacija

**Preduvjeti:**

- **Node.js v24.16.0** – inačica korištena u razvoju.
- **npm** i **Git**.
- Pristup konfiguriranom **Supabase** projektu s potrebnom shemom baze, RLS pravilima i postavkama autentifikacije.

**Preuzimanje projekta i instalacija ovisnosti:**

```bash
git clone https://github.com/MarkoZvonar/CoStay-Project.git
cd CoStay-Project/backend
npm ci
```

**Konfiguracija:** U direktoriju `backend/` stvorite datoteku `.env` s vrijednostima primjerenima vlastitom okruženju:

```dotenv
SUPABASE_URL=
SUPABASE_ANON_KEY=
SESSION_SECRET=
BASE_URL=http://localhost:3000
PORT=3000
```

- `SUPABASE_URL` – URL Supabase projekta.
- `SUPABASE_ANON_KEY` – javni (anon/publishable) ključ Supabase projekta; pristup podacima ograničen je RLS pravilima.
- `SESSION_SECRET` – tajna, nasumično generirana vrijednost za Express sesije.
- `BASE_URL` – osnovna adresa aplikacije koja se koristi pri preusmjeravanju.
- `PORT` – port poslužitelja; zadana je vrijednost `3000`.

Prve tri varijable obavezne su za pokretanje poslužitelja. Supabase Auth mora biti konfiguriran za željene načine prijave i odgovarajuće povratne adrese. Za rad karte potrebna je odgovarajuća konfiguracija usluge Google Maps API.

**Nikada ne objavljujte stvarni sadržaj `.env` datoteke, tajne ključeve, pristupne tokene ni lozinke u Git repozitoriju.**

**Pokretanje aplikacije:** Iz direktorija `backend/` pokrenite:

```bash
node src/app.js
```

Moguće je koristiti i ekvivalentnu naredbu definiranu u `backend/package.json`:

```bash
npm start
```

**Adresa:** [http://localhost:3000](http://localhost:3000), ako `PORT` nije promijenjen.

**Provjera rada:** Otvorite [http://localhost:3000/health](http://localhost:3000/health). Očekivani odgovor:

```json
{"status":"healthy"}
```

Zatim otvorite početnu stranicu i provjerite prikaz Discovera. Za isprobavanje autentifikacije, spremanja i dohvaćanja podataka potrebna je valjana konfiguracija vanjskih usluga.

Za detalje pogledajte [projektnu dokumentaciju](https://github.com/MarkoZvonar/CoStay-Project/blob/master/docs/Home.md).

## Tehnologije

| **Tehnologija ili alat** | **Uloga u ovom projektu** | **Razlog uporabe ili važno ograničenje** |
| --- | --- | --- |
| Node.js i Express | Poslužiteljski dio, HTTP rute, kontroleri i obrada zahtjeva. | JavaScript na poslužiteljskoj strani i modularna organizacija aplikacije. |
| EJS, HTML, CSS i JavaScript | Dinamičke stranice i responzivno korisničko sučelje. | EJS omogućuje prikaz podataka iz poslužiteljskih ruta bez zasebne SPA aplikacije. |
| Supabase (PostgreSQL) | Pohrana korisnika, objava, interesa, lokacija i poruka. | Relacijski model i RLS pravila za kontrolu pristupa podacima. |
| Supabase Auth i OAuth 2.0 / OpenID Connect | Registracija, prijava, Google/GitHub, potvrda e-pošte i oporavak lozinke. | Identitet i dovršenost profila provjeravaju se zasebno; važna je konfiguracija povratnih URL-ova. |
| express-session | Održavanje prijave između HTTP zahtjeva. | U produkciji zahtijeva sigurnu konfiguraciju sesija i kolačića. |
| Supabase Realtime | Dopisivanje i ažuriranje razgovora u Inboxu. | Ovisnost o dostupnosti usluge i pravilima pristupa razgovorima. |
| Google Maps API | Karta i prostorno pretraživanje putovanja. | Ovisnost o vanjskoj usluzi, API konfiguraciji i njezinim uvjetima uporabe. |
| Render | Javno izvođenje web-aplikacije. | Dostupnost ovisi o konfiguraciji i resursima platforme. |
| Git i GitHub | Verzioniranje, Issues, Pull Requestovi i timski razvoj. | Rad u odvojenim granama olakšava usklađivanje i pregled promjena. |

Za arhitekturna obrazloženja pogledajte [4. Arhitektura i oblikovanje](https://github.com/MarkoZvonar/CoStay-Project/blob/master/docs/4-Arhitektura-i-oblikovanje.md).

## Članovi tima

Projekt razvija tim **Palačinke**, grupa **L-A-10.1**.

| **Član** | **Glavna uloga ili doprinos** |
| --- | --- |
| Dora Arnold | Autentifikacija, registracija i prijava. |
| Lovro Krčmarić | Discover i pregledavanje objava. |
| Leon Marković | Filtiranje i pretraga objava, interaktivna karta |
| Sven Prelogović | Kreiranje objava. |
| Marko Zvonar | Inbox i dopisivanje korisnika. |
| Iva Tomić | Korisnički profil i uređivanje profila. |
| Nika Ugarković Štimac | Baza podataka. |

Repozitorij, commitovi, Pull Requestovi i evidencija zadataka pružaju dodatni uvid u timski rad.

## Doprinos projektu

Zadaci i nedostaci evidentiraju se putem [GitHub Issues](https://github.com/MarkoZvonar/CoStay-Project/issues) i projektne ploče **PlanBoard**. Članovi razvijaju funkcionalnosti na zasebnim Git granama, a promjene usklađuju i spajaju putem Pull Requestova. Za svakodnevne dogovore koriste WhatsApp i timske sastanke.

**Status licence:** Izvorni kod aplikacije CoStay zaštićen je
autorskim pravom. Sva prava pridržana (All Rights Reserved).
Izvorni kod javno je dostupan na GitHubu radi pregleda i
upoznavanja s projektom. Bez prethodnog dopuštenja nositelja
autorskih prava nije dopuštena njegova ponovna uporaba,
distribucija ili izrada i distribucija izvedenih verzija,
osim u opsegu dopuštenom zakonom ili uvjetima platforme GitHub. Datoteka [LICENSE](https://github.com/MarkoZvonar/CoStay-Project/blob/master/LICENSE) sadržava **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)** licencu obrazovnog dokumentacijskog predloška, koja se ne primjenjuje automatski na studentski aplikacijski kod.

Vanjske usluge i programske biblioteke zadržavaju vlastite licence i uvjete uporabe, uključujući Supabase i Google Maps.

## Uporaba umjetne inteligencije [AI Usage: Disclosed](https://www.fer.unizg.hr/_download/repository/Policy%20on%20the%20appropriate%20use%20of%20artificial%20intelligence%20at%20the%20faculty%20of%20electrical%20engineering%20and%20computing%5B1%5D.pdf)

Ovaj projekt slijedi [FER-ova pravila o primjerenoj uporabi umjetne inteligencije](https://www.fer.unizg.hr/_download/repository/Policy%20on%20the%20appropriate%20use%20of%20artificial%20intelligence%20at%20the%20faculty%20of%20electrical%20engineering%20and%20computing%5B1%5D.pdf).

**Izjava:** U razvoju projekta korišteni su **ChatGPT (OpenAI)** i **Claude (Anthropic)** kao pomoć pri razumijevanju programskih koncepata, izradi i refaktoriranju koda, otklanjanju poteškoća te pisanju i oblikovanju dokumentacije. Za ispravnost, razumijevanje i provjeru rezultata odgovorni su članovi tima. Sadržaj nastao uz pomoć umjetne inteligencije treba pregledati, uskladiti sa zahtjevima i provjeriti prije uključivanja u završnu inačicu.

Privatni podaci, pristupni tokeni i tajne konfiguracijske vrijednosti ne smiju se unositi u alate umjetne inteligencije.

## Kodeks ponašanja i podrška [Contributor Covenant](https://github.com/MarkoZvonar/CoStay-Project/blob/master/CODE_OF_CONDUCT.md)

Od članova tima očekuje se pridržavanje [Kodeksa ponašanja projekta](https://github.com/MarkoZvonar/CoStay-Project/blob/master/CODE_OF_CONDUCT.md), Kodeksa ponašanja studenata FER-a, pravila timskog rada na kolegiju i [Etičkog kodeksa IEEE-a](https://www.ieee.org/about/corporate/governance/p7-8.html).

Nedostaci i prijedlozi poboljšanja mogu se prijaviti putem [GitHub Issues](https://github.com/MarkoZvonar/CoStay-Project/issues).

---

Struktura dokumentacije prilagođena je predlošku kolegija Programsko inženjerstvo FER-a autora [Vlade Sruka](https://www.fer.unizg.hr/vlado.sruk), licenciranom pod [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Aplikaciju i njezin sadržaj razvija gore navedeni studentski tim.
