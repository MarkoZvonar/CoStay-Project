# Pregled dosadašnjeg rada — prvi ciklus

**Projekt:** CoStay

**Tim:** L-A-10.1, Palačinke

**Razdoblje:** 16. 10. – 19. 11. 2026.

**Datum pregleda:** 19. 11. 2026.

## Način organizacije rada

Rad je organiziran početnom podjelom pripreme sučelja, baze podataka i autentifikacije, a zatim podjelom odgovornosti za pojedine kartice aplikacije. Završni dio razdoblja bio je usmjeren na dokumentaciju i postavljanje aplikacije na Render.

Ovo je naknadno sastavljen pregled stvarnog rada i dogovorene podjele odgovornosti. Razdoblja u nastavku predstavljaju razvojne faze. Aktivnosti su se djelomično preklapale: dokumentacija se pripremala i tijekom razvoja, a dorade koda nastavile su se i nakon prelaska glavnog fokusa na dokumentaciju.

Tim se sastajao svakog četvrtka radi pregleda napretka, razjašnjavanja pitanja i dogovora o daljnjem radu. Kada pojedina pitanja nisu bila jasna, članovi su tražili pojašnjenje asistenta. Marko je koordinirao podjelu poslova i organizaciju rada na GitHubu. Za praćenje zadataka koristili su se GitHub Issues i Projects ploča PlanBoard.

Početak promatranog razdoblja je 16. listopada. Detaljnija podjela aktivnosti u ovom pregledu zabilježena je od 22. listopada; za ranije dane nisu dodani pojedinačni zadaci ili sastanci koji nisu potvrđeni.

## Faza 1 — početno postavljanje i priprema aplikacije

**Razdoblje:** 22. 10. – 29. 10. 2026.

**Cilj:** Pripremiti početnu strukturu projekta, korisničko sučelje, bazu i autentifikaciju kako bi se razvoj mogao nastaviti po funkcionalnostima.

| Područje | Odgovorni članovi | Rad i doprinos |
| --- | --- | --- |
| Početna dokumentacija | Sven Prelogović, Iva Tomić | Rad na početnoj projektnoj dokumentaciji. Dokumentaciju su dopunjavali i ostali članovi, primjerice Leon opisom projekta, a Dora zahtjevima i ograničenjima. |
| Početno korisničko sučelje | Leon Marković, Lovro Krčmarić | Izrada početnih stranica, navigacije i izgleda aplikacije kao osnove za daljnji razvoj kartica. |
| Autentifikacija | Dora Arnold | Rad na prijavi i registraciji, povezivanju s autentifikacijskim sustavom te integraciji pripadajućih stranica i ruta. |
| Baza podataka | Nika Ugarković-Štimac | Priprema baze podataka u Supabaseu za povezivanje s funkcionalnostima aplikacije. |
| Organizacija projekta | Marko Zvonar | Organizacija rada na GitHubu i postavljanje backloga, izrada logotipa, podjela poslova i koordinacija tima. |

**Rezultat faze:** Pripremljena je početna osnova projekta. Nakon toga odgovornosti su podijeljene prema pojedinim karticama aplikacije, uz zasebne odgovornosti za bazu i autentifikaciju.

## Faza 2 — razvoj i povezivanje funkcionalnosti

**Razdoblje glavnog fokusa:** od 29. 10. do 10. 11. 2026.

**Cilj:** Povezati pojedine kartice s backendom i bazom te ostvariti početne korisničke tijekove.

| Područje | Odgovorni član | Rad i rezultat do datuma pregleda |
| --- | --- | --- |
| Discover | Lovro Krčmarić | Razvoj prikaza i preporuka objava prema ključnim riječima, spremanja objava, prikaza za gosta i beskonačnog pomicanja. |
| Search | Leon Marković | Razvoj pretraživanja i filtriranja objava te prikaza rezultata na karti. |
| Create | Sven Prelogović | Razvoj stvaranja objava, pripadajućih provjera i povezivanja s bazom podataka. |
| Profile | Iva Tomić | Razvoj prikaza i uređivanja profila, ključnih riječi, profilne slike te prikaza vlastitih i spremljenih objava. Do 19.11. dodan je i prikaz zahtjeva na profilu. |
| Inbox | Marko Zvonar | Razvoj prikaza razgovora, dohvata i slanja poruka te podrške već formiranim izravnim i grupnim razgovorima. Naknadno je dodan Supabase Realtime za osvježavanje poruka. |
| Prijava i registracija | Dora Arnold | Razvoj prijave i registracije, upravljanja sesijama, odjave i oporavka lozinke te naknadne dorade autentifikacije. |
| Baza i povezane operacije | Nika Ugarković-Štimac | Rad na strukturi i pravilima pristupa u Supabaseu te povezanim operacijama zahtjeva za pridruživanje i prikaza recenzija. |

**Rezultat faze:** Razvijene su osnovne funkcionalnosti kartica i povezane s podacima iz Supabasea. Opisi u tablici uključuju i naknadne dorade do 19. studenoga; ne označavaju da je cjelokupan projektni zadatak dovršen.

**Primjeri naknadnih dorada:** Inbox je dobio Realtime komunikaciju, autentifikacija je dodatno uređena, popravljena je prilagodba pojedinih početnih stranica različitim veličinama zaslona te je proširen prikaz zahtjeva na profilu.

## Faza 3 — dokumentacija, deploy i priprema predaje

**Razdoblje glavnog fokusa:** 11. 11. – 19. 11. 2026.

**Cilj:** Objediniti dokumentaciju prvog ciklusa, opisati ostvareno stanje i postaviti aplikaciju na javno dostupno okruženje.

| Aktivnost | Odgovorni članovi | Rad i rezultat |
| --- | --- | --- |
| Dopuna dokumentacije | Članovi tima prema podjeli poglavlja | Dopunjena su poglavlja o opsegu, zahtjevima, obrascima uporabe, arhitekturnim odlukama i oblikovanju. |
| Postavljanje aplikacije | Iva Tomić, Marko Zvonar | Aplikacija je postavljena na Render i konfigurirana za rad sa Supabaseom i javnom adresom aplikacije. |


U dokumentaciji su, među ostalim, evidentirani sljedeći doprinosi:

- Leon: opis projekta i dorade funkcijskih zahtjeva.
- Dora: zahtjevi i ograničenja, promjene zahtjeva, sljedivost, arhitekturne odluke i opisi autentifikacije.
- Nika: ER dijagram i opis modela podataka.
- Lovro: pregledni dijagram obrazaca uporabe, specifikacije vezane uz Discover i Inbox te oblikovanje Inboxa.
- Sven: specifikacije obrazaca uporabe i provjera njihove dosljednosti.
- Iva: početna dokumentacija i dopuna opisa postavljanja aplikacije.
- Marko: ispravci i priprema PDF-a.

**Rezultat faze:** Aplikacija je postavljena na Render. Dokumentacija prvog ciklusa objedinjena je u [PDF za predaju](../deliverables/PROINZ26_G10.1_CoStay_v1.pdf), koji obuhvaća poglavlja 1–4.3 bez 2.7 i 4.2.

## Preostali rad

Do 19. studenoga nisu ostvarene sve funkcionalnosti iz opisa projekta. Za nastavak razvoja ostaju, među ostalim:

| Područje | Preostali rad |
| --- | --- |
| Recenzije | Omogućiti ostavljanje recenzija uz pravila o sudjelovanju na završenom putovanju. Postojeći prikaz recenzija ne predstavlja dovršenu funkcionalnost njihova ostavljanja. |
| Administracija | Ostvariti administratorske funkcionalnosti upravljanja korisnicima i sadržajem. |
| Prijave sadržaja | Omogućiti prijavljivanje neprimjerenih objava, poruka i profila te obradu prijava. |
| Uređivanje objava | Omogućiti naknadno uređivanje vlastitih objava. |
| Automatsko stvaranje grupa | Povezati dogovoreno putovanje s automatskim stvaranjem grupnog razgovora i upisom konačnih sudionika. Postojeći Inbox podržava već formirane grupe. |

Ovo je popis poznatog preostalog rada, a ne potpuna potvrda svih zahtjeva iz opisa projekta.

## Povezani zapisi i rezultati

- [Pregled aktivnosti grupe](../A-Pregled-aktivnosti-grupe.md)
- [GitHub Issues](https://github.com/MarkoZvonar/CoStay-Project/issues)
- [PlanBoard](https://github.com/users/MarkoZvonar/projects/1/views/1)
- [Promjene projekta](https://github.com/MarkoZvonar/CoStay-Project/commits/master/)
- [Projektna dokumentacija prvog ciklusa](../deliverables/PROINZ26_G10.1_CoStay_v1.pdf)
