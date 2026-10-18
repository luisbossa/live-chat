// Pantalla de inicio y ayudas para usuarios nuevos: saludo, primeros pasos y sugerencias.
import { $, $$, icon, escapeHTML, toast, firstName, prefs, debounce, toastError } from "./utils.js";
import { state, on, emit, isGroup, peerOf, upsertConversation, rememberUser } from "./state.js";
import { api } from "./api.js";
import { registerAction } from "./ui.js";
import { openChat, onIncomingMessage } from "./conversation.js";

const DEFAULT_AVATAR = "/assets/images/ui/avatar-default.svg";
const DEFAULT_BIO = "Hola, estoy usando Yabla 👋";
let suggestions = [];

// ==========================================================================
// Primeros pasos
// ==========================================================================
function steps() {
  const convs = [...state.conversations.values()];
  const realChats = convs.filter((c) => !isGroup(c) && !peerOf(c)?.official);
  return [
    { done: state.me.avatar && state.me.avatar !== DEFAULT_AVATAR, label: "Añade una foto de perfil", hint: "Así te reconocerán tus amigos", open: "modal-profile", icon: "camera" },
    { done: state.me.bio && state.me.bio !== DEFAULT_BIO, label: "Escribe algo sobre ti", hint: "Tu info aparece en tu perfil", open: "modal-profile", icon: "edit" },
    { done: realChats.some((c) => c.lastMessage), label: "Envía tu primer mensaje", hint: "Empieza un chat con alguien", open: "modal-new-chat", icon: "chat" },
    { done: convs.some(isGroup), label: "Crea o únete a un grupo", hint: "Chatea con varios a la vez", open: "modal-group", icon: "users" },
    { done: state.stories.some((g) => g.user.id === state.me.id), label: "Publica tu primer estado", hint: "Una foto que dura 24 horas", action: "my-status", icon: "sparkles" },
  ];
}

function checklistHTML(compact) {
  const list = steps();
  const done = list.filter((s) => s.done).length;
  const pct = Math.round((done / list.length) * 100);
  const complete = done === list.length;

  return `
    <div class="home-card-head">
      <h3>${complete ? `${icon("party", "icon-sm")} ¡Todo listo!` : "Primeros pasos"}</h3>
      <button class="link-btn" data-action="dismiss-onboarding">${complete ? "Cerrar" : "Ocultar"}</button>
    </div>
    <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
      <span style="width:${pct}%"></span>
    </div>
    <p class="progress-label muted">${done} de ${list.length} completados</p>
    ${complete ? "" : `
    <ul class="steps-list">
      ${list
        .filter((s) => !compact || !s.done)
        .slice(0, compact ? 2 : list.length)
        .map(
          (s) => `
          <li>
            <button class="step ${s.done ? "is-done" : ""}" ${s.open ? `data-open="${s.open}"` : `data-action="${s.action}"`} ${s.done ? "disabled" : ""}>
              <span class="step-icon">${icon(s.done ? "check" : s.icon, "icon-sm")}</span>
              <span><strong>${s.label}</strong><small>${s.hint}</small></span>
              ${s.done ? "" : icon("chevron-right", "icon-sm step-go")}
            </button>
          </li>`
        )
        .join("")}
    </ul>`}`;
}

function renderChecklist() {
  // Se oculta si el usuario la cerró o si ya completó todos los pasos
  const hidden = prefs.get("onboardingDismissed", false) || steps().every((s) => s.done);
  ["homeChecklist", "sideChecklist"].forEach((id) => {
    const el = document.getElementById(id);
    el.hidden = hidden;
    if (!hidden) el.innerHTML = checklistHTML(id === "sideChecklist");
  });
}

// ==========================================================================
// Personas que quizá conozcas
// ==========================================================================
function candidates() {
  const contacts = new Set([...state.conversations.values()].filter((c) => !isGroup(c)).map((c) => peerOf(c)?.id));
  return suggestions
    .map((u) => ({ ...u, ...state.users.get(u.id) }))
    .filter((u) => !u.official && !contacts.has(u.id) && !state.blockedIds.has(u.id))
    .sort((a, b) => b.online - a.online || a.name.localeCompare(b.name));
}

function personCard(u) {
  return `
    <div class="person">
      <span class="avatar avatar-lg ${u.online ? "is-online" : ""}"><img src="${escapeHTML(u.avatar)}" alt="" loading="lazy"></span>
      <strong>${escapeHTML(firstName(u.name))}</strong>
      <small class="muted">@${escapeHTML(u.username)}</small>
      <button class="btn btn-ghost btn-sm" data-hi="${u.id}">${icon("hand", "icon-sm")} Saludar</button>
    </div>`;
}

function personRow(u) {
  return `
    <li>
      <div class="conv">
        <span class="avatar ${u.online ? "is-online" : ""}"><img src="${escapeHTML(u.avatar)}" alt="" loading="lazy"></span>
        <span class="conv-body">
          <span class="conv-name">${escapeHTML(u.name)}</span>
          <span class="conv-preview">${escapeHTML(u.bio || `@${u.username}`)}</span>
        </span>
        <button class="btn btn-ghost btn-sm" data-hi="${u.id}">${icon("hand", "icon-sm")} Saludar</button>
      </div>
    </li>`;
}

function renderPeople() {
  const list = candidates();
  $("#homePeopleCard").hidden = !list.length;
  $("#homePeople").innerHTML = list.slice(0, 8).map(personCard).join("");

  // En la lista lateral solo mientras tengas pocos contactos
  const directCount = [...state.conversations.values()].filter((c) => !isGroup(c) && !peerOf(c)?.official).length;
  const showSide = list.length > 0 && directCount < 5 && !$("#listSearch").value;
  $("#sidePeople").hidden = !showSide;
  if (showSide) $("#sidePeopleList").innerHTML = list.slice(0, 5).map(personRow).join("");
}

async function loadSuggestions() {
  try {
    const { users } = await api.searchUsers("");
    users.forEach(rememberUser);
    suggestions = users;
    renderPeople();
  } catch {
    /* las sugerencias son opcionales */
  }
}

/** "Saludar": abre el chat y envía un 👋, como el saludo rápido de Telegram. */
async function sayHi(userId, btn) {
  btn.disabled = true;
  try {
    const { conversation } = await api.openDirect(userId);
    upsertConversation(conversation);
    emit("conversations");
    await openChat(conversation.id);
    const { message } = await api.send(conversation.id, { text: "👋 ¡Hola!" });
    onIncomingMessage(message); // por si el evento del socket aún no llegó (se ignora si ya está)
    toast("¡Saludo enviado!", { tone: "success", icon: "hand" });
  } catch (err) {
    toastError(err.message);
    btn.disabled = false;
  }
}

// ==========================================================================
// Saludo y resumen
// ==========================================================================
function renderHero() {
  const hour = new Date().getHours();
  $("#homeGreeting").textContent = hour < 6 ? "Buenas noches" : hour < 12 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";
  $("#homeDate").textContent = new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });

  const convs = [...state.conversations.values()];
  const unread = convs.reduce((n, c) => n + (c.muted ? 0 : c.unread || 0), 0);
  const online = new Set(convs.flatMap((c) => c.members).filter((m) => m.id !== state.me.id && state.users.get(m.id)?.online).map((m) => m.id)).size;

  const parts = [];
  if (unread) parts.push(`Tienes <strong>${unread}</strong> mensaje${unread === 1 ? "" : "s"} sin leer`);
  if (online) parts.push(`<span class="dot-online"></span> ${online} contacto${online === 1 ? "" : "s"} en línea`);
  $("#homeSummary").innerHTML = parts.length ? parts.join(" · ") : "Elige una conversación o empieza una nueva.";
}

const renderAll = () => {
  renderHero();
  renderChecklist();
  renderPeople();
};

export function initHome() {
  registerAction("dismiss-onboarding", () => {
    prefs.set("onboardingDismissed", true);
    renderChecklist();
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-hi]");
    if (btn) sayHi(Number(btn.dataset.hi), btn);
  });

  $("#listSearch").addEventListener("input", renderPeople);
  const refresh = debounce(renderAll, 150);
  ["conversations", "presence", "stories", "users", "blocked"].forEach((evt) => on(evt, refresh));
  // El perfil cambia desde el modal: se refrescan los pasos al cerrarlo
  $("#modal-profile").addEventListener("modal:close", () => setTimeout(renderAll, 300));

  renderAll();
  loadSuggestions();
}
