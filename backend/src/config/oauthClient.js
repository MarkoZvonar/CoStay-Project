import { createClient } from "@supabase/supabase-js";

//potrebno za Google i GitHub OAuth prijavu jer se u Supabase biblioteci koristi storage za pohranu OAuth podataka
export function createOAuthClient(req) {
  if (!req.session) {
    throw new Error("OAuth klijent zahtijeva Express sesiju.");
  }
  //spremaju se OAuth podaci jer kada se korisnik vrati sa preusmjerene stranice npr Googla, moramo znati gdje je stao
  if (!req.session.oauthStorage) {
    req.session.oauthStorage = {};
  }
  // definiran storage vezan uz konkretan req.session!
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
      persistSession: true, //omogućuje Supabase biblioteci korištenje storage za autentifikacijske podatke
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: "costay-oauth",
      storage,
    },
  });
}
