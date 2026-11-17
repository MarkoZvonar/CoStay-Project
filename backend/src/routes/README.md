U pages.js:
implementirala sam registraciju emailom i lozinkom. Korisničke podatke dohvaćam iz obrasca i provjeravam njihovu valjanost. Zatim pomoću Supabase Auth funkcije signUp() pokrećem stvaranje autentifikacijskog računa. Korisnik mora potvrditi email i prijaviti se, a tek zatim na signup2 unosi obavezne podatke koji se spremaju u tablicu KORISNIK. Tako odvajam autentifikaciju od dovršavanja korisničkog profila.

    signup3 služi za nadopunu već registriranog korisničkog profila. Koristi requireRegistered za zaštitu pristupa, dohvaća dostupne tagove iz baze, provjerava i normalizira podatke iz obrasca, ažurira opis pomoću update() te sprema veze korisnika i tagova pomoću upsert(). Pristup podacima dodatno je ograničen RLS pravilima.
