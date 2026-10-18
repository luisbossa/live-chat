// Personalización: color de la app, fondo del chat y tamaño del texto (Ajustes → Apariencia).
import { $, escapeHTML, icon } from "./utils.js";
import { onModalOpen } from "./ui.js";

const ACCENTS = [
  { id: "blue", label: "Azul" },
  { id: "violet", label: "Violeta" },
  { id: "green", label: "Verde" },
  { id: "pink", label: "Rosa" },
  { id: "orange", label: "Naranja" },
  { id: "teal", label: "Turquesa" },
];

const WALLPAPERS = [
  { id: "dots", label: "Puntos" },
  { id: "plain", label: "Liso" },
  { id: "gradient", label: "Degradado" },
  { id: "grid", label: "Cuadrícula" },
  { id: "bubbles", label: "Burbujas" },
];

const TEXT_SIZES = [
  { id: "sm", label: "Pequeño" },
  { id: "md", label: "Normal" },
  { id: "lg", label: "Grande" },
];

function radio(group, item, current, inner) {
  const checked = item.id === current;
  return `
    <button type="button" role="radio" aria-checked="${checked}" class="${checked ? "is-selected" : ""}"
      data-appearance="${group}" data-value="${item.id}" title="${escapeHTML(item.label)}" aria-label="${escapeHTML(item.label)}">
      ${inner}
    </button>`;
}

function render() {
  const accent = Yabla.getAppearance("accent");
  const wallpaper = Yabla.getAppearance("wallpaper");
  const size = Yabla.getAppearance("textSize");

  $("#accentSwatches").innerHTML = ACCENTS.map((a) => radio("accent", a, accent, `<i class="swatch swatch-${a.id}">${icon("check", "icon-sm")}</i>`)).join("");
  $("#wallpaperOptions").innerHTML = WALLPAPERS.map((w) =>
    radio("wallpaper", w, wallpaper, `<i class="wall-preview wall-${w.id}"><b></b><b></b></i><small>${w.label}</small>`)
  ).join("");
  $("#textSizeOptions").innerHTML = TEXT_SIZES.map((t) => radio("textSize", t, size, `<span class="size-${t.id}">Aa</span>${t.label}`)).join("");
}

export function initAppearance() {
  onModalOpen("modal-settings", render);
  $("#modal-settings").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-appearance]");
    if (!btn) return;
    Yabla.setAppearance(btn.dataset.appearance, btn.dataset.value);
    render();
    $(`[data-appearance="${btn.dataset.appearance}"][data-value="${btn.dataset.value}"]`)?.focus();
  });
}
