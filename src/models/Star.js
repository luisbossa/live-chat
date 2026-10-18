const db = require("../config/database");
const Message = require("./Message");

// Mensajes destacados (con estrella). Cada usuario tiene su propia lista.
const SQL = {
  ids: "SELECT message_id FROM stars WHERE user_id = ?",
  exists: "SELECT 1 AS ok FROM stars WHERE user_id = ? AND message_id = ?",
  add: "INSERT OR IGNORE INTO stars (user_id, message_id, created_at) VALUES (?, ?, ?)",
  remove: "DELETE FROM stars WHERE user_id = ? AND message_id = ?",
  // Solo los que sigues pudiendo ver: no eliminados, no vaciados y de chats donde sigues
  list: `
    SELECT m.*, s.created_at AS starred_at
    FROM stars s
    JOIN messages m ON m.id = s.message_id
    JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = s.user_id
    WHERE s.user_id = ? AND m.deleted_at IS NULL AND m.id > cm.cleared_id
    ORDER BY s.created_at DESC
    LIMIT 200`,
};

const Star = {
  async ids(userId) {
    return (await db.all(SQL.ids, [userId])).map((r) => r.message_id);
  },

  /** Pone o quita la estrella. Devuelve el estado final. */
  async toggle(userId, messageId) {
    if (await db.get(SQL.exists, [userId, messageId])) {
      await db.run(SQL.remove, [userId, messageId]);
      return false;
    }
    await db.run(SQL.add, [userId, messageId, Date.now()]);
    return true;
  },

  async list(userId) {
    const rows = await db.all(SQL.list, [userId]);
    const starredAt = new Map(rows.map((r) => [r.id, r.starred_at]));
    return (await Message.hydrate(rows)).map((m) => ({ ...m, starredAt: starredAt.get(m.id) }));
  },
};

module.exports = Star;
