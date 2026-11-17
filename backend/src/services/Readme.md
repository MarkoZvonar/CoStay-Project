refreshTokens.js:

    Datoteka sadrži funkciju refreshTokens() koja omogućuje obnovu Supabase autentifikacijskih tokena bez ponovne prijave korisnika.

    Funkcija prima refreshToken i expectedUserId, a zatim pomoću Supabase Autha pokušava obnoviti sesiju i provjerava pripada li ona očekivanom korisniku.

    Mogući rezultati:

    ok – obnova je uspješna; vraćaju se novi access token, refresh token i vrijeme isteka.

    invalid – token ili obnovljena sesija nisu valjani.

    unavailable – privremena pogreška ili nedostupnost usluge.

    Funkciju poziva middleware refreshSession.js, koji odlučuje kada je obnova potrebna i sprema nove tokene u Express sesiju.

    Izdvojena je u services radi razdvajanja komunikacije sa Supabase Authom od obrade HTTP zahtjeva.
