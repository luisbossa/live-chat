// Acciones de mensajes estilo WhatsApp / Telegram: reacción rápida y con cualquier emoji,
// deslizar para responder, selección múltiple, eliminar para mí o para todos,
// info del mensaje (entregado / leído) y mensajes fijados.
import { $, $$, icon, escapeHTML, toast, toastError, timeLabel, isMobile } from "./utils.js";
import { state, activeConv, getConv, isGroup, userName, messagesOf, on } from "./state.js";
import { api } from "./api.js";
import { previewOf, previewIcon, mentionsToNames } from "./format.js";
import { openModal, closeModal, closePopovers, registerAction } from "./ui.js";
import { initEmojiPicker } from "./emoji-picker.js";
import { react, setContext, findMessage, messagesEl, removeMessages, jumpToMessage, closeMessageMenu } from "./conversation.js";
import { openForward, toggleStar } from "./message-extras.js";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
const FORWARDABLE = ["text", "image", "file", "audio", "sticker"];

// ==========================================================================
// Reacción rápida (bandeja) y selector completo
// ==========================================================================
const tray = $("#reactTray");
const picker = $("#reactPicker");
let trayMsg = null;

function place(el, anchor, { width, height }) {
  const r = anchor.getBoundingClientRect();
  const left = Math.max(8, Math.min(r.left + r.width / 2 - width / 2, innerWidth - width - 8));
  const above = r.top - height - 8;
  const top = above > 8 ? above : Math.min(r.bottom + 8, innerHeight - height - 8);
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

/** Abre la bandeja de reacciones junto a `anchor`. Con picker:true solo prepara el selector completo. */
export function openReactTray(msg, anchor, { picker: full = false } = {}) {
  trayMsg = msg;
  if (full) {
    // El botón tiene data-popover="reactPicker": main.js lo abre justo después
    place(picker, anchor, { width: Math.min(380, innerWidth - 16), height: isMobile() ? 320 : 360 });
    return;
  }
  const mine = msg.reactions?.find((r) => r.userIds.includes(state.me.id))?.emoji;
  tray.innerHTML =
    REACTIONS.map((e) => `<button role="menuitem" data-tray-react="${e}" class="${e === mine ? "is-mine" : ""}">${e}</button>`).join("") +
    `<button class="react-more" data-react-more data-popover="reactPicker" aria-label="Más reacciones">${icon("plus", "icon-sm")}</button>`;
  tray.hidden = false;
  place(tray, anchor, { width: tray.offsetWidth, height: tray.offsetHeight });
}

export function closeReactTray() {
  tray.hidden = true;
}

function initReactions() {
  tray.addEventListener("click", (e) => {
    const emoji = e.target.closest("[data-tray-react]")?.dataset.trayReact;
    if (emoji && trayMsg) {
      react(trayMsg, emoji);
      closeReactTray();
    }
    const more = e.target.closest("[data-react-more]");
    if (more && trayMsg) {
      openReactTray(trayMsg, more, { picker: true });
      closeReactTray();
    }
  });
  initEmojiPicker(picker, (emoji) => {
    if (trayMsg) react(trayMsg, emoji);
    closePopovers();
  });
  document.addEventListener("click", (e) => {
    if (!tray.hidden && !e.target.closest("#reactTray, [data-quick-react]")) closeReactTray();
  });
  messagesEl.addEventListener("scroll", closeReactTray, { passive: true });
}

// ==========================================================================
// Deslizar a la derecha para responder (móvil), como WhatsApp
// ==========================================================================
function initSwipeReply() {
  let start = null;
  let bubble = null;
  let fired = false;

  messagesEl.addEventListener(
    "touchstart",
    (e) => {
      const msgEl = e.target.closest(".msg[data-id]");
      if (!msgEl || isSelecting() || e.touches.length > 1) return;
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY, id: msgEl.dataset.id };
      bubble = msgEl.querySelector(".bubble");
      fired = false;
    },
    { passive: true }
  );

  messagesEl.addEventListener(
    "touchmove",
    (e) => {
      if (!start || !bubble) return;
      const dx = e.touches[0].clientX - start.x;
      const dy = Math.abs(e.touches[0].clientY - start.y);
      if (dy > 30 && dx < 20) return reset(); // es un scroll vertical
      if (dx <= 0) return;
      const move = Math.min(dx, 80);
      bubble.style.transition = "none";
      bubble.style.transform = `translateX(${move}px)`;
      bubble.closest(".msg").style.setProperty("--swipe", Math.min(move / 60, 1));
      if (move >= 60 && !fired) {
        fired = true;
        navigator.vibrate?.(12);
      }
    },
    { passive: true }
  );

  function reset() {
    if (bubble) {
      bubble.style.transition = "";
      bubble.style.transform = "";
      bubble.closest(".msg")?.style.removeProperty("--swipe");
    }
    start = null;
    bubble = null;
  }

  ["touchend", "touchcancel"].forEach((evt) =>
    messagesEl.addEventListener(
      evt,
      () => {
        if (fired && start) {
          const msg = findMessage(start.id);
          if (msg && !msg.deletedAt && !msg.pending && msg.type !== "system") setContext("reply", msg);
        }
        reset();
      },
      { passive: true }
    )
  );
}

// ==========================================================================
// Selección de varios mensajes
// ==========================================================================
const selected = new Set();
let selecting = false;

export const isSelecting = () => selecting;
export const isSelected = (id) => selecting && selected.has(String(id));

const selectedMessages = () => {
  const conv = activeConv();
  if (!conv) return [];
  return messagesOf(conv.id).items.filter((m) => selected.has(String(m.id)));
};

export function enterSelect(msg) {
  selecting = true;
  selected.clear();
  if (msg) selected.add(String(msg.id));
  $("#chat").classList.add("is-selecting");
  $("#selectBar").hidden = false;
  closeMessageMenu();
  syncSelection();
}

export function exitSelect() {
  selecting = false;
  selected.clear();
  $("#chat").classList.remove("is-selecting");
  $("#selectBar").hidden = true;
  $$(".msg.is-selected", messagesEl).forEach((el) => el.classList.remove("is-selected"));
}

export function toggleSelected(id) {
  const msg = findMessage(id);
  if (!msg || msg.pending || msg.type === "system") return;
  const key = String(id);
  if (selected.has(key)) selected.delete(key);
  else selected.add(key);
  syncSelection();
}

function syncSelection() {
  $$(".msg[data-id]", messagesEl).forEach((el) => el.classList.toggle("is-selected", selected.has(el.dataset.id)));
  const msgs = selectedMessages();
  const n = msgs.length;
  $("#selectCount").textContent = n === 1 ? "1 seleccionado" : `${n} seleccionados`;
  const live = msgs.filter((m) => !m.deletedAt);
  $('[data-select-action="copy"]').disabled = !live.some((m) => m.body);
  $('[data-select-action="star"]').disabled = !live.length;
  $('[data-select-action="forward"]').disabled = !live.length || live.length !== n || !live.every((m) => FORWARDABLE.includes(m.type));
  $('[data-select-action="delete"]').disabled = !n;
}

async function selectAction(action) {
  const msgs = selectedMessages().sort((a, b) => a.id - b.id);
  if (!msgs.length) return;
  if (action === "copy") {
    // Formato de WhatsApp: [14:32] Karla: texto
    const lines = msgs.filter((m) => m.body && !m.deletedAt).map((m) => `[${timeLabel(m.createdAt)}] ${userName(m.senderId)}: ${m.body}`);
    await navigator.clipboard?.writeText(msgs.length === 1 ? msgs[0].body : lines.join("\n")).catch(() => {});
    toast(lines.length === 1 ? "Mensaje copiado" : `${lines.length} mensajes copiados`, { tone: "success", icon: "copy" });
    exitSelect();
  }
  if (action === "star") {
    const live = msgs.filter((m) => !m.deletedAt);
    // Si todos estaban destacados se quitan; si no, se destacan los que faltan
    const allStarred = live.every((m) => state.starred.has(m.id));
    for (const m of live) if (state.starred.has(m.id) === allStarred) await toggleStar(m, { silent: true });
    toast(allStarred ? "Ya no están destacados" : `${live.length === 1 ? "Mensaje destacado" : `${live.length} mensajes destacados`}`, { icon: allStarred ? "star-off" : "star" });
    exitSelect();
  }
  if (action === "forward") {
    openForward(msgs);
    exitSelect();
  }
  if (action === "delete" && (await askDelete(msgs))) exitSelect();
}

function initSelection() {
  $("#selectBar").addEventListener("click", (e) => {
    const action = e.target.closest("[data-select-action]")?.dataset.selectAction;
    if (action) selectAction(action);
  });
  registerAction("cancel-select", exitSelect);
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && selecting && !$$(".modal.is-open").length) {
        e.stopImmediatePropagation();
        exitSelect();
      }
    },
    true
  );
  on("active", () => selecting && exitSelect());
}

// ==========================================================================
// Eliminar: para mí o para todos
// ==========================================================================
let deleteResolve = null;

/** Pregunta cómo eliminar. Devuelve true si se eliminó. */
export function askDelete(msgs) {
  const n = msgs.length;
  const canAll = msgs.every((m) => m.senderId === state.me.id && !m.deletedAt && !["call", "system"].includes(m.type) && !m.pending);
  $("#deleteMsgsTitle").textContent = n === 1 ? "¿Eliminar mensaje?" : `¿Eliminar ${n} mensajes?`;
  $("#deleteMsgsText").textContent = canAll
    ? "Puedes eliminarlo solo de tu chat o para todos los participantes."
    : "Se eliminará solo de tu chat. Los demás lo seguirán viendo.";
  $("#deleteForAll").hidden = !canAll;
  openModal("modal-delete-msgs");

  return new Promise((resolve) => {
    deleteResolve = async (choice) => {
      deleteResolve = null;
      closeModal("modal-delete-msgs");
      if (!choice) return resolve(false);
      try {
        if (choice === "all") {
          for (const m of msgs) await api.deleteMessage(m.id);
          toast(n === 1 ? "Mensaje eliminado para todos" : `${n} mensajes eliminados para todos`, { icon: "trash" });
        } else {
          const { hidden } = await api.hideMessages(msgs.map((m) => m.id));
          removeMessages(msgs[0].conversationId, hidden);
          toast(n === 1 ? "Mensaje eliminado para ti" : `${n} mensajes eliminados para ti`, { icon: "trash" });
        }
        resolve(true);
      } catch (err) {
        toastError(err.message);
        resolve(false);
      }
    };
  });
}

function initDelete() {
  $("#modal-delete-msgs").addEventListener("click", (e) => {
    const choice = e.target.closest("[data-delete-choice]")?.dataset.deleteChoice;
    if (choice) deleteResolve?.(choice);
  });
  $("#modal-delete-msgs").addEventListener("modal:close", () => deleteResolve?.(null));
}

// ==========================================================================
// Info del mensaje
// ==========================================================================
function when(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  const today = new Date();
  const yesterday = new Date(Date.now() - 864e5);
  const day =
    d.toDateString() === today.toDateString() ? "hoy" : d.toDateString() === yesterday.toDateString() ? "ayer" : d.toLocaleDateString("es", { day: "numeric", month: "short" });
  return `${day} a las ${timeLabel(ms)}`;
}

const personRow = (r, time) => `
  <li>
    <img src="${escapeHTML(r.user.avatar)}" alt="">
    <span><strong>${escapeHTML(r.user.name)}</strong><small>${time}</small></span>
  </li>`;

export async function openMessageInfo(msg) {
  const conv = getConv(msg.conversationId);
  const kind = previewIcon(msg);
  $("#msgInfoPreview").innerHTML = `
    <div class="msg-info-bubble">
      ${msg.type === "image" || msg.type === "sticker" ? `<img src="${msg.mediaUrl}" alt="">` : ""}
      <p>${kind ? icon(kind, "icon-sm") : ""}${escapeHTML(previewOf({ ...conv, type: "direct" }, { ...msg, senderId: -1 }))}</p>
      <small>Enviado ${when(msg.createdAt)}</small>
    </div>`;
  $("#msgInfoBody").innerHTML = `<p class="muted"><span class="spinner"></span></p>`;
  openModal("modal-msg-info");

  try {
    const { recipients } = await api.messageInfo(msg.id);
    const read = recipients.filter((r) => r.read);
    const delivered = recipients.filter((r) => r.delivered && !r.read);
    const pending = recipients.filter((r) => !r.delivered);

    if (!isGroup(conv) && recipients.length === 1) {
      const r = recipients[0];
      $("#msgInfoBody").innerHTML = `
        <ul class="info-steps">
          <li class="${r.read ? "is-done is-read" : ""}">${icon("check-check")}<span><strong>Leído</strong><small>${r.read ? when(r.readAt) || "Sí" : "Aún no"}</small></span></li>
          <li class="${r.delivered ? "is-done" : ""}">${icon("check-check")}<span><strong>Entregado</strong><small>${r.delivered ? when(r.deliveredAt) || "Sí" : "Aún no"}</small></span></li>
        </ul>
        ${!r.read && r.delivered ? `<p class="muted small">Si ${escapeHTML(r.user.name.split(" ")[0])} desactivó las confirmaciones de lectura, no verás cuándo lo leyó.</p>` : ""}`;
      return;
    }

    const section = (title, list, iconName, cls, timeOf) =>
      list.length
        ? `<section class="info-group ${cls}">
            <h4>${icon(iconName, "icon-sm")}${title} <span class="muted">${list.length}</span></h4>
            <ul>${list.map((r) => personRow(r, timeOf(r))).join("")}</ul>
          </section>`
        : "";
    $("#msgInfoBody").innerHTML =
      section("Leído por", read, "check-check", "is-read", (r) => when(r.readAt)) +
      section("Entregado a", delivered, "check-check", "", (r) => when(r.deliveredAt)) +
      section("Pendiente", pending, "clock", "is-pending", () => "Todavía no lo ha recibido") ||
      `<p class="muted">Nadie más en este chat.</p>`;
  } catch (err) {
    $("#msgInfoBody").innerHTML = `<p class="muted">${escapeHTML(err.message)}</p>`;
  }
}

// ==========================================================================
// Mensajes fijados
// ==========================================================================
const pinIndex = new Map(); // conversationId -> { i: índice mostrado, n: cuántos había }

export async function togglePinMessage(msg) {
  try {
    const { pinned } = await api.pin(msg.id);
    toast(pinned ? "Mensaje fijado" : "Mensaje desfijado", { icon: pinned ? "pin" : "pin-off" });
  } catch (err) {
    toastError(err.message);
  }
}

export function renderPinnedBar(conv = activeConv()) {
  const bar = $("#pinnedBar");
  const pins = conv?.pinnedMessages || [];
  bar.hidden = !conv || !pins.length;
  if (bar.hidden) return;

  // Al fijarse uno nuevo se muestra ese (el más reciente); si no, se mantiene el que se veía
  const saved = pinIndex.get(conv.id);
  let i = !saved || saved.n !== pins.length ? pins.length - 1 : Math.min(saved.i, pins.length - 1);
  pinIndex.set(conv.id, { i, n: pins.length });
  const pin = pins[i];
  const kind = previewIcon(pin);

  $("#pinnedMarks").innerHTML = pins.map((_, j) => `<i class="${j === i ? "is-active" : ""}"></i>`).join("");
  $("#pinnedTitle").textContent = pins.length > 1 ? `Mensaje fijado ${i + 1} de ${pins.length}` : "Mensaje fijado";
  const text = pin.type === "text" ? mentionsToNames(conv, pin.body || "") : previewOf({ ...conv, type: "direct" }, { ...pin, senderId: -1 });
  $("#pinnedPreview").innerHTML = `${kind ? icon(kind, "icon-sm") : ""}${escapeHTML(text)}`;
  $("#pinnedThumb").innerHTML = pin.type === "image" || pin.type === "sticker" ? `<img src="${pin.mediaUrl}" alt="">` : "";
  $("#pinnedThumb").hidden = !$("#pinnedThumb").innerHTML;
}

function initPinned() {
  $("#pinnedMain").addEventListener("click", async () => {
    const conv = activeConv();
    const pins = conv?.pinnedMessages || [];
    if (!pins.length) return;
    const i = pinIndex.get(conv.id)?.i ?? pins.length - 1;
    await jumpToMessage(pins[i].id);
    // El siguiente toque lleva al anterior fijado (como en Telegram)
    pinIndex.set(conv.id, { i: (i - 1 + pins.length) % pins.length, n: pins.length });
    renderPinnedBar(conv);
  });
  $("#pinnedUnpin").addEventListener("click", () => {
    const conv = activeConv();
    const pin = conv?.pinnedMessages?.[pinIndex.get(conv.id)?.i ?? 0];
    if (pin) togglePinMessage(pin);
  });
  on("conversations", () => renderPinnedBar());
}

export function initChatActions() {
  initReactions();
  initSwipeReply();
  initSelection();
  initDelete();
  initPinned();
}

