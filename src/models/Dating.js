const db = require("../config/database");
const User = require("./User");
const { PROVINCES, distanceKm } = require("../utils/costaRica");

// «Conocer»: perfiles de citas, deslizamientos y matches.
const GENDERS = ["woman", "man", "nonbinary"];
const INTERESTED = ["women", "men", "everyone"];
const LOOKING = ["pareja", "algo_casual", "amistad", "no_se"];
const SUPERLIKES_PER_DAY = 3;

const parse = (raw, fallback = []) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

/** Edad cumplida a partir de "YYYY-MM-DD". */
function age(birthdate, now = new Date()) {
  const [y, m, d] = (birthdate || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  let years = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) years -= 1;
  return years;
}

/** ¿`a` busca a alguien del género de `b`? */
const wants = (interestedIn, gender) =>
  interestedIn === "everyone" || (interestedIn === "women" && gender === "woman") || (interestedIn === "men" && gender === "man");

/** Afinidad 5–99 %: intereses comunes, mismo objetivo y misma provincia. */
function affinity(mine, theirs) {
  const a = new Set(mine.interests);
  const b = new Set(theirs.interests);
  const common = [...a].filter((x) => b.has(x));
  const union = new Set([...a, ...b]).size || 1;
  let score = (common.length / union) * 80;
  if (mine.looking_for === theirs.looking_for && mine.looking_for !== "no_se") score += 12;
  if (mine.province === theirs.province) score += 8;
  return { common, affinity: Math.max(5, Math.min(99, Math.round(score + 10))) };
}

function rowToProfile(row) {
  if (!row) return null;
  return {
    ...row,
    interests: parse(row.interests),
    prompts: parse(row.prompts),
    photos: parse(row.photos),
  };
}

/** Datos que se muestran en una tarjeta (nunca la fecha de nacimiento completa ni la ubicación exacta). */
function card(profile, user, viewerProfile, extra = {}) {
  const { common, affinity: pct } = viewerProfile ? affinity(viewerProfile, profile) : { common: [], affinity: null };
  const pub = User.toPublic(user);
  return {
    userId: profile.user_id,
    name: pub.name,
    firstName: pub.name.split(" ")[0],
    username: pub.username,
    avatar: pub.avatar,
    color: pub.color,
    online: pub.online,
    status: pub.status,
    age: age(profile.birthdate),
    gender: profile.gender,
    province: profile.province,
    provinceName: PROVINCES[profile.province]?.name || "",
    distanceKm: viewerProfile ? distanceKm(viewerProfile.province, profile.province) : null,
    lookingFor: profile.looking_for,
    about: profile.about || "",
    interests: profile.interests,
    common,
    affinity: pct,
    prompts: profile.prompts,
    photos: profile.photos.length ? profile.photos : [pub.avatar],
    verified: Boolean(profile.verified),
    ...extra,
  };
}

const SQL = {
  get: "SELECT * FROM dating_profiles WHERE user_id = ?",
  upsert: `
    INSERT INTO dating_profiles (user_id, active, paused, birthdate, gender, interested_in, looking_for, province, about, interests, prompts, photos, age_min, age_max, max_km, created_at, updated_at)
    VALUES (@userId, 1, @paused, @birthdate, @gender, @interestedIn, @lookingFor, @province, @about, @interests, @prompts, @photos, @ageMin, @ageMax, @maxKm, @now, @now)
    ON CONFLICT (user_id) DO UPDATE SET
      active = 1, paused = excluded.paused, birthdate = excluded.birthdate, gender = excluded.gender,
      interested_in = excluded.interested_in, looking_for = excluded.looking_for, province = excluded.province,
      about = excluded.about, interests = excluded.interests, prompts = excluded.prompts, photos = excluded.photos,
      age_min = excluded.age_min, age_max = excluded.age_max, max_km = excluded.max_km, updated_at = excluded.updated_at`,
  // Candidatos: activos, no pausados, sin deslizar, sin match vigente y sin bloqueos
  candidates: `
    SELECT p.*, (SELECT action FROM dating_swipes s WHERE s.from_id = p.user_id AND s.to_id = @me) AS their_action
    FROM dating_profiles p
    WHERE p.user_id <> @me AND p.active = 1 AND p.paused = 0
      AND NOT EXISTS (SELECT 1 FROM dating_swipes s WHERE s.from_id = @me AND s.to_id = p.user_id)
      AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id = @me AND b.blocked_id = p.user_id) OR (b.blocker_id = p.user_id AND b.blocked_id = @me))
      AND NOT EXISTS (SELECT 1 FROM dating_matches m WHERE (m.user_a = MIN(@me, p.user_id) AND m.user_b = MAX(@me, p.user_id)))`,
  swipe: `
    INSERT INTO dating_swipes (from_id, to_id, action, created_at) VALUES (?, ?, ?, ?)
    ON CONFLICT (from_id, to_id) DO UPDATE SET action = excluded.action, created_at = excluded.created_at`,
  theirSwipe: "SELECT action FROM dating_swipes WHERE from_id = ? AND to_id = ?",
  superlikesToday: "SELECT COUNT(*) AS n FROM dating_swipes WHERE from_id = ? AND action = 'superlike' AND created_at >= ?",
  match: "SELECT * FROM dating_matches WHERE user_a = ? AND user_b = ?",
  insertMatch: "INSERT INTO dating_matches (user_a, user_b, conversation_id, created_at) VALUES (?, ?, ?, ?)",
  matchById: "SELECT * FROM dating_matches WHERE id = ?",
  matchByConversation: "SELECT * FROM dating_matches WHERE conversation_id = ?",
  myMatches: `
    SELECT * FROM dating_matches
    WHERE (user_a = ? OR user_b = ?) AND unmatched_at IS NULL
    ORDER BY created_at DESC`,
  likesMe: `
    SELECT s.from_id, s.action, s.created_at FROM dating_swipes s
    JOIN dating_profiles p ON p.user_id = s.from_id AND p.active = 1 AND p.paused = 0
    WHERE s.to_id = @me AND s.action IN ('like', 'superlike')
      AND NOT EXISTS (SELECT 1 FROM dating_swipes mine WHERE mine.from_id = @me AND mine.to_id = s.from_id)
      AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id = @me AND b.blocked_id = s.from_id) OR (b.blocker_id = s.from_id AND b.blocked_id = @me))
    ORDER BY s.action = 'superlike' DESC, s.created_at DESC`,
  lastPass: "SELECT * FROM dating_swipes WHERE from_id = ? AND action = 'pass' ORDER BY created_at DESC LIMIT 1",
  deleteSwipe: "DELETE FROM dating_swipes WHERE from_id = ? AND to_id = ?",
  unmatch: "UPDATE dating_matches SET unmatched_by = ?, unmatched_at = ? WHERE id = ?",
  report: "INSERT INTO dating_reports (reporter_id, reported_id, reason, details, created_at) VALUES (?, ?, ?, ?, ?)",
  verify: "UPDATE dating_profiles SET verified = 1, verified_at = ? WHERE user_id = ?",
  pause: "UPDATE dating_profiles SET paused = ?, updated_at = ? WHERE user_id = ?",
};

const pair = (x, y) => (x < y ? [x, y] : [y, x]);
const startOfDay = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const Dating = {
  GENDERS,
  INTERESTED,
  LOOKING,
  SUPERLIKES_PER_DAY,
  age,
  card,

  async getProfile(userId) {
    return rowToProfile(await db.get(SQL.get, [userId]));
  },

  async upsertProfile(userId, p) {
    await db.run(SQL.upsert, {
      userId,
      paused: p.paused ? 1 : 0,
      birthdate: p.birthdate,
      gender: p.gender,
      interestedIn: p.interestedIn,
      lookingFor: p.lookingFor,
      province: p.province,
      about: p.about || null,
      interests: JSON.stringify(p.interests),
      prompts: JSON.stringify(p.prompts),
      photos: JSON.stringify(p.photos),
      ageMin: p.ageMin,
      ageMax: p.ageMax,
      maxKm: p.maxKm,
      now: Date.now(),
    });
    return Dating.getProfile(userId);
  },

  setPaused: (userId, paused) => db.run(SQL.pause, [paused ? 1 : 0, Date.now(), userId]),
  verify: (userId) => db.run(SQL.verify, [Date.now(), userId]),

  /** Personas para deslizar, filtradas en ambos sentidos (edad, género y distancia). */
  async deck(me, { ageMin, ageMax, maxKm, verifiedOnly = false, commonOnly = false, limit = 20 } = {}) {
    const mine = await Dating.getProfile(me.id);
    if (!mine) return [];
    const myAge = age(mine.birthdate);
    const min = ageMin ?? mine.age_min;
    const max = ageMax ?? mine.age_max;
    const km = maxKm ?? mine.max_km;

    const rows = (await db.all(SQL.candidates, { me: me.id })).map((r) => ({ ...rowToProfile(r), their_action: r.their_action }));
    const users = await User.findMany(rows.map((r) => r.user_id));
    const list = rows
      .filter((p) => {
        const theirAge = age(p.birthdate);
        const d = distanceKm(mine.province, p.province) ?? 9999;
        return (
          theirAge >= min && theirAge <= max && myAge >= p.age_min && myAge <= p.age_max &&
          wants(mine.interested_in, p.gender) && wants(p.interested_in, mine.gender) &&
          d <= km && (!verifiedOnly || p.verified) && users.has(p.user_id)
        );
      })
      .map((p) => card(p, users.get(p.user_id), mine, { superlikedMe: p.their_action === "superlike" }))
      .filter((c) => !commonOnly || c.common.length);

    // Primero quien te dio súper like, luego la afinidad
    list.sort((a, b) => b.superlikedMe - a.superlikedMe || b.affinity - a.affinity);
    return list.slice(0, limit);
  },

  async superlikesLeft(userId) {
    const { n } = await db.get(SQL.superlikesToday, [userId, startOfDay()]);
    return Math.max(0, SUPERLIKES_PER_DAY - n);
  },

  /** Guarda el deslizamiento. Si ambos se gustan devuelve { matchId, created: true }. */
  async swipe(fromId, toId, action) {
    await db.run(SQL.swipe, [fromId, toId, action, Date.now()]);
    if (action === "pass") return null;
    const theirs = await db.get(SQL.theirSwipe, [toId, fromId]);
    if (!theirs || theirs.action === "pass") return null;
    const [a, b] = pair(fromId, toId);
    const existing = await db.get(SQL.match, [a, b]);
    if (existing && !existing.unmatched_at) return { matchId: existing.id, created: false };
    if (existing) return null; // se deshizo antes: no vuelve a emparejar
    const { lastInsertRowid } = await db.run(SQL.insertMatch, [a, b, null, Date.now()]);
    return { matchId: lastInsertRowid, created: true };
  },

  setMatchConversation: (matchId, conversationId) => db.run("UPDATE dating_matches SET conversation_id = ? WHERE id = ?", [conversationId, matchId]),
  matchById: (id) => db.get(SQL.matchById, [id]),
  matchByConversation: (conversationId) => db.get(SQL.matchByConversation, [conversationId]),

  async matches(me) {
    const rows = await db.all(SQL.myMatches, [me.id, me.id]);
    const otherIds = rows.map((m) => (m.user_a === me.id ? m.user_b : m.user_a));
    const [users, profiles, mine] = await Promise.all([
      User.findMany(otherIds),
      Promise.all(otherIds.map((id) => Dating.getProfile(id))),
      Dating.getProfile(me.id),
    ]);
    return rows
      .map((m, i) => {
        const other = users.get(otherIds[i]);
        if (!other) return null;
        const profile = profiles[i];
        return {
          id: m.id,
          conversationId: m.conversation_id,
          createdAt: m.created_at,
          user: profile ? card(profile, other, mine) : { ...User.toPublic(other), userId: other.id, firstName: other.name.split(" ")[0], photos: [User.toPublic(other).avatar] },
        };
      })
      .filter(Boolean);
  },

  /** Quién te dio like (sin haberle respondido). */
  async likesReceived(me) {
    const rows = await db.all(SQL.likesMe, { me: me.id });
    const profiles = await Promise.all(rows.map((r) => Dating.getProfile(r.from_id)));
    return rows.map((r, i) => ({ userId: r.from_id, superlike: r.action === "superlike", photo: profiles[i]?.photos[0] || null }));
  },

  /** Deshace el último «paso» (solo uno, en los últimos 10 minutos). */
  async undoLastPass(userId) {
    const last = await db.get(SQL.lastPass, [userId]);
    if (!last || Date.now() - last.created_at > 10 * 60 * 1000) return null;
    await db.run(SQL.deleteSwipe, [userId, last.to_id]);
    return last.to_id;
  },

  unmatch: (matchId, byUserId) => db.run(SQL.unmatch, [byUserId, Date.now(), matchId]),
  report: (reporterId, reportedId, reason, details) => db.run(SQL.report, [reporterId, reportedId, reason, details || null, Date.now()]),
};

module.exports = Dating;
