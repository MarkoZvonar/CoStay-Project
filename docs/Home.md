# CoStay — Projektna dokumentacija

**Kolegij:** [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz), Fakultet elektrotehnike i računarstva Sveučilišta u Zagrebu  
**Akademska godina:** 2026./2027.  
**Tim:** L-A-10.1, Palačinke  
**Nastavnik:** Vlado Sruk  
**Asistent / demonstrator:** Saša Kendjel (asistent)

## Pregled projekta

**Cilj:** Omogućiti čitatelju koji prvi put vidi projekt da u dvije ili tri rečenice prepozna aplikaciju, njezine ciljane korisnike i glavnu svrhu.

CoStay je web-aplikacija namijenjena putnicima koji žele pronaći suputnike radi dijeljenja troškova smještaja. Korisnicima omogućuje objavljivanje planiranih putovanja s već odabranim smještajem te pregledavanje i prijavljivanje na postojeća putovanja. Cilj aplikacije je olakšati pronalazak suputnika i organizaciju zajedničkog smještaja.

<details>
<summary><strong>Sažet pregled projekta</strong></summary>

Za projekt na temu CrisisMap sažet pregled može navesti građane kojima trebaju informacije o kriznim događajima povezane s njihovom lokacijom te cilj aplikacije da prijave kriznih događaja prikaže na karti. Funkcionalnost spomenite samo ako pripada odobrenom zadatku tima; bez dokaza nemojte tvrditi da aplikacija poboljšava odgovor hitnih službi. Ovo je primjer informativnog pregleda, a ne tekst za prepisivanje niti dokaz da je funkcionalnost ostvarena.

</details>

**Aplikacija i osnovno postavljanje:** [README repozitorija](../README_PREDLOZAK.md#quick-start)  
**Javno dostupna aplikacija:** pogledajte [README – Postavljanje](../README_PREDLOZAK.md#deployment)

## Članovi tima i uloge

Ažurirani popis članova, njihovih GitHub profila i glavnih uloga ili doprinosa nalazi se u [README-u repozitoriju](../README_PREDLOZAK.md#team-members).

## Kazalo dokumentacije

| Stranica                                                                                      | Svrha                                                                   |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [1. Opseg projekta](1-Projekt.md)                                                             | Problem, cilj i granice projekta                                        |
| [2. Analiza zahtjeva](2-Analiza-zahtjeva.md)                                                  | Zahtjevi, ograničenja i sljedivost                                      |
| [3. Obrasci uporabe](3-Obrasci-uporabe.md)                                                    | Akteri i reprezentativne interakcije korisnika                          |
| [4. Arhitektura i oblikovanje](4-Arhitektura-i-oblikovanje.md)                                | Glavne odluke oblikovanja, struktura, podaci i ponašanje                |
| [5. Ispitivanje](5-Ispitivanje.md)                                                            | Pristup ispitivanju, stvarni rezultati i poznati nedostaci              |
| [6. Postavljanje, instalacija i konfiguracija](6-Postavljanje-instalacija-i-konfiguracija.md) | Lokalna instalacija, konfiguracija, javno postavljanje i administracija |
| [7. Zaključak i budući rad](7-Zakljucak-i-buduci-rad.md)                                      | Zaključak i moguća daljnja poboljšanja                                  |
| [A. Pregled aktivnosti grupe](A-Pregled-aktivnosti-grupe.md)                                  | Aktivnosti tima, doprinosi i izazovi                                    |

## Ključne točke projekta

| Kontrolna točka | Demonstracija                                     | Video                                                       |
| --------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| Iteracija 1     | https://costayx.onrender.com |                 |
| Završni pregled | [Poveznica na završnu inačicu projekta]           | [Poveznica na video završne demonstracije, ako je snimljen] |

Dokumentacija se kontinuirano ažurira kako se aplikacija razvija.

## Organizacija projekta i razvojni proces

**Način rada:** Razvoj projekta organiziran je podjelom zadataka među članovima tima. Zadaci se evidentiraju putem GitHub Issues, a njihova raspodjela, status i napredak prate se putem GitHub Projects ploče „PlanBoard”. Članovi tima rade na dodijeljenim zadacima, a promjene se prate putem zajedničkog GitHub repozitorija. Tim se jednom tjedno sastaje radi pregleda ostvarenog napretka, dogovora o sljedećim zadacima i određivanja prioriteta.  
**Praćenje trenutačnih zadataka i nedostataka:** [GitHub Issues](https://github.com/MarkoZvonar/CoStay-Project/issues) | [GitHub Projects](https://github.com/users/MarkoZvonar/projects/1/views/1)

<details>
<summary><strong>Opis načina rada tima</strong></summary>

**Primjer — CrisisMap:**

Navedite pristup koji tim stvarno koristi. Tim koji razvija CrisisMap može organizirati prijave, rad na karti i provjere kao GitHub Issues, jednom tjedno raspraviti prioritete i iznad postaviti poveznicu na svoju aktivnu ploču zadataka. Takav je konkretan opis procesa informativniji od tvrdnje da tim koristi „Scrum” ako zapravo ne primjenjuje njegove prakse. Stvarni tim treba navesti vlastiti ritam rada i odgovornosti; dokumentacija ne treba duplicirati ploču zadataka. Primjer opisuje mogući tijek rada (engl. workflow), a ne tvrdi da je objavljeni tim CrisisMapa radio upravo tako.

</details>

## Pravila dokumentacije

Dokumentacija se sastoji od međusobno povezanih Markdown stranica. Obavezni UML dijagrami izrađuju se u PlantUML-u, uz PlantUML izvor u dokumentaciji sačuvajte i čitljivu sliku. Primjeri u ovom predlošku kolegija pokazuju kako nešto dokumentirati; nisu dio rezultata studentskog projekta.

<details>
<summary><strong>Izvori dijagrama i nastavni primjeri</strong></summary>

Nastavni primjeri pretpostavljaju React/Vite klijentski dio, Node.js poslužiteljski dio, PostgreSQL, smještaj aplikacije na Renderu i Selenium WebDriver (JavaScript). Vaš tehnološki skup može biti drukčiji; u dokumentaciji opišite ono što stvarno koristite.

Za obrazac uporabe podnošenja prijave kriznog događaja u CrisisMapu tim može čuvati UML izvor u `.puml` datoteci, prikazati odgovarajuću sliku na relevantnoj stranici dokumentacije te ažurirati oboje kada se interakcija promijeni. Koristite stvarni dijagram i stvarno postavljanje vlastitog projekta. Domena ili tehnologija prikazana u primjeru ne postaje zahtjev osim ako je dio odobrenog zadatka.

> Napomena o primjerima: Blokovi „Primjer — CrisisMap" nastavni su scenarij, a ne rezultat ičijeg projekta; ne prepisujte ih. U primjerima se koriste React, Node.js, PostgreSQL, Render i Selenium samo radi dosljednosti. Vaš stog može biti drukčiji (npr. Java/Spring); dokumentirajte ono što stvarno koristite.</details>

## Akademski integritet, ponašanje i licenciranje

README repozitorija sadrži projektnu [izjavu o uporabi umjetne inteligencije](../README_PREDLOZAK.md#ai-usage), [informacije o kodeksu ponašanja i podršci](../README_PREDLOZAK.md#code-of-conduct-and-support) te [status licence ili ponovne uporabe](../README_PREDLOZAK.md#license). Pristupni podaci i druge tajne nikada se ne objavljuju u dokumentaciji niti dijele u običnim porukama.

## Izjava o uporabi umjetne inteligencije

<!-- UPUTA: Ovo je detaljan zapis uporabe umjetne inteligencije; README sadrži kratak sažetak i poveznicu na ovaj odjeljak. Unesite samo ono što se stvarno dogodilo i uklonite neupotrijebljene retke. Ako nije korišten nijedan alat generativne umjetne inteligencije, zamijenite cijeli odjeljak jednom rečenicom koja to jasno navodi. Svaki redak mora upućivati na stranicu, datoteku, zahtjev za uključivanje promjena (PR) ili zadatak. Nikada ne unosite pristupne podatke, osobne podatke ni tuđi zaštićeni sadržaj u alate umjetne inteligencije. -->

Kratak sažetak: [README – Uporaba umjetne inteligencije](../README_PREDLOZAK.md#ai-usage). Ovaj odjeljak bilježi koji su alati korišteni, za koju dokumentaciju ili kod te kako je tim provjerio rezultat. Slijedi FER-ova [pravila o primjerenoj uporabi umjetne inteligencije](https://www.fer.unizg.hr/_download/repository/Policy%20on%20the%20appropriate%20use%20of%20artificial%20intelligence%20at%20the%20faculty%20of%20electrical%20engineering%20and%20computing%5B1%5D.pdf).

### Korišteni alati

| Alat          | Inačica ili model                  | Koristio/la         | Glavna svrha                                                     |
| ------------- | ---------------------------------- | ------------------- | ---------------------------------------------------------------- |
| Gemini        | Nema informacija                   | Sven Prelogović     | Pomoć pri pisanju koda i pri pisanju dokumentacije               |
| ChatGPT       | Nema informacija                   | Leon Marković       | Pomoć pri pisanju koda i pri pisanju dokumentacije               |
| ChatGPT       | Nema informacija                   | Nika Ugarković Štimac      | Pomoć pri izradi baze podataka i postavljanja politika u bazi podataka te pri pisanju dokumentacije               |
| ChatGPT       | Nema informacija                   | Dora Arnold       | Pomoć pri pisanju koda i pri pisanju dokumentacije               |
| ChatGPT       | Nema informacija                   | Marko Zvonar       | Pomoć pri pisanju koda i pri pisanju dokumentacije te oko deploy-a               |
| ChatGPT       | Nema informacija                   | Iva Tomić      | Pomoć pri pisanju koda i pri pisanju dokumentacije te oko deploy-a               |
| ChatGPT       | Nema informacija                   | Lovro Krčmarić       | Pomoć pri pisanju koda, pri pisanju dokumentacije           |

### Opseg doprinosa umjetne inteligencije

| Stranica, datoteka ili artefakt   | Vrsta pomoći                                                              | Što je alat proizveo | Što je tim zadao i promijenio                                   | Lokacija                                       |
| --------------------------------- | ------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------- | ---------------------------------------------- |
| [npr. 3. Obrasci uporabe, UC-002] | [Izrada nacrta / preoblikovanje / prijevod / izvor dijagrama / sažimanje] | [Kratak opis]        | [Ulaz zadan alatu; dodane, ispravljene ili uklonjene činjenice] | [Stranica dokumentacije, `.puml` datoteka, PR] |
|   3. Obrasci uporabe, UC - 013                     |  Pomoć pri stavljanju podataka koje je korisnik unio u bazu podataka (frontend i backend)     | Alat je generirao kod koji pomoću ugrađenih metoda u JavaScript-u (npr. .select() ili .insert()) ubacuje podatke u bazu podataka. Također kod mi je pomogao da s preglednika šaljem formatirane podatke na poslužitelj. Također, napisao je i error handling.  | Tim nije ništa promijenio  | api.js
|  create.css                        | Stilska dosljednost; Htjeli smo da svi css file-ovi imaju isti stil (font, boje, margine, veličine objekata...)  | Alat je generirao CSS kod na temelju .html (.ejs) file-ova  | Ništa | create.css
|  3. Obrasci uporabe, UC - 013           | Pomoć pri stvaranju nevidljivog objekta koji iskače kada korisnik unese datum odlaska koji je prije datuma dolaska | Alat je prozveo dijelić ejs koda koji stvara nevidljivi objekt, također u css-u mu je dao i stil, a u JavaScript-u mi je generirao blok koji ako je navedeni uvjet istinit pokazuje taj objekt |  Ništa  | create.ejs, create.css, create.js |
|  Kartice objava na profilu           | Pomoć pri izradi EJS predloška za postojeće kartice | Alat je proizveo zajednički EJS predložak za kartice (korisnikove objave/zahtjeve/spremljene objave), oblikovan prema kartici na Discoveru.|  Zadan je primjer kartice iz discover.ejs. Tim je rezultat prilagodio profilu  | profileposts.ejs |
|  Profilna slika          | Pomoć pri učitavanju i spremanju profilne slike |Alat je generirao funkciju koja koristi Node.js paket Multer za primanje profilne slike i predložio kod za njezino spremanje u Supabase Storage  |  Generirana funkcija uklopljena je u kod za uređivanje profila | routes/profile.js, edit-profile.ejs |
|  Obrazac za uređivanje profila          | Pomoć pri izradi obrasca za uređivanje podataka profila |Alat je generirao EJS kod obrasca za uređivanje profilne slike, imena, prezimena, mjesta stanovanja i opisa korisnika.  |  Generirani obrazac je prilagođen profilu tako da se polja ispravno dinamički popunjavaju postojećim podacima korisnika.    | edit-profile.ejs |
|  edit-profile.css          | Pomoć pri stiliziranju stranice za uređivanje profila | Alat je predložio CSS izmjene za oblikovanje obrasca | Alatu je dostavljen postojeći edit-profile.css i zatražene su dorade izgleda obrasca.     | edit-profile.css |

Stranice i artefakti koji nisu navedeni iznad izrađeni su bez pomoći generativne umjetne inteligencije. [Po želji: kao dodatne retke navedite kod ili ispitivanja izrađena uz pomoć umjetne inteligencije.]

### Provjera generiranog sadržaja

| Provjera                                      | Kako je provedena                                                                                                              | Dokaz                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Činjenična točnost                            | [Svaka tvrdnja o funkcionalnostima, ponašanju ili arhitekturi uspoređena je s pokrenutom aplikacijom i kodom]                  | [Imena pregledavatelja; poveznice na zahtjev za uključivanje promjena (PR) ili zadatak] |
| Nema tvrdnji o neostvarenim funkcionalnostima | [Provjereno je da opisane funkcionalnosti, ispitivanja i rezultati stvarno postoje; planirani rad označen je kao planiran]     | [Usporedba s odjeljkom 5.4 (Ispitivanje) i odjeljkom 7.1 (Zaključak)]                   |
| Dosljednost s drugim stranicama               | [Nazivi, ID-ovi i dijagrami provjereni su prema Analizi zahtjeva, Obrascima uporabe, Arhitekturi i oblikovanju te Ispitivanju] | [Kontrolni popis ili bilješka pregleda]                                                 |
| Izvori dijagrama                              | [Generirani PlantUML je iscrtan, ispravljen i odgovara implementiranom sustavu]                                                | [`.puml` datoteka i izrađena slika]                                                     |
| Povjerljivi sadržaj                           | [Kako je tim osigurao da u upite ili dokumentaciju nisu unesene tajne, pristupni podaci ni osobni podaci]                      | [Primijenjeni postupak]                                                                 |

### Pogreške pronađene u izlazu umjetne inteligencije

| Problem                                                 | Kako je pronađen                                   | Rješenje                |
| ------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| [Netočna, izmišljena ili iz predloška preuzeta tvrdnja] | [Pregled, ispitivanje ili usporedba s aplikacijom] | [Ispravak s poveznicom] |
| Prilikom ubacivanja podataka u bazu podataka, nismo mogli ubacivati podatke zbog politika baze podataka (RLS politike). AI alat je rekao da te politike maknemo jer nisu potrebne, iako jesu. | Problem je pronađen prilikom chat-a s AI alatom. | Rješenje kojeg smo se dosjetili nije da maknemo RLS politike koje su ključne, već da u metode stavimo RequireRegistered parametar koji provjeri sesiju, token i identitet

<!-- UPUTA: Zabilježite stvarne ispravke ili napišite „Nisu utvrđene”. Općenita tvrdnja poput „sav tekst je pregledan” nije dokaz; dokaz su prethodne tablice. Tim mora moći objasniti svaku rečenicu koju objavi. -->

<details>
<summary><strong>Primjer zapisa uporabe umjetne inteligencije</strong></summary>

**Primjer — CrisisMap:**

| Stranica ili artefakt                     | Vrsta pomoći    | Što je alat proizveo                          | Što je tim zadao i promijenio                                                                             | Lokacija                                    |
| ----------------------------------------- | --------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 3. Obrasci uporabe, UC-002                | Izrada nacrta   | Prvu inačicu glavnog i alternativnih tijekova | Tim je zadao stvarna polja obrasca i uklonio granu prijave u sustav koja u aplikaciji ne postoji          | Primjer PR #31                              |
| Sekvencijski dijagram, podnošenje prijave | Izvor dijagrama | Nacrt PlantUML-a                              | Tim je uskladio nazive sudionika s komponentama i uklonio korak slanja obavijesti koji nije implementiran | `diagrams/report-submission.puml` (primjer) |

| Problem                                                                    | Kako je pronađen                                             | Rješenje                                                       |
| -------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| U tekstu je stajalo da se obavijesti dostavljaju unutar jedne minute       | Usporedba s Ispitivanjem (5.4): dostava nikada nije ispitana | Tvrdnja je uklonjena; obavijesti su navedene pod Budućim radom |
| Nacrt je kopirao primjer zahtjeva F-005 iz predloška kao projektni zahtjev | Usporedba s vlastitim popisom zahtjeva tima                  | Zamijenjeno stvarnim zahtjevom tima                            |

**Analiza primjera:** Svaki redak navodi stranicu ili datoteku, ono što je alat generirao i ono što je tim promijenio. Pogreške su tipične za generiranu dokumentaciju: funkcionalnost koja ne postoji i tekst predloška prikazan kao činjenica o projektu. Tvrdnje poput „AI je korišten svugdje” ili „sav tekst je pregledan” nije moguće provjeriti. Ovo je nastavni scenarij, a ne opis objavljenog projekta.

</details>
