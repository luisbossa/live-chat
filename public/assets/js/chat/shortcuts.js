// Atajos de teclado y buscador rápido (Ctrl + K), como en WhatsApp Web, Slack o Telegram.
import { $, $$, icon, escapeHTML } from "./utils.js";
import { state, sortedConversations, convTitle, convAvatar, peerOf, isGroup, activeConv, getDraft } from "./state.js";
import { openModal, closeModal, openModals, onModalOpen, runAction } from "./ui.js";
import { previewOf } from "./format.js";
import { openChat, openChatSearch } from "./conversation.js";
import { togglePin, toggleArchive } from "./conv-actions.js";
import { setTab } from "./sidebar.js";

const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "⌘" : "Ctrl";

const SHORTCUTS = [
  ["Buscar un chat o acción", [MOD, "K"]],
  ["Chat anterior / siguiente", ["Alt", "↑ / ↓"]],
  ["Buscar en el chat abierto", [MOD, "Shift", "F"]],
  ["Nuevo chat", [MOD, "Alt", "N"]],
  ["Fijar o desfijar el chat", [MOD, "Alt", "P"]],
  ["Archivar o desarchivar el chat", [MOD, "Alt", "E"]],
  ["Editar tu último mensaje", ["↑"], "con el campo vacío"],
  ["Enviar / salto de línea", ["Enter", "Shift + Enter"]],
  ["Pegar una imagen o archivo", [MOD, "V"]],
  ["Cerrar menús y ventanas", ["Esc"]],
  ["Ver estos atajos", [MOD, "/"]],
];

// Acciones que también aparecen en el buscador rápido
const ACTIONS = [
  { label: "Nuevo chat", icon: "chat-plus", run: () => openModal("modal-new-chat") },
  { label: "Nuevo grupo", icon: "users", run: () => openModal("modal-group") },
  { label: "Conocer gente", icon: "flame", run: () => setTab("discover") },
  { label: "Mi perfil de citas", icon: "heart", run: () => openModal("modal-dating") },
  { label: "Mensajes destacados", icon: "star", run: () => openModal("modal-starred") },
  { label: "Chats archivados", icon: "archive", run: () => (setTab("chats"), runAction("open-archived")) },
  { label: "Publicar un estado", icon: "camera", run: () => runAction("my-status") },
  { label: "Billetera", icon: "wallet", run: () => openModal("modal-wallet") },
  { label: "Mi código QR", icon: "qr", run: () => openModal("modal-qr") },
  { label: "Ajustes y apariencia", icon: "palette", run: () => openModal("modal-settings") },
  { label: "Cambiar contraseña", icon: "lock", run: () => openModal("modal-password") },
  { label: "Cambiar tema claro / oscuro", icon: "moon", run: () => Yabla.toggleTheme() },
  { label: "Atajos de teclado", icon: "keyboard", run: () => openModal("modal-shortcuts") },
];

/** Sin tildes ni mayúsculas, para que "maria" encuentre "María". */
const norm = (text = "") => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function mark(text, q) {
  if (!q) return escapeHTML(text);
  const i = norm(text).indexOf(q);
  if (i < 0) return escapeHTML(text);
  return `${escapeHTML(text.slice(0, i))}<mark>${escapeHTML(text.slice(i, i + q.length))}</mark>${escapeHTML(text.slice(i + q.length))}`;
}

// ==========================================================================
// Buscador rápido
// ==========================================================================
let results = [];
let cursor = 0;

function buildResults(raw) {
  const q = norm(raw.trim());
  const chats = sortedConversations()
    .filter((c) => c.lastMessage || isGroup(c) || c.clearedId > 0)
    .filter((c) => !q || norm(convTitle(c)).includes(q) || norm(peerOf(c)?.username).includes(q))
    .slice(0, q ? 12 : 6)
    .map((c) => ({ type: "chat", conv: c }));
  const actions = ACTIONS.filter((a) => !q || norm(a.label).includes(q))
    .slice(0, q ? 6 : 5)
    .map((a) => ({ type: "action", action: a }));
  return { q, items: [...chats, ...actions], chatCount: chats.length };
}

function renderQuick() {
  const { q, items, chatCount } = buildResults($("#quickInput").value);
  results = items;
  cursor = Math.min(cursor, Math.max(0, items.length - 1));
  if (!items.length) {
    $("#quickList").innerHTML = `<li class="quick-empty">${icon("search")}No hay resultados para «${escapeHTML($("#quickInput").value.trim())}»</li>`;
    return;
  }
  const row = (item, i) => {
    const active = i === cursor ? "is-active" : "";
    if (item.type === "chat") {
      const c = item.conv;
      const draft = getDraft(c.id).trim();
      const sub = draft ? `Borrador: ${draft}` : previewOf(c);
      return `
        <li role="option" id="quick-${i}" class="quick-item ${active}" data-quick="${i}" aria-selected="${Boolean(active)}">
          <span class="avatar avatar-sm ${peerOf(c)?.online ? "is-online" : ""}"><img src="${convAvatar(c)}" alt=""></span>
          <span class="quick-text"><strong>${mark(convTitle(c), q)}</strong><small>${escapeHTML(sub)}</small></span>
          ${c.unread ? `<b class="badge">${c.unread}</b>` : ""}
          ${c.archived ? `<span class="quick-tag">${icon("archive", "icon-sm")}Archivado</span>` : ""}
          ${c.id === state.activeId ? `<span class="quick-tag">Abierto</span>` : ""}
        </li>`;
    }
    return `
      <li role="option" id="quick-${i}" class="quick-item ${active}" data-quick="${i}" aria-selected="${Boolean(active)}">
        <span class="quick-icon">${icon(item.action.icon)}</span>
        <span class="quick-text"><strong>${mark(item.action.label, q)}</strong></span>
        <span class="quick-tag">Acción</span>
      </li>`;
  };
  const chatsHTML = items.slice(0, chatCount).map(row).join("");
  const actionsHTML = items.slice(chatCount).map((it, j) => row(it, j + chatCount)).join("");
  $("#quickList").innerHTML =
    (chatsHTML ? `<li class="quick-group">${q ? "Chats" : "Recientes"}</li>${chatsHTML}` : "") +
    (actionsHTML ? `<li class="quick-group">Acciones</li>${actionsHTML}` : "");
  $("#quickInput").setAttribute("aria-activedescendant", `quick-${cursor}`);
}

function moveCursor(delta) {
  if (!results.length) return;
  cursor = (cursor + delta + results.length) % results.length;
  $$(".quick-item").forEach((el) => {
    const on = Number(el.dataset.quick) === cursor;
    el.classList.toggle("is-active", on);
    el.setAttribute("aria-selected", on);
    if (on) el.scrollIntoView({ block: "nearest" });
  });
  $("#quickInput").setAttribute("aria-activedescendant", `quick-${cursor}`);
}

function runResult(i) {
  const item = results[i];
  if (!item) return;
  closeModal("modal-quick");
  if (item.type === "chat") {
    setTab("chats");
    openChat(item.conv.id);
  } else item.action.run();
}

function initQuick() {
  onModalOpen("modal-quick", () => {
    $("#quickInput").value = "";
    cursor = 0;
    renderQuick();
  });
  $("#quickInput").addEventListener("input", () => {
    cursor = 0;
    renderQuick();
  });
  $("#quickInput").addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") moveCursor(1);
    else if (e.key === "ArrowUp") moveCursor(-1);
    else if (e.key === "Enter") runResult(cursor);
    else return;
    e.preventDefault();
  });
  $("#quickList").addEventListener("mousemove", (e) => {
    const item = e.target.closest("[data-quick]");
    if (item && Number(item.dataset.quick) !== cursor) moveCursor(Number(item.dataset.quick) - cursor);
  });
  $("#quickList").addEventListener("click", (e) => {
    const item = e.target.closest("[data-quick]");
    if (item) runResult(Number(item.dataset.quick));
  });
}

// ==========================================================================
// Atajos globales
// ==========================================================================
function stepChat(delta) {
  const ids = $$("#chatList [data-conv], #groupList [data-conv]")
    .filter((b) => b.offsetParent !== null)
    .map((b) => Number(b.dataset.conv));
  if (!ids.length) return;
  const i = ids.indexOf(state.activeId);
  const next = ids[i < 0 ? (delta > 0 ? 0 : ids.length - 1) : (i + delta + ids.length) % ids.length];
  openChat(next);
  $(`[data-conv="${next}"]`)?.scrollIntoView({ block: "nearest" });
}

function onKey(e) {
  const mod = isMac ? e.metaKey : e.ctrlKey;
  const key = e.key.toLowerCase();
  const modalOpen = openModals().length > 0;

  if (mod && !e.altKey && !e.shiftKey && key === "k") {
    e.preventDefault();
    if ($("#modal-quick").classList.contains("is-open")) closeModal("modal-quick");
    else {
      openModals().forEach((m) => closeModal(m));
      openModal("modal-quick");
    }
    return;
  }
  if (mod && (key === "/" || e.code === "Slash")) {
    e.preventDefault();
    openModals().forEach((m) => closeModal(m));
    openModal("modal-shortcuts");
    return;
  }
  if (modalOpen) return;

  if (e.altKey && !mod && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
    e.preventDefault();
    stepChat(e.key === "ArrowDown" ? 1 : -1);
    return;
  }
  const conv = activeConv();
  if (mod && e.shiftKey && key === "f" && conv) {
    e.preventDefault();
    openChatSearch();
    return;
  }
  if (mod && e.altKey) {
    // Con Alt algunas teclas cambian de carácter (p. ej. en Mac): se usa e.code
    const code = e.code.replace("Key", "").toLowerCase();
    if (code === "n") openModal("modal-new-chat");
    else if (code === "p" && conv && !conv.archived) togglePin(conv);
    else if (code === "e" && conv) toggleArchive(conv);
    else return;
    e.preventDefault();
  }
}

function renderShortcuts() {
  $("#shortcutsList").innerHTML = SHORTCUTS.map(
    ([label, keys, note]) => `
      <div>
        <dt>${escapeHTML(label)}${note ? `<small>${escapeHTML(note)}</small>` : ""}</dt>
        <dd>${keys.map((k) => `<kbd>${escapeHTML(k)}</kbd>`).join("")}</dd>
      </div>`
  ).join("");
}

export function initShortcuts() {
  initQuick();
  renderShortcuts();
  if (isMac) $$(".search-kbd").forEach((k) => (k.textContent = "⌘ K"));
  document.addEventListener("keydown", onKey);
}
