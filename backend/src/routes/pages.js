import express from "express";
const router = express.Router();
function requireIdentity(req, res, next) {
  if (!req.session.user?.id) {
    return res.redirect("/login");
  }

  next();
}
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
router.get("/signup2", requireIdentity, (req, res) => {
  res.render("signup2");
});
router.post("/signup2", requireIdentity, (req, res) => {
  // Prihvaćamo samo tekstualne vrijednosti.
  const tekst = (vrijednost) =>
    typeof vrijednost === "string" ? vrijednost.trim() : "";
  const ime = tekst(req.body.ime);
  const prezime = tekst(req.body.prezime);
  const birthday = tekst(req.body.birthday);
  const spol = tekst(req.body.spol);
  const mjestoStanovanja = tekst(req.body.mjesto_stanovanja);
  if (!ime || !prezime || !mjestoStanovanja) {
    return res
      .status(400)
      .send("Ime, prezime i mjesto stanovanja su obavezni.");
  }
  if (!["muški", "ženski", "ostalo"].includes(spol)) {
    return res.status(400).send("Odaberi valjanu vrijednost za spol.");
  }
  // Provjeravamo format i postoji li taj datum.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    return res.status(400).send("Unesi valjan datum rođenja.");
  }
  const datum = new Date(`${birthday}T00:00:00Z`);
  const danas = new Date().toISOString().slice(0, 10);
  if (
    Number.isNaN(datum.getTime()) ||
    datum.toISOString().slice(0, 10) !== birthday ||
    birthday > danas
  ) {
    return res
      .status(400)
      .send("Datum rođenja mora biti valjan i ne smije biti u budućnosti.");
  }
  // Provjera ima li osoba najmanje 18 godina.
  const danasDatum = new Date();
  let dob = danasDatum.getUTCFullYear() - datum.getUTCFullYear();
  const mjesecRazlika = danasDatum.getUTCMonth() - datum.getUTCMonth();

  if (
    mjesecRazlika < 0 ||
    (mjesecRazlika === 0 && danasDatum.getUTCDate() < datum.getUTCDate())
  ) {
    dob--;
  }

  if (dob < 18) {
    return res
      .status(400)
      .send("Za registraciju moraš imati najmanje 18 godina.");
  }

  // Podatke zasad spremamo samo kao nacrt u sesiju.
  req.session.ime = ime;
  req.session.prezime = prezime;
  req.session.birthday = birthday;
  req.session.spol = spol;
  req.session.mjesto_stanovanja = mjestoStanovanja;

  return res.redirect("/signup3");
});
router.get("/signup3", requireIdentity, (req, res) => {
  res.render("signup3");
});
router.post("/signup3", requireIdentity, (req, res) => {
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
