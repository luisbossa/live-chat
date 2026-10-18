const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
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
