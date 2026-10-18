// Tarjeta con título, descripción e imagen del primer enlace de un mensaje.
import { escapeHTML, icon } from "./utils.js";
import { api } from "./api.js";

const URL_RE = /https?:\/\/[^\s<]+[^\s<.,;:!?)\]]/;
const cache = new Map(); // url -> Promise<preview | null>

export const firstLink = (text = "") => URL_RE.exec(text)?.[0] || null;

/** Hueco que se rellena después (no retrasa el pintado del mensaje). */
export const linkSlot = (msg) => {
  const url = msg.type === "text" && !msg.deletedAt && !msg.pending ? firstLink(msg.body) : null;
  return url ? `<div class="link-preview is-loading" data-link="${escapeHTML(url)}"></div>` : "";
};

function load(url) {
  if (!cache.has(url)) cache.set(url, api.linkPreview(url).then((r) => r.preview, () => null));
  return cache.get(url);
}

function cardHTML(p) {
  const image = p.image ? `<img src="${escapeHTML(p.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" ${p.imageOnly ? 'class="is-full"' : ""}>` : "";
  return `
    <a href="${escapeHTML(p.url)}" target="_blank" rel="noopener noreferrer">
      ${image}
      <span class="link-preview-body">
        <small>${icon("globe", "icon-sm")}${escapeHTML(p.site || "")}</small>
        ${p.title ? `<strong>${escapeHTML(p.title)}</strong>` : ""}
        ${p.description ? `<span>${escapeHTML(p.description)}</span>` : ""}
      </span>
    </a>`;
}

/** Rellena los huecos pendientes dentro de `root`. `onSize` se llama si cambia el alto (para el scroll). */
export function hydrateLinks(root, onSize) {
  root.querySelectorAll(".link-preview.is-loading").forEach(async (slot) => {
    slot.classList.remove("is-loading");
    const preview = await load(slot.dataset.link);
    if (!slot.isConnected) return;
    if (!preview) return slot.remove();
    slot.innerHTML = cardHTML(preview);
    slot.classList.add("is-ready");
    // Si la imagen no carga se quita y queda solo el texto
    const img = slot.querySelector("img");
    img?.addEventListener("error", () => img.remove(), { once: true });
    img?.addEventListener("load", () => onSize?.(), { once: true });
    onSize?.();
  });
}
