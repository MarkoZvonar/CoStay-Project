# CoStay — dokumentacija baze podataka

> Pregled relacijskog modela, pravila integriteta i pristupa podacima za prvu predaju projekta CoStay. Dokumentacija je izrađena prema priloženom pregledu baze podataka; opisuje postojeću strukturu, a ne predlaže novu implementaciju.

## Sadržaj

- [1. Svrha i arhitektura](#1-svrha-i-arhitektura)
- [2. Entiteti i atributi](#2-entiteti-i-atributi)
- [3. Relacije i kardinalnosti](#3-relacije-i-kardinalnosti)
- [4. Enumerirani tipovi](#4-enumerirani-tipovi)
- [5. Ograničenja integriteta](#5-ogranicenja-integriteta)
- [6. RLS politike pristupa](#6-rls-politike-pristupa)
- [7. SQL funkcije i okidači](#7-sql-funkcije-i-okidaci)
- [8. Napomene](#8-napomene)

## 1. Svrha i arhitektura

Baza podataka aplikacije **CoStay** podržava povezivanje korisnika radi zajedničkog smještaja. Obuhvaća korisničke profile i interese, lokacije, objave, zahtjeve za pridruživanje, razgovore i poruke, recenzije, prijave neprimjerenog sadržaja te evidenciju troškova.

- **Sustav:** PostgreSQL u Supabaseu.
- **Shema:** `public`.
- **Broj tablica:** 15.
- **Sigurnost:** Row Level Security (RLS) uključen je na svih 15 tablica.
- **Identifikatori:** uglavnom `uuid`; odnosi se provode primarnim i stranim ključevima.
- **Datumi i vrijeme:** `date` za datume putovanja, `timestamptz` za vremenske oznake.
- **Statusi:** ograničeni PostgreSQL enumeriranim tipovima (`enum`).

## 2. Entiteti i atributi

**Legenda:** `PK` — primarni ključ; `FK` — strani ključ; `UQ` — jedinstvena vrijednost; `?` — stupac dopušta `NULL`. Atributi su navedeni prema stvarnim nazivima i tipovima u bazi.

### Korisnici i interesi

#### `KORISNIK`

Profil korisnika, osobni podaci i status računa.

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_korisnik` | `uuid` | PK |
| `ime`, `prezime` | `varchar` | ? |
| `datum_rodenja` | `date` | ? |
| `spol` | `enum` | ? |
| `mjesto_stanovanja` | `varchar` | ? |
| `email` | `varchar` | UQ |
| `profilna_slika_url` | `text` | ? |
| `uloga`, `status_korisnickog_racuna` | `enum` | ? |
| `datum_kreiranja_racuna` | `timestamptz` | ? |
| `opis` | `text` | ? |

Povezan je s objavama, zahtjevima, recenzijama, porukama, troškovima, prijavama sadržaja i interesima.

#### `TAG`

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_tag` | `uuid` | PK |
| `ime_tag` | `varchar` | UQ |

Rječnik interesa i oznaka koji se mogu pridružiti korisnicima i objavama.

#### `KORISNIK_TAGOVI`

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_tag` | `uuid` | PK, FK → `TAG` |
| `id_korisnik` | `uuid` | PK, FK → `KORISNIK` |

Složeni primarni ključ (`id_tag`, `id_korisnik`) sprječava ponavljanje istog para.

### Lokacije i objave

#### `LOKACIJA`

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_lokacije` | `uuid` | PK |
| `ime_lokacije` | `varchar` | UQ |
| `latitude`, `longitude` | `numeric` | ? |
| `ime_drzave` | `text` | ? |

Jedna lokacija može biti povezana s više objava.

#### `OBJAVA`

Središnji entitet ponude zajedničkog smještaja.

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_objava` | `uuid` | PK |
| `id_autor` | `uuid` | FK → `KORISNIK` |
| `id_lokacije` | `uuid` | FK → `LOKACIJA` |
| `check_in`, `check_out` | `date` | — |
| `ukupna_cijena` | `numeric` | — |
| `ukupni_kapacitet` | `integer` | — |
| `preostalih_mjesta` | `integer` | ? |
| `opis` | `text` | — |
| `booking_url` | `text` | ? |
| `rok_prijave` | `timestamptz` | — |
| `status_objave` | `enum` | ? |
| `datum_kreiranja_objave` | `timestamptz` | ? |

Povezana je sa slikama, oznakama, zahtjevima, razgovorima, recenzijama i troškovima.

#### `OBJAVA_SLIKA`

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_slika` | `uuid` | PK |
| `id_objava` | `uuid` | FK → `OBJAVA` |
| `url_slika` | `text` | ? |

Jedna objava može imati više fotografija.

#### `OBJAVA_TAG`

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_tag` | `uuid` | PK, FK → `TAG` |
| `id_objava` | `uuid` | PK, FK → `OBJAVA` |

Povezna tablica za odnos više-prema-više između objava i oznaka.

#### `SPREMLJENA_OBJAVA`

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_korisnik` | `uuid` | PK, FK → `KORISNIK` |
| `id_objava` | `uuid` | PK, FK → `OBJAVA` |

Složeni primarni ključ onemogućuje da korisnik spremi istu objavu više puta.

### Pridruživanje, recenzije i moderacija

#### `ZAHTJEV_ZA_PRIDRUZIVANJE`

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_zahtjev` | `uuid` | PK |
| `id_podnositelja` | `uuid` | FK → `KORISNIK` |
| `id_objava` | `uuid` | FK → `OBJAVA` |
| `status_zahtjeva` | `enum` | ? |
| `datum_kreiranja_zahtjeva` | `timestamptz` | ? |

Ograničenje `UNIQUE(id_objava, id_podnositelja)` dopušta samo jedan zahtjev pojedinog korisnika za pojedinu objavu.

#### `RECENZIJA`

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_recenzija` | `uuid` | PK |
| `id_autor`, `id_primatelj` | `uuid` | FK → `KORISNIK` |
| `id_objava` | `uuid` | FK → `OBJAVA` |
| `ocjena` | `integer` | — |
| `komentar` | `text` | ? |
| `datum_objave_recenzije` | `timestamptz` | ? |

Ocjena je od 1 do 5; korisnik ne može ocijeniti samoga sebe.

#### `PRIJAVA_NEPRIMJERENOG_SADRZAJA`

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_prijava` | `uuid` | PK |
| `id_autor_prijave` | `uuid` | FK → `KORISNIK` |
| `tip_prijave` | `enum` | — |
| `id_prijavljenog_sadrzaja` | `uuid` | — |
| `id_prijavljenog_korisnika` | `uuid` | FK → `KORISNIK` |
| `razlog` | `varchar` | — |
| `opis` | `text` | ? |
| `vrijeme_stvaranja_prijave` | `timestamptz` | ? |
| `status_prijave` | `enum` | ? |
| `poduzeta_mjera` | `text` | ? |

Prijava može označavati objavu, poruku ili korisnički profil. Polje `id_prijavljenog_sadrzaja` nije navedeno kao izravni strani ključ.

### Troškovi i komunikacija

#### `TROSKOVI`

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_trosak` | `uuid` | PK |
| `id_korisnik` | `uuid` | FK → `KORISNIK` |
| `id_objava` | `uuid` | FK → `OBJAVA` |
| `iznos` | `numeric` | — |
| `rok_placanja` | `timestamptz` | — |
| `datum_placanja` | `timestamptz` | ? |
| `status_placanja` | `enum` | ? |

Evidencija pojedinačnih zaduženja i njihovog statusa plaćanja.

#### `RAZGOVOR`

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_razgovor` | `uuid` | PK |
| `razgovor_tip` | `enum` | ? |
| `id_objava` | `uuid` | FK → `OBJAVA` |

Razgovor može biti izravan ili grupni i povezan je s objavom.

#### `PORUKA`

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_poruka` | `uuid` | PK |
| `id_razgovor` | `uuid` | FK → `RAZGOVOR` |
| `id_posiljatelj` | `uuid` | FK → `KORISNIK` |
| `poruka` | `text` | ? |
| `vrijeme_slanja` | `timestamptz` | — |

Vidljivost poruka ovisi o članstvu u razgovoru.

#### `SUGOVORNIK`

| Atribut | Tip | Oznaka |
|---|---|---|
| `id_razgovor` | `uuid` | PK, FK → `RAZGOVOR` |
| `id_sugovornik` | `uuid` | PK, FK → `KORISNIK` |

Povezna tablica korisnika i razgovora.

## 3. Relacije i kardinalnosti

| Relacija | Kardinalnost | Značenje |
|---|---|---|
| `KORISNIK` → `OBJAVA` | 1:N | Korisnik može biti autor više objava. |
| `LOKACIJA` → `OBJAVA` | 1:N | Više objava može pripadati istoj lokaciji. |
| `KORISNIK` ↔ `TAG` | N:M | Preko `KORISNIK_TAGOVI`. |
| `OBJAVA` ↔ `TAG` | N:M | Preko `OBJAVA_TAG`. |
| `KORISNIK` ↔ `OBJAVA` | N:M | Spremljene objave preko `SPREMLJENA_OBJAVA`. |
| `OBJAVA` → `ZAHTJEV_ZA_PRIDRUZIVANJE` | 1:N | Objava može primiti više zahtjeva. |
| `RAZGOVOR` ↔ `KORISNIK` | N:M | Preko `SUGOVORNIK`. |
| `RAZGOVOR` → `PORUKA` | 1:N | Razgovor sadrži više poruka. |
| `OBJAVA` → `TROSKOVI` / `RECENZIJA` | 1:N | Troškovi i recenzije povezani su s objavom. |

## 4. Enumerirani tipovi

| PostgreSQL enum | Dopuštene vrijednosti |
|---|---|
| `spol` | `ženski`, `muški`, `ostalo` |
| `korisnik_uloga` | `admin`, `registrirani_korisnik` |
| `status_korisnickog_racuna` | `aktivan`, `suspendiran`, `obrisan` |
| `status_objave` | `otvorena`, `popunjena`, `ceka_odluku`, `dogovorena`, `otkazana`, `izbrisana` |
| `status_zahtjeva_za_pridruzivanje` | `na_cekanju`, `prihvacen`, `odbijen`, `povucen` |
| `razgovor_tip` | `izravan`, `grupni` |
| `status_placanja` | `podmiren`, `nepodmiren` |
| `vrsta_prijavljenog_sadrzaja` | `objava`, `poruka`, `korisnicki_profil` |
| `status_prijave` | `zaprimljena`, `u_obradi`, `prihvacena`, `rijesena`, `odbijena` |

## 5. Ograničenja integriteta

Baza koristi `PRIMARY KEY` za jedinstvenost zapisa, `FOREIGN KEY` za referencijalni integritet, `UNIQUE` za sprječavanje duplikata, `CHECK` za poslovna pravila te `NOT NULL` za obavezne atribute (sve koji nisu označeni s `?`).

| Tablica | Ograničenja |
|---|---|
| `KORISNIK` | `UNIQUE(email)` — postoje dva istoznačna UNIQUE ograničenja. |
| `TAG` | `UNIQUE(ime_tag)` |
| `LOKACIJA` | `UNIQUE(ime_lokacije)`; `CHECK(length(ime_drzave) < 100)` |
| `OBJAVA` | `CHECK(check_in < check_out)`; `CHECK(rok_prijave <= check_in)`; `CHECK(ukupni_kapacitet > 0)`; `CHECK(preostalih_mjesta <= ukupni_kapacitet)` |
| `RECENZIJA` | `CHECK(ocjena BETWEEN 1 AND 5)`; `CHECK(id_autor <> id_primatelj)`; `UNIQUE(id_objava, id_autor, id_primatelj)` |
| `ZAHTJEV_ZA_PRIDRUZIVANJE` | `UNIQUE(id_objava, id_podnositelja)` |
| `KORISNIK_TAGOVI`, `OBJAVA_TAG`, `SPREMLJENA_OBJAVA`, `SUGOVORNIK` | Složeni primarni ključevi. |

### Pravila brisanja povezanih zapisa

Mnogi strani ključevi koriste `ON DELETE CASCADE`, primjerice korisnik → objave, objava → slike i razgovor → poruke. Veza `RAZGOVOR.id_objava` koristi `ON DELETE SET NULL`, dok veze zahtjev → objava i trošak → objava nemaju eksplicitno `CASCADE`.

> **Napomena:** `RAZGOVOR.id_objava` je označen kao `NOT NULL`, a njegov strani ključ koristi `ON DELETE SET NULL`. Pri brisanju povezane objave to može izazvati konflikt ograničenja.

## 6. RLS politike pristupa

**Row Level Security (RLS)** aktivan je na svih 15 tablica. Pristup se određuje prema PostgreSQL ulozi i identitetu prijavljenog korisnika.

- `USING` određuje koje postojeće retke korisnik može čitati, ažurirati ili brisati.
- `WITH CHECK` određuje koje nove vrijednosti korisnik smije unijeti ili postaviti pri ažuriranju.
- Za `UPDATE` se, kada je potrebno, koriste oba uvjeta.
- Više permisivnih politika za istu operaciju kombinira se logičkim `OR`.

### Implementirane politike po tablicama

| Tablica | Broj | Pravila pristupa |
|---|---:|---|
| `KORISNIK` | 4 | Javni `SELECT`; vlastiti `INSERT` uz provjeru UID-a, uloge, statusa i e-maila iz JWT-a; vlastiti `UPDATE` ili admin; `DELETE` admin. |
| `KORISNIK_TAGOVI` | 3 | Korisnik vidi, dodaje i uklanja vlastite tagove. |
| `LOKACIJA` | 4 | Javni `SELECT`; aktivni registrirani korisnici `INSERT`; admin `UPDATE`/`DELETE`. |
| `OBJAVA` | 4 | Javni `SELECT`; `INSERT` autor ili admin; `UPDATE`/`DELETE` autor. |
| `OBJAVA_SLIKA` | 2 | Javni `SELECT`; autor pripadajuće objave ima `ALL`. |
| `OBJAVA_TAG` | 3 | Javni `SELECT`; autor objave `INSERT`/`DELETE`. |
| `PORUKA` | 3 | Članovi razgovora čitaju poruke i šalju ih pod vlastitim identitetom; admin `ALL`. |
| `RAZGOVOR` | 2 | Članovi `SELECT`; admin `ALL`. |
| `SUGOVORNIK` | 2 | Članovi `SELECT` putem pomoćne funkcije; admin `ALL`. |
| `ZAHTJEV_ZA_PRIDRUZIVANJE` | 6 | Podnositelj `INSERT`; podnositelj ili autor objave `SELECT`/`UPDATE`; posebne politike povlačenja; admin `DELETE`. |
| `RECENZIJA` | 1 | `ALL` za autora recenzije ili admina (politika deklarirana za `public`). |
| `SPREMLJENA_OBJAVA` | 1 | `ALL` za vlasnika ili admina. |
| `PRIJAVA_NEPRIMJERENOG_SADRZAJA` | 3 | Podnositelj `INSERT`/`SELECT` vlastitih prijava; admin `ALL`. |
| `TAG` | 2 | Javni `SELECT`; admin `ALL`. |
| `TROSKOVI` | 2 | Vlasnik `SELECT`; admin `ALL`. |

### Primjer implementacije RLS-a

Sljedeći SQL je **ilustrativan primjer** načina na koji se opisano vlasničko pravilo može implementirati; nije doslovan izvoz postojećih politika.

```sql
-- Uključivanje RLS-a na tablici
ALTER TABLE public."OBJAVA" ENABLE ROW LEVEL SECURITY;

-- Autor može mijenjati samo vlastitu objavu
CREATE POLICY "Autor ažurira vlastitu objavu"
ON public."OBJAVA"
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id_autor)
WITH CHECK ((SELECT auth.uid()) = id_autor);
```

U postojećem modelu dodatni okidači štite određena polja objave od promjene. Za administrativne provjere koristi se funkcija `is_admin()`.

## 7. SQL funkcije i okidači

U pregledu baze navedeno je osam SQL funkcija:

| Funkcija | Namjena |
|---|---|
| `is_admin()` | Vraća `boolean` provjerom postoji li korisnik s `auth.uid()` i ulogom `admin`; koristi se u RLS pravilima. |
| `popunjeni_obavezni_podaci_korisnika()` | Pri `INSERT`/`UPDATE` korisnika zahtijeva ime, prezime, spol, mjesto stanovanja i najmanje 18 godina. |
| `postavi_broj_raspolozivih_mjesta()` | Na `INSERT` objave smanjuje `NEW.preostalih_mjesta` za 1. |
| `provjeri_datume_objave()` | Na `INSERT` objave odbija datume dolaska, odlaska i rok prijave u prošlosti. |
| `provjeri_promjenu_statusa_zahtjeva()` | Na `UPDATE` zahtjeva štiti poveznice i dopuštene prijelaze statusa; admin je izuzet. |
| `zabrani_promjenu_id_lokacije()` | Na `UPDATE` lokacije zabranjuje izmjenu identifikatora. |
| `zabrani_promjenu_objava()` | Na `UPDATE` objave zabranjuje izmjenu ID-a, autora, lokacije i datuma stvaranja. |
| `zabrani_promjenu_objava_slika()` | Na `UPDATE` slike zabranjuje izmjenu ID-a slike i pripadajuće objave. |

### Okidači (triggers)

| Tablica | Okidač | Događaj |
|---|---|---|
| `KORISNIK` | `trg_validiraj_korisnika` | `INSERT`, `UPDATE` |
| `LOKACIJA` | `trigger_zabrani_promjenu_id_lokacije` | `UPDATE` |
| `OBJAVA` | `trg_postavi_broj_raspolozivih_mjesta` | `INSERT` |
| `OBJAVA` | `trg_postavi_broj_spolozivih_mjesta` | `INSERT` |
| `OBJAVA` | `trigger_provjeri_datume_objave` | `INSERT` |
| `OBJAVA` | `trigger_zabrani_promjenu_objava` | `UPDATE` |
| `OBJAVA_SLIKA` | `trigger_zabrani_promjenu_objava_slika` | `UPDATE` |
| `ZAHTJEV_ZA_PRIDRUZIVANJE` | `trg_provjeri_promjenu_statusa_zahtjeva` | `UPDATE` |

> **Napomena:** Dva okidača na `INSERT` tablice `OBJAVA` pozivaju funkciju za smanjenje broja raspoloživih mjesta. To treba provjeriti jer oba mogu djelovati na isti unos.

## 8. Napomene

Ovaj `README.md` dokumentira stanje opisano u materijalu **„CoStay – pregled baze podataka (1. predaja)”**. Tablice i njihovi atributi, veze, enumerirani tipovi, ograničenja, RLS pravila, funkcije i okidači preneseni su iz tog pregleda. SQL isječak u odjeljku 6 služi za objašnjenje implementacijskog obrasca, a ne kao migracija spremna za izvršavanje.

