import "../config/env.js";
import { createClient } from "@supabase/supabase-js";
import { createOAuthClient } from "../config/oauthClient.js";
import { randomBytes, timingSafeEqual } from "node:crypto";
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
export const forgotPassword = async (req, res, next) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";

  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).send("Unesi ispravnu email adresu.");
  }

  try {
    res.set("Cache-Control", "no-store");

    // Odvojeno od privremenih podataka Google/GitHub prijave.
    const recoveryRequest = {
      startedAt: Date.now(),
      oauthStorage: {},
    };

    const authClient = createOAuthClient({
      session: recoveryRequest,
    });

    const { error } = await authClient.auth.resetPasswordForEmail(email, {
      redirectTo: new URL("/auth/recovery-callback", BASE_URL).href,
    });

    if (error) {
      // Ne ispisujemo email, tokene ili sadržaj poveznice.
      console.error("Oporavak lozinke — kod:", error.code || "UNKNOWN");

      if (error.status === 429) {
        return res
          .status(429)
          .send("Previše pokušaja. Pričekaj prije ponovnog slanja zahtjeva.");
      }

      if (!error.status || error.status >= 500) {
        return res
          .status(503)
          .send("Slanje trenutačno nije dostupno. Pokušaj ponovno kasnije.");
      }

      // Za ostale odgovore ne otkrivamo postoji li račun.
    } else {
      // Čuvamo PKCE podatke potrebne pri povratku iz emaila.
      req.session.recoveryRequest = recoveryRequest;
      await saveSession(req);
    }

    return res.status(200).send(`
      <h2>Provjeri email</h2>
      <p>
        Ako je oporavak moguć za unesenu adresu,
        dobit ćeš poveznicu za postavljanje nove lozinke.
      </p>
      <p>
        Poveznicu otvori u istom pregledniku u kojem si poslala zahtjev.
      </p>
      <a href="/login">Povratak na prijavu</a>
    `);
  } catch (error) {
    next(error);
  }
};
export const recoveryCallback = async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");
    res.set("Referrer-Policy", "no-referrer");

    const code = typeof req.query.code === "string" ? req.query.code : "";

    const recoveryRequest = req.session.recoveryRequest;
    const startedAt = recoveryRequest?.startedAt;
    const elapsed = Date.now() - startedAt;

    const validRequest =
      Number.isFinite(startedAt) &&
      elapsed >= 0 &&
      elapsed <= 30 * 60 * 1000 &&
      recoveryRequest?.oauthStorage;

    if (req.query.error || !code || !validRequest) {
      return res
        .status(400)
        .send(
          "Poveznica nije valjana, pokušaj je istekao ili je otvoren u drugom pregledniku. " +
            '<a href="/forgot-password">Zatraži novu poveznicu.</a>',
        );
    }

    // Pokušaj oporavka trošimo prije razmjene koda.
    delete req.session.recoveryRequest;
    await saveSession(req);

    const authClient = createOAuthClient({
      session: recoveryRequest,
    });

    const { data, error } = await authClient.auth.exchangeCodeForSession(code);

    if (
      error ||
      !data?.session ||
      !data?.user ||
      data.redirectType !== "recovery"
    ) {
      const unavailable =
        error && (!error.status || error.status >= 500 || error.status === 429);

      return res
        .status(unavailable ? 503 : 400)
        .send(
          "Oporavak nije moguće potvrditi. " +
            '<a href="/forgot-password">Zatraži novu poveznicu.</a>',
        );
    }

    const tokenExpiresAt = data.session.expires_at;

    if (
      !Number.isFinite(tokenExpiresAt) ||
      tokenExpiresAt * 1000 <= Date.now()
    ) {
      return res
        .status(400)
        .send(
          'Poveznica je istekla. <a href="/forgot-password">Zatraži novu.</a>',
        );
    }

    // Nova Express sesija: ne prenosimo eventualnu staru prijavu.
    await regenerateSession(req);

    req.session.passwordRecovery = {
      userId: data.user.id,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,

      expiresAt: Math.min(Date.now() + 15 * 60 * 1000, tokenExpiresAt * 1000),

      formToken: randomBytes(32).toString("hex"),
    };

    await saveSession(req);

    // Uklanjamo autorizacijski kod iz adrese preusmjeravanjem.
    return res.redirect(303, "/auth/reset-password");
  } catch (error) {
    next(error);
  }
};

export const showResetPassword = (req, res) => {
  res.set("Cache-Control", "no-store");
  res.set("Referrer-Policy", "no-referrer");

  const recovery = req.session.passwordRecovery;

  if (
    !recovery?.userId ||
    !recovery.accessToken ||
    !recovery.formToken ||
    !Number.isFinite(recovery.expiresAt) ||
    recovery.expiresAt <= Date.now()
  ) {
    return res
      .status(401)
      .send(
        "Za postavljanje lozinke potrebna je valjana poveznica iz emaila. " +
          '<a href="/forgot-password">Zatraži novu poveznicu.</a>',
      );
  }

  return res.render("reset-password", {
    formToken: recovery.formToken,
  });
};
// Sprječava paralelno slanje istog obrasca u jednom Node procesu.
const passwordUpdatesInProgress = new Set();

export const resetPassword = async (req, res, next) => {
  res.set("Cache-Control", "no-store");

  const recovery = req.session.passwordRecovery;

  if (
    !recovery?.userId ||
    !recovery.accessToken ||
    !recovery.refreshToken ||
    !Number.isFinite(recovery.expiresAt) ||
    recovery.expiresAt <= Date.now()
  ) {
    return res
      .status(401)
      .send(
        'Oporavak je istekao. <a href="/forgot-password">Zatraži novu poveznicu.</a>',
      );
  }

  const receivedToken = req.body?.recoveryFormToken;
  const validTokenFormat = (value) =>
    typeof value === "string" && /^[a-f0-9]{64}$/.test(value);

  if (
    !validTokenFormat(receivedToken) ||
    !validTokenFormat(recovery.formToken) ||
    !timingSafeEqual(
      Buffer.from(receivedToken, "hex"),
      Buffer.from(recovery.formToken, "hex"),
    )
  ) {
    return res
      .status(403)
      .send("Zahtjev nije potvrđen. Osvježi obrazac i pokušaj ponovno.");
  }

  const password = req.body?.password;
  const passwordConfirm = req.body?.passwordConfirm;

  // Lozinke ne trimamo i ne spremamo u Express sesiju.
  if (
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 128
  ) {
    return res
      .status(400)
      .send("Lozinka mora imati između 12 i 128 znakova. Vrati se na obrazac.");
  }

  if (typeof passwordConfirm !== "string" || password !== passwordConfirm) {
    return res
      .status(400)
      .send("Lozinke se ne podudaraju. Vrati se na obrazac.");
  }

  const sessionId = req.sessionID;

  if (passwordUpdatesInProgress.has(sessionId)) {
    return res.status(409).send("Promjena lozinke već je u tijeku. Pričekaj.");
  }

  passwordUpdatesInProgress.add(sessionId);

  try {
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

    // Prije promjene ponovno potvrđujemo identitet tokenom.
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(recovery.accessToken);

    if (userError) {
      const unavailable =
        !userError.status ||
        userError.status >= 500 ||
        userError.status === 429;

      return res
        .status(unavailable ? 503 : 401)
        .send(
          unavailable
            ? "Provjera trenutačno nije dostupna. Pokušaj ponovno."
            : "Oporavak više nije valjan. Zatraži novu poveznicu.",
        );
    }

    if (!user || user.id !== recovery.userId) {
      return res.status(401).send("Identitet za oporavak nije potvrđen.");
    }

    // Sesiju postavljamo samo na ovaj zasebni Supabase klijent.
    const { error: sessionError } = await authClient.auth.setSession({
      access_token: recovery.accessToken,
      refresh_token: recovery.refreshToken,
    });

    if (sessionError) {
      return res
        .status(401)
        .send(
          "Sesiju oporavka nije moguće pripremiti. Zatraži novu poveznicu.",
        );
    }

    const { data, error } = await authClient.auth.updateUser({
      password,
    });

    if (error) {
      console.error("Promjena lozinke — kod:", error.code || "UNKNOWN");

      const unavailable =
        !error.status || error.status >= 500 || error.status === 429;

      return res
        .status(unavailable ? 503 : 400)
        .send(
          unavailable
            ? "Promjena trenutačno nije dostupna. Pokušaj ponovno kasnije."
            : "Lozinka nije promijenjena. Odaberi novu lozinku koja zadovoljava pravila računa.",
        );
    }

    if (!data.user || data.user.id !== recovery.userId) {
      return res
        .status(500)
        .send("Rezultat promjene nije moguće potvrditi. Pokušaj se prijaviti.");
    }

    // Lozinka je promijenjena; uklanjamo lokalnu sesiju oporavka.
    return req.session.destroy((destroyError) => {
      passwordUpdatesInProgress.delete(sessionId);

      res.clearCookie("app.sid", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

      if (destroyError) {
        console.error("Brisanje sesije oporavka nije uspjelo.");

        return res
          .status(500)
          .send(
            "Lozinka je promijenjena, ali završetak sesije nije uspio. " +
              '<a href="/login">Prijavi se novom lozinkom.</a>',
          );
      }

      return res.send(`
        <h2>Lozinka je promijenjena</h2>
        <p>Sada se možeš prijaviti svojim emailom i novom CoStay lozinkom.</p>
        <a href="/login">Idi na prijavu</a>
      `);
    });
  } catch (error) {
    next(error);
  } finally {
    passwordUpdatesInProgress.delete(sessionId);
  }
};
