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
  WHERE m.user_id = ?`;

const stmt = {
  findDirect: db.prepare(`
    SELECT c.id FROM conversations c
    JOIN conversation_members a ON a.conversation_id = c.id AND a.user_id = @a
    JOIN conversation_members b ON b.conversation_id = c.id AND b.user_id = @b
    WHERE c.type = 'direct'
    LIMIT 1
  `),
  insert: db.prepare(`
    INSERT INTO conversations (type, name, avatar, description, created_by, created_at)
    VALUES (@type, @name, @avatar, @description, @createdBy, @now)
  `),
  addMember: db.prepare(`
    INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, role, joined_at, last_read_id, last_delivered_id, cleared_id)
    VALUES (@conversationId, @userId, @role, @now, @lastId, @lastId, @clearedId)
  `),
  byId: db.prepare("SELECT * FROM conversations WHERE id = ?"),
  member: db.prepare("SELECT * FROM conversation_members WHERE conversation_id = ? AND user_id = ?"),
  memberRows: db.prepare(`
    SELECT m.*, u.* FROM conversation_members m
    JOIN users u ON u.id = m.user_id
    WHERE m.conversation_id = ?
    ORDER BY m.role = 'admin' DESC, u.name COLLATE NOCASE
  `),
  memberIds: db.prepare("SELECT user_id FROM conversation_members WHERE conversation_id = ?"),
  listForUser: db.prepare(`${LIST_SQL} ORDER BY COALESCE((SELECT created_at FROM messages WHERE id = c.last_message_id), c.created_at) DESC`),
  oneForUser: db.prepare(`${LIST_SQL} AND c.id = ?`),
  receipts: db.prepare(`
    UPDATE conversation_members
    SET last_delivered_id = MAX(last_delivered_id, @delivered),
        last_read_id = MAX(last_read_id, @read)
    WHERE conversation_id = @conversationId AND user_id = @userId
  `),
  deliverAll: db.prepare(`
    UPDATE conversation_members
    SET last_delivered_id = (SELECT COALESCE(last_message_id, 0) FROM conversations WHERE id = conversation_id)
    WHERE user_id = ? AND last_delivered_id < (SELECT COALESCE(last_message_id, 0) FROM conversations WHERE id = conversation_id)
    RETURNING conversation_id, last_delivered_id
  `),
  removeMember: db.prepare("DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?"),
  update: db.prepare("UPDATE conversations SET name = COALESCE(@name, name), avatar = COALESCE(@avatar, avatar), description = COALESCE(@description, description) WHERE id = @id"),
};

const MEMBER_FIELDS = ["muted", "pinned", "cleared_id", "role"];

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

const Conversation = {
  findById: (id) => stmt.byId.get(id),
  getMember: (conversationId, userId) => stmt.member.get(conversationId, userId),
  memberIds: (conversationId) => stmt.memberIds.all(conversationId).map((r) => r.user_id),

  findDirect(a, b) {
    return stmt.findDirect.get({ a, b })?.id ?? null;
  },

  /** Devuelve el chat 1 a 1 entre dos usuarios, creándolo si no existe. */
  getOrCreateDirect(a, b) {
    const existing = Conversation.findDirect(a, b);
    if (existing) return { id: existing, created: false };

    const id = db.transaction(() => {
      const { lastInsertRowid } = stmt.insert.run({ type: "direct", name: null, avatar: null, description: null, createdBy: a, now: Date.now() });
      [a, b].forEach((userId) => stmt.addMember.run({ conversationId: lastInsertRowid, userId, role: "member", now: Date.now(), lastId: 0, clearedId: 0 }));
      return lastInsertRowid;
    })();
    return { id, created: true };
  },

  createGroup({ name, avatar = null, description = null, createdBy, memberIds }) {
    return db.transaction(() => {
      const { lastInsertRowid } = stmt.insert.run({ type: "group", name, avatar, description, createdBy, now: Date.now() });
      const unique = [...new Set([createdBy, ...memberIds])];
      unique.forEach((userId) =>
        stmt.addMember.run({ conversationId: lastInsertRowid, userId, role: userId === createdBy ? "admin" : "member", now: Date.now(), lastId: 0, clearedId: 0 })
      );
      return lastInsertRowid;
    })();
  },

  /** Los nuevos miembros no ven el historial anterior a su llegada. */
  addMembers(conversationId, userIds) {
    const lastId = Conversation.findById(conversationId).last_message_id || 0;
    const add = db.transaction(() =>
      userIds.filter((userId) => stmt.addMember.run({ conversationId, userId, role: "member", now: Date.now(), lastId, clearedId: lastId }).changes)
    );
    return add();
  },

  removeMember(conversationId, userId) {
    stmt.removeMember.run(conversationId, userId);
  },

  update(id, { name = null, avatar = null, description = null }) {
    stmt.update.run({ id, name, avatar, description });
  },

  updateMember(conversationId, userId, fields) {
    const entries = Object.entries(fields).filter(([key]) => MEMBER_FIELDS.includes(key));
    if (!entries.length) return;
    const sets = entries.map(([key]) => `${key} = @${key}`).join(", ");
    db.prepare(`UPDATE conversation_members SET ${sets} WHERE conversation_id = @conversationId AND user_id = @userId`).run({
      ...Object.fromEntries(entries),
      conversationId,
      userId,
    });
  },

  updateReceipts(conversationId, userId, { delivered = 0, read = 0 }) {
    stmt.receipts.run({ conversationId, userId, delivered: Math.max(delivered, read), read });
    return Conversation.getMember(conversationId, userId);
  },

  /** Al conectarse, todo lo pendiente pasa a "entregado". */
  markAllDelivered(userId) {
    return stmt.deliverAll.all(userId).map((r) => ({ conversationId: r.conversation_id, deliveredId: r.last_delivered_id }));
  },

  members(conversationId, viewer) {
    return stmt.memberRows.all(conversationId).map((row) => memberView(row, viewer));
  },

  /** Conversación lista para el cliente, vista por `viewer` (fila completa del usuario). */
  serialize(row, viewer) {
    const lastMessage = row.last_message_id && row.last_message_id > row.cleared_id ? Message.findById(row.last_message_id) : null;
    return {
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
      lastMessage,
      members: Conversation.members(row.id, viewer),
    };
  },

  listForUser(viewer) {
    return stmt.listForUser.all(viewer.id).map((row) => Conversation.serialize(row, viewer));
  },

  /** Una sola conversación con los datos de membresía de `viewer`. */
  getForUser(conversationId, viewer) {
    const row = stmt.oneForUser.get(viewer.id, conversationId);
    return row ? Conversation.serialize(row, viewer) : null;
  },
};

module.exports = Conversation;
