// Personalización: color de la app, fondo del chat y tamaño del texto (Ajustes → Apariencia).
import { $, escapeHTML, icon } from "./utils.js";
import { onModalOpen } from "./ui.js";

// Temas: colores de fondo, superficie y burbuja recibida para la miniatura
const THEMES = [
  { id: "auto", label: "Sistema", auto: true },
  { id: "light", label: "Claro", bg: "#f7f7f7", surface: "#ffffff", bubble: "#ffffff", line: "#dedfdf" },
  { id: "sepia", label: "Sepia", bg: "#f3ebdd", surface: "#fbf6ec", bubble: "#fffaf1", line: "#e1d1b8" },
  { id: "dark", label: "Oscuro", bg: "#0f1012", surface: "#18191c", bubble: "#222327", line: "#2e3035" },
  { id: "dim", label: "Atenuado", bg: "#15202b", surface: "#1b2733", bubble: "#22303d", line: "#2f3e4c" },
  { id: "ocean", label: "Océano", bg: "#0a1420", surface: "#0f1d2c", bubble: "#152739", line: "#1f3550" },
  { id: "midnight", label: "Medianoche", bg: "#000000", surface: "#0a0a0b", bubble: "#151517", line: "#232327" },
];

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

/** Miniatura del tema: barra superior y dos burbujas (la propia usa el color de la app). */
function themeCard(t, current) {
  const checked = t.id === current;
  const style = t.auto ? "" : `style="--p-bg:${t.bg};--p-surface:${t.surface};--p-bubble:${t.bubble};--p-line:${t.line}"`;
  return `
    <button type="button" role="radio" aria-checked="${checked}" class="theme-card ${checked ? "is-selected" : ""}" data-theme-choice="${t.id}" title="${t.label}">
      <i class="theme-preview ${t.auto ? "is-auto" : ""}" ${style}><u></u><b></b><b></b></i>
      <span>${t.auto ? icon("monitor", "icon-sm") : ""}${t.label}</span>
    </button>`;
}

function renderThemes() {
  const current = Yabla.getThemeChoice();
  ["#themeMenu", "#themeOptions"].forEach((sel) => ($(sel).innerHTML = THEMES.map((t) => themeCard(t, current)).join("")));
}

/** Marca el tema elegido sin volver a pintar (el menú sigue abierto para comparar). */
function markTheme() {
  const current = Yabla.getThemeChoice();
  document.querySelectorAll("[data-theme-choice]").forEach((card) => {
    const on = card.dataset.themeChoice === current;
    card.classList.toggle("is-selected", on);
    card.setAttribute("aria-checked", on);
  });
}

function render() {
  renderThemes();
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
  renderThemes();
  document.addEventListener("themechange", markTheme);
  // Elegir tema (en el menú de la barra o en Ajustes)
  document.addEventListener("click", (e) => {
    const card = e.target.closest("[data-theme-choice]");
    if (card) Yabla.setTheme(card.dataset.themeChoice);
  });
  $("#modal-settings").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-appearance]");
    if (!btn) return;
    Yabla.setAppearance(btn.dataset.appearance, btn.dataset.value);
    render();
    $(`[data-appearance="${btn.dataset.appearance}"][data-value="${btn.dataset.value}"]`)?.focus();
  });
}
