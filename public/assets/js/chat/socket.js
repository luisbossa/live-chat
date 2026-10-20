// Conexión Socket.IO (usa la cookie de sesión). Se reconecta sola.
/* global io */
export const socket = io({ transports: ["websocket", "polling"] });

// La contraseña se cambió en otro dispositivo y se cerraron las demás sesiones
socket.on("session:revoked", () => {
  window.location.href = "/login?aviso=contrasena";
});

socket.on("connect_error", (err) => {
  if (err.message === "unauthorized") window.location.href = "/";
});

// --- Aviso de conexión ---------------------------------------------------------------
// Una sola línea arriba (respeta la barra de estado del teléfono): «Sin conexión · Reconectando…»
// con un indicador girando; al volver, «Conectado» en verde un momento. Los cortes de menos de
// un segundo no se muestran (evita parpadeos al cambiar de red).
const banner = document.createElement("div");
banner.id = "connBanner";
banner.className = "conn-banner";
banner.setAttribute("role", "status");
banner.setAttribute("aria-live", "polite");
banner.innerHTML = '<span class="conn-ico" aria-hidden="true"></span><span class="conn-text"><strong></strong><span></span></span>';
document.body.append(banner);

let showTimer = null;
let hideTimer = null;

function showBanner(state) {
  clearTimeout(hideTimer);
  const text = {
    offline: navigator.onLine === false ? ["Sin internet", "Esperando señal…"] : ["Sin conexión", "Reconectando…"],
    online: ["Conectado", ""],
  }[state];
  banner.querySelector("strong").textContent = text[0];
  banner.querySelector(".conn-text span").textContent = text[1];
  banner.dataset.state = state;
  banner.classList.add("is-visible");
}

function hideBanner(delay = 0) {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => banner.classList.remove("is-visible"), delay);
}

// Sin internet en el dispositivo: el texto lo dice (y se actualiza si vuelve la red)
addEventListener("offline", () => banner.dataset.state === "offline" && showBanner("offline"));
addEventListener("online", () => banner.dataset.state === "offline" && showBanner("offline"));

let wasConnected = false;
socket.on("disconnect", () => {
  document.body.classList.add("is-offline");
  clearTimeout(showTimer);
  showTimer = setTimeout(() => socket.connected || showBanner("offline"), 1000);
});
socket.on("connect", () => {
  document.body.classList.remove("is-offline");
  clearTimeout(showTimer);
  if (banner.classList.contains("is-visible") && banner.dataset.state === "offline") {
    showBanner("online");
    hideBanner(1800);
  }
  // Tras una reconexión, se recarga el estado para no perder nada
  if (wasConnected) document.dispatchEvent(new CustomEvent("socket:reconnected"));
  wasConnected = true;
});
