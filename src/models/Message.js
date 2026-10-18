const db = require("../config/database");

const TYPES = ["text", "image", "file", "audio", "sticker", "call", "payment", "system"];

const stmt = {
  insert: db.prepare(`
    INSERT INTO messages (conversation_id, sender_id, type, body, media_url, meta, reply_to_id, created_at)
    VALUES (@conversationId, @senderId, @type, @body, @mediaUrl, @meta, @replyToId, @now)
  `),
  setLast: db.prepare("UPDATE conversations SET last_message_id = ? WHERE id = ?"),
  byId: db.prepare("SELECT * FROM messages WHERE id = ?"),
  page: db.prepare(`
    SELECT * FROM messages
    WHERE conversation_id = @conversationId AND id > @after AND id < @before
    ORDER BY id DESC
    LIMIT @limit
  `),
  edit: db.prepare("UPDATE messages SET body = ?, edited_at = ? WHERE id = ?"),
  remove: db.prepare("UPDATE messages SET deleted_at = ?, body = NULL, media_url = NULL, meta = NULL WHERE id = ?"),
  reaction: db.prepare("SELECT emoji FROM reactions WHERE message_id = ? AND user_id = ?"),
  addReaction: db.prepare(`
    INSERT INTO reactions (message_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?)
    ON CONFLICT (message_id, user_id) DO UPDATE SET emoji = excluded.emoji, created_at = excluded.created_at
  `),
  removeReaction: db.prepare("DELETE FROM reactions WHERE message_id = ? AND user_id = ?"),
  media: db.prepare(`
    SELECT * FROM messages
    WHERE conversation_id = ? AND id > ? AND deleted_at IS NULL AND type IN ('image', 'file', 'audio')
    ORDER BY id DESC LIMIT 60
  `),
};

const placeholders = (n) => Array(n).fill("?").join(",");

function parseMeta(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Convierte filas de la BD en objetos para el cliente, con reacciones y respuesta citada. */
function hydrate(rows) {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);

  const reactions = new Map();
  db.prepare(`SELECT message_id, user_id, emoji FROM reactions WHERE message_id IN (${placeholders(ids.length)}) ORDER BY created_at`)
    .all(...ids)
    .forEach(({ message_id, user_id, emoji }) => {
      const list = reactions.get(message_id) || [];
      const group = list.find((r) => r.emoji === emoji);
      if (group) group.userIds.push(user_id);
      else list.push({ emoji, userIds: [user_id] });
      reactions.set(message_id, list);
    });

  const replyIds = [...new Set(rows.map((r) => r.reply_to_id).filter(Boolean))];
  const replies = new Map(
    replyIds.length
      ? db.prepare(`SELECT * FROM messages WHERE id IN (${placeholders(replyIds.length)})`).all(...replyIds).map((r) => [r.id, r])
      : []
  );

  return rows.map((row) => {
    const reply = replies.get(row.reply_to_id);
    const deleted = Boolean(row.deleted_at);
    return {
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      type: row.type,
      body: row.body,
      mediaUrl: row.media_url,
      meta: parseMeta(row.meta),
      replyTo: reply
        ? {
            id: reply.id,
            senderId: reply.sender_id,
            type: reply.type,
            body: reply.deleted_at ? null : reply.body?.slice(0, 160) ?? null,
            mediaUrl: reply.deleted_at || reply.type !== "image" ? null : reply.media_url,
            deleted: Boolean(reply.deleted_at),
          }
        : null,
      reactions: deleted ? [] : reactions.get(row.id) || [],
      editedAt: row.edited_at,
      deletedAt: row.deleted_at,
      createdAt: row.created_at,
    };
  });
}

const Message = {
  TYPES,
  hydrate,

  create({ conversationId, senderId, type = "text", body = null, mediaUrl = null, meta = null, replyToId = null }) {
    const insert = db.transaction(() => {
      const { lastInsertRowid } = stmt.insert.run({
        conversationId,
        senderId,
        type,
        body,
        mediaUrl,
        meta: meta ? JSON.stringify(meta) : null,
        replyToId,
        now: Date.now(),
      });
      stmt.setLast.run(lastInsertRowid, conversationId);
      return lastInsertRowid;
    });
    return Message.findById(insert());
  },

  findRaw: (id) => stmt.byId.get(id),

  findById(id) {
    const row = stmt.byId.get(id);
    return row ? hydrate([row])[0] : null;
  },

  /** Página de mensajes en orden cronológico. `after` oculta los anteriores a "vaciar chat". */
  list(conversationId, { before = Number.MAX_SAFE_INTEGER, after = 0, limit = 50 } = {}) {
    return hydrate(stmt.page.all({ conversationId, before, after, limit }).reverse());
  },

  media(conversationId, after = 0) {
    return hydrate(stmt.media.all(conversationId, after));
  },

  edit(id, body) {
    stmt.edit.run(body, Date.now(), id);
    return Message.findById(id);
  },

  remove(id) {
    stmt.remove.run(Date.now(), id);
    db.prepare("DELETE FROM reactions WHERE message_id = ?").run(id);
    return Message.findById(id);
  },

  /** Misma reacción = quitarla; otra = reemplazarla (una reacción por persona, como WhatsApp). */
  react(messageId, userId, emoji) {
    const current = stmt.reaction.get(messageId, userId);
    if (current?.emoji === emoji) stmt.removeReaction.run(messageId, userId);
    else stmt.addReaction.run(messageId, userId, emoji, Date.now());
    return Message.findById(messageId);
  },
};

module.exports = Message;
