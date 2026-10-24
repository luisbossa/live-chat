const db = require("../config/database");

// Una llamada sin contestar deja de sonar a los 35 s
const RING_TIMEOUT = 35 * 1000;
const MAX_LENGTH = 6 * 60 * 60 * 1000;

const SQL = {
  insert: "INSERT INTO calls (id, conversation_id, type, caller_id, callee_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  byId: "SELECT * FROM calls WHERE id = ?",
  // En llamada: contestada y sin terminar, o sonando todavía. Una contestada hace más de
  // MAX_LENGTH ya no cuenta (si se perdió el aviso de fin, el usuario no queda "ocupado" para siempre)
  busy: `
    SELECT 1 FROM calls
    WHERE ended_at IS NULL AND (caller_id = ?1 OR callee_id = ?1) AND (answered_at > ?3 OR created_at > ?2)
    LIMIT 1`,
  answer: "UPDATE calls SET answered_at = ? WHERE id = ? AND answered_at IS NULL AND ended_at IS NULL",
  end: "UPDATE calls SET ended_at = ? WHERE id = ? AND ended_at IS NULL",
  unanswered: "SELECT * FROM calls WHERE ended_at IS NULL AND answered_at IS NULL AND created_at <= ?",
  purge: "DELETE FROM calls WHERE ended_at IS NOT NULL AND ended_at < ?",
};

const Call = {
  RING_TIMEOUT,

  async create({ id, conversationId, type, callerId, calleeId }) {
    await db.run(SQL.insert, [id, conversationId, type, callerId, calleeId, Date.now()]);
    return Call.findById(id);
  },

  findById(id) {
    return typeof id === "string" ? db.get(SQL.byId, [id]) : Promise.resolve(undefined);
  },

  async isBusy(userId) {
    return Boolean(await db.get(SQL.busy, [userId, Date.now() - RING_TIMEOUT, Date.now() - MAX_LENGTH]));
  },

  /** Devuelve true solo a quien contesta primero (otro dispositivo pudo adelantarse). */
  async answer(id) {
    return (await db.run(SQL.answer, [Date.now(), id])).changes > 0;
  },

  /** Devuelve true solo la primera vez: así el mensaje de la llamada se registra una sola vez. */
  async end(id) {
    return (await db.run(SQL.end, [Date.now(), id])).changes > 0;
  },

  /** Llamadas que sonaron sin respuesta más allá del límite (respaldo del cron). */
  unanswered() {
    return db.all(SQL.unanswered, [Date.now() - RING_TIMEOUT]);
  },

  /** El historial queda en los mensajes del chat: las filas viejas no hacen falta. */
  purge() {
    return db.run(SQL.purge, [Date.now() - 24 * 60 * 60 * 1000]);
  },
};

module.exports = Call;
