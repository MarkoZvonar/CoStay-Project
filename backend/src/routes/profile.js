import { supabase } from "../config/supabase.js";
import { createClient } from "@supabase/supabase-js";
import { requireRegistered } from "../middleware/requireRegistered.js";
import express from "express";

const router = express.Router();

router.get("/", requireRegistered, async(req, res, next) => {
  const accessToken = req.session.accessToken;

  if(!accessToken) {
    return res
      .status(401)
      .send('Potrebna je nova prijava. <a href="/logout">Odjavi se</a>');
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

    //dohvacamo podatke o korisniku iz baze
    const { data: korisnik, error } = await korisnickiSupabase
      .from("KORISNIK")
      .select("ime,prezime,mjesto_stanovanja,profilna_slika_url,opis")
      .eq("id_korisnik", req.korisnik.id_korisnik)
      .maybeSingle();

    if (error) return next(error);

    if(!korisnik) {
      return res.status(404).send("Profil nije pronađen.");
    }

    //dohvacamo podatke o korisnikovim tagovima
    const { data: korisnickiTagovi, error: tagoviError } = await korisnickiSupabase
      .from("KORISNIK_TAGOVI")
      //preko id_tag dohvacamo i ime tag-a iz relacije TAG 
      .select("id_tag, TAG!inner(ime_tag)")
      .eq("id_korisnik", req.korisnik.id_korisnik);

    if (tagoviError) return next(tagoviError);

    //spremimo ih u polje objekata oblika {id_tag, ime_tag} radi jednostavnijeg pristupa
    const tagovi = korisnickiTagovi.map((zapis) => ({
      id_tag: zapis.id_tag,
      ime_tag:zapis.TAG.ime_tag
    }));

    return res.render("profile", {
      ime: korisnik.ime || "",
      prezime: korisnik.prezime || "",
      mjestoStanovanja: korisnik.mjesto_stanovanja || "",
      profilnaSlikaUrl: korisnik.profilna_slika_url || "",
      opis: korisnik.opis || "",
      tagovi: tagovi
    });
  } catch (error) {
    next(error);
  }
});

//ruta koja vraca popis svih tagova u JSON obliku
router.get("/tags", requireRegistered, async(req, res, next) => {
    try {
        const korisnickiSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                },
                global: {
                    headers: {
                        Authorization: `Bearer ${req.session.accessToken}`
                    }
                }
            }
        );

        //upit bazi podataka
        const {data: tagovi, error} = await korisnickiSupabase
            .from("TAG")
            .select("id_tag, ime_tag");

        if (error) {
            return res.status(500).json({
                error: "Dohvat ponuđenih tagova nije uspio."
            });
        }
        return res.json({tagovi});
    } catch(error) {
        next(error);
    }
});

//ruta koja sprema dodani tag u bazu podataka
router.post("/tags", requireRegistered, async (req, res, next) => {
    const tagId = req.body.id_tag;

    if(typeof tagId !== "string" || tagId.trim() === "") {
        return res.status(400).json({
            error: "Odaberi jedan od ponuđenih tagova."
        });
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
                    Authorization: `Bearer ${req.session.accessToken}`,
                    },
                },
            },
        );

        //provjera postoji li odabrani tag u bazi
        const {data: tag, error: tagError} = await korisnickiSupabase
            .from("TAG")
            .select("id_tag, ime_tag")
            .eq("id_tag", tagId)
            .maybeSingle();

        if (tagError) return next(tagError);
        if (!tag) {
            return res.status(404).json({
                error: "Odabrani tag ne postoji."
            });
        }

        //korisnika uzimamo iz middlewarea a ne iz podataka forme
        const {error} = await korisnickiSupabase
            .from("KORISNIK_TAGOVI")
            .insert({
                id_korisnik: req.korisnik.id_korisnik,
                id_tag: tag.id_tag
            });

        if(error) return next(error);

        return res.status(201).json({tag});
    } catch(error) {
        next(error);
    }
});

//ruta koja brise tag s profila
router.delete("/tags/:id", requireRegistered, async(req, res, next) => {
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
                    Authorization: `Bearer ${req.session.accessToken}`,
                    },
                },
            },
        );

        const {error} = await korisnickiSupabase
            .from("KORISNIK_TAGOVI")
            .delete()
            .eq("id_korisnik", req.korisnik.id_korisnik)
            .eq("id_tag", req.params.id);

        if (error) return next(error);
        return res.status(204).end();
    } catch(error) {
        next(error);
    }
});

export default router;