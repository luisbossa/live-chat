// Sonidos de la app sintetizados con Web Audio (sin archivos que descargar):
// mensaje nuevo en otro chat, mensaje en el chat abierto y mensaje enviado.
// Los navegadores móviles solo permiten sonar tras un toque del usuario: el audio se
// «desbloquea» en la primera interacción con la página.
import { prefs } from "./utils.js";

let ctx = null;

function context() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

["pointerdown", "keydown", "touchstart"].forEach((type) => window.addEventListener(type, () => context(), { once: true, passive: true }));

/** Nota con subida de tono y caída rápida de volumen. */
function note(ac, { at = 0, from, to = from, dur, gain, type = "sine" }) {
  const t = ac.currentTime + at;
  const osc = ac.createOscillator();
  const vol = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + Math.min(dur, 0.08));
  vol.gain.setValueAtTime(0.0001, t);
  vol.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  vol.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(vol).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function play(build) {
  if (!prefs.get("sound", true)) return;
  try {
    const ac = context();
    if (ac) build(ac);
  } catch {
    /* sin audio disponible */
  }
}

/** Mensaje nuevo en otro chat: «ding-ding» corto y brillante. */
export const playIncoming = () =>
  play((ac) => {
    note(ac, { from: 784, to: 988, dur: 0.16, gain: 0.08 });
    note(ac, { from: 784, to: 988, dur: 0.16, gain: 0.025, type: "triangle" });
    note(ac, { at: 0.11, from: 1175, to: 1480, dur: 0.26, gain: 0.07 });
    note(ac, { at: 0.11, from: 1175, to: 1480, dur: 0.22, gain: 0.02, type: "triangle" });
  });

/** Mensaje en el chat que tienes abierto: un «tic» suave. */
export const playInChat = () => play((ac) => note(ac, { from: 1320, to: 1560, dur: 0.09, gain: 0.04 }));

/** Mensaje enviado: un «pop» que baja de tono. */
export const playSent = () =>
  play((ac) => {
    note(ac, { from: 660, to: 330, dur: 0.11, gain: 0.05 });
    note(ac, { at: 0.02, from: 990, to: 600, dur: 0.06, gain: 0.015, type: "triangle" });
  });
