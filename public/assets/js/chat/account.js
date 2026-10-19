// Perfil, ajustes, nuevo chat, grupos, código QR y billetera.
import {
  $, $$, escapeHTML, toast, money, relativeTime, debounce, prefs, firstName, CURRENCIES, toastError, icon,
  STATUSES, PROFILE_COLORS, profileColor, MONTH_NAMES,
} from "./utils.js";
import { state, emit, upsertConversation, rememberUser, isGroup, peerOf } from "./state.js";
import { api } from "./api.js";
import { registerAction, onModalOpen, closeModal, renderPicker } from "./ui.js";
import { openChat } from "./conversation.js";
import { setTab } from "./sidebar.js";
import { forgetDevice } from "./push.js";

/** Pinta los datos del usuario conectado en toda la interfaz. */
export function renderMe() {
  $$('[data-me="avatar"]').forEach((img) => (img.src = state.me.avatar));
  $$('[data-me="firstName"]').forEach((el) => (el.textContent = firstName(state.me.name)));
  $$('[data-me="name"]').forEach((el) => (el.textContent = state.me.name));
  $$('[data-me="username"]').forEach((el) => (el.textContent = state.me.username));
  $$("[data-me-status]").forEach((el) => (el.dataset.status = state.me.status || "available"));
}

function setMe(me) {
  state.me = { ...state.me, ...me };
  rememberUser(state.me);
  renderMe();
}

// ==========================================================================
// Perfil
// ==========================================================================
// Frases rápidas para la info (como WhatsApp)
const BIO_PRESETS = ["Disponible", "Ocupado", "En el trabajo 💼", "En el gym 🏋️", "Estudiando 📚", "Solo llamadas urgentes", "De viaje ✈️", "Durmiendo 😴"];
const COLOR_LABELS = { blue: "Azul", violet: "Violeta", green: "Verde", pink: "Rosa", orange: "Naranja", teal: "Turquesa", red: "Rojo", slate: "Pizarra" };

const profile = {
  color: "blue",
  birthday: null,
  removeAvatar: false,
  usernameOk: true,
};

function paintCover(color) {
  const [c1, c2] = profileColor(color);
  $("#profileCover").style.setProperty("--cover-1", c1);
  $("#profileCover").style.setProperty("--cover-2", c2);
}

function renderStatusPicker() {
  const current = state.me.status || "available";
  $("#statusPicker").innerHTML = Object.entries(STATUSES)
    .map(
      ([id, s]) => `
      <button type="button" role="radio" aria-checked="${id === current}" class="status-option ${id === current ? "is-selected" : ""}" data-status-choice="${id}">
        <i class="status-dot" data-status="${id}"></i>
        <span><strong>${s.label}</strong><small>${s.hint}</small></span>
      </button>`
    )
    .join("");
  $("#profileStatusDot").dataset.status = current;
  const chip = $("#profilePreviewStatus");
  chip.className = `status-chip is-${current}`;
  chip.innerHTML = `<i></i>${STATUSES[current].label}`;
}

function renderColors() {
  $("#profileColors").innerHTML = Object.entries(PROFILE_COLORS)
    .map(
      ([id, [c1, c2]]) => `
      <button type="button" role="radio" aria-checked="${id === profile.color}" class="${id === profile.color ? "is-selected" : ""}" data-profile-color="${id}" title="${COLOR_LABELS[id]}" aria-label="${COLOR_LABELS[id]}">
        <i class="swatch" style="background:linear-gradient(135deg, ${c1}, ${c2})">${icon("check", "icon-sm")}</i>
      </button>`
    )
    .join("");
  paintCover(profile.color);
}

function renderStats() {
  const convs = [...state.conversations.values()];
  const chats = convs.filter((c) => !isGroup(c) && peerOf(c) && !peerOf(c).official).length;
  const groups = convs.filter(isGroup).length;
  const since = state.me.createdAt ? new Date(state.me.createdAt).toLocaleDateString("es", { month: "short", year: "numeric" }) : "";
  const mine = state.stories.find((g) => g.user.id === state.me.id)?.stories.length || 0;
  $("#profileStats").innerHTML = [
    since && [icon("sparkles", "icon-sm"), "Miembro desde", since],
    [icon("chat", "icon-sm"), "Chats", chats],
    [icon("users", "icon-sm"), "Grupos", groups],
    [icon("status", "icon-sm"), "Estados", mine],
  ]
    .filter(Boolean)
    .map(([i, label, value]) => `<li>${i}<span><strong>${escapeHTML(String(value))}</strong><small>${label}</small></span></li>`)
    .join("");
}

function fillBirthday() {
  const day = $("#pfBirthDay");
  const month = $("#pfBirthMonth");
  if (!day.options.length) {
    day.innerHTML = `<option value="">Día</option>` + Array.from({ length: 31 }, (_, i) => `<option value="${String(i + 1).padStart(2, "0")}">${i + 1}</option>`).join("");
    month.innerHTML = `<option value="">Mes</option>` + MONTH_NAMES.map((m, i) => `<option value="${String(i + 1).padStart(2, "0")}">${m[0].toUpperCase() + m.slice(1)}</option>`).join("");
  }
  const [m, d] = (state.me.birthday || "").split("-");
  day.value = d || "";
  month.value = m || "";
}

const birthdayValue = () => {
  const d = $("#pfBirthDay").value;
  const m = $("#pfBirthMonth").value;
  return d && m ? `${m}-${d}` : "";
};

function updatePreview() {
  const form = $("#profileForm");
  $("#profilePreviewName").textContent = form.elements.name.value.trim() || state.me.name;
  $("#profilePreviewUser").textContent = `@${form.elements.username.value.trim() || state.me.username}`;
  const bio = form.elements.bio.value;
  $("#pfBioCount").textContent = `${bio.length}/140`;
  $$("[data-bio-preset]").forEach((b) => b.classList.toggle("is-active", b.dataset.bioPreset === bio));
  markDirty();
}

/** ¿Hay cambios sin guardar? Activa "Guardar" y lo indica. */
function markDirty() {
  const form = $("#profileForm");
  const changed =
    form.elements.name.value.trim() !== state.me.name ||
    form.elements.username.value.trim() !== state.me.username ||
    form.elements.bio.value !== (state.me.bio || "") ||
    form.elements.phone.value !== (state.me.phone || "") ||
    birthdayValue() !== (state.me.birthday || "") ||
    profile.color !== (state.me.color || "blue") ||
    profile.removeAvatar ||
    Boolean(form.elements.avatar.files[0]);
  $("#profileSave").disabled = !changed || !profile.usernameOk;
  $("#profileDirty").textContent = changed ? "Cambios sin guardar" : "";
}

const checkMyUsername = debounce(async (username) => {
  const note = $("#pfUsernameNote");
  if (username === state.me.username) {
    profile.usernameOk = true;
    note.textContent = "Con él entras y te encuentran.";
    note.dataset.state = "";
    return markDirty();
  }
  if (!/^[a-z0-9_.]{3,20}$/.test(username)) {
    profile.usernameOk = false;
    note.textContent = "De 3 a 20 caracteres: letras, números, punto o guion bajo.";
    note.dataset.state = "error";
    return markDirty();
  }
  try {
    const { available, suggestions } = await Yabla.request(`/api/username-available?username=${encodeURIComponent(username)}&name=${encodeURIComponent(state.me.name)}`);
    profile.usernameOk = available;
    note.dataset.state = available ? "ok" : "error";
    note.textContent = available ? `¡@${username} está libre!` : `Ya está en uso${suggestions.length ? `. Prueba @${suggestions[0]}` : ""}.`;
  } catch {
    profile.usernameOk = true;
  }
  markDirty();
}, 300);

async function setStatus(status) {
  const before = state.me.status;
  state.me.status = status;
  renderStatusPicker();
  renderMe();
  try {
    const { me } = await api.updateProfile(toForm({ status }));
    setMe(me);
    toast(status === "dnd" ? "No molestar: avisos de mensajes silenciados" : `Estado: ${STATUSES[status].label}`, { icon: status === "dnd" ? "bell-off" : "check" });
  } catch (err) {
    state.me.status = before;
    renderStatusPicker();
    renderMe();
    toastError(err.message);
  }
}

function toForm(data) {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

function initProfile() {
  const form = $("#profileForm");
  $("#bioPresets").innerHTML = BIO_PRESETS.map((t) => `<button type="button" class="chip" data-bio-preset="${escapeHTML(t)}">${escapeHTML(t)}</button>`).join("");

  onModalOpen("modal-profile", () => {
    ["name", "username", "bio", "phone"].forEach((k) => (form.elements[k].value = state.me[k] || ""));
    form.elements.avatar.value = "";
    profile.color = state.me.color || "blue";
    profile.removeAvatar = false;
    profile.usernameOk = true;
    $("#profilePhoto").src = state.me.avatar;
    $("#removePhotoBtn").hidden = state.me.avatar === "/assets/images/ui/avatar-default.svg";
    $("#pfUsernameNote").textContent = "Con él entras y te encuentran.";
    $("#pfUsernameNote").dataset.state = "";
    fillBirthday();
    renderStatusPicker();
    renderColors();
    renderStats();
    updatePreview();
  });

  form.addEventListener("input", (e) => {
    if (e.target.name === "username") {
      const clean = e.target.value.toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_.]/g, "");
      if (clean !== e.target.value) e.target.value = clean;
      profile.usernameOk = false;
      checkMyUsername(clean);
    }
    updatePreview();
  });
  form.addEventListener("change", (e) => {
    if (e.target.matches("#pfBirthDay, #pfBirthMonth")) markDirty();
  });

  form.elements.avatar.addEventListener("change", () => {
    const file = form.elements.avatar.files[0];
    if (!file) return;
    profile.removeAvatar = false;
    $("#profilePhoto").src = URL.createObjectURL(file);
    $("#removePhotoBtn").hidden = false;
    markDirty();
  });

  $("#removePhotoBtn").addEventListener("click", () => {
    profile.removeAvatar = true;
    form.elements.avatar.value = "";
    $("#profilePhoto").src = "/assets/images/ui/avatar-default.svg";
    $("#removePhotoBtn").hidden = true;
    markDirty();
  });

  $("#bioPresets").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-bio-preset]");
    if (!chip) return;
    form.elements.bio.value = chip.dataset.bioPreset;
    updatePreview();
  });

  $("#profileColors").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-profile-color]");
    if (!btn) return;
    profile.color = btn.dataset.profileColor;
    renderColors();
    markDirty();
  });

  $("#statusPicker").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-status-choice]");
    if (btn && btn.dataset.statusChoice !== state.me.status) setStatus(btn.dataset.statusChoice);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData();
    ["name", "username", "bio", "phone"].forEach((k) => data.append(k, form.elements[k].value));
    data.append("birthday", birthdayValue());
    data.append("color", profile.color);
    if (form.elements.avatar.files[0]) data.append("avatar", form.elements.avatar.files[0]);
    else if (profile.removeAvatar) data.append("removeAvatar", "true");
    $("#profileSave").disabled = true;
    try {
      const { me } = await api.updateProfile(data);
      setMe(me);
      emit("users");
      emit("conversations");
      closeModal("modal-profile");
      toast("Perfil actualizado", { tone: "success" });
    } catch (err) {
      toastError(err.message);
      markDirty();
    }
  });

  registerAction("share-profile", async () => {
    try {
      const { url } = await api.qr();
      await navigator.clipboard.writeText(url).then(
        () => toast("Enlace de tu perfil copiado", { tone: "success", icon: "link" }),
        () => toast(url, { icon: "link", duration: 6000 })
      );
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
    $("#enterSwitch").checked = prefs.get("enterToSend", true);
    $("#soundSwitch").checked = prefs.get("sound", true);
    $("#readSwitch").checked = state.me.settings.readReceipts;
    $("#lastSeenSwitch").checked = state.me.settings.showLastSeen;
  });

  $("#enterSwitch").addEventListener("change", (e) => prefs.set("enterToSend", e.target.checked));
  // Las notificaciones push se activan con su propio interruptor (push.js)
  $("#soundSwitch").addEventListener("change", (e) => prefs.set("sound", e.target.checked));

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

// Cerrar sesión: se pide en segundo plano y se va al inicio (sin reenvíos de formulario ni páginas de error)
function initLogout() {
  const form = $("#modal-logout form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    $("button[type=submit]", form).disabled = true;
    // Este dispositivo deja de recibir notificaciones de esta cuenta
    await forgetDevice().catch(() => {});
    try {
      await fetch("/logout", { method: "POST", headers: { Accept: "application/json" }, credentials: "same-origin" });
    } catch {
      /* aunque falle la red, se sale igual: el inicio pedirá iniciar sesión */
    }
    location.replace("/");
  });
}

// ==========================================================================
// Cambiar contraseña
// ==========================================================================
const PW_LABELS = ["Mínimo 6 caracteres.", "Aceptable. Más larga es más segura.", "Buena contraseña.", "¡Contraseña fuerte!"];

function initPassword() {
  const form = $("#passwordForm");
  const f = form.elements;
  const setErr = (name, msg) => {
    $(`[data-pw-error="${name}"]`).textContent = msg || "";
    f[name].classList.toggle("is-invalid", Boolean(msg));
  };

  function refresh() {
    const next = f.next.value;
    let level = 0;
    if (next.length >= 6) level = 1;
    if (next.length >= 8 && /\d/.test(next) && /[a-z]/i.test(next)) level = 2;
    if (next.length >= 10 && /\d/.test(next) && /[A-Z]/.test(next) && /[^A-Za-z0-9]/.test(next)) level = 3;
    $("#pwStrength").dataset.level = next ? level : 0;
    $("#pwStrength").classList.toggle("is-short", Boolean(next) && next.length < 6);
    $("#pwStrengthLabel").textContent = next && next.length < 6 ? `Faltan ${6 - next.length} caracteres.` : PW_LABELS[level];

    const match = f.confirm.value && f.confirm.value === next;
    $("#pwMatch").dataset.state = !f.confirm.value ? "" : match ? "ok" : "no";
    $("#pwMatch").innerHTML = !f.confirm.value ? "" : icon(match ? "check" : "x", "icon-sm");
    $("#pwSubmit").disabled = !(f.current.value && next.length >= 6 && match);
  }

  onModalOpen("modal-password", () => {
    form.reset();
    f.username.value = state.me.username;
    $("#pwLogoutOthers").checked = true;
    ["current", "next", "confirm"].forEach((n) => setErr(n, ""));
    form.querySelectorAll("[data-pw-toggle]").forEach((btn) => {
      $(`#${btn.dataset.pwToggle}`).type = "password";
      btn.querySelector("use").setAttribute("href", "/assets/images/icons.svg#i-eye");
    });
    refresh();
  });

  form.addEventListener("input", (e) => {
    if (e.target.name) setErr(e.target.name, "");
    refresh();
  });

  // Mostrar u ocultar cada campo
  form.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pw-toggle]");
    if (!btn) return;
    const input = $(`#${btn.dataset.pwToggle}`);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.querySelector("use").setAttribute("href", `/assets/images/icons.svg#i-${show ? "eye-off" : "eye"}`);
    btn.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (f.confirm.value !== f.next.value) return setErr("confirm", "Las contraseñas no coinciden.");
    const btn = $("#pwSubmit");
    btn.disabled = true;
    try {
      const { closedSessions } = await api.changePassword({ current: f.current.value, next: f.next.value, logoutOthers: $("#pwLogoutOthers").checked });
      closeModal("modal-password");
      toast(
        closedSessions ? `Contraseña cambiada. Cerramos ${closedSessions} sesión${closedSessions === 1 ? "" : "es"} en otros dispositivos.` : "Contraseña cambiada",
        { tone: "success", icon: "lock", duration: 4200 }
      );
    } catch (err) {
      const errors = err.data?.errors || {};
      Object.entries(errors).forEach(([name, msg]) => setErr(name, msg));
      if (!Object.keys(errors).length) toastError(err.message);
      (errors.current ? f.current : f.next).focus();
      refresh();
    }
  });
}

export function initAccount() {
  initPassword();
  initLogout();
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
