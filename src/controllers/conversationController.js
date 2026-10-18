const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Story = require("../models/Story");
const upload = require("../middleware/upload");
const realtime = require("../services/realtime");
const validate = require("../utils/validate");
const { httpError } = require("../middleware/errorHandler");

const MAX_TEXT = 4000;
const STICKER_PATH = /^\/assets\/images\/stickers\/sticker\d{1,3}\.gif$/;

/** Carga la conversación y comprueba que el usuario es miembro. Se usa como middleware. */
exports.loadMembership = (req, res, next) => {
  const id = validate.toId(req.params.id);
  const conversation = id && Conversation.findById(id);
  const member = conversation && Conversation.getMember(id, req.user.id);
  if (!member) return next(httpError(404, "Conversación no encontrada."));
  req.conversation = conversation;
  req.member = member;
  next();
};

function peerOf(conversation, userId) {
  return Conversation.memberIds(conversation.id).find((id) => id !== userId);
}

function assertCanSend(req) {
  if (req.conversation.type !== "direct") return;
  const peerId = peerOf(req.conversation, req.user.id);
  if (peerId && User.isBlocked(req.user.id, peerId)) throw httpError(403, "No puedes enviar mensajes a este contacto.");
}

function systemMessage(conversationId, actorId, action, extra = {}) {
  const message = Message.create({ conversationId, senderId: actorId, type: "system", meta: { action, ...extra } });
  realtime.message(message);
  return message;
}

exports.create = (req, res, next) => {
  try {
    const me = req.user;

    // Chat 1 a 1
    if (req.body.type !== "group") {
      const userId = validate.toId(req.body.userId);
      if (!userId || userId === me.id || !User.findById(userId)) throw httpError(404, "Usuario no encontrado.");
      const { id, created } = Conversation.getOrCreateDirect(me.id, userId);
      if (created) realtime.conversation(id, [userId]);
      return res.status(created ? 201 : 200).json({ conversation: Conversation.getForUser(id, me) });
    }

    // Grupo
    const name = validate.str(req.body.name, 60);
    const memberIds = validate.idList(req.body.memberIds).filter((id) => id !== me.id && User.findById(id));
    if (!name) throw httpError(422, "Ponle un nombre al grupo.");
    if (!memberIds.length) throw httpError(422, "Elige al menos un participante.");

    const id = Conversation.createGroup({
      name,
      avatar: upload.urlFor(req.file),
      description: validate.str(req.body.description, 200) || null,
      createdBy: me.id,
      memberIds,
    });
    Message.create({ conversationId: id, senderId: me.id, type: "system", meta: { action: "created", name } });
    realtime.conversation(id);
    res.status(201).json({ conversation: Conversation.getForUser(id, me) });
  } catch (err) {
    next(err);
  }
};

exports.messages = (req, res) => {
  const before = validate.toId(req.query.before) || undefined;
  const limit = Math.min(validate.toId(req.query.limit) || 50, 100);
  const messages = Message.list(req.conversation.id, { before, limit, after: req.member.cleared_id });
  res.json({ messages, hasMore: messages.length === limit });
};

exports.media = (req, res) => {
  res.json({ messages: Message.media(req.conversation.id, req.member.cleared_id) });
};

exports.send = (req, res, next) => {
  try {
    assertCanSend(req);

    const conversationId = req.conversation.id;
    const text = validate.str(req.body.text, MAX_TEXT);
    const replyToId = validate.toId(req.body.replyToId);
    const sticker = validate.str(req.body.sticker, 200);
    const file = req.file;

    const data = { conversationId, senderId: req.user.id, type: "text", body: text || null, meta: null, replyToId: null };

    if (file) {
      data.mediaUrl = upload.urlFor(file);
      data.type = file.mimetype.startsWith("image/") ? "image" : file.mimetype.startsWith("audio/") || req.body.kind === "audio" ? "audio" : "file";
      data.meta = { name: file.originalname.slice(0, 120), size: file.size, mime: file.mimetype };
      if (data.type === "audio") data.meta.duration = Math.min(Number(req.body.duration) || 0, 60 * 30);
    } else if (sticker) {
      if (!STICKER_PATH.test(sticker)) throw httpError(422, "Sticker no válido.");
      Object.assign(data, { type: "sticker", mediaUrl: sticker, body: null });
    } else if (!text) {
      throw httpError(422, "El mensaje está vacío.");
    }

    if (replyToId) {
      const original = Message.findRaw(replyToId);
      if (original?.conversation_id === conversationId) data.replyToId = replyToId;
    }

    // Respuesta a un estado: se adjunta una miniatura del estado
    const storyId = validate.toId(req.body.storyId);
    if (storyId) {
      const story = Story.findById(storyId);
      if (story && Conversation.memberIds(conversationId).includes(story.user_id)) {
        data.meta = { ...(data.meta || {}), story: { id: story.id, mediaUrl: story.media_url, userId: story.user_id } };
      }
    }

    const message = Message.create(data);
    // Identificador temporal del cliente: permite reemplazar el mensaje provisional sin duplicarlo
    if (req.body.clientId) message.clientId = validate.str(req.body.clientId, 40);
    // El remitente ya lo leyó
    const member = Conversation.updateReceipts(conversationId, req.user.id, { read: message.id });
    realtime.message(message);
    realtime.receipt(conversationId, req.user, member);
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = (req, res) => {
  const fields = {};
  if ("muted" in req.body) fields.muted = validate.toBool(req.body.muted) ? 1 : 0;
  if ("pinned" in req.body) fields.pinned = validate.toBool(req.body.pinned) ? 1 : 0;
  Conversation.updateMember(req.conversation.id, req.user.id, fields);
  const conversation = Conversation.getForUser(req.conversation.id, req.user);
  realtime.toUsers([req.user.id], "conversation:update", conversation);
  res.json({ conversation });
};

/** "Vaciar chat": oculta el historial solo para quien lo vacía. */
exports.clear = (req, res) => {
  const lastId = req.conversation.last_message_id || 0;
  Conversation.updateMember(req.conversation.id, req.user.id, { cleared_id: lastId });
  Conversation.updateReceipts(req.conversation.id, req.user.id, { read: lastId });
  const conversation = Conversation.getForUser(req.conversation.id, req.user);
  realtime.toUsers([req.user.id], "conversation:update", conversation);
  res.json({ conversation });
};

exports.updateGroup = (req, res, next) => {
  try {
    if (req.conversation.type !== "group") throw httpError(400, "Solo se pueden editar grupos.");
    if (req.member.role !== "admin") throw httpError(403, "Solo los administradores pueden editar el grupo.");
    const name = req.body.name !== undefined ? validate.str(req.body.name, 60) : null;
    if (name === "") throw httpError(422, "El nombre no puede estar vacío.");
    Conversation.update(req.conversation.id, {
      name,
      avatar: upload.urlFor(req.file),
      description: req.body.description !== undefined ? validate.str(req.body.description, 200) : null,
    });
    if (name && name !== req.conversation.name) systemMessage(req.conversation.id, req.user.id, "renamed", { name });
    realtime.conversation(req.conversation.id, undefined, "conversation:update");
    res.json({ conversation: Conversation.getForUser(req.conversation.id, req.user) });
  } catch (err) {
    next(err);
  }
};

exports.addMembers = (req, res, next) => {
  try {
    if (req.conversation.type !== "group") throw httpError(400, "Solo se pueden añadir participantes a grupos.");
    if (req.member.role !== "admin") throw httpError(403, "Solo los administradores pueden añadir participantes.");
    const ids = validate.idList(req.body.userIds).filter((id) => User.findById(id));
    const added = Conversation.addMembers(req.conversation.id, ids);
    if (!added.length) throw httpError(422, "Esas personas ya están en el grupo.");

    systemMessage(req.conversation.id, req.user.id, "added", { userIds: added });
    realtime.conversation(req.conversation.id, added);
    realtime.conversation(req.conversation.id, Conversation.memberIds(req.conversation.id).filter((id) => !added.includes(id)), "conversation:update");
    res.json({ conversation: Conversation.getForUser(req.conversation.id, req.user) });
  } catch (err) {
    next(err);
  }
};

exports.leave = (req, res, next) => {
  try {
    if (req.conversation.type !== "group") throw httpError(400, "Solo puedes salir de grupos.");
    const conversationId = req.conversation.id;
    systemMessage(conversationId, req.user.id, "left");
    Conversation.removeMember(conversationId, req.user.id);

    // Si se va el último administrador, el más antiguo pasa a serlo
    const remaining = Conversation.members(conversationId, req.user);
    if (remaining.length && !remaining.some((m) => m.role === "admin")) {
      Conversation.updateMember(conversationId, remaining[0].id, { role: "admin" });
    }
    realtime.toUsers([req.user.id], "conversation:removed", { conversationId });
    realtime.conversation(conversationId, undefined, "conversation:update");
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
