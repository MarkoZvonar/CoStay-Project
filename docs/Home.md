# CoStay — Projektna dokumentacija

**Kolegij:** [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz), Fakultet elektrotehnike i računarstva Sveučilišta u Zagrebu  
**Akademska godina:** 2026./2027.  
**Tim:** L-A-10.1, Palačinke  
**Nastavnik:** Vlado Sruk  
**Asistent / demonstrator:** Saša Kendjel (asistent)

## Pregled projekta

CoStay je web-aplikacija namijenjena putnicima koji žele pronaći suputnike radi dijeljenja troškova smještaja. Korisnicima omogućuje objavljivanje planiranih putovanja s odabranim smještajem te pregledavanje postojećih putovanja i slanje zahtjeva za pridruživanje. Cilj aplikacije je olakšati pronalazak suputnika i organizaciju zajedničkog smještaja.

**Aplikacija i osnovno postavljanje:** [README repozitorija](../README.md#brzi-početak--instalacija)  
**Javno dostupna aplikacija:** [CoStay na Renderu](https://costayx.onrender.com/) ([upute u README-u](../README.md#postavljanje-engl-deployment))

## Članovi tima i uloge

Ažurirani popis članova i njihovih glavnih doprinosa nalazi se u [README-u repozitorija](../README.md#članovi-tima).

## Kazalo dokumentacije

| Stranica | Svrha |
| --- | --- |
| [1. Opseg projekta](1-Projekt.md) | Problem, cilj i granice projekta |
| [2. Analiza zahtjeva](2-Analiza-zahtjeva.md) | Zahtjevi, ograničenja i sljedivost |
| [3. Obrasci uporabe](3-Obrasci-uporabe.md) | Akteri i reprezentativne interakcije korisnika |
| [4. Arhitektura i oblikovanje](4-Arhitektura-i-oblikovanje.md) | Glavne odluke oblikovanja, struktura, podaci i ponašanje |
| [5. Ispitivanje](5-Ispitivanje.md) | Pristup ispitivanju, stvarni rezultati i poznati nedostaci |
| [6. Postavljanje, instalacija i konfiguracija](6-Postavljanje-instalacija-i-konfiguracija.md) | Lokalna instalacija, konfiguracija, javno postavljanje i administracija |
| [7. Zaključak i budući rad](7-Zakljucak-i-buduci-rad.md) | Zaključak i moguća daljnja poboljšanja |
| [A. Pregled aktivnosti grupe](A-Pregled-aktivnosti-grupe.md) | Aktivnosti tima, doprinosi i izazovi |

## Ključne točke projekta

| Kontrolna točka | Demonstracija | Video |
| --- | --- | --- |
| Iteracija 1 | [Javno postavljena aplikacija](https://costayx.onrender.com/) | Nije navedeno |
| Završni pregled | Još nije objavljeno | Još nije objavljeno |

Dokumentacija se kontinuirano ažurira kako se aplikacija razvija.

## Organizacija projekta i razvojni proces

**Način rada:** Razvoj projekta organiziran je podjelom zadataka među članovima tima. Zadaci se evidentiraju putem GitHub Issues, a njihova raspodjela, status i napredak prate se putem GitHub Projects ploče „PlanBoard”. Članovi tima razvijaju dodijeljene funkcionalnosti na zasebnim granama te usklađuju promjene putem Pull Requestova. Za svakodnevnu komunikaciju koriste WhatsApp, a jednom tjedno održavaju sastanak radi pregleda napretka, dogovora o sljedećim zadacima i određivanja prioriteta.

**Praćenje trenutačnih zadataka i nedostataka:** [GitHub Issues](https://github.com/MarkoZvonar/CoStay-Project/issues) | [GitHub Projects — PlanBoard](https://github.com/users/MarkoZvonar/projects/1/views/1)

## Pravila dokumentacije

Dokumentacija se sastoji od međusobno povezanih Markdown stranica. UML dijagrami izrađuju se u PlantUML-u. Njihovi izvori pohranjuju se u direktoriju [`docs/puml/`](puml/), a prikazi u [`docs/assets/diagrams/`](assets/diagrams/). Prilikom izmjene dijagrama potrebno je uskladiti njegov izvor i prikaz sa stvarnim ponašanjem aplikacije.

## Akademski integritet, ponašanje i licenciranje

README repozitorija sadrži [izjavu o uporabi umjetne inteligencije](../README.md#uporaba-umjetne-inteligencije-ai-usage-disclosed), [informacije o kodeksu ponašanja i podršci](../README.md#kodeks-ponašanja-i-podrška-contributor-covenant) te [status licence ili ponovne uporabe](../README.md#doprinos-projektu). Status licence aplikacijskog koda treba razlikovati od licence nastavnog dokumentacijskog predloška. Pristupni podaci i druge tajne ne objavljuju se u dokumentaciji niti dijele u običnim porukama.

## Izjava o uporabi umjetne inteligencije

Kratak sažetak nalazi se u [README-u — Uporaba umjetne inteligencije](../README.md#uporaba-umjetne-inteligencije-ai-usage-disclosed). Ovaj odjeljak evidentira poznate primjere uporabe alata pri izradi koda i dokumentacije. Projekt slijedi [FER-ova pravila o primjerenoj uporabi umjetne inteligencije](https://www.fer.unizg.hr/_download/repository/Policy%20on%20the%20appropriate%20use%20of%20artificial%20intelligence%20at%20the%20faculty%20of%20electrical%20engineering%20and%20computing%5B1%5D.pdf).

### Korišteni alati

| Alat | Inačica ili model | Koristio/la | Glavna svrha |
| --- | --- | --- | --- |
| Gemini | Nije evidentirano | Sven Prelogović | Pomoć pri pisanju koda i dokumentacije |
| ChatGPT | Nije evidentirano | Leon Marković | Pomoć pri pisanju koda i dokumentacije |
| ChatGPT | Nije evidentirano | Nika Ugarković Štimac | Pomoć pri izradi baze podataka, RLS politika i dokumentacije |
| ChatGPT | Nije evidentirano | Dora Arnold | Pomoć pri pisanju, analizi i refaktoriranju koda te dokumentacije |
| ChatGPT | Nije evidentirano | Marko Zvonar | Pomoć pri pisanju koda, dokumentacije i javnom postavljanju aplikacije |
| ChatGPT | Nije evidentirano | Iva Tomić | Pomoć pri pisanju koda, dokumentacije i javnom postavljanju aplikacije |
| ChatGPT | Nije evidentirano | Lovro Krčmarić | Pomoć pri pisanju koda i dokumentacije |

Prema podacima tima korišten je i **Claude**, no u ovom zapisu nije navedeno koji ga je član koristio ni na kojem dijelu projekta, pa ta uporaba nije pripisana određenoj osobi.

### Opseg doprinosa umjetne inteligencije

| Stranica, datoteka ili artefakt | Vrsta pomoći | Što je alat proizveo | Što je tim zadao i promijenio | Lokacija |
| --- | --- | --- | --- | --- |
| 3. Obrasci uporabe, UC-013 | Pomoć pri povezivanju obrasca i baze | Prijedloge za slanje podataka s preglednika na poslužitelj, upis i dohvat putem metoda `.insert()` i `.select()` te obradu pogrešaka. | Prema evidenciji člana tima, generirani dio nije dodatno mijenjan. | `backend/src/routes/api.js` |
| Stilovi stranice za izradu objave | Usklađivanje vizualnog stila | CSS oblikovanje na temelju postojećih EJS stranica. | Prema evidenciji člana tima, generirani CSS nije dodatno mijenjan. | `frontend/src/pages/create.css` |
| 3. Obrasci uporabe, UC-013 | Provjera datuma u obrascu | Prijedlog EJS, CSS i JavaScript koda za upozorenje kada je datum odlaska prije datuma dolaska. | Prema evidenciji člana tima, generirani dio nije dodatno mijenjan. | `frontend/src/pages/create.ejs`, `frontend/src/pages/create.css`, `frontend/src/pages/create.js` |
| Autentifikacija, registracija i oporavak lozinke | Implementacija i otklanjanje pogrešaka | Prijedloge dijelova koda za prijavu Googleom, GitHubom i e-poštom, validaciju podataka i obradu pogrešaka. | Zadani su zahtjevi CoStayja i postojeća struktura baze; prijedlozi su prilagođeni aplikaciji i provjeravani tijekom razvoja. | `backend/src/controllers/authController.js`, `backend/src/routes/auth.js`, `backend/src/routes/pages.js` |
| Sesije i autorizacija korisnika | Analiza i refaktoriranje koda | Prijedloge za provjeru registriranih korisnika, obnovu autentifikacijskih tokena i smanjenje ponavljanja koda. | Rješenja su prilagođena postojećim RLS pravilima i organizaciji aplikacije. | `backend/src/middleware/requireRegistered.js`, `backend/src/middleware/refreshSession.js`, `backend/src/services/refreshTokens.js` |
| Projektna dokumentacija i README | Izrada nacrta i jezično oblikovanje | Prijedloge teksta o autentifikaciji, arhitekturnim odlukama i lokalnom postavljanju aplikacije. | Član tima dostavio je podatke o implementaciji i prilagodio tekst dokumentacijskom predlošku. | [`README.md`](../README.md), [4. Arhitektura i oblikovanje](4-Arhitektura-i-oblikovanje.md), [6. Postavljanje, instalacija i konfiguracija](6-Postavljanje-instalacija-i-konfiguracija.md) |

Tablica prikazuje evidentirane primjere uporabe generativne umjetne inteligencije tijekom razvoja. Ne predstavlja tvrdnju da AI nije korišten u drugim dijelovima projekta. Članovi tima odgovorni su za razumijevanje i provjeru sadržaja koji uključuju u aplikaciju i dokumentaciju.

### Provjera generiranog sadržaja

| Provjera | Način provjere | Relevantni izvor |
| --- | --- | --- |
| Činjenična točnost | Usporedba opisa funkcionalnosti s izvornim kodom i ponašanjem aplikacije. | [`backend/src/`](../backend/src/), [javna aplikacija](https://costayx.onrender.com/) |
| Dosljednost dokumentacije | Usklađivanje naziva i opisa s analizom zahtjeva, obrascima uporabe i arhitekturom. | [2. Analiza zahtjeva](2-Analiza-zahtjeva.md), [3. Obrasci uporabe](3-Obrasci-uporabe.md), [4. Arhitektura i oblikovanje](4-Arhitektura-i-oblikovanje.md) |
| Povjerljivi sadržaj | Provjera da dokumentacija ne sadrži stvarne tajne ključeve, lozinke ili tokene. | [README — konfiguracija](../README.md#brzi-početak--instalacija) |

Navedeni izvori omogućuju provjeru; zasebni zapis o tome tko je pregledao svaki pojedini AI-generirani dio nije priložen u ovoj evidenciji.

### Pogreške pronađene u izlazu umjetne inteligencije

| Problem | Kako je pronađen | Rješenje |
| --- | --- | --- |
| AI alat je predložio uklanjanje RLS pravila kako bi se omogućio upis podataka u bazu, iako su ta pravila važna za sigurnost aplikacije. | Tijekom analize neuspjelih upita i pregleda predloženog rješenja. | RLS pravila su zadržana. Za zaštićene rute koristi se middleware `requireRegistered`, a upiti koji zahtijevaju identitet korisnika izvršavaju se kroz Supabase klijent s odgovarajućim korisničkim tokenom. Sam middleware ne zamjenjuje RLS provjeru u bazi. |
