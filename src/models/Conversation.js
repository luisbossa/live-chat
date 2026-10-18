const db = require("../config/database");
const User = require("./User");
const Message = require("./Message");

// Conversaciones de un usuario con su estado de membresía y número de no leídos
const LIST_SQL = `
  SELECT c.*, m.role, m.last_read_id, m.cleared_id, m.muted, m.pinned,
    (SELECT COUNT(*) FROM messages x
      WHERE x.conversation_id = c.id
        AND x.id > m.last_read_id AND x.id > m.cleared_id
        AND x.deleted_at IS NULL AND x.type <> 'system'
        AND (x.sender_id IS NULL OR x.sender_id <> m.user_id)) AS unread
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
  deliverAll: `
    UPDATE conversation_members
    SET last_delivered_id = (SELECT COALESCE(last_message_id, 0) FROM conversations WHERE id = conversation_id)
    WHERE user_id = ? AND last_delivered_id < (SELECT COALESCE(last_message_id, 0) FROM conversations WHERE id = conversation_id)
    RETURNING conversation_id, last_delivered_id`,
  removeMember: "DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?",
  // "Eliminar chat": oculta la conversación y su historial solo para ese usuario
  hide: `
    UPDATE conversation_members
    SET hidden = 1, pinned = 0, cleared_id = @lastId, last_read_id = MAX(last_read_id, @lastId), last_delivered_id = MAX(last_delivered_id, @lastId)
    WHERE conversation_id = @conversationId AND user_id = @userId`,
  update: "UPDATE conversations SET name = COALESCE(@name, name), avatar = COALESCE(@avatar, avatar), description = COALESCE(@description, description) WHERE id = @id",
};

const MEMBER_FIELDS = ["muted", "pinned", "cleared_id", "role", "hidden"];
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

/** Filas de conversación → objetos para el cliente, con 2 consultas extra en total (no por chat). */
async function serializeAll(rows, viewer) {
  if (!rows.length) return [];
  const lastIds = rows.filter((r) => r.last_message_id && r.last_message_id > r.cleared_id).map((r) => r.last_message_id);
  const [lastMessages, members] = await Promise.all([Message.findMany(lastIds), membersOf(rows.map((r) => r.id))]);

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
    unread: row.unread || 0,
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

  async updateReceipts(conversationId, userId, { delivered = 0, read = 0 }) {
    await db.run(SQL.receipts, { conversationId, userId, delivered: Math.max(delivered, read), read });
    return Conversation.getMember(conversationId, userId);
  },

  /** Al conectarse, todo lo pendiente pasa a "entregado". */
  async markAllDelivered(userId) {
    return (await db.all(SQL.deliverAll, [userId])).map((r) => ({ conversationId: r.conversation_id, deliveredId: r.last_delivered_id }));
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
