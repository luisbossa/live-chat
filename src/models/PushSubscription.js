// Suscripciones Web Push: un navegador o dispositivo por fila (un usuario puede tener varias).
const db = require("../config/database");

const placeholders = (n) => Array(n).fill("?").join(",");

const PushSubscription = {
  /** Guarda o actualiza la suscripción de este dispositivo (el endpoint es único). */
  async save(userId, { endpoint, keys }, { preview = true, userAgent = null } = {}) {
    await db.run(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, preview, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(endpoint) DO UPDATE SET
         user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
         preview = excluded.preview, user_agent = excluded.user_agent`,
      [userId, endpoint, keys.p256dh, keys.auth, preview ? 1 : 0, userAgent, Date.now()]
    );
    return PushSubscription.findByEndpoint(endpoint);
  },

  findByEndpoint: (endpoint) => db.get("SELECT * FROM push_subscriptions WHERE endpoint = ?", [endpoint]),

  async forUsers(userIds) {
    const ids = [...new Set(userIds)].filter(Boolean);
    if (!ids.length) return [];
    return db.all(`SELECT * FROM push_subscriptions WHERE user_id IN (${placeholders(ids.length)})`, ids);
  },

  countForUser: async (userId) => (await db.get("SELECT COUNT(*) AS n FROM push_subscriptions WHERE user_id = ?", [userId])).n,

  setPreview: (userId, endpoint, preview) =>
    db.run("UPDATE push_subscriptions SET preview = ? WHERE user_id = ? AND endpoint = ?", [preview ? 1 : 0, userId, endpoint]),

  remove: (userId, endpoint) => db.run("DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?", [userId, endpoint]),

  /** El servicio de push dijo que ya no existe (410/404): se borra sin importar el usuario. */
  removeEndpoint: (endpoint) => db.run("DELETE FROM push_subscriptions WHERE endpoint = ?", [endpoint]),

  touch: (id) => db.run("UPDATE push_subscriptions SET last_used_at = ? WHERE id = ?", [Date.now(), id]),
};

module.exports = PushSubscription;
