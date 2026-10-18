const session = require("express-session");
const db = require("./database");
const config = require("./index");

const SQL = {
  get: "SELECT sess FROM sessions WHERE sid = ? AND expires > ?",
  set: "INSERT INTO sessions (sid, sess, expires) VALUES (?, ?, ?) ON CONFLICT (sid) DO UPDATE SET sess = excluded.sess, expires = excluded.expires",
  destroy: "DELETE FROM sessions WHERE sid = ?",
  touch: "UPDATE sessions SET expires = ? WHERE sid = ?",
  purge: "DELETE FROM sessions WHERE expires <= ?",
};

/** Guarda las sesiones de express-session en la tabla `sessions` (SQLite local o Turso). */
class DatabaseStore extends session.Store {
  constructor() {
    super();
    // Limpieza de sesiones caducadas cada hora
    setInterval(() => db.run(SQL.purge, [Date.now()]).catch(() => {}), 60 * 60 * 1000).unref();
  }

  expiresAt(sess) {
    return sess?.cookie?.expires ? new Date(sess.cookie.expires).getTime() : Date.now() + config.sessionMaxAge;
  }

  get(sid, cb) {
    db.get(SQL.get, [sid, Date.now()])
      .then((row) => cb(null, row ? JSON.parse(row.sess) : null))
      .catch(cb);
  }

  set(sid, sess, cb = () => {}) {
    db.run(SQL.set, [sid, JSON.stringify(sess), this.expiresAt(sess)]).then(() => cb(null), cb);
  }

  destroy(sid, cb = () => {}) {
    db.run(SQL.destroy, [sid]).then(() => cb(null), cb);
  }

  touch(sid, sess, cb = () => {}) {
    db.run(SQL.touch, [this.expiresAt(sess), sid]).then(() => cb(null), cb);
  }
}

module.exports = session({
  name: "yabla.sid",
  secret: config.sessionSecret,
  store: new DatabaseStore(),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProduction,
    maxAge: config.sessionMaxAge,
  },
});
