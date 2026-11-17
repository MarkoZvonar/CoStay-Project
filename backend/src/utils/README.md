birthDate.js
Datoteka sadrži funkciju birthDateStatus() za provjeru valjanosti datuma rođenja i punoljetnosti korisnika.
Funkcija prima datum u formatu YYYY-MM-DD i vraća:
invalid – datum nije valjan ili je u budućnosti.
underage – korisnik je mlađi od 18 godina.
adult – korisnik ima najmanje 18 godina.
Provjera se temelji na UTC datumu i koristi se tijekom registracije (signup2) te provjere korisničkog profila (requireRegistered).
Izdvojena je u utils kako bi se izbjeglo ponavljanje iste logike.
