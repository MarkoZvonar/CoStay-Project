import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function provjeri({ data, error }) {
  if (error) throw error;
  return data;
}

export function createInboxRouter(createClient) {
  const router = express.Router();
  router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  router.use(requireAuth);
  router.use(async (req, res, next) => {
    const token = req.session.accessToken;
    if (!token) return res.status(401).json({ error: "Ponovno se prijavi za pristup porukama." });
    try {
      const db = createClient(token);
      const { data, error } = await db.auth.getUser(token);
      if (error || !data.user || data.user.id !== req.session.user.id) {
        return res.status(401).json({ error: "Prijava je istekla. Ponovno se prijavi." });
      }
      // Trenutačni model očekuje KORISNIK.id_korisnik = auth.users.id.
      const profil = provjeri(await db.from("KORISNIK").select("id_korisnik")
        .eq("id_korisnik", data.user.id).maybeSingle());
      if (!profil) return res.status(409).json({ error: "Nedostaje profil povezan s tvojim računom. Potrebno je povezati KORISNIK.id_korisnik s ID-jem prijavljenog računa." });
      req.inbox = { db, userId: profil.id_korisnik };
      next();
    } catch (error) { next(error); }
  });

  router.get("/razgovori", async (req, res, next) => {
    try {
      const { db, userId } = req.inbox;
      const clanstva = provjeri(await db.from("SUGOVORNIK").select("id_razgovor")
        .eq("id_sugovornik", userId));
      if (!clanstva.length) return res.json({ razgovori: [] });
      const razgovori = provjeri(await db.from("RAZGOVOR").select(`
        id_razgovor,
        sudionici:SUGOVORNIK(id_sugovornik,korisnik:KORISNIK(ime,prezime)),
        zadnja:PORUKA(id_poruka,poruka,vrijeme_slanja)
      `).in("id_razgovor", clanstva.map((c) => c.id_razgovor))
        .eq("razgovor_tip", "izravan")
        .order("vrijeme_slanja", { referencedTable: "zadnja", ascending: false })
        .order("id_poruka", { referencedTable: "zadnja", ascending: false })
        .limit(1, { referencedTable: "zadnja" }));
      const rezultat = razgovori.map((r) => ({
        id: r.id_razgovor,
        naziv: r.sudionici.filter((s) => s.id_sugovornik !== userId)
          .map((s) => s.korisnik ? `${s.korisnik.ime} ${s.korisnik.prezime}` : "Korisnik").join(", ") || "Razgovor",
        zadnjaPoruka: r.zadnja[0]?.poruka || "",
        vrijeme: r.zadnja[0]?.vrijeme_slanja || null,
      }));
      rezultat.sort((a, b) => (b.vrijeme || "").localeCompare(a.vrijeme || "") || a.id.localeCompare(b.id));
      res.json({ razgovori: rezultat });
    } catch (error) { next(error); }
  });

  router.use("/razgovori/:id/poruke", async (req, res, next) => {
    if (!UUID.test(req.params.id)) return res.status(400).json({ error: "Nevaljan razgovor." });
    try {
      const { db, userId } = req.inbox;
      const clanstvo = provjeri(await db.from("SUGOVORNIK").select("id_razgovor")
        .eq("id_razgovor", req.params.id).eq("id_sugovornik", userId).maybeSingle());
      if (!clanstvo) return res.status(404).json({ error: "Razgovor nije dostupan." });
      const razgovor = provjeri(await db.from("RAZGOVOR").select("id_razgovor")
        .eq("id_razgovor", req.params.id).eq("razgovor_tip", "izravan").maybeSingle());
      if (!razgovor) return res.status(404).json({ error: "Razgovor nije dostupan." });
      next();
    } catch (error) { next(error); }
  });

  router.get("/razgovori/:id/poruke", async (req, res, next) => {
    try {
      const { db, userId } = req.inbox;
      const poruke = provjeri(await db.from("PORUKA")
        .select("id_poruka,id_posiljatelj,poruka,vrijeme_slanja")
        .eq("id_razgovor", req.params.id)
        .order("vrijeme_slanja", { ascending: false }).order("id_poruka", { ascending: false }).limit(100));
      res.json({ poruke: poruke.reverse().map((p) => ({
        id: p.id_poruka, sadrzaj: p.poruka || "", vrijeme: p.vrijeme_slanja,
        moja: p.id_posiljatelj === userId,
      })) });
    } catch (error) { next(error); }
  });

  router.post("/razgovori/:id/poruke", async (req, res, next) => {
    // JSON zahtjev sprječava slanje forme s druge stranice uz korisnikovu sesiju.
    if (!req.is("application/json")) return res.status(415).json({ error: "Očekuje se JSON zahtjev." });
    const tekst = typeof req.body?.sadrzaj === "string" ? req.body.sadrzaj.trim() : "";
    if (!tekst || tekst.length > 2000) return res.status(400).json({ error: "Poruka mora sadržavati između 1 i 2000 znakova." });
    try {
      const { db, userId } = req.inbox;
      provjeri(await db.from("PORUKA").insert({
        id_razgovor: req.params.id, id_posiljatelj: userId, poruka: tekst,
      }));
      res.status(201).json({ success: true });
    } catch (error) { next(error); }
  });

  router.use((error, req, res, next) => {
    // Klijentu ne vraćamo interne detalje baze ili sadržaj poruka.
    console.error("Inbox:", error.code || "nedostupna_usluga");
    const nedostajeStupac = ["42703", "PGRST204"].includes(error.code);
    const rekurzijaPravila = error.code === "42P17";
    res.status(nedostajeStupac || rekurzijaPravila ? 503 : 500).json({
      error: rekurzijaPravila
        ? "Razgovori trenutačno nisu dostupni zbog pogreške u pravilima pristupa. Obrati se administratoru."
        : nedostajeStupac
        ? "Potrebno je primijeniti SQL dopunu za vrijeme slanja poruka."
        : "Poruke trenutačno nisu dostupne. Pokušaj ponovno; ako se problem ponavlja, provjeri prava pristupa bazi.",
    });
  });
  return router;
}
