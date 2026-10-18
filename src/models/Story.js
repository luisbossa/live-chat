const db = require("../config/database");
const config = require("../config");
const User = require("./User");

const SQL = {
  insert: "INSERT INTO stories (user_id, media_url, caption, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
  byId: "SELECT * FROM stories WHERE id = ?",
  // Estados vigentes míos y de mis contactos (excepto bloqueados en cualquier sentido)
  feed: `
    SELECT s.*, EXISTS (SELECT 1 FROM story_views v WHERE v.story_id = s.id AND v.viewer_id = @me) AS viewed,
      (SELECT COUNT(*) FROM story_views v WHERE v.story_id = s.id) AS views
    FROM stories s
    WHERE s.expires_at > @now
      AND (s.user_id = @me OR s.user_id IN (
        SELECT DISTINCT other.user_id FROM conversation_members mine
        JOIN conversation_members other ON other.conversation_id = mine.conversation_id
        WHERE mine.user_id = @me
      ))
      AND s.user_id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = @me)
      AND s.user_id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = @me)
    ORDER BY s.created_at`,
  view: "INSERT OR IGNORE INTO story_views (story_id, viewer_id, viewed_at) VALUES (?, ?, ?)",
  viewers: `
    SELECT u.*, v.viewed_at FROM story_views v JOIN users u ON u.id = v.viewer_id
    WHERE v.story_id = ? ORDER BY v.viewed_at DESC`,
  remove: "DELETE FROM stories WHERE id = ? AND user_id = ?",
  purge: "DELETE FROM stories WHERE expires_at <= ?",
};

function serialize(row) {
  return {
    id: row.id,
    userId: row.user_id,
    mediaUrl: row.media_url,
    caption: row.caption,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    viewed: Boolean(row.viewed),
    views: row.views ?? 0,
  };
}

const Story = {
  async create({ userId, mediaUrl, caption = null, createdAt = Date.now() }) {
    const { lastInsertRowid } = await db.run(SQL.insert, [userId, mediaUrl, caption, createdAt, createdAt + config.storyTtl]);
    return serialize(await db.get(SQL.byId, [lastInsertRowid]));
  },

  findById: (id) => db.get(SQL.byId, [id]),

  /** Estados agrupados por autor: primero los míos, luego los no vistos y al final los vistos. */
  async feedFor(userId) {
    const rows = await db.all(SQL.feed, { me: userId, now: Date.now() });
    const authors = await User.findMany(rows.map((r) => r.user_id));
    const groups = new Map();
    rows.forEach((row) => {
      if (!groups.has(row.user_id)) groups.set(row.user_id, { user: User.toPublic(authors.get(row.user_id)), stories: [] });
      groups.get(row.user_id).stories.push(serialize(row));
    });
    return [...groups.values()]
      .map((g) => ({ ...g, allViewed: g.stories.every((s) => s.viewed), lastAt: g.stories.at(-1).createdAt }))
      .sort((a, b) => (b.user.id === userId) - (a.user.id === userId) || a.allViewed - b.allViewed || b.lastAt - a.lastAt);
  },

  view(storyId, viewerId) {
    return db.run(SQL.view, [storyId, viewerId, Date.now()]);
  },

  async viewers(storyId) {
    return (await db.all(SQL.viewers, [storyId])).map((row) => ({ ...User.toPublic(row), viewedAt: row.viewed_at }));
  },

  async remove(storyId, userId) {
    return (await db.run(SQL.remove, [storyId, userId])).changes > 0;
  },

  async purgeExpired() {
    return (await db.run(SQL.purge, [Date.now()])).changes;
  },
};

module.exports = Story;
