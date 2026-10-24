// Llamadas 1 a 1 (WebRTC). El estado vive en la tabla `calls`; los avisos van por Pusher.
// La oferta, la respuesta y los candidatos ICE viajan entre los navegadores como eventos
// de cliente en el canal `presence-call-<id>` (no pasan por el servidor).
const Call = require("../models/Call");
const Message = require("../models/Message");
const realtime = require("./realtime");

const other = (call, userId) => (call.caller_id === userId ? call.callee_id : call.caller_id);

/** Termina la llamada y la deja registrada en el chat (como WhatsApp). */
async function finish(call, status) {
  if (!(await Call.end(call.id))) return; // ya estaba terminada
  const duration = call.answered_at ? Math.round((Date.now() - call.answered_at) / 1000) : 0;
  const message = await Message.create({
    conversationId: call.conversation_id,
    senderId: call.caller_id,
    type: "call",
    meta: { callType: call.type, status: call.answered_at ? "completed" : status, duration },
  });
  await realtime.message(message);
}

/** Nadie contestó a tiempo. */
async function timeout(call) {
  if (call.answered_at || call.ended_at) return;
  await realtime.toUsers([call.caller_id, call.callee_id], "call:ended", { callId: call.id, reason: "timeout" });
  await finish(call, "missed");
}

/** Alguien cerró la pestaña o perdió la conexión durante la llamada (webhook de Pusher). */
async function disconnected(callId, userId) {
  const call = await Call.findById(callId);
  if (!call || call.ended_at || (call.caller_id !== userId && call.callee_id !== userId)) return;
  // El destinatario aún no contestó: su canal de llamada no estaba abierto, así que solo cuenta el llamante
  if (!call.answered_at && userId !== call.caller_id) return;
  await realtime.toUsers([other(call, userId)], "call:ended", { callId: call.id, reason: "disconnected" });
  await finish(call, "missed");
}

/** Respaldo del cron: llamadas que quedaron sonando (p. ej. el llamante cerró sin colgar). */
async function expireUnanswered() {
  for (const call of await Call.unanswered()) await timeout(call);
  await Call.purge();
}

module.exports = { other, finish, timeout, disconnected, expireUnanswered };
