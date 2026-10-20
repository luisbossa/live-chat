// Panel de información del chat activo: perfil, archivos por pestañas, ajustes del chat y grupos en común.
import { $, $$, icon, escapeHTML, toast, lastSeenLabel, isWide, isMobile, toastError, fileSize, duration, listTime, STATUSES, profileColor, birthdayLabel, isBirthdayToday } from "./utils.js";
import { state, emit, on, activeConv, isGroup, peerOf, convTitle, convAvatar, upsertConversation, isBlockedConv, userName, sortedConversations } from "./state.js";
import { api } from "./api.js";
import { disappearLabel } from "./format.js";
import { registerAction, confirmDialog, openLightbox, onModalOpen, renderPicker, closeModal } from "./ui.js";
import { togglePin, toggleMute, toggleArchive, clearChat, deleteChat } from "./conv-actions.js";
import { jumpToMessage } from "./conversation.js";
import { openStories } from "./stories.js";
import { matchForConversation, openReport, refreshMatches } from "./discover.js";
import { labelHTML, lookingHTML } from "./dz-icons.js";

const app = $("#app");
const URL_RE = /https?:\/\/[^\s<]+[^\s<.,;:!?)\]]/g;

/** Solo reemplaza el HTML si cambió: el panel se repinta con cada cambio de presencia y
 *  así no se pierden el foco ni el clic sobre botones que no cambiaron. */
function setHTML(el, html) {
  if (el.dataset.html !== html) {
    el.innerHTML = html;
    el.dataset.html = html;
  }
}

export function toggleInfo(force) {
  app.classList.toggle("has-info", force);
  if (app.classList.contains("has-info")) renderInfo();
}

// ==========================================================================
// Archivos, enlaces y documentos (con caché para no pedirlos en cada repintado)
// ==========================================================================
const mediaCache = new Map(); // conversationId -> { at, groups }
let mediaTab = "media";

function groupMedia(messages) {
  const groups = { media: [], docs: [], links: [], audio: [] };
  messages.forEach((m) => {
    if (m.type === "image" || m.type === "video") groups.media.push(m);
    else if (m.type === "file") groups.docs.push(m);
    else if (m.type === "audio") groups.audio.push(m);
    else if (m.type === "text") (m.body.match(URL_RE) || []).forEach((url) => groups.links.push({ ...m, url }));
  });
  return groups;
}

async function loadMedia(conv, force = false) {
  const hit = mediaCache.get(conv.id);
  if (hit && !force && Date.now() - hit.at < 60e3) return hit.groups;
  const { messages } = await api.media(conv.id);
  const groups = groupMedia(messages);
  mediaCache.set(conv.id, { at: Date.now(), groups });
  return groups;
}

const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

function mediaPanelHTML(groups) {
  const list = groups[mediaTab];
  const empty = {
    media: ["image", "Aún no hay fotos ni videos en este chat."],
    docs: ["file", "Aún no hay documentos."],
    links: ["link", "Aún no hay enlaces."],
    audio: ["mic", "Aún no hay notas de voz."],
  }[mediaTab];
  if (!list.length) return `<p class="media-empty">${icon(empty[0])}${empty[1]}</p>`;

  if (mediaTab === "media") {
    return `<div class="media-grid">${list
      .slice(0, 30)
      .map((m) =>
        m.type === "video"
          ? `<button class="media-video" data-video-src="${m.mediaUrl}" title="${escapeHTML(listTime(m.createdAt))}"><video src="${m.mediaUrl}#t=0.1" muted playsinline preload="metadata"></video><span>${icon("play", "icon-sm")}${duration(m.meta?.duration)}</span></button>`
          : `<button data-lightbox-src="${m.mediaUrl}" title="${escapeHTML(listTime(m.createdAt))}"><img src="${m.mediaUrl}" alt="" loading="lazy"></button>`
      )
      .join("")}</div>`;
  }
  const row = (m, iconName, title, sub, href) => `
    <li>
      <a class="media-row" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer" ${mediaTab === "docs" ? `download="${escapeHTML(title)}"` : ""}>
        <span class="media-row-icon">${icon(iconName)}</span>
        <span><strong>${escapeHTML(title)}</strong><small>${sub}</small></span>
      </a>
      <button class="icon-btn" data-media-jump="${m.id}" aria-label="Ver en el chat" title="Ver en el chat">${icon("arrow-up-right", "icon-sm")}</button>
    </li>`;
  const by = (m) => `${escapeHTML(userName(m.senderId, { short: true }))} · ${escapeHTML(listTime(m.createdAt))}`;
  return `<ul class="media-list">${list
    .slice(0, 40)
    .map((m) => {
      if (mediaTab === "docs") return row(m, "file", m.meta?.name || "Documento", `${fileSize(m.meta?.size)} · ${by(m)}`, m.mediaUrl);
      if (mediaTab === "audio") return row(m, "mic", `Nota de voz · ${duration(m.meta?.duration)}`, by(m), m.mediaUrl);
      return row(m, "globe", host(m.url), `${escapeHTML(m.url.length > 48 ? `${m.url.slice(0, 48)}…` : m.url)}<br>${by(m)}`, m.url);
    })
    .join("")}</ul>`;
}

async function renderMedia(conv, force = false) {
  try {
    const groups = await loadMedia(conv, force);
    if (conv.id !== state.activeId) return;
    $$("[data-media-tab]").forEach((tab) => {
      const n = groups[tab.dataset.mediaTab].length;
      $("b", tab).textContent = n || "";
      tab.classList.toggle("is-active", tab.dataset.mediaTab === mediaTab);
      tab.setAttribute("aria-selected", tab.dataset.mediaTab === mediaTab);
    });
    setHTML($("#mediaPanel"), mediaPanelHTML(groups));
  } catch {
    $("#mediaPanel").innerHTML = "";
  }
}

// ==========================================================================
// Destacados de este chat (se cuentan a partir de la lista del servidor)
// ==========================================================================
let starredCache = { at: 0, size: -1, list: [] };
async function starredCount(conv) {
  if (Date.now() - starredCache.at > 15e3 || starredCache.size !== state.starred.size) {
    try {
      starredCache = { at: Date.now(), size: state.starred.size, list: (await api.starred()).messages };
    } catch {
      return 0;
    }
  }
  return starredCache.list.filter((m) => m.conversationId === conv.id).length;
}

// ==========================================================================
// Perfil
// ==========================================================================
const copyRow = (iconName, label, value) => `
  <li>
    <span class="field-icon">${icon(iconName, "icon-sm")}</span>
    <span><small>${label}</small><strong>${escapeHTML(value)}</strong></span>
    <button class="icon-btn" data-copy="${escapeHTML(value)}" aria-label="Copiar ${label.toLowerCase()}" title="Copiar">${icon("copy", "icon-sm")}</button>
  </li>`;

const storyOf = (userId) => state.stories.find((g) => g.user.id === userId && g.stories?.length);

function renderMembers(conv) {
  const q = $("#memberSearch").value.trim().toLowerCase();
  const members = conv.members
    .map((m) => ({ ...m, ...state.users.get(m.id), role: m.role }))
    .filter((u) => !q || u.name.toLowerCase().includes(q) || (u.username || "").includes(q));
  setHTML($("#infoMembers"), members.length
    ? members
        .map((user) => {
          const me = user.id === state.me.id;
          return `
          <li>
            <span class="avatar avatar-sm ${user.online ? "is-online" : ""}" data-status="${user.status || "available"}"><img src="${user.avatar}" alt=""></span>
            <span class="member-name">${escapeHTML(me ? "Tú" : user.name)}<small class="muted">${escapeHTML(me ? user.bio || "" : lastSeenLabel(user) || user.bio || "")}</small></span>
            ${user.role === "admin" ? `<span class="role-tag">Admin</span>` : ""}
            ${me ? "" : `<button class="icon-btn" data-dm="${user.id}" aria-label="Enviar mensaje" title="Enviar mensaje">${icon("chat", "icon-sm")}</button>`}
          </li>`;
        })
        .join("")
    : `<li class="muted small">Sin resultados</li>`);
}

export function renderInfo(conv = activeConv(), { refreshMedia = false } = {}) {
  if (!conv || !app.classList.contains("has-info")) return;
  const group = isGroup(conv);
  const peer = peerOf(conv);

  $("#infoTitle").textContent = group ? "Info del grupo" : "Info del contacto";
  $("#infoAvatar img").src = convAvatar(conv);
  const story = peer && storyOf(peer.id);
  $("#infoAvatar").classList.toggle("has-story", Boolean(story));
  $("#infoAvatar").classList.toggle("is-seen", Boolean(story?.allViewed));
  $("#infoAvatar").setAttribute("aria-label", story ? `Ver estado de ${peer.name}` : "Ver foto");
  $("#infoName").innerHTML = escapeHTML(convTitle(conv)) + (peer?.official ? icon("verified", "badge-verified") : "");
  $("#infoMeta").textContent = group ? `Grupo · ${conv.members.length} participantes` : peer?.username ? `@${peer.username}` : "";

  const presence = $("#infoPresence");
  if (group) {
    const online = conv.members.filter((m) => m.id !== state.me.id && state.users.get(m.id)?.online).length;
    presence.innerHTML = online ? `<i class="dot"></i>${online} en línea` : "";
  } else if (peer?.official) {
    presence.innerHTML = `${icon("verified", "icon-sm")}Cuenta oficial`;
  } else {
    presence.innerHTML = peer?.online ? `<i class="dot"></i>En línea` : escapeHTML(lastSeenLabel(peer || {}) || "");
    // Disponibilidad elegida por la persona (Ocupado, Ausente, No molestar)
    if (peer?.status && peer.status !== "available") presence.innerHTML += `<span class="status-chip is-${peer.status}"><i></i>${STATUSES[peer.status].label}</span>`;
    if (isBirthdayToday(peer?.birthday)) presence.innerHTML += `<span class="status-chip is-birthday">🎂 Hoy es su cumpleaños</span>`;
  }
  // Portada con el color de perfil de la persona (o el de la app en grupos)
  const [c1, c2] = profileColor(peer?.color);
  $(".info-cover").style.setProperty("--cover-1", peer ? c1 : "var(--brand)");
  $(".info-cover").style.setProperty("--cover-2", peer ? c2 : "var(--brand-2)");
  presence.classList.toggle("is-online", Boolean(peer?.online) || (group && presence.textContent !== ""));

  // Info y datos copiables
  $("#infoBioTitle").textContent = group ? "Descripción" : "Info";
  $("#infoBio").textContent = group ? conv.description || "Sin descripción." : peer?.bio || "";
  const fields = [];
  if (group) {
    const creator = conv.createdBy && (conv.createdBy === state.me.id ? "ti" : userName(conv.createdBy));
    const created = new Date(conv.createdAt).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
    fields.push(`<li><span class="field-icon">${icon("users", "icon-sm")}</span><span><small>Creado</small><strong>${escapeHTML(created)}${creator ? ` por ${escapeHTML(creator)}` : ""}</strong></span></li>`);
  } else if (peer) {
    if (peer.phone) fields.push(copyRow("phone", "Teléfono", peer.phone));
    if (peer.username) fields.push(copyRow("user", "Usuario", `@${peer.username}`));
    if (peer.birthday) fields.push(`<li><span class="field-icon">${icon("gift", "icon-sm")}</span><span><small>Cumpleaños</small><strong>${escapeHTML(birthdayLabel(peer.birthday))}${isBirthdayToday(peer.birthday) ? " · ¡hoy! 🎂" : ""}</strong></span></li>`);
  }
  setHTML($("#infoFields"), fields.join(""));

  $$(".info-actions [data-call]").forEach((b) => (b.hidden = group || Boolean(peer?.official)));
  $(".info-actions").classList.toggle("is-compact", group || Boolean(peer?.official));
  $("#muteIcon").setAttribute("href", `/assets/images/icons.svg#i-${conv.muted ? "bell-off" : "bell"}`);
  $("#muteLabel").textContent = conv.muted ? "Activar" : "Silenciar";
  $("#pinLabel").textContent = conv.pinned ? "Desfijar chat" : "Fijar chat";
  $("#pinBtn").hidden = conv.archived;
  $("#archiveLabel").textContent = conv.archived ? "Desarchivar chat" : "Archivar chat";
  $("#archiveIcon").setAttribute("href", `/assets/images/icons.svg#i-${conv.archived ? "unarchive" : "archive"}`);

  // Participantes
  $("#infoMembersSection").hidden = !group;
  if (group) {
    $("#infoMembersCount").textContent = conv.members.length;
    $("#addMembersBtn").hidden = conv.role !== "admin";
    $("#memberSearchWrap").hidden = conv.members.length < 6;
    renderMembers(conv);
  }

  // Filas de ajustes del chat
  const pins = conv.pinnedMessages?.length || 0;
  $("#infoPinCount").textContent = pins ? `${pins} fijado${pins === 1 ? "" : "s"}` : "Ninguno";
  $("#infoPinnedRow").disabled = !pins;
  $("#infoDisappear").textContent = disappearLabel(conv.disappearAfter);
  const sched = conv.scheduledCount || 0;
  $("#infoScheduled").textContent = sched ? `${sched} pendiente${sched === 1 ? "" : "s"}` : "Ninguno";
  starredCount(conv).then((n) => {
    if (conv.id === state.activeId) $("#infoStarCount").textContent = n ? `${n} mensaje${n === 1 ? "" : "s"}` : "Ninguno";
  });

  // Grupos en común
  const common = peer ? sortedConversations().filter((c) => isGroup(c) && c.members.some((m) => m.id === peer.id)) : [];
  $("#infoCommonCard").hidden = !common.length;
  $("#infoCommonCount").textContent = common.length;
  setHTML($("#infoCommon"), common
    .map(
      (c) => `
      <li>
        <button data-conv="${c.id}">
          <span class="avatar avatar-sm"><img src="${convAvatar(c)}" alt=""></span>
          <span><strong>${escapeHTML(c.name)}</strong><small>${escapeHTML(c.members.map((m) => (m.id === state.me.id ? "Tú" : m.name.split(" ")[0])).join(", "))}</small></span>
        </button>
      </li>`
    )
    .join(""));

  $("#blockBtn").hidden = group || Boolean(peer?.official);
  $("#deleteChatBtn").hidden = group;
  $("#leaveBtn").hidden = !group;
  $("#blockLabel").textContent = isBlockedConv(conv) ? "Desbloquear" : `Bloquear a ${peer?.name?.split(" ")[0] || ""}`;
  renderDating(conv);
  renderMedia(conv, refreshMedia);
}

const LOOKING = { pareja: "💞 Busca pareja", algo_casual: "🍹 Algo casual", amistad: "🤝 Amistad", no_se: "🤷 Aún no sabe" };

/** Chats de un match: su perfil de citas (sobre mí, intereses, preguntas) y acciones de seguridad. */
function renderDating(conv) {
  const m = conv.origin === "match" ? matchForConversation(conv.id) : null;
  $("#infoDating").hidden = !m;
  if (!m) return;
  const u = m.user;
  const common = new Set(u.common || []);
  setHTML($("#infoDatingBody"), `
    <p class="dz-info-meta">${escapeHTML(String(u.age || ""))} años · ${escapeHTML(u.provinceName || "")} · ${lookingHTML(u.lookingFor)}${u.verified ? ` · ${icon("shield-check", "icon-sm")} Verificado` : ""}</p>
    ${u.about ? `<p class="info-bio">${escapeHTML(u.about)}</p>` : ""}
    <div class="dz-tags">${(u.interests || []).map((i) => `<span class="${common.has(i) ? "is-common" : ""}">${labelHTML(i)}</span>`).join("")}</div>
    ${(u.prompts || []).map((p) => `<div class="dz-prompt"><small>${escapeHTML(p.q)}</small><p>${escapeHTML(p.a)}</p></div>`).join("")}`);
}

// Sombra y barra de progreso bajo la cabecera según el desplazamiento
function trackInfoScroll() {
  const info = $("#info");
  const body = info.querySelector(".info-body");
  const update = () => {
    const max = body.scrollHeight - body.clientHeight;
    info.classList.toggle("is-scrollable", max > 4);
    info.classList.toggle("is-scrolled", body.scrollTop > 4);
    info.style.setProperty("--info-progress", max > 0 ? Math.min(1, body.scrollTop / max).toFixed(3) : 0);
  };
  body.addEventListener("scroll", update, { passive: true });
  new ResizeObserver(update).observe(body);
  new MutationObserver(update).observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
}

export function initInfo() {
  trackInfoScroll();
  registerAction("toggle-info", () => toggleInfo());
  const withActive = (fn) => () => activeConv() && fn(activeConv());
  registerAction("mute", withActive(toggleMute));
  registerAction("pin", withActive(togglePin));
  registerAction("archive", withActive(toggleArchive));
  registerAction("clear-chat", withActive(clearChat));
  registerAction("delete-chat", withActive(deleteChat));
  registerAction("info-pinned", () => {
    const pins = activeConv()?.pinnedMessages || [];
    if (!pins.length) return;
    if (!isWide()) toggleInfo(false);
    jumpToMessage(pins.at(-1).id);
  });

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

  // «Conocer»: deshacer match y reportar
  registerAction("dz-unmatch", async () => {
    const m = activeConv() && matchForConversation(activeConv().id);
    if (!m) return;
    const ok = await confirmDialog({ title: `¿Deshacer el match con ${m.user.firstName}?`, text: "El chat desaparecerá para los dos y no podrán volver a escribirse.", okText: "Deshacer match" });
    if (!ok) return;
    try {
      await api.unmatch(m.id);
      await refreshMatches();
      toast("Match deshecho", { icon: "x" });
    } catch (err) {
      toastError(err.message);
    }
  });
  registerAction("dz-report", () => {
    const m = activeConv() && matchForConversation(activeConv().id);
    if (m) openReport(m.user.userId, m.user.firstName);
  });

  // Pestañas de archivos
  $("#mediaTabs").addEventListener("click", (e) => {
    const tab = e.target.closest("[data-media-tab]");
    if (!tab || !activeConv()) return;
    mediaTab = tab.dataset.mediaTab;
    renderMedia(activeConv());
  });
  $("#mediaPanel").addEventListener("click", (e) => {
    const video = e.target.closest("[data-video-src]");
    if (video) return openLightbox(video.dataset.videoSrc, { video: true });
    const jump = e.target.closest("[data-media-jump]");
    if (!jump) return;
    if (!isWide()) toggleInfo(false);
    jumpToMessage(Number(jump.dataset.mediaJump));
  });

  // Copiar teléfono o usuario
  $("#infoFields").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      toast("Copiado", { tone: "success", icon: "copy" });
    } catch {
      toast(btn.dataset.copy, { icon: "copy" });
    }
  });

  $("#memberSearch").addEventListener("input", () => activeConv() && renderMembers(activeConv()));

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

  // Foto: abre su estado si tiene uno; si no, la foto a pantalla completa
  $("#infoAvatar").addEventListener("click", (e) => {
    const peer = peerOf(activeConv());
    if (peer && storyOf(peer.id)) return openStories(peer.id);
    openLightbox(e.currentTarget.querySelector("img").src);
  });

  ["conversations", "presence", "blocked", "stories"].forEach((evt) => on(evt, () => renderInfo()));
  on("media", (conv) => conv?.id === state.activeId && renderInfo(conv, { refreshMedia: true }));
  on("active", (conv) => {
    $("#memberSearch").value = "";
    if (conv) mediaTab = "media";
    if (!conv && !isWide()) app.classList.remove("has-info");
    if (conv && isWide() && !isMobile()) toggleInfo(true);
    else if (conv) renderInfo(conv);
  });
}
