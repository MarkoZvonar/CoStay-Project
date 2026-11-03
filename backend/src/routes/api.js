import express from "express";
import { createUserClient } from "../config/supabase.js";
import { createInboxRouter } from "./inbox.js";

const router = express.Router();

router.use("/inbox", createInboxRouter(createUserClient));

router.get("/current-user", (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json({
      loggedIn: true,
      user: req.session.user, // Sadrži ime, email, sliku i role ("user" ili "admin")
    });
  } else {
    res.status(200).json({
      loggedIn: false,
      user: { role: "guest" },
    });
  }
});

export default router;
