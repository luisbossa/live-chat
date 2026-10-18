// Reenviar mensajes y mensajes destacados (con estrella).
import { $, $$, icon, escapeHTML, toast, toastError, listTime } from "./utils.js";
import { state, sortedConversations, convTitle, convAvatar, getConv, userName, isBlockedConv, isGroup } from "./state.js";
import { api } from "./api.js";
import { previewOf, previewIcon } from "./format.js";
import { openModal, closeModal, onModalOpen, registerAction } from "./ui.js";
import { openChat, jumpToMessage, refreshMessage } from "./conversation.js";

const MAX_FORWARD = 5;

// ==========================================================================
// Destacar
// ==========================================================================
export async function toggleStar(msg, { silent = false } = {}) {
  const wasStarred = state.starred.has(msg.id);
  // Se marca al instante y se deshace si falla
  setStarred(msg.id, !wasStarred);
  try {
    const { starred } = await api.star(msg.id);
    setStarred(msg.id, starred);
    if (!silent) toast(starred ? "Mensaje destacado" : "Ya no está destacado", { icon: starred ? "star" : "star-off" });
  } catch (err) {
    setStarred(msg.id, wasStarred);
    toastError(err.message);
  }
}

function setStarred(messageId, starred) {
  if (starred) state.starred.add(messageId);
  else state.starred.delete(messageId);
  refreshMessage(messageId);
}

/** Otra pestaña o dispositivo cambió una estrella. */
export function onStarUpdate({ messageId, starred }) {
  setStarred(messageId, starred);
  if ($("#modal-starred").classList.contains("is-open")) loadStarred();
}

async function loadStarred() {
  const list = $("#starredList");
  try {
    const { messages } = await api.starred();
    state.starred = new Set(messages.map((m) => m.id));
    $("#starredCount").textContent = messages.length ? `(${messages.length})` : "";
    list.innerHTML = messages.length
      ? messages.map(starredItem).join("")
      : `
        <li class="empty-state">
          <span class="empty-icon">${icon("star")}</span>
          <strong>Aún no tienes mensajes destacados</strong>
          <small>Abre el menú de un mensaje y elige «Destacar» para guardarlo aquí y encontrarlo rápido.</small>
        </li>`;
  } catch (err) {
    list.innerHTML = `<li class="empty-list">${escapeHTML(err.message)}</li>`;
  }
}

function starredItem(msg) {
  const conv = getConv(msg.conversationId);
  const sender = state.users.get(msg.senderId);
  const where = conv ? convTitle(conv) : "Chat";
  // Vista previa sin el prefijo "Tú:" / "Karla:" (el autor ya se ve arriba)
  const text = conv ? previewOf({ ...conv, type: "direct" }, { ...msg, senderId: -1 }) : msg.body || "";
  const kind = previewIcon(msg);
  const thumb = msg.type === "image" || msg.type === "sticker" ? `<img class="starred-thumb" src="${msg.mediaUrl}" alt="" loading="lazy">` : "";
  return `
    <li>
      <button class="starred-item" data-starred="${msg.id}" data-conv-id="${msg.conversationId}">
        <img class="starred-avatar" src="${sender?.avatar || "/assets/images/ui/avatar-default.svg"}" alt="">
        <span class="starred-body">
          <span class="starred-head">
            <strong>${escapeHTML(userName(msg.senderId))}</strong>
            ${conv && (isGroup(conv) || msg.senderId === state.me.id) ? `<small>${icon("chevron-right", "icon-sm")}${escapeHTML(where)}</small>` : ""}
            <time>${listTime(msg.createdAt)}</time>
          </span>
          <span class="starred-text">${kind ? icon(kind, "icon-sm") : ""}${escapeHTML(text)}</span>
        </span>
        ${thumb}
      </button>
      <button class="icon-btn starred-remove" data-unstar="${msg.id}" aria-label="Quitar destacado" title="Quitar destacado">${icon("star-fill", "icon-sm")}</button>
    </li>`;
}

function initStarred() {
  onModalOpen("modal-starred", () => {
    $("#starredList").innerHTML = `<li class="empty-list"><span class="spinner"></span></li>`;
    loadStarred();
  });

  $("#starredList").addEventListener("click", async (e) => {
    const unstar = e.target.closest("[data-unstar]");
    if (unstar) {
      const id = Number(unstar.dataset.unstar);
      await toggleStar({ id });
      unstar.closest("li").remove();
      if (!$("#starredList li")) loadStarred();
      return;
    }
    const item = e.target.closest("[data-starred]");
    if (!item) return;
    const conv = getConv(item.dataset.convId);
    if (!conv) return toast("Ya no estás en ese chat.", { icon: "alert" });
    closeModal("modal-starred");
    await openChat(conv.id);
    jumpToMessage(Number(item.dataset.starred));
  });
}

// ==========================================================================
// Reenviar
// ==========================================================================
let forwarding = []; // mensajes que se reenvían (uno o varios seleccionados)
const selected = new Set();

export function openForward(msgs) {
  forwarding = (Array.isArray(msgs) ? msgs : [msgs]).filter(Boolean);
  openModal("modal-forward");
}

function forwardPreview(msg) {
  const conv = getConv(msg.conversationId);
  const kind = previewIcon(msg);
  const text = conv ? previewOf({ ...conv, type: "direct" }, { ...msg, senderId: -1 }) : msg.body || "";
  const thumb = msg.type === "image" || msg.type === "sticker" ? `<img src="${msg.mediaUrl}" alt="">` : "";
  return `${thumb}<span>${kind ? icon(kind, "icon-sm") : ""}${escapeHTML(text)}</span>`;
}

function renderForwardList() {
  const q = $("#forwardSearch").value.trim().toLowerCase();
  const chats = sortedConversations().filter((c) => !isBlockedConv(c) && (!q || convTitle(c).toLowerCase().includes(q)));
  const full = selected.size >= MAX_FORWARD;
  $("#forwardList").innerHTML = chats.length
    ? chats
        .map((c) => {
          const checked = selected.has(c.id);
          return `
          <li>
            <label class="pick-row ${!checked && full ? "is-disabled" : ""}">
              <span class="avatar avatar-sm"><img src="${convAvatar(c)}" alt="" loading="lazy"></span>
              <span class="pick-name">${escapeHTML(convTitle(c))}<small>${isGroup(c) ? `Grupo · ${c.members.length} participantes` : "Chat"}</small></span>
              <input type="checkbox" value="${c.id}" ${checked ? "checked" : ""} ${!checked && full ? "disabled" : ""}>
              <span class="pick-check">${icon("check", "icon-sm")}</span>
            </label>
          </li>`;
        })
        .join("")
    : `<li class="empty-list">Sin resultados</li>`;
  updateForwardButton();
}

function updateForwardButton() {
  const n = selected.size;
  const btn = $("#forwardSend");
  btn.disabled = !n;
  $("#forwardLabel").textContent = n ? `Reenviar a ${n} chat${n === 1 ? "" : "s"}` : "Elige hasta 5 chats";
  $("#forwardChosen").innerHTML = [...selected]
    .map((id) => getConv(id))
    .filter(Boolean)
    .map((c) => `<span class="pick-chip"><img src="${convAvatar(c)}" alt="">${escapeHTML(convTitle(c).split(" ")[0])}</span>`)
    .join("");
}

function initForward() {
  onModalOpen("modal-forward", () => {
    selected.clear();
    $("#forwardSearch").value = "";
    $("#forwardPreview").innerHTML =
      forwarding.length === 1
        ? forwardPreview(forwarding[0])
        : `<span>${icon("forward", "icon-sm")}${forwarding.length} mensajes seleccionados</span>`;
    renderForwardList();
  });

  $("#forwardSearch").addEventListener("input", renderForwardList);
  $("#forwardList").addEventListener("change", (e) => {
    const box = e.target.closest("input[type=checkbox]");
    if (!box) return;
    const id = Number(box.value);
    if (box.checked) selected.add(id);
    else selected.delete(id);
    renderForwardList();
    $(`#forwardList input[value="${id}"]`)?.focus();
  });

  $("#forwardSend").addEventListener("click", async () => {
    if (!forwarding.length || !selected.size) return;
    const btn = $("#forwardSend");
    btn.disabled = true;
    try {
      // En orden cronológico, para que lleguen igual que en el chat original
      let targets = new Set();
      for (const msg of [...forwarding].sort((a, b) => a.id - b.id)) {
        const { messages } = await api.forward(msg.id, [...selected]);
        messages.forEach((m) => targets.add(m.conversationId));
      }
      closeModal("modal-forward");
      targets = [...targets];
      const what = forwarding.length === 1 ? "Reenviado" : `${forwarding.length} mensajes reenviados`;
      toast(targets.length === 1 ? `${what} a ${convTitle(getConv(targets[0]))}` : `${what} a ${targets.length} chats`, { tone: "success", icon: "forward" });
    } catch (err) {
      toastError(err.message);
    } finally {
      btn.disabled = false;
    }
  });
}

export function initMessageExtras() {
  initStarred();
  initForward();
  registerAction("open-starred", () => openModal("modal-starred"));
  // Accesibilidad: Enter/Espacio sobre una fila elige el chat
  $$("#forwardList").forEach((list) =>
    list.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.matches("input[type=checkbox]")) e.target.click();
    })
  );
}
