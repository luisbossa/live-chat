// Punto único para emitir eventos de Socket.IO desde controladores y sockets.
// Cada usuario está en la sala `user:<id>` (todas sus pestañas y dispositivos).
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const presence = require("./presence");

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

  async toConversation(conversationId, event, payload) {
    realtime.toUsers(await Conversation.memberIds(conversationId), event, payload);
  },

  message(message) {
    return realtime.toConversation(message.conversationId, "message:new", message);
  },

  messageUpdated(message) {
    return realtime.toConversation(message.conversationId, "message:update", message);
  },

  /** Cada miembro recibe la conversación tal como él la ve (no leídos, silencio, etc.). */
  async conversation(conversationId, userIds, event = "conversation:new") {
    const ids = userIds || (await Conversation.memberIds(conversationId));
    const viewers = await User.findMany(ids);
    await Promise.all(
      ids.map(async (userId) => {
        const viewer = viewers.get(userId);
        const conversation = viewer && (await Conversation.getForUser(conversationId, viewer));
        if (conversation) realtime.toUsers([userId], event, conversation);
      })
    );
  },

  /** Avisa de lecturas/entregas respetando la privacidad de cada usuario. */
  async receipt(conversationId, reader, member) {
    const ids = await Conversation.memberIds(conversationId);
    const viewers = await User.findMany(ids);
    ids.forEach((userId) => {
      const viewer = userId === reader.id ? reader : viewers.get(userId);
      const showRead = userId === reader.id || (reader.read_receipts && viewer?.read_receipts);
      realtime.toUsers([userId], "receipt", {
        conversationId,
        userId: reader.id,
        lastReadId: showRead ? member.last_read_id : 0,
        lastDeliveredId: Math.max(member.last_delivered_id, showRead ? member.last_read_id : 0),
      });
    });
  },

  async presence(user) {
    realtime.toUsers(await User.contactIds(user.id), "presence", {
      userId: user.id,
      online: presence.isOnline(user.id),
      lastSeen: user.show_last_seen ? user.last_seen : null,
    });
  },

  isOnline: (userId) => presence.isOnline(userId),

  /** Desconecta los sockets del usuario que no pertenecen a la sesión `keepSid` (otros dispositivos). */
  async disconnectOtherSessions(userId, keepSid) {
    if (!io) return;
    for (const socket of await io.in(room(userId)).fetchSockets()) {
      if (socket.request?.sessionID === keepSid) continue;
      socket.emit("session:revoked", { reason: "password" });
      socket.disconnect(true);
    }
  },

  toSocket(socketId, event, payload) {
    io?.to(socketId).emit(event, payload);
  },
};

module.exports = realtime;
