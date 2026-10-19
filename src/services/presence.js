// Usuarios conectados en este proceso. Un usuario puede tener varias pestañas
// o dispositivos abiertos, por eso se cuentan los sockets.
const sockets = new Map(); // userId -> número de sockets
// Sockets con Yabla visible en pantalla (pestaña activa o app en primer plano)
const visible = new Map(); // userId -> Set(socketId)

module.exports = {
  /** Devuelve true si es la primera conexión del usuario. */
  connect(userId) {
    const count = (sockets.get(userId) || 0) + 1;
    sockets.set(userId, count);
    return count === 1;
  },

  /** Devuelve true si era la última conexión del usuario. */
  disconnect(userId, socketId) {
    if (socketId) module.exports.setVisible(userId, socketId, false);
    const count = (sockets.get(userId) || 1) - 1;
    if (count <= 0) {
      sockets.delete(userId);
      return true;
    }
    sockets.set(userId, count);
    return false;
  },

  isOnline(userId) {
    return sockets.has(userId);
  },

  /** El cliente avisa cuando la pestaña o la app pasa a primer o segundo plano. */
  setVisible(userId, socketId, isVisible) {
    const set = visible.get(userId) || new Set();
    if (isVisible) set.add(socketId);
    else set.delete(socketId);
    if (set.size) visible.set(userId, set);
    else visible.delete(userId);
  },

  /** true si el usuario tiene Yabla a la vista en algún dispositivo (entonces no hace falta notificación push). */
  isActive(userId) {
    return visible.has(userId);
  },
};
