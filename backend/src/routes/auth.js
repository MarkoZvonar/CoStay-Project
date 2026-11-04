import express from "express";
import {
  googleLogin,
  githubLogin,
  authCallback,
  setSession,
  emailLogin,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/google", googleLogin);
router.get("/github", githubLogin);
router.get("/callback", authCallback); // ovdje se korisnik vraća iz supabase-auth-a nakon što se prijavi i dobije hash token u URL-u
router.post("/set-session", setSession); // Ruta za postavljanje sesije nakon što se token primi iz preglednika
router.post("/login", emailLogin);

export default router;
