import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireRegistered } from "../middleware/requireRegistered.js";

const router = express.Router();
function requireIdentity(req, res, next) {
  if (!req.session.user?.id) {
    return res.redirect("/login");
  }

  next();
}
// Početna stranica
router.get("/", async (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/start");
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
    const korisnickiSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    );

    // Provjera prijavljenog identiteta.
    const {
      data: { user },
      error: authError,
    } = await korisnickiSupabase.auth.getUser(accessToken);

    if (authError) {
      if (![400, 401, 403, 404].includes(authError.status)) {
        return res
          .status(503)
          .send("Provjera prijave trenutačno nije dostupna. Pokušaj ponovno.");
      }

      return res
        .status(401)
        .send(
          'Prijava je istekla. <a href="/logout">Odjavi se</a> pa se ponovno prijavi.',
        );
    }

    if (!user || user.id !== req.session.user.id) {
      return res.status(401).send("Identitet korisnika nije potvrđen.");
    }

    // Provjera postoji li njegov CoStay profil.
    const { data: korisnik, error } = await korisnickiSupabase
      .from("KORISNIK")
      .select(
        "id_korisnik,ime,prezime,email,datum_rodenja,spol,mjesto_stanovanja,status_korisnickog_racuna",
      )
      .eq("id_korisnik", user.id)
      .maybeSingle();

    if (error) {
      return next(error);
    }

    if (!korisnik) {
      return res.redirect("/signup2");
    }

    if (korisnik.status_korisnickog_racuna !== "aktivan") {
      return res.status(403).send("Tvoj račun nije aktivan.");
    }

    // Učitavamo spremljene podatke za postojeće EJS stranice.
    req.session.ime = korisnik.ime;
    req.session.prezime = korisnik.prezime;
    req.session.email = korisnik.email;
    req.session.birthday = korisnik.datum_rodenja;
    req.session.spol = korisnik.spol;
    req.session.mjesto_stanovanja = korisnik.mjesto_stanovanja;

    return res.redirect("/discover");
  } catch (error) {
    next(error);
  }
});
// Start stranica

router.get("/create", requireRegistered, (req, res) => {
  res.render("create", {
    ime: req.session.ime || "",
    email: req.session.email || "",
    password: req.session.password || "",
    prezime: req.session.prezime || "",
    birthday: req.session.birthday || "",
    spol: req.session.spol || "",
  });
});
router.get("/inbox", requireRegistered, (req, res) => {
  res.render("inbox", {
    ime: req.session.ime || "",
    email: req.session.email || "",
    prezime: req.session.prezime || "",
    birthday: req.session.birthday || "",
    spol: req.session.spol || "",
  });
});

router.get("/search", (req, res) => {
  res.render("search", {
    ime: req.session.ime || "",
    email: req.session.email || "",
    prezime: req.session.prezime || "",
    birthday: req.session.birthday || "",
    spol: req.session.spol || "",
  });
});
router.get("/profile", requireRegistered, (req, res) => {
  res.render("profile", {
    ime: req.session.ime || "",
    email: req.session.email || "",
    prezime: req.session.prezime || "",
    birthday: req.session.birthday || "",
    spol: req.session.spol || "",
  });
});

// Start stranica
router.get("/start", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("start");
});

// Login stranica
router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("login");
});

// Signup stranice
router.get("/signup1", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("signup1");
});
router.post("/signup1", async (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/");
  }

  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";

  const password = req.body.password;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return res.status(400).send("Unesi ispravnu email adresu.");
  }

  if (
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 128
  ) {
    return res.status(400).send("Lozinka mora imati između 12 i 128 znakova.");
  }

  // Uklanjamo eventualnu lozinku iz starog toka registracije.
  delete req.session.password;

  try {
    const authClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    const { error } = await authClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: new URL("/login", baseUrl).href,
      },
    });

    if (error) {
      console.error("Email registracija — kod:", error.code || "UNKNOWN");

      if (error.status === 429) {
        return res
          .status(429)
          .send(
            "Previše pokušaja ili slanja emailova. Pričekaj prije ponovnog pokušaja.",
          );
      }

      return res
        .status(400)
        .send(
          "Registracija nije uspjela. Provjeri podatke i postavke slanja emaila.",
        );
    }

    // Ne spremamo lozinku, ne prijavljujemo korisnika
    // i ne upisujemo ništa u KORISNIK.
    return res.send(`
      <h2>Provjeri email</h2>
      <p>
        Ako je registracija moguća, dobit ćeš poveznicu
        za potvrdu email adrese.
      </p>
      <p>
        Nakon potvrde prijavi se svojim emailom i lozinkom.
        Ako račun već postoji, koristi prijavu.
      </p>
      <a href="/login">Idi na prijavu</a>
    `);
  } catch (error) {
    next(error);
  }
});
router.get("/signup2", requireIdentity, (req, res) => {
  res.render("signup2");
});
router.post("/signup2", requireIdentity, async (req, res, next) => {
  const tekst = (vrijednost) =>
    typeof vrijednost === "string" ? vrijednost.trim() : "";
  const ime = tekst(req.body.ime);
  const prezime = tekst(req.body.prezime);
  const birthday = tekst(req.body.birthday);
  const spol = tekst(req.body.spol);
  const mjestoStanovanja = tekst(req.body.mjesto_stanovanja);
  if (!ime || !prezime || !mjestoStanovanja) {
    return res
      .status(400)
      .send("Ime, prezime i mjesto stanovanja su obavezni.");
  }
  if (!["muški", "ženski", "ostalo"].includes(spol)) {
    return res.status(400).send("Odaberi valjanu vrijednost za spol.");
  }
  // Provjeravamo format i postoji li taj datum.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    return res.status(400).send("Unesi valjan datum rođenja.");
  }
  const datum = new Date(`${birthday}T00:00:00Z`);
  const danas = new Date().toISOString().slice(0, 10);
  if (
    Number.isNaN(datum.getTime()) ||
    datum.toISOString().slice(0, 10) !== birthday ||
    birthday > danas
  ) {
    return res
      .status(400)
      .send("Datum rođenja mora biti valjan i ne smije biti u budućnosti.");
  }
  // Provjera ima li osoba najmanje 18 godina.
  const danasDatum = new Date();
  let dob = danasDatum.getUTCFullYear() - datum.getUTCFullYear();
  const mjesecRazlika = danasDatum.getUTCMonth() - datum.getUTCMonth();

  if (
    mjesecRazlika < 0 ||
    (mjesecRazlika === 0 && danasDatum.getUTCDate() < datum.getUTCDate())
  ) {
    dob--;
  }

  if (dob < 18) {
    return res
      .status(400)
      .send("Za registraciju moraš imati najmanje 18 godina.");
  }
  try {
    const accessToken = req.session.accessToken;
    if (!accessToken) {
      return res
        .status(401)
        .send(
          'Sesija nema pristupni token. <a href="/logout">Odjavi se</a> pa se ponovno prijavi.',
        );
    }
    // Zaseban klijent koji šalje token ovog korisnika.
    // Tako Supabase primjenjuje njegova RLS pravila.
    const korisnickiSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    );
    // Prije upisa ponovno provjeravamo identitet.
    const {
      data: { user },
      error: authError,
    } = await korisnickiSupabase.auth.getUser(accessToken);
    if (authError) {
      if (![400, 401, 403, 404].includes(authError.status)) {
        return res
          .status(503)
          .send("Provjera prijave trenutačno nije dostupna. Pokušaj ponovno.");
      }
      return res
        .status(401)
        .send(
          'Prijava više nije valjana. <a href="/logout">Odjavi se</a> pa se ponovno prijavi.',
        );
    }

    if (!user || user.id !== req.session.user.id) {
      return res.status(401).send("Identitet korisnika nije potvrđen.");
    }
    if (!user.email || !user.email_confirmed_at) {
      return res
        .status(403)
        .send("Za registraciju je potrebna potvrđena email adresa.");
    }
    const { error: insertError } = await korisnickiSupabase
      .from("KORISNIK")
      .insert({
        id_korisnik: user.id,
        email: user.email,
        ime: ime,
        prezime: prezime,
        datum_rodenja: birthday,
        spol: spol,
        mjesto_stanovanja: mjestoStanovanja,
        uloga: "registrirani_korisnik",
        status_korisnickog_racuna: "aktivan",
      });
    if (insertError) {
      // Ispisujemo samo kod greške, ne tokene ili osobne podatke.
      console.error("Spremanje profila — kod:", insertError.code);
      if (insertError.code === "23505") {
        return res
          .status(409)
          .send(
            "Profil s ovim identitetom ili emailom već postoji. Novi profil nije spremljen.",
          );
      }
      if (insertError.code === "42501") {
        return res
          .status(403)
          .send(
            "Baza nije dopustila spremanje profila. Potrebno je provjeriti RLS pravilo i unesene podatke.",
          );
      }
      return res
        .status(500)
        .send(
          "Spremanje profila nije uspjelo. Provjeri kod greške u terminalu.",
        );
    }
    // Tek nakon uspješnog upisa osvježavamo podatke u sesiji.
    req.session.ime = ime;
    req.session.prezime = prezime;
    req.session.email = user.email;
    req.session.birthday = birthday;
    req.session.spol = spol;
    req.session.mjesto_stanovanja = mjestoStanovanja;
    return req.session.save((saveError) => {
      if (saveError) return next(saveError);
      res.redirect("/signup3");
    });
  } catch (error) {
    next(error);
  }
});
router.get("/signup3", requireIdentity, (req, res) => {
  res.render("signup3");
});
router.post("/signup3", requireIdentity, (req, res) => {
  // Ovdje možete obraditi podatke iz forme, npr. spremiti ih u bazu podataka
  const { opis } = req.body;
  const { tagovi } = req.body;
  req.session.opis = opis;
  req.session.tagovi = tagovi;
  // Za sada samo preusmjeravamo na početnu
  res.redirect("/");
});

router.get("/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("app.sid", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect("/");
  });
});

export default router;
