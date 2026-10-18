// Textos derivados de los mensajes (vista previa, sistema, llamadas, pagos).
import { state, userName, isGroup } from "./state.js";
import { duration, money } from "./utils.js";

export function systemText(msg) {
  const mine = msg.senderId === state.me.id;
  const actor = userName(msg.senderId);
  // "Tú creaste…" / "Karla creó…"
  const verb = (me, other) => (mine ? me : other);
  const meta = msg.meta || {};
  switch (meta.action) {
    case "created":
      return `${actor} ${verb("creaste", "creó")} el grupo «${meta.name}»`;
    case "added":
      return `${actor} ${verb("añadiste", "añadió")} a ${(meta.userIds || []).map((id) => userName(id)).join(", ")}`;
    case "left":
      return `${actor} ${verb("saliste", "salió")} del grupo`;
    case "renamed":
      return `${actor} ${verb("cambiaste", "cambió")} el nombre del grupo a «${meta.name}»`;
    default:
      return msg.body || "";
  }
}

export function callText(msg) {
  const { callType, status, duration: secs } = msg.meta || {};
  const mine = msg.senderId === state.me.id;
  const kind = callType === "video" ? "Videollamada" : "Llamada de voz";
  if (status === "completed") return `${kind} · ${duration(secs)}`;
  if (status === "busy") return `${kind} · Ocupado`;
  if (status === "declined") return mine ? `${kind} rechazada` : `${kind} rechazada`;
  return mine ? `${kind} sin respuesta` : `${kind} perdida`;
}

export function paymentText(msg) {
  const amount = money(msg.meta?.amountCents || 0, msg.meta?.currency || "USD");
  return msg.senderId === state.me.id ? `Enviaste ${amount}` : `${userName(msg.senderId, { short: true })} te envió ${amount}`;
}

/** Icono SVG que acompaña a la vista previa (o null para texto normal). */
export function previewIcon(msg) {
  if (!msg) return null;
  if (msg.deletedAt) return "ban";
  const icons = { image: "image", audio: "mic", file: "file", sticker: "sticker", payment: "wallet" };
  if (msg.type === "call") return msg.meta?.callType === "video" ? "video" : "phone";
  return icons[msg.type] || null;
}

/** Texto corto para la lista de chats y notificaciones (sin emojis: el icono va aparte). */
export function previewOf(conv, msg = conv.lastMessage) {
  if (!msg) return "Sin mensajes todavía";
  if (msg.deletedAt) return "Se eliminó este mensaje";
  if (msg.type === "system") return systemText(msg);
  if (msg.type === "call") return callText(msg);
  if (msg.type === "payment") return paymentText(msg);

  const labels = {
    image: msg.body || "Foto",
    audio: `Nota de voz (${duration(msg.meta?.duration)})`,
    file: msg.meta?.name || "Documento",
    sticker: "Sticker",
  };
  const text = labels[msg.type] || msg.body || "";
  if (msg.senderId === state.me.id) return `Tú: ${text}`;
  if (isGroup(conv)) return `${userName(msg.senderId, { short: true })}: ${text}`;
  return text;
}

/** "escribiendo…" o "Bucky está escribiendo…". */
export function typingText(conv) {
  const ids = [...(state.typing.get(conv.id)?.keys() || [])];
  if (!ids.length) return "";
  if (!isGroup(conv)) return "escribiendo…";
  const names = ids.map((id) => userName(id, { short: true }));
  return names.length === 1 ? `${names[0]} está escribiendo…` : `${names.join(", ")} están escribiendo…`;
}
