import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireRegistered } from "../middleware/requireRegistered.js";

const router = express.Router();

// Kreiranje Supabase klijenta za prijavljenog korisnika
function kreirajSupabase(req) {
  return createClient(
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
}

// GET /discover
router.get("/", requireRegistered, async (req, res, next) => {
  try {
    const korisnickiSupabase = kreirajSupabase(req);
    const idKorisnik = req.korisnik.id_korisnik;

    // 1. Dohvat spremljenih objava trenutnog korisnika
    const { data: spremljeneObjave, error: spremljeneError } =
      await korisnickiSupabase
        .from("SPREMLJENA_OBJAVA")
        .select("id_objava")
        .eq("id_korisnik", idKorisnik);

    if (spremljeneError) return next(spremljeneError);

    const spremljeneObjaveIds = (spremljeneObjave || []).map(
      (objava) => objava.id_objava,
    );

    // 2. Dohvat tagova korisnika
    const { data: korisnikTagovi, error: tagoviError } =
      await korisnickiSupabase
        .from("KORISNIK_TAGOVI")
        .select("id_tag")
        .eq("id_korisnik", idKorisnik);

    if (tagoviError) return next(tagoviError);

    const tagIds = korisnikTagovi.map((t) => t.id_tag);

    let objave = [];

    // 3. Dohvat objava koje imaju barem jedan korisnikov tag
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

      // 4. Dohvat objava i povezanih podataka
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
            .eq("status_objave", "otvorena")
            .neq("id_autor", idKorisnik);

        if (objavaError) return next(objavaError);

        objave = dohvaceneObjave || [];
      }
    }

    // 5. Prikaz Discover stranice
    return res.render("discover", {
      ime: req.korisnik.ime || "",
      email: req.korisnik.email || "",
      prezime: req.korisnik.prezime || "",
      birthday: req.korisnik.datum_rodenja || "",
      spol: req.korisnik.spol || "",
      smjestaji: objave,
      brojac: objave.length,
      spremljeneObjaveIds: spremljeneObjaveIds,
    });
  } catch (error) {
    console.error("Neočekivana greška u Discover ruti:", error);
    next(error);
  }
});

// POST /discover/spremi/:idObjava
// Spremanje objave
router.post(
  "/spremi/:idObjava",
  requireRegistered,
  async (req, res, next) => {
    try {
      const korisnickiSupabase = kreirajSupabase(req);

      const { error } = await korisnickiSupabase
        .from("SPREMLJENA_OBJAVA")
        .insert({
          id_korisnik: req.korisnik.id_korisnik,
          id_objava: req.params.idObjava,
        });

      // Ako je objava već spremljena, ne tretiramo to kao grešku
      if (error && error.code !== "23505") {
        return next(error);
      }

      return res.json({ uspjeh: true });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /discover/spremi/:idObjava
// Uklanjanje spremljene objave
router.delete(
  "/spremi/:idObjava",
  requireRegistered,
  async (req, res, next) => {
    try {
      const korisnickiSupabase = kreirajSupabase(req);

      const { error } = await korisnickiSupabase
        .from("SPREMLJENA_OBJAVA")
        .delete()
        .eq("id_korisnik", req.korisnik.id_korisnik)
        .eq("id_objava", req.params.idObjava);

      if (error) return next(error);

      return res.json({ uspjeh: true });
    } catch (error) {
      next(error);
    }
  },
);

export default router;