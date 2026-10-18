// Selector de emojis estilo WhatsApp: pestañas por categoría, buscador y recientes.
import { icon, escapeHTML, prefs } from "./utils.js";
import { CATEGORIES, searchEmojis } from "./emoji-data.js";

const RECENT_KEY = "recentEmojis";
const MAX_RECENT = 24;

const recents = () => prefs.get(RECENT_KEY, []);

function remember(emoji) {
  prefs.set(RECENT_KEY, [emoji, ...recents().filter((e) => e !== emoji)].slice(0, MAX_RECENT));
}

const buttons = (emojis) => emojis.map((e) => `<button type="button" data-emoji="${e}" aria-label="${e}">${e}</button>`).join("");

function sectionHTML(id, label, emojis) {
  return `
    <section class="emoji-section" data-section="${id}">
      <h4>${escapeHTML(label)}</h4>
      <div class="emoji-grid">${buttons(emojis)}</div>
    </section>`;
}

/**
 * Monta el selector dentro de `panel` (se construye la primera vez que se abre).
 * `onPick(emoji)` se llama al elegir un emoji.
 */
export function initEmojiPicker(panel, onPick) {
  let built = false;
  let scroller, tabs, search;

  function renderSections() {
    const recent = recents();
    scroller.innerHTML =
      (recent.length ? sectionHTML("recent", "Recientes", recent) : "") +
      CATEGORIES.map((c) => sectionHTML(c.id, c.label, c.emojis)).join("");
    tabs.querySelector('[data-tab-emoji="recent"]').hidden = !recent.length;
  }

  function setActive(id) {
    tabs.querySelectorAll("[data-tab-emoji]").forEach((t) => t.classList.toggle("is-active", t.dataset.tabEmoji === id));
  }

  // Posición de una sección dentro del área de scroll (independiente del resto del panel)
  const sectionTop = (section) =>
    Math.round(section.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop);

  let jumping = false;
  let jumpTimer;
  function endJump() {
    clearTimeout(jumpTimer);
    jumping = false;
    onScroll();
  }

  function onScroll() {
    const y = scroller.scrollTop + 1;
    let current = null;
    scroller.querySelectorAll(".emoji-section").forEach((s) => {
      const top = sectionTop(s);
      if (top <= y) current = s.dataset.section;
      s.querySelector("h4")?.classList.toggle("is-stuck", top < y && top + s.offsetHeight > y);
    });
    if (!jumping && !search.value && current) setActive(current);
  }

  function build() {
    built = true;
    panel.innerHTML = `
      <label class="emoji-search">
        ${icon("search", "icon-sm")}
        <input type="search" placeholder="Buscar emoji (risa, corazón, fiesta…)" aria-label="Buscar emoji" autocomplete="off">
      </label>
      <nav class="emoji-tabs" role="tablist" aria-label="Categorías de emojis">
        <button type="button" data-tab-emoji="recent" title="Recientes" aria-label="Recientes">${icon("clock", "icon-sm")}</button>
        ${CATEGORIES.map((c) => `<button type="button" data-tab-emoji="${c.id}" title="${escapeHTML(c.label)}" aria-label="${escapeHTML(c.label)}">${c.icon}</button>`).join("")}
      </nav>
      <div class="emoji-scroll"></div>`;

    scroller = panel.querySelector(".emoji-scroll");
    tabs = panel.querySelector(".emoji-tabs");
    search = panel.querySelector(".emoji-search input");
    renderSections();
    setActive(recents().length ? "recent" : CATEGORIES[0].id);

    // Pestaña → salta a su sección
    tabs.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-tab-emoji]");
      if (!tab) return;
      if (search.value) {
        search.value = "";
        renderSections();
      }
      const section = scroller.querySelector(`[data-section="${tab.dataset.tabEmoji}"]`);
      setActive(tab.dataset.tabEmoji);
      if (!section) return;
      // Mientras dura el scroll suave, la pestaña pulsada no cambia al pasar por otras secciones
      jumping = true;
      clearTimeout(jumpTimer);
      jumpTimer = setTimeout(endJump, 2000);
      scroller.scrollTo({ top: sectionTop(section), behavior: "smooth" });
    });

    // Al hacer scroll se marca la categoría visible y se sombrea su título fijo
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("scrollend", endJump);

    // Buscador
    search.addEventListener("input", () => {
      const q = search.value.trim();
      if (!q) {
        renderSections();
        return;
      }
      const found = searchEmojis(q);
      scroller.innerHTML = found.length
        ? sectionHTML("results", `Resultados para «${q}»`, found)
        : `<p class="emoji-empty">No encontramos emojis para «${escapeHTML(q)}».</p>`;
      scroller.scrollTop = 0;
      setActive(null);
    });

    // Elegir emoji (el panel queda abierto para poner varios, como en WhatsApp)
    scroller.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-emoji]");
      if (!btn) return;
      remember(btn.dataset.emoji);
      onPick(btn.dataset.emoji);
    });
  }

  panel.addEventListener("popover:open", () => {
    if (!built) build();
    else if (!search.value) {
      // Actualiza los recientes al volver a abrir
      const keep = scroller.scrollTop;
      renderSections();
      scroller.scrollTop = keep;
    }
  });
}
