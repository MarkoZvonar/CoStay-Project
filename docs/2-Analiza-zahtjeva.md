# 2. Analiza zahtjeva

**Cilj:** Iz odobrenog opsega projekta izvesti prepoznatljive, prioritetizirane i provjerljive zahtjeve. Zahtjevi se mogu mijenjati; pri završnoj predaji moraju odražavati dogovorenu aplikaciju. Izvori, odluke i poveznice u primjerima kolegija nastavni su scenariji, a ne projektni zapisi.

<details>
<summary><strong>Održavanje zahtjeva ažurnima</strong></summary>

Primjeri koriste temu projekta CrisisMap. Neki namjerno sadrže korisne nedostatke za raspravu. Izvori, odluke i poveznice na provjere u tim primjerima **nastavni su scenariji**, a ne zapisi rada stvarnog studentskog tima. Zamijenite ih zahtjevima i dokazima svojeg odobrenog projekta. Značajne promjene zabilježite u odjeljku 2.5.

</details>

## 2.1 Funkcijski zahtjevi

**Cilj:** Navesti što aplikacija mora omogućiti korisnicima, odakle pojedina mogućnost proizlazi i koji se opažljivi rezultat smatra prihvaćanjem.

| ID | Opis | Prioritet | Izvor | Kriteriji prihvaćanja |
| --- | --- | --- | --- | --- |
| F-001 | Sustav omogućuje registraciju i prijavu korisnika putem OAuth 2.0 protokola. | Visok | Odobreni zadatak | Korisnik se može registrirati i prijaviti putem podržanog pružatelja identiteta, primjerice Googlea ili GitHuba. Prilikom registracije korisnik mora navesti važeću adresu e-pošte, ime, prezime, spol, datum rođenja i mjesto stanovanja. Neprijavljeni korisnik ne može izvršavati funkcionalnosti koje zahtijevaju autentifikaciju. |
| F-002 | Sustav omogućuje registriranim korisnicima upravljanje vlastitim profilom. | Visok | Zahtjev dionika | Profil prikazuje ime, prezime, mjesto stanovanja, profilnu sliku i ključne riječi koje opisuju karakter i interese korisnika. |
| F-003 | Sustav omogućuje registriranim korisnicima izradu objava putovanja. | Visok | Povratna informacija | Korisnik može stvoriti objavu unosom datuma dolaska i odlaska, lokacije, slika smještaja, ukupne cijene, cijene po osobi, ciljanog broja osoba, opisa, ključnih riječi i krajnjeg roka za prijave. Krajnji rok za prikupljanje suputnika mora biti prije datuma polaska. Vanjska poveznica na smještaj nije obavezna. |
| F-004 | Sustav omogućuje uređivanje vlastitih objava putovanja. | Visok | Odobreni zadatak | Autor može pregledati i izmijeniti detalje vlastite objave. Korisnik ne može uređivati objave drugih korisnika. |
| F-005 | Sustav omogućuje pregled dostupnih putovanja na kartici Discover. | Visok | Zahtjev dionika | Korisnik može pregledavati objave putovanja, a sustav mu preporučuje slične objave na temelju povijesti pregledavanja. Objave se učitavaju postupno tijekom pomicanja sadržaja. |
| F-006 | Sustav omogućuje pretraživanje putovanja na kartici Search. | Visok | Povratna informacija | Korisnik može pretraživati objave prema lokaciji, datumu i ključnim riječima. Rezultati se prvenstveno prilagođavaju lokaciji i poklapanju ključnih riječi. |
| F-007 | Sustav omogućuje registriranim korisnicima spremanje objava za kasniji pregled. | Srednji | Odobreni zadatak | Korisnik može spremiti objavu i naknadno pregledati popis spremljenih objava u svojem profilu. |
| F-008 | Sustav omogućuje slanje zahtjeva za pridruživanje putovanju. | Visok | Zahtjev dionika | Registrirani korisnik može poslati zahtjev za pridruživanje otvorenoj objavi. Zahtjev dobiva početni status „na čekanju”, a korisnik može pregledati status vlastitih zahtjeva. |
| F-009 | Sustav omogućuje autoru objave prihvaćanje ili odbijanje zahtjeva za pridruživanje. | Visok | Povratna informacija | Autor može prihvatiti ili odbiti zahtjeve do krajnjeg roka. Zahtjevi koji ostanu na čekanju nakon zatvaranja prijava automatski se odbijaju ako nisu uključeni u konačni popis sudionika. |
| F-010 | Sustav automatski upravlja stanjima objava i brojem sudionika. | Visok | Odobreni zadatak | Objava prelazi između stanja „otvorena”, „popunjena”, „čeka odluku vlasnika”, „dogovorena”, „otkazana” i „izbrisana” prema definiranim pravilima. Broj potvrđenih sudionika uključuje autora i korisnike s prihvaćenim zahtjevima, dok se zahtjevi na čekanju ne računaju. |
| F-011 | Sustav omogućuje vlasniku donošenje odluke o putovanju nakon isteka krajnjeg roka. | Visok | Zahtjev dionika | Ako nije prikupljen ciljani broj sudionika, vlasnik dobiva obavijest i ima 24 sata za potvrdu putovanja s manjom grupom ili brisanje objave. Ako ne odgovori, objava se automatski briše. Potvrda manje grupe dopuštena je samo ako uz autora postoji barem jedan drugi potvrđeni sudionik. |
| F-012 | Sustav omogućuje izravnu komunikaciju korisnika putem kartice Inbox. | Visok | Povratna informacija | Korisnici mogu slati izravne poruke drugim korisnicima. Razgovor omogućuje komunikaciju u stvarnom vremenu. |
| F-013 | Sustav automatski stvara grupni razgovor za dogovorena putovanja. | Visok | Odobreni zadatak | Kada objava prijeđe u stanje „dogovorena”, sustav stvara grupni razgovor za autora i konačno potvrđene sudionike. Korisnici izvan konačnog popisa nemaju pristup razgovoru. |
| F-014 | Sustav omogućuje ocjenjivanje sudionika nakon zajedničkog putovanja. | Visok | Zahtjev dionika | Recenziju mogu ostaviti samo korisnici koji su bili na konačnom popisu sudionika istog dogovorenog putovanja, počevši od prvog dana nakon datuma povratka. Recenzija sadrži brojčanu ocjenu i opcionalni tekstualni komentar. Za svaki par korisnika i putovanja dopuštena je najviše jedna recenzija u svakom smjeru. |
| F-015 | Sustav izračunava i prikazuje opću ocjenu korisnika. | Srednji | Povratna informacija | Profil prikazuje opću ocjenu izračunatu iz valjanih primljenih recenzija. Recenzije nisu dostupne za otkazane ili izbrisane objave. |
| F-016 | Sustav omogućuje prijavljivanje neprimjerenog sadržaja ili korisničkih računa. | Visok | Odobreni zadatak | Registrirani korisnik može prijaviti objavu, poruku ili profil uz navođenje razloga i opcionalnog opisa. Uz prijavu se evidentiraju prijavitelj, datum zaprimanja i status. |
| F-017 | Sustav omogućuje administratoru moderiranje sadržaja i upravljanje korisničkim računima. | Visok | Zahtjev dionika | Administrator može pregledavati i rješavati prijave, evidentirati obrazloženje odluke, uklanjati neprimjerene objave i poruke te suspendirati ili brisati račune prema definiranim pravilima. |
| F-018 | Sustav automatski primjenjuje mjere protiv ponovljenih kršenja pravila. | Visok | Povratna informacija | Tri prihvaćene prijave protiv istog korisnika unutar 12 mjeseci pokreću privremenu suspenziju od sedam dana. Peta prihvaćena prijava unutar istog razdoblja od 12 mjeseci pokreće obveznu administratorsku procjenu za dulju suspenziju ili uklanjanje računa. Administrator može intervenirati i ranije kod ozbiljnih kršenja. |
| F-019 | Sustav omogućuje administratoru pregled statistike i izvoz podataka. | Srednji | Odobreni zadatak | Administrator može pregledati najpopularnije lokacije, prosječan broj dogovorenih putovanja, najpopularnije ključne riječi i graf broja objava kroz godinu te izvesti odabrane podatke u CSV formatu. |
| F-020 | Sustav omogućuje automatsko slanje obavijesti e-poštom. | Visok | Zahtjev dionika | Korisnik prima obavijesti o odlukama vezanima uz zahtjeve za pridruživanje, promjenama statusa objava i potrebi donošenja odluke nakon isteka krajnjeg roka. Obavijest o odluci vlasnika sadrži rok od 24 sata i poveznicu na odgovarajuću objavu ili zaslon za donošenje odluke. Tijekom posljednjih sedam dana prije isteka roka plaćanja sustav svakodnevno šalje podsjetnike korisnicima s nepodmirenim troškovima smještaja. |
| F-021 | Sustav omogućuje unos lokacije uz pomoć vanjskog servisa za karte. | Srednji | Povratna informacija | Pri unosu lokacije sustav koristi vanjski API za karte, nudi prijedloge lokacija i omogućuje odabir lokacije za objavu. |
| F-022 | Sustav omogućuje pregled javnih objava neregistriranim korisnicima. | Srednji | Odobreni zadatak | Neregistrirani korisnik može pregledavati dostupne objave na karticama Discover i Search, ali se mora registrirati ili prijaviti prije korištenja interaktivnih funkcionalnosti. |
|F-023|Sustav omogućuje evidenciju i pregled troškova smještaja za dogovorena putovanja. | Visok | Povratna informacija | Ukupna cijena smještaja iz objave ravnomjerno se dijeli među konačno potvrđenim sudionicima. Korisnik vidi nepodmirene troškove svih dogovorenih putovanja i njihov zbroj. Svaki trošak prikazuje lokaciju, datum putovanja, iznos i rok plaćanja.|
|F-024| Sustav omogućuje korisniku simulaciju plaćanja nepodmirenog troška smještaja. | Visok | Odobreni zadatak | Za svaki nepodmireni trošak korisniku je dostupan obrazac za simulaciju plaćanja. Odabirom opcije plaćanja sustav označava trošak kao "podmiren". Sustav ne provodi stvarne novčane transakcije. |
|F-025| Sustav omogućuje korisniku povlačenje vlastitog zahtjeva za pridruživanje ili prihvaćenog sudjelovanja u putovanju. | Visok | Odobreni zadatak | Korisnik može povući vlastiti zahtjev za pridruživanje koji tada dobiva status "povučen". Prihvaćeni sudionik može povući sudjelovanje prije krajnjeg roka. Ako je objava bila "popunjena", ponovno prelazi u stanje "otvorena" kako bi se mogao pronaći zamjenski sudionik. |
|F-026| Sustav omogućuje pregled osoba koje su se prijavile za putovanje na pripadajućoj objavi. | Srednji | Odobreni zadatak | Na objavi je dostupan pregled svih osoba koje su se prijavile za putovanje. Za svaku osobu prikazuju se ime, prezime i poveznica na profil. |

<details>
<summary><strong>Izvori zahtjeva i kriteriji prihvaćanja</strong></summary>

Svaki zahtjev treba imati stabilan ID. **Izvor označava odakle zahtjev potječe**, primjerice iz odobrenog projektnog zadatka, zahtjeva dionika ili povratne informacije koja je promijenila zahtjev. Opišite opažljivo ponašanje umjesto naziva zaslona ili programskog okvira. U cijeloj dokumentaciji koristite istu ljestvicu prioriteta. Složenu korisničku interakciju objasnite u odgovarajućem obrascu uporabe umjesto kopiranja cijelog tijeka u ovu tablicu.

**Primjer — funkcijski zahtjevi za aplikaciju CrisisMap:**

Kategorije izvora pokazuju različite načine na koje zahtjev može nastati.

| ID | Opis | Prioritet | Izvor | Kriteriji prihvaćanja |
| --- | --- | --- | --- | --- |
| F-001 | Sustav omogućuje korisniku registraciju računa pomoću adrese e-pošte. | Visok | Zahtjev dionika | Korisnik se može registrirati adresom e-pošte, primiti poruku za potvrdu i aktivirati račun slijedeći poveznicu. |
| F-002 | Sustav omogućuje oporavak lozinke putem e-pošte. | Srednji | Zahtjev dionika | Korisnik može zatražiti ponovno postavljanje lozinke, primiti poveznicu i uspješno postaviti novu lozinku. |
| F-003 | Sustav prikazuje popis dostupnih resursa povezanih s kriznim događajima. | Visok | Postojeći sustav | Korisnik može pregledati ažurirani popis resursa relevantnih za vrstu kriznog događaja, lokaciju i raspoloživost. |
| F-004 | Sustav omogućuje korisnicima podnošenje prijave kriznog događaja s lokacijom. | Visok | Dokument sa zahtjevima | Korisnik može podnijeti prijavu s vrstom kriznog događaja, razinom ozbiljnosti i lokacijom te dobiti potvrdu o zaprimanju. Ako odbije pristup geolokaciji preglednika, može lokaciju odabrati ručno.|
| F-005 | Sustav šalje korisnicima obavijesti o relevantnim promjenama u njihovoj blizini. | Visok | Povratna informacija korisnika | Korisnici dobivaju obavijest unutar jedne minute od relevantne promjene za njihovu lokaciju. |
| F-006 | Sustav prikazuje dostupne resurse prema lokaciji. | Visok | Analiza dokumentacije | Prikazuje se ažurirani popis resursa prilagođen vrsti kriznog događaja, lokaciji i raspoloživosti. |
| F-007 | Sustav prikazuje prijave kriznih događaja s lokacijom kao oznake na karti. | Visok | Odobreni zadatak | Prijava s valjanom lokacijom prikazuje se kao oznaka na karti; odabirom oznake korisnik može otvoriti pripadajuću prijavu. |
| F-008 | Sustav omogućuje moderatoru odobravanje ili odbijanje podnesenih prijava. | Visok | Zahtjev dionika | Moderator može odobriti ili odbiti prijavu koja čeka pregled; korisnik bez moderatorskih ovlasti ne može izvršiti te radnje. |

**Kriteriji prihvaćanja i podrijetlo zahtjeva:** Primjer prikazuje registraciju, oporavak lozinke, resurse, prijavu kriznog događaja i obavijesti te nekoliko vrsta izvora i opažljivih kriterija. Istodobno otvara korisna pitanja: opisuju li F-003 i F-006 istu funkcionalnost resursa? Je li obećanje od jedne minute u F-005 dogovoreno i moguće ispitati? Treba li aplikaciji koja koristi isključivo OAuth uopće F-001 i F-002? Retke koristite kao materijal za analizu; u svojem projektu navedite vlastite zahtjeve. U stvarnom projektu stupac Izvor bilježi odakle su doista potekli njegovi zahtjevi.

**Primjer prilagodbe kada odobreni zadatak koristi OAuth i kartu:** Umjesto kopiranja registracije e-poštom i oporavka lozinke formulirajte relevantni zahtjev za prijavu, primjerice: „F-001: Korisnici se prijavljuju putem odobrenog OAuth pružatelja identiteta; uspješna prijava omogućuje radnje rezervirane za prijavljene korisnike, a odustajanje od prijave ostavlja te radnje nedostupnima.” Zaseban zahtjev za kartu može glasiti: „F-007 : Prijave s lokacijom prikazuju se kao oznake na karti; odabirom oznake otvara se pripadajuća prijava.” Izvor treba biti stvarni odobreni zadatak ili dogovoreni zahtjev dionika. Ova je prilagodba zamjena za neodgovarajuće retke, a ne dodatna tablica koju svaki tim mora ispuniti.

Za složenu interakciju kratak scenarij *Given / When / Then* može pojasniti kriterij. Primjerice: *Given* prijava bez lokacije, *when* građanin je podnese, *then* sustav objašnjava da lokacija nedostaje i ne pohranjuje prijavu. Nemojte jednostavan kriterij ponavljati i u prozi i u Gherkinu niti pisati Gherkin za svaki zahtjev.

</details>


## 2.2 Nefunkcijski zahtjevi

**Cilj:** Odrediti važna svojstva kvalitete i uvjete rada odobrene aplikacije na način koji tim može razumno provjeriti.

| ID | Opis | Prioritet | Izvor | Način provjere |
| --- | --- | --- | --- | --- |
| NF-01 | Aplikacija mora biti responzivna i prilagođena mobilnim uređajima. | Visok | Sigurnost | Ispitati prikaz i korištenje svih glavnih kartica na mobilnom uređaju i zaslonima različitih dimenzija. |
| NF-02 | Sustav mora podržavati istodobni rad većeg broja korisnika. | Visok | Uputa | Provesti test opterećenja s većim brojem istodobnih korisnika i pratiti stabilnost sustava. Konkretan ciljani broj korisnika potrebno je dogovoriti. |
| NF-03 | Komunikacija u kartici Inbox mora se odvijati u stvarnom vremenu. | Visok | SLA | Pokrenuti razgovor između dvaju korisnika te provjeriti pojavljuju li se poslane poruke drugom sudioniku bez potrebe za ručnim osvježavanjem stranice. |
| NF-04 | Sustav mora pouzdano provoditi automatske promjene stanja objava. | Visok | Sigurnost | Ispitati prijelaze između stanja objava, uključujući popunjavanje kapaciteta, ponovno otvaranje nakon povlačenja sudjelovanja, isteka roka, dogovaranja, otkazivanja i brisanja. |
| NF-05 | Sustav mora pouzdano provoditi vremenska ograničenja i automatske odluke. | Visok | Uputa | Testirati istek krajnjeg roka za prikupljanje suputnika i rok od 24 sata za odluku vlasnika, uključujući slučaj u kojem vlasnik ne odgovori. |
| NF-06 | Sustav mora spriječiti višestruko ostavljanje recenzija za isti par korisnika na istom putovanju u istom smjeru. | Visok | SLA | Pokušati više puta poslati recenziju između istih korisnika za isto putovanje te provjeriti da je prihvaćena najviše jedna recenzija u svakom smjeru. |
| NF-07 | Sustav mora provoditi autentifikaciju i autorizaciju prema korisničkim ulogama. | Visok | Sigurnost | Testirati pristup funkcionalnostima kao neregistrirani korisnik, registrirani korisnik i administrator te pokušati izvršiti radnje za koje korisnik nema ovlasti. |
| NF-08 | Sustav mora osigurati ispravno ograničavanje pristupa grupnim razgovorima. | Visok | Uputa | Provjeriti da grupnom razgovoru mogu pristupiti samo autor i konačno potvrđeni sudionici dogovorenog putovanja. |
| NF-09 | Sustav mora dosljedno izračunavati broj potvrđenih sudionika i cijenu po osobi. | Visok | SLA | Testirati izračun broja sudionika te ponovno izračunavanje cijene po osobi kada vlasnik potvrdi dogovor s manjom grupom. |
| NF-10 | Sustav mora dosljedno evidentirati prijave sadržaja i poduzete administratorske mjere. | Visok | Sigurnost | Provjeriti bilježe li se statusi prijava, obrazloženja odluka i poduzete mjere te pokreću li se definirane posljedice nakon dosezanja propisanih pragova. |
| NF-11 | Sustav mora podržavati pouzdanu integraciju s vanjskim servisom za karte i slanje e-pošte. | Srednji | Uputa | Testirati uobičajene zahtjeve prema vanjskom servisu te provjeriti ponašanje aplikacije kada vanjski servis privremeno nije dostupan. |
| NF-12 | Sustav mora omogućiti dosljedan izvoz statističkih podataka u CSV formatu. | Srednji | SLA | Izvesti odabrane statističke podatke te provjeriti jesu li stupci, vrijednosti i zapisi u datoteci u skladu s odabranim podacima. |

<details>
<summary><strong>Nefunkcijski zahtjevi za analizu</strong></summary>

Relevantna svojstva mogu se odnositi na uporabljivost, pristupačnost, sigurnost, performanse ili pouzdanost. Odaberite svojstva specifična za projekt i opišite kako ih je moguće provjeriti. Zahtjev navodi što se očekuje; stvarna opažanja i dokazi pripadaju rezultatima ispitivanja, a ne drugom stupcu s rezultatima u ovoj tablici.

**Primjer — nefunkcijski zahtjevi za aplikaciju CrisisMap:**

| ID | Opis | Prioritet | Izvor |
| --- | --- | --- | --- |
| NF-1.1 | Sustav mora podržati 1.000 istodobnih korisnika uz vrijeme odziva kraće od 1 s. | Visok | SLA | Opteretiti sustav zadanim brojem istodobnih korisnika i izmjeriti vrijeme odziva. |
| NF-1.2 | Svi osjetljivi podaci moraju biti šifrirani algoritmom AES-256. | Visok | Sigurnosna politika | Pregledati način pohrane i konfiguraciju šifriranja za podatke na koje se zahtjev odnosi. |
| NF-1.3 | Korisničko sučelje mora podržavati engleski i španjolski jezik. | Srednji | Povratna informacija dionika | Pregledati reprezentativne korisničke tijekove u oba jezika. |
| NF-1.4 | Dostupnost sustava mora iznositi najmanje 99,5 % mjesečno. | Visok | SLA | Izračunati mjesečnu dostupnost iz zapisa sustava za nadzor, ako takvi podaci postoje.|
| NF-3.1.7 | Sustav treba imati odgovarajuću dokumentaciju. | Visok | Pravila dokumentiranja | Pregledati zahtijevane dokumentaciju prema obavezama.|
| NF-3.1.7.1 | Kod sustava treba biti dokumentiran prema „Code Conventions for the Java Programming Language”. | Visok | Pravila dokumentiranja | Pregledati kod. |
| NF-3.1.7.2 | Sustav treba biti opisan projektnim dokumentom/SRS-om. | Visok | Pravila dokumentiranja | Pregledati strukturu dokumenta  |
| NF-3.1.7.3 | Sustav treba imati „Operativni priručnik” koji opisuje pravilnu uporabu. | Visok | Pravila dokumentiranja | Pregledati postoji li priručnik i mogu li se prema njemu izvršiti opisane radnje. |
| NF-3.1.7.4 | Sustav treba imati „Plan implementacije” za pravilno postavljanje. | Visok | Smjernice za postavljanje | Pregledati odgovara li opisani postupak stvarnom postupku postavljanja.|

**Provjerljivost i opseg:** Primjer uvodi performanse, sigurnost, lokalizaciju, dostupnost i dokumentaciju, uključujući hijerarhijski ID zahtjeva. Navedeni izvori primjeri su podrijetla zahtjeva, a ne dokaz da za studentski projekt stvarno postoji SLA ili sigurnosna politika. Vrijednosti poput 1.000 korisnika, 99,5 % mjesečne dostupnosti i AES-256 moraju imati odobren izvor i izvediv način provjere prije nego što postanu zahtjevi tima. Skup zahtjeva o dokumentaciji ilustrira razlaganje zahtjeva, ali zahtjevi za izradu *ove dokumentacije kolegija* u pravilu pripadaju uputama zadatka, a ne zahtjevima kvalitete web-aplikacije.

**Primjer prilagodbe:** Ako je pristupačnost zahtjevana za  projekt, projektno specifičan zahtjev može glasiti: „NF-01: Sve obavezne radnje u obrascu za podnošenje prijave moguće je izvršiti samo tipkovnicom, uz vidljiv fokus na aktivnoj kontroli.” Provjera: navigirati kroz obrazac bez pokazivačkog uređaja, odabrati ili unijeti lokaciju, poslati prijavu i provjeriti može li se pročitati rezultat. To je provjerljivo svojstvo kvalitete, a ne dodatna funkcionalnost koju svaki projekt mora implementirati.

</details>

## 2.3 Dionici i akteri

**Cilj:** Utvrditi uloge koje utječu na zahtjeve i razlikovati dionike od aktera koji komuniciraju s aplikacijom.

| ID uloge ili aktera | Odnos prema sustavu | Relevantni zahtjevi |
| --- | --- | --- |
| A-01 | Neregistrirani posjetitelj (Akter) — Osoba koja pregledava javno dostupne objave putovanja i pretražuje sadržaj bez prijave u sustav. | F-005, F-006, F-022, NF-01 |
| A-02 | Registrirani korisnik (Akter) — Autentificirani korisnik koji stvara i uređuje objave, šalje zahtjeve za pridruživanje, komunicira u Inboxu te ostavlja recenzije. | F-001, F-002, F-003, F-004, F-005, F-006, F-007, F-008, F-009, F-011, F-012, F-014, F-015, F-016, F-020, F-021, F-023, F-024, F-025, F-026 |
| A-03 | Autor objave / Vlasnik (Akter) — Posebna uloga registriranog korisnika u kontekstu vlastite objave; upravlja zahtjevima sudionika, donosi odluke o manjim grupama i vodi grupni razgovor. | F-003, F-004, F-009, F-010, F-011, F-013, NF-04, NF-05 |
| A-04 | Administrator (Akter) — Ovlaštena osoba koja moderira sadržaj, rješava prijave neprimjerenog ponašanja, suspendira korisničke račune te izvozi analitičke podatke. | F-016, F-017, F-018, F-019, NF-07, NF-10, NF-12 |
| A-05 | Vanjski servisi (Sustavni akter) — Vanjski API servisi koji komuniciraju sa sustavom (OAuth pružatelji identiteta poput Googlea/GitHuba i vanjski servis za karte). | F-001, F-020, F-021, NF-11 |
| D-01 | Naručitelj / Dionik projekta (Dionik) — Osoba ili organizacija koja definira poslovne ciljeve, odobrava funkcionalnosti i prati uspješnost razvoja aplikacije (ne sudjeluje nužno u izravnom korištenju). | NF-02, NF-10, NF-11, NF-12 |
| D-02 | Mentori / Nastavnici (Dionik) — Ocjenjivači projekta koji postavljaju formalne i tehničke kriterije kvalitete te evaluiraju konačnu implementaciju sustava. | Svi F i NF zahtjevi |

<details>
<summary><strong>Akteri i povezani zahtjevi</strong></summary>

**Primjer — akteri aplikacije CrisisMap:**

| ID aktera | Uloga | Obuhvaćeni funkcijski zahtjevi |
| --- | --- | --- |
| A-01 | Koordinator pomoći | F-003: Pregled resursa; F-004: Podnošenje prijave kriznog događaja. |
| A-02 | Građanin | F-001: Izrada računa; F-005: Primanje obavijesti. |
| A-03 | Administrator sustava | NF-1.2: Provođenje sigurnosnih pravila; upravljanje korisnicima. |
| A-04 | Posjetitelj | F-007: Pregled prijava na karti. |
| A-05 | Moderator | F-008: Odobravanje ili odbijanje prijava. |

**Odgovornosti aktera:** Uloga aktera treba biti povezana s interakcijom, a ne samo s nazivom. Provjerite podnosi li koordinator pomoći u odobrenom zadatku doista prijave kriznih događaja. Poveznica administratora s NF-1.2 navodi sigurnosni aspekt, ali sama po sebi ne opisuje obrazac uporabe; navedite stvarnu radnju administratora ili izostavite ulogu ako je nema. Nastavnici zainteresirani za rezultat mogu biti dionici, a da nisu akteri aplikacije. Tablica je polazište za razmišljanje, a ne potvrđen opis ovlasti u CrisisMapu.

</details>

---

## 2.4 Ograničenja i pretpostavke

**Cilj:** Zabilježiti projektno specifične granice i pretpostavke koje utječu na zahtjeve ili oblikovanje, zajedno s njihovim izvorom i praktičnom posljedicom. Ovo je njihovo mjerodavno mjesto u dokumentaciji.

| ID | Tip | Opis ograničenja ili pretpostavke | Izvor | Inženjerska posljedica / Provjera |
| --- | --- | --- | --- | --- |
| C-01 | Ograničenje | Autentifikacija korisnika mora se provoditi putem OAuth 2.0 protokola (npr. Google ili GitHub račun) uz pružanje važeće adrese e-pošte i obaveznih osobnih podataka. | Odobreni zadatak | Zaštićeni dio aplikacije i izradu profila potrebno je projektirati oko OAuth pružatelja identiteta; provjeravati JWT/OAuth tokene i sprječavati neautentificirani pristup interaktivnim funkcionalnostima. |
| C-02 | Ograničenje | Aplikacija mora biti izvedena kao web aplikacija prilagođena (responsive) zaslonima mobilnih uređaja, uz navigacijsku traku pri dnu s pet definiranih kartica (Discover, Search, Create, Inbox, Profile). | Odobreni zadatak | Frontend arhitekturu i CSS layout prilagoditi mobilnom prikazu; testirati odaziv i navigaciju na različitim razlučivostima zaslona. |
| C-03 | Ograničenje | Komunikacija unutar kartice Inbox mora se odvijati u stvarnom vremenu. | Odobreni zadatak | Implementirati dvosmjernu komunikaciju u stvarnom vremenu (npr. korištenjem WebSockets protokola ili Server-Sent Events) te osigurati fallback u slučaju prekida veze. |
| C-04 | Ograničenje | Vremensko ograničenje od 24 sata za odluku vlasnika objave nakon isteka krajnjeg roka mora se voditi na strani poslužitelja. | Odobreni zadatak | Implementirati pozadinske zadatke (scheduled tasks) na poslužitelju koji provjeravaju rokove neovisno o dostavi e-pošte ili aktivnostima korisnika na klijentu. |
| AS-01 | Pretpostavka | Vanjski servis za karte (npr. Google Maps API) dostupno i pouzdano pruža pretragu te validne geografske lokacije prilikom izrade objava. | Pretpostavka o vanjskoj integraciji | Implementirati rukovanje pogreškama u slučaju nedostupnosti vanjskog API-ja, provjeriti ponašanje sučelja pri unosu nepoznatih lokacija. |
| AS-02 | Pretpostavka | Vanjski e-mail servis pouzdano isporučuje transakcijske obavijesti korisnicima na navedene e-mail adrese. | Pretpostavka o sustavu obavješćivanja | Testirati slanje obavijesti; u kodu osigurati da neuspjeh u slanju e-pošte ne blokira poslužiteljske procese automatskog brisanja ili promjene stanja objava. |
| AS-03 | Pretpostavka | Korisnici unose točne datume dolaska, odlaska i krajnjeg roka, pri čemu je krajnji rok uvijek kronološki prije datuma polaska na putovanje. | Pretpostavka o podacima | Uvesti klijentske i poslužiteljske validacije formi na ekranu Create koje sprječavaju odabir roka koji je jednak ili kasniji od datuma dolaska. |
<details>
<summary><strong>Ograničenja nasuprot pretpostavkama</strong></summary>

Ograničenje je uvjet koji tim mora poštovati; pretpostavka je uvjet na koji se tim oslanja i koji treba ponovno provjeravati.

**Primjer — projektni kontekst CrisisMapa:**

| ID | Ograničenje ili pretpostavka | Izvor | Posljedica ili način provjere |
| --- | --- | --- | --- |
| C-01 | Odobreni zadatak zahtijeva OAuth prijavu u sustav za uređivanje vlastitih prijava korisnika. | Odobreni zadatak  | Zaštićeno uređivanje projektirati oko odabranog pružatelja identiteta; provjeriti autorizirane i neautorizirane zahtjeve. |
| AS-01 | Prijave koje se prikazuju na karti imaju uporabive koordinate. | Pretpostavka o podacima  | Pregledati ogledne i uvezene prijave; planirati prikaz prijava bez valjanih koordinata. |

**Ograničenje nasuprot pretpostavci:** C-01 navodi obvezujuću odluku i njezin arhitekturni učinak; AS-01 je moguće provjeriti i može se pokazati netočnim. Nemojte kopirati C-01 ako OAuth nije dio stvarnog odobrenog zadatka. Projektni odgovor objasnite u arhitekturi bez prepisivanja ove tablice.

</details>

---

## 2.5 Značajne promjene zahtjeva

**Cilj:** Sačuvati razlog promjena koje mijenjaju dogovoreni opseg, prioritet ili kriterije prihvaćanja, uz istodobno održavanje prethodnih zahtjeva ažurnima.

| Datum | ID zahtjeva | Promjena i razlog | Dogovoreno s / dokaz |
| --- | --- | --- | --- |
|  |  |  |  |

<details>
<summary><strong>Primjer značajne promjene</strong></summary>

**Primjer scenarija — odluka tijekom pregleda CrisisMapa:**

| Datum | ID zahtjeva | Promjena i razlog | Dogovoreno s / dokaz |
| --- | --- | --- | --- |
| [Datum pregleda] | F-004, NF-01 | Dodati ručni odabir lokacije kada korisnik odbije geolokaciju preglednika; bez toga građanin ne može podnijeti prijavu kriznog događaja s lokacijom. | [Poveznica na stvarnu bilješku pregleda ili zadatak tima] |

**Razlog promjene:** Zapis navodi zahvaćene stavke i objašnjava razlog iz perspektive korisnika, a zatim upućuje na dokaz odluke.  Nakon stvarne odluke ažurirajte trenutačne zahtjeve; stilska izmjena teksta ne zahtijeva zapis u dnevniku promjena. Trenutačni red zadataka držite u alatu za praćenje zadataka.

</details>

---

## 2.6 Sljedivost zahtjeva

**Cilj:** Osigurati dvosmjernu sljedivost — povezati zahtjeve s opisanim ponašanjem, dijelovima sustava koji ih ostvaruju te ispitivanjem ili drugom provjerom. 

| ID zahtjeva | Obrazac uporabe / modul | Arhitekturna realizacija | Ispitivanje ili provjera |
| --- | --- | --- | --- |
| F-001 | [UC-001] | [Komponenta, modul ili drugo mjesto realizacije] | [ST-01, CT-01 ili druga provjera] |
|  |  |  |  |

<details>
<summary><strong>Sljedivost zahtjeva do obrazaca uporabe i ispitivanja</strong></summary>

**Primjer — poveznice zahtjeva CrisisMapa:**

| ID zahtjeva | Obrazac uporabe / ponašanje | Arhitekturna realizacija | Ispitivanje / provjera |
| --- | --- | --- | --- |
| F-004 | UC-002 Podnošenje prijave kriznog događaja | Web-klijent; API za prijave; usluga za prijave | ST-01 Valjano podnošenje prijave; ST-02 Nedostaje obavezna lokacija; ST-03 Dopuštenje geolokacije odbijeno |
| F-005 | Odabir primatelja obavijesti | Proces za obavijesti | CT-06 Primatelji obavijesti; potpuna dostava obavijesti nije pokrivena ovom provjerom |

**Pokrivenost i dokazi:** CT-06 provjerava odabir primatelja za F-005, ali sam po sebi ne dokazuje da je obavijest stvarno dostavljena; ako projekt zahtijeva potpunu dostavu od početka do kraja, za taj dio treba postojati zasebna provjera. Svaki redak pokazuje gdje je zahtjev opisan kao ponašanje, gdje je ostvaren u sustavu i gdje se nalazi dokaz njegove provjere. Zahtjev ne mora imati zaseban obrazac uporabe ako ne opisuje korisničku interakciju; tada navedite relevantno ponašanje, arhitekturni element ili drugi prikladan način realizacije. U svojem projektu koristite stvarne nazive komponenata, modula i provjera iz dokumentacije i implementacije. Nedostajuću poveznicu ostavite praznom ili označite kao *na čekanju* uz kratak razlog. Stvarni rezultati ispitivanja bilježe se uz ispitne slučajeve; ova tablica pokazuje gdje ih pronaći.

</details>

---

## 2.7 Pregled zahtjeva

**Cilj:** Zabilježiti važne povratne informacije o zahtjevima i odluke koje iz njih proizlaze na dvije formalne kontrolne točke projekta, u 7. i 14. tjednu.

| Kontrolna točka | Povratna informacija ili nalaz | Odluka o zahtjevu ili opsegu |
| --- | --- | --- |
| Iteracija 1 | [Povratna informacija] | [Odluka; vidi odjeljak 2.5] |
| Demo 2  | [Povratna informacija] | [Odluka; vidi odjeljak 2.5] |
| Završni pregled | [Povratna informacija] | [Odluka; vidi odjeljak 2.5] |

<details>
<summary><strong>Odluke o zahtjevima nakon pregleda</strong></summary>

**Primjer scenarija — pregled zahtjeva CrisisMapa:**

| Kontrolna točka | Povratna informacija ili nalaz | Odluka o zahtjevu ili opsegu |
| --- | --- | --- |
| Iteracija 1 | Demonstracija pokazuje da odbijanje pristupa lokaciji preglednika onemogućuje podnošenje prijave. | Dogovoriti ručni odabir lokacije; ažurirati F-004 i primjer NF-01 te razlog zabilježiti u odjeljku 2.5. |

**Odluka povezana s povratnom informacijom:** Zapis povezuje opaženo ponašanje s konkretnom promjenom zahtjeva i izbjegava zapisnik cijelog sastanka. Zapišite samo stvarne povratne informacije i odluke za kontrolne točke. Konzultacije u nekom drugom tjednu ne stvaraju dodatnu obaveznu predaju.

</details>

---

>**Završna provjera:** Zahtjevi su aktualni, provjerljivi i povezani. Svaki važan zahtjev moguće je pratiti od njegova opisa i ponašanja preko mjesta realizacije u sustavu do odgovarajućeg ispitivanja ili druge provjere. Poveznice koriste stvarne identifikatore i nazive iz projektne dokumentacije.

