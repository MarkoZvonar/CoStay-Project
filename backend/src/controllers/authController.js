import "../config/env.js";
import { createClient } from "@supabase/supabase-js";
import { createOAuthClient } from "../config/oauthClient.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const saveSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) return reject(error);
      resolve();
    });
  });

const regenerateSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);
      resolve();
    });
  });

async function startOAuth(provider, req, res, next) {
  try {
    res.set("Cache-Control", "no-store");

    // Za promjenu računa korisnik se prvo treba odjaviti.
    if (req.session.user?.id) {
      return res.redirect("/");
    }

    // Nova Express sesija za novi pokušaj prijave.
    await regenerateSession(req);

    req.session.oauthStartedAt = Date.now();

    const authClient = createOAuthClient(req);

    const { data, error } = await authClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: new URL("/auth/callback", BASE_URL).href,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data?.url) {
      delete req.session.oauthStorage;
      delete req.session.oauthStartedAt;
      await saveSession(req);

      return res
        .status(503)
        .send("Prijavu trenutačno nije moguće pokrenuti. Pokušaj ponovno.");
    }

    // PKCE podatke moramo spremiti PRIJE odlaska na Google/GitHub.
    await saveSession(req);

    return res.redirect(data.url);
  } catch (error) {
    next(error);
  }
}

export const googleLogin = (req, res, next) =>
  startOAuth("google", req, res, next);

export const githubLogin = (req, res, next) =>
  startOAuth("github", req, res, next);

export const authCallback = async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");
    res.set("Referrer-Policy", "no-referrer");

    if (req.session.user?.id) {
      return res.redirect("/");
    }

    const code = typeof req.query.code === "string" ? req.query.code : "";

    const startedAt = req.session.oauthStartedAt;
    const elapsed = Date.now() - startedAt;

    const validAttempt =
      Number.isFinite(startedAt) &&
      elapsed >= 0 &&
      elapsed <= 10 * 60 * 1000 &&
      req.session.oauthStorage;

    if (req.query.error || !code || !validAttempt) {
      delete req.session.oauthStorage;
      delete req.session.oauthStartedAt;
      await saveSession(req);

      return res
        .status(400)
        .send(
          "Prijava je otkazana, istekla ili nije pokrenuta u ovom pregledniku. " +
            '<a href="/login">Pokreni prijavu ponovno.</a>',
        );
    }

    // Preuzimamo privremene podatke i uklanjamo ih iz Express sesije.
    const oauthStorage = req.session.oauthStorage;

    delete req.session.oauthStorage;
    delete req.session.oauthStartedAt;
    await saveSession(req);

    // Razmjena koristi samo podatke ovog pokušaja prijave.
    const authClient = createOAuthClient({
      session: { oauthStorage },
    });

    const { data, error } = await authClient.auth.exchangeCodeForSession(code);

    if (error || !data?.session || !data?.user) {
      const temporaryError =
        error && (!error.status || error.status >= 500 || error.status === 429);

      return res
        .status(temporaryError ? 503 : 401)
        .send(
          "Prijavu nije moguće dovršiti. " +
            '<a href="/login">Pokreni prijavu ponovno.</a>',
        );
    }

    const { user, session: authSession } = data;

    if (!user.email || !user.email_confirmed_at) {
      return res
        .status(403)
        .send(
          "Za prijavu je potrebna potvrđena email adresa. " +
            '<a href="/login">Povratak na prijavu.</a>',
        );
    }

    // Nakon uspješne autentifikacije mijenjamo ID Express sesije.
    await regenerateSession(req);

    req.session.user = {
      id: user.id,
      email: user.email,
      provider: user.app_metadata?.provider,
      name:
        user.user_metadata?.full_name || user.user_metadata?.name || user.email,
      picture: user.user_metadata?.avatar_url || "",
    };

    req.session.accessToken = authSession.access_token;
    req.session.refreshToken = authSession.refresh_token;
    req.session.accessTokenExpiresAt = authSession.expires_at;

    await saveSession(req);

    // Postojeća početna ruta odlučuje: signup2 ili discover.
    return res.redirect(303, "/");
  } catch (error) {
    next(error);
  }
};

// ISPOD OSTAVI SVOJU POSTOJEĆU FUNKCIJU:
// export const emailLogin = async (req, res, next) => { ... };
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
