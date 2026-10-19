// «Conocer»: perfil de citas, descubrir, match, rompehielos y seguridad.
const User = require("../models/User");
const Dating = require("../models/Dating");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const upload = require("../middleware/upload");
const realtime = require("../services/realtime");
const messaging = require("../services/messaging");
const validate = require("../utils/validate");
const { PROVINCES, INTERESTS, PROMPTS, THIS_OR_THAT } = require("../utils/costaRica");
const { httpError } = require("../middleware/errorHandler");

const REPORT_REASONS = { fake: "Perfil falso", harassment: "Acoso o mensajes ofensivos", minor: "Parece menor de edad", inappropriate: "Contenido inapropiado", other: "Otro motivo" };
const PHOTO_URL = /^\/(uploads\/[\w.-]+|assets\/images\/avatars\/[\w.-]+)$/;
const clampInt = (v, min, max, fallback) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};

/** Catálogos para el asistente (intereses, preguntas, provincias). */
exports.options = async (req, res) => {
  res.json({
    interests: INTERESTS,
    prompts: PROMPTS,
    provinces: Object.entries(PROVINCES).map(([id, p]) => ({ id, name: p.name })),
    reasons: REPORT_REASONS,
    thisOrThat: THIS_OR_THAT,
  });
};

exports.profile = async (req, res) => {
  const profile = await Dating.getProfile(req.user.id);
  res.json({
    profile: profile && { ...Dating.card(profile, req.user, null), birthdate: profile.birthdate, interestedIn: profile.interested_in, ageMin: profile.age_min, ageMax: profile.age_max, maxKm: profile.max_km, paused: Boolean(profile.paused) },
    superlikesLeft: profile ? await Dating.superlikesLeft(req.user.id) : 0,
  });
};

/** Crear o editar el perfil de citas (solo mayores de 18). */
exports.saveProfile = async (req, res) => {
  const b = req.body;
  const errors = {};
  const birthdate = validate.str(b.birthdate, 10);
  const years = /^\d{4}-\d{2}-\d{2}$/.test(birthdate) ? Dating.age(birthdate) : null;
  if (years === null || years > 100) errors.birthdate = "Escribe tu fecha de nacimiento.";
  else if (years < 18) errors.birthdate = "Debes ser mayor de 18 años para usar «Conocer».";
  if (!Dating.GENDERS.includes(b.gender)) errors.gender = "Elige tu género.";
  if (!Dating.INTERESTED.includes(b.interestedIn)) errors.interestedIn = "Elige a quién quieres conocer.";
  if (!Dating.LOOKING.includes(b.lookingFor)) errors.lookingFor = "Elige qué buscas.";
  if (!PROVINCES[b.province]) errors.province = "Elige tu provincia.";

  const interests = [...new Set(Array.isArray(b.interests) ? b.interests : [])].filter((i) => INTERESTS.includes(i)).slice(0, 8);
  if (interests.length < 3) errors.interests = "Elige al menos 3 intereses.";
  const prompts = (Array.isArray(b.prompts) ? b.prompts : [])
    .filter((p) => p && PROMPTS.includes(p.q) && validate.str(p.a, 150))
    .slice(0, 3)
    .map((p) => ({ q: p.q, a: validate.str(p.a, 150) }));
  const photos = (Array.isArray(b.photos) ? b.photos : []).filter((u) => typeof u === "string" && PHOTO_URL.test(u)).slice(0, 6);
  if (!photos.length) errors.photos = "Sube al menos una foto.";
  if (Object.keys(errors).length) throw Object.assign(httpError(422, Object.values(errors)[0]), { errors });

  const ageMin = clampInt(b.ageMin, 18, 99, 18);
  const ageMax = Math.max(ageMin, clampInt(b.ageMax, 18, 99, 45));
  await Dating.upsertProfile(req.user.id, {
    birthdate,
    gender: b.gender,
    interestedIn: b.interestedIn,
    lookingFor: b.lookingFor,
    province: b.province,
    about: validate.str(b.about, 300),
    interests,
    prompts,
    photos,
    ageMin,
    ageMax,
    maxKm: clampInt(b.maxKm, 10, 500, 200),
    paused: validate.toBool(b.paused),
  });
  return exports.profile(req, res);
};

exports.uploadPhotos = async (req, res) => {
  const urls = [];
  for (const file of req.files || []) urls.push(await upload.save(file));
  if (!urls.length) throw httpError(422, "Elige al menos una foto.");
  res.status(201).json({ urls });
};

exports.setPaused = async (req, res) => {
  if (!(await Dating.getProfile(req.user.id))) throw httpError(404, "Aún no tienes perfil de citas.");
  await Dating.setPaused(req.user.id, validate.toBool(req.body.paused));
  return exports.profile(req, res);
};

/** Verificación con selfie. Demostración: se aprueba al recibir la foto (en producción conectar un servicio real). */
exports.verify = async (req, res) => {
  if (!req.file) throw httpError(422, "Toma una selfie para verificarte.");
  if (!(await Dating.getProfile(req.user.id))) throw httpError(404, "Primero crea tu perfil de citas.");
  await Dating.verify(req.user.id);
  return exports.profile(req, res);
};

exports.deck = async (req, res) => {
  const q = req.query;
  const filters = {
    ageMin: q.ageMin ? clampInt(q.ageMin, 18, 99) : undefined,
    ageMax: q.ageMax ? clampInt(q.ageMax, 18, 99) : undefined,
    maxKm: q.maxKm ? clampInt(q.maxKm, 10, 500) : undefined,
    verifiedOnly: validate.toBool(q.verified),
    commonOnly: validate.toBool(q.common),
  };
  res.json({ cards: await Dating.deck(req.user, filters), superlikesLeft: await Dating.superlikesLeft(req.user.id) });
};

/** Crea el chat del match (o reaprovecha el 1 a 1 si ya existía) y avisa a los dos en tiempo real. */
async function openMatchChat(matchId, me, otherId) {
  const { id: conversationId } = await Conversation.getOrCreateDirect(me.id, otherId);
  await Conversation.setOrigin(conversationId, "match");
  await Promise.all([Conversation.updateMember(conversationId, me.id, { hidden: 0 }), Conversation.updateMember(conversationId, otherId, { hidden: 0 })]);
  await Dating.setMatchConversation(matchId, conversationId);
  const notice = await Message.create({ conversationId, senderId: me.id, type: "system", meta: { action: "matched" } });
  await realtime.conversation(conversationId);
  await realtime.message(notice);

  const [other, myProfile, theirProfile] = await Promise.all([User.findById(otherId), Dating.getProfile(me.id), Dating.getProfile(otherId)]);
  const payload = (viewer, viewerProfile, target, targetProfile) => ({
    matchId,
    conversationId,
    user: Dating.card(targetProfile, target, viewerProfile),
    me: { avatar: User.toPublic(viewer).avatar, photo: viewerProfile.photos[0] || User.toPublic(viewer).avatar },
  });
  realtime.toUsers([me.id], "dating:match", payload(me, myProfile, other, theirProfile));
  realtime.toUsers([otherId], "dating:match", payload(other, theirProfile, me, myProfile));
  return conversationId;
}

exports.swipe = async (req, res) => {
  const toId = validate.toId(req.body.toId);
  const action = validate.str(req.body.action, 12);
  if (!["like", "pass", "superlike"].includes(action)) throw httpError(422, "Acción no válida.");
  if (!toId || toId === req.user.id || !(await Dating.getProfile(toId))) throw httpError(404, "Ese perfil ya no está disponible.");
  if (!(await Dating.getProfile(req.user.id))) throw httpError(409, "Primero crea tu perfil de citas.");
  if (await User.isBlocked(req.user.id, toId)) throw httpError(404, "Ese perfil ya no está disponible.");
  if (action === "superlike" && (await Dating.superlikesLeft(req.user.id)) <= 0) {
    throw httpError(429, `Ya usaste tus ${Dating.SUPERLIKES_PER_DAY} súper likes de hoy. Vuelve mañana ⭐`);
  }

  const result = await Dating.swipe(req.user.id, toId, action);
  let conversationId = null;
  if (result?.created) conversationId = await openMatchChat(result.matchId, req.user, toId);
  else if (action !== "pass") realtime.toUsers([toId], "dating:like", { superlike: action === "superlike" });
  res.json({ match: Boolean(result?.created), conversationId, superlikesLeft: await Dating.superlikesLeft(req.user.id) });
};

exports.undo = async (req, res) => {
  const userId = await Dating.undoLastPass(req.user.id);
  if (!userId) throw httpError(404, "No hay nada que deshacer.");
  const [profile, user, mine] = await Promise.all([Dating.getProfile(userId), User.findById(userId), Dating.getProfile(req.user.id)]);
  res.json({ card: profile && user ? Dating.card(profile, user, mine) : null });
};

exports.matches = async (req, res) => {
  res.json({ matches: await Dating.matches(req.user) });
};

exports.likes = async (req, res) => {
  const likes = await Dating.likesReceived(req.user);
  res.json({ count: likes.length, superlikes: likes.filter((l) => l.superlike).length, photos: likes.slice(0, 4).map((l) => l.photo).filter(Boolean) });
};

async function endMatch(match, byUserId) {
  await Dating.unmatch(match.id, byUserId);
  const conv = match.conversation_id && (await Conversation.findById(match.conversation_id));
  if (conv) {
    for (const uid of [match.user_a, match.user_b]) {
      await Conversation.hide(conv.id, uid, conv.last_message_id || 0);
      realtime.toUsers([uid], "conversation:removed", { conversationId: conv.id });
    }
  }
  realtime.toUsers([match.user_a, match.user_b], "dating:unmatch", { matchId: match.id });
}

exports.unmatch = async (req, res) => {
  const match = await Dating.matchById(validate.toId(req.params.id));
  if (!match || ![match.user_a, match.user_b].includes(req.user.id) || match.unmatched_at) throw httpError(404, "Ese match ya no existe.");
  await endMatch(match, req.user.id);
  res.json({ ok: true });
};

/** Reportar: guarda el motivo, bloquea a la persona y deshace el match si lo había. */
exports.report = async (req, res) => {
  const userId = validate.toId(req.body.userId);
  const reason = validate.str(req.body.reason, 20);
  if (!userId || userId === req.user.id || !(await User.findById(userId))) throw httpError(404, "Usuario no encontrado.");
  if (!REPORT_REASONS[reason]) throw httpError(422, "Elige un motivo.");
  await Dating.report(req.user.id, userId, reason, validate.str(req.body.details, 300));
  if (!(await User.isBlocked(req.user.id, userId))) await User.toggleBlock(req.user.id, userId);
  const match = (await Dating.matches(req.user)).find((m) => m.user.userId === userId);
  if (match) await endMatch(await Dating.matchById(match.id), req.user.id);
  res.json({ ok: true, blockedIds: await User.blockedIds(req.user.id) });
};

// ==========================================================================
// Rompehielos dentro del chat de un match
// ==========================================================================
async function assertMatchChat(req) {
  const match = await Dating.matchByConversation(req.conversation.id);
  if (!match || match.unmatched_at) throw httpError(403, "Esta función es para chats de «Conocer».");
  return match;
}

/** «Esto o aquello»: un mensaje con dos opciones que ambos responden. */
exports.thisOrThat = async (req, res) => {
  await assertMatchChat(req);
  const options = Array.isArray(req.body.options) ? req.body.options.map((o) => validate.str(o, 40)).filter(Boolean) : [];
  const pick = options.length === 2 ? options : THIS_OR_THAT[Math.floor(Math.random() * THIS_OR_THAT.length)];
  const message = await messaging.publish(
    { conversationId: req.conversation.id, senderId: req.user.id, type: "game", body: null, meta: { game: "this-or-that", options: pick, answers: {} } },
    req.user
  );
  res.status(201).json({ message });
};

/** Propuesta de primera cita (videollamada o lugar, con día y hora). */
exports.proposeDate = async (req, res) => {
  await assertMatchChat(req);
  const kind = req.body.kind === "place" ? "place" : "video";
  const place = kind === "place" ? validate.str(req.body.place, 80) : null;
  const when = Number(req.body.when);
  if (kind === "place" && !place) throw httpError(422, "Escribe el lugar de la cita.");
  if (!Number.isFinite(when) || when < Date.now()) throw httpError(422, "Elige un día y una hora futuros.");
  const message = await messaging.publish(
    { conversationId: req.conversation.id, senderId: req.user.id, type: "date", body: null, meta: { kind, place, when, status: "pending" } },
    req.user
  );
  res.status(201).json({ message });
};

/** Responder a un «Esto o aquello» o a una propuesta de cita. */
exports.answer = async (req, res) => {
  const msg = await Message.findById(req.message.id);
  if (msg.deletedAt) throw httpError(410, "El mensaje ya no existe.");
  const meta = { ...(msg.meta || {}) };

  if (msg.type === "game") {
    const choice = validate.str(req.body.choice, 40);
    if (!meta.options?.includes(choice)) throw httpError(422, "Elige una de las dos opciones.");
    if (meta.answers?.[req.user.id]) throw httpError(409, "Ya respondiste.");
    meta.answers = { ...(meta.answers || {}), [req.user.id]: choice };
    const updated = await Message.updateMeta(msg.id, meta);
    await realtime.messageUpdated(updated);
    // Cuando responden los dos, un mensaje de sistema cuenta el resultado
    if (Object.keys(meta.answers).length >= 2) {
      const notice = await Message.create({ conversationId: msg.conversationId, senderId: req.user.id, type: "system", meta: { action: "game-result", answers: meta.answers, options: meta.options } });
      await realtime.message(notice);
    }
    return res.json({ message: updated });
  }

  if (msg.type === "date") {
    if (msg.senderId === req.user.id) throw httpError(403, "Espera la respuesta de la otra persona.");
    if (meta.status !== "pending") throw httpError(409, "Esta propuesta ya tiene respuesta.");
    meta.status = validate.toBool(req.body.accept) ? "accepted" : "declined";
    meta.answeredAt = Date.now();
    const updated = await Message.updateMeta(msg.id, meta);
    await realtime.messageUpdated(updated);
    return res.json({ message: updated });
  }

  throw httpError(400, "Este mensaje no se puede responder.");
};
