import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const envPath = fileURLToPath(new URL("../../.env", import.meta.url));

dotenv.config({ path: envPath });

if (
  !process.env.SUPABASE_URL ||
  !process.env.SUPABASE_ANON_KEY ||
  !process.env.SESSION_SECRET
) {
  throw new Error("Nedostaju obavezne vrijednosti u .env datoteci.");
}
