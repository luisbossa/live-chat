// Conexión Socket.IO (usa la cookie de sesión). Se reconecta sola.
/* global io */
export const socket = io({ transports: ["websocket", "polling"] });

socket.on("connect_error", (err) => {
  if (err.message === "unauthorized") window.location.href = "/";
});

let wasConnected = false;
socket.on("disconnect", () => {
  document.body.classList.add("is-offline");
});
socket.on("connect", () => {
  document.body.classList.remove("is-offline");
  // Tras una reconexión, se recarga el estado para no perder nada
  if (wasConnected) document.dispatchEvent(new CustomEvent("socket:reconnected"));
  wasConnected = true;
});
