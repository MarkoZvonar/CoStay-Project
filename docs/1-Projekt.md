# 1. Opseg projekta

Kada tražimo smještaj za neko putovanje često pronađemo neki smještaj koji izgleda odlično, ali nam je preskup jer je namijenjen za više osoba. Platforma CoStay rješava taj problem tako što omogućava korisnicima da pronađu ljude koji su također zainteresirani za taj smještaj. Time se trošak dijeli na više ljudi i smještaj postaje jeftiniji. Pomoću platforme CoStay putnici će lakše pronaći smještaj i iznajmljivači će lakše pronaći goste.

## 1.1 Problem i cilj projekta

Mnogi mladi ljudi, studenti i ljubitelji putovanja često nailaze na problem kada žele otputovati na neku destinaciju (npr. ljetovanje na moru, skijanje ili posjet turističkim atrakcijama), ali nemaju s kime ići. Iznajmljivanje velikih apartmana ili kuća za odmor financijski je isplativije podjelom troškova na više ljudi. Postojeće platforme za rezervaciju smještaja fokusirane su na pronalazak objekta, dok društvene mreže nisu prilagođene strukturiranom traženju suputnika. Zbog toga organizacija ovakvih putovanja često propada, a smještajni kapaciteti ostaju neiskorišteni jer inicijatori putovanja ne mogu pronaći dovoljno ljudi.

Cilj je stvoriti funkcionalnu platformu kojoj primarna svrha nije pronalazak smještaja, već pronalazak ljudi s kojima će se putovanje ostvariti. Platforma korisnicima omogućuje objavu planiranog putovanja (s već odabranim smještajem) te postavljanje željenog profila suputnika. S druge strane, korisnicima koji nemaju društvo za putovanje omogućuje se jednostavan pregled i prijava na postojeća putovanja koja odgovaraju njihovim interesima i budžetu.

<details>
<summary><strong>Očekivane koristi i potkrepljujući dokazi</strong></summary>

**Primjer — CrisisMap:** „Tijekom teških vremenskih prilika građaninu mogu trebati prijave kriznih događaja relevantne za njegovu lokaciju. CrisisMap ima za cilj prikazati lokacijski relevantne prijave kriznih događaja na karti kako bi ih građanin mogao pronaći na jednom mjestu.” Time su navedeni problem, ciljani korisnik, predložena mogućnost i očekivana korist. Ne tvrdi se da je izmjereno smanjenje vremena reagiranja niti da aplikacija ima integraciju sa službom za hitne intervencije. Tim i dalje mora opisati opseg odobren za vlastiti projekt.

„Aplikacija smanjuje vrijeme odgovora na krizni događaj za 30 % na temelju simulacija.” Broj očekivanu korist čini konkretnijom, ali odmah zahtijeva provjeru: **gdje je simulacija i kako je postotak izračunan?** Ako takav dokaz ne postoji, očekivanu korist navedite bez brojčanog rezultata.

</details>

## 1.2 Ciljani korisnici i dionici

Osobe kojima će koristiti naš projekt možemo podijeliti na dvije skupine, a to su putnici i iznajmljivači. Putnicima naša aplikacija služi da mogu pronaći suputnike koji će s njima podijeliti trošak željenog smještaja. Iznajmljivačima naša aplikacija služi za lakši pronalazak ljudi koji žele unajmiti njihov smještaj.

| Skupina korisnika ili dionika | Potreba ili interes relevantan za ovaj projekt           |
| ----------------------------- | -------------------------------------------------------- |
| Putnici                       | Traže suputnike kako bi jeftinije unajmili neki smještaj |
| Iznajmljivači                 | Traže goste koji bi unajmili njihov smještaj             |

<details>
<summary><strong>Korisnici, dionici i neobavezna persona</strong></summary>

**Primjer — CrisisMap:**

| Skupina korisnika ili dionika                              | Potreba ili interes relevantan za ovaj projekt                                                                                                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Građanin                                                   | Pronaći informacije o obližnjim kriznim događajima i podnijeti prijavu kriznog događaja s lokacijom.                                                                          |
| Koordinator pomoći                                         | Pregledati prijave relevantne za područje i dostupne resurse, ako je koordinacija unutar odobrenog opsega.                                                                    |
| Regulatorno tijelo / Agencija za zaštitu podataka (Dionik) | Zahtijeva osiguravanje anonimnosti prijavitelja i zaštitu osobnih podataka (npr. usklađenost s GDPR-om). Ovaj dionik ne koristi aplikaciju, ali definira ograničenja sustava. |

Riječ je o dvjema različitim potrebama, a ne o dvjema izmišljenim biografijama. Akter komunicira s aplikacijom; demonstrator na kolegiju kojem je rezultat zanimljiv ne mora biti akter aplikacije. Koristite uloge i ovlasti iz svojeg odobrenog zadatka. Persona je neobavezna i korisna je kada pomaže riješiti konkretno projektno pitanje.

**Neobavezni primjer persone:** Ana, koordinatorica pomoći, treba aktualne informacije o resursima kako bi mogla rasporediti pomoć. To može pomoći kada tim odlučuje koje informacije koordinator treba vidjeti prve. Personu opišite samo ako objašnjava projektnu odluku; popis izmišljenih biografija nije obavezni rezultat kolegija.

</details>

## 1.3 Granice projekta

**Cilj:** Jasno definirati granice sustava — što je obuhvaćeno odobrenim zadatkom, što je svjesno izostavljeno ili odgođeno te o kojim vanjskim uslugama sustav izravno ovisi.

**Uključeno:** Objavljivanje smještaja, pretraživanje smještaja (Search), preporuke smještaja (Discover), prijava za smještaj.
**Izvan opsega ili odgođeno:** Automatsko "scrapeanje" objava sa drugih sličnih stranica.
**Vanjske ovisnosti:** Vanjski pružatelj identiteta (OAuth), API za karte (Leaflet i Openstreetmap), API za slanje mailova (Resend), naša baza podataka za korisnike i objave.
Sustav obuhvaća registraciju i prijavu korisnika, dovršavanje korisničkog profila te ograničavanje pristupa zaštićenim funkcionalnostima. Za autentifikaciju koristi Supabase Auth, uz podršku prijavi putem Googlea i GitHuba te emaila i lozinke.

CoStay pohranjuje podatke korisničkog profila u vlastitoj bazi i na poslužitelju provjerava ispunjava li korisnik uvjete za pristup. Uspješna autentifikacija bez dovršenog obaveznog profila nije dovoljna za korištenje funkcionalnosti namijenjenih registriranim korisnicima. Upravljanje identitetom i vjerodajnicama povjereno je Supabase Authu. CoStay ne upravlja lozinkama Googleovih ili GitHubovih računa.

<details>
<summary><strong>Primjer početne granice projekta</strong></summary>

**Primjer — CrisisMap:**  
**Uključeno:** Podnošenje prijave kriznog događaja s lokacijom i pregled prijava na karti.  
**Isključeno:** Automatsko angažiranje hitnih službi; prikaz prijave ne odobrava niti pokreće službenu intervenciju.  
**Vanjska ovisnost:** Pružatelj kartografskih usluga omogućuje prikaz karte; aplikacija ostaje odgovorna za vlastite podatke o prijavama.

Ovo je konkretna granica jer razdvaja prikaz informacija od službenog odgovora hitnih službi i određuje koji sustav osigurava kartu. Izuzeće i ovisnost dio su **nastavnog scenarija**, a ne tvrdnja o tome što objavljena aplikacija stvarno implementira; te činjenice određuju odobreni opseg i stvarna aplikacija tima.

**Drugi primjer korisne granice:** U prvoj implementaciji usredotočite se na koordinaciju odgovora na poplavu. Navedite vrste događaja ili korisnika koje pokriva odobreni projekt umjesto obećavanja svih mogućih kriznih procesa. Predviđanje pomoću umjetne inteligencije ili obuku u virtualnoj stvarnosti navedite kao budući rad samo ako predstavljaju smislen sljedeći korak, a ne kao pretpostavljene funkcionalnosti prve inačice.

Tvrdnja poput „modularna arhitektura omogućuje brzo postavljanje u novim riegijama” zahtijeva stvarno projektno uporište. Ovdje nemojte obećavati prilagodljivost samo zato što zvuči kao poželjna korist projekta.

Ovaj pregled zadržite na razini opsega: navedite glavnu mogućnost i njezinu granicu bez popisivanja svakog zahtjeva ili projektne pojedinosti. Ono što je stvarno dovršeno i ono što je ostalo nedovršeno navedite u završnim rezultatima, a ne u ovom početnom opisu.

</details>

## 1.4 Postojeći pristupi i opravdanost projekta

Predstavljeni problem već dugo postoji. Ljudi bi često odustali od tih smještaja ako ne bi uspjeli skupiti dovoljno prijatelja da popune smještaj. Jedno od najčešćih rješenja je postavljanje upita na društvene mreže. Naša stranica je bolje rješenje problema jer služi isključivo za pronalazak smještaja, dok društvene mreže imaju različite svrhe. Osim toga naša stranica ima recenzije koje služe za procjenu kojim ljudima se može vjerovati, a kojima ne. Također, mi pružamo lakšu pretragu smještaja te preporuke smještaja koje smatramo da bi korisniku bile zanimljive.

<details>
<summary><strong>Postojeći pristupi i opravdanost projekta</strong></summary>

**Primjer — CrisisMap:** „Nakon teškog vremenskog događaja građanin će možda morati provjeriti izvor meteoroloških upozorenja i zaseban izvor lokalnih prijava. Predloženi prikaz na karti u CrisisMapu objedinjuje prijave kriznih događaja relevantne za odabranu lokaciju. Aplikacija ne zamjenjuje službena upozorenja ni hitne službe.” Time se objašnjava potreba i namjeravana granica projekta bez tvrdnje da su svi postojeći kanali neučinkoviti. Prva je rečenica **primjer korisničkog scenarija**, a ne izmjeren nalaz o stvarnim korisnicima. Ako tim navodi konkretnu službu upozoravanja ili konkurentski proizvod, treba navesti izvor. Pregled konkurencije i snimke zaslona nisu obavezni.

Ako je postojeće rješenje stvarno utjecalo na projekt, usporedite samo relevantnu funkcionalnost, primjerice jasnoću karte ili potrebnu integraciju. Izbjegavajte unaprijed zadani broj proizvoda ili tablicu kriterija koji nisu povezani s odobrenim zadatkom.

</details>

---

> **Završna provjera:** Opis problema, cilj projekta, korisnici i dionici, granice opsega te postojeći pristupi međusobno su usklađeni. Navedene koristi ne predstavljaju neprovjerene tvrdnje, a uključene i izostavljene funkcionalnosti odgovaraju odobrenom projektnom zadatku.
