// Conversación activa: mensajes, barra de escritura, notas de voz, respuestas, reacciones y lectura.
import { $, $$, icon, escapeHTML, linkify, toast, timeLabel, dayLabel, lastSeenLabel, duration, fileSize, isMobile, isWide, prefs, firstName } from "./utils.js";
import {
  state, emit, on, getConv, activeConv, isGroup, peerOf, convTitle, convAvatar, userName, messagesOf, receiptOf, isBlockedConv, upsertConversation,
} from "./state.js";
import { api } from "./api.js";
import { socket } from "./socket.js";
import { systemText, callText, paymentText, typingText, previewOf } from "./format.js";
import { registerAction, closePopovers, openLightbox, confirmDialog, openModal } from "./ui.js";

const app = $("#app");
const messagesEl = $("#messages");
const input = $("#messageInput");
const fileInput = $("#fileInput");

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
const RECEIPT_ICON = { sending: "clock", sent: "check", delivered: "check-check", read: "check-check" };
const EDIT_WINDOW = 15 * 60 * 1000;
const WAVE = [6, 10, 16, 8, 20, 12, 24, 14, 9, 18, 26, 12, 7, 16, 22, 10, 14, 20, 8, 12, 18, 24, 10, 6, 14, 20, 9, 12];

const composeState = { mode: null, message: null }; // mode: reply | edit
let searchQuery = "";
let loadingOlder = false;
let newWhileScrolled = 0;

// ==========================================================================
// Render de mensajes
// ==========================================================================
const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

function highlight(html) {
  if (!searchQuery) return html;
  const q = escapeHTML(searchQuery).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(new RegExp(`(${q})(?![^<]*>)`, "gi"), "<mark>$1</mark>");
}

function replyQuote(msg) {
  const r = msg.replyTo;
  if (!r) return "";
  const labels = { image: "📷 Foto", audio: "🎤 Nota de voz", file: "📄 Documento", sticker: "😊 Sticker" };
  const text = r.deleted ? "Mensaje eliminado" : r.body || labels[r.type] || "";
  return `
    <button class="quote" data-jump="${r.id}">
      ${r.mediaUrl ? `<img src="${r.mediaUrl}" alt="">` : ""}
      <span><strong>${escapeHTML(userName(r.senderId))}</strong><span>${escapeHTML(text)}</span></span>
    </button>`;
}

function reactionsHTML(msg) {
  if (!msg.reactions?.length) return "";
  return `<div class="reactions">${msg.reactions
    .map((r) => `<button class="reaction ${r.userIds.includes(state.me.id) ? "is-mine" : ""}" data-react="${r.emoji}" title="${escapeHTML(r.userIds.map((id) => userName(id)).join(", "))}">${r.emoji}${r.userIds.length > 1 ? ` <b>${r.userIds.length}</b>` : ""}</button>`)
    .join("")}</div>`;
}

function bodyHTML(msg) {
  const text = msg.body ? `<p class="bubble-text">${highlight(linkify(msg.body))}</p>` : "";
  switch (msg.type) {
    case "image":
      return { kind: "is-media", html: `<img src="${msg.mediaUrl}" alt="${escapeHTML(msg.body || "Imagen")}" data-lightbox loading="lazy">${text}` };
    case "sticker":
      return { kind: "is-sticker", html: `<img src="${msg.mediaUrl}" alt="Sticker" loading="lazy">` };
    case "audio":
      return {
        kind: "",
        html: `
          <div class="audio" data-src="${msg.mediaUrl}">
            <button class="audio-play" aria-label="Reproducir">${icon("play")}</button>
            <div class="audio-wave">${WAVE.map((h) => `<i style="height:${h}px"></i>`).join("")}</div>
            <time data-duration="${duration(msg.meta?.duration)}">${duration(msg.meta?.duration)}</time>
          </div>`,
      };
    case "file":
      return {
        kind: "",
        html: `
          <a class="file-chip" href="${msg.mediaUrl}" download="${escapeHTML(msg.meta?.name || "archivo")}" target="_blank" rel="noopener">
            <span>${icon("file")}</span>
            <div><strong>${escapeHTML(msg.meta?.name || "Documento")}</strong><small>${fileSize(msg.meta?.size)} · Descargar</small></div>
          </a>${text}`,
      };
    case "payment":
      return {
        kind: "is-payment",
        html: `
          <div class="payment-card">
            <span class="payment-icon">${icon("wallet")}</span>
            <div><strong>${escapeHTML(paymentText(msg))}</strong>${msg.body ? `<small>${escapeHTML(msg.body)}</small>` : ""}</div>
          </div>`,
      };
    case "call": {
      const missed = !["completed"].includes(msg.meta?.status);
      const mine = msg.senderId === state.me.id;
      return {
        kind: "is-call",
        html: `
          <button class="call-card ${missed ? "is-missed" : ""}" data-call="${msg.meta?.callType || "audio"}">
            <span class="call-card-icon">${icon(msg.meta?.callType === "video" ? "video" : "phone")}</span>
            <span><strong>${escapeHTML(callText(msg))}</strong><small>${icon(mine ? "arrow-up-right" : "arrow-down-left", "icon-sm")} Toca para volver a llamar</small></span>
          </button>`,
      };
    }
    default:
      return { kind: "", html: text };
  }
}

function messageHTML(conv, msg, prev) {
  let html = "";
  if (!prev || !sameDay(prev.createdAt, msg.createdAt)) html += `<div class="date-chip">${dayLabel(msg.createdAt)}</div>`;

  if (msg.type === "system") return `${html}<div class="system-msg" data-id="${msg.id}">${escapeHTML(systemText(msg))}</div>`;

  const me = msg.senderId === state.me.id;
  const grouped = prev && !prev.deletedAt && prev.type !== "system" && prev.senderId === msg.senderId && sameDay(prev.createdAt, msg.createdAt) && msg.createdAt - prev.createdAt < 5 * 60 * 1000;
  const showAuthor = !me && isGroup(conv);
  const author = showAuthor ? state.users.get(msg.senderId) : null;
  const matches = !searchQuery || (msg.body || "").toLowerCase().includes(searchQuery.toLowerCase());

  let content;
  if (msg.deletedAt) {
    content = { kind: "is-deleted", html: `<p class="bubble-text">${icon("ban", "icon-sm")} ${me ? "Eliminaste este mensaje" : "Se eliminó este mensaje"}</p>` };
  } else {
    content = bodyHTML(msg);
  }

  const story = msg.meta?.story && !msg.deletedAt
    ? `<div class="story-quote"><img src="${msg.meta.story.mediaUrl}" alt=""><span>${msg.meta.story.userId === state.me.id ? "Respondió a tu estado" : "Respuesta a un estado"}</span></div>`
    : "";
  const receipt = me && !msg.deletedAt && msg.type !== "call" ? receiptOf(conv, msg) : null;
  const classes = ["msg", me && "me", grouped && "same", !matches && "is-dim", msg.pending && "is-pending"].filter(Boolean).join(" ");

  return `${html}
    <div class="${classes}" data-id="${msg.id}">
      ${showAuthor ? `<span class="avatar"><img src="${author?.avatar || "/assets/images/ui/avatar-default.svg"}" alt=""></span>` : ""}
      <div class="bubble ${content.kind}">
        ${showAuthor && !grouped && msg.type !== "sticker" ? `<span class="bubble-author" style="--hue:${(msg.senderId * 67) % 360}">${escapeHTML(author?.name || "")}</span>` : ""}
        ${msg.deletedAt ? "" : story + replyQuote(msg)}
        ${content.html}
        <span class="bubble-meta">
          ${msg.editedAt && !msg.deletedAt ? "<em>editado</em>" : ""}${timeLabel(msg.createdAt)}
          ${receipt ? `<span class="tick tick-${receipt}">${icon(RECEIPT_ICON[receipt])}</span>` : ""}
        </span>
        ${!msg.deletedAt && !msg.pending ? `<button class="msg-more" data-msg-menu aria-label="Opciones del mensaje">${icon("chevron-down", "icon-sm")}</button>` : ""}
      </div>
      ${msg.deletedAt ? "" : reactionsHTML(msg)}
    </div>`;
}

function renderMessages(conv, { keepScroll = false } = {}) {
  stopAudio();
  const { items, hasMore } = messagesOf(conv.id);
  const prevHeight = messagesEl.scrollHeight;
  const prevTop = messagesEl.scrollTop;

  const top = hasMore ? `<div class="load-more" id="loadMore"><span class="spinner"></span></div>` : `<div class="chat-intro">${icon("lock", "icon-sm")} Los mensajes de este chat son privados entre los participantes.</div>`;
  messagesEl.innerHTML = top + (items.length ? items.map((m, i) => messageHTML(conv, m, items[i - 1])).join("") : `<div class="date-chip chat-placeholder">Aún no hay mensajes. ¡Saluda! 👋</div>`);
  renderTyping(conv);

  if (keepScroll) messagesEl.scrollTop = messagesEl.scrollHeight - prevHeight + prevTop;
  else scrollToBottom(false);
}

const nearBottom = () => messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 160;

function scrollToBottom(smooth = true) {
  messagesEl.style.scrollBehavior = smooth ? "smooth" : "auto";
  messagesEl.scrollTop = messagesEl.scrollHeight;
  newWhileScrolled = 0;
  updateScrollButton();
}

function updateScrollButton() {
  const btn = $("#scrollDown");
  btn.hidden = nearBottom();
  const badge = $(".badge", btn);
  badge.hidden = !newWhileScrolled;
  badge.textContent = newWhileScrolled;
}

function appendMessage(conv, msg) {
  const { items } = messagesOf(conv.id);
  const prev = items[items.length - 2];
  const stick = nearBottom() || msg.senderId === state.me.id;
  $$(".typing-msg, .chat-placeholder", messagesEl).forEach((el) => el.remove());
  messagesEl.insertAdjacentHTML("beforeend", messageHTML(conv, msg, prev));
  messagesEl.lastElementChild.classList.add("is-new");
  renderTyping(conv);
  if (stick) scrollToBottom();
  else {
    newWhileScrolled += 1;
    updateScrollButton();
  }
}

/** Vuelve a pintar un mensaje concreto (edición, reacciones, borrado, confirmación). */
function rerenderMessage(conv, msg, oldId = msg.id) {
  const el = messagesEl.querySelector(`[data-id="${oldId}"]`);
  if (!el) return;
  const { items } = messagesOf(conv.id);
  const index = items.findIndex((m) => m.id === msg.id);
  const tmp = document.createElement("div");
  tmp.innerHTML = messageHTML(conv, msg, items[index - 1]);
  el.replaceWith(tmp.querySelector(`[data-id="${msg.id}"]`));
}

function updateTicks(conv) {
  if (conv.id !== state.activeId) return;
  messagesOf(conv.id).items.forEach((msg) => {
    if (msg.senderId !== state.me.id || msg.deletedAt || msg.type === "call") return;
    const tick = messagesEl.querySelector(`[data-id="${msg.id}"] .tick`);
    if (!tick) return;
    const receipt = receiptOf(conv, msg);
    tick.className = `tick tick-${receipt}`;
    tick.innerHTML = icon(RECEIPT_ICON[receipt]);
  });
}

function renderTyping(conv) {
  $(".typing-msg", messagesEl)?.remove();
  if (!typingText(conv)) return;
  const stick = nearBottom();
  messagesEl.insertAdjacentHTML("beforeend", `<div class="msg typing-msg"><div class="bubble typing"><span></span><span></span><span></span></div></div>`);
  if (stick) scrollToBottom();
}

// ==========================================================================
// Cabecera y estado del chat
// ==========================================================================
export function renderHeader(conv = activeConv()) {
  if (!conv) return;
  const peer = peerOf(conv);
  $("#peerAvatar").className = `avatar ${peer?.online ? "is-online" : ""}`;
  $("#peerAvatar img").src = convAvatar(conv);
  $("#peerName").innerHTML = escapeHTML(convTitle(conv)) + (peer?.official ? icon("verified", "badge-verified") : "");

  const typing = typingText(conv);
  const status = $("#peerStatus");
  if (typing) {
    status.textContent = typing;
    status.className = "is-typing";
  } else if (isGroup(conv)) {
    status.textContent = conv.members.map((m) => (m.id === state.me.id ? "Tú" : firstName(m.name))).join(", ");
    status.className = "";
  } else if (peer?.official) {
    status.textContent = "Cuenta oficial";
    status.className = "";
  } else if (isBlockedConv(conv)) {
    status.textContent = "Bloqueado";
    status.className = "";
  } else {
    status.textContent = lastSeenLabel(peer) || "toca para ver la info";
    status.className = peer?.online ? "is-online" : "";
  }

  $$('.chat-head [data-call]').forEach((b) => (b.hidden = isGroup(conv) || Boolean(peer?.official)));
  const blocked = isBlockedConv(conv);
  $("#composer").classList.toggle("is-blocked", blocked);
  $("#blockedNote").hidden = !blocked;
}

/** Marca como leído lo visible (solo si la pestaña está a la vista). */
export function markRead(conv = activeConv()) {
  if (!conv || conv.id !== state.activeId || document.visibilityState !== "visible") return;
  const last = [...messagesOf(conv.id).items].reverse().find((m) => !m.pending);
  const me = conv.members.find((m) => m.id === state.me.id);
  if (!last || (me && me.lastReadId >= last.id && !conv.unread)) return;
  if (me) me.lastReadId = Math.max(me.lastReadId, last.id);
  conv.unread = 0;
  socket.emit("conversation:read", { conversationId: conv.id, messageId: last.id });
  emit("conversations");
}

async function loadMessages(conv) {
  const store = messagesOf(conv.id);
  if (store.loaded) return;
  const { messages, hasMore } = await api.messages(conv.id);
  store.items = messages;
  store.hasMore = hasMore;
  store.loaded = true;
  messages.forEach((m) => m.senderId && !state.users.has(m.senderId) && state.users.set(m.senderId, { id: m.senderId, name: "Antiguo participante" }));
}

async function loadOlder() {
  const conv = activeConv();
  const store = conv && messagesOf(conv.id);
  if (!store || !store.hasMore || loadingOlder || !store.items.length) return;
  loadingOlder = true;
  try {
    const { messages, hasMore } = await api.messages(conv.id, store.items[0].id);
    store.items = [...messages, ...store.items];
    store.hasMore = hasMore;
    if (conv.id === state.activeId) renderMessages(conv, { keepScroll: true });
  } finally {
    loadingOlder = false;
  }
}

export async function openChat(id) {
  const conv = getConv(id);
  if (!conv) return;

  state.activeId = conv.id;
  app.classList.add("chat-open");
  cancelContext();
  closeChatSearch(false);
  closePopovers();
  renderHeader(conv);
  emit("active", conv);

  messagesEl.innerHTML = `<div class="load-more"><span class="spinner"></span></div>`;
  try {
    await loadMessages(conv);
  } catch (err) {
    toast(err.message);
  }
  if (state.activeId !== conv.id) return; // cambió de chat mientras cargaba
  renderMessages(conv);
  markRead(conv);

  if (isMobile()) {
    if (!history.state?.chat) history.pushState({ chat: conv.id }, "");
  } else {
    input.focus();
  }
  const url = new URL(location.href);
  url.searchParams.set("c", conv.id);
  history.replaceState(history.state, "", url);
}

export function closeChat() {
  app.classList.remove("chat-open", "has-info");
  closePopovers();
  stopAudio();
  state.activeId = null;
  emit("active", null);
}

// ==========================================================================
// Eventos en tiempo real
// ==========================================================================
export function onIncomingMessage(msg) {
  const conv = getConv(msg.conversationId);
  if (!conv) return;
  const store = messagesOf(conv.id);
  const mine = msg.senderId === state.me.id;

  // ¿Reemplaza a un mensaje provisional mío?
  const pendingIndex = msg.clientId ? store.items.findIndex((m) => m.clientId === msg.clientId && m.pending) : -1;
  if (store.items.some((m) => m.id === msg.id)) return;

  if (pendingIndex >= 0) {
    const tempId = store.items[pendingIndex].id;
    store.items[pendingIndex] = msg;
    if (conv.id === state.activeId) rerenderMessage(conv, msg, tempId);
  } else if (store.loaded) {
    store.items.push(msg);
    if (conv.id === state.activeId) appendMessage(conv, msg);
  }

  conv.lastMessage = msg;
  if (!mine && msg.type !== "system") {
    socket.emit("message:delivered", { conversationId: conv.id, messageId: msg.id });
    const visible = conv.id === state.activeId && document.visibilityState === "visible";
    if (visible) markRead(conv);
    else {
      conv.unread = (conv.unread || 0) + 1;
      notify(conv, msg);
    }
  }
  // Quien escribe deja de estar "escribiendo"
  clearTyping(conv.id, msg.senderId);
  emit("conversations");
  if (msg.type === "image" || msg.type === "file") emit("media", conv);
}

export function onMessageUpdate(msg) {
  const conv = getConv(msg.conversationId);
  if (!conv) return;
  const store = messagesOf(conv.id);
  const index = store.items.findIndex((m) => m.id === msg.id);
  if (index >= 0) {
    store.items[index] = msg;
    if (conv.id === state.activeId) rerenderMessage(conv, msg);
  }
  if (conv.lastMessage?.id === msg.id) {
    conv.lastMessage = msg;
    emit("conversations");
  }
}

export function onReceipt({ conversationId, userId, lastReadId, lastDeliveredId }) {
  const conv = getConv(conversationId);
  const member = conv?.members.find((m) => m.id === userId);
  if (!member) return;
  member.lastReadId = Math.max(member.lastReadId, lastReadId);
  member.lastDeliveredId = Math.max(member.lastDeliveredId, lastDeliveredId);
  // Leí en otro dispositivo
  if (userId === state.me.id && conv.lastMessage && lastReadId >= conv.lastMessage.id) conv.unread = 0;
  updateTicks(conv);
  emit("receipts");
}

function clearTyping(conversationId, userId) {
  const map = state.typing.get(conversationId);
  if (!map?.has(userId)) return;
  clearTimeout(map.get(userId));
  map.delete(userId);
  onTypingChanged(conversationId);
}

export function onTyping({ conversationId, userId, isTyping }) {
  if (!state.typing.has(conversationId)) state.typing.set(conversationId, new Map());
  const map = state.typing.get(conversationId);
  clearTimeout(map.get(userId));
  if (isTyping) map.set(userId, setTimeout(() => clearTyping(conversationId, userId), 6000));
  else map.delete(userId);
  onTypingChanged(conversationId);
}

function onTypingChanged(conversationId) {
  const conv = getConv(conversationId);
  if (!conv) return;
  if (conv.id === state.activeId) {
    renderHeader(conv);
    renderTyping(conv);
  }
  emit("typing");
}

// --- Aviso de mensajes nuevos ---
let audioCtx;
function beep() {
  if (!prefs.get("sound", true)) return;
  try {
    audioCtx ||= new AudioContext();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.06, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.25);
  } catch {
    /* sin audio */
  }
}

function notify(conv, msg) {
  if (conv.muted) return;
  beep();
  if (document.visibilityState === "visible") toast(`💬 ${convTitle(conv)}: ${previewOf(conv, msg)}`);
  else if ("Notification" in window && Notification.permission === "granted") {
    const n = new Notification(convTitle(conv), { body: previewOf(conv, msg), icon: convAvatar(conv), tag: `conv-${conv.id}` });
    n.onclick = () => {
      window.focus();
      openChat(conv.id);
    };
  }
}

// ==========================================================================
// Envío
// ==========================================================================
async function send(data, preview) {
  const conv = activeConv();
  if (!conv || isBlockedConv(conv)) return;

  const clientId = `c${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
  const temp = {
    id: `tmp-${clientId}`,
    clientId,
    pending: true,
    conversationId: conv.id,
    senderId: state.me.id,
    type: "text",
    body: null,
    reactions: [],
    createdAt: Date.now(),
    ...preview,
  };
  const store = messagesOf(conv.id);
  store.items.push(temp);
  appendMessage(conv, temp);

  try {
    const { message } = await api.send(conv.id, { ...data, clientId });
    const index = store.items.findIndex((m) => m.id === temp.id);
    if (index >= 0) {
      store.items[index] = message;
      rerenderMessage(conv, message, temp.id);
    }
    conv.lastMessage = message;
    emit("conversations");
  } catch (err) {
    store.items = store.items.filter((m) => m.id !== temp.id);
    messagesEl.querySelector(`[data-id="${temp.id}"]`)?.remove();
    toast(err.message);
  }
}

export function sendStoryReply(conversationId, story, text) {
  return api.send(conversationId, { text, storyId: story.id });
}

function submitText() {
  const text = input.value.trim();
  if (!text) return;

  if (composeState.mode === "edit") {
    const msg = composeState.message;
    cancelContext();
    if (text !== msg.body) {
      api.editMessage(msg.id, text).catch((err) => toast(err.message));
    }
  } else {
    const replyToId = composeState.mode === "reply" ? composeState.message.id : undefined;
    const replyTo = replyToId ? { id: replyToId, senderId: composeState.message.senderId, type: composeState.message.type, body: composeState.message.body } : null;
    cancelContext();
    send({ text, replyToId }, { body: text, replyTo });
  }
  input.value = "";
  autosize();
  stopTyping();
  closePopovers();
  input.focus();
}

function sendFile(file, kind) {
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) return toast("El archivo supera el límite de 5 MB.");
  const isImage = file.type.startsWith("image/") && kind !== "file";
  const preview = isImage
    ? { type: "image", mediaUrl: URL.createObjectURL(file) }
    : { type: "file", meta: { name: file.name, size: file.size } };
  const replyToId = composeState.mode === "reply" ? composeState.message.id : undefined;
  cancelContext();
  send({ file, replyToId }, preview);
}

// --- Escribiendo… ---
let typingActive = false;
let typingTimer;
function startTyping() {
  const conv = activeConv();
  if (!conv) return;
  if (!typingActive) {
    typingActive = true;
    socket.emit("typing", { conversationId: conv.id, isTyping: true });
  }
  clearTimeout(typingTimer);
  typingTimer = setTimeout(stopTyping, 3500);
}

function stopTyping() {
  clearTimeout(typingTimer);
  if (!typingActive) return;
  typingActive = false;
  if (state.activeId) socket.emit("typing", { conversationId: state.activeId, isTyping: false });
}

function autosize() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  const hasText = Boolean(input.value.trim());
  $("#sendBtn").hidden = !hasText && composeState.mode !== "edit";
  $("#micBtn").hidden = hasText || composeState.mode === "edit";
}

// ==========================================================================
// Responder / editar
// ==========================================================================
function setContext(mode, msg) {
  composeState.mode = mode;
  composeState.message = msg;
  const box = $("#composeContext");
  box.hidden = false;
  box.dataset.mode = mode;
  $(".compose-context-icon", box).innerHTML = icon(mode === "edit" ? "edit" : "reply");
  $("#composeContextTitle").textContent = mode === "edit" ? "Editando mensaje" : `Respondiendo a ${userName(msg.senderId)}`;
  $("#composeContextText").textContent = previewOf(activeConv(), { ...msg, senderId: -1 }).replace(/^.*?: /, "") || msg.body || "";
  if (mode === "edit") input.value = msg.body;
  autosize();
  input.focus();
}

function cancelContext() {
  if (composeState.mode === "edit") input.value = "";
  composeState.mode = null;
  composeState.message = null;
  $("#composeContext").hidden = true;
  autosize();
}

// ==========================================================================
// Menú de mensaje (reacciones, responder, copiar, editar, eliminar)
// ==========================================================================
const menu = $("#msgMenu");
let menuMessage = null;

function findMessage(id) {
  const conv = activeConv();
  return conv && messagesOf(conv.id).items.find((m) => String(m.id) === String(id));
}

function openMessageMenu(msgEl, x, y) {
  const msg = findMessage(msgEl.dataset.id);
  if (!msg || msg.pending || msg.deletedAt || msg.type === "system") return;
  menuMessage = msg;
  const mine = msg.senderId === state.me.id;
  const myReaction = msg.reactions?.find((r) => r.userIds.includes(state.me.id))?.emoji;

  $("#msgMenuReactions").innerHTML = REACTIONS.map((e) => `<button data-react-menu="${e}" class="${e === myReaction ? "is-mine" : ""}">${e}</button>`).join("");
  $('[data-msg-action="copy"]', menu).hidden = !msg.body;
  $('[data-msg-action="edit"]', menu).hidden = !mine || msg.type !== "text" || Date.now() - msg.createdAt > EDIT_WINDOW;
  $('[data-msg-action="delete"]', menu).hidden = !mine;

  menu.hidden = false;
  const rect = menu.getBoundingClientRect();
  menu.style.left = `${Math.max(8, Math.min(x, innerWidth - rect.width - 8))}px`;
  menu.style.top = `${Math.max(8, Math.min(y, innerHeight - rect.height - 8))}px`;
}

export function closeMessageMenu() {
  menu.hidden = true;
  menuMessage = null;
}

async function react(msg, emoji) {
  try {
    await api.react(msg.id, emoji);
  } catch (err) {
    toast(err.message);
  }
}

menu.addEventListener("click", async (e) => {
  const msg = menuMessage;
  if (!msg) return;
  const emoji = e.target.closest("[data-react-menu]")?.dataset.reactMenu;
  const action = e.target.closest("[data-msg-action]")?.dataset.msgAction;
  closeMessageMenu();

  if (emoji) return react(msg, emoji);
  if (action === "reply") setContext("reply", msg);
  if (action === "edit") setContext("edit", msg);
  if (action === "copy") {
    await navigator.clipboard?.writeText(msg.body || "");
    toast("Mensaje copiado");
  }
  if (action === "delete" && (await confirmDialog({ title: "¿Eliminar para todos?", text: "El mensaje se eliminará para todos los participantes.", okText: "Eliminar" }))) {
    api.deleteMessage(msg.id).catch((err) => toast(err.message));
  }
});

// Clic derecho y pulsación larga
messagesEl.addEventListener("contextmenu", (e) => {
  const msgEl = e.target.closest(".msg[data-id]");
  if (!msgEl || e.target.closest("a")) return;
  e.preventDefault();
  openMessageMenu(msgEl, e.clientX, e.clientY);
});

let pressTimer;
messagesEl.addEventListener("touchstart", (e) => {
  const msgEl = e.target.closest(".msg[data-id]");
  if (!msgEl) return;
  const t = e.touches[0];
  pressTimer = setTimeout(() => {
    navigator.vibrate?.(15);
    openMessageMenu(msgEl, t.clientX, t.clientY);
  }, 450);
}, { passive: true });
["touchend", "touchmove", "touchcancel"].forEach((evt) => messagesEl.addEventListener(evt, () => clearTimeout(pressTimer), { passive: true }));

// Doble clic: reacción rápida ❤️
messagesEl.addEventListener("dblclick", (e) => {
  const msgEl = e.target.closest(".msg[data-id]");
  const msg = msgEl && findMessage(msgEl.dataset.id);
  if (msg && !msg.pending && !msg.deletedAt && msg.type !== "system" && !e.target.closest("button, a, img[data-lightbox]")) react(msg, "❤️");
});

messagesEl.addEventListener("click", (e) => {
  const t = e.target;
  const more = t.closest("[data-msg-menu]");
  if (more) {
    const r = more.getBoundingClientRect();
    return openMessageMenu(more.closest(".msg"), r.left - 160, r.bottom + 4);
  }
  const chip = t.closest("[data-react]");
  if (chip) {
    const msg = findMessage(chip.closest(".msg").dataset.id);
    return msg && react(msg, chip.dataset.react);
  }
  const jump = t.closest("[data-jump]");
  if (jump) {
    const target = messagesEl.querySelector(`[data-id="${jump.dataset.jump}"]`);
    if (!target) return toast("El mensaje original está más arriba en el historial.");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("is-flash");
    setTimeout(() => target.classList.remove("is-flash"), 1400);
    return;
  }
  if (t.matches("img[data-lightbox]")) return openLightbox(t.src);
  if (t.closest(".audio-play")) return toggleAudio(t.closest(".audio"));
  const wave = t.closest(".audio-wave");
  if (wave) seekAudio(wave, e);
});

messagesEl.addEventListener("scroll", () => {
  if (messagesEl.scrollTop < 80) loadOlder();
  if (nearBottom()) newWhileScrolled = 0;
  updateScrollButton();
});

$("#scrollDown").addEventListener("click", () => scrollToBottom());

// ==========================================================================
// Audio (notas de voz)
// ==========================================================================
const player = new Audio();
let playingEl = null;

function setPlayIcon(el, playing) {
  $(".audio-play", el).innerHTML = icon(playing ? "pause" : "play");
}

export function stopAudio() {
  player.pause();
  if (playingEl) {
    setPlayIcon(playingEl, false);
    $$(".audio-wave i", playingEl).forEach((b) => b.classList.remove("is-played"));
    const t = $("time", playingEl);
    t.textContent = t.dataset.duration;
  }
  playingEl = null;
}

function toggleAudio(el) {
  if (playingEl === el) {
    if (player.paused) player.play();
    else player.pause();
    return setPlayIcon(el, !player.paused);
  }
  stopAudio();
  playingEl = el;
  player.src = el.dataset.src;
  player.play().then(() => setPlayIcon(el, true), () => {
    toast("No se pudo reproducir el audio");
    stopAudio();
  });
}

function seekAudio(wave, e) {
  const el = wave.closest(".audio");
  if (playingEl !== el) return toggleAudio(el);
  const r = wave.getBoundingClientRect();
  if (Number.isFinite(player.duration)) player.currentTime = ((e.clientX - r.left) / r.width) * player.duration;
}

player.addEventListener("timeupdate", () => {
  if (!playingEl || !Number.isFinite(player.duration)) return;
  const bars = $$(".audio-wave i", playingEl);
  const played = Math.round((player.currentTime / player.duration) * bars.length);
  bars.forEach((b, i) => b.classList.toggle("is-played", i < played));
  $("time", playingEl).textContent = duration(player.duration - player.currentTime);
});
player.addEventListener("ended", stopAudio);

// ==========================================================================
// Grabación de notas de voz
// ==========================================================================
const recorder = { media: null, chunks: [], stream: null, started: 0, timer: null, cancelled: false };

async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast("Tu navegador no permite grabar audio.");
  try {
    recorder.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    return toast("Necesitamos permiso para usar el micrófono.");
  }
  recorder.chunks = [];
  recorder.cancelled = false;
  recorder.media = new MediaRecorder(recorder.stream);
  recorder.media.ondataavailable = (e) => e.data.size && recorder.chunks.push(e.data);
  recorder.media.onstop = finishRecording;
  recorder.media.start();
  recorder.started = Date.now();
  $("#recorder").hidden = false;
  $("#composerForm").hidden = true;
  recorder.timer = setInterval(() => ($("#recTime").textContent = duration((Date.now() - recorder.started) / 1000)), 250);
}

function stopRecording(cancel) {
  if (!recorder.media || recorder.media.state === "inactive") return;
  recorder.cancelled = cancel;
  recorder.media.stop();
}

function finishRecording() {
  clearInterval(recorder.timer);
  recorder.stream.getTracks().forEach((t) => t.stop());
  $("#recorder").hidden = true;
  $("#composerForm").hidden = false;
  $("#recTime").textContent = "0:00";
  const seconds = (Date.now() - recorder.started) / 1000;
  if (recorder.cancelled || seconds < 0.8) return;

  const type = recorder.media.mimeType || "audio/webm";
  const file = new File(recorder.chunks, `nota-de-voz.${type.includes("ogg") ? "ogg" : type.includes("mp4") ? "m4a" : "webm"}`, { type });
  send({ file, kind: "audio", duration: Math.round(seconds) }, { type: "audio", mediaUrl: URL.createObjectURL(file), meta: { duration: seconds } });
}

// ==========================================================================
// Búsqueda dentro del chat
// ==========================================================================
function openChatSearch() {
  $("#chatSearch").hidden = false;
  $("#chatSearchInput").focus();
  if (!isWide()) app.classList.remove("has-info");
}

function closeChatSearch(rerender = true) {
  $("#chatSearch").hidden = true;
  $("#chatSearchInput").value = "";
  $("#chatSearchCount").textContent = "";
  if (searchQuery) {
    searchQuery = "";
    const conv = activeConv();
    if (rerender && conv) renderMessages(conv);
  }
}

$("#chatSearchInput").addEventListener("input", (e) => {
  searchQuery = e.target.value.trim();
  const conv = activeConv();
  if (!conv) return;
  renderMessages(conv);
  const hits = $$("mark", messagesEl);
  $("#chatSearchCount").textContent = searchQuery ? `${hits.length} resultado${hits.length === 1 ? "" : "s"}` : "";
  hits.at(-1)?.scrollIntoView({ block: "center" });
});

// ==========================================================================
// Inicialización
// ==========================================================================
export function initConversation() {
  input.addEventListener("input", () => {
    autosize();
    if (input.value.trim()) startTyping();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && prefs.get("enterToSend", true) && !e.isComposing) {
      e.preventDefault();
      submitText();
    }
    if (e.key === "Escape" && composeState.mode) cancelContext();
    if (e.key === "ArrowUp" && !input.value) {
      // Editar el último mensaje propio, como en Telegram
      const conv = activeConv();
      const last = conv && [...messagesOf(conv.id).items].reverse().find((m) => m.senderId === state.me.id && m.type === "text" && !m.deletedAt && !m.pending);
      if (last && Date.now() - last.createdAt < EDIT_WINDOW) {
        e.preventDefault();
        setContext("edit", last);
      }
    }
  });

  input.addEventListener("paste", (e) => {
    const file = [...(e.clipboardData?.files || [])][0];
    if (file?.type.startsWith("image/")) {
      e.preventDefault();
      sendFile(file, "image");
    }
  });

  $("#composerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    submitText();
  });

  // Arrastrar y soltar archivos en el chat
  $("#chat").addEventListener("dragover", (e) => {
    if (state.activeId && e.dataTransfer?.types.includes("Files")) {
      e.preventDefault();
      $("#chat").classList.add("is-dragging");
    }
  });
  $("#chat").addEventListener("dragleave", (e) => {
    if (!e.relatedTarget || !$("#chat").contains(e.relatedTarget)) $("#chat").classList.remove("is-dragging");
  });
  $("#chat").addEventListener("drop", (e) => {
    $("#chat").classList.remove("is-dragging");
    if (!e.dataTransfer?.files.length || !state.activeId) return;
    e.preventDefault();
    sendFile(e.dataTransfer.files[0]);
  });

  // Emojis y stickers
  const emojis = "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 😉 😍 🥰 😘 😋 😛 😜 🤪 😎 🤩 🥳 😏 😒 😔 😢 😭 😤 😡 🤯 😳 🥺 😱 🤔 🤫 🙄 😴 🤤 😷 🤗 👍 👎 👏 🙌 🙏 💪 👋 ✌️ 🤞 👌 ❤️ 🧡 💛 💚 💙 💜 🖤 💔 ✨ 🔥 🎉 🎶 ☕ 🍕 🍿 ⚽ 🎮 📷 ✈️ 🌙".split(" ");
  $("#emojiPanel").innerHTML = emojis.map((em) => `<button type="button" data-emoji="${em}">${em}</button>`).join("");
  $("#emojiPanel").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-emoji]");
    if (!btn) return;
    input.setRangeText(btn.dataset.emoji, input.selectionStart, input.selectionEnd, "end");
    input.focus();
    autosize();
  });

  $("#stickerPanel").addEventListener("popover:open", () => {
    if ($("#stickerPanel").childElementCount) return;
    $("#stickerPanel").innerHTML = Array.from({ length: 35 }, (_, i) => `/assets/images/stickers/sticker${i + 1}.gif`)
      .map((src) => `<button type="button" data-sticker="${src}"><img src="${src}" alt="Sticker" loading="lazy"></button>`)
      .join("");
  });
  $("#stickerPanel").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-sticker]");
    if (!btn) return;
    send({ sticker: btn.dataset.sticker }, { type: "sticker", mediaUrl: btn.dataset.sticker });
    closePopovers();
  });

  $("#attachMenu").addEventListener("click", (e) => {
    const type = e.target.closest("[data-attach]")?.dataset.attach;
    if (!type) return;
    closePopovers();
    if (type === "payment") {
      const peer = peerOf(activeConv());
      return openModal("modal-wallet", peer?.id);
    }
    fileInput.dataset.kind = type;
    fileInput.accept = type === "file" ? "" : "image/*";
    if (type === "camera") fileInput.setAttribute("capture", "environment");
    else fileInput.removeAttribute("capture");
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    sendFile(fileInput.files[0], fileInput.dataset.kind);
    fileInput.value = "";
  });

  document.addEventListener("visibilitychange", () => markRead());

  registerAction("close-chat", () => (history.state?.chat ? history.back() : closeChat()));
  registerAction("search-chat", () => ($("#chatSearch").hidden ? openChatSearch() : closeChatSearch()));
  registerAction("cancel-context", cancelContext);
  registerAction("start-recording", startRecording);
  registerAction("cancel-recording", () => stopRecording(true));
  registerAction("send-recording", () => stopRecording(false));

  on("presence", () => renderHeader());
  on("conversations", () => renderHeader());
  on("blocked", () => renderHeader());
  on("users", () => {
    const conv = activeConv();
    if (conv) renderMessages(conv, { keepScroll: true });
  });

  autosize();
}

export function rerenderActive() {
  const conv = activeConv();
  if (!conv) return;
  renderHeader(conv);
  renderMessages(conv, { keepScroll: true });
}

export function resetMessages(conversationId) {
  state.messages.delete(conversationId);
}

export { upsertConversation };
