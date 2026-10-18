// Envío de mensajes de texto compartido por el envío normal y los mensajes programados.
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const realtime = require("./realtime");
const welcome = require("./welcome");

/**
 * @menciones: en los grupos, "@usuario" de un participante se guarda en meta.mentions
 * para resaltarlo y avisar aunque el chat esté silenciado (como WhatsApp y Telegram).
 */
async function mentionsIn(conversation, text, senderId) {
  if (conversation.type !== "group" || !text || !text.includes("@")) return [];
  const members = await Conversation.members(conversation.id, { id: senderId, read_receipts: 1 });
  const byUsername = new Map(members.map((m) => [m.username.toLowerCase(), m.id]));
  const ids = new Set();
  for (const [, name] of text.matchAll(/(?:^|[^\w@])@([a-z0-9_.]{3,20})/gi)) {
    const id = byUsername.get(name.toLowerCase().replace(/\.+$/, ""));
    if (id && id !== senderId) ids.add(id);
  }
  return [...ids];
}

/** Devuelve el otro participante de un chat 1 a 1, o lanza si hay un bloqueo. */
async function peerIfAllowed(conversation, senderId) {
  if (conversation.type !== "direct") return { peer: null, blocked: false };
  const peerId = (await Conversation.memberIds(conversation.id)).find((id) => id !== senderId);
  if (!peerId) return { peer: null, blocked: false };
  return { peer: await User.findById(peerId), blocked: await User.isBlocked(senderId, peerId) };
}

/** Crea el mensaje, marca como leído para quien lo envía y lo emite en tiempo real. */
async function publish(data, sender, { clientId, peer } = {}) {
  const message = await Message.create(data);
  if (clientId) message.clientId = clientId;
  const member = await Conversation.updateReceipts(data.conversationId, sender.id, { read: message.id });
  await realtime.message(message);
  await realtime.receipt(data.conversationId, sender, member);
  if (peer?.username === welcome.OFFICIAL_USERNAME) welcome.autoReply(data.conversationId, peer.id);
  return message;
}

module.exports = { mentionsIn, peerIfAllowed, publish };
