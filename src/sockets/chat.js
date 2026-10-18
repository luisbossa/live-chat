const User = require("../models/User");
const Conversation = require("../models/Conversation");
const realtime = require("../services/realtime");
const validate = require("../utils/validate");

/** Eventos de chat: escribiendo, entregado y leído. */
module.exports = function registerChatHandlers(io, socket) {
  const userId = socket.userId;

  // Al conectarse, lo pendiente pasa a "entregado"
  const me = User.findById(userId);
  Conversation.markAllDelivered(userId).forEach(({ conversationId }) => {
    realtime.receipt(conversationId, me, Conversation.getMember(conversationId, userId));
  });

  socket.on("typing", ({ conversationId, isTyping } = {}) => {
    const id = validate.toId(conversationId);
    if (!id || !Conversation.getMember(id, userId)) return;
    const others = Conversation.memberIds(id).filter((uid) => uid !== userId);
    realtime.toUsers(others, "typing", { conversationId: id, userId, isTyping: Boolean(isTyping) });
  });

  // El cliente avisa cuando recibe (entregado) o ve (leído) mensajes
  const updateReceipt = (kind) => ({ conversationId, messageId } = {}) => {
    const id = validate.toId(conversationId);
    const upTo = validate.toId(messageId);
    if (!id || !upTo || !Conversation.getMember(id, userId)) return;

    const before = Conversation.getMember(id, userId);
    const after = Conversation.updateReceipts(id, userId, kind === "read" ? { read: upTo } : { delivered: upTo });
    if (after.last_read_id !== before.last_read_id || after.last_delivered_id !== before.last_delivered_id) {
      realtime.receipt(id, User.findById(userId), after);
    }
  };

  socket.on("message:delivered", updateReceipt("delivered"));
  socket.on("conversation:read", updateReceipt("read"));
};
