import express from "express";
import {
  googleLogin,
  githubLogin,
  authCallback,
  setSession,
  register,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/google", googleLogin);
router.get("/github", githubLogin);
router.get("/callback", authCallback);
router.post("/set-session", setSession);
router.post("/register", register);

export default router;