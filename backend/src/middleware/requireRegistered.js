import { createUserClient } from "../config/supabase.js";
import { birthDateStatus } from "../utils/birthDate.js";

export async function requireRegistered(req, res, next) {
  if (!req.session.user?.id) {
    return res.redirect("/login");
  }

  const accessToken = req.session.accessToken;

  if (!accessToken) {
    return res
      .status(401)
      .send(
        'Potrebna je nova prijava. <a href="/logout">Odjavi se</a> pa se ponovno prijavi.',
      );
  }

  try {
    const korisnickiSupabase = createUserClient(accessToken);

    // Provjeravamo vrijedi li prijava.
    const {
      data: { user },
      error: authError,
    } = await korisnickiSupabase.auth.getUser(accessToken);

    if (authError) {
      if (![400, 401, 403, 404].includes(authError.status)) {
        return res
          .status(503)
          .send("Provjera prijave trenutačno nije dostupna.");
      }

      return res
        .status(401)
        .send(
          'Prijava je istekla. <a href="/logout">Odjavi se</a> pa se ponovno prijavi.',
        );
    }

    if (!user || user.id !== req.session.user.id) {
      return res.status(401).send("Identitet nije potvrđen.");
    }

    if (!user.email || !user.email_confirmed_at) {
      return res.status(403).send("Potrebna je potvrđena email adresa.");
    }

    // Čitamo profil iz baze, ne iz nacrta u sesiji.
    const { data: korisnik, error } = await korisnickiSupabase
      .from("KORISNIK")
      .select(
        "id_korisnik,ime,prezime,email,datum_rodenja,spol,mjesto_stanovanja,uloga,status_korisnickog_racuna",
      )
      .eq("id_korisnik", user.id)
      .maybeSingle();

    if (error) return next(error);

    if (!korisnik) {
      return res.redirect("/signup2");
    }

    if (
      korisnik.status_korisnickog_racuna !== "aktivan" ||
      !["registrirani_korisnik", "admin"].includes(korisnik.uloga)
    ) {
      return res.status(403).send("Račun nema dopušten pristup.");
    }

    const tekstPopunjen = (vrijednost) =>
      typeof vrijednost === "string" && vrijednost.trim().length > 0;

    const obavezniTekstovi = [
      korisnik.ime,
      korisnik.prezime,
      korisnik.email,
      korisnik.mjesto_stanovanja,
    ];

    const dobStatus = birthDateStatus(korisnik.datum_rodenja);
    if (dobStatus === "invalid") {
      return res.status(403).send("Spremljeni datum rođenja nije valjan.");
    }

    if (
      !obavezniTekstovi.every(tekstPopunjen) ||
      !["muški", "ženski", "ostalo"].includes(korisnik.spol) ||
      dobStatus !== "adult"
    ) {
      return res
        .status(403)
        .send("Spremljeni profil ne zadovoljava uvjete za pristup.");
    }

    // Provjereni profil dostupan je sljedećem handleru.
    req.korisnik = korisnik;

    return next();
  } catch (error) {
    next(error);
  }
}
