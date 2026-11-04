import { requireRegistered } from "../middleware/requireRegistered";

router.get("/profile", requireRegistered, async(req, res, next) => {
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

// router.post("/tagovi", requireRegistered, async (req, res, next) => {
// });
// router.post("/tagovi", requireRegistered, async (req, res, next) => {
// });