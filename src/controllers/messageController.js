const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Star = require("../models/Star");
const User = require("../models/User");
const { linkPreview } = require("../services/linkPreview");
const realtime = require("../services/realtime");
const validate = require("../utils/validate");
const { httpError } = require("../middleware/errorHandler");

const EDIT_WINDOW = 15 * 60 * 1000; // 15 minutos, como WhatsApp
const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉"];

/** Carga el mensaje y comprueba que el usuario pertenece a su conversación. */
exports.load = async (req, res, next) => {
  const id = validate.toId(req.params.id);
  const message = id && (await Message.findRaw(id));
  if (!message || !(await Conversation.getMember(message.conversation_id, req.user.id))) {
    throw httpError(404, "Mensaje no encontrado.");
  }
  req.message = message;
  next();
};

function assertOwnLiveMessage(req) {
  if (req.message.sender_id !== req.user.id) throw httpError(403, "Solo puedes modificar tus propios mensajes.");
  if (req.message.deleted_at) throw httpError(410, "El mensaje ya fue eliminado.");
}

exports.edit = async (req, res) => {
  assertOwnLiveMessage(req);
  if (req.message.type !== "text") throw httpError(400, "Solo se pueden editar mensajes de texto.");
  if (Date.now() - req.message.created_at > EDIT_WINDOW) throw httpError(403, "Solo puedes editar un mensaje durante 15 minutos.");
  const text = validate.str(req.body.text, 4000);
  if (!text) throw httpError(422, "El mensaje no puede quedar vacío.");

  const message = await Message.edit(req.message.id, text);
  await realtime.messageUpdated(message);
  res.json({ message });
};

/** Eliminar para todos. */
exports.remove = async (req, res) => {
  assertOwnLiveMessage(req);
  const message = await Message.remove(req.message.id);
  await realtime.messageUpdated(message);
  res.json({ message });
};

exports.react = async (req, res) => {
  if (req.message.deleted_at || req.message.type === "system") throw httpError(400, "No se puede reaccionar a este mensaje.");
  const emoji = validate.str(req.body.emoji, 16);
  if (!REACTIONS.includes(emoji)) throw httpError(422, "Reacción no válida.");
  const message = await Message.react(req.message.id, req.user.id, emoji);
  await realtime.messageUpdated(message);
  res.json({ message });
};

// ==========================================================================
// Destacar (estrella): lista personal de cada usuario
// ==========================================================================
exports.star = async (req, res) => {
  if (req.message.deleted_at || req.message.type === "system") throw httpError(400, "No se puede destacar este mensaje.");
  const starred = await Star.toggle(req.user.id, req.message.id);
  // Sus otras pestañas y dispositivos también se actualizan
  realtime.toUsers([req.user.id], "star:update", { messageId: req.message.id, starred });
  res.json({ starred });
};

exports.starred = async (req, res) => {
  res.json({ messages: await Star.list(req.user.id) });
};

// ==========================================================================
// Reenviar a uno o varios chats (máx. 5 a la vez, como WhatsApp)
// ==========================================================================
const FORWARDABLE = ["text", "image", "file", "audio", "sticker"];
const MAX_FORWARD = 5;

exports.forward = async (req, res) => {
  const original = req.message;
  if (original.deleted_at || !FORWARDABLE.includes(original.type)) throw httpError(400, "Este mensaje no se puede reenviar.");
  const targets = validate.idList(req.body.conversationIds).slice(0, MAX_FORWARD);
  if (!targets.length) throw httpError(422, "Elige al menos un chat.");

  const meta = { ...(JSON.parse(original.meta || "null") || {}), forwarded: true };
  delete meta.story;

  const sent = [];
  for (const conversationId of targets) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !(await Conversation.getMember(conversationId, req.user.id))) continue;
    if (conversation.type === "direct") {
      const peerId = (await Conversation.memberIds(conversationId)).find((id) => id !== req.user.id);
      if (peerId && (await User.isBlocked(req.user.id, peerId))) continue;
    }
    const message = await Message.create({
      conversationId,
      senderId: req.user.id,
      type: original.type,
      body: original.body,
      mediaUrl: original.media_url,
      meta,
    });
    const member = await Conversation.updateReceipts(conversationId, req.user.id, { read: message.id });
    await realtime.message(message);
    await realtime.receipt(conversationId, req.user, member);
    sent.push(message);
  }
  if (!sent.length) throw httpError(403, "No se pudo reenviar a esos chats.");
  res.status(201).json({ messages: sent });
};

// ==========================================================================
// Vista previa de enlaces
// ==========================================================================
exports.linkPreview = async (req, res) => {
  const url = validate.str(req.query.url, 2000);
  if (!/^https?:\/\//i.test(url)) throw httpError(422, "Enlace no válido.");
  res.set("Cache-Control", "private, max-age=3600");
  res.json({ preview: await linkPreview(url) });
};
