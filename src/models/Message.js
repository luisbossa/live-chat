const db = require("../config/database");

const TYPES = ["text", "image", "file", "audio", "sticker", "call", "payment", "system"];

const SQL = {
  insert: `
    INSERT INTO messages (conversation_id, sender_id, type, body, media_url, meta, reply_to_id, created_at)
    VALUES (@conversationId, @senderId, @type, @body, @mediaUrl, @meta, @replyToId, @now)`,
  setLastInserted: "UPDATE conversations SET last_message_id = last_insert_rowid() WHERE id = ?",
  // Un mensaje nuevo hace reaparecer el chat a quien lo había eliminado
  unhide: "UPDATE conversation_members SET hidden = 0 WHERE conversation_id = ? AND hidden = 1",
  byId: "SELECT * FROM messages WHERE id = ?",
  page: `
    SELECT * FROM messages
    WHERE conversation_id = @conversationId AND id > @after AND id < @before
    ORDER BY id DESC
    LIMIT @limit`,
  edit: "UPDATE messages SET body = ?, edited_at = ? WHERE id = ?",
  remove: "UPDATE messages SET deleted_at = ?, body = NULL, media_url = NULL, meta = NULL WHERE id = ?",
  removeReactions: "DELETE FROM reactions WHERE message_id = ?",
  reaction: "SELECT emoji FROM reactions WHERE message_id = ? AND user_id = ?",
  addReaction: `
    INSERT INTO reactions (message_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?)
    ON CONFLICT (message_id, user_id) DO UPDATE SET emoji = excluded.emoji, created_at = excluded.created_at`,
  removeReaction: "DELETE FROM reactions WHERE message_id = ? AND user_id = ?",
  media: `
    SELECT * FROM messages
    WHERE conversation_id = ? AND id > ? AND deleted_at IS NULL AND type IN ('image', 'file', 'audio')
    ORDER BY id DESC LIMIT 60`,
};

const placeholders = (n) => Array(n).fill("?").join(",");

function parseMeta(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Convierte filas de la BD en objetos para el cliente, con reacciones y respuesta citada (2 consultas por lote). */
async function hydrate(rows) {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const replyIds = [...new Set(rows.map((r) => r.reply_to_id).filter(Boolean))];

  const [reactionRows, replyRows] = await Promise.all([
    db.all(`SELECT message_id, user_id, emoji FROM reactions WHERE message_id IN (${placeholders(ids.length)}) ORDER BY created_at`, ids),
    replyIds.length ? db.all(`SELECT * FROM messages WHERE id IN (${placeholders(replyIds.length)})`, replyIds) : [],
  ]);

  const reactions = new Map();
  reactionRows.forEach(({ message_id, user_id, emoji }) => {
    const list = reactions.get(message_id) || [];
    const group = list.find((r) => r.emoji === emoji);
    if (group) group.userIds.push(user_id);
    else list.push({ emoji, userIds: [user_id] });
    reactions.set(message_id, list);
  });
  const replies = new Map(replyRows.map((r) => [r.id, r]));

  return rows.map((row) => {
    const reply = replies.get(row.reply_to_id);
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
      reactions: row.deleted_at ? [] : reactions.get(row.id) || [],
      editedAt: row.edited_at,
      deletedAt: row.deleted_at,
      createdAt: row.created_at,
    };
  });
}

const Message = {
  TYPES,
  hydrate,

  async create({ conversationId, senderId, type = "text", body = null, mediaUrl = null, meta = null, replyToId = null, createdAt = Date.now() }) {
    // Insertar y marcar como último mensaje en una sola petición atómica
    const [{ lastInsertRowid: id }] = await db.batch([
      [SQL.insert, { conversationId, senderId, type, body, mediaUrl, meta: meta ? JSON.stringify(meta) : null, replyToId, now: createdAt }],
      [SQL.setLastInserted, [conversationId]],
      [SQL.unhide, [conversationId]],
    ]);
    return Message.findById(id);
  },

  findRaw: (id) => db.get(SQL.byId, [id]),

  async findById(id) {
    const row = await db.get(SQL.byId, [id]);
    return row ? (await hydrate([row]))[0] : null;
  },

  /** Varios mensajes por id en una consulta → Map(id → mensaje). */
  async findMany(ids) {
    const unique = [...new Set(ids)].filter(Boolean);
    if (!unique.length) return new Map();
    const rows = await db.all(`SELECT * FROM messages WHERE id IN (${placeholders(unique.length)})`, unique);
    return new Map((await hydrate(rows)).map((m) => [m.id, m]));
  },

  /** Página de mensajes en orden cronológico. `after` oculta los anteriores a "vaciar chat". */
  async list(conversationId, { before = Number.MAX_SAFE_INTEGER, after = 0, limit = 50 } = {}) {
    return hydrate((await db.all(SQL.page, { conversationId, before, after, limit })).reverse());
  },

  async media(conversationId, after = 0) {
    return hydrate(await db.all(SQL.media, [conversationId, after]));
  },

  async edit(id, body) {
    await db.run(SQL.edit, [body, Date.now(), id]);
    return Message.findById(id);
  },

  async remove(id) {
    await db.batch([
      [SQL.remove, [Date.now(), id]],
      [SQL.removeReactions, [id]],
    ]);
    return Message.findById(id);
  },

  /** Misma reacción = quitarla; otra = reemplazarla (una reacción por persona, como WhatsApp). */
  async react(messageId, userId, emoji) {
    const current = await db.get(SQL.reaction, [messageId, userId]);
    if (current?.emoji === emoji) await db.run(SQL.removeReaction, [messageId, userId]);
    else await db.run(SQL.addReaction, [messageId, userId, emoji, Date.now()]);
    return Message.findById(messageId);
  },
};

module.exports = Message;
