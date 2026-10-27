import express from "express";
const router = express.Router();

// Početna stranica (discover)
router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/start");
  }
  res.render("discover");
});

// Start stranica
router.get("/start", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("start");
});

// Login stranica
router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("login");
});

// Signup stranice
router.get("/signup1", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("signup1");
});

router.get("/signup2", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("signup2");
});

router.get("/signup3", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("signup3");
});

// Odjava
router.get("/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("app.sid", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect("/");
  });
});

export default router;
