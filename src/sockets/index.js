const { Server } = require("socket.io");
const sessionMiddleware = require("../config/session");
const User = require("../models/User");
const presence = require("../services/presence");
const realtime = require("../services/realtime");
const registerChatHandlers = require("./chat");
const registerCallHandlers = require("./calls");

module.exports = function createSocketServer(httpServer) {
  const io = new Server(httpServer, { maxHttpBufferSize: 1e6 });
  realtime.attach(io);

  // Misma sesión que Express: solo usuarios autenticados
  io.engine.use(sessionMiddleware);
  io.use((socket, next) => {
    const userId = socket.request.session?.userId;
    if (!userId || !User.findById(userId)) return next(new Error("unauthorized"));
    socket.userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    const { userId } = socket;
    socket.join(realtime.room(userId));

    if (presence.connect(userId)) realtime.presence(User.findById(userId));

    registerChatHandlers(io, socket);
    registerCallHandlers(io, socket);

    socket.on("disconnect", () => {
      if (!presence.disconnect(userId)) return;
      User.touchLastSeen(userId);
      realtime.presence(User.findById(userId));
    });
  });

  return io;
};
