import express from "express";

import {
  googleLogin,
  githubLogin,
  authCallback,
  emailLogin,
  forgotPassword,
  recoveryCallback,
  showResetPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Google i GitHub prijava.
router.get("/google", googleLogin);
router.get("/github", githubLogin);
router.get("/callback", authCallback);

// Email prijava.
router.post("/login", emailLogin);

// Oporavak lozinke.
router.post("/forgot-password", forgotPassword);
router.get("/recovery-callback", recoveryCallback);
router.get("/reset-password", showResetPassword);
router.post("/reset-password", resetPassword);

export default router;
