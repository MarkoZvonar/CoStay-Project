import { randomBytes } from "node:crypto";
import * as oidc from "openid-client";
import { googleConfig } from "../config/google.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const REDIRECT_URI = `${BASE_URL}/auth/google/callback`;

// --- GOOGLE KONTROLERI ---

export const googleLogin = async (req, res, next) => {
  try {
    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

    req.session.oauth = { state, nonce, codeVerifier };

    const authorizationUrl = oidc.buildAuthorizationUrl(googleConfig, {
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    res.redirect(authorizationUrl.href);
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req, res, next) => {
  try {
    const saved = req.session.oauth;
    if (!saved) {
      return res
        .status(400)
        .send("Sesija prijave nije pronađena. Pokušaj ponovno.");
    }

    const currentUrl = new URL(req.originalUrl, BASE_URL);
    const tokens = await oidc.authorizationCodeGrant(googleConfig, currentUrl, {
      expectedState: saved.state,
      expectedNonce: saved.nonce,
      pkceCodeVerifier: saved.codeVerifier,
      idTokenExpected: true,
    });

    const claims = tokens.claims();
    if (!claims?.sub || !claims.email || claims.email_verified !== true) {
      return res.status(401).send("Google identitet nije potvrđen.");
    }

    delete req.session.oauth;

    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.user = {
        id: claims.sub,
        provider: "google",
        providerId: claims.sub,
        name: claims.name || "",
        email: claims.email,
        picture: claims.picture || "",
      };

      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        res.redirect("/");
      });
    });
  } catch (error) {
    next(error);
  }
};

// --- GITHUB KONTROLERI ---

export const githubLogin = (req, res, next) => {
  try {
    const state = randomBytes(32).toString("hex");
    req.session.githubOAuthState = state;

    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: `${BASE_URL}/auth/github/callback`,
      scope: "read:user user:email",
      state,
    });

    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
  } catch (error) {
    next(error);
  }
};

export const githubCallback = async (req, res, next) => {
  try {
    const { code, state, error } = req.query;
    const expectedState = req.session.githubOAuthState;

    if (error) {
      delete req.session.githubOAuthState;
      return res.status(400).send("GitHub prijava je otkazana ili odbijena.");
    }

    if (
      typeof code !== "string" ||
      typeof state !== "string" ||
      typeof expectedState !== "string" ||
      state !== expectedState
    ) {
      delete req.session.githubOAuthState;
      return res.status(400).send("Nevaljan OAuth odgovor. Pokušaj ponovno.");
    }

    delete req.session.githubOAuthState;

    // 1. Zamjena koda za access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${BASE_URL}/auth/github/callback`,
        }),
      },
    );

    if (!tokenResponse.ok) throw new Error("GitHub token exchange failed");
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token)
      throw new Error("GitHub nije vratio access token");

    // 2. Dohvat profila
    const headers = {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const profileResponse = await fetch("https://api.github.com/user", {
      headers,
    });
    if (!profileResponse.ok) throw new Error("GitHub profile request failed");
    const profile = await profileResponse.json();

    // 3. Dohvat verifikovanog e-maila
    let email = null;
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers,
    });
    if (emailsResponse.ok) {
      const emails = await emailsResponse.json();
      const primaryEmail = emails.find(
        (item) => item.primary === true && item.verified === true,
      );
      email = primaryEmail?.email ?? null;
    }

    // 4. Stvaranje sesije
    req.session.regenerate((sessionError) => {
      if (sessionError) return next(sessionError);

      req.session.user = {
        id: String(profile.id),
        provider: "github",
        providerId: String(profile.id),
        name: profile.name || profile.login,
        email,
        picture: profile.avatar_url || "",
      };

      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        res.redirect("/");
      });
    });
  } catch (error) {
    next(error);
  }
};
