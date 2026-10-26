// Provjerava je li korisnik uopće prijavljen
export const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next(); // Korisnik je prijavljen, idi dalje
  }
  return res.status(401).json({ error: "Morate se prijaviti." });
};

// Provjerava je li korisnik administrator
export const requireAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next(); // Korisnik je admin, idi dalje
  }
  return res
    .status(403)
    .json({ error: "Pristup odbijen. Potrebne su admin ovlasti." });
};
