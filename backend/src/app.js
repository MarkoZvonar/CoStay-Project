import "./config/env.js";
import path from "path";
import { fileURLToPath } from "url";
import {
  refreshSession,
  trackSessionResponseEnd,
} from "./middleware/refreshSession.js";

// Definiranje __dirname za ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import http from "http";
import express from "express";
import session from "express-session";

import pageRoutes from "./routes/pages.js";
import authRoutes from "./routes/auth.js";

const app = express();
const port = Number(process.env.PORT || 3000);
// Zdravstveni endpoint iz predloška
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});
app.get("/status", (req, res) => {
  return res.type("text/plain").send("API running");
});

// Putanja do foldera s EJS predlošcima i CSS-om
const frontendSrcPath = path.join(__dirname, "../../frontend/src");
const frontendPagesPath = path.join(frontendSrcPath, "pages");

// EJS POSTAVKE
app.set("view engine", "ejs");
app.set("views", frontendPagesPath);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Važno za čitanje podataka iz formi
app.use(express.static(frontendSrcPath));

app.use(trackSessionResponseEnd);
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
app.use("/", pageRoutes);
app.use("/auth", authRoutes);

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
