// App instalable y notificaciones push:
// - registra el service worker (/sw.js) y suscribe este dispositivo a las notificaciones;
// - le dice al servidor si Yabla está a la vista (si lo está, no hace falta push);
// - abre el chat al tocar una notificación, cierra las de un chat al abrirlo y pone el
//   número de no leídos en el icono de la app;
// - botón «Instalar Yabla» (Android/escritorio) e instrucciones para iPhone.
import { $, icon, toast, toastError, prefs, isMobile } from "./utils.js";
import { state, on, emit, getConv, upsertConversation } from "./state.js";
import { api } from "./api.js";
import { socket } from "./socket.js";
import { openModal, onModalOpen, registerAction } from "./ui.js";

const hasSW = "serviceWorker" in navigator && window.isSecureContext;
const hasPush = hasSW && "PushManager" in window && "Notification" in window;
export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
export const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

let registration = null;
let subscription = null;
let installPrompt = null;
let openChatFn = () => {};

const userPref = () => `push:${state.me.id}`;
const permission = () => ("Notification" in window ? Notification.permission : "denied");

/** true si este dispositivo recibe notificaciones push (entonces no hacen falta las locales). */
export const pushEnabled = () => Boolean(subscription) && permission() === "granted";

/** on | off | denied | ios-install | unsupported */
export function pushStatus() {
  if (isIOS && !isStandalone()) return "ios-install";
  if (!hasPush) return "unsupported";
  if (permission() === "denied") return "denied";
  return pushEnabled() ? "on" : "off";
}

function keyBytes(base64) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

const sameKey = (sub, key) => {
  const current = sub?.options?.applicationServerKey;
  if (!current) return true;
  const a = new Uint8Array(current);
  const b = keyBytes(key);
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

/** Notificación del sistema sin push (pestaña en segundo plano y push desactivado). */
export function showLocalNotification(title, options = {}) {
  if (permission() !== "granted") return;
  const opts = { badge: "/assets/images/pwa/badge-96.png", renotify: true, vibrate: [120, 60, 120], ...options };
  // En Android solo funcionan las notificaciones creadas desde el service worker
  if (registration) registration.showNotification(title, opts).catch(() => {});
  else {
    try {
      const n = new Notification(title, opts);
      n.onclick = () => {
        window.focus();
        if (opts.data?.conversationId) openChatFn(opts.data.conversationId);
      };
    } catch {
      /* este navegador no permite notificaciones sin service worker */
    }
  }
}

async function subscribe(publicKey) {
  if (subscription && !sameKey(subscription, publicKey)) {
    await subscription.unsubscribe().catch(() => {});
    subscription = null;
  }
  subscription ||= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) });
  await api.pushSubscribe({ subscription: subscription.toJSON(), preview: prefs.get("pushPreview", true) });
}

/** Activa las notificaciones (debe llamarse desde un toque del usuario). */
export async function enablePush() {
  const status = pushStatus();
  if (status === "ios-install") {
    openModal("modal-install");
    return false;
  }
  if (status === "unsupported") {
    toastError("Este navegador no admite notificaciones push.");
    return false;
  }
  if (!registration) registration = await navigator.serviceWorker.ready;
  const result = await Notification.requestPermission();
  if (result !== "granted") {
    toast("Permiso denegado. Puedes activarlo en los ajustes del navegador (icono del candado junto a la dirección).", { icon: "bell-off", duration: 6000 });
    emit("push");
    return false;
  }
  try {
    const { publicKey } = await api.pushKey();
    await subscribe(publicKey);
    prefs.set(userPref(), true);
    toast("Notificaciones activadas en este dispositivo", { tone: "success", icon: "bell-ring" });
    return true;
  } catch (err) {
    // Con el permiso concedido, el navegador puede negarse igual (p. ej. ventanas de incógnito)
    const blocked = err.name === "NotAllowedError" || err.name === "AbortError" || /permission denied|push service/i.test(err.message || "");
    toastError(blocked ? "Este navegador no permite notificaciones push aquí (por ejemplo, en una ventana de incógnito)." : err.message || "No se pudieron activar las notificaciones.");
    return false;
  } finally {
    emit("push");
  }
}

export async function disablePush() {
  const endpoint = subscription?.endpoint;
  prefs.set(userPref(), false);
  try {
    await subscription?.unsubscribe();
  } catch {
    /* ya no existía */
  }
  subscription = null;
  if (endpoint) await api.pushUnsubscribe(endpoint).catch(() => {});
  emit("push");
}

export async function setPushPreview(preview) {
  prefs.set("pushPreview", preview);
  if (subscription) await api.pushPreview(subscription.endpoint, preview);
}

/** Al cerrar sesión: este dispositivo deja de recibir los avisos de esta cuenta. */
export async function forgetDevice() {
  if (!subscription) return;
  const { endpoint } = subscription;
  await Promise.race([
    Promise.all([api.pushUnsubscribe(endpoint).catch(() => {}), subscription.unsubscribe().catch(() => {})]),
    new Promise((r) => setTimeout(r, 1500)),
  ]);
  subscription = null;
}

// --- Visibilidad: el servidor solo envía push si no estás mirando Yabla -------------------
function reportVisibility() {
  socket.emit("app:visibility", { visible: document.visibilityState === "visible" });
}

// --- Número en el icono de la app (pantalla de inicio, barra de tareas) ------------------
function updateBadge() {
  const total = [...state.conversations.values()].reduce((n, c) => n + (c.muted || c.archived ? 0 : c.unread || 0), 0);
  if ("setAppBadge" in navigator) (total ? navigator.setAppBadge(total) : navigator.clearAppBadge()).catch(() => {});
  navigator.serviceWorker?.controller?.postMessage({ type: "badge", count: total });
}

// --- Abrir el chat desde una notificación ----------------------------------------------
async function openFromNotification(conversationId) {
  if (!conversationId) return;
  if (!getConv(conversationId)) {
    try {
      const { conversation } = await api.conversation(conversationId);
      upsertConversation(conversation);
      emit("conversations");
    } catch {
      return;
    }
  }
  openChatFn(conversationId);
}

// --- Tarjeta para activar notificaciones o instalar la app --------------------------------
const DISMISS_DAYS = 7;

function bannerHTML() {
  const status = pushStatus();
  const dismissed = prefs.get("pushBannerUntil", 0) > Date.now();
  if (dismissed) return "";
  if (status === "off" && permission() === "default") {
    return `
      <div class="app-banner" role="status">
        <span class="app-banner-ico">${icon("bell-ring")}</span>
        <span class="app-banner-text"><strong>Activa las notificaciones</strong><small>Te avisamos de mensajes nuevos aunque Yabla esté cerrada.</small></span>
        <button class="btn btn-primary btn-sm" data-action="push-enable">Activar</button>
        <button class="icon-btn app-banner-x" data-action="push-banner-dismiss" aria-label="Ahora no">${icon("x", "icon-sm")}</button>
      </div>`;
  }
  if (status === "ios-install") {
    return `
      <div class="app-banner" role="status">
        <span class="app-banner-ico">${icon("smartphone")}</span>
        <span class="app-banner-text"><strong>Instala Yabla en tu iPhone</strong><small>Así recibes notificaciones con sonido, como una app.</small></span>
        <button class="btn btn-primary btn-sm" data-open="modal-install">Cómo</button>
        <button class="icon-btn app-banner-x" data-action="push-banner-dismiss" aria-label="Ahora no">${icon("x", "icon-sm")}</button>
      </div>`;
  }
  if (installPrompt && isMobile() && !isStandalone()) {
    return `
      <div class="app-banner" role="status">
        <span class="app-banner-ico">${icon("download")}</span>
        <span class="app-banner-text"><strong>Instala Yabla</strong><small>Ábrela desde tu pantalla de inicio, a pantalla completa.</small></span>
        <button class="btn btn-primary btn-sm" data-action="install-app">Instalar</button>
        <button class="icon-btn app-banner-x" data-action="push-banner-dismiss" aria-label="Ahora no">${icon("x", "icon-sm")}</button>
      </div>`;
  }
  return "";
}

function renderBanner() {
  let host = $("#appBanner");
  if (!host) {
    host = document.createElement("div");
    host.id = "appBanner";
    $("#chatFilters")?.after(host);
  }
  host.innerHTML = bannerHTML();
}

// --- Instalar la app ----------------------------------------------------------------
export const canInstall = () => !isStandalone() && (Boolean(installPrompt) || isIOS);

export async function installApp() {
  if (installPrompt) {
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice.catch(() => ({}));
    if (outcome === "accepted") installPrompt = null;
    emit("push");
    return;
  }
  openModal("modal-install");
}

// --- Ajustes: sección «Notificaciones» -------------------------------------------------
const STATUS_TEXT = {
  on: "Activadas: te llegan aunque Yabla esté cerrada",
  off: "Desactivadas en este dispositivo",
  denied: "Bloqueadas en el navegador. Permítelas desde el icono del candado junto a la dirección",
  "ios-install": "En iPhone, primero instala Yabla en tu pantalla de inicio",
  unsupported: window.isSecureContext ? "Este navegador no admite notificaciones push" : "Necesitan una conexión segura (https)",
};

function renderSettings() {
  const status = pushStatus();
  const sw = $("#pushSwitch");
  if (!sw) return;
  sw.checked = status === "on";
  sw.disabled = status === "unsupported" || status === "denied";
  $("#pushStatus").textContent = STATUS_TEXT[status];
  $("#pushStatus").dataset.state = status;
  $("#pushPreviewSwitch").checked = prefs.get("pushPreview", true);
  $("#pushPreviewRow").classList.toggle("is-disabled", status !== "on");
  $("#pushPreviewSwitch").disabled = status !== "on";
  $("#pushTest").hidden = status !== "on";
  $("#installRow").hidden = !canInstall();
  $("#installApp").textContent = isIOS && !installPrompt ? "Cómo instalar" : "Instalar";
}

export function initPush({ openChat }) {
  openChatFn = openChat;

  // Service worker: notificaciones, caché sin conexión y número del icono
  if (hasSW) {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(async (reg) => {
        registration = reg;
        subscription = (await reg.pushManager?.getSubscription()) || null;
        const wanted = prefs.get(userPref(), false);
        if (permission() === "granted" && wanted) {
          // Vuelve a registrar el dispositivo (servidor reiniciado, claves nuevas o suscripción renovada)
          const { publicKey } = await api.pushKey();
          if (publicKey) await subscribe(publicKey).catch(() => {});
        } else if (subscription && !wanted) {
          // Suscripción de otra cuenta que usó este navegador: se anula
          await subscription.unsubscribe().catch(() => {});
          subscription = null;
        }
        emit("push");
      })
      .catch((err) => console.warn("[sw]", err));

    navigator.serviceWorker.addEventListener("message", (e) => {
      if (e.data?.type === "open-chat") openFromNotification(Number(e.data.conversationId));
    });
  }

  // Visibilidad para el servidor
  socket.on("connect", reportVisibility);
  if (socket.connected) reportVisibility();
  document.addEventListener("visibilitychange", reportVisibility);
  window.addEventListener("pagehide", () => socket.emit("app:visibility", { visible: false }));

  // Al abrir un chat, se cierran sus notificaciones pendientes
  on("active", (id) => {
    if (id) navigator.serviceWorker?.controller?.postMessage({ type: "clear", conversationId: id });
  });
  on("conversations", updateBadge);
  on("receipts", updateBadge);
  updateBadge();

  // Instalación
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installPrompt = e;
    emit("push");
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    toast("¡Yabla está instalada! Ábrela desde tu pantalla de inicio", { tone: "success", icon: "smartphone" });
    emit("push");
  });

  // Acciones
  registerAction("push-enable", () => enablePush());
  registerAction("push-banner-dismiss", () => {
    prefs.set("pushBannerUntil", Date.now() + DISMISS_DAYS * 864e5);
    renderBanner();
  });
  registerAction("install-app", () => installApp());

  // Ajustes
  onModalOpen("modal-settings", renderSettings);
  $("#pushSwitch")?.addEventListener("change", async (e) => {
    e.target.disabled = true;
    if (e.target.checked) await enablePush();
    else {
      await disablePush();
      toast("Notificaciones desactivadas en este dispositivo", { icon: "bell-off" });
    }
    renderSettings();
  });
  $("#pushPreviewSwitch")?.addEventListener("change", (e) =>
    setPushPreview(e.target.checked)
      .then(() => toast(e.target.checked ? "Se mostrará quién escribe y el mensaje" : "Las notificaciones solo dirán «Tienes un mensaje nuevo»", { tone: "success" }))
      .catch((err) => toastError(err.message))
  );
  $("#pushTest")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      await api.pushTest();
      toast("Enviada. Si no la ves, revisa que el modo No molestar del teléfono esté apagado.", { icon: "bell-ring", duration: 5000 });
    } catch (err) {
      toastError(err.message);
    } finally {
      btn.disabled = false;
    }
  });
  $("#installApp")?.addEventListener("click", () => installApp());

  // Instrucciones de instalación: iPhone o Android/escritorio
  onModalOpen("modal-install", () => {
    $("#installIos").hidden = !isIOS;
    $("#installOther").hidden = isIOS;
  });

  on("push", () => {
    renderBanner();
    if ($("#modal-settings")?.classList.contains("is-open")) renderSettings();
  });
  renderBanner();
}
