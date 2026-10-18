const User = require("../models/User");
const Conversation = require("../models/Conversation");
const realtime = require("../services/realtime");
const validate = require("../utils/validate");

/** Eventos de chat: escribiendo, entregado y leído. */
module.exports = function registerChatHandlers(io, socket, safe) {
  const userId = socket.userId;

  // Al conectarse, lo pendiente pasa a "entregado"
  safe(async () => {
    const [me, delivered] = await Promise.all([User.findById(userId), Conversation.markAllDelivered(userId)]);
    for (const { conversationId } of delivered) {
      await realtime.receipt(conversationId, me, await Conversation.getMember(conversationId, userId));
    }
  })();

  socket.on(
    "typing",
    safe(async ({ conversationId, isTyping } = {}) => {
      const id = validate.toId(conversationId);
      if (!id) return;
      const memberIds = await Conversation.memberIds(id);
      if (!memberIds.includes(userId)) return;
      realtime.toUsers(memberIds.filter((uid) => uid !== userId), "typing", { conversationId: id, userId, isTyping: Boolean(isTyping) });
    })
  );

  // El cliente avisa cuando recibe (entregado) o ve (leído) mensajes
  const updateReceipt = (kind) =>
    safe(async ({ conversationId, messageId } = {}) => {
      const id = validate.toId(conversationId);
      const upTo = validate.toId(messageId);
      if (!id || !upTo) return;
      const before = await Conversation.getMember(id, userId);
      if (!before) return;

      const after = await Conversation.updateReceipts(id, userId, kind === "read" ? { read: upTo } : { delivered: upTo });
      if (after.last_read_id !== before.last_read_id || after.last_delivered_id !== before.last_delivered_id) {
        await realtime.receipt(id, await User.findById(userId), after);
      }
    });

  socket.on("message:delivered", updateReceipt("delivered"));
  socket.on("conversation:read", updateReceipt("read"));
};
