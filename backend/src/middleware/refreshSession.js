import { refreshTokens } from "../services/refreshTokens.js";

// Red zahtjeva za svaku sesiju.
// Namijenjeno trenutačnoj aplikaciji s jednim Node procesom.
const sessionQueues = new Map();

export async function refreshSession(req, res, next) {
  if (!req.session.user?.id) {
    return next();
  }

  const sessionId = req.sessionID;
  const previous = sessionQueues.get(sessionId) || Promise.resolve();

  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });

  sessionQueues.set(sessionId, current);

  // Čekamo da prethodni zahtjev iste sesije završi.
  await previous;

  let released = false;

  function finish() {
    if (released) return;
    released = true;

    if (sessionQueues.get(sessionId) === current) {
      sessionQueues.delete(sessionId);
    }

    release();
  }

  res.once("finish", finish);
  res.once("close", finish);

  if (res.destroyed) {
    finish();
    return;
  }

  // Ponovno čitamo sesiju jer je prethodni zahtjev
  // možda spremio nove tokene ili odjavio korisnika.
  req.session.reload(async (reloadError) => {
    if (reloadError) {
      // Ne spremamo staru kopiju sesije natrag.
      req.session = null;

      return res
        .status(401)
        .send('Sesija nije dostupna. <a href="/login">Prijavi se ponovno.</a>');
    }

    // Odjava mora raditi i kada Supabase nije dostupan.
    if (req.path === "/logout" || !req.session.user?.id) {
      return next();
    }

    const expiresAt = req.session.accessTokenExpiresAt;
    const now = Math.floor(Date.now() / 1000);

    // Token vrijedi još više od jedne minute.
    if (
      req.session.accessToken &&
      Number.isFinite(expiresAt) &&
      expiresAt > now + 60
    ) {
      return next();
    }

    try {
      const result = await refreshTokens(
        req.session.refreshToken,
        req.session.user.id,
      );

      if (result.status === "unavailable") {
        return res
          .status(503)
          .send("Provjera prijave trenutačno nije dostupna. Pokušaj ponovno.");
      }

      if (result.status === "invalid") {
        return req.session.destroy((error) => {
          if (error) return next(error);

          res.clearCookie("app.sid", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
          });

          return res
            .status(401)
            .send(
              'Prijava više nije valjana. <a href="/login">Prijavi se ponovno.</a>',
            );
        });
      }

      req.session.accessToken = result.accessToken;
      req.session.refreshToken = result.refreshToken;
      req.session.accessTokenExpiresAt = result.accessTokenExpiresAt;

      req.session.save((error) => {
        if (error) return next(error);

        return next();
      });
    } catch (error) {
      next(error);
    }
  });
}
