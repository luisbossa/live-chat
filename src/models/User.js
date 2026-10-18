const bcrypt = require("bcryptjs");
const db = require("../config/database");
const config = require("../config");
const presence = require("../services/presence");

const DEFAULT_AVATAR = "/assets/images/ui/avatar-default.svg";

const stmt = {
  insert: db.prepare(`
    INSERT INTO users (name, username, email, password_hash, avatar, phone, bio, balance_cents, created_at)
    VALUES (@name, @username, @email, @passwordHash, @avatar, @phone, COALESCE(@bio, 'Hola, estoy usando Yabla 👋'), @balance, @now)
  `),
  byId: db.prepare("SELECT * FROM users WHERE id = ?"),
  byEmail: db.prepare("SELECT * FROM users WHERE email = ?"),
  byUsername: db.prepare("SELECT * FROM users WHERE username = ?"),
  byLogin: db.prepare("SELECT * FROM users WHERE email = ? OR username = ?"),
  search: db.prepare(`
    SELECT * FROM users
    WHERE id <> @me AND (name LIKE @q OR username LIKE @q)
    ORDER BY name COLLATE NOCASE
    LIMIT @limit
  `),
  touchLastSeen: db.prepare("UPDATE users SET last_seen = ? WHERE id = ?"),
  // Usuarios con los que comparto al menos una conversación
  contactIds: db.prepare(`
    SELECT DISTINCT other.user_id AS id
    FROM conversation_members mine
    JOIN conversation_members other ON other.conversation_id = mine.conversation_id
    WHERE mine.user_id = ? AND other.user_id <> mine.user_id
  `),
  isBlocked: db.prepare(`
    SELECT 1 FROM blocks
    WHERE (blocker_id = @a AND blocked_id = @b) OR (blocker_id = @b AND blocked_id = @a)
  `),
  blockedByMe: db.prepare("SELECT blocked_id AS id FROM blocks WHERE blocker_id = ?"),
  block: db.prepare("INSERT OR IGNORE INTO blocks (blocker_id, blocked_id, created_at) VALUES (?, ?, ?)"),
  unblock: db.prepare("DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?"),
};

const EDITABLE = ["name", "username", "bio", "phone", "avatar"];
const SETTINGS = { readReceipts: "read_receipts", showLastSeen: "show_last_seen" };

const User = {
  DEFAULT_AVATAR,

  create({ name, username, email, password, avatar = null, phone = null, bio = null }) {
    const { lastInsertRowid } = stmt.insert.run({
      name,
      username,
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      avatar,
      phone,
      bio,
      balance: config.initialBalanceCents,
      now: Date.now(),
    });
    return User.findById(lastInsertRowid);
  },

  findById: (id) => stmt.byId.get(id),
  findByEmail: (email) => stmt.byEmail.get(email),
  findByUsername: (username) => stmt.byUsername.get(username),
  findByLogin: (login) => stmt.byLogin.get(login, login),

  verifyPassword(user, password) {
    return Boolean(user) && bcrypt.compareSync(password, user.password_hash);
  },

  search(meId, query, limit = 20) {
    return stmt.search.all({ me: meId, q: `%${query}%`, limit });
  },

  update(id, fields) {
    const entries = Object.entries(fields).filter(([key, value]) => EDITABLE.includes(key) && value !== undefined);
    if (entries.length) {
      const sets = entries.map(([key]) => `${key} = @${key}`).join(", ");
      db.prepare(`UPDATE users SET ${sets} WHERE id = @id`).run({ ...Object.fromEntries(entries), id });
    }
    return User.findById(id);
  },

  updateSettings(id, settings) {
    const entries = Object.entries(settings).filter(([key]) => key in SETTINGS);
    if (entries.length) {
      const sets = entries.map(([key]) => `${SETTINGS[key]} = @${key}`).join(", ");
      const values = Object.fromEntries(entries.map(([key, value]) => [key, value ? 1 : 0]));
      db.prepare(`UPDATE users SET ${sets} WHERE id = @id`).run({ ...values, id });
    }
    return User.findById(id);
  },

  touchLastSeen(id, at = Date.now()) {
    stmt.touchLastSeen.run(at, id);
  },

  contactIds: (id) => stmt.contactIds.all(id).map((row) => row.id),

  isBlocked: (a, b) => Boolean(stmt.isBlocked.get({ a, b })),
  blockedIds: (id) => stmt.blockedByMe.all(id).map((row) => row.id),

  toggleBlock(blockerId, blockedId) {
    if (stmt.unblock.run(blockerId, blockedId).changes) return false;
    stmt.block.run(blockerId, blockedId, Date.now());
    return true;
  },

  /** Datos visibles para otros usuarios (sin correo ni contraseña). */
  toPublic(user) {
    if (!user) return null;
    const online = presence.isOnline(user.id);
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar || DEFAULT_AVATAR,
      bio: user.bio,
      phone: user.phone,
      online,
      lastSeen: user.show_last_seen ? user.last_seen : null,
    };
  },

  /** Datos completos del usuario conectado. */
  toSelf(user) {
    return {
      ...User.toPublic(user),
      email: user.email,
      balanceCents: user.balance_cents,
      settings: { readReceipts: Boolean(user.read_receipts), showLastSeen: Boolean(user.show_last_seen) },
    };
  },
};

module.exports = User;
