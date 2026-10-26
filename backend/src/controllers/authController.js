import { supabase } from "../config/supabase.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export const googleLogin = async (req, res, next) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${BASE_URL}/auth/callback`,
      },
    });

    if (error) throw error;
    res.redirect(data.url);
  } catch (error) {
    next(error);
  }
};

export const githubLogin = async (req, res, next) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${BASE_URL}/auth/callback`,
      },
    });

    if (error) throw error;
    res.redirect(data.url);
  } catch (error) {
    next(error);
  }
};

// --- CALLBACK KOJI HVATA HASH TOKEN IZ PREGLEDNIKA ---
export const authCallback = async (req, res, next) => {
  res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h3>Prijava u tijeku, molimo pričekajte...</h3>
        <script>
          // Čitamo hash dio URL-a (npr. #access_token=...)
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get("access_token");

          if (accessToken) {
            // Šaljemo token na backend rutu da se spremi u sesiju
            fetch("/auth/set-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accessToken })
            })
            .then(response => {
              if (response.ok) {
                window.location.href = "/"; // Uspjeh! Vraćamo se na početnu
              } else {
                alert("Greška kod spremanja sesije na poslužitelju.");
              }
            })
            .catch(err => {
              console.error("Greška mreže:", err);
            });
          } else {
            document.body.innerHTML = "<h3>Greška: Pristupni token nije pronađen u URL-u.</h3>";
          }
        </script>
      </body>
    </html>
  `);
};

export const setSession = async (req, res, next) => {
  try {
    const { accessToken } = req.body; // Primamo token koji je poslao frontend

    if (!accessToken) {
      return res.status(400).json({ error: "Nedostaje access token." });
    }

    // 1. Pitamo Supabase: "Je li ovaj token valjan i tko je ovaj korisnik?"
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return res.status(401).json({ error: "Nevaljan ili istekao token." });
    }

    // 2. Obnavljamo sesiju zbog sigurnosti (Session Fixation zaštita)
    req.session.regenerate((sessionError) => {
      if (sessionError) return next(sessionError);
      const isAdmin = user.email === "dora0495@gmail.com"; // Primjer provjere za admina - inače koristiti bazu
      // 3. Upisujemo podatke o korisniku u sesiju
      req.session.user = {
        id: user.id,
        provider: user.app_metadata?.provider,
        email: user.email,
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email,
        picture: user.user_metadata?.avatar_url || "",
        role: isAdmin ? "admin" : "user", // Dodano: uloga korisnika
      };

      // 4. Snimamo sesiju i vraćamo OK odgovor frontendu
      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        res.status(200).json({ success: true });
      });
    });
  } catch (error) {
    next(error);
  }
};
// --- NOVO: registracija putem forme ---
//Iz req.body čita ime, prezime, email, password, datum_rodenja, spol, mjesto_stanovanja.
//Ako nedostaje ime, prezime, email ili lozinka, vraća grešku 400.
//Poziva supabase.auth.signUp({ email, password }). Lozinka ide samo u Supabase Auth, a ne u tablicu KORISNIK.
//Id novog korisnika upisuje u KORISNIK kao primarni ključ, uz ostale podatke. Prazna polja pretvara u null (datum_rodenja || null).
//Ako insert padne, ispisuje grešku u terminal (console.error) i vraća je pregledniku.
//Ako sve prođe, vraća 201 i { success: true }.

export const register = async (req, res, next) => {
  try {
    const {
      ime,
      prezime,
      email,
      password,
      datum_rodenja,
      spol,
      mjesto_stanovanja,
    } = req.body;

    if (!ime || !prezime || !email || !password) {
      return res
        .status(400)
        .json({ error: "Ime, prezime, email i lozinka su obavezni." });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    if (!data.user)
      return res.status(400).json({ error: "Korisnik nije kreiran." });

    const { error: insertError } = await supabase.from("KORISNIK").insert({
      id_korisnik: data.user.id,
      ime,
      prezime,
      datum_rodenja: datum_rodenja || null,
      spol: spol || null,
      mjesto_stanovanja: mjesto_stanovanja || null,
      email,
      profilna_slika_url: null,
    });

    if (insertError) {
      console.error("Insert greška:", insertError);
      return res.status(400).json({ error: insertError.message });
    }

    res.status(201).json({ success: true, id: data.user.id });
  } catch (error) {
    next(error);
  }
};