// Service worker de Yabla: notificaciones push (también con la app cerrada), número en el
// icono de la app y página sin conexión. Las llamadas a /api nunca se guardan en caché.
const VERSION = "yabla-v1";
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/assets/images/pwa/icon-192.png", "/assets/images/pwa/badge-96.png", "/assets/images/ui/logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// --- Red -----------------------------------------------------------------------
// Páginas: primero la red; sin conexión, la página «Sin conexión».
// /assets: primero la red (siempre lo último) y, si falla, la copia guardada.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/")) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
});

// --- Notificaciones push --------------------------------------------------------------
const setBadge = (count) => {
  if (!("setAppBadge" in self.navigator)) return Promise.resolve();
  return (count ? self.navigator.setAppBadge(count) : self.navigator.clearAppBadge()).catch(() => {});
};

async function showMessage(data) {
  const tag = `conv-${data.conversationId}`;
  // Varios mensajes del mismo chat se agrupan en una sola notificación (como WhatsApp)
  const previous = await self.registration.getNotifications({ tag });
  const count = (previous[0]?.data?.count || 0) + 1;
  previous.forEach((n) => n.close());
  const title = count > 1 ? `${data.title} · ${count} mensajes nuevos` : data.title;
  await self.registration.showNotification(title, {
    body: data.mention ? `Te mencionó · ${data.body}` : data.body,
    icon: data.icon,
    badge: "/assets/images/pwa/badge-96.png",
    tag,
    renotify: true,
    timestamp: data.timestamp || Date.now(),
    vibrate: [120, 60, 120],
    data: { kind: "message", url: data.url, conversationId: data.conversationId, count },
    actions: [
      { action: "read", title: "Marcar como leído" },
      { action: "open", title: "Responder" },
    ],
  });
  await setBadge(data.unread);
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Yabla", body: event.data?.text() || "Tienes un mensaje nuevo" };
  }

  if (data.kind === "message") {
    event.waitUntil(showMessage(data));
    return;
  }

  if (data.kind === "call") {
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        badge: "/assets/images/pwa/badge-96.png",
        tag: `call-${data.conversationId}`,
        renotify: true,
        requireInteraction: true,
        timestamp: data.timestamp || Date.now(),
        vibrate: [400, 200, 400, 200, 400, 200, 400],
        data: { kind: "call", url: data.url, conversationId: data.conversationId },
        actions: [{ action: "open", title: "Abrir para contestar" }],
      })
    );
    return;
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Yabla", {
      body: data.body || "",
      icon: data.icon || "/assets/images/pwa/icon-192.png",
      badge: "/assets/images/pwa/badge-96.png",
      tag: data.kind || "yabla",
      timestamp: data.timestamp || Date.now(),
      vibrate: [120, 60, 120],
      data: { kind: data.kind || "info", url: data.url || "/chat" },
    })
  );
});

// Toque en la notificación: abre (o enfoca) Yabla en ese chat
self.addEventListener("notificationclick", (event) => {
  const { data = {} } = event.notification;
  event.notification.close();

  if (event.action === "read" && data.conversationId) {
    event.waitUntil(
      fetch(`/api/conversations/${data.conversationId}/read`, { method: "POST", credentials: "include", headers: { Accept: "application/json" } })
        .catch(() => {})
        .then(() => self.registration.getNotifications())
        .then((list) => {
          // Sin notificaciones pendientes, el número del icono desaparece
          if (!list.length) return setBadge(0);
        })
    );
    return;
  }

  const target = new URL(data.url || "/chat", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => new URL(w.url).pathname.startsWith("/chat")) || windows[0];
      if (open) {
        open.postMessage({ type: "open-chat", conversationId: data.conversationId || null });
        return open.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});

// La app pide cerrar las notificaciones de un chat que acaba de abrir, o actualizar el número del icono
self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type === "clear" && msg.conversationId) {
    event.waitUntil(self.registration.getNotifications({ tag: `conv-${msg.conversationId}` }).then((list) => list.forEach((n) => n.close())));
  }
  if (msg.type === "badge") event.waitUntil(setBadge(msg.count || 0));
});

// El navegador renovó la suscripción: se vuelve a registrar en el servidor
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const options = event.oldSubscription?.options;
      if (!options?.applicationServerKey) return;
      const subscription = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: options.applicationServerKey });
      await fetch("/api/push/subscribe", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });
    })().catch(() => {})
  );
});
