const db = require("../config/database");
const User = require("./User");
const Message = require("./Message");

// Conversaciones de un usuario con su estado de membresía, no leídos y menciones sin leer
const UNREAD_WHERE = `
  x.conversation_id = c.id
  AND x.id > m.last_read_id AND x.id > m.cleared_id
  AND x.deleted_at IS NULL AND x.type <> 'system'
  AND (x.expires_at IS NULL OR x.expires_at > CAST(strftime('%s', 'now') AS INTEGER) * 1000)
  AND (x.sender_id IS NULL OR x.sender_id <> m.user_id)`;

const LIST_SQL = `
  SELECT c.*, m.role, m.last_read_id, m.cleared_id, m.muted, m.pinned, m.archived,
    (SELECT COUNT(*) FROM messages x WHERE ${UNREAD_WHERE}) AS unread,
    (SELECT COUNT(*) FROM messages x, json_each(x.meta, '$.mentions') j WHERE ${UNREAD_WHERE} AND j.value = m.user_id) AS mentions
  FROM conversation_members m
  JOIN conversations c ON c.id = m.conversation_id
  WHERE m.user_id = ? AND m.hidden = 0`;

const SQL = {
  findDirect: `
    SELECT c.id FROM conversations c
    JOIN conversation_members a ON a.conversation_id = c.id AND a.user_id = @a
    JOIN conversation_members b ON b.conversation_id = c.id AND b.user_id = @b
    WHERE c.type = 'direct'
    LIMIT 1`,
  insert: `
    INSERT INTO conversations (type, name, avatar, description, created_by, created_at)
    VALUES (@type, @name, @avatar, @description, @createdBy, @now)`,
  addMember: `
    INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, role, joined_at, last_read_id, last_delivered_id, cleared_id)
    VALUES (@conversationId, @userId, @role, @now, @lastId, @lastId, @clearedId)`,
  byId: "SELECT * FROM conversations WHERE id = ?",
  member: "SELECT * FROM conversation_members WHERE conversation_id = ? AND user_id = ?",
  memberIds: "SELECT user_id FROM conversation_members WHERE conversation_id = ?",
  listForUser: `${LIST_SQL} ORDER BY COALESCE((SELECT created_at FROM messages WHERE id = c.last_message_id), c.created_at) DESC`,
  oneForUser: `${LIST_SQL} AND c.id = ?`,
  receipts: `
    UPDATE conversation_members
    SET last_delivered_id = MAX(last_delivered_id, @delivered),
        last_read_id = MAX(last_read_id, @read)
    WHERE conversation_id = @conversationId AND user_id = @userId`,
  receiptEvent: "INSERT INTO receipt_events (conversation_id, user_id, kind, up_to_id, at) VALUES (?, ?, ?, ?, ?)",
  setDisappearing: "UPDATE conversations SET disappear_after = ? WHERE id = ?",
  pinnedFor: (n) => `
    SELECT p.conversation_id, p.pinned_by, p.pinned_at, x.*
    FROM pinned_messages p JOIN messages x ON x.id = p.message_id
    WHERE p.conversation_id IN (${placeholders(n)}) AND x.deleted_at IS NULL
    ORDER BY p.pinned_at`,
  scheduledCount: (n) => `
    SELECT conversation_id, COUNT(*) AS n FROM scheduled_messages
    WHERE sender_id = ? AND conversation_id IN (${placeholders(n)})
    GROUP BY conversation_id`,
  deliverAll: `
    UPDATE conversation_members
    SET last_delivered_id = (SELECT COALESCE(last_message_id, 0) FROM conversations WHERE id = conversation_id)
    WHERE user_id = ? AND last_delivered_id < (SELECT COALESCE(last_message_id, 0) FROM conversations WHERE id = conversation_id)
    RETURNING conversation_id, last_delivered_id`,
  removeMember: "DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?",
  // "Eliminar chat": oculta la conversación y su historial solo para ese usuario
  hide: `
    UPDATE conversation_members
    SET hidden = 1, pinned = 0, archived = 0, cleared_id = @lastId, last_read_id = MAX(last_read_id, @lastId), last_delivered_id = MAX(last_delivered_id, @lastId)
    WHERE conversation_id = @conversationId AND user_id = @userId`,
  update: "UPDATE conversations SET name = COALESCE(@name, name), avatar = COALESCE(@avatar, avatar), description = COALESCE(@description, description) WHERE id = @id",
};

const MEMBER_FIELDS = ["muted", "pinned", "archived", "cleared_id", "role", "hidden"];
const placeholders = (n) => Array(n).fill("?").join(",");

/** Miembro tal como lo ve `viewer`: oculta las lecturas si alguno desactivó las confirmaciones. */
function memberView(row, viewer) {
  const showRead = row.user_id === viewer.id || (row.read_receipts && viewer.read_receipts);
  return {
    ...User.toPublic(row),
    id: row.user_id,
    role: row.role,
    lastReadId: showRead ? row.last_read_id : 0,
    lastDeliveredId: Math.max(row.last_delivered_id, showRead ? row.last_read_id : 0),
  };
}

/** Miembros (con datos de usuario) de varias conversaciones en una sola consulta. */
async function membersOf(conversationIds) {
  const grouped = new Map(conversationIds.map((id) => [id, []]));
  if (!conversationIds.length) return grouped;
  const rows = await db.all(
    `SELECT m.conversation_id, m.user_id, m.role, m.last_read_id, m.last_delivered_id, u.*
     FROM conversation_members m
     JOIN users u ON u.id = m.user_id
     WHERE m.conversation_id IN (${placeholders(conversationIds.length)})
     ORDER BY m.role = 'admin' DESC, u.name COLLATE NOCASE`,
    conversationIds
  );
  rows.forEach((row) => grouped.get(row.conversation_id).push(row));
  return grouped;
}

/** Mensajes fijados de varias conversaciones → Map(conversationId → [{ ...mensaje, pinnedBy, pinnedAt }]). */
async function pinnedOf(rows) {
  const grouped = new Map(rows.map((r) => [r.id, []]));
  if (!rows.length) return grouped;
  const now = Date.now();
  const cleared = new Map(rows.map((r) => [r.id, r.cleared_id || 0]));
  const pins = (await db.all(SQL.pinnedFor(rows.length), rows.map((r) => r.id))).filter(
    (p) => p.id > cleared.get(p.conversation_id) && (!p.expires_at || p.expires_at > now)
  );
  const hydrated = await Message.hydrate(pins);
  pins.forEach((p, i) => grouped.get(p.conversation_id).push({ ...hydrated[i], pinnedBy: p.pinned_by, pinnedAt: p.pinned_at }));
  return grouped;
}

async function scheduledOf(rows, viewer) {
  if (!rows.length) return new Map();
  const counts = await db.all(SQL.scheduledCount(rows.length), [viewer.id, ...rows.map((r) => r.id)]);
  return new Map(counts.map((c) => [c.conversation_id, c.n]));
}

/** Filas de conversación → objetos para el cliente, con unas pocas consultas en total (no por chat). */
async function serializeAll(rows, viewer) {
  if (!rows.length) return [];
  const lastIds = rows.filter((r) => r.last_message_id && r.last_message_id > r.cleared_id).map((r) => r.last_message_id);
  const [lastMessages, members, pinned, scheduled] = await Promise.all([
    Message.findMany(lastIds),
    membersOf(rows.map((r) => r.id)),
    pinnedOf(rows),
    scheduledOf(rows, viewer),
  ]);

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    name: row.name,
    avatar: row.avatar,
    description: row.description,
    createdBy: row.created_by,
    createdAt: row.created_at,
    role: row.role,
    muted: Boolean(row.muted),
    pinned: Boolean(row.pinned),
    archived: Boolean(row.archived),
    unread: row.unread || 0,
    mentions: row.mentions || 0,
    disappearAfter: row.disappear_after || 0,
    pinnedMessages: pinned.get(row.id),
    scheduledCount: scheduled.get(row.id) || 0,
    clearedId: row.cleared_id || 0,
    lastMessage: lastMessages.get(row.last_message_id) || null,
    members: members.get(row.id).map((m) => memberView(m, viewer)),
  }));
}

const Conversation = {
  findById: (id) => db.get(SQL.byId, [id]),
  getMember: (conversationId, userId) => db.get(SQL.member, [conversationId, userId]),

  async memberIds(conversationId) {
    return (await db.all(SQL.memberIds, [conversationId])).map((r) => r.user_id);
  },

  async findDirect(a, b) {
    return (await db.get(SQL.findDirect, { a, b }))?.id ?? null;
  },

  /** Devuelve el chat 1 a 1 entre dos usuarios, creándolo si no existe. */
  async getOrCreateDirect(a, b) {
    const existing = await Conversation.findDirect(a, b);
    if (existing) return { id: existing, created: false };

    const id = await db.transaction(async (tx) => {
      const now = Date.now();
      const { lastInsertRowid } = await tx.run(SQL.insert, { type: "direct", name: null, avatar: null, description: null, createdBy: a, now });
      for (const userId of [a, b]) {
        await tx.run(SQL.addMember, { conversationId: lastInsertRowid, userId, role: "member", now, lastId: 0, clearedId: 0 });
      }
      return lastInsertRowid;
    });
    return { id, created: true };
  },

  createGroup({ name, avatar = null, description = null, createdBy, memberIds }) {
    return db.transaction(async (tx) => {
      const now = Date.now();
      const { lastInsertRowid } = await tx.run(SQL.insert, { type: "group", name, avatar, description, createdBy, now });
      for (const userId of [...new Set([createdBy, ...memberIds])]) {
        await tx.run(SQL.addMember, { conversationId: lastInsertRowid, userId, role: userId === createdBy ? "admin" : "member", now, lastId: 0, clearedId: 0 });
      }
      return lastInsertRowid;
    });
  },

  /** Los nuevos miembros no ven el historial anterior a su llegada. */
  async addMembers(conversationId, userIds) {
    const lastId = (await Conversation.findById(conversationId)).last_message_id || 0;
    return db.transaction(async (tx) => {
      const added = [];
      for (const userId of userIds) {
        const { changes } = await tx.run(SQL.addMember, { conversationId, userId, role: "member", now: Date.now(), lastId, clearedId: lastId });
        if (changes) added.push(userId);
      }
      return added;
    });
  },

  hide(conversationId, userId, lastId) {
    return db.run(SQL.hide, { conversationId, userId, lastId });
  },

  removeMember(conversationId, userId) {
    return db.run(SQL.removeMember, [conversationId, userId]);
  },

  update(id, { name = null, avatar = null, description = null }) {
    return db.run(SQL.update, { id, name, avatar, description });
  },

  async updateMember(conversationId, userId, fields) {
    const entries = Object.entries(fields).filter(([key]) => MEMBER_FIELDS.includes(key));
    if (!entries.length) return;
    const sets = entries.map(([key]) => `${key} = @${key}`).join(", ");
    await db.run(`UPDATE conversation_members SET ${sets} WHERE conversation_id = @conversationId AND user_id = @userId`, {
      ...Object.fromEntries(entries),
      conversationId,
      userId,
    });
  },

  /** Avanza entregado/leído y guarda el momento (para "Info del mensaje"). `at` permite fechas pasadas (datos demo). */
  async updateReceipts(conversationId, userId, { delivered = 0, read = 0, at = Date.now() }) {
    const before = await Conversation.getMember(conversationId, userId);
    await db.run(SQL.receipts, { conversationId, userId, delivered: Math.max(delivered, read), read });
    const after = await Conversation.getMember(conversationId, userId);
    if (before && after) {
      const events = [];
      if (after.last_delivered_id > before.last_delivered_id) events.push([SQL.receiptEvent, [conversationId, userId, "delivered", after.last_delivered_id, at]]);
      if (after.last_read_id > before.last_read_id) events.push([SQL.receiptEvent, [conversationId, userId, "read", after.last_read_id, at]]);
      if (events.length) await db.batch(events);
    }
    return after;
  },

  /** Al conectarse, todo lo pendiente pasa a "entregado". */
  async markAllDelivered(userId) {
    const rows = await db.all(SQL.deliverAll, [userId]);
    const now = Date.now();
    if (rows.length) await db.batch(rows.map((r) => [SQL.receiptEvent, [r.conversation_id, userId, "delivered", r.last_delivered_id, now]]));
    return rows.map((r) => ({ conversationId: r.conversation_id, deliveredId: r.last_delivered_id }));
  },

  setDisappearing(conversationId, seconds) {
    return db.run(SQL.setDisappearing, [seconds, conversationId]);
  },

  /** Fija o desfija un mensaje. Devuelve "pinned", "unpinned" o "full" (ya hay 3). */
  async togglePin(conversationId, messageId, userId) {
    const existing = await db.get("SELECT 1 AS ok FROM pinned_messages WHERE conversation_id = ? AND message_id = ?", [conversationId, messageId]);
    if (existing) {
      await db.run("DELETE FROM pinned_messages WHERE conversation_id = ? AND message_id = ?", [conversationId, messageId]);
      return "unpinned";
    }
    const { n } = await db.get("SELECT COUNT(*) AS n FROM pinned_messages WHERE conversation_id = ?", [conversationId]);
    if (n >= 3) return "full";
    await db.run("INSERT INTO pinned_messages (conversation_id, message_id, pinned_by, pinned_at) VALUES (?, ?, ?, ?)", [conversationId, messageId, userId, Date.now()]);
    return "pinned";
  },

  async members(conversationId, viewer) {
    return (await membersOf([conversationId])).get(conversationId).map((row) => memberView(row, viewer));
  },

  async listForUser(viewer) {
    return serializeAll(await db.all(SQL.listForUser, [viewer.id]), viewer);
  },

  /** Una sola conversación con los datos de membresía de `viewer`. */
  async getForUser(conversationId, viewer) {
    const row = await db.get(SQL.oneForUser, [viewer.id, conversationId]);
    return row ? (await serializeAll([row], viewer))[0] : null;
  },
};

module.exports = Conversation;
