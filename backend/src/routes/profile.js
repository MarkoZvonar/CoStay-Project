import { supabase } from "../config/supabase.js";
import { createClient } from "@supabase/supabase-js";
import { requireRegistered } from "../middleware/requireRegistered.js";
import express from "express";

const router = express.Router();

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

router.get("/", requireRegistered, async(req, res, next) => {
  const accessToken = req.session.accessToken;

  if(!accessToken) {
    return res
      .status(401)
      .send('Please log in again. <a href="/logout">Log out</a>');
  }

  try {
    const korisnickiSupabase = kreirajSupabase(req);

    //dohvacamo podatke o korisniku iz baze
    const { data: korisnik, error } = await korisnickiSupabase
      .from("KORISNIK")
      .select("ime,prezime,mjesto_stanovanja,profilna_slika_url,opis")
      .eq("id_korisnik", req.korisnik.id_korisnik)
      .maybeSingle();

    if (error) return next(error);

    if(!korisnik) {
      return res.status(404).send("Profile not found.");
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

    //dohvacanje vlastitih objava
    const {data: mojeObjave, error: mojeObjaveError} = await korisnickiSupabase
        .from("OBJAVA")
        .select(`*,id_lokacije (ime_lokacije,ime_drzave),id_autor (ime,prezime),
            OBJAVA_SLIKA (id_slika,url_slika),
            OBJAVA_TAG (TAG (ime_tag))`)
        .eq("id_autor", req.korisnik.id_korisnik);

    if(mojeObjaveError) return next(mojeObjaveError);

    //dohvat id-eva korisnikovih spremljenih objava
    const {data:spremljeniZapisi, error: spremljeniError} = await korisnickiSupabase
        .from("SPREMLJENA_OBJAVA")
        .select("id_objava")
        .eq("id_korisnik", req.korisnik.id_korisnik);

    if (spremljeniError) return next(spremljeniError);

    const spremljeniIds = (spremljeniZapisi || []).map((zapis) => zapis.id_objava);

    //dohvat podataka spremljenih objava
    let spremljeneObjave = [];
    if(spremljeniIds.length > 0) {
        const {data, error: spremljeneObjaveError} = await korisnickiSupabase
            .from("OBJAVA")
            .select(`*,id_lokacije (ime_lokacije,ime_drzave),id_autor (ime,prezime),
                OBJAVA_SLIKA (id_slika,url_slika),
                OBJAVA_TAG (TAG (ime_tag))`)
            .in("id_objava", spremljeniIds);

        if(spremljeneObjaveError) return next(spremljeneObjaveError);
        spremljeneObjave = data || [];
    }

    return res.render("profile", {
      ime: korisnik.ime || "",
      prezime: korisnik.prezime || "",
      mjestoStanovanja: korisnik.mjesto_stanovanja || "",
      profilnaSlikaUrl: korisnik.profilna_slika_url || "",
      opis: korisnik.opis || "",
      tagovi: tagovi,
      mojeObjave: mojeObjave || [],
      spremljeneObjave: spremljeneObjave
    });
  } catch (error) {
    next(error);
  }
});

//ruta koja vraca popis svih tagova u JSON obliku
router.get("/tags", requireRegistered, async(req, res, next) => {
    try {
        const korisnickiSupabase = kreirajSupabase(req);

        //upit bazi podataka
        const {data: tagovi, error} = await korisnickiSupabase
            .from("TAG")
            .select("id_tag, ime_tag");

        if (error) {
            return res.status(500).json({
                error: "Failed to load available tags."
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
            error: "Choose from available tags."
        });
    }

    try {
        const korisnickiSupabase = kreirajSupabase(req);

        //provjera postoji li odabrani tag u bazi
        const {data: tag, error: tagError} = await korisnickiSupabase
            .from("TAG")
            .select("id_tag, ime_tag")
            .eq("id_tag", tagId)
            .maybeSingle();

        if (tagError) return next(tagError);
        if (!tag) {
            return res.status(404).json({
                error: "The selected tag is not available."
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
        const korisnickiSupabase = kreirajSupabase(req);

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

router.get("/edit", requireRegistered, async(req, res, next) => {
    try {
        const korisnickiSupabase = kreirajSupabase(req);

        const {data: korisnik, error} = await korisnickiSupabase
            .from("KORISNIK")
            .select("ime, prezime, mjesto_stanovanja, profilna_slika_url,opis")
            .eq("id_korisnik", req.korisnik.id_korisnik)
            .maybeSingle();

        if(error) return next(error);

        if(!korisnik) {
            return res.status(404).send("Profile not found.");
        }

        return res.render("edit-profile", {
            ime: korisnik.ime || "",
            prezime: korisnik.prezime || "",
            mjestoStanovanja: korisnik.mjesto_stanovanja || "",
            profilnaSlikaUrl: korisnik.profilna_slika_url || "",
            opis: korisnik.opis || "",
        });
    } catch(error) {
        next(error);
    }
})

//pomocna fja za post /edit
function tekst(vrijednost) {
    if (typeof vrijednost === "string") {
        return vrijednost.trim();
    }
    return "";
}

router.post("/edit", requireRegistered,
    async (req, res, next) => {
        try {
            const ime = tekst(req.body.profilIme);
            const prezime = tekst(req.body.profilPrezime);
            const mjestoStanovanja = tekst(req.body.profilLokacija);
            const opis = tekst(req.body.profilOpis);

            if (!ime || !prezime || !mjestoStanovanja) {
                return res.status(400).send("First name, last name and location are required.");
            }

            const korisnickiSupabase = kreirajSupabase(req);

            //azuriramo profil prijavljenog korisnika
            const {data, error} = await korisnickiSupabase
                .from("KORISNIK")
                .update({
                    ime: ime,
                    prezime: prezime,
                    mjesto_stanovanja: mjestoStanovanja,
                    opis: opis
                })
                .eq("id_korisnik", req.korisnik.id_korisnik)
                .select("id_korisnik")
                .maybeSingle();

                if (error) return next(error);
                if(!data) {
                    return res.status(403).send("Your profile could not be updated.");
                }

                //azuriramo podatke koje druge stranice citaju iz sesije
                req.session.ime = ime;
                req.session.prezime = prezime;
                req.session.mjesto_stanovanja = mjestoStanovanja;
                req.session.opis = opis;

                return req.session.save((saveError) => {
                    if(saveError) return next(saveError);
                    return res.redirect(303, "/profile");
                });
        } catch (error) {
            next(error);
        }
});

router.get("/edit/:idObjava", requireRegistered, async(req, res, next) => {

});

export default router;