const User = require("../models/User");
const upload = require("../middleware/upload");
const validate = require("../utils/validate");
const welcome = require("../services/welcome");

/** Solo se permiten redirecciones internas (evita redirecciones abiertas). */
function safeNext(next) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/chat";
}

/** Nueva sesión al autenticarse (evita fijación de sesión). */
function startSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = userId;
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

exports.showRegister = (req, res) => {
  res.render("pages/register", { title: "Crear cuenta", styles: ["register"] });
};

exports.showLogin = (req, res) => {
  res.render("pages/login", { title: "Iniciar sesión", styles: ["register"], next: safeNext(req.query.next) });
};

exports.checkUsername = async (req, res) => {
  const username = validate.str(req.query.username, 20);
  const valid = validate.USERNAME.test(username);
  res.json({ valid, available: valid && !(await User.findByUsername(username)) });
};

exports.register = async (req, res) => {
  const data = {
    name: validate.str(req.body.name, 60),
    email: validate.str(req.body.email, 120).toLowerCase(),
    password: typeof req.body.password === "string" ? req.body.password : "",
    username: validate.str(req.body.username, 20).replace(/^@/, "").toLowerCase(),
  };

  const errors = validate.registration(data);
  if (!errors.email && (await User.findByEmail(data.email))) errors.email = "Ya existe una cuenta con este correo.";
  if (!errors.username && (await User.findByUsername(data.username))) errors.username = "Este nombre de usuario ya está en uso.";
  if (Object.keys(errors).length) return res.status(422).json({ error: "Revisa los datos del formulario.", errors });

  const user = await User.create({ ...data, avatar: await upload.save(req.file) });
  // Chat de bienvenida de la cuenta oficial: la app no está vacía la primera vez
  await welcome.sendWelcome(user).catch((err) => console.error("[bienvenida]", err));
  await startSession(req, user.id);
  res.status(201).json({ redirect: "/chat" });
};

exports.login = async (req, res) => {
  const login = validate.str(req.body.email || req.body.login, 120).replace(/^@/, "");
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const user = login ? await User.findByLogin(login) : null;

  if (!User.verifyPassword(user, password)) {
    const error = "Correo o contraseña incorrectos.";
    if (req.is("json")) return res.status(401).json({ error });
    return res.status(401).render("pages/login", { title: "Iniciar sesión", styles: ["register"], error, next: safeNext(req.body.next), login });
  }

  await startSession(req, user.id);
  const redirect = safeNext(req.body.next);
  if (req.is("json")) return res.json({ redirect });
  res.redirect(redirect);
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("yabla.sid");
    if (req.is("json") || req.xhr) return res.json({ redirect: "/" });
    res.redirect("/");
  });
};
