import { createClient } from "@supabase/supabase-js";

export function createOAuthClient(req) {
  if (!req.session) {
    throw new Error("OAuth klijent zahtijeva Express sesiju.");
  }

  // Privremeno spremište vezano uz ovu Express sesiju.
  if (!req.session.oauthStorage) {
    req.session.oauthStorage = {};
  }

  const storage = {
    getItem(key) {
      return req.session.oauthStorage?.[key] ?? null;
    },

    setItem(key, value) {
      if (!req.session.oauthStorage) {
        req.session.oauthStorage = {};
      }

      req.session.oauthStorage[key] = value;
    },

    removeItem(key) {
      if (req.session.oauthStorage) {
        delete req.session.oauthStorage[key];
      }
    },
  };

  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: {
      flowType: "pkce",
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: "costay-oauth",
      storage,
    },
  });
}
