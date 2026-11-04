import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { refreshSession } from "./middleware/refreshSession.js";

// Definiranje __dirname za ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

import http from "http";
import express from "express";
import session from "express-session";

import pageRoutes from "./routes/pages.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";
import discoverRoutes from "./routes/discover.js";
import searchRoutes from "./routes/search.js";
import profileRoutes from "./routes/profile.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const BASE_URL = process.env.BASE_URL || `http://localhost:${port}`;

// Putanja do foldera s EJS predlošcima i CSS-om
const frontendSrcPath = path.join(__dirname, "../../frontend/src");
const frontendPagesPath = path.join(frontendSrcPath, "pages");

// Provjera obaveznih varijabli okruženja
if (
  !process.env.SUPABASE_URL ||
  !process.env.SUPABASE_ANON_KEY ||
  !process.env.SESSION_SECRET
) {
  throw new Error("Nedostaju obavezne vrijednosti u .env datoteci.");
}

// EJS POSTAVKE
app.set("view engine", "ejs");
app.set("views", frontendPagesPath);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Važno za čitanje podataka iz formi
app.use(express.static(frontendSrcPath));

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
app.use(refreshSession);
// rute
app.use("/api", apiRoutes);
app.use("/", pageRoutes);
app.use("/auth", authRoutes);
app.use("/discover", discoverRoutes);
app.use("/search", searchRoutes);
app.use("/profile", profileRoutes);

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
