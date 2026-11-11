import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireRegistered } from "../middleware/requireRegistered.js";
import { createUserClient } from "../config/supabase.js";
const router = express.Router();
function requireIdentity(req, res, next) {
  if (!req.session.user?.id) {
    return res.redirect("/login");
  }

  next();
}
// Početna stranica
router.get(
  "/",
  (req, res, next) => {
    // Gost ide na početnu stranicu.
    if (!req.session.user?.id) {
      return res.redirect("/start");
    }

    next();
  },
  requireRegistered,
  (req, res, next) => {
    // requireRegistered je već provjerio identitet i profil.
    const korisnik = req.korisnik;

    // Zadržavamo podatke koje discover i search još koriste.
    req.session.ime = korisnik.ime;
    req.session.prezime = korisnik.prezime;
    req.session.email = korisnik.email;
    req.session.birthday = korisnik.datum_rodenja;
    req.session.spol = korisnik.spol;
    req.session.mjesto_stanovanja = korisnik.mjesto_stanovanja;

    req.session.save((error) => {
      if (error) return next(error);

      return res.redirect("/discover");
    });
  },
);
// Start stranica

router.get("/create", requireRegistered, (req, res) => {
  res.render("create", {
    ime: req.korisnik.ime,
    email: req.korisnik.email,
    prezime: req.korisnik.prezime,
    birthday: req.korisnik.datum_rodenja,
    spol: req.korisnik.spol,
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
router.get("/signup2", requireIdentity, async (req, res, next) => {
  try {
    const accessToken = req.session.accessToken;

    if (!accessToken) {
      return res
        .status(401)
        .send(
          'Potrebna je nova prijava. <a href="/logout">Odjavi se</a> pa se ponovno prijavi.',
        );
    }

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

    const { data: profil, error } = await korisnickiSupabase
      .from("KORISNIK")
      .select("id_korisnik")
      .eq("id_korisnik", req.session.user.id)
      .maybeSingle();

    if (error) return next(error);

    if (profil) {
      // Početna ruta preko requireRegistered provjerava
      // identitet, potpunost profila, ulogu i status.
      return res.redirect("/");
    }

    return res.render("signup2");
  } catch (error) {
    next(error);
  }
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
    // Korisnik je možda već dovršio registraciju,
    // npr. u drugoj kartici ili prije ponovnog slanja obrasca.
    const { data: postojeciProfil, error: profileError } =
      await korisnickiSupabase
        .from("KORISNIK")
        .select("id_korisnik")
        .eq("id_korisnik", user.id)
        .maybeSingle();

    if (profileError) {
      return next(profileError);
    }

    if (postojeciProfil) {
      // Početna ruta ponovno provjerava status i potpunost profila.
      return res.redirect(303, "/");
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
router.get("/signup3", requireRegistered, async (req, res, next) => {
  try {
    const korisnickiSupabase = createUserClient(req.session.accessToken);

    const { data: dostupniTagovi, error: tagoviError } =
      await korisnickiSupabase
        .from("TAG")
        .select("id_tag, ime_tag")
        .order("ime_tag");

    if (tagoviError) return next(tagoviError);

    const { data: profil, error: profilError } = await korisnickiSupabase
      .from("KORISNIK")
      .select("opis")
      .eq("id_korisnik", req.korisnik.id_korisnik)
      .maybeSingle();

    if (profilError) return next(profilError);

    if (!profil) {
      return res.status(404).send("Profil nije pronađen.");
    }

    const { data: veze, error: vezeError } = await korisnickiSupabase
      .from("KORISNIK_TAGOVI")
      .select("id_tag")
      .eq("id_korisnik", req.korisnik.id_korisnik);

    if (vezeError) return next(vezeError);

    return res.render("signup3", {
      opis: profil.opis || "",
      dostupniTagovi: dostupniTagovi || [],
      odabraniTagovi: (veze || []).map((veza) => veza.id_tag),
    });
  } catch (error) {
    next(error);
  }
});
router.post("/signup3", requireRegistered, async (req, res, next) => {
  let opisSpremljen = false;

  try {
    // Opis je neobavezan, ali mora biti tekst.
    const rawOpis = req.body.opis ?? "";

    if (typeof rawOpis !== "string") {
      return res.status(400).send("Opis mora biti tekst.");
    }

    const opis = rawOpis.trim();

    if (opis.length > 2000) {
      return res.status(400).send("Opis može imati najviše 2000 znakova.");
    }

    // Checkboxi šalju:
    // - undefined ako ništa nije odabrano,
    // - string ako je odabran jedan tag,
    // - niz ako ih je odabrano više.
    const rawTagovi = req.body.tagovi;

    const odabraniTagovi =
      rawTagovi === undefined
        ? []
        : Array.isArray(rawTagovi)
          ? rawTagovi
          : [rawTagovi];

    const uuidFormat =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (
      odabraniTagovi.length > 100 ||
      !odabraniTagovi.every(
        (tag) => typeof tag === "string" && uuidFormat.test(tag),
      )
    ) {
      return res.status(400).send("Odabrane ključne riječi nisu valjane.");
    }

    const tagIds = [...new Set(odabraniTagovi.map((id) => id.toLowerCase()))];

    const korisnikId = req.korisnik.id_korisnik;
    const korisnickiSupabase = createUserClient(req.session.accessToken);

    // Prije upisa provjeravamo postoje li svi poslani tagovi.
    if (tagIds.length > 0) {
      const { data: dostupniTagovi, error: provjeraError } =
        await korisnickiSupabase
          .from("TAG")
          .select("id_tag")
          .in("id_tag", tagIds);

      if (provjeraError) throw provjeraError;

      if (!dostupniTagovi || dostupniTagovi.length !== tagIds.length) {
        return res
          .status(400)
          .send(
            "Neke ključne riječi više nisu dostupne. " +
              "Osvježi obrazac i odaberi ih ponovno.",
          );
      }
    }

    // Ažuriramo isključivo opis prijavljenog korisnika.
    const { data: profil, error: opisError } = await korisnickiSupabase
      .from("KORISNIK")
      .update({ opis })
      .eq("id_korisnik", korisnikId)
      .select("id_korisnik")
      .maybeSingle();

    if (opisError) throw opisError;

    if (!profil) {
      return res.status(403).send("Spremanje opisa nije dopušteno.");
    }

    opisSpremljen = true;

    // Dodajemo veze s odabranim tagovima.
    // Postojeće veze preskačemo kako ne bi nastali duplikati.
    if (tagIds.length > 0) {
      const veze = tagIds.map((idTag) => ({
        id_korisnik: korisnikId,
        id_tag: idTag,
      }));

      const { error: tagoviError } = await korisnickiSupabase
        .from("KORISNIK_TAGOVI")
        .upsert(veze, {
          onConflict: "id_tag,id_korisnik",
          ignoreDuplicates: true,
        });

      if (tagoviError) throw tagoviError;
    }

    // Ovi podaci sada se čitaju iz baze, ne iz starog nacrta.
    delete req.session.opis;
    delete req.session.tagovi;

    return req.session.save((saveError) => {
      if (saveError) return next(saveError);

      return res.redirect(303, "/discover");
    });
  } catch (error) {
    console.error("Signup3 spremanje — kod:", error.code || "UNKNOWN");

    return res
      .status(500)
      .send(
        (opisSpremljen
          ? "Opis je spremljen, ali spremanje ključnih riječi nije potvrđeno. "
          : "Spremanje nije potvrđeno. ") +
          'Otvori <a href="/signup3">obrazac</a>, provjeri podatke i pokušaj ponovno.',
      );
  }
});

// Otvaranje poveznice prikazuje potvrdu odjave.
router.get("/logout", (req, res) => {
  res.render("logout");
});

// Slanje obrasca završava Express sesiju.
router.post("/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("app.sid", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.redirect(303, "/start");
  });
});
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});
export default router;
