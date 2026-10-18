const { Server } = require("socket.io");
const sessionMiddleware = require("../config/session");
const User = require("../models/User");
const presence = require("../services/presence");
const realtime = require("../services/realtime");
const registerChatHandlers = require("./chat");
const registerCallHandlers = require("./calls");

/** Los handlers de socket son async: un error se registra en el log en lugar de tumbar el proceso. */
const safe = (fn) =>
  (...args) =>
    Promise.resolve(fn(...args)).catch((err) => console.error("[socket]", err));

module.exports = function createSocketServer(httpServer) {
  const io = new Server(httpServer, { maxHttpBufferSize: 1e6 });
  realtime.attach(io);

  // Misma sesión que Express: solo usuarios autenticados
  io.engine.use(sessionMiddleware);
  io.use((socket, next) => {
    const userId = socket.request.session?.userId;
    if (!userId) return next(new Error("unauthorized"));
    User.findById(userId)
      .then((user) => {
        if (!user) return next(new Error("unauthorized"));
        socket.userId = userId;
        next();
      })
      .catch(next);
  });

  io.on("connection", (socket) => {
    const { userId } = socket;
    socket.join(realtime.room(userId));

    if (presence.connect(userId)) safe(async () => realtime.presence(await User.findById(userId)))();

    registerChatHandlers(io, socket, safe);
    registerCallHandlers(io, socket, safe);

    socket.on(
      "disconnect",
      safe(async () => {
        if (!presence.disconnect(userId)) return;
        await User.touchLastSeen(userId);
        await realtime.presence(await User.findById(userId));
      })
    );
  });

  return io;
};
