import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireRegistered } from "../middleware/requireRegistered.js";

const router = express.Router();

// GET /discover
router.get("/", requireRegistered, async (req, res, next) => {
  try {
    // 1. Kreiranje Supabase klijenta
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

    // 2. ID prijavljenog korisnika
    const idKorisnik = req.korisnik.id_korisnik;

    // 3. Dohvat tagova korisnika
    const { data: korisnikTagovi, error: tagoviError } =
      await korisnickiSupabase
        .from("KORISNIK_TAGOVI")
        .select("id_tag")
        .eq("id_korisnik", idKorisnik);

    if (tagoviError) return next(tagoviError);

    const tagIds = korisnikTagovi.map((t) => t.id_tag);

    let objave = [];

    // 4. Dohvat objava koje imaju barem jedan korisnikov tag
    if (tagIds.length > 0) {
      const { data: objavaTagovi, error: objTagError } =
        await korisnickiSupabase
          .from("OBJAVA_TAG")
          .select("id_objava")
          .in("id_tag", tagIds);

      if (objTagError) return next(objTagError);

      const objavaIds = [
        ...new Set(objavaTagovi.map((ot) => ot.id_objava)),
      ];

      // 5. Dohvat objava i povezanih podataka
      if (objavaIds.length > 0) {
        const { data: dohvaceneObjave, error: objavaError } =
          await korisnickiSupabase
            .from("OBJAVA")
            .select(`
              *,
              id_lokacije (
                ime_lokacije,
                ime_drzave,
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
            `)
            .in("id_objava", objavaIds)
            .eq("status_objave", "otvorena");

        if (objavaError) return next(objavaError);

        objave = dohvaceneObjave || [];
      }
    }

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
