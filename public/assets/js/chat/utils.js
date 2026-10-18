// Utilidades de DOM y formato.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const icon = (name, extra) => Yabla.icon(name, extra);
export const toast = (msg, opts) => Yabla.toast(msg, opts);
export const toastError = (msg) => Yabla.toast(msg, { tone: "error" });

export function escapeHTML(text = "") {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/** Texto seguro con enlaces clicables. */
export function linkify(text = "") {
  return escapeHTML(text).replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]])/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

export const firstName = (name = "") => name.split(" ")[0];

const sameDay = (a, b) => a.toDateString() === b.toDateString();
const yesterday = () => new Date(Date.now() - 864e5);

export function timeLabel(ms) {
  return new Date(ms).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

/** Hora para la lista: hoy → 14:32, ayer → Ayer, esta semana → lunes, antes → 12/10/26. */
export function listTime(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  const now = new Date();
  if (sameDay(d, now)) return timeLabel(ms);
  if (sameDay(d, yesterday())) return "Ayer";
  if (now - d < 6 * 864e5) return d.toLocaleDateString("es", { weekday: "long" });
  return d.toLocaleDateString("es", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

/** Separador de días dentro del chat. */
export function dayLabel(ms) {
  const d = new Date(ms);
  if (sameDay(d, new Date())) return "Hoy";
  if (sameDay(d, yesterday())) return "Ayer";
  return d.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
}

export function lastSeenLabel(user) {
  if (user.online) return "en línea";
  if (!user.lastSeen) return "";
  const d = new Date(user.lastSeen);
  if (sameDay(d, new Date())) return `últ. vez hoy a las ${timeLabel(user.lastSeen)}`;
  if (sameDay(d, yesterday())) return `últ. vez ayer a las ${timeLabel(user.lastSeen)}`;
  return `últ. vez el ${d.toLocaleDateString("es", { day: "numeric", month: "short" })}`;
}

export function relativeTime(ms) {
  const mins = Math.round((Date.now() - ms) / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  return listTime(ms);
}

/** Dinero en centavos/céntimos: $12.50 (dólares) o ₡8 500 (colones, sin céntimos si son enteros). */
export function money(cents = 0, currency = "USD") {
  const amount = cents / 100;
  if (currency === "CRC") {
    const whole = Number.isInteger(amount);
    return amount.toLocaleString("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 });
  }
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export const CURRENCIES = {
  USD: { symbol: "$", label: "Dólares", code: "USD", max: 100000, step: "0.01", min: "0.01" },
  CRC: { symbol: "₡", label: "Colones", code: "CRC", max: 50000000, step: "1", min: "1" },
};

export function duration(seconds = 0) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(h ? 2 : 1, "0");
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function fileSize(bytes = 0) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export const isMobile = () => matchMedia("(max-width: 860px)").matches;
export const isWide = () => matchMedia("(min-width: 1280px)").matches;

/** Preferencias locales del navegador. */
export const prefs = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(`yabla:${key}`);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`yabla:${key}`, JSON.stringify(value));
    } catch {
      /* sin persistencia */
    }
  },
};
