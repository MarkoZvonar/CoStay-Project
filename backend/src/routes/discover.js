import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireRegistered } from "../middleware/requireRegistered.js";

const router = express.Router();

// GET /discover
router.get("/", requireRegistered, async (req, res, next) => {
  try {
    // 1. Kreiranje Supabase klijenta s tokenom prijavljenog korisnika
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
            Authorization: `Bearer ${req.session.accessToken}`,
          },
        },
      },
    );

    // 2. Dohvat ID-ja prijavljenog korisnika
    const idKorisnik = req.korisnik.id_korisnik;

    console.log("Prijavljeni korisnik:", idKorisnik);

    // 3. Dohvat tagova prijavljenog korisnika
    const { data: korisnikTagovi, error: tagoviError } =
      await korisnickiSupabase
        .from("KORISNIK_TAGOVI")
        .select("id_tag")
        .eq("id_korisnik", idKorisnik);

    if (tagoviError) {
      console.error("Greška kod dohvata korisničkih tagova:", tagoviError);
      return next(tagoviError);
    }

    console.log("Korisnički tagovi:", korisnikTagovi);

    const tagIds = korisnikTagovi.map((t) => t.id_tag);

    let objave = [];

    // 4. Dohvat objava koje imaju barem jedan korisnikov tag
    if (tagIds.length > 0) {
      const { data: objavaTagovi, error: objTagError } =
        await korisnickiSupabase
          .from("OBJAVA_TAG")
          .select("id_objava")
          .in("id_tag", tagIds);

      if (objTagError) {
        console.error("Greška kod dohvata veza objava-tag:", objTagError);
        return next(objTagError);
      }

      console.log("Veze objava-tag:", objavaTagovi);

      // Uklanjanje duplikata ID-jeva objava
      const objavaIds = [...new Set(objavaTagovi.map((ot) => ot.id_objava))];

      console.log("ID-jevi objava:", objavaIds);

      // 5. Dohvat objava s pripadajućim podacima
      if (objavaIds.length > 0) {
        const { data: dohvaceneObjave, error: objavaError } =
          await korisnickiSupabase
            .from("OBJAVA")
            .select(
              `
              *,
              id_lokacije (
                ime_lokacije,
                latitude,
                longitude
              ),
              id_autor (
                ime,
                prezime
              ),
              OBJAVA_TAG (
                TAG (
                  ime_tag
                )
              )
            `,
            )
            .in("id_objava", objavaIds)
            .eq("status_objave", "otvorena");

        if (objavaError) {
          console.error("Greška kod dohvata objava:", objavaError);
          return next(objavaError);
        }

        objave = dohvaceneObjave || [];
      }
    }

    console.log("Dohvaćene objave:", objave);

    // 6. Prikaz Discover stranice
    return res.render("discover", {
      ime: req.korisnik.ime || "",
      email: req.korisnik.email || "",
      prezime: req.korisnik.prezime || "",
      birthday: req.korisnik.datum_rodenja || "",
      spol: req.korisnik.spol || "",
      smjestaji: objave,
      brojac: objave.length,
    });
  } catch (error) {
    console.error("Neočekivana greška u Discover ruti:", error);
    next(error);
  }
});

export default router;
