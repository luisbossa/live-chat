const crypto = require("crypto");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Call = require("../models/Call");
const push = require("../services/push");
const presence = require("../services/presence");
const realtime = require("../services/realtime");
const calls = require("../services/calls");
const background = require("../utils/background");
const validate = require("../utils/validate");

/** Dispositivo que hace la petición (id de conexión de Pusher), para no enviarse el aviso a sí mismo. */
const socketOf = (req) => (/^\d+\.\d+$/.test(req.get("x-socket-id") || "") ? req.get("x-socket-id") : undefined);

exports.invite = async (req, res) => {
  const userId = req.user.id;
  const id = validate.toId(req.body.conversationId);
  const [conversation, memberIds] = id ? await Promise.all([Conversation.findById(id), Conversation.memberIds(id)]) : [];
  if (!conversation || conversation.type !== "direct" || !memberIds.includes(userId)) {
    return res.json({ error: "Solo puedes llamar en chats individuales." });
  }
  const calleeId = memberIds.find((uid) => uid !== userId);
  const [blocked, callee] = await Promise.all([User.isBlocked(userId, calleeId), User.findById(calleeId)]);
  if (blocked) return res.json({ error: "No puedes llamar a este contacto." });
  if (callee?.username === User.OFFICIAL_USERNAME) return res.json({ error: "La cuenta oficial no recibe llamadas." });
  if (await Call.isBusy(userId)) return res.json({ error: "Ya estás en una llamada." });

  const calleeBusy = await Call.isBusy(calleeId);
  const call = await Call.create({
    id: crypto.randomUUID(),
    conversationId: id,
    type: req.body.type === "video" ? "video" : "audio",
    callerId: userId,
    calleeId,
  });

  if (calleeBusy) {
    await calls.finish(call, "busy");
    return res.json({ error: "El contacto está en otra llamada." });
  }
  if (!presence.isOnline(callee)) {
    await calls.finish(call, "missed");
    return res.json({ error: "El contacto no está conectado. Le dejamos aviso de llamada perdida." });
  }

  const from = User.toPublic(req.user);
  realtime.toUsers([calleeId], "call:incoming", { callId: call.id, conversationId: id, type: call.type, from });
  // Si tiene Yabla en segundo plano, también le llega como notificación push
  background(push.notifyCall({ callId: call.id, conversationId: id, type: call.type, caller: from, calleeId }), "push");
  res.json({ callId: call.id, ringTimeout: Call.RING_TIMEOUT });
};

/** Carga la llamada de :id si el usuario participa en ella. */
async function load(req) {
  const call = await Call.findById(req.params.id);
  return call && (call.caller_id === req.user.id || call.callee_id === req.user.id) ? call : null;
}

exports.accept = async (req, res) => {
  const call = await load(req);
  if (!call || call.callee_id !== req.user.id || call.ended_at || !(await Call.answer(call.id))) {
    return res.json({ error: "La llamada ya terminó." });
  }
  realtime.toUsers([call.caller_id], "call:accepted", { callId: call.id });
  // Deja de sonar en los demás dispositivos del destinatario
  realtime.toUsers([req.user.id], "call:ended", { callId: call.id, reason: "answered-elsewhere" }, { exceptSocket: socketOf(req) });
  res.json({ ok: true });
};

exports.reject = async (req, res) => {
  const call = await load(req);
  if (call && call.callee_id === req.user.id && !call.answered_at && !call.ended_at) {
    await realtime.toUsers([call.caller_id, call.callee_id], "call:ended", { callId: call.id, reason: "declined" });
    await calls.finish(call, "declined");
  }
  res.json({ ok: true });
};

exports.end = async (req, res) => {
  const call = await load(req);
  if (call && !call.ended_at) {
    const userId = req.user.id;
    await realtime.toUsers([calls.other(call, userId)], "call:ended", { callId: call.id, reason: "hangup" });
    if (!call.answered_at) await realtime.toUsers([userId], "call:ended", { callId: call.id, reason: "cancelled" }, { exceptSocket: socketOf(req) });
    await calls.finish(call, call.caller_id === userId ? "missed" : "declined");
  }
  res.json({ ok: true });
};

/** El llamante avisa de que pasó el tiempo de timbre sin respuesta. */
exports.timeout = async (req, res) => {
  const call = await load(req);
  if (call && call.caller_id === req.user.id && Date.now() - call.created_at >= Call.RING_TIMEOUT - 2000) await calls.timeout(call);
  res.json({ ok: true });
};

exports.socketOf = socketOf;
