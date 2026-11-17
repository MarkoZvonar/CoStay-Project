## `authController.js`

| Metoda                           | Opis                                            |
| :------------------------------- | :---------------------------------------------- |
| `saveSession()`                  | Sprema Express sesiju                           |
| `regenerateSession()`            | Stvara novi ID sesije                           |
| `startOAuth()`                   | Pokreće Google/GitHub prijavu                   |
| `googleLogin()`, `githubLogin()` | Pozivaju `startOAuth()` za odabranog pružatelja |
| `authCallback()`                 | Dovršava OAuth prijavu nakon povratka korisnika |
| `emailLogin()`                   | Prijavljuje korisnika emailom i lozinkom        |
| `forgotPassword()`               | Šalje zahtjev za oporavak lozinke               |
| `recoveryCallback()`             | Obrađuje povratak putem poveznice iz emaila     |
| `showResetPassword()`            | Prikazuje obrazac za novu lozinku               |
| `resetPassword()`                | Provjerava zahtjev i mijenja lozinku            |

Funkcija startOAuth() pokreće prijavu putem Googlea ili GitHuba. Prvo provjerava je li korisnik već prijavljen, zatim stvara novu Express sesiju i sprema vrijeme početka prijave. Pomoću posebno konfiguriranog OAuth klijenta pokreće PKCE postupak. Privremene PKCE podatke spremamo u Express sesiju prije preusmjeravanja na vanjskog pružatelja identiteta. Nakon prijave korisnik se vraća na authCallback(), gdje se postupak dovršava.

Kada se korisnik vrati s Googlea ili GitHuba, funkcija authCallback() preuzima autorizacijski kod i provjerava postoji li valjan, nedavno pokrenut pokušaj prijave. Zatim pomoću spremljenih PKCE podataka razmjenjuje kod za Supabase sesiju. Ako je autentifikacija uspješna i email adresa potvrđena, generira novi ID Express sesije, sprema podatke korisnika i njegove tokene te ga preusmjerava na početnu rutu koja provjerava je li dovršio CoStay registraciju.

Funkcija emailLogin() preuzima email i lozinku iz obrasca i provjerava osnovnu valjanost podataka. Zatim pomoću Supabase Auth funkcije signInWithPassword() provjerava korisničke vjerodajnice. Ako je prijava uspješna, stvara novu Express sesiju i u nju sprema identitet korisnika, access token i refresh token. Na kraju preusmjerava korisnika na početnu rutu koja provjerava ima li dovršen profil. Tokene spremam u Express sesiju kako bih omogućila autentificirane zahtjeve prema Supabaseu i obnovu pristupnog tokena bez ponovne prijave korisnika.
