import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// Postojeća ruta za provjeru korisnika
router.get("/current-user", (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json({
      loggedIn: true,
      user: req.session.user,
    });
  } else {
    res.status(200).json({
      loggedIn: false,
      user: { role: "guest" },
    });
  }
});

// Nova ruta za kreiranje objave prema vašoj shemi baze
router.post("/posts", async (req, res, next) => {
  try {
    // 1. Provjera je li korisnik prijavljen
    if (!req.session || !req.session.user) {
      return res
        .status(401)
        .json({ error: "Morate biti prijavljeni da biste kreirali objavu." });
    }

    const autorId = req.session.user.id;

    // 2. Izvlačenje podataka poslanih s forme
    const {
      lokacija,
      datumDolaska,
      datumOdlaska,
      ukupnaCijena,
      brojOsoba,
      krajnjiRok,
      slikeSmjestaja,
      vanjskiOglas,
      tagovi,
      opis,
    } = req.body;

    // Osnovna validacija
    if (
      !lokacija ||
      !datumDolaska ||
      !datumOdlaska ||
      !ukupnaCijena ||
      !brojOsoba ||
      !krajnjiRok ||
      !opis
    ) {
      return res
        .status(400)
        .json({ error: "Molimo ispunite sva obavezna polja." });
    }

    // 3. Provjera ili unos lokacije u tablicu LOKACIJA
    let { data: existingLokacija } = await supabase
      .from("lokacija")
      .select("id_lokacije")
      .eq("ime_lokacije", lokacija.trim())
      .single();

    let lokacijaId;

    if (!existingLokacija) {
      const { data: newLokacija, error: lokacijaError } = await supabase
        .from("lokacija")
        .insert([{ ime_lokacije: lokacija.trim() }])
        .select("id_lokacije")
        .single();

      if (lokacijaError) throw lokacijaError;
      lokacijaId = newLokacija.id_lokacije;
    } else {
      lokacijaId = existingLokacija.id_lokacije;
    }

    // 4. Unos objave u tablicu OBJAVA
    const kapacitet = Number(brojOsoba);
    const { data: postData, error: postError } = await supabase
      .from("objava")
      .insert([
        {
          id_autor: autorId,
          id_lokacije: lokacijaId,
          check_in: datumDolaska,
          check_out: datumOdlaska,
          ukupna_cijena: Number(ukupnaCijena),
          ukupni_kapacitet: kapacitet,
          preostalih_mjesta: kapacitet, // Na početku su sva mjesta slobodna
          opis: opis,
          booking_url: vanjskiOglas || null,
          rok_prijave: krajnjiRok,
          status_objave: "otvorena",
        },
      ])
      .select("id_objava")
      .single();

    if (postError) throw postError;
    const objavaId = postData.id_objava;

    // 5. Unos slika u tablicu OBJAVA_SLIKA (ako postoje)
    if (slikeSmjestaja) {
      const slikeList = slikeSmjestaja
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      for (const slikaUrl of slikeList) {
        await supabase
          .from("objava_slika")
          .insert([{ id_objava: objavaId, url_slika: slikaUrl }]);
      }
    }

    // 6. Unos tagova u tablice TAG i OBJAVA_TAG (ako postoje)
    if (tagovi) {
      const tagoviList = tagovi
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      for (const imeTag of tagoviList) {
        let { data: existingTag } = await supabase
          .from("tag")
          .select("id_tag")
          .eq("ime_tag", imeTag)
          .single();

        let tagId;
        if (!existingTag) {
          const { data: newTag, error: tagErr } = await supabase
            .from("tag")
            .insert([{ ime_tag: imeTag }])
            .select("id_tag")
            .single();
          if (!tagErr && newTag) {
            tagId = newTag.id_tag;
          }
        } else {
          tagId = existingTag.id_tag;
        }

        if (tagId) {
          await supabase
            .from("objava_tag")
            .insert([{ id_tag: tagId, id_objava: objavaId }]);
        }
      }
    }

    // 7. Uspješan povratak frontendu
    return res
      .status(201)
      .json({ success: true, message: "Objava uspješno kreirana!" });
  } catch (err) {
    console.error("Greška kod kreiranja objave:", err.message);
    return res
      .status(500)
      .json({
        error:
          "Došlo je do pogreške na poslužitelju prilikom spremanja objave.",
      });
  }
});

export default router;
