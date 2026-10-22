import * as oidc from "openid-client";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Nedostaju Google OAuth parametri u .env datoteci.");
}

// Učitavanje Google OIDC konfiguracije
export const googleConfig = await oidc.discovery(
  new URL("https://accounts.google.com"),
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);
