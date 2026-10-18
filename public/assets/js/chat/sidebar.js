// Lista de conversaciones, pestañas e insignias.
import { $, $$, escapeHTML, icon, listTime } from "./utils.js";
import { state, sortedConversations, convTitle, convAvatar, peerOf, isGroup, receiptOf, on } from "./state.js";
import { previewOf, typingText } from "./format.js";
import { renderStoryLists } from "./stories.js";

const TABS = {
  chats: { title: "Chats", placeholder: "Buscar chats…" },
  groups: { title: "Grupos", placeholder: "Buscar grupos…" },
  status: { title: "Estados", placeholder: "Buscar estados…" },
};

const RECEIPT_ICON = { sending: "clock", sent: "check", delivered: "check-check", read: "check-check" };

function convItem(conv) {
  const peer = peerOf(conv);
  const msg = conv.lastMessage;
  const typing = typingText(conv);
  const mine = msg && msg.senderId === state.me.id && !["system", "call"].includes(msg.type) && !msg.deletedAt;
  const receipt = mine ? receiptOf(conv, msg) : null;
  const classes = ["conv", conv.id === state.activeId && "is-active", conv.unread && "has-unread"].filter(Boolean).join(" ");

  return `
    <li>
      <button class="${classes}" data-conv="${conv.id}">
        <span class="avatar ${peer?.online ? "is-online" : ""}"><img src="${convAvatar(conv)}" alt="" loading="lazy"></span>
        <span class="conv-body">
          <span class="conv-row">
            <span class="conv-name">${escapeHTML(convTitle(conv))}</span>
            <span class="conv-time">${listTime(msg?.createdAt || conv.createdAt)}</span>
          </span>
          <span class="conv-row">
            ${receipt ? `<span class="tick tick-${receipt}">${icon(RECEIPT_ICON[receipt], "icon-sm")}</span>` : ""}
            <span class="conv-preview ${typing ? "is-typing" : ""}">${escapeHTML(typing || previewOf(conv))}</span>
            ${conv.pinned ? icon("pin", "icon-muted") : ""}
            ${conv.muted ? icon("bell-off", "icon-muted") : ""}
            ${conv.unread ? `<b class="badge ${conv.muted ? "is-muted" : ""}">${conv.unread > 99 ? "99+" : conv.unread}</b>` : ""}
          </span>
        </span>
      </button>
    </li>`;
}

function renderList(el, items, empty) {
  el.innerHTML = items.length ? items.map(convItem).join("") : `<li class="empty-list">${empty}</li>`;
}

export function renderLists() {
  const q = $("#listSearch").value.trim().toLowerCase();
  const match = (c) => !q || convTitle(c).toLowerCase().includes(q) || (peerOf(c)?.username || "").includes(q);
  const all = sortedConversations();

  renderList($("#chatList"), all.filter(match), q ? "Sin resultados" : "Aún no tienes chats. ¡Empieza uno nuevo!");
  renderList($("#groupList"), all.filter((c) => isGroup(c) && match(c)), q ? "Sin resultados" : "Aún no estás en ningún grupo.");
  renderStoryLists(q);
  renderBadges();
}

function renderBadges() {
  const all = [...state.conversations.values()];
  const unreadChats = all.filter((c) => c.unread && !c.muted);
  [["chats", unreadChats], ["groups", unreadChats.filter(isGroup)]].forEach(([tab, list]) => {
    const badge = $(`[data-badge="${tab}"]`);
    badge.hidden = !list.length;
    badge.textContent = list.length;
  });
  $('[data-badge="status"]').hidden = !state.stories.some((g) => g.user.id !== state.me.id && !g.allViewed);

  const total = all.reduce((n, c) => n + (c.muted ? 0 : c.unread || 0), 0);
  document.title = total ? `(${total}) Chats - Yabla` : "Chats - Yabla";
}

export function setTab(tab) {
  state.tab = tab;
  $$("[data-tab]").forEach((btn) => {
    const active = btn.dataset.tab === tab;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", active);
  });
  $$("[data-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === tab));
  $("#sidebarTitle").textContent = TABS[tab].title;
  $("#listSearch").placeholder = TABS[tab].placeholder;
  $("#listSearch").value = "";
  renderLists();
}

export function initSidebar() {
  $("#listSearch").addEventListener("input", renderLists);
  ["conversations", "presence", "typing", "stories", "receipts"].forEach((evt) => on(evt, renderLists));
}
