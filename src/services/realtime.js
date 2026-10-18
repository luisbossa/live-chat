// Punto único para emitir eventos de Socket.IO desde controladores y sockets.
// Cada usuario está en la sala `user:<id>` (todas sus pestañas y dispositivos).
const User = require("../models/User");
const Conversation = require("../models/Conversation");

let io = null;

const room = (userId) => `user:${userId}`;

const realtime = {
  room,

  attach(server) {
    io = server;
  },

  toUsers(userIds, event, payload) {
    if (!io || !userIds.length) return;
    io.to(userIds.map(room)).emit(event, payload);
  },

  toConversation(conversationId, event, payload) {
    realtime.toUsers(Conversation.memberIds(conversationId), event, payload);
  },

  message(message) {
    realtime.toConversation(message.conversationId, "message:new", message);
  },

  messageUpdated(message) {
    realtime.toConversation(message.conversationId, "message:update", message);
  },

  /** Cada miembro recibe la conversación tal como él la ve (no leídos, silencio, etc.). */
  conversation(conversationId, userIds = Conversation.memberIds(conversationId), event = "conversation:new") {
    userIds.forEach((userId) => {
      const viewer = User.findById(userId);
      const conversation = viewer && Conversation.getForUser(conversationId, viewer);
      if (conversation) realtime.toUsers([userId], event, conversation);
    });
  },

  /** Avisa de lecturas/entregas respetando la privacidad de cada usuario. */
  receipt(conversationId, reader, member) {
    Conversation.memberIds(conversationId).forEach((userId) => {
      const viewer = userId === reader.id ? reader : User.findById(userId);
      const showRead = userId === reader.id || (reader.read_receipts && viewer.read_receipts);
      realtime.toUsers([userId], "receipt", {
        conversationId,
        userId: reader.id,
        lastReadId: showRead ? member.last_read_id : 0,
        lastDeliveredId: Math.max(member.last_delivered_id, showRead ? member.last_read_id : 0),
      });
    });
  },

  presence(user) {
    realtime.toUsers(User.contactIds(user.id), "presence", {
      userId: user.id,
      online: realtime.isOnline(user.id),
      lastSeen: user.show_last_seen ? user.last_seen : null,
    });
  },

  isOnline: (userId) => require("./presence").isOnline(userId),

  /** Sockets conectados de un usuario (para llamadas). */
  async socketsOf(userId) {
    return io ? io.in(room(userId)).fetchSockets() : [];
  },

  toSocket(socketId, event, payload) {
    io?.to(socketId).emit(event, payload);
  },
};

module.exports = realtime;
