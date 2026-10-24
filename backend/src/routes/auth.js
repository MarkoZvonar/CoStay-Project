import express from "express";
import {
  googleLogin,
  githubLogin,
  authCallback,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/google", googleLogin);
router.get("/github", githubLogin);
router.get("/callback", authCallback);

export default router;
