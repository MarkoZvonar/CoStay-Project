import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// Nova ruta za kreiranje objave prilagođena vašoj shemi baze i postojećim lokacijama
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

    // Osnovna validacija obaveznih polja
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

    // 3. Provjera postoji li odabrana lokacija u tablici LOKACIJA (isključivo Zagreb, Pula, Split, Opatija)
    let { data: existingLokacija, error: lokacijaQueryError } = await supabase
      .from("LOKACIJA")
      .select("id_lokacije")
      .eq("ime_lokacije", lokacija.trim())
      .single();

    if (lokacijaQueryError || !existingLokacija) {
      return res.status(400).json({
        error:
          "Odabrana lokacija ne postoji u bazi. Molimo odaberite jedan od ponuđenih gradova.",
      });
    }

    const lokacijaId = existingLokacija.id_lokacije;

    // 4. Unos objave u tablicu OBJAVA
    const kapacitet = Number(brojOsoba);
    const { data: postData, error: postError } = await supabase
      .from("OBJAVA")
      .insert([
        {
          id_autor: autorId,
          id_lokacije: lokacijaId,
          check_in: datumDolaska,
          check_out: datumOdlaska,
          ukupna_cijena: Number(ukupnaCijena),
          ukupni_kapacitet: kapacitet,
          preostalih_mjesta: kapacitet, // Na početku su sva mjesta slobodna
          opis: opis.trim(),
          booking_url: vanjskiOglas ? vanjskiOglas.trim() : null,
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
          .from("OBJAVA_SLIKA")
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
          .from("TAG")
          .select("id_tag")
          .eq("ime_tag", imeTag)
          .single();

        let tagId;
        if (!existingTag) {
          const { data: newTag, error: tagErr } = await supabase
            .from("TAG")
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
            .from("OBJAVA_TAG")
            .insert([{ id_tag: tagId, id_objava: objavaId }]);
        }
      }
    }

    //redirecta nas na profile page
    return res.redirect(303, "/profile");
  } catch (err) {
    console.error("Greška kod kreiranja objave:", err.message);
    return res.status(500).json({
      error: "Došlo je do pogreške na poslužitelju prilikom spremanja objave.",
    });
  }
});

export default router;
