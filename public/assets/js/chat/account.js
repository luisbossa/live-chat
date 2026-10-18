// Perfil, ajustes, nuevo chat, grupos, código QR y billetera.
import { $, $$, escapeHTML, toast, money, relativeTime, debounce, prefs, firstName, CURRENCIES, toastError } from "./utils.js";
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
      toast("Perfil actualizado", { tone: "success" });
    } catch (err) {
      toastError(err.message);
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
        toast("Ajuste guardado", { tone: "success" });
      } catch (err) {
        input.checked = !input.checked;
        toastError(err.message);
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
    toastError(err.message);
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
    if (!ids.length) return toastError("Elige al menos un participante");
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
      toast("Grupo creado", { tone: "success", icon: "users" });
    } catch (err) {
      toastError(err.message);
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
      toastError(err.message);
    }
  });
  registerAction("copy-profile-link", async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast("Enlace copiado", { tone: "success", icon: "link" });
    } catch {
      toast(profileUrl, { icon: "link" });
    }
  });
}

// ==========================================================================
// Billetera (dólares y colones, cada uno con su saldo)
// ==========================================================================
const walletCurrency = () => $('#walletForm input[name="currency"]:checked')?.value || "USD";

function renderBalances() {
  const balances = state.me.balances || { USD: 0, CRC: 0 };
  $$("[data-balance]").forEach((el) => (el.textContent = money(balances[el.dataset.balance] || 0, el.dataset.balance)));
  const currency = walletCurrency();
  $$("[data-wallet-currency]").forEach((card) => card.classList.toggle("is-selected", card.dataset.walletCurrency === currency));
  renderWalletForm();
}

/** Símbolo, límites, saldo disponible y texto del botón según la moneda elegida. */
function renderWalletForm() {
  const currency = walletCurrency();
  const info = CURRENCIES[currency];
  const amountInput = $("#walletAmount");
  $("#walletForm").classList.toggle("is-crc", currency === "CRC");
  $("#walletSymbol").textContent = info.symbol;
  amountInput.step = info.step;
  amountInput.min = info.min;
  amountInput.max = info.max / 100;
  amountInput.placeholder = currency === "CRC" ? "0" : "0.00";

  const available = state.me.balances?.[currency] || 0;
  const cents = Math.round(Number(amountInput.value || 0) * 100);
  const over = cents > available;
  $("#walletHint").innerHTML = over
    ? `<span class="is-error">Saldo insuficiente: tienes ${money(available, currency)}</span>`
    : `Disponible: <strong>${money(available, currency)}</strong> · Máx. ${money(info.max, currency)} por envío`;
  $("#walletSubmitLabel").textContent = cents > 0 ? `Enviar ${money(cents, currency)}` : "Enviar";
}

function setWalletCurrency(currency) {
  const radio = $(`#walletForm input[name="currency"][value="${currency}"]`);
  if (radio) radio.checked = true;
  $("#walletAmount").value = "";
  renderBalances();
}

function initWallet() {
  const form = $("#walletForm");

  onModalOpen("modal-wallet", async (preselectId) => {
    // Destinatarios: mis contactos de chats individuales (sin la cuenta oficial)
    const contacts = [...state.conversations.values()].filter((c) => !isGroup(c)).map(peerOf).filter((u) => u && !u.official);
    $("#walletTo").innerHTML = `<option value="">Elige un contacto</option>` + contacts.map((u) => `<option value="${u.id}">${escapeHTML(u.name)}</option>`).join("");
    if (preselectId) $("#walletTo").value = preselectId;
    form.elements.amount.value = "";
    form.elements.note.value = "";
    renderBalances();

    const list = $("#walletActivity");
    list.innerHTML = `<li class="muted small">Cargando…</li>`;
    try {
      const { balances, history } = await api.wallet();
      state.me.balances = balances;
      renderBalances();
      list.innerHTML = history.length
        ? history
            .map(
              (t) => `
              <li>
                <img src="${t.counterpart?.avatar || "/assets/images/ui/avatar-default.svg"}" alt="">
                <span><strong>${t.direction === "out" ? "Enviado a" : "Recibido de"} ${escapeHTML(t.counterpart?.name || "usuario")}</strong><small>${escapeHTML(t.note || "")} ${t.note ? "·" : ""} ${relativeTime(t.createdAt)}</small></span>
                <b class="${t.direction === "in" ? "is-in" : ""}">${t.direction === "in" ? "+" : "-"}${money(t.amountCents, t.currency)}</b>
              </li>`
            )
            .join("")
        : `<li class="empty-list">Aún no tienes movimientos.</li>`;
    } catch (err) {
      list.innerHTML = `<li class="empty-list">${escapeHTML(err.message)}</li>`;
    }
  });

  // Tocar una tarjeta de saldo elige esa moneda
  $$("[data-wallet-currency]").forEach((card) => card.addEventListener("click", () => setWalletCurrency(card.dataset.walletCurrency)));
  form.addEventListener("change", (e) => {
    if (e.target.name === "currency") setWalletCurrency(e.target.value);
  });
  $("#walletAmount").addEventListener("input", renderWalletForm);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("button[type=submit]", form);
    const data = Object.fromEntries(new FormData(form));
    const cents = Math.round(Number(data.amount) * 100);
    if (cents > (state.me.balances?.[data.currency] || 0)) return toastError("No tienes saldo suficiente en esa moneda.");
    btn.disabled = true;
    try {
      const { balances, conversationId } = await api.sendMoney(data);
      state.me.balances = balances;
      closeModal("modal-wallet");
      toast(`Enviaste ${money(cents, data.currency)}`, { tone: "success", icon: "wallet" });
      if (state.conversations.has(conversationId)) openChat(conversationId);
    } catch (err) {
      toastError(err.message);
    } finally {
      btn.disabled = false;
    }
  });
}

export function onWalletUpdate({ balances }) {
  state.me.balances = balances;
  if ($("#modal-wallet").classList.contains("is-open")) renderBalances();
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
