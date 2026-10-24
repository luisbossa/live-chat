// Presencia guardada en la base de datos: en serverless cada petición puede ir a una
// instancia distinta, así que no sirve un contador en memoria.
// - users.online: lo marcan los webhooks de Pusher (canal del usuario ocupado o vacío).
//   Pusher mantiene el canal ocupado mientras haya al menos una pestaña o dispositivo.
// - users.active_until: latido de la app mientras está a la vista (ver ACTIVE_TTL).
const db = require("../config/database");

// La app visible repite el aviso cada 30 s; si deja de llegar, a los 75 s cuenta como en segundo plano
const ACTIVE_TTL = 75 * 1000;

module.exports = {
  ACTIVE_TTL,

  /** Marca al usuario como conectado o desconectado. Devuelve true si cambió. */
  async setOnline(userId, online) {
    const { changes } = await db.run("UPDATE users SET online = ? WHERE id = ? AND online != ?", [online ? 1 : 0, userId, online ? 1 : 0]);
    return changes > 0;
  },

  /** `user` es la fila de la tabla users. */
  isOnline(user) {
    return Boolean(user?.online);
  },

  /** El cliente avisa cuando la pestaña o la app pasa a primer o segundo plano. */
  setVisible(userId, isVisible) {
    return db.run("UPDATE users SET active_until = ? WHERE id = ?", [isVisible ? Date.now() + ACTIVE_TTL : 0, userId]);
  },

  /** true si el usuario tiene Yabla a la vista en algún dispositivo (entonces no hace falta notificación push). */
  isActive(user) {
    return Number(user?.active_until) > Date.now();
  },
};
