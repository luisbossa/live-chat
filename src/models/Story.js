const db = require("../config/database");
const config = require("../config");
const User = require("./User");

const stmt = {
  insert: db.prepare("INSERT INTO stories (user_id, media_url, caption, created_at, expires_at) VALUES (?, ?, ?, ?, ?)"),
  byId: db.prepare("SELECT * FROM stories WHERE id = ?"),
  // Estados vigentes míos y de mis contactos (excepto bloqueados en cualquier sentido)
  feed: db.prepare(`
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
    ORDER BY s.created_at
  `),
  view: db.prepare("INSERT OR IGNORE INTO story_views (story_id, viewer_id, viewed_at) VALUES (?, ?, ?)"),
  viewers: db.prepare(`
    SELECT u.*, v.viewed_at FROM story_views v JOIN users u ON u.id = v.viewer_id
    WHERE v.story_id = ? ORDER BY v.viewed_at DESC
  `),
  remove: db.prepare("DELETE FROM stories WHERE id = ? AND user_id = ?"),
  purge: db.prepare("DELETE FROM stories WHERE expires_at <= ?"),
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
  create({ userId, mediaUrl, caption = null }) {
    const now = Date.now();
    const { lastInsertRowid } = stmt.insert.run(userId, mediaUrl, caption, now, now + config.storyTtl);
    return serialize(stmt.byId.get(lastInsertRowid));
  },

  findById: (id) => stmt.byId.get(id),

  /** Estados agrupados por autor: primero los míos, luego los no vistos y al final los vistos. */
  feedFor(userId) {
    const groups = new Map();
    stmt.feed.all({ me: userId, now: Date.now() }).forEach((row) => {
      if (!groups.has(row.user_id)) groups.set(row.user_id, { user: User.toPublic(User.findById(row.user_id)), stories: [] });
      groups.get(row.user_id).stories.push(serialize(row));
    });
    return [...groups.values()]
      .map((g) => ({ ...g, allViewed: g.stories.every((s) => s.viewed), lastAt: g.stories.at(-1).createdAt }))
      .sort((a, b) => (b.user.id === userId) - (a.user.id === userId) || a.allViewed - b.allViewed || b.lastAt - a.lastAt);
  },

  view(storyId, viewerId) {
    stmt.view.run(storyId, viewerId, Date.now());
  },

  viewers(storyId) {
    return stmt.viewers.all(storyId).map((row) => ({ ...User.toPublic(row), viewedAt: row.viewed_at }));
  },

  remove(storyId, userId) {
    return stmt.remove.run(storyId, userId).changes > 0;
  },

  purgeExpired() {
    return stmt.purge.run(Date.now()).changes;
  },
};

module.exports = Story;
