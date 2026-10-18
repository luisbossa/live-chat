// Mensajes temporales (desaparecen) y programados (se envían más tarde).
import { $, icon, escapeHTML, toast, toastError, timeLabel } from "./utils.js";
import { state, activeConv, upsertConversation, emit, on, setDraft } from "./state.js";
import { api } from "./api.js";
import { disappearLabel } from "./format.js";
import { openModal, closeModal, onModalOpen, registerAction } from "./ui.js";
import { removeMessages, messageInput, autosize } from "./conversation.js";

// ==========================================================================
// Mensajes temporales
// ==========================================================================
const DISAPPEAR = [
  { seconds: 0, hint: "Los mensajes se quedan en el chat" },
  { seconds: 24 * 3600, hint: "Ideal para cosas del día" },
  { seconds: 7 * 24 * 3600, hint: "Como en WhatsApp" },
  { seconds: 90 * 24 * 3600, hint: "Tres meses" },
];

function renderDisappearOptions() {
  const current = activeConv()?.disappearAfter || 0;
  $("#disappearOptions").innerHTML = DISAPPEAR.map(
    (o) => `
      <button type="button" role="radio" aria-checked="${o.seconds === current}" class="radio-row ${o.seconds === current ? "is-selected" : ""}" data-disappear="${o.seconds}">
        <span class="radio-dot"></span>
        <span><strong>${disappearLabel(o.seconds)}</strong><small>${o.hint}</small></span>
      </button>`
  ).join("");
}

async function setDisappearing(seconds) {
  const conv = activeConv();
  if (!conv) return;
  try {
    const { conversation } = await api.setDisappearing(conv.id, seconds);
    upsertConversation(conversation);
    emit("conversations");
    closeModal("modal-disappearing");
    toast(seconds ? `Mensajes temporales: ${disappearLabel(seconds).toLowerCase()}` : "Mensajes temporales desactivados", { icon: "timer" });
  } catch (err) {
    toastError(err.message);
  }
}

/** Quita del chat los mensajes temporales que ya caducaron (el servidor también los borra). */
function sweepExpired() {
  const now = Date.now();
  state.messages.forEach((store, conversationId) => {
    const ids = store.items.filter((m) => m.expiresAt && m.expiresAt <= now).map((m) => m.id);
    if (ids.length) removeMessages(conversationId, ids);
  });
}

// ==========================================================================
// Mensajes programados
// ==========================================================================
const pad = (n) => String(n).padStart(2, "0");
const toLocalInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** "hoy a las 20:00", "mañana a las 08:00", "el viernes 24 a las 09:00". */
export function whenLabel(ms) {
  const d = new Date(ms);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 864e5);
  if (d.toDateString() === today.toDateString()) return `hoy a las ${timeLabel(ms)}`;
  if (d.toDateString() === tomorrow.toDateString()) return `mañana a las ${timeLabel(ms)}`;
  return `el ${d.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "short" })} a las ${timeLabel(ms)}`;
}

function quickTimes() {
  const at = (days, h, m = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(h, m, 0, 0);
    return d;
  };
  const now = new Date();
  const list = [{ label: "En 1 hora", date: new Date(Math.ceil((Date.now() + 3600e3) / 300e3) * 300e3) }];
  if (now.getHours() < 19) list.push({ label: "Hoy a las 20:00", date: at(0, 20) });
  list.push({ label: "Mañana a las 08:00", date: at(1, 8) });
  // Próximo lunes a las 09:00
  const toMonday = ((8 - now.getDay()) % 7) || 7;
  list.push({ label: "El lunes a las 09:00", date: at(toMonday, 9) });
  return list;
}

let scheduleFromComposer = false;

export function openSchedule() {
  const conv = activeConv();
  if (!conv) return;
  scheduleFromComposer = Boolean(messageInput.value.trim());
  $("#scheduleText").value = messageInput.value;
  const options = quickTimes();
  $("#scheduleQuick").innerHTML = options.map((o, i) => `<button type="button" class="chip" data-quick-time="${o.date.getTime()}">${o.label}</button>`).join("");
  const min = new Date(Date.now() + 2 * 60e3);
  $("#scheduleAt").min = toLocalInput(min);
  $("#scheduleAt").value = toLocalInput(options[0].date);
  updateScheduleHint();
  openModal("modal-schedule");
  requestAnimationFrame(() => $("#scheduleText").focus());
}

function updateScheduleHint() {
  const ms = new Date($("#scheduleAt").value).getTime();
  $("#scheduleHint").textContent = Number.isFinite(ms) ? `Se enviará ${whenLabel(ms)}. Solo tú lo verás hasta entonces.` : "";
  document.querySelectorAll("[data-quick-time]").forEach((b) => b.classList.toggle("is-active", Math.abs(Number(b.dataset.quickTime) - ms) < 60e3));
}

export function renderScheduledChip(conv = activeConv()) {
  const n = conv?.scheduledCount || 0;
  $("#scheduledChip").hidden = !n;
  $("#scheduledChipText").textContent = n === 1 ? "1 mensaje programado" : `${n} mensajes programados`;
}

async function loadScheduled() {
  const conv = activeConv();
  const list = $("#scheduledList");
  if (!conv) return;
  try {
    const { scheduled } = await api.scheduled(conv.id);
    list.innerHTML = scheduled.length
      ? scheduled
          .map(
            (s) => `
          <li>
            <span class="scheduled-when">${icon("calendar-clock", "icon-sm")}${escapeHTML(whenLabel(s.sendAt))}</span>
            <p>${escapeHTML(s.body)}</p>
            <div class="scheduled-actions">
              <button class="btn btn-ghost btn-sm" data-scheduled-send="${s.id}">${icon("send", "icon-sm")}Enviar ahora</button>
              <button class="btn btn-ghost btn-sm is-danger" data-scheduled-cancel="${s.id}">${icon("trash", "icon-sm")}Cancelar</button>
            </div>
          </li>`
          )
          .join("")
      : `<li class="empty-state"><span class="empty-icon">${icon("calendar-clock")}</span><strong>No hay mensajes programados</strong><small>Mantén pulsado el botón de enviar o usa el clip para programar uno.</small></li>`;
  } catch (err) {
    list.innerHTML = `<li class="empty-list">${escapeHTML(err.message)}</li>`;
  }
}

function initSchedule() {
  $("#scheduleQuick").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-quick-time]");
    if (!btn) return;
    $("#scheduleAt").value = toLocalInput(new Date(Number(btn.dataset.quickTime)));
    updateScheduleHint();
  });
  $("#scheduleAt").addEventListener("input", updateScheduleHint);

  $("#scheduleForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const conv = activeConv();
    const text = $("#scheduleText").value.trim();
    const sendAt = new Date($("#scheduleAt").value).getTime();
    if (!conv || !text) return $("#scheduleText").focus();
    if (!Number.isFinite(sendAt) || sendAt < Date.now() + 60e3) return toastError("Elige una hora futura (al menos dentro de un minuto).");
    try {
      await api.schedule(conv.id, { text, sendAt });
      closeModal("modal-schedule");
      if (scheduleFromComposer) {
        messageInput.value = "";
        autosize();
        if (setDraft(conv.id, "")) emit("drafts");
      }
      toast(`Programado para ${whenLabel(sendAt)}`, { tone: "success", icon: "calendar-clock" });
    } catch (err) {
      toastError(err.message);
    }
  });

  onModalOpen("modal-scheduled", () => {
    $("#scheduledList").innerHTML = `<li class="empty-list"><span class="spinner"></span></li>`;
    loadScheduled();
  });
  $("#scheduledList").addEventListener("click", async (e) => {
    const send = e.target.closest("[data-scheduled-send]");
    const cancel = e.target.closest("[data-scheduled-cancel]");
    if (!send && !cancel) return;
    try {
      if (send) {
        await api.sendScheduledNow(send.dataset.scheduledSend);
        toast("Mensaje enviado", { tone: "success", icon: "send" });
      } else {
        await api.cancelScheduled(cancel.dataset.scheduledCancel);
        toast("Mensaje programado cancelado", { icon: "trash" });
      }
      loadScheduled();
    } catch (err) {
      toastError(err.message);
      loadScheduled();
    }
  });
  registerAction("new-schedule", () => {
    closeModal("modal-scheduled");
    openSchedule();
  });

  // Clic derecho o pulsación larga en "Enviar" → programar (como en Telegram)
  const sendBtn = $("#sendBtn");
  sendBtn.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    openSchedule();
  });
  let press;
  let longPressed = false;
  sendBtn.addEventListener(
    "touchstart",
    () => {
      longPressed = false;
      press = setTimeout(() => {
        longPressed = true;
        navigator.vibrate?.(15);
        openSchedule();
      }, 550);
    },
    { passive: true }
  );
  ["touchend", "touchmove", "touchcancel"].forEach((evt) => sendBtn.addEventListener(evt, () => clearTimeout(press), { passive: true }));
  // Tras la pulsación larga, levantar el dedo no debe enviar el mensaje
  sendBtn.addEventListener(
    "click",
    (e) => {
      if (!longPressed) return;
      longPressed = false;
      e.preventDefault();
      e.stopImmediatePropagation();
    },
    true
  );
}

export function initTimed() {
  onModalOpen("modal-disappearing", renderDisappearOptions);
  $("#disappearOptions").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-disappear]");
    if (btn) setDisappearing(Number(btn.dataset.disappear));
  });
  registerAction("disappearing", () => openModal("modal-disappearing"));
  setInterval(sweepExpired, 10 * 1000);

  initSchedule();
  on("conversations", () => renderScheduledChip());
}
