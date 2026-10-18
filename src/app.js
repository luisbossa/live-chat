const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const config = require("./config");
const db = require("./config/database");
const sessionMiddleware = require("./config/session");
const { loadUser } = require("./middleware/auth");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const viewHelpers = require("./utils/viewHelpers");
const h = require("./utils/asyncHandler");
const pages = require("./controllers/pageController");
const webRoutes = require("./routes/web");
const apiRoutes = require("./routes/api");

const app = express();

app.disable("x-powered-by");
if (config.isProduction) app.set("trust proxy", 1);

// Vistas EJS con layout
app.set("view engine", "ejs");
app.set("views", path.join(config.root, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");
Object.assign(app.locals, viewHelpers);

// Cabeceras de seguridad básicas
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "same-origin",
  });
  next();
});

// Comprobación de salud para la plataforma de despliegue (sin sesión)
app.get("/healthz", (req, res, next) => {
  db.get("SELECT 1")
    .then(() => res.json({ status: "ok", uptime: Math.round(process.uptime()) }))
    .catch(next);
});

// Archivos estáticos y subidas de usuarios (guardadas en la base de datos).
// Van antes de la sesión para no consultar la tabla de sesiones en cada imagen.
app.use(express.static(path.join(config.root, "public"), { maxAge: config.isProduction ? "7d" : 0 }));
app.get("/uploads/:id", h(pages.upload));

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(sessionMiddleware);
app.use(h(loadUser));

app.use("/api", apiRoutes);
app.use("/", webRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
