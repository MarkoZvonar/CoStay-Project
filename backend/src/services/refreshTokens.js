import { createAuthClient } from "../config/supabase.js";
export async function refreshTokens(refreshToken, expectedUserId) {
  if (typeof refreshToken !== "string" || !refreshToken || !expectedUserId) {
    return { status: "invalid" };
  }

  // Zaseban klijent za ovaj zahtjev.
  const authClient = createAuthClient();

  const { data, error } = await authClient.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error) {
    // Privremena nedostupnost nije razlog za odjavu korisnika.
    if (!error.status || error.status >= 500 || error.status === 429) {
      return { status: "unavailable" };
    }

    return { status: "invalid" };
  }

  // Obnovljena sesija mora pripadati istom korisniku.
  if (!data.session || !data.user || data.user.id !== expectedUserId) {
    return { status: "invalid" };
  }

  return {
    status: "ok",
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    accessTokenExpiresAt: data.session.expires_at,
  };
}
