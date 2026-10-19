// Notificaciones push: suscribir este dispositivo, preferencias, prueba y «marcar como leído».
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const PushSubscription = require("../models/PushSubscription");
const push = require("../services/push");
const realtime = require("../services/realtime");
const validate = require("../utils/validate");
const { httpError } = require("../middleware/errorHandler");

/** Solo endpoints https de servicios de push (FCM, Mozilla, Apple, Microsoft…). */
function readSubscription(body) {
  const sub = body?.subscription;
  const endpoint = typeof sub?.endpoint === "string" ? sub.endpoint : "";
  const p256dh = typeof sub?.keys?.p256dh === "string" ? sub.keys.p256dh : "";
  const auth = typeof sub?.keys?.auth === "string" ? sub.keys.auth : "";
  if (!/^https:\/\//.test(endpoint) || endpoint.length > 1000) throw httpError(422, "Suscripción no válida.");
  if (!/^[\w-]{20,200}$/.test(p256dh) || !/^[\w-]{8,100}$/.test(auth)) throw httpError(422, "Suscripción no válida.");
  return { endpoint, keys: { p256dh, auth } };
}

exports.key = async (req, res) => {
  res.json({ publicKey: push.publicKey() });
};

exports.subscribe = async (req, res) => {
  const sub = readSubscription(req.body);
  const saved = await PushSubscription.save(req.user.id, sub, {
    preview: req.body.preview !== false,
    userAgent: validate.str(req.get("user-agent") || "", 300),
  });
  res.status(201).json({ ok: true, preview: Boolean(saved.preview), devices: await PushSubscription.countForUser(req.user.id) });
};

exports.unsubscribe = async (req, res) => {
  const endpoint = validate.str(req.body?.endpoint, 1000);
  if (endpoint) await PushSubscription.remove(req.user.id, endpoint);
  res.json({ ok: true });
};

exports.preview = async (req, res) => {
  const endpoint = validate.str(req.body?.endpoint, 1000);
  if (!endpoint) throw httpError(422, "Falta el dispositivo.");
  await PushSubscription.setPreview(req.user.id, endpoint, validate.toBool(req.body.preview));
  res.json({ ok: true });
};

exports.test = async (req, res) => {
  const sent = await push.sendTest(req.user);
  if (!sent) throw httpError(409, "Este dispositivo no tiene las notificaciones activadas.");
  res.json({ ok: true, sent });
};

/** Desde la notificación: «Marcar como leído» sin abrir la app. */
exports.markRead = async (req, res) => {
  const id = validate.toId(req.params.id);
  const before = id && (await Conversation.getMember(id, req.user.id));
  if (!before) throw httpError(404, "Chat no encontrado.");
  const conversation = await Conversation.findById(id);
  const upTo = conversation?.last_message_id || 0;
  if (upTo > before.last_read_id) {
    const after = await Conversation.updateReceipts(id, req.user.id, { read: upTo });
    await realtime.receipt(id, await User.findById(req.user.id), after);
  }
  res.json({ ok: true });
};
