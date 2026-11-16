supabase.js:
Koristim zaseban Supabase klijent s access tokenom prijavljenog korisnika kako bi baza mogla prepoznati njegov identitet i primijeniti odgovarajuća RLS pravila.
Drugi klijent koristim za autentifikacijske operacije, primjerice prijavu i registraciju, bez unaprijed spremljene korisničke sesije.
Time odvajam autentifikaciju od pristupa podacima u kontekstu prijavljenog korisnika.

oauthClient.js:
Google/GitHub prijava uz PKCE i privremeno spremanje podataka u Express sesiju.
Za Google i GitHub koristim poseban OAuth klijent jer se korisnik tijekom prijave preusmjerava na vanjsku stranicu. Zato moram privremeno spremiti PKCE podatke u Express sesiju kako bih nakon povratka mogla dovršiti isti pokušaj prijave. storage određuje način spremanja tih podataka, a storageKey njihov naziv u spremištu.

env.js:
čitanje iz datoteke .env
