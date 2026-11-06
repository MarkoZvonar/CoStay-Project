
import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// GET /discover/guest
router.get("/", async (req, res, next) => {
  try {
    // 1. Kreiranje Supabase klijenta za gosta
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

    // 2. Dohvat svih otvorenih objava
    const { data: objave, error } = await supabase
      .from("OBJAVA")
      .select(`
        *,
        id_lokacije (ime_lokacije, ime_drzave, latitude, longitude),
        id_autor (ime, prezime),
        OBJAVA_TAG (TAG (ime_tag))
      `)
      .eq("status_objave", "otvorena");

    if (error) {
      console.error("Greška kod dohvata objava za guesta:", error);
      return next(error);
    }

    // 3. Prikaz postojeće Discover stranice
    return res.render("discover", {
      ime: "",
      email: "",
      prezime: "",
      birthday: "",
      spol: "",
      smjestaji: objave || [],
      brojac: objave ? objave.length : 0,
      spremljeneObjaveIds: [],
      jeGost: true,
    });

  } catch (error) {
    console.error("Greška u Discover Guest ruti:", error);
    next(error);
  }
});

export default router;
