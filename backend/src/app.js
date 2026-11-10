import "./config/env.js";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import express from "express";
import session from "express-session";

import {
  refreshSession,
  trackSessionResponseEnd,
} from "./middleware/refreshSession.js";

import pageRoutes from "./routes/pages.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";
import inboxRoutes from "./routes/inbox.js";
import discoverRoutes from "./routes/discover.js";
import searchRoutes from "./routes/search.js";
import profileRoutes from "./routes/profile.js";
import discoverGuestRoutes from "./routes/discoverGuest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);

// Provjera rada servera, neovisna o sesiji.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("/status", (req, res) => {
  return res.type("text/plain").send("API running");
});

// Putanje do frontend datoteka.
const frontendSrcPath = path.join(__dirname, "../../frontend/src");
const frontendPagesPath = path.join(frontendSrcPath, "pages");

// EJS postavke.
app.set("view engine", "ejs");
app.set("views", frontendPagesPath);

// Čitanje zahtjeva i statičke datoteke.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(frontendSrcPath));

// Mora biti prije Express sesije.
app.use(trackSessionResponseEnd);

app.use(
  session({
    name: "app.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Za lokalni HTTP; prilagoditi pri HTTPS deployu.
      sameSite: "lax",
    },
  }),
);

app.use(refreshSession);

// Routeri za pojedine funkcionalnosti.
app.use("/api", apiRoutes);
app.use("/auth", authRoutes);
app.use("/inbox", inboxRoutes);

// Specifičnija putanja ide prije općenitije.
app.use("/discover/guest", discoverGuestRoutes);
app.use("/discover", discoverRoutes);

app.use("/search", searchRoutes);
app.use("/profile", profileRoutes);

// Početna stranica, registracija, odjava i ostale stranice.
app.use("/", pageRoutes);

// Globalna obrada grešaka.
app.use((error, req, res, next) => {
  console.error("Zahtjev nije uspio:", error.message);

  if (res.headersSent) return next(error);

  res.status(500).send("Došlo je do greške. Pokušaj ponovno.");
});

const server = http.createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on 0.0.0.0:${port}`);
});
