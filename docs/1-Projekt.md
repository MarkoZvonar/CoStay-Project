# 1. Opseg projekta

Kada tražimo smještaj za neko putovanje često pronađemo neki smještaj koji izgleda odlično, ali nam je preskup jer je namijenjen za više osoba. Platforma CoStay rješava taj problem tako što omogućava korisnicima da pronađu ljude koji su također zainteresirani za taj smještaj. Time se trošak dijeli na više ljudi i smještaj postaje jeftiniji. Pomoću platforme CoStay putnici će lakše pronaći smještaj i iznajmljivači će lakše pronaći goste.

## 1.1 Problem i cilj projekta

Mnogi mladi ljudi, studenti i ljubitelji putovanja često nailaze na problem kada žele otputovati na neku destinaciju (npr. ljetovanje na moru, skijanje ili posjet turističkim atrakcijama), ali nemaju s kime ići. Iznajmljivanje velikih apartmana ili kuća za odmor financijski je isplativije podjelom troškova na više ljudi. Postojeće platforme za rezervaciju smještaja fokusirane su na pronalazak objekta, dok društvene mreže nisu prilagođene strukturiranom traženju suputnika. Zbog toga organizacija ovakvih putovanja često propada, a smještajni kapaciteti ostaju neiskorišteni jer inicijatori putovanja ne mogu pronaći dovoljno ljudi.

Cilj je stvoriti funkcionalnu platformu kojoj primarna svrha nije pronalazak smještaja, već pronalazak ljudi s kojima će se putovanje ostvariti. Platforma korisnicima omogućuje objavu planiranog putovanja (s već odabranim smještajem) te postavljanje željenog profila suputnika. S druge strane, korisnicima koji nemaju društvo za putovanje omogućuje se jednostavan pregled i prijava na postojeća putovanja koja odgovaraju njihovim interesima i budžetu.

## 1.2 Ciljani korisnici i dionici

Osobe kojima će koristiti naš projekt možemo podijeliti na dvije skupine, a to su putnici i iznajmljivači. Putnicima naša aplikacija služi da mogu pronaći suputnike koji će s njima podijeliti trošak željenog smještaja. Iznajmljivačima naša aplikacija služi za lakši pronalazak ljudi koji žele unajmiti njihov smještaj.

| Skupina korisnika ili dionika | Potreba ili interes relevantan za ovaj projekt           |
| ----------------------------- | -------------------------------------------------------- |
| Putnici                       | Traže suputnike kako bi jeftinije unajmili neki smještaj |
| Iznajmljivači                 | Traže goste koji bi unajmili njihov smještaj             |

## 1.3 Granice projekta

**Cilj:** Jasno definirati granice sustava — što je obuhvaćeno odobrenim zadatkom, što je svjesno izostavljeno ili odgođeno te o kojim vanjskim uslugama sustav izravno ovisi.

**Uključeno:** Objavljivanje smještaja, pretraživanje smještaja (Search), preporuke smještaja (Discover), prijava za smještaj.
**Izvan opsega ili odgođeno:** Automatsko "scrapeanje" objava sa drugih sličnih stranica.
**Vanjske ovisnosti:** Vanjski pružatelj identiteta (OAuth), API za karte (Leaflet i Openstreetmap), API za slanje mailova (Resend), naša baza podataka za korisnike i objave.
Sustav obuhvaća registraciju i prijavu korisnika, dovršavanje korisničkog profila te ograničavanje pristupa zaštićenim funkcionalnostima. Za autentifikaciju koristi Supabase Auth, uz podršku prijavi putem Googlea i GitHuba te emaila i lozinke.

CoStay pohranjuje podatke korisničkog profila u vlastitoj bazi i na poslužitelju provjerava ispunjava li korisnik uvjete za pristup. Uspješna autentifikacija bez dovršenog obaveznog profila nije dovoljna za korištenje funkcionalnosti namijenjenih registriranim korisnicima. Upravljanje identitetom i vjerodajnicama povjereno je Supabase Authu. CoStay ne upravlja lozinkama Googleovih ili GitHubovih računa.

## 1.4 Postojeći pristupi i opravdanost projekta

Predstavljeni problem već dugo postoji. Ljudi bi često odustali od tih smještaja ako ne bi uspjeli skupiti dovoljno prijatelja da popune smještaj. Jedno od najčešćih rješenja je postavljanje upita na društvene mreže. Naša stranica je bolje rješenje problema jer služi isključivo za pronalazak smještaja, dok društvene mreže imaju različite svrhe. Osim toga naša stranica ima recenzije koje služe za procjenu kojim ljudima se može vjerovati, a kojima ne. Također, mi pružamo lakšu pretragu smještaja te preporuke smještaja koje smatramo da bi korisniku bile zanimljive.

---

> **Završna provjera:** Opis problema, cilj projekta, korisnici i dionici, granice opsega te postojeći pristupi međusobno su usklađeni. Navedene koristi ne predstavljaju neprovjerene tvrdnje, a uključene i izostavljene funkcionalnosti odgovaraju odobrenom projektnom zadatku.
