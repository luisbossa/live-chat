// Punto de entrada del chat.
import { $, $$, toast, isMobile, isWide } from "./utils.js";
import { state, emit, upsertConversation, rememberUser, getConv } from "./state.js";
import { api } from "./api.js";
import { socket } from "./socket.js";
import {
  registerAction, runAction, openModal, closeModal, openModals, closePopovers, togglePopover, toggleDropdown, closeDropdowns, openLightbox,
} from "./ui.js";
import { initSidebar, renderLists, setTab } from "./sidebar.js";
import {
  initConversation, openChat, closeChat, onIncomingMessage, onMessageUpdate, onReceipt, onTyping, closeMessageMenu, markRead, rerenderActive,
} from "./conversation.js";
import { initInfo, toggleInfo } from "./info.js";
import { initStories, openStories, step as storyStep, closeStories, storyViewerOpen, refreshStories, onStoryViewed } from "./stories.js";
import { initCalls, startCall } from "./calls.js";
import { initAccount, renderMe, onWalletUpdate } from "./account.js";
import { initHome } from "./home.js";

const app = $("#app");

async function loadState() {
  const data = await api.bootstrap();
  state.me = data.me;
  rememberUser(data.me);
  state.blockedIds = new Set(data.blockedIds);
  state.conversations.clear();
  data.conversations.forEach(upsertConversation);
  state.stories = data.stories;
  data.stories.forEach((g) => rememberUser(g.user));
}

// ==========================================================================
// Eventos del servidor
// ==========================================================================
function bindSocket() {
  socket.on("message:new", onIncomingMessage);
  socket.on("message:update", onMessageUpdate);
  socket.on("receipt", onReceipt);
  socket.on("typing", onTyping);

  socket.on("conversation:new", (conv) => {
    const isNew = !state.conversations.has(conv.id);
    upsertConversation(conv);
    emit("conversations");
    if (isNew && conv.createdBy !== state.me.id && conv.type === "group") toast(`Te añadieron a «${conv.name}»`);
  });

  socket.on("conversation:update", (conv) => {
    upsertConversation(conv);
    emit("conversations");
  });

  socket.on("conversation:removed", ({ conversationId }) => {
    state.conversations.delete(conversationId);
    if (state.activeId === conversationId) closeChat();
    emit("conversations");
  });

  socket.on("presence", ({ userId, online, lastSeen }) => {
    rememberUser({ id: userId, online, lastSeen });
    emit("presence");
  });

  socket.on("user:update", (user) => {
    rememberUser(user);
    if (user.id === state.me.id) {
      state.me = { ...state.me, ...user };
      renderMe();
    }
    state.conversations.forEach((c) => {
      const m = c.members.find((x) => x.id === user.id);
      if (m) Object.assign(m, user);
    });
    emit("conversations");
    emit("presence");
  });

  socket.on("story:new", refreshStories);
  socket.on("story:deleted", refreshStories);
  socket.on("story:viewed", onStoryViewed);
  socket.on("wallet:update", onWalletUpdate);

  // Tras perder la conexión se recarga todo para no perder mensajes
  document.addEventListener("socket:reconnected", async () => {
    const active = state.activeId;
    state.messages.clear();
    await loadState();
    renderLists();
    if (active && getConv(active)) openChat(active);
  });
}

// ==========================================================================
// Clics globales (delegación)
// ==========================================================================
function bindClicks() {
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!t.closest(".dropdown")) closeDropdowns();
    if (!t.closest(".popover, [data-popover]")) closePopovers();
    if (!t.closest("#msgMenu, [data-msg-menu]")) closeMessageMenu();

    const el = t.closest("[data-tab], [data-conv], [data-story-user], [data-open], [data-close], [data-action], [data-call], [data-popover], [data-dropdown], [data-story], [data-lightbox-src]");
    if (!el) {
      if (t.classList.contains("modal")) closeModal(t); // clic en el fondo
      return;
    }

    const d = el.dataset;
    if (d.tab) return setTab(d.tab);
    if (d.conv) return openChat(Number(d.conv));
    if (d.storyUser) return openStories(Number(d.storyUser));
    if (d.call) return startCall(d.call);
    if (d.story) return storyStep(d.story === "next" ? 1 : -1);
    if (d.popover) return togglePopover(d.popover, el);
    if (d.lightboxSrc) return openLightbox(d.lightboxSrc);
    if (el.hasAttribute("data-dropdown")) return toggleDropdown(el);
    if (d.open) return openModal(d.open);
    if (el.hasAttribute("data-close")) return closeModal(el.closest(".modal"));
    if (d.action) runAction(d.action, el, e);
  });
}

function bindKeys() {
  document.addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName);
    if (storyViewerOpen() && !typing) {
      if (e.key === "ArrowRight") return storyStep(1);
      if (e.key === "ArrowLeft") return storyStep(-1);
    }
    if (e.key !== "Escape") return;

    if (!$("#msgMenu").hidden) return closeMessageMenu();
    if ($$(".popover:not([hidden])").length) return closePopovers();
    const modals = openModals();
    if (modals.length) return closeModal(modals.at(-1));
    if (storyViewerOpen()) return closeStories();
    if (!$("#chatSearch").hidden) return runAction("search-chat");
    if (app.classList.contains("has-info") && !isWide()) return toggleInfo(false);
    if (app.classList.contains("chat-open") && isMobile()) return runAction("close-chat");
  });
}

function syncThemeIcon() {
  $("[data-theme-icon]").setAttribute("href", `/assets/images/icons.svg#i-${Yabla.getTheme() === "dark" ? "sun" : "moon"}`);
}

// ==========================================================================
// Inicio
// ==========================================================================
async function start() {
  try {
    await loadState();
  } catch (err) {
    toast(err.message);
    return;
  }

  initSidebar();
  initConversation();
  initInfo();
  initStories();
  initCalls();
  initAccount();
  initHome();
  bindSocket();
  bindClicks();
  bindKeys();

  registerAction("theme", () => Yabla.toggleTheme());
  document.addEventListener("themechange", syncThemeIcon);
  syncThemeIcon();

  // Botón "atrás" del navegador o del teléfono cierra el chat en móvil
  window.addEventListener("popstate", () => {
    if (isMobile() && app.classList.contains("chat-open")) closeChat();
  });

  setTab("chats");

  // ?c=ID abre un chat concreto (enlaces de QR o notificaciones); si no, se ve la pantalla de inicio
  const requested = Number(new URLSearchParams(location.search).get("c"));
  if (requested && getConv(requested)) openChat(requested);

  window.addEventListener("focus", () => markRead());
  window.yabla = { state, rerenderActive }; // depuración
}

start();
