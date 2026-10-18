// Modales, menús, paneles emergentes y registro de acciones [data-action].
import { $, $$, escapeHTML } from "./utils.js";

const actions = new Map();
const modalSetups = new Map();

/** Cada módulo registra sus acciones: registerAction("mute", fn). */
export const registerAction = (name, fn) => actions.set(name, fn);
export const runAction = (name, el, event) => actions.get(name)?.(el, event);

/** Se ejecuta justo antes de abrir un modal (para cargar datos). Admite varias funciones por modal. */
export const onModalOpen = (id, fn) => modalSetups.set(id, [...(modalSetups.get(id) || []), fn]);

export function openModal(id, arg) {
  const modal = document.getElementById(id);
  if (!modal) return;
  closeDropdowns();
  modalSetups.get(id)?.forEach((fn) => fn(arg));
  modal.classList.add("is-open");
  requestAnimationFrame(() => $("input:not([type=file]):not([type=checkbox]):not([type=hidden]), select", modal)?.focus({ preventScroll: true }));
}

export function closeModal(modal) {
  if (typeof modal === "string") modal = document.getElementById(modal);
  if (!modal?.classList.contains("is-open")) return;
  modal.classList.remove("is-open");
  modal.dispatchEvent(new CustomEvent("modal:close"));
}

export const openModals = () => $$(".modal.is-open");

/** Confirmación con promesa: if (await confirmDialog({...})) … */
export function confirmDialog({ title, text = "", okText = "Aceptar" }) {
  const modal = $("#modal-confirm");
  $("#confirmTitle").textContent = title;
  $("#confirmText").textContent = text;
  const ok = $("#confirmOk");
  ok.textContent = okText;
  openModal("modal-confirm");
  return new Promise((resolve) => {
    const finish = (value) => {
      ok.removeEventListener("click", accept);
      modal.removeEventListener("modal:close", cancel);
      resolve(value);
    };
    const accept = () => {
      finish(true);
      closeModal(modal);
    };
    const cancel = () => finish(false);
    ok.addEventListener("click", accept);
    modal.addEventListener("modal:close", cancel);
  });
}

export function openLightbox(src) {
  $("#lightboxImg").src = src;
  openModal("modal-lightbox");
}

// --- Paneles emergentes (emojis, stickers, adjuntos) ---
export function closePopovers() {
  $$(".popover").forEach((p) => (p.hidden = true));
  $$("[data-popover]").forEach((b) => b.classList.remove("is-active"));
}

export function togglePopover(id, btn) {
  const panel = document.getElementById(id);
  const willOpen = panel.hidden;
  closePopovers();
  panel.hidden = !willOpen;
  btn?.classList.toggle("is-active", willOpen);
  if (willOpen) panel.dispatchEvent(new CustomEvent("popover:open"));
}

// --- Menús desplegables ---
export function closeDropdowns() {
  $$(".dropdown.is-open").forEach((d) => {
    d.classList.remove("is-open");
    $("[data-dropdown]", d)?.setAttribute("aria-expanded", "false");
  });
}

export function toggleDropdown(btn) {
  const dd = btn.closest(".dropdown");
  const open = !dd.classList.contains("is-open");
  closeDropdowns();
  dd.classList.toggle("is-open", open);
  btn.setAttribute("aria-expanded", open);
}

/** Selector de personas con casillas (grupos, añadir participantes). */
export function renderPicker(container, users, { counterSelector = "[data-member-count]" } = {}) {
  const counter = container.closest("form")?.querySelector(counterSelector);
  container.innerHTML = users.length
    ? users
        .map(
          (u) => `
          <label>
            <input type="checkbox" value="${u.id}">
            <img src="${escapeHTML(u.avatar)}" alt="" loading="lazy">
            <span>${escapeHTML(u.name.split(" ")[0])}</span>
          </label>`
        )
        .join("")
    : `<p class="muted small">No hay personas para añadir.</p>`;
  const update = () => {
    const n = $$("input:checked", container).length;
    if (counter) counter.textContent = n ? `(${n})` : "";
  };
  container.onchange = update;
  update();
  return () => $$("input:checked", container).map((i) => Number(i.value));
}
