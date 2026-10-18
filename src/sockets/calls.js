const crypto = require("crypto");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const realtime = require("../services/realtime");
const validate = require("../utils/validate");

const RING_TIMEOUT = 35 * 1000;

// Llamadas activas en memoria: callId -> llamada
const calls = new Map();
const busy = (userId) => [...calls.values()].some((c) => c.callerId === userId || c.calleeId === userId);
const findCall = (callId, userId) => {
  const call = calls.get(callId);
  return call && (call.callerId === userId || call.calleeId === userId) ? call : null;
};

/** Termina la llamada y la deja registrada en el chat (como WhatsApp). */
async function finish(call, status) {
  if (!calls.has(call.id)) return;
  calls.delete(call.id);
  clearTimeout(call.ringTimer);

  const duration = call.answeredAt ? Math.round((Date.now() - call.answeredAt) / 1000) : 0;
  const message = await Message.create({
    conversationId: call.conversationId,
    senderId: call.callerId,
    type: "call",
    meta: { callType: call.type, status: call.answeredAt ? "completed" : status, duration },
  });
  await realtime.message(message);
}

/** Señalización WebRTC 1 a 1. El audio y el video viajan directamente entre navegadores. */
module.exports = function registerCallHandlers(io, socket, safe) {
  const userId = socket.userId;
  const other = (call) => (call.callerId === userId ? call.calleeId : call.callerId);
  const otherSocket = (call) => (call.callerId === userId ? call.calleeSocketId : call.callerSocketId);

  socket.on(
    "call:invite",
    safe(async ({ conversationId, type } = {}, ack = () => {}) => {
      const id = validate.toId(conversationId);
      const [conversation, memberIds] = id ? await Promise.all([Conversation.findById(id), Conversation.memberIds(id)]) : [];
      if (!conversation || conversation.type !== "direct" || !memberIds.includes(userId)) {
        return ack({ error: "Solo puedes llamar en chats individuales." });
      }
      const calleeId = memberIds.find((uid) => uid !== userId);
      const [blocked, caller] = await Promise.all([User.isBlocked(userId, calleeId), User.findById(userId)]);
      if (blocked) return ack({ error: "No puedes llamar a este contacto." });

      // A partir de aquí no hay await hasta registrar la llamada: evita dos llamadas simultáneas
      if (busy(userId)) return ack({ error: "Ya estás en una llamada." });
      const call = {
        id: crypto.randomUUID(),
        conversationId: id,
        type: type === "video" ? "video" : "audio",
        callerId: userId,
        calleeId,
        callerSocketId: socket.id,
        calleeSocketId: null,
        answeredAt: null,
      };
      const calleeBusy = busy(calleeId);
      calls.set(call.id, call);

      if (calleeBusy) {
        ack({ error: "El contacto está en otra llamada." });
        return finish(call, "busy");
      }
      if (!realtime.isOnline(calleeId)) {
        ack({ error: "El contacto no está conectado. Le dejamos aviso de llamada perdida." });
        return finish(call, "missed");
      }

      call.ringTimer = setTimeout(
        safe(async () => {
          realtime.toUsers([call.callerId, call.calleeId], "call:ended", { callId: call.id, reason: "timeout" });
          await finish(call, "missed");
        }),
        RING_TIMEOUT
      );

      realtime.toUsers([calleeId], "call:incoming", { callId: call.id, conversationId: id, type: call.type, from: User.toPublic(caller) });
      ack({ callId: call.id });
    })
  );

  socket.on("call:accept", ({ callId } = {}) => {
    const call = findCall(callId, userId);
    if (!call || call.calleeId !== userId || call.answeredAt) return;
    clearTimeout(call.ringTimer);
    call.answeredAt = Date.now();
    call.calleeSocketId = socket.id;
    realtime.toSocket(call.callerSocketId, "call:accepted", { callId });
    // Deja de sonar en los demás dispositivos del destinatario
    socket.to(realtime.room(userId)).emit("call:ended", { callId, reason: "answered-elsewhere" });
  });

  socket.on(
    "call:reject",
    safe(async ({ callId } = {}) => {
      const call = findCall(callId, userId);
      if (!call || call.calleeId !== userId || call.answeredAt) return;
      realtime.toUsers([call.callerId, call.calleeId], "call:ended", { callId, reason: "declined" });
      await finish(call, "declined");
    })
  );

  // Ofertas, respuestas y candidatos ICE: se reenvían al otro participante
  socket.on("call:signal", ({ callId, data } = {}) => {
    const call = findCall(callId, userId);
    const target = call && otherSocket(call);
    if (target) realtime.toSocket(target, "call:signal", { callId, data });
  });

  socket.on(
    "call:end",
    safe(async ({ callId } = {}) => {
      const call = findCall(callId, userId);
      if (!call) return;
      realtime.toUsers([other(call)], "call:ended", { callId, reason: "hangup" });
      if (!call.answeredAt) realtime.toUsers([userId], "call:ended", { callId, reason: "cancelled" });
      await finish(call, call.callerId === userId ? "missed" : "declined");
    })
  );

  socket.on(
    "disconnect",
    safe(async () => {
      for (const call of [...calls.values()]) {
        const involved = call.callerSocketId === socket.id || call.calleeSocketId === socket.id;
        if (!involved) continue;
        realtime.toUsers([other(call)], "call:ended", { callId: call.id, reason: "disconnected" });
        await finish(call, "missed");
      }
    })
  );
};
