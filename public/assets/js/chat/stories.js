// Estados de 24 h: lista, visor, publicación, vistas y respuestas.
import { $, escapeHTML, firstName, relativeTime, toast, icon, toastError } from "./utils.js";
import { state, emit, upsertConversation } from "./state.js";
import { api } from "./api.js";
import { registerAction, openModal, closeModal, onModalOpen, confirmDialog } from "./ui.js";

const STORY_MS = 5000;
const viewer = { group: null, index: 0, timer: null, startedAt: 0, remaining: STORY_MS, paused: false };

const myGroup = () => state.stories.find((g) => g.user.id === state.me.id);

function chip(group) {
  const me = group.user.id === state.me.id;
  return `
    <button class="story-chip ${group.allViewed && !me ? "is-seen" : ""}" data-story-user="${group.user.id}">
      <span class="story-ring"><img src="${group.user.avatar}" alt="" loading="lazy"></span>
      <span class="story-name">${me ? "Tu estado" : escapeHTML(firstName(group.user.name))}</span>
    </button>`;
}

function row(group) {
  const last = group.stories.at(-1);
  return `
    <li>
      <button class="conv" data-story-user="${group.user.id}">
        <span class="story-ring story-ring-sm ${group.allViewed ? "is-seen" : ""}"><img src="${group.user.avatar}" alt="" loading="lazy"></span>
        <span class="conv-body">
          <span class="conv-name">${escapeHTML(group.user.name)}</span>
          <span class="conv-preview">${relativeTime(last.createdAt)} · ${group.stories.length} ${group.stories.length > 1 ? "estados" : "estado"}</span>
        </span>
      </button>
    </li>`;
}

export function renderStoryLists(query = "") {
  const q = query.toLowerCase();
  const mine = myGroup();
  const others = state.stories.filter((g) => g.user.id !== state.me.id && (!q || g.user.name.toLowerCase().includes(q)));

  // Tira superior de la pestaña Chats
  const addChip = `
    <button class="story-chip" data-action="${mine ? "open-my-status" : "my-status"}">
      <span class="story-ring ${mine ? "" : "is-mine"}"><img src="${state.me.avatar}" alt=""></span>
      <span class="story-name">Tu estado</span>
      ${mine ? "" : `<i class="story-add">${icon("plus", "icon-sm")}</i>`}
    </button>`;
  $("#storiesStrip").innerHTML = addChip + others.map(chip).join("");
  $("#storiesStrip").hidden = Boolean(q);

  // Pestaña Estados
  $("#myStatusHint").textContent = mine ? `${mine.stories.length} ${mine.stories.length > 1 ? "estados" : "estado"} · ${relativeTime(mine.lastAt)}` : "Toca para añadir una actualización";
  const recent = others.filter((g) => !g.allViewed);
  const seen = others.filter((g) => g.allViewed);
  $("#statusLists").innerHTML =
    (recent.length ? `<h3 class="list-title">Recientes</h3><ul class="conv-list">${recent.map(row).join("")}</ul>` : "") +
    (seen.length ? `<h3 class="list-title">Vistos</h3><ul class="conv-list">${seen.map(row).join("")}</ul>` : "") +
    (!others.length ? `<p class="empty-list">${q ? "Sin resultados" : "Tus contactos aún no han publicado estados."}</p>` : "");
}

export async function refreshStories() {
  try {
    const { stories } = await api.stories();
    state.stories = stories;
    stories.forEach((g) => state.users.set(g.user.id, { ...state.users.get(g.user.id), ...g.user }));
    emit("stories");
  } catch {
    /* se reintentará en el próximo evento */
  }
}

// ==========================================================================
// Visor
// ==========================================================================
function current() {
  return viewer.group?.stories[viewer.index];
}

export function openStories(userId) {
  const group = state.stories.find((g) => g.user.id === Number(userId));
  if (!group) return;
  viewer.group = group;
  const firstUnseen = group.stories.findIndex((s) => !s.viewed);
  viewer.index = group.user.id === state.me.id || firstUnseen < 0 ? 0 : firstUnseen;
  $("#storyViewer").hidden = false;
  show();
}

function show() {
  clearTimeout(viewer.timer);
  const story = current();
  const group = viewer.group;
  const mine = group.user.id === state.me.id;

  $("#storyAvatar").src = group.user.avatar;
  $("#storyName").textContent = mine ? "Mi estado" : group.user.name;
  $("#storyTime").textContent = relativeTime(story.createdAt);
  $("#storyMedia").src = story.mediaUrl;
  $("#storyCaption").hidden = !story.caption;
  $("#storyCaption").textContent = story.caption || "";
  $("#storyReply").hidden = mine;
  $("#storyViews").hidden = !mine;
  $("#storyDeleteBtn").hidden = !mine;
  $("#storyViews span").textContent = story.views;

  $("#storyProgress").innerHTML = group.stories
    .map((_, i) => `<span class="${i < viewer.index ? "is-done" : i === viewer.index ? "is-current" : ""}"><i></i></span>`)
    .join("");
  $("#storyProgress").style.setProperty("--duration", `${STORY_MS}ms`);

  viewer.remaining = STORY_MS;
  viewer.paused = false;
  resume();

  if (!mine && !story.viewed) {
    story.viewed = true;
    group.allViewed = group.stories.every((s) => s.viewed);
    api.viewStory(story.id).catch(() => {});
  }
}

function resume() {
  viewer.startedAt = Date.now();
  viewer.paused = false;
  const bar = $("#storyProgress .is-current i");
  if (bar) bar.style.animationPlayState = "running";
  viewer.timer = setTimeout(() => step(1), viewer.remaining);
}

function pause() {
  if (viewer.paused) return;
  clearTimeout(viewer.timer);
  viewer.remaining -= Date.now() - viewer.startedAt;
  viewer.paused = true;
  const bar = $("#storyProgress .is-current i");
  if (bar) bar.style.animationPlayState = "paused";
}

export function step(dir) {
  if (!viewer.group) return;
  viewer.index += dir;
  if (viewer.index >= 0 && viewer.index < viewer.group.stories.length) return show();

  // Siguiente o anterior persona
  const list = state.stories;
  const pos = list.indexOf(viewer.group) + (dir > 0 ? 1 : -1);
  if (pos < 0 || pos >= list.length) return closeStories();
  viewer.group = list[pos];
  viewer.index = dir > 0 ? 0 : viewer.group.stories.length - 1;
  show();
}

export function closeStories() {
  clearTimeout(viewer.timer);
  viewer.group = null;
  $("#storyViewer").hidden = true;
  emit("stories");
}

export const storyViewerOpen = () => !$("#storyViewer").hidden;

// ==========================================================================
// Inicialización
// ==========================================================================
export function initStories() {
  // Mantener pulsado = pausa (como en Instagram/WhatsApp)
  const media = $("#storyViewer");
  let holdTimer;
  media.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, input, form")) return;
    holdTimer = setTimeout(pause, 180);
  });
  media.addEventListener("pointerup", () => {
    clearTimeout(holdTimer);
    if (viewer.paused && !document.activeElement?.closest("#storyReply")) resume();
  });

  $("#storyReply").addEventListener("focusin", pause);
  $("#storyReply").addEventListener("focusout", () => viewer.group && viewer.paused && resume());
  $("#storyReply").addEventListener("submit", async (e) => {
    e.preventDefault();
    const field = $("input", e.target);
    const text = field.value.trim();
    const story = current();
    if (!text || !story) return;
    field.value = "";
    field.blur();
    try {
      const { conversation } = await api.openDirect(viewer.group.user.id);
      upsertConversation(conversation);
      await api.send(conversation.id, { text, storyId: story.id });
      toast("Respuesta enviada", { tone: "success", icon: "send" });
    } catch (err) {
      toastError(err.message);
    }
  });

  registerAction("close-story", closeStories);
  registerAction("my-status", () => openModal("modal-story"));
  registerAction("open-my-status", () => openStories(state.me.id));

  registerAction("story-viewers", async () => {
    const story = current();
    if (!story) return;
    pause();
    openModal("modal-viewers");
    const list = $("#viewersList");
    list.innerHTML = `<li class="muted small">Cargando…</li>`;
    try {
      const { viewers } = await api.storyViewers(story.id);
      list.innerHTML = viewers.length
        ? viewers.map((v) => `<li class="user-row"><img src="${v.avatar}" alt=""><span><strong>${escapeHTML(v.name)}</strong><small>${relativeTime(v.viewedAt)}</small></span></li>`).join("")
        : `<li class="empty-list">Nadie lo ha visto todavía.</li>`;
    } catch (err) {
      list.innerHTML = `<li class="empty-list">${escapeHTML(err.message)}</li>`;
    }
  });
  $("#modal-viewers").addEventListener("modal:close", () => viewer.group && resume());

  registerAction("delete-story", async () => {
    const story = current();
    if (!story) return;
    pause();
    if (!(await confirmDialog({ title: "¿Eliminar este estado?", text: "Se borrará para todos tus contactos.", okText: "Eliminar" }))) return resume();
    try {
      await api.deleteStory(story.id);
      closeStories();
      await refreshStories();
      toast("Estado eliminado", { icon: "trash" });
    } catch (err) {
      toastError(err.message);
    }
  });

  // Publicar un estado
  const fileField = $("#storyFile");
  onModalOpen("modal-story", () => {
    $("#storyForm").reset();
    $("#storyPreview").hidden = true;
    $("#storyDropHint").hidden = false;
  });
  fileField.addEventListener("change", () => {
    const file = fileField.files[0];
    if (!file) return;
    $("#storyPreview").src = URL.createObjectURL(file);
    $("#storyPreview").hidden = false;
    $("#storyDropHint").hidden = true;
  });
  $("#storyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!fileField.files[0]) return toast("Elige una foto para tu estado", { tone: "error", icon: "image" });
    const btn = $("button[type=submit]", e.target);
    btn.disabled = true;
    try {
      await api.createStory(new FormData(e.target));
      closeModal("modal-story");
      await refreshStories();
      toast("Estado publicado", { tone: "success", icon: "sparkles" });
    } catch (err) {
      toastError(err.message);
    } finally {
      btn.disabled = false;
    }
  });
}

/** Eventos en tiempo real. */
export function onStoryViewed({ storyId, viewer: who }) {
  const story = myGroup()?.stories.find((s) => s.id === storyId);
  if (!story) return;
  story.views += 1;
  if (current()?.id === storyId) $("#storyViews span").textContent = story.views;
  state.users.set(who.id, { ...state.users.get(who.id), ...who });
}
