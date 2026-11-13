import express from "express";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";
import { requireRegistered } from "../middleware/requireRegistered.js";

const router = express.Router();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const supabaseSkripta = fileURLToPath(
  new URL("./umd/supabase.js", import.meta.resolve("@supabase/supabase-js")),
);

function javniSupabaseKljuc(kljuc = "") {
  if (kljuc.startsWith("sb_publishable_")) return kljuc;

  try {
    const payload = JSON.parse(Buffer.from(kljuc.split(".")[1], "base64url"));
    return payload.role === "anon" ? kljuc : "";
  } catch {
    return "";
  }
}

router.get("/supabase.js", (req, res) => {
  return res.sendFile(supabaseSkripta);
});

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.get("/", requireRegistered, (req, res) => {
  return res.render("inbox", {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: javniSupabaseKljuc(process.env.SUPABASE_ANON_KEY),
  });
});

// refreshSession u app.js prije ove rute osigurava važeći pristupni token.
router.get("/realtime-session", requireRegistered, (req, res) => {
  return res.json({ accessToken: req.session.accessToken });
});

// GET /inbox/razgovori
router.get("/razgovori", requireRegistered, async (req, res, next) => {
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
    const korisnikId = req.korisnik.id_korisnik;

    const { data: clanstva, error: greskaClanstava } = await korisnickiSupabase
      .from("SUGOVORNIK")
      .select("id_razgovor")
      .eq("id_sugovornik", korisnikId);

    if (greskaClanstava) return next(greskaClanstava);
    if (!clanstva.length) return res.json({ razgovori: [] });

    const razgovorIds = clanstva.map((clanstvo) => clanstvo.id_razgovor);
    const { data: razgovori, error: greskaRazgovora } = await korisnickiSupabase
      .from("RAZGOVOR")
      .select(`
        id_razgovor,
        razgovor_tip,
        sudionici:SUGOVORNIK(id_sugovornik,korisnik:KORISNIK(ime,prezime)),
        zadnja:PORUKA(id_poruka,poruka,vrijeme_slanja)
      `)
      .in("id_razgovor", razgovorIds)
      .order("vrijeme_slanja", { referencedTable: "zadnja", ascending: false })
      .order("id_poruka", { referencedTable: "zadnja", ascending: false })
      .limit(1, { referencedTable: "zadnja" });

    if (greskaRazgovora) return next(greskaRazgovora);

    const rezultat = razgovori.map((razgovor) => {
      const sugovornici = razgovor.sudionici.filter(
        (sudionik) => sudionik.id_sugovornik !== korisnikId,
      );
      const naziv = sugovornici.map((sudionik) => {
        if (!sudionik.korisnik) return "Korisnik";
        return `${sudionik.korisnik.ime} ${sudionik.korisnik.prezime}`;
      }).join(", ");
      const grupni = Boolean(razgovor.razgovor_tip && razgovor.razgovor_tip !== "izravan");
      const sudionici = razgovor.sudionici.map((sudionik) => ({
        id: sudionik.id_sugovornik,
        ime: sudionik.korisnik
          ? `${sudionik.korisnik.ime} ${sudionik.korisnik.prezime}`
          : "Korisnik",
      }));
      const zadnjaPoruka = razgovor.zadnja[0];

      return {
        id: razgovor.id_razgovor,
        naziv: grupni ? `Grupa · ${naziv || "Razgovor"}` : naziv || "Razgovor",
        grupni,
        sudionici,
        zadnjaPoruka: zadnjaPoruka?.poruka || "",
        vrijeme: zadnjaPoruka?.vrijeme_slanja || null,
      };
    });

    rezultat.sort((prvi, drugi) => {
      const poVremenu = (drugi.vrijeme || "").localeCompare(prvi.vrijeme || "");
      return poVremenu || prvi.id.localeCompare(drugi.id);
    });
    return res.json({ razgovori: rezultat });
  } catch (error) {
    next(error);
  }
});

// GET /inbox/razgovori/:id/poruke
router.get("/razgovori/:id/poruke", requireRegistered, async (req, res, next) => {
  if (!UUID.test(req.params.id)) {
    return res.status(400).json({ error: "Nevaljan razgovor." });
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
    const korisnikId = req.korisnik.id_korisnik;

    const { data: clanstvo, error: greskaClanstva } = await korisnickiSupabase
      .from("SUGOVORNIK")
      .select("id_razgovor")
      .eq("id_razgovor", req.params.id)
      .eq("id_sugovornik", korisnikId)
      .maybeSingle();

    if (greskaClanstva) return next(greskaClanstva);
    if (!clanstvo) {
      return res.status(404).json({ error: "Razgovor nije dostupan." });
    }

    const { data: razgovor, error: greskaRazgovora } = await korisnickiSupabase
      .from("RAZGOVOR")
      .select("id_razgovor,razgovor_tip")
      .eq("id_razgovor", req.params.id)
      .maybeSingle();

    if (greskaRazgovora) return next(greskaRazgovora);
    if (!razgovor) {
      return res.status(404).json({ error: "Razgovor nije dostupan." });
    }

    const { data: poruke, error } = await korisnickiSupabase
      .from("PORUKA")
      .select("id_poruka,id_posiljatelj,poruka,vrijeme_slanja,posiljatelj:KORISNIK(ime,prezime)")
      .eq("id_razgovor", req.params.id)
      .order("vrijeme_slanja", { ascending: false })
      .order("id_poruka", { ascending: false })
      .limit(100);

    if (error) return next(error);

    const rezultat = poruke.reverse().map((poruka) => ({
      id: poruka.id_poruka,
      sadrzaj: poruka.poruka || "",
      vrijeme: poruka.vrijeme_slanja,
      moja: poruka.id_posiljatelj === korisnikId,
      posiljatelj: poruka.posiljatelj
        ? `${poruka.posiljatelj.ime} ${poruka.posiljatelj.prezime}`
        : "Korisnik",
    }));
    const grupni = Boolean(razgovor.razgovor_tip && razgovor.razgovor_tip !== "izravan");
    return res.json({ poruke: rezultat, grupni });
  } catch (error) {
    next(error);
  }
});

// POST /inbox/razgovori/:id/poruke
router.post("/razgovori/:id/poruke", requireRegistered, async (req, res, next) => {
  if (!UUID.test(req.params.id)) {
    return res.status(400).json({ error: "Nevaljan razgovor." });
  }
  if (!req.is("application/json")) {
    return res.status(415).json({ error: "Očekuje se JSON zahtjev." });
  }

  const tekst = typeof req.body?.sadrzaj === "string" ? req.body.sadrzaj.trim() : "";
  if (!tekst || tekst.length > 2000) {
    return res.status(400).json({
      error: "Poruka mora sadržavati između 1 i 2000 znakova.",
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
    const korisnikId = req.korisnik.id_korisnik;

    const { data: clanstvo, error: greskaClanstva } = await korisnickiSupabase
      .from("SUGOVORNIK")
      .select("id_razgovor")
      .eq("id_razgovor", req.params.id)
      .eq("id_sugovornik", korisnikId)
      .maybeSingle();

    if (greskaClanstva) return next(greskaClanstva);
    if (!clanstvo) {
      return res.status(404).json({ error: "Razgovor nije dostupan." });
    }

    const { data: razgovor, error: greskaRazgovora } = await korisnickiSupabase
      .from("RAZGOVOR")
      .select("id_razgovor,razgovor_tip")
      .eq("id_razgovor", req.params.id)
      .maybeSingle();

    if (greskaRazgovora) return next(greskaRazgovora);
    if (!razgovor) {
      return res.status(404).json({ error: "Razgovor nije dostupan." });
    }

    const { error } = await korisnickiSupabase.from("PORUKA").insert({
      id_razgovor: req.params.id,
      id_posiljatelj: korisnikId,
      poruka: tekst,
    });

    if (error) return next(error);
    return res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Zajednička obrada grešaka samo za inbox.
router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error("Inbox:", error.code || "nedostupna_usluga");

  if (error.code === "42P17") {
    return res.status(503).json({
      error: "Razgovori trenutačno nisu dostupni zbog pogreške u pravilima pristupa. Obrati se administratoru.",
    });
  }
  if (["42703", "PGRST204"].includes(error.code)) {
    return res.status(503).json({
      error: "Potrebno je primijeniti SQL dopunu za vrijeme slanja poruka.",
    });
  }
  return res.status(500).json({
    error: "Poruke trenutačno nisu dostupne. Pokušaj ponovno; ako se problem ponavlja, provjeri prava pristupa bazi.",
  });
});

export default router;
