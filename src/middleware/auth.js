const User = require("../models/User");

/** Carga el usuario de la sesión en req.user y res.locals.user. */
async function loadUser(req, res, next) {
  const id = req.session?.userId;
  req.user = id ? await User.findById(id) : null;
  if (id && !req.user) delete req.session.userId; // el usuario ya no existe
  res.locals.user = req.user ? User.toSelf(req.user) : null;
  next();
}

/** Páginas: si no hay sesión, al inicio. */
function requireAuth(req, res, next) {
  if (req.user) return next();
  res.redirect(`/?next=${encodeURIComponent(req.originalUrl)}`);
}

/** API: si no hay sesión, 401 en JSON. */
function requireApiAuth(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ error: "Tu sesión ha caducado. Vuelve a iniciar sesión." });
}

/** Páginas de invitado (registro): si ya hay sesión, al chat. */
function guestOnly(req, res, next) {
  if (req.user) return res.redirect("/chat");
  next();
}

module.exports = { loadUser, requireAuth, requireApiAuth, guestOnly };
