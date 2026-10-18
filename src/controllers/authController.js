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

/** Propuestas parecidas cuando el nombre de usuario ya está ocupado. */
function usernameIdeas(base, name = "") {
  const clean = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_.]+/g, "").slice(0, 20);
  const words = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z0-9]+/).filter(Boolean);
  const year = String(new Date().getFullYear()).slice(2);
  const ideas = [
    words.length > 1 && `${words[0]}.${words.at(-1)}`,
    words.length > 1 && `${words[0]}_${words.at(-1)[0]}`,
    `${base}${year}`,
    `${base}_cr`,
    `${base}.${Math.floor(10 + Math.random() * 89)}`,
    `${base}${Math.floor(100 + Math.random() * 899)}`,
  ];
  return ideas.filter(Boolean).map(clean).filter((u) => validate.USERNAME.test(u) && u !== base);
}

exports.checkUsername = async (req, res) => {
  const username = validate.str(req.query.username, 20).replace(/^@/, "").toLowerCase();
  const valid = validate.USERNAME.test(username);
  const available = valid && !(await User.findByUsername(username));
  const suggestions = valid && !available ? (await User.availableUsernames(usernameIdeas(username, validate.str(req.query.name, 60)))).slice(0, 3) : [];
  res.json({ valid, available, suggestions });
};

exports.register = async (req, res) => {
  // Sin correo electrónico: nombre, usuario y contraseña
  const data = {
    name: validate.str(req.body.name, 60),
    password: typeof req.body.password === "string" ? req.body.password : "",
    username: validate.str(req.body.username, 20).replace(/^@/, "").toLowerCase(),
  };

  const errors = validate.registration(data);
  if (!errors.username && (await User.findByUsername(data.username))) errors.username = "Este nombre de usuario ya está en uso.";
  if (Object.keys(errors).length) return res.status(422).json({ error: "Revisa los datos del formulario.", errors });

  const user = await User.create({ ...data, avatar: await upload.save(req.file) });
  // Chat de bienvenida de la cuenta oficial: la app no está vacía la primera vez
  await welcome.sendWelcome(user).catch((err) => console.error("[bienvenida]", err));
  await startSession(req, user.id);
  res.status(201).json({ redirect: "/chat" });
};

exports.login = async (req, res) => {
  // Se entra con el nombre de usuario (con o sin @). Las cuentas antiguas también pueden usar su correo.
  const login = validate.str(req.body.login || req.body.username || req.body.email, 120).replace(/^@/, "").toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const user = login ? await User.findByLogin(login) : null;

  if (!User.verifyPassword(user, password)) {
    const error = "Usuario o contraseña incorrectos.";
    if (req.is("json")) return res.status(401).json({ error });
    return res.status(401).render("pages/login", { title: "Iniciar sesión", styles: ["register"], error, next: safeNext(req.body.next), login });
  }

  await startSession(req, user.id);
  const redirect = safeNext(req.body.next);
  if (req.is("json")) return res.json({ redirect });
  res.redirect(redirect);
};

exports.logout = (req, res) => {
  const done = () => {
    res.clearCookie("yabla.sid");
    res.set("Cache-Control", "no-store");
    if (req.is("json") || req.xhr || req.accepts(["html", "json"]) === "json") return res.json({ redirect: "/" });
    res.redirect(303, "/");
  };
  // Sin sesión (ya había salido o caducó) también termina en el inicio, nunca en un error
  if (!req.session) return done();
  req.session.destroy((err) => {
    if (err) console.error("[logout]", err);
    done();
  });
};
