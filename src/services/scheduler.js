// Tareas periódicas del chat: enviar mensajes programados y borrar los temporales caducados.
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Scheduled = require("../models/Scheduled");
const messaging = require("./messaging");
const realtime = require("./realtime");

/** Envía un mensaje programado (si quien lo programó sigue en el chat y no hay bloqueo). */
async function deliver(row) {
  const [conversation, member, sender] = await Promise.all([
    Conversation.findById(row.conversation_id),
    Conversation.getMember(row.conversation_id, row.sender_id),
    User.findById(row.sender_id),
  ]);
  if (!conversation || !member || !sender) return null;
  const { peer, blocked } = await messaging.peerIfAllowed(conversation, sender.id);
  if (blocked) return null;

  const reply = row.reply_to_id && (await Message.findRaw(row.reply_to_id));
  const mentions = await messaging.mentionsIn(conversation, row.body, sender.id);
  const meta = { scheduled: true, ...(mentions.length ? { mentions } : {}) };
  const message = await messaging.publish(
    { conversationId: conversation.id, senderId: sender.id, type: "text", body: row.body, meta, replyToId: reply && !reply.deleted_at ? reply.id : null },
    sender,
    { peer }
  );
  // Quien lo programó ve bajar el contador de "programados"
  realtime.toUsers([sender.id], "conversation:update", await Conversation.getForUser(conversation.id, sender));
  return message;
}

async function sendDue() {
  for (const row of await Scheduled.takeDue()) {
    await deliver(row).catch((err) => console.error("[programados]", err));
  }
}

async function purgeExpired() {
  for (const { conversationId, ids } of await Message.purgeExpired()) {
    await realtime.toConversation(conversationId, "message:expired", { conversationId, ids });
  }
}

module.exports = { deliver, sendDue, purgeExpired };
