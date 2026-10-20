const db = require("../config/database");

const TYPES = ["text", "image", "file", "audio", "sticker", "call", "payment", "system"];

// Mensajes visibles para un usuario: sin los caducados (temporales) ni los que eliminó para sí
const VISIBLE = `
  (expires_at IS NULL OR expires_at > @now)
  AND id NOT IN (SELECT message_id FROM message_hidden WHERE user_id = @viewerId)`;

const SQL = {
  // Si el chat tiene mensajes temporales, el mensaje caduca a los N segundos (salvo los de sistema)
  insert: `
    INSERT INTO messages (conversation_id, sender_id, type, body, media_url, meta, reply_to_id, created_at, expires_at)
    VALUES (@conversationId, @senderId, @type, @body, @mediaUrl, @meta, @replyToId, @now,
      CASE WHEN @type = 'system' THEN NULL ELSE
        (SELECT CASE WHEN disappear_after > 0 THEN @now + disappear_after * 1000 END FROM conversations WHERE id = @conversationId)
      END)`,
  setLastInserted: "UPDATE conversations SET last_message_id = last_insert_rowid() WHERE id = ?",
  // Un mensaje nuevo hace reaparecer el chat a quien lo había eliminado
  unhide: "UPDATE conversation_members SET hidden = 0 WHERE conversation_id = ? AND hidden = 1",
  byId: "SELECT * FROM messages WHERE id = ?",
  page: `
    SELECT * FROM messages
    WHERE conversation_id = @conversationId AND id > @after AND id < @before AND ${VISIBLE}
    ORDER BY id DESC
    LIMIT @limit`,
  edit: "UPDATE messages SET body = ?, edited_at = ? WHERE id = ?",
  remove: "UPDATE messages SET deleted_at = ?, body = NULL, media_url = NULL, meta = NULL WHERE id = ?",
  removeReactions: "DELETE FROM reactions WHERE message_id = ?",
  unpin: "DELETE FROM pinned_messages WHERE message_id = ?",
  reaction: "SELECT emoji FROM reactions WHERE message_id = ? AND user_id = ?",
  addReaction: `
    INSERT INTO reactions (message_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?)
    ON CONFLICT (message_id, user_id) DO UPDATE SET emoji = excluded.emoji, created_at = excluded.created_at`,
  removeReaction: "DELETE FROM reactions WHERE message_id = ? AND user_id = ?",
  media: `
    SELECT * FROM messages
    WHERE conversation_id = @conversationId AND id > @after AND deleted_at IS NULL AND ${VISIBLE}
      AND (type IN ('image', 'video', 'file', 'audio') OR (type = 'text' AND body LIKE '%http%'))
    ORDER BY id DESC LIMIT 120`,
  hide: "INSERT OR IGNORE INTO message_hidden (user_id, message_id) VALUES (?, ?)",
  // Primer momento en que cada miembro llegó (entregado / leído) hasta este mensaje
  receiptTimes: `
    SELECT user_id, kind, MIN(at) AS at FROM receipt_events
    WHERE conversation_id = ? AND up_to_id >= ?
    GROUP BY user_id, kind`,
  // Temporales: borra los caducados y corrige el "último mensaje" de esos chats
  expired: "SELECT id, conversation_id FROM messages WHERE expires_at IS NOT NULL AND expires_at <= ? LIMIT 500",
  fixLast: `
    UPDATE conversations SET last_message_id = (SELECT MAX(id) FROM messages WHERE conversation_id = conversations.id)
    WHERE id = ?`,
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
      expiresAt: row.expires_at || null,
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

  /** Página de mensajes en orden cronológico para `viewerId`. `after` oculta los anteriores a "vaciar chat". */
  async list(conversationId, { before = Number.MAX_SAFE_INTEGER, after = 0, limit = 50, viewerId = 0 } = {}) {
    return hydrate((await db.all(SQL.page, { conversationId, before, after, limit, viewerId, now: Date.now() })).reverse());
  },

  /** Fotos, documentos, audios y mensajes con enlaces (panel de información). */
  async media(conversationId, after = 0, viewerId = 0) {
    return hydrate(await db.all(SQL.media, { conversationId, after, viewerId, now: Date.now() }));
  },

  async edit(id, body) {
    await db.run(SQL.edit, [body, Date.now(), id]);
    return Message.findById(id);
  },

  async remove(id) {
    await db.batch([
      [SQL.remove, [Date.now(), id]],
      [SQL.removeReactions, [id]],
      [SQL.unpin, [id]],
    ]);
    return Message.findById(id);
  },

  /** Reemplaza el meta (juegos y propuestas de cita guardan aquí su estado). */
  async updateMeta(id, meta) {
    await db.run("UPDATE messages SET meta = ? WHERE id = ?", [JSON.stringify(meta), id]);
    return Message.findById(id);
  },

  /** "Eliminar para mí". */
  async hideFor(userId, ids) {
    if (!ids.length) return;
    await db.batch(ids.map((id) => [SQL.hide, [userId, id]]));
  },

  /** Misma reacción = quitarla; otra = reemplazarla (una reacción por persona, como WhatsApp). */
  async react(messageId, userId, emoji) {
    const current = await db.get(SQL.reaction, [messageId, userId]);
    if (current?.emoji === emoji) await db.run(SQL.removeReaction, [messageId, userId]);
    else await db.run(SQL.addReaction, [messageId, userId, emoji, Date.now()]);
    return Message.findById(messageId);
  },

  /** Map(userId → { deliveredAt, readAt }) para "Info del mensaje". */
  async receiptTimes(conversationId, messageId) {
    const times = new Map();
    for (const { user_id, kind, at } of await db.all(SQL.receiptTimes, [conversationId, messageId])) {
      const t = times.get(user_id) || {};
      t[kind === "read" ? "readAt" : "deliveredAt"] = at;
      times.set(user_id, t);
    }
    return times;
  },

  /** Borra los mensajes temporales caducados. Devuelve [{ conversationId, ids }]. */
  async purgeExpired(now = Date.now()) {
    const rows = await db.all(SQL.expired, [now]);
    if (!rows.length) return [];
    const byConv = new Map();
    rows.forEach((r) => byConv.set(r.conversation_id, [...(byConv.get(r.conversation_id) || []), r.id]));
    const ids = rows.map((r) => r.id);
    await db.batch([
      [`DELETE FROM messages WHERE id IN (${placeholders(ids.length)})`, ids],
      ...[...byConv.keys()].map((cid) => [SQL.fixLast, [cid]]),
    ]);
    return [...byConv].map(([conversationId, list]) => ({ conversationId, ids: list }));
  },
};

module.exports = Message;
