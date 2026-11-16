import { createClient } from "@supabase/supabase-js";
import "./env.js";

// osnovni klijent za anonimne upite bazi
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

// klijent koji koristi identitet konkretnog prijavljenog korisnika
export function createUserClient(token) {
  // zaseban Supabase klijent za trenutnog korisnika
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }, //Korisnikov access token šalje se u HTTP zaglavlju Authorization.
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// klijent za Email/lozinka i druge autentifikacijske operacije bez trajno spremljene sesije
export function createAuthClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false, //	Klijent ne sprema automatski sesiju u svoju trajnu pohranu
      autoRefreshToken: false, // Ne obnavlja samostalno access token
      detectSessionInUrl: false, // Ne pokušava automatski prepoznati sesiju iz URL-a
    },
  });
}
