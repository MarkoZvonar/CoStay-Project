import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";


dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Nedostaju Supabase ključevi u .env datoteci.");
}


export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  //Zašto (ova linija ispod): ovo je serverski klijent koji dijele svi zahtjevi.
  //Bez ove opcije bi se nakon signUp klijent mogao “prijaviti” kao taj korisnik i taj bi login vrijedio za sve sljedeće zahtjeve. Ovako server ne pamti nikakvu sesiju.
  { auth: { persistSession: false, autoRefreshToken: false } },
);