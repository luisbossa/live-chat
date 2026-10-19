// «Conocer»: los intereses y opciones se guardan con su emoji («Café ☕»), pero se muestran
// con un icono SVG del sprite y el texto limpio.
import { icon, escapeHTML } from "./utils.js";

const EMOJI = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{200D}\u{20E3}]/gu;

/** Texto sin emojis («Café ☕» → «Café»). */
export const plainLabel = (value) => String(value || "").replace(EMOJI, "").replace(/\s{2,}/g, " ").trim();

const key = (value) => plainLabel(value).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const ICONS = {
  // Intereses
  cafe: "coffee", playa: "beach", mejenga: "ball", senderismo: "footprints", surf: "waves", musica: "music",
  conciertos: "ticket", cine: "clapper", series: "tv", viajar: "plane", cocinar: "pot", "comida tica": "utensils",
  mascotas: "paw", gatos: "cat", gym: "dumbbell", yoga: "lotus", bailar: "party", fotografia: "camera",
  lectura: "book", videojuegos: "gamepad", arte: "palette", volcanes: "volcano", naturaleza: "leaf",
  ciclismo: "bike", idiomas: "languages", tecnologia: "laptop", emprender: "rocket", voluntariado: "hand-heart",
  vino: "wine", karaoke: "mic",
  // «Esto o aquello»
  montana: "mountain", te: "tea", "gallo pinto": "egg", pancakes: "pancakes", perros: "paw",
  "serie en casa": "tv", madrugar: "sunrise", trasnochar: "moon", concierto: "ticket",
  "viaje planeado": "map", "viaje improvisado": "backpack", saprissa: "shirt", liga: "shirt",
  volcan: "volcano", catarata: "droplet",
};

/** Nombre del icono para un interés u opción (o null si no hay uno). */
export const labelIcon = (value) => ICONS[key(value)] || null;

/** HTML: icono + texto limpio, ya escapado. */
export function labelHTML(value, cls = "icon-sm") {
  const name = labelIcon(value);
  return `${name ? icon(name, cls) : ""}${escapeHTML(plainLabel(value))}`;
}

/** Qué busca cada persona, con su icono. */
export const LOOKING = {
  pareja: { icon: "heart", text: "Busca pareja", choice: "Pareja" },
  algo_casual: { icon: "martini", text: "Algo casual", choice: "Algo casual" },
  amistad: { icon: "handshake", text: "Amistad", choice: "Amistad" },
  no_se: { icon: "help", text: "Aún no sabe", choice: "Aún no sé" },
};

export const lookingHTML = (id) => (LOOKING[id] ? `${icon(LOOKING[id].icon, "icon-sm")}${LOOKING[id].text}` : "");
