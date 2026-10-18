const session = require("express-session");
const db = require("./database");
const config = require("./index");

/** Guarda las sesiones de express-session en la tabla `sessions` de SQLite. */
class SQLiteStore extends session.Store {
  constructor() {
    super();
    this.stmt = {
      get: db.prepare("SELECT sess FROM sessions WHERE sid = ? AND expires > ?"),
      set: db.prepare("INSERT INTO sessions (sid, sess, expires) VALUES (?, ?, ?) ON CONFLICT (sid) DO UPDATE SET sess = excluded.sess, expires = excluded.expires"),
      destroy: db.prepare("DELETE FROM sessions WHERE sid = ?"),
      touch: db.prepare("UPDATE sessions SET expires = ? WHERE sid = ?"),
      purge: db.prepare("DELETE FROM sessions WHERE expires <= ?"),
    };
    // Limpieza de sesiones caducadas cada hora
    setInterval(() => this.stmt.purge.run(Date.now()), 60 * 60 * 1000).unref();
  }

  expiresAt(sess) {
    return sess?.cookie?.expires ? new Date(sess.cookie.expires).getTime() : Date.now() + config.sessionMaxAge;
  }

  get(sid, cb) {
    try {
      const row = this.stmt.get.get(sid, Date.now());
      cb(null, row ? JSON.parse(row.sess) : null);
    } catch (err) {
      cb(err);
    }
  }

  set(sid, sess, cb = () => {}) {
    try {
      this.stmt.set.run(sid, JSON.stringify(sess), this.expiresAt(sess));
      cb(null);
    } catch (err) {
      cb(err);
    }
  }

  destroy(sid, cb = () => {}) {
    try {
      this.stmt.destroy.run(sid);
      cb(null);
    } catch (err) {
      cb(err);
    }
  }

  touch(sid, sess, cb = () => {}) {
    try {
      this.stmt.touch.run(this.expiresAt(sess), sid);
      cb(null);
    } catch (err) {
      cb(err);
    }
  }
}

module.exports = session({
  name: "yabla.sid",
  secret: config.sessionSecret,
  store: new SQLiteStore(),
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
