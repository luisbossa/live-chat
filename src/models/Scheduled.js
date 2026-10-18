const db = require("../config/database");

// Mensajes programados: texto que se enviará solo a la hora elegida.
const toJSON = (r) => ({ id: r.id, conversationId: r.conversation_id, body: r.body, replyToId: r.reply_to_id, sendAt: r.send_at, createdAt: r.created_at });

const Scheduled = {
  toJSON,

  async create({ conversationId, senderId, body, replyToId = null, sendAt }) {
    const { lastInsertRowid } = await db.run(
      "INSERT INTO scheduled_messages (conversation_id, sender_id, body, reply_to_id, send_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [conversationId, senderId, body, replyToId, sendAt, Date.now()]
    );
    return toJSON(await db.get("SELECT * FROM scheduled_messages WHERE id = ?", [lastInsertRowid]));
  },

  findById: (id) => db.get("SELECT * FROM scheduled_messages WHERE id = ?", [id]),

  async listFor(conversationId, senderId) {
    return (await db.all("SELECT * FROM scheduled_messages WHERE conversation_id = ? AND sender_id = ? ORDER BY send_at", [conversationId, senderId])).map(toJSON);
  },

  async countFor(conversationId, senderId) {
    return (await db.get("SELECT COUNT(*) AS n FROM scheduled_messages WHERE conversation_id = ? AND sender_id = ?", [conversationId, senderId])).n;
  },

  /** Saca de la cola (atómicamente) un mensaje concreto; null si ya se envió o no es suyo. */
  take: (id, senderId) => db.get("DELETE FROM scheduled_messages WHERE id = ? AND sender_id = ? RETURNING *", [id, senderId]),

  /** Saca de la cola los que ya tocan. DELETE … RETURNING evita enviarlos dos veces. */
  takeDue: (now = Date.now()) => db.all("DELETE FROM scheduled_messages WHERE send_at <= ? RETURNING *", [now]),
};

module.exports = Scheduled;
