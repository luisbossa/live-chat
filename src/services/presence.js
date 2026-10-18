// Usuarios conectados en este proceso. Un usuario puede tener varias pestañas
// o dispositivos abiertos, por eso se cuentan los sockets.
const sockets = new Map(); // userId -> número de sockets

module.exports = {
  /** Devuelve true si es la primera conexión del usuario. */
  connect(userId) {
    const count = (sockets.get(userId) || 0) + 1;
    sockets.set(userId, count);
    return count === 1;
  },

  /** Devuelve true si era la última conexión del usuario. */
  disconnect(userId) {
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
};
