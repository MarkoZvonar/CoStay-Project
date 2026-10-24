import http from "http";
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const BASE_URL = process.env.BASE_URL || `http://localhost:${port}`;

// Provjera obaveznih varijabli okruženja
if (
  !process.env.SUPABASE_URL ||
  !process.env.SUPABASE_ANON_KEY ||
  !process.env.SESSION_SECRET
) {
  throw new Error("Nedostaju obavezne vrijednosti u .env datoteci.");
}

// Konfiguracija sesije
app.use(
  session({
    name: "app.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // U produkciji postaviti na true uz HTTPS
      sameSite: "lax",
    },
  }),
);

// Zdravstveni endpoint iz predloška
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Pomoćna funkcija za escape HTML-a
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

// Početna stranica
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.send(`
      <h1>Bok, ${escapeHtml(req.session.user.name || "korisniče")}!</h1>
      <p>Prijavljen preko: <strong>${escapeHtml(req.session.user.provider)}</strong></p>
      <p>${escapeHtml(req.session.user.email || "Email nije dostupan")}</p>
      ${
        req.session.user.picture
          ? `<img src="${escapeHtml(req.session.user.picture)}" alt="Profilna slika" width="100" height="100" style="border-radius: 50%; object-fit: cover;" />`
          : "<p>Korisnik nema profilnu sliku.</p>"
      }
      <p><a href="/logout">Odjava</a></p>
    `);
  }

  res.send(`
    <h1>Dobrodošao!</h1>
    <p>Odaberi način prijave:</p>
    <p><a href="/auth/google">Prijavi se s Googleom</a></p>
    <p><a href="/auth/github">Prijavi se s GitHubom</a></p>
  `);
});

// Registracija auth ruta
app.use("/auth", authRoutes);

// Odjava
app.get("/logout", (req, res, next) => {
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

// Globalna obrada grešaka
app.use((error, req, res, next) => {
  console.error("Zahtjev nije uspio:", error.message);
  if (res.headersSent) return next(error);
  res.status(500).send("Došlo je do greške. Pokušaj ponovno.");
});

// Pokretanje servera
const server = http.createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on 0.0.0.0:${port}`);
});
