// Datos de «Conocer»: provincias de Costa Rica (para una distancia aproximada, nunca la
// ubicación exacta), lista cerrada de intereses y preguntas para el perfil.

// Coordenadas de la cabecera de cada provincia
const PROVINCES = {
  "san-jose": { name: "San José", lat: 9.9281, lng: -84.0907 },
  alajuela: { name: "Alajuela", lat: 10.0163, lng: -84.2116 },
  cartago: { name: "Cartago", lat: 9.8644, lng: -83.9194 },
  heredia: { name: "Heredia", lat: 9.9981, lng: -84.1165 },
  guanacaste: { name: "Guanacaste", lat: 10.6346, lng: -85.4377 }, // Liberia
  puntarenas: { name: "Puntarenas", lat: 9.9763, lng: -84.8384 },
  limon: { name: "Limón", lat: 9.9907, lng: -83.0359 },
};

/** Distancia en km entre dos provincias (Haversine). Misma provincia ≈ 10 km. */
function distanceKm(a, b) {
  const p = PROVINCES[a];
  const q = PROVINCES[b];
  if (!p || !q) return null;
  if (a === b) return 10;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(q.lat - p.lat);
  const dLng = rad(q.lng - p.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(p.lat)) * Math.cos(rad(q.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}

const INTERESTS = [
  "Café ☕", "Playa 🏖️", "Mejenga ⚽", "Senderismo 🥾", "Surf 🏄", "Música 🎵", "Conciertos 🎤", "Cine 🎬",
  "Series 📺", "Viajar ✈️", "Cocinar 🍳", "Comida tica 🌮", "Mascotas 🐶", "Gatos 🐱", "Gym 💪", "Yoga 🧘",
  "Bailar 💃", "Fotografía 📷", "Lectura 📚", "Videojuegos 🎮", "Arte 🎨", "Volcanes 🌋", "Naturaleza 🌿",
  "Ciclismo 🚴", "Idiomas 🗣️", "Tecnología 💻", "Emprender 🚀", "Voluntariado 🤝", "Vino 🍷", "Karaoke 🎶",
];

const PROMPTS = [
  "Mi plan ideal un sábado es…",
  "Mi comida tica favorita es…",
  "Lo que más valoro en alguien es…",
  "Un lugar de Costa Rica que te tengo que mostrar…",
  "Me río mucho cuando…",
  "Mi canción para un viaje en carro…",
  "La mejor primera cita sería…",
  "Un dato curioso sobre mí…",
];

// Preguntas «Esto o aquello» para romper el hielo
const THIS_OR_THAT = [
  ["Playa 🏖️", "Montaña 🏔️"],
  ["Café ☕", "Té 🍵"],
  ["Gallo pinto", "Pancakes"],
  ["Perros 🐶", "Gatos 🐱"],
  ["Cine 🎬", "Serie en casa 📺"],
  ["Madrugar 🌅", "Trasnochar 🌙"],
  ["Concierto 🎤", "Karaoke 🎶"],
  ["Viaje planeado 🗺️", "Viaje improvisado 🎒"],
  ["Saprissa 💜", "Liga ❤️🖤"],
  ["Volcán 🌋", "Catarata 💧"],
];

module.exports = { PROVINCES, distanceKm, INTERESTS, PROMPTS, THIS_OR_THAT };
