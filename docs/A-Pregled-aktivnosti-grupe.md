# A. Pregled aktivnosti grupe

**Cilj:** Prikazati kako je tim organizirao projekt, raspodijelio rad, reagirao na važne probleme i pridonio rezultatu. Zapisi trebaju opisivati ishode, a ne samo navoditi da je sastanak održan ili da se o nekoj temi raspravljalo.

## A.1 Evidencija sastanaka

**Cilj:** Voditi kratak zapis projektnih sastanaka i tjedne koordinacije: tko je sudjelovao, što je odlučeno i koja je radnja uslijedila. Raspravu koja nije dovela do odluke zabilježite samo ako je važno pitanje ostalo otvoreno.

>Kratice članova tima: DA = Dora Arnold, LK = Lovro Krčmarić, LM = Leon Marković, SP = Sven Prelogović, IT = Iva Tomić, NU = Nika Ugarković-Štimac, MZ = Marko Zvonar.																														

| Datum i sudionici | Glavna tema | Donesena odluka ili zadatak  | Poveznica na zadatak ili  rezultat, ako postoji |
| --- | --- | --- | --- |
| 6. 10. 2026.; DA, LK, LM, NU, MZ  | Odabir teme za projekt | Odabrana tema i ime projekta, izglasano da je MZ voditelj te su odabrani alati | Zadatak #14 |
| 15. 10. 2026.; DA, LK, LM, SP, IT, NU, MZ  | Inicijalna podjela zadataka | Stvaranje GitHub grupe i logoa: MZ; Baza podataka: NU; Stvaranje inicijalnog frontenda: LK, LM; Početna dokumentacija: SP, IT; Stvaranje početnih ruta: DA | Zadatci: #25, #64, #70 |
| 29. 10. 2026.; DA, LK, LM, SP, IT, NU, MZ  | Podjela funkcionalnosti na članove ekipe | DA: Login i Signup; LK: Discover; LM: Search; SP: Create; IT: Profile; NU: Baza podataka; MZ: Inbox | Zadatci #12, #142, #80, #82, #95, #133, #140 |

Za svaki relevantan sastanak ili zapis tjedne koordinacije upišite jedan sažet redak. Dodijeljeni zadatak treba imati odgovornu osobu; za neriješeno pitanje treba navesti tko će ga dalje obraditi. Sam naslov sastanka ne pokazuje što se promijenilo. U ovu evidenciju nemojte kopirati cijeli popis issuea ni prijepis razgovora.


## A.2 Plan rada

**Cilj:** Prikazati planirani redoslijed rada i odgovornosti u timu. Prikažite projektne tjedne ili druga kratka razdoblja koja tim koristi, uključujući pripremu za formalne provjere.

**Praćenje zadataka:** [GitHub Projects — PlanBoard](https://github.com/users/MarkoZvonar/projects/1/views/1).

**Koordinacija podjele poslova:** MZ.

**Pregled dosadašnjeg rada:** [Prvi ciklus, 16.10.–19.11.2026.](./meeting-notes/sprint-01.md). Tablica sažima dogovoreni redoslijed rada i naknadno evidentirane rezultate; razdoblja označavaju glavni fokus, uz preklapanje pojedinih aktivnosti.


<details>
<summary><strong>Primjer plana rada</strong></summary>

**Primjer — CrisisMap:** Plan rada obuhvaća razvoj prijava, karte i postavljanja aplikacije. Za svako razdoblje navedeni su glavni zadaci i odgovorni članovi.

| Razdoblje | Glavni planirani rad | Odgovorni članovi | Poveznica na zadatke/opis |
| --- | --- | --- | --- |
| Projektni tjedan 6 | Obrazac za prijavu i provjera valjanosti lokacije | AK, LM | Zadataka #21 i #23. |
| Projektni tjedan 7 | Povezivanje obrasca s API-jem za prijave | EP | Zadatak #25. |

**Čitanje plana:** Kratice štede prostor u sažetom planu; njihove definicije s početka A.1 vrijede u cijelom ovom primjeru. Kada rad kasni, ažurirajte stvarni zadatak i očekivanje u planu; nemojte tvrditi da je nedovršena funkcionalnost završena samo zato što je predviđeni tjedan prošao.

</details>

## A.3 Aktivnosti i doprinosi članova

**Cilj:** Prikazati koji su članovi radili na važnim projektnim aktivnostima i približan trud koji prijavljuju. Uz implementaciju uključite oblikovanje, dokumentaciju, integraciju, ispitivanje i postavljanje.

| Aktivnost ili rezultat | Član | Prijavljeni sati | Reprezentativni rezultat ili poveznica |
| --- | --- | --- | --- |
| Izrada izgleda osnovne stranice | LK |  | Zadatak #26; |
| Izrada izgleda stranica za prijavu | LM | 3 | Zadatak #63; izgled stranica start.ejs, login.ejs, signup.ejs |
| Dopuna dokumenta 1-Projekt.md | LM | 2 | 1-Projekt.md |
| Dovršavanje dokumenta 1-Projekt.md | IT |  | 1-projekt.md |
| Izrada relacijske sheme baze podataka | NU |  | Zadatak #17; |
| Nomralozacija sheme i definiranje ključeva | NU |  | Zadatak #18; |
| Kreiranje tablica u SQL-u | NU |  | Zadatak #19; |
| Definiranje ograničenja baze podataka | NU |  | Zadatak #20; |
| Stavarnje uloga u bazi podataka | NU |  | Zadatak #21; |
| Izrada ER dijagrama | NU |  | Zadatak #43; |
| Izrada logoa | MZ |  | Zadatak #64; |
| Povezivanje ruta | DA | 2 | Zadatak #50; |
| Podjela signupa na 3 dijela | LM | 2 | signup.ejs je zamjenjen sa signup1.ejs, signup2.ejs i signup3.ejs za lakšu autentifikaciju korisnika |
| Ispis objava | LK |  | Zadatak #98; |
| Posebni Discover za prijavljenog korisnika i za gosta | LK |  | Zadatak #99; |
| Infinite scroll | LK |  | Zadatak #100; |
| Spremanje objava | LK |  | Zadatak #107; |
| Slanje i povlačenje zahtjeva za pridruživanje | NU |  | Zadatak #129; |
| Izrada funkcionalnosti za Search | LM | 4 | Zadaci #134, #136 i #137; Funkcionalnost pretraživanja u /search i testiranje te funkcionalnosti |
| Dodavanje karte u Search | LM | 4 | Zadatak #138; Funkcionalnost otvaranja karte u search/map i testiranje pretrage s kartom |
| Izrada Createa | SP |  | Zadatak #140; |
| Izrada direktnih poruka u inboxu sa POST i GET metodama | MZ |  | Zadatak #91; |
| Izrada grupnih poruka u inboxu sa POST i GET metodama | MZ |  | Zadatak #92; |
| Zamjena GET i POST metoda s WEBSOCKETom i implementacija WEBSOCKETA | MZ |  | Zadatak #93; |
| Dohvat i prikaz podataka prijavljenog korisnika | IT |  | Zadatak #83; |
| Dodavanje profilne slike | IT |  | Zadatak #96; |
| Dodavanje i uklanjanje ključnih riječi | IT |  | Zadatak #84; |
| Dohvat i prikaz objavljenih i spremljenih objava korisnika | IT |  | Zadaci #85 i #88; |
| Omogućiti pregled vlastitih recenzija | NU |  | Zadatak #130; |
| OAuth 2.0: autorizacija za Google i Github | DA | 3 | Zadatak #34; |
| OAuth 2.1: Konfiguracija Supabase Dashboarda i OAuth Providera | DA | 2 | Zadatak #55; |
| OAuth 2.1: Inicijalizacija Backend okruženja i Supabase Klijenta | DA | 3 | Zadatak #56; |
| OAuth 2.1: Implementacija Auth Ruta i Callback Logike na Backendu | DA | 6 | Zadatak #57; |
| OAuth 2.1: Upravljanje Sesijama i Zaštita Ruta (Middleware) | DA | 7 | Zadatak #58; |
| OAuth 2.1: Frontend UI Integracija i Stanje Korisnika | DA | 4 | Zadatak #59; |
| Oporavak - zaboravljena lozinka | DA | 6 | Zadatak #139; |
| Prijava/registracija email-om i lozinkom | DA | 6 | Zadatak #141; |
| 3.1. + Discover u 3.2. | LK |  | Dokumentacija pod 3.1. i 3.2. |
| A.1 + Search u 3.2. | LM | 1 | Dokumentacija pod A.1. i 3.2. |
| 3.3. + Create u 3.2. | SP |  | Dokumentacija pod 3.3. i 3.2. |
| 2.5., 2.7. + Profile u 3.2. | IT |  | Dokumentacija pod 2.5., 2.7. i 3.2. |
| 4.3.2. + Inbox u 3.2. | LK |  | Dokumentacija pod 4.3.2. i 3.2. |
| 4.1., 2.6. + prijava i registracija u 3.2. | LK |  | Dokumentacija pod 4.1., 2.6. i 3.2. |
| 4.3.1. | NU |  | Dokumentacija pod 4.3.1. |

Koristite aktivnosti specifične za projekt umjesto obaveznog retka za svako poglavlje dokumentacije ili svaki UML dijagram. Tim treba dosljedno bilježiti sate i izbjegavati dvostruko brojanje zajedničkog rada; reprezentativni rezultat objašnjava što je prijavljeni trud proizveo. Sati su samoprijavljena procjena uloženog rada, a ne mjera kvalitete niti zamjena za pregled koda i artefakata.

<details>
<summary><strong>Primjer aktivnosti i rezultata rada</strong></summary>

**Primjer — CrisisMap:** Tablica razlikuje implementaciju, integraciju i dokumentaciju te svaku aktivnost povezuje s rezultatom.

| Aktivnost ili rezultat | Član | Prijavljeni sati | Reprezentativni rezultat ili poveznica |
| --- | --- | --- | --- |
| Ručni unos položaja na karti | AK | 8 | Zadatak #21; promjena klijentskog dijela. |
| Provjera valjanosti i trajna pohrana prijave | LM | 10 | Zadatak #23; promjena pozadinskog sustava i ispitivanje. |
| Integracija klijenta i API-ja te javno postavljanje | EP | 7 | Zadatak #25; konfiguracija u `render.yaml` i `dist/` |
| Obrazac uporabe za podnošenje prijave i provjera odbijenog dopuštenja | NK | 5 | Završene izmjene UC-002 i ispitivanje ST-03. |

**Trud i rezultat:** Završni stupac omogućuje raspravu o doprinosu bez tretiranja velikog broja sati kao dokaza isporuke. Tim može prijaviti stvarno dugotrajan, još neriješen problem integracije kao obavljen rad i iskreno opisati njegov ishod.

</details>

## A.4 Pregled promjena u repozitoriju

**Cilj:** Prikazati kada su promjene napravljene u repozitoriju i tko ih je napravio, uz napomenu da sam broj zapisa promjena ne mjeri kvalitetu doprinosa.

**Prikaz aktivnosti repozitorija:**

[Contributors](https://github.com/MarkoZvonar/CoStay-Project/graphs/contributors) - pokazuje podatke od stvaranja GitHub projekta

[Generirani graf za projektni repozitorij](https://github.com/MarkoZvonar/CoStay-Project/graphs/commit-activity) - obuhvaća commitove kroz prošlu godinu


## A.5 Ključni inženjerski izazovi i rješenja

**Cilj:** Dokumentirati stvarne tehničke i organizacijske prepreke s kojima se tim suočio, poduzete korektivne inženjerske korake te konačni ishod. Odaberite konkretne izazove umjesto općenite pohvale timskog rada.


| Izazov | Poduzeta radnja | Ishod ili preostalo ograničenje |
| --- | --- | --- |
| Registracija je zahtijevala više koraka i provjeru različitih podataka. | LM je registraciju podijelio na korake, DA je dodala poslužiteljsku validaciju obaveznih podataka i provjeru punoljetnosti. | Identitet i korisnički profil obrađuju se odvojeno, a nevaljani podaci ne prihvaćaju se kao dovršena registracija. |
| Upiti nad bazom nisu prolazili zbog RLS pravila. | NU je podesila postojeća i dodala nova RLS pravila te je DA uvela Supabase klijent koji koristi pristupni token prijavljenog korisnika. | Pristup korisničkim podacima provodi se u kontekstu potvrđenog identiteta, bez isključivanja RLS zaštite. |
| Istek pristupnog tokena mogao je prekinuti korisničku sesiju. | DA je implementirala middleware `refreshSession` i servis `refreshTokens` za obnovu tokena. | Valjana prijava može se nastaviti bez ponovnog unosa vjerodajnica. |
| Postupci potvrde e-pošte i oporavka lozinke ovise o PKCE kontekstu. | DA je podatke potrebne za dovršavanje postupka povezala sa sesijom preglednika. | Postupak funkcionira u istom pregledniku, dok otvaranje poveznice u drugom pregledniku ostaje ograničenje. |


<details>
<summary><strong>Rješavanje nesklada formata lokacije</strong></summary>

**Primjer — CrisisMap:**

| Izazov | Poduzeta radnja | Ishod ili preostalo ograničenje |
| --- | --- | --- |
| Odabrani položaj na karti prikazivao se u klijentu, ali podnesena prijava nije zadržavala koordinate. | AK i EP usporedile su zahtjev preglednika s poljima lokacije koje očekuje API; AK je uskladila format zahtjeva, a LM je dodao provjeru valjanosti lokacije. | Nova prijava u ovom se scenariju može dohvatiti sa spremljenim položajem; tim povezuje odgovarajuću promjenu integracije i provjeru. |

**Problem, odgovor i ishod:** Svaki se dio može provjeriti u projektu. Rečenica poput „imali smo poteškoće s integracijom i riješili ih timskim radom” ne bi čitatelju rekla što nije radilo ni kako je rješenje promijenjeno.

</details>

---

>**Završna provjera:** Sastanci navode smislene ishode i odgovorne osobe; plan odražava namjeravani rad; tablica uloženog rada i generirani prikaz repozitorija odnose na ovaj vidljivi projekt; konkretni izazovi povezani su s radnjama i njihovim rezultatima. 
