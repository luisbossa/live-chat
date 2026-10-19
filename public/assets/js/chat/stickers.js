// Panel de stickers por packs (clásicos GIF y packs SVG animados) con recientes.
import { $, escapeHTML, prefs } from "./utils.js";

const DIR = "/assets/images/stickers";
const MAX_RECENT = 12;

const svgPack = (id, names) => names.map((n) => ({ src: `${DIR}/${id}/${n}.svg`, label: n.replace(/-/g, " ") }));

export const PACKS = [
  {
    id: "puravida",
    name: "Pura vida",
    stickers: svgPack("puravida", ["pura-vida", "perezoso", "tucan", "rana", "cafecito", "gallo-pinto", "volcan", "corazon-tico"]),
  },
  {
    id: "frases",
    name: "Frases ticas",
    stickers: svgPack("frases", ["pura-vida", "tuanis", "que-chiva", "mae", "upe", "diay", "jajaja", "al-chile", "gracias", "buenas-noches"]),
  },
  {
    id: "amor",
    name: "Amor",
    stickers: svgPack("amor", ["corazon", "te-quiero", "me-gustas", "salimos", "dos-corazones", "muack", "carta", "es-match"]),
  },
  {
    id: "clasicos",
    name: "Clásicos",
    stickers: Array.from({ length: 35 }, (_, i) => ({ src: `${DIR}/sticker${i + 1}.gif`, label: "Sticker" })),
  },
];

const recent = () => prefs.get("recentStickers", []).filter((src) => typeof src === "string" && src.startsWith(`${DIR}/`));

export function rememberSticker(src) {
  prefs.set("recentStickers", [src, ...recent().filter((s) => s !== src)].slice(0, MAX_RECENT));
}

const cell = ({ src, label }) =>
  `<button type="button" data-sticker="${escapeHTML(src)}" title="${escapeHTML(label)}" aria-label="Sticker ${escapeHTML(label)}"><img src="${escapeHTML(src)}" alt="" loading="lazy" draggable="false"></button>`;

/** Pinta el panel: pestañas con la portada de cada pack y la cuadrícula del pack elegido. */
export function renderStickerPanel(panel, active = prefs.get("stickerPack", "")) {
  const recents = recent();
  const tabs = [
    ...(recents.length ? [{ id: "recent", name: "Recientes", cover: null }] : []),
    ...PACKS.map((p) => ({ id: p.id, name: p.name, cover: p.stickers[0].src })),
  ];
  if (!tabs.some((t) => t.id === active)) active = tabs[0].id;
  const items = active === "recent" ? recents.map((src) => ({ src, label: "Reciente" })) : PACKS.find((p) => p.id === active).stickers;
  const name = tabs.find((t) => t.id === active).name;

  panel.innerHTML = `
    <div class="sticker-tabs" role="tablist" aria-label="Packs de stickers">
      ${tabs
        .map(
          (t) => `<button type="button" role="tab" class="${t.id === active ? "is-active" : ""}" aria-selected="${t.id === active}" data-sticker-pack="${t.id}" title="${escapeHTML(t.name)}">
            ${t.cover ? `<img src="${t.cover}" alt="">` : `<svg class="icon" aria-hidden="true"><use href="/assets/images/icons.svg#i-clock"></use></svg>`}
          </button>`
        )
        .join("")}
    </div>
    <p class="sticker-pack-name">${escapeHTML(name)} <span>${items.length}</span></p>
    <div class="sticker-grid">${items.map(cell).join("")}</div>`;
}

export function initStickers(onPick) {
  const panel = $("#stickerPanel");
  panel.addEventListener("popover:open", () => renderStickerPanel(panel));
  panel.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-sticker-pack]");
    if (tab) {
      // Solo cambia la cuadrícula: el botón pulsado sigue en el DOM y el panel no se cierra
      const id = tab.dataset.stickerPack;
      prefs.set("stickerPack", id);
      const items = id === "recent" ? recent().map((src) => ({ src, label: "Reciente" })) : PACKS.find((p) => p.id === id).stickers;
      panel.querySelectorAll("[data-sticker-pack]").forEach((t) => {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", t === tab);
      });
      panel.querySelector(".sticker-pack-name").innerHTML = `${escapeHTML(tab.title)} <span>${items.length}</span>`;
      panel.querySelector(".sticker-grid").innerHTML = items.map(cell).join("");
      panel.querySelector(".sticker-grid").scrollTop = 0;
      return;
    }
    const btn = e.target.closest("[data-sticker]");
    if (!btn) return;
    rememberSticker(btn.dataset.sticker);
    onPick(btn.dataset.sticker);
  });
}
