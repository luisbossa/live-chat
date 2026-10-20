// Móvil (sobre todo Safari de iPhone): la app se ajusta al alto que queda visible con el teclado
// abierto y no deja que el navegador la desplace. Así, al escribir, la cabecera se queda arriba,
// la barra de escribir queda pegada encima del teclado y nada «salta».
//
// - --app-h: alto visible real (sin el teclado) · --vv-top: lo que Safari desplazó la vista.
// - html.kb-open mientras el teclado está abierto (se oculta la barra inferior, etc.).
// - Emite "viewport" al cambiar el alto para que el chat siga abajo si lo estaba.
import { emit } from "./state.js";

const touch = matchMedia("(hover: none), (pointer: coarse)");
const isField = (el) => el?.matches?.("input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]), textarea, select, [contenteditable='true']");

export function initViewport() {
  const vv = window.visualViewport;
  const root = document.documentElement;
  if (!vv) return;

  // Alto «sin teclado» de referencia para esta orientación (el mayor que se ha visto)
  let baseline = 0;
  let frame = 0;
  let lastHeight = 0;

  const update = () => {
    frame = 0;
    const height = Math.round(vv.height);
    baseline = Math.max(baseline, height, Math.round(window.innerHeight));
    const keyboard = touch.matches && baseline - height > 150 && isField(document.activeElement);

    root.style.setProperty("--app-h", `${height}px`);
    // Safari desplaza la «vista» dentro de la página al enfocar un campo: se compensa
    root.style.setProperty("--vv-top", `${touch.matches ? Math.max(0, Math.round(vv.offsetTop)) : 0}px`);
    root.classList.toggle("kb-open", keyboard);

    // La página en sí nunca debe quedar desplazada (solo se desplazan las listas por dentro)
    if (touch.matches && (window.scrollY || document.scrollingElement?.scrollTop)) window.scrollTo(0, 0);

    if (height !== lastHeight) {
      lastHeight = height;
      emit("viewport", { height, keyboard });
    }
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  vv.addEventListener("resize", schedule);
  vv.addEventListener("scroll", schedule);
  window.addEventListener("resize", schedule);
  window.addEventListener("orientationchange", () => {
    baseline = 0;
    setTimeout(schedule, 350);
  });

  // Al enfocar un campo, Safari anima el teclado y mueve la página: se corrige durante la animación
  document.addEventListener("focusin", (e) => {
    if (!touch.matches || !isField(e.target)) return;
    schedule();
    [60, 180, 320, 500].forEach((ms) => setTimeout(schedule, ms));
  });
  document.addEventListener("focusout", () => {
    if (!touch.matches) return;
    [60, 250].forEach((ms) => setTimeout(schedule, ms));
  });

  update();
}
