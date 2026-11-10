import express from "express";
import {
  googleLogin,
  githubLogin,
  authCallback,
  emailLogin,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/google", googleLogin);
router.get("/github", githubLogin);

// Backend prima autorizacijski kod i razmjenjuje ga za tokene.
router.get("/callback", authCallback);

router.post("/login", emailLogin);

export default router;
