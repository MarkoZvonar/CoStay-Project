import http from "http";
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const BASE_URL = process.env.BASE_URL || `http://localhost:${port}`;

// Definiranje __dirname za ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Putanja do foldera s login stranicom i CSS-om
const frontendPagesPath = path.join(__dirname, "../../frontend/src/pages");

// Provjera obaveznih varijabli okruženja
if (
  !process.env.SUPABASE_URL ||
  !process.env.SUPABASE_ANON_KEY ||
  !process.env.SESSION_SECRET
) {
  throw new Error("Nedostaju obavezne vrijednosti u .env datoteci.");
}

// Middleware
app.use(express.json());
app.use(express.static(frontendPagesPath)); // Poslužuje statičke datoteke (login.html, login.css) iz frontend/src/pages

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

// API rute
app.use("/api", apiRoutes);

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

// Početna stranica (prikazuje profil ako je prijavljen, inače preusmjerava na /login)
app.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(frontendPagesPath, "discover.html"));
});

// Ruta za login stranicu
app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.sendFile(path.join(frontendPagesPath, "login.html"));
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
