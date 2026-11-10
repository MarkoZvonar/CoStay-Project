import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// GET /discover/guest
// Početno učitavanje prvih 10 otvorenih objava za gosta
router.get("/", async (req, res, next) => {
  try {
    const supabase = createClient(
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

    const { data: objave, error, count } = await supabase
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
        ),
        OBJAVA_SLIKA (
          id_slika,
          url_slika
        )
      `, { count: "exact" })
      .eq("status_objave", "otvorena")
      .order("id_objava", { ascending: false })
      .range(0, 9);

    if (error) {
      console.error("Greška kod dohvata objava za guesta:", error);
      return next(error);
    }

    return res.render("discover", {
      ime: "",
      email: "",
      prezime: "",
      birthday: "",
      spol: "",
      smjestaji: objave || [],
      brojac: count || 0,
      spremljeneObjaveIds: [],
      mojiZahtjevi: [],
      jeGost: true,
    });

  } catch (error) {
    console.error("Greška u Discover Guest ruti:", error);
    next(error);
  }
});


// GET /discover/guest/ostale-objave
// Dohvat sljedećih 10 otvorenih objava za gosta
router.get("/ostale-objave", async (req, res, next) => {
  try {
    const supabase = createClient(
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

    // 1. Određujemo od koje objave nastavljamo i koliko dohvaćamo
    const offset = Math.max(
      0,
      Number.parseInt(req.query.offset, 10) || 0
    );

    const limit = 10;

    // 2. Dohvaćamo sljedeću grupu otvorenih objava
    const { data: objave, error } = await supabase
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
        ),
        OBJAVA_SLIKA (
          id_slika,
          url_slika
        )
      `)
      .eq("status_objave", "otvorena")
      .order("id_objava", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Greška kod dohvata ostalih objava za guesta:", error);
      return next(error);
    }

    // 3. Pretvaramo svaku objavu u HTML pomoću postojeće EJS komponente
    const htmlKartice = [];

    for (const smjestaj of (objave || [])) {
      const html = await new Promise((resolve, reject) => {
        res.render(
          "../components/objavaKartica",
          {
            smjestaj,
            spremljeneObjaveIds: [],
            mojiZahtjevi: [],
            jeGost: true
          },
          (error, html) => {
            if (error) {
              reject(error);
            } else {
              resolve(html);
            }
          }
        );
      });

      htmlKartice.push(html);
    }

    // 4. Vraćamo HTML i informacije o sljedećem učitavanju
    return res.json({
      html: htmlKartice.join(""),
      imaJos: (objave || []).length === limit,
      sljedeciOffset: offset + (objave || []).length
    });

  } catch (error) {
    console.error("Greška kod učitavanja objava za guesta:", error);
    next(error);
  }
});

export default router;