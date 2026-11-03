import { supabase } from "../config/supabase.js";
import { createClient } from "@supabase/supabase-js";

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
          const refreshToken = params.get("refresh_token");

          // Nakon čitanja uklanjamo tokene iz adresne trake.
          window.history.replaceState(null, "", window.location.pathname);
          if (accessToken && refreshToken) {
            // Šaljemo token na backend rutu da se spremi u sesiju
            fetch("/auth/set-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ accessToken, refreshToken })
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
    const { accessToken, refreshToken } = req.body;

    if (
      typeof accessToken !== "string" ||
      !accessToken ||
      typeof refreshToken !== "string" ||
      !refreshToken
    ) {
      return res.status(400).json({
        error: "Nedostaju tokeni potrebni za prijavu.",
      });
    }
    // 1. Pitamo Supabase: "Je li ovaj token valjan i tko je ovaj korisnik?"
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return res.status(401).json({ error: "Nevaljan ili istekao token." });
    }
    // Zaseban klijent: korisničku sesiju ne stavljamo
    // na zajednički globalni Supabase klijent.
    const authClient = createClient(
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

    // Provjeravamo refresh token i dobivamo novi par tokena.
    const { data: refreshed, error: refreshError } =
      await authClient.auth.refreshSession({
        refresh_token: refreshToken,
      });

    if (refreshError) {
      const status =
        !refreshError.status ||
        refreshError.status >= 500 ||
        refreshError.status === 429
          ? 503
          : 401;

      return res.status(status).json({
        error: "Provjera sesije nije uspjela. Pokušaj ponovno.",
      });
    }

    // Oba tokena moraju pripadati istom korisniku.
    if (
      !refreshed.session ||
      !refreshed.user ||
      refreshed.user.id !== user.id
    ) {
      return res.status(401).json({
        error: "Tokeni ne pripadaju istom korisniku.",
      });
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
      // Token je ranije u ovoj funkciji provjeren pozivom getUser.
      // Čuvamo ga na backendu radi korisničkih zahtjeva prema Supabaseu.
      req.session.accessToken = refreshed.session.access_token;
      req.session.refreshToken = refreshed.session.refresh_token;
      req.session.accessTokenExpiresAt = refreshed.session.expires_at;
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
export const emailLogin = async (req, res, next) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";

  // Lozinku ne trimamo jer razmaci mogu biti njezin dio.
  const password = req.body.password;

  if (
    !email ||
    email.length > 320 ||
    typeof password !== "string" ||
    !password ||
    password.length > 128
  ) {
    return res.status(400).send("Unesi email i lozinku.");
  }

  try {
    // Zaseban klijent za ovaj pokušaj prijave.
    const authClient = createClient(
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

    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (!error.status || error.status >= 500) {
        return res
          .status(503)
          .send("Prijava trenutačno nije dostupna. Pokušaj ponovno.");
      }

      return res
        .status(401)
        .send(
          "Prijava nije uspjela. Provjeri email, lozinku i je li email adresa potvrđena.",
        );
    }

    if (!data.user || !data.session) {
      return res.status(401).send("Prijava nije dovršena.");
    }

    req.session.regenerate((sessionError) => {
      if (sessionError) return next(sessionError);

      // Spremamo potvrđeni identitet, ne lozinku.
      req.session.user = {
        id: data.user.id,
        email: data.user.email,
        provider: "email",
        name: data.user.user_metadata?.full_name || "",
        picture: data.user.user_metadata?.avatar_url || "",
      };

      req.session.accessToken = data.session.access_token;
      // Potreban za dobivanje novog access tokena nakon isteka.
      req.session.refreshToken = data.session.refresh_token;

      // Vrijeme isteka access tokena, u sekundama od Unix epohe.
      req.session.accessTokenExpiresAt = data.session.expires_at;
      req.session.save((saveError) => {
        if (saveError) return next(saveError);

        // Naša početna ruta provjerava postoji li CoStay profil.
        return res.redirect("/");
      });
    });
  } catch (error) {
    next(error);
  }
};
