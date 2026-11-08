import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireRegistered } from "../middleware/requireRegistered.js";

const router = express.Router();

// Ruta za kreiranje objave zaštićena s requireRegistered middlewareom
router.post("/posts", requireRegistered, async (req, res, next) => {
  try {
    // 1. Budući da requireRegistered već provjerava sesiju, token i identitet,
    // ID prijavljenog korisnika sigurno imamo u req.session.user.id,
    // a token nam je dostupan u req.session.accessToken.
    const autorId = req.session.user.id;
    const accessToken = req.session.accessToken;

    // Stvaranje korisničkog klijenta sa specifičnim tokenom (kako bi RLS politike u bazi propustile upis)
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

    // 3. Provjera postoji li odabrana lokacija u tablici LOKACIJA
    // (Dopušteni gradovi: Zagreb, Pula, Split, Opatija - s prvim velikim slovom)
    const dozvoljeniGradovi = ["Zagreb", "Pula", "Split", "Opatija"];
    const cistaLokacija = typeof lokacija === "string" ? lokacija.trim() : "";

    if (!dozvoljeniGradovi.includes(cistaLokacija)) {
      return res.status(400).json({
        error:
          "Odabrani grad ne postoji u bazi. Molimo odaberite jedan od ponuđenih gradova (Zagreb, Pula, Split, Opatija).",
      });
    }

    let { data: existingLokacija, error: lokacijaQueryError } =
      await korisnickiSupabase
        .from("LOKACIJA")
        .select("id_lokacije")
        .eq("ime_lokacije", cistaLokacija)
        .single();

    if (lokacijaQueryError || !existingLokacija) {
      return res.status(400).json({
        error: "Lokacija nije pronađena u bazi podataka.",
      });
    }

    const lokacijaId = existingLokacija.id_lokacije;

    // 4. Unos objave u tablicu OBJAVA
    const kapacitet = Number(brojOsoba);
    const { data: postData, error: postError } = await korisnickiSupabase
      .from("OBJAVA")
      .insert([
        {
          id_autor: autorId,
          id_lokacije: lokacijaId,
          check_in: datumDolaska,
          check_out: datumOdlaska,
          ukupna_cijena: Number(ukupnaCijena),
          ukupni_kapacitet: kapacitet,
          preostalih_mjesta: kapacitet,
          opis: opis.trim(),
          booking_url: vanjskiOglas ? vanjskiOglas.trim() : null,
          rok_prijave: krajnjiRok,
          status_objave: "otvorena",
        },
      ])
      .select("id_objava")
      .single();

    if (postError) {
      console.error("Greška pri unosu objave u bazu:", postError.message);
      if (postError.code === "42501") {
        return res.status(403).json({
          error: "Baza nije dopustila spremanje objave zbog RLS pravila.",
        });
      }
      throw postError;
    }

    const objavaId = postData.id_objava;

    // 5. Unos slika u tablicu OBJAVA_SLIKA (ako postoje)
    if (slikeSmjestaja) {
      const slikeList =
        typeof slikeSmjestaja === "string"
          ? slikeSmjestaja
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : slikeSmjestaja;

      for (const slikaUrl of slikeList) {
        await korisnickiSupabase
          .from("OBJAVA_SLIKA")
          .insert([{ id_objava: objavaId, url_slika: slikaUrl }]);
      }
    }

    // 6. Unos tagova u tablice TAG i OBJAVA_TAG (ako postoje)
    if (tagovi) {
      const tagoviList =
        typeof tagovi === "string"
          ? tagovi
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : tagovi;

      for (const imeTag of tagoviList) {
        let { data: existingTag } = await korisnickiSupabase
          .from("TAG")
          .select("id_tag")
          .eq("ime_tag", imeTag)
          .single();

        let tagId;
        if (!existingTag) {
          const { data: newTag, error: tagErr } = await korisnickiSupabase
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
          await korisnickiSupabase
            .from("OBJAVA_TAG")
            .insert([{ id_tag: tagId, id_objava: objavaId }]);
        }
      }
    }

    // 7. Uspješan povratak frontendu
    return res.redirect(303, "/profile");
  } catch (err) {
    console.error("Greška kod kreiranja objave:", err.message);
    return res.status(500).json({
      error: "Došlo je do pogreške na poslužitelju prilikom spremanja objave.",
    });
  }
});

export default router;
