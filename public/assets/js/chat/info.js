// Panel de información del chat activo.
import { $, $$, icon, escapeHTML, toast, lastSeenLabel, isWide, isMobile, toastError } from "./utils.js";
import { state, emit, on, activeConv, isGroup, peerOf, convTitle, convAvatar, upsertConversation, isBlockedConv } from "./state.js";
import { api } from "./api.js";
import { registerAction, confirmDialog, openLightbox, onModalOpen, renderPicker, closeModal } from "./ui.js";
import { togglePin, toggleMute, toggleArchive, clearChat, deleteChat } from "./conv-actions.js";

const app = $("#app");

export function toggleInfo(force) {
  app.classList.toggle("has-info", force);
  if (app.classList.contains("has-info")) renderInfo();
}

async function renderMedia(conv) {
  const grid = $("#mediaGrid");
  try {
    const { messages } = await api.media(conv.id);
    if (conv.id !== state.activeId) return;
    $("#mediaCount").textContent = messages.length ? `(${messages.length})` : "";
    grid.innerHTML = messages.length
      ? messages
          .map((m) =>
            m.type === "image"
              ? `<button data-lightbox-src="${m.mediaUrl}"><img src="${m.mediaUrl}" alt="" loading="lazy"></button>`
              : `<a class="media-file" href="${m.mediaUrl}" target="_blank" rel="noopener" title="${escapeHTML(m.meta?.name || "")}">${icon(m.type === "audio" ? "mic" : "file")}</a>`
          )
          .join("")
      : `<p class="muted">Aún no hay archivos compartidos.</p>`;
  } catch {
    grid.innerHTML = "";
  }
}

export function renderInfo(conv = activeConv()) {
  if (!conv || !app.classList.contains("has-info")) return;
  const group = isGroup(conv);
  const peer = peerOf(conv);

  $("#infoTitle").textContent = group ? "Info del grupo" : "Info del contacto";
  $("#infoAvatar img").src = convAvatar(conv);
  $("#infoAvatar img").dataset.lightboxSrc = convAvatar(conv);
  $("#infoName").innerHTML = escapeHTML(convTitle(conv)) + (peer?.official ? icon("verified", "badge-verified") : "");
  $("#infoMeta").textContent = group ? `Grupo · ${conv.members.length} participantes` : [peer?.username && `@${peer.username}`, peer?.phone].filter(Boolean).join(" · ");
  $("#infoBioTitle").textContent = group ? "Descripción" : "Info";
  $("#infoBio").textContent = group ? conv.description || "Sin descripción." : `${peer?.bio || ""}${peer ? `\n${lastSeenLabel(peer)}` : ""}`;

  $$(".info-actions [data-call]").forEach((b) => (b.hidden = group || Boolean(peer?.official)));
  $("#muteIcon").setAttribute("href", `/assets/images/icons.svg#i-${conv.muted ? "bell-off" : "bell"}`);
  $("#muteLabel").textContent = conv.muted ? "Activar" : "Silenciar";
  $("#pinLabel").textContent = conv.pinned ? "Desfijar chat" : "Fijar chat";
  $("#pinBtn").hidden = conv.archived;
  $("#archiveLabel").textContent = conv.archived ? "Desarchivar chat" : "Archivar chat";
  $("#archiveIcon").setAttribute("href", `/assets/images/icons.svg#i-${conv.archived ? "unarchive" : "archive"}`);

  $("#infoMembersSection").hidden = !group;
  if (group) {
    $("#infoMembersCount").textContent = conv.members.length;
    $("#addMembersBtn").hidden = conv.role !== "admin";
    $("#infoMembers").innerHTML = conv.members
      .map((m) => {
        const user = { ...m, ...state.users.get(m.id) };
        const me = m.id === state.me.id;
        return `
          <li>
            <span class="avatar avatar-sm ${user.online ? "is-online" : ""}"><img src="${user.avatar}" alt=""></span>
            <span class="member-name">${escapeHTML(me ? "Tú" : user.name)}<small class="muted">${escapeHTML(me ? "" : lastSeenLabel(user))}</small></span>
            ${m.role === "admin" ? `<span class="role-tag">Admin</span>` : ""}
            ${me ? "" : `<button class="icon-btn" data-dm="${m.id}" aria-label="Enviar mensaje" title="Enviar mensaje">${icon("chat", "icon-sm")}</button>`}
          </li>`;
      })
      .join("");
  }

  $("#blockBtn").hidden = group || Boolean(peer?.official);
  $("#deleteChatBtn").hidden = group;
  $("#leaveBtn").hidden = !group;
  $("#blockLabel").textContent = isBlockedConv(conv) ? "Desbloquear" : `Bloquear a ${peer?.name?.split(" ")[0] || ""}`;
  renderMedia(conv);
}

export function initInfo() {
  registerAction("toggle-info", () => toggleInfo());
  const withActive = (fn) => () => activeConv() && fn(activeConv());
  registerAction("mute", withActive(toggleMute));
  registerAction("pin", withActive(togglePin));
  registerAction("archive", withActive(toggleArchive));
  registerAction("clear-chat", withActive(clearChat));
  registerAction("delete-chat", withActive(deleteChat));

  registerAction("block", async () => {
    const conv = activeConv();
    const peer = peerOf(conv);
    if (!peer) return;
    const blocking = !state.blockedIds.has(peer.id);
    if (blocking && !(await confirmDialog({ title: `¿Bloquear a ${peer.name}?`, text: "No podrá enviarte mensajes, llamarte ni ver tus estados.", okText: "Bloquear" }))) return;
    try {
      const { blockedIds } = await api.toggleBlock(peer.id);
      state.blockedIds = new Set(blockedIds);
      emit("blocked");
      renderInfo();
      toast(blocking ? `Bloqueaste a ${peer.name}` : `Desbloqueaste a ${peer.name}`, { icon: "ban" });
    } catch (err) {
      toastError(err.message);
    }
  });

  registerAction("leave-group", withActive(deleteChat));

  // Añadir participantes (solo admins)
  let getSelected = () => [];
  onModalOpen("modal-add-members", async () => {
    const conv = activeConv();
    const picker = $("#addPicker");
    picker.innerHTML = `<p class="muted small">Cargando…</p>`;
    const { users } = await api.searchUsers("");
    const memberIds = new Set(conv.members.map((m) => m.id));
    getSelected = renderPicker(picker, users.filter((u) => !memberIds.has(u.id)));
  });

  $("#addMembersForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const ids = getSelected();
    if (!ids.length) return toast("Elige al menos una persona", { tone: "error" });
    try {
      const { conversation } = await api.addMembers(activeConv().id, ids);
      upsertConversation(conversation);
      closeModal("modal-add-members");
      emit("conversations");
      renderInfo();
      toast("Participantes añadidos", { tone: "success", icon: "user-plus" });
    } catch (err) {
      toastError(err.message);
    }
  });

  // Foto de perfil a pantalla completa
  $("#infoAvatar").addEventListener("click", (e) => openLightbox(e.currentTarget.querySelector("img").src));

  ["active", "conversations", "presence", "blocked", "media"].forEach((evt) => on(evt, () => renderInfo()));
  on("active", (conv) => {
    if (!conv && !isWide()) app.classList.remove("has-info");
    if (conv && isWide() && !isMobile()) toggleInfo(true);
  });
}
