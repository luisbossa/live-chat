// Perfil, ajustes, nuevo chat, grupos, código QR y billetera.
import { $, $$, escapeHTML, toast, money, relativeTime, debounce, prefs, firstName } from "./utils.js";
import { state, emit, upsertConversation, rememberUser, isGroup, peerOf } from "./state.js";
import { api } from "./api.js";
import { registerAction, onModalOpen, closeModal, renderPicker } from "./ui.js";
import { openChat } from "./conversation.js";
import { setTab } from "./sidebar.js";

/** Pinta los datos del usuario conectado en toda la interfaz. */
export function renderMe() {
  $$('[data-me="avatar"]').forEach((img) => (img.src = state.me.avatar));
  $$('[data-me="firstName"]').forEach((el) => (el.textContent = firstName(state.me.name)));
  $$('[data-me="name"]').forEach((el) => (el.textContent = state.me.name));
  $$('[data-me="username"]').forEach((el) => (el.textContent = state.me.username));
}

function setMe(me) {
  state.me = { ...state.me, ...me };
  rememberUser(state.me);
  renderMe();
}

// ==========================================================================
// Perfil
// ==========================================================================
function initProfile() {
  const form = $("#profileForm");
  onModalOpen("modal-profile", () => {
    ["name", "username", "bio", "phone"].forEach((k) => (form.elements[k].value = state.me[k] || ""));
    $(".avatar-preview > div", form).style.backgroundImage = `url(${state.me.avatar})`;
    form.elements.avatar.value = "";
  });

  form.elements.avatar.addEventListener("change", () => {
    const file = form.elements.avatar.files[0];
    if (file) $(".avatar-preview > div", form).style.backgroundImage = `url(${URL.createObjectURL(file)})`;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (!form.elements.avatar.files[0]) data.delete("avatar");
    try {
      const { me } = await api.updateProfile(data);
      setMe(me);
      emit("users");
      closeModal("modal-profile");
      toast("Perfil actualizado ✅");
    } catch (err) {
      toast(err.message);
    }
  });
}

// ==========================================================================
// Ajustes
// ==========================================================================
function initSettings() {
  onModalOpen("modal-settings", () => {
    $("#darkSwitch").checked = Yabla.getTheme() === "dark";
    $("#enterSwitch").checked = prefs.get("enterToSend", true);
    $("#soundSwitch").checked = prefs.get("sound", true);
    $("#readSwitch").checked = state.me.settings.readReceipts;
    $("#lastSeenSwitch").checked = state.me.settings.showLastSeen;
  });

  $("#darkSwitch").addEventListener("change", (e) => Yabla.setTheme(e.target.checked ? "dark" : "light"));
  $("#enterSwitch").addEventListener("change", (e) => prefs.set("enterToSend", e.target.checked));
  $("#soundSwitch").addEventListener("change", (e) => {
    prefs.set("sound", e.target.checked);
    // Aprovechamos el gesto del usuario para pedir permiso de notificaciones
    if (e.target.checked && "Notification" in window && Notification.permission === "default") Notification.requestPermission();
  });

  $$("[data-setting]").forEach((input) =>
    input.addEventListener("change", async () => {
      try {
        const { me } = await api.updateSettings({ [input.dataset.setting]: input.checked });
        setMe(me);
        toast("Ajuste guardado");
      } catch (err) {
        input.checked = !input.checked;
        toast(err.message);
      }
    })
  );
}

// ==========================================================================
// Nuevo chat
// ==========================================================================
async function startDirect(userId) {
  try {
    const { conversation } = await api.openDirect(userId);
    upsertConversation(conversation);
    emit("conversations");
    closeModal("modal-new-chat");
    setTab("chats");
    openChat(conversation.id);
  } catch (err) {
    toast(err.message);
  }
}

function initNewChat() {
  const results = $("#userResults");
  const search = debounce(async (q) => {
    try {
      const { users } = await api.searchUsers(q);
      users.forEach(rememberUser);
      results.innerHTML = users.length
        ? users
            .map(
              (u) => `
              <li>
                <button class="user-row" data-dm="${u.id}">
                  <span class="avatar avatar-sm ${u.online ? "is-online" : ""}"><img src="${u.avatar}" alt=""></span>
                  <span><strong>${escapeHTML(u.name)}</strong><small>@${escapeHTML(u.username)} · ${escapeHTML(u.bio || "")}</small></span>
                </button>
              </li>`
            )
            .join("")
        : `<li class="empty-list">No encontramos a nadie con ese nombre.</li>`;
    } catch (err) {
      results.innerHTML = `<li class="empty-list">${escapeHTML(err.message)}</li>`;
    }
  }, 250);

  onModalOpen("modal-new-chat", () => {
    $("#userSearch").value = "";
    results.innerHTML = `<li class="empty-list">Cargando…</li>`;
    search("");
  });
  $("#userSearch").addEventListener("input", (e) => search(e.target.value.trim()));
}

// ==========================================================================
// Nuevo grupo
// ==========================================================================
function initGroups() {
  const form = $("#groupForm");
  let getSelected = () => [];

  onModalOpen("modal-group", async () => {
    closeModal("modal-new-chat");
    form.reset();
    $(".avatar-preview > div", form).style.backgroundImage = "url(/assets/images/ui/avatar-default.svg)";
    $("#groupPicker").innerHTML = `<p class="muted small">Cargando…</p>`;
    const { users } = await api.searchUsers("");
    getSelected = renderPicker($("#groupPicker"), users);
  });

  form.elements.avatar.addEventListener("change", () => {
    const file = form.elements.avatar.files[0];
    if (file) $(".avatar-preview > div", form).style.backgroundImage = `url(${URL.createObjectURL(file)})`;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ids = getSelected();
    if (!form.elements.name.value.trim()) return form.elements.name.focus();
    if (!ids.length) return toast("Elige al menos un participante");
    const data = new FormData(form);
    data.set("type", "group");
    data.set("memberIds", ids.join(","));
    if (!form.elements.avatar.files[0]) data.delete("avatar");
    try {
      const { conversation } = await api.createGroup(data);
      upsertConversation(conversation);
      emit("conversations");
      closeModal("modal-group");
      setTab("groups");
      openChat(conversation.id);
      toast("Grupo creado 🎉");
    } catch (err) {
      toast(err.message);
    }
  });
}

// ==========================================================================
// Código QR
// ==========================================================================
let profileUrl = "";
function initQr() {
  onModalOpen("modal-qr", async () => {
    try {
      const { url, dataUrl } = await api.qr();
      profileUrl = url;
      $("#qrImage").src = dataUrl;
    } catch (err) {
      toast(err.message);
    }
  });
  registerAction("copy-profile-link", async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast("Enlace copiado 🔗");
    } catch {
      toast(profileUrl);
    }
  });
}

// ==========================================================================
// Billetera
// ==========================================================================
function renderBalance() {
  $("#walletBalance").textContent = money(state.me.balanceCents);
}

function initWallet() {
  const form = $("#walletForm");

  onModalOpen("modal-wallet", async (preselectId) => {
    renderBalance();
    // Destinatarios: mis contactos de chats individuales
    const contacts = [...state.conversations.values()].filter((c) => !isGroup(c)).map(peerOf).filter(Boolean);
    $("#walletTo").innerHTML = `<option value="">Elige un contacto</option>` + contacts.map((u) => `<option value="${u.id}">${escapeHTML(u.name)}</option>`).join("");
    if (preselectId) $("#walletTo").value = preselectId;
    form.elements.amount.value = "";
    form.elements.note.value = "";

    const list = $("#walletActivity");
    list.innerHTML = `<li class="muted small">Cargando…</li>`;
    try {
      const { balanceCents, history } = await api.wallet();
      state.me.balanceCents = balanceCents;
      renderBalance();
      list.innerHTML = history.length
        ? history
            .map(
              (t) => `
              <li>
                <img src="${t.counterpart?.avatar || "/assets/images/ui/avatar-default.svg"}" alt="">
                <span><strong>${t.direction === "out" ? "Enviado a" : "Recibido de"} ${escapeHTML(t.counterpart?.name || "usuario")}</strong><small>${escapeHTML(t.note || "")} ${t.note ? "·" : ""} ${relativeTime(t.createdAt)}</small></span>
                <b class="${t.direction === "in" ? "is-in" : ""}">${t.direction === "in" ? "+" : "-"}${money(t.amountCents)}</b>
              </li>`
            )
            .join("")
        : `<li class="empty-list">Aún no tienes movimientos.</li>`;
    } catch (err) {
      list.innerHTML = `<li class="empty-list">${escapeHTML(err.message)}</li>`;
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("button[type=submit]", form);
    btn.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(form));
      const { balanceCents, conversationId } = await api.sendMoney(data);
      state.me.balanceCents = balanceCents;
      closeModal("modal-wallet");
      toast(`💸 Enviaste ${money(Math.round(Number(data.amount) * 100))}`);
      if (state.conversations.has(conversationId)) openChat(conversationId);
    } catch (err) {
      toast(err.message);
    } finally {
      btn.disabled = false;
    }
  });
}

export function onWalletUpdate({ balanceCents }) {
  state.me.balanceCents = balanceCents;
  if ($("#modal-wallet").classList.contains("is-open")) renderBalance();
}

export function initAccount() {
  initProfile();
  initSettings();
  initNewChat();
  initGroups();
  initQr();
  initWallet();
  renderMe();

  // Botones "enviar mensaje" en listas de personas
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-dm]");
    if (btn) startDirect(Number(btn.dataset.dm));
  });
}
