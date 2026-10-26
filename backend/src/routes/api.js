import express from "express";

const router = express.Router();

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
