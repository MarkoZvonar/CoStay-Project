import express from "express";
const router = express.Router();

// Početna stranica (discover)
router.get("/", (req, res) => {
  if (
    req.session.ime &&
    req.session.email &&
    req.session.password &&
    req.session.prezime &&
    req.session.birthday &&
    req.session.spol
  ) {
    return res.redirect("/profile");
  }
  if (req.session.user) {
    return res.redirect("/signup2");
  }
  // citamo iz "korisnik" tablica i provjeravamo je li sign up zavrsen, ako nije redirect na signup2
  res.redirect("/start");
});
// Start stranica
router.get("/discover", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("discover", {
    ime: req.session.ime,
    email: req.session.email,
    password: req.session.password,
    prezime: req.session.prezime,
    birthday: req.session.birthday,
    spol: req.session.spol,
  });
});
router.get("/create", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("create", {
    ime: req.session.ime,
    email: req.session.email,
    password: req.session.password,
    prezime: req.session.prezime,
    birthday: req.session.birthday,
    spol: req.session.spol,
  });
});
router.get("/inbox", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("inbox");
});

router.get("/search", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("search");
});
router.get("/profile", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("profile", {
    ime: req.session.ime,
    prezime: req.session.prezime,
    birthday: req.session.birthday,
    spol: req.session.spol,
  });
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
router.post("/signup1", (req, res) => {
  // Ovdje možete obraditi podatke iz forme, npr. spremiti ih u bazu podataka
  const email = req.body.email;
  const password = req.body.password;
  req.session.email = email;
  req.session.password = password;
  // Za sada samo preusmjeravamo na signup2
  res.redirect("/signup2");
});
router.get("/signup2", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("signup2");
});
router.post("/signup2", (req, res) => {
  // Ovdje možete obraditi podatke iz forme, npr. spremiti ih u bazu podataka
  const { ime } = req.body;
  const { prezime } = req.body;
  const { birthday } = req.body;
  const { spol } = req.body;
  req.session.ime = ime;
  req.session.prezime = prezime;
  req.session.birthday = birthday;
  req.session.spol = spol;
  // Za sada samo preusmjeravamo na signup3
  res.redirect("/signup3");
});
router.get("/signup3", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("signup3");
});
router.post("/signup3", (req, res) => {
  // Ovdje možete obraditi podatke iz forme, npr. spremiti ih u bazu podataka
  const { opis } = req.body;
  const { tagovi } = req.body;
  req.session.opis = opis;
  req.session.tagovi = tagovi;
  // Za sada samo preusmjeravamo na početnu
  res.redirect("/");
});

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
