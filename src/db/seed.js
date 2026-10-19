// Datos de demostración.  npm run seed  ·  npm run db:reset (borra todo y vuelve a sembrar)
const db = require("../config/database");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Story = require("../models/Story");

const PASSWORD = "demo1234";
const AV = "/assets/images/avatars/";
const HOUR = 3600 * 1000;

// Fecha relativa: hace `days` días a la hora indicada
function at(days, time) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

function say(conversationId, sender, when, data) {
  return Message.create({ conversationId, senderId: sender.id, createdAt: when, ...(typeof data === "string" ? { body: data } : data) });
}

/** Marca todo como leído excepto los últimos `unread` mensajes que recibió `user`. */
async function readUpTo(conversationId, user, unread = 0) {
  const ids = (await db.all("SELECT id FROM messages WHERE conversation_id = ? AND (sender_id <> ? OR sender_id IS NULL) ORDER BY id", [conversationId, user.id])).map((r) => r.id);
  const last = await db.get("SELECT id, created_at FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 1", [conversationId]);
  const lastId = last?.id || 0;
  const readId = unread ? ids[ids.length - unread - 1] || 0 : lastId;
  // Hora de lectura verosímil (para "Info del mensaje"): poco después del último mensaje
  const at = Math.min(Date.now(), (last?.created_at || Date.now()) + 2 * 60 * 1000);
  await Conversation.updateReceipts(conversationId, user.id, { delivered: lastId, read: readId, at });
}

async function isEmpty() {
  return (await db.get("SELECT COUNT(*) AS n FROM users")).n === 0;
}

async function clear() {
  const tables = ["push_subscriptions", "dating_reports", "dating_matches", "dating_swipes", "dating_profiles", "scheduled_messages", "receipt_events", "pinned_messages", "message_hidden", "stars", "reactions", "story_views", "stories", "transactions", "blocks", "messages", "conversation_members", "conversations", "sessions", "files", "users"];
  await db.transaction(async (tx) => {
    for (const t of tables) await tx.run(`DELETE FROM ${t}`);
    await tx.run("DELETE FROM sqlite_sequence");
  });
}

// Cumpleaños de Karla dentro de dos días (coincide con el mensaje programado de ejemplo)
const inTwoDays = (() => {
  const d = new Date(Date.now() + 2 * 864e5);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
})();

// Nombres y apellidos frecuentes en Costa Rica (personas ficticias)
const people = [
  { key: "andres", name: "Andrés Solano", avatar: "avatar-male-1.jpg", bio: "Pura vida 🌴 Disponible para chatear", phone: "+506 8812 4530", color: "teal", birthday: "03-14" },
  { key: "karla", name: "Karla Jiménez", avatar: "avatar-female-1.jpg", bio: "Cafetera de corazón ☕ y viajera", phone: "+506 8723 1190", color: "pink", birthday: inTwoDays },
  { key: "mauricio", name: "Mauricio Vargas", avatar: "friend-avatar10.jpg", bio: "Fan del cine y de las palomitas 🍿", phone: "+506 8456 2201", status: "busy", color: "orange" },
  { key: "daniela", name: "Daniela Mora", avatar: "friend-avatar2.jpg", bio: "Diseñadora UX en San José 🎨", phone: "+506 7015 3388", color: "violet" },
  { key: "esteban", name: "Esteban Rodríguez", avatar: "friend-avatar3.jpg", bio: "Gerente de producto · Heredia", phone: "+506 8390 7712", status: "dnd", color: "slate" },
  { key: "valeria", name: "Valeria Chaves", avatar: "friend-avatar4.jpg", bio: "🌱 Vida sana, yoga y playa", phone: "+506 6021 4597", color: "green", birthday: "08-02" },
  { key: "fernanda", name: "Fernanda Quesada", avatar: "friend-avatar7.jpg", bio: "Profesora de inglés en Cartago 📚", phone: "+506 8877 0164", status: "away", color: "red" },
  { key: "mariana", name: "Mariana Araya", avatar: "friend-avatar13.jpg", bio: "Fotógrafa 📷 Paisajes de Costa Rica", phone: "+506 7290 5521", color: "blue" },
  { key: "diego", name: "Diego Alvarado", avatar: "friend-avatar9.jpg", bio: "Mejenga todos los viernes ⚽", phone: "+506 8604 9930" },
  { key: "josepablo", name: "José Pablo Brenes", avatar: "friend-avatar5.jpg", bio: "Coleccionista de tenis 👟", phone: "+506 6178 2246" },
  { key: "sofia", name: "Sofía Ulate", avatar: "friend-avatar8.jpg", bio: "Estudiante de Medicina en la UCR 🩺", phone: "+506 8541 6603" },
  { key: "kevin", name: "Kevin Céspedes", avatar: "friend-avatar.jpg", bio: "Surfista en Santa Teresa 🏄", phone: "+506 7133 8874" },
];

/** Crea los datos de demostración. Devuelve false si ya había usuarios y no se pidió reset. */
async function seed({ reset = false } = {}) {
  if (reset) await clear();
  else if (!(await isEmpty())) return false;

  const u = {};
  for (const [i, p] of people.entries()) {
    u[p.key] = await User.create({ name: p.name, username: p.key, password: PASSWORD, avatar: AV + p.avatar, bio: p.bio, phone: p.phone });
    // Estado, color de perfil y cumpleaños variados para la demo
    await User.update(u[p.key].id, { presence_status: p.status, profile_color: p.color, birthday: p.birthday });
    // Última conexión variada para que se vea "últ. vez hace…"
    await User.touchLastSeen(u[p.key].id, Date.now() - (i + 1) * 17 * 60 * 1000);
  }

  const direct = async (a, b) => (await Conversation.getOrCreateDirect(a.id, b.id)).id;

  // Andrés ↔ Karla
  let c = await direct(u.andres, u.karla);
  await say(c, u.karla, at(1, "22:24"), "Hola, ¿cómo estás? 😀 Te traje un tres leches buenísimo. Te está esperando en la casa.");
  await say(c, u.karla, at(1, "22:25"), { type: "image", mediaUrl: AV + "avatar-female-5.jpg", body: "Mira esta foto tuya antigua" });
  const reply = await say(c, u.andres, at(1, "22:30"), "¡Jajaja no puede ser! Gracias 💙");
  await Message.react(reply.id, u.karla.id, "❤️");
  await say(c, u.andres, at(0, "09:12"), "Hoy estoy a mil en la oficina, ¿nos vemos mañana?");
  await say(c, u.karla, at(0, "09:20"), "¡Tranqui! Te mando una canción para el día 🎶");
  await say(c, u.karla, at(0, "09:21"), {
    type: "audio",
    mediaUrl: "https://cdn.plyr.io/static/demo/Kishi_Bashi_-_It_All_Began_With_a_Burst.mp3",
    meta: { duration: 192, name: "cancion.mp3" },
  });
  await say(c, u.karla, at(0, "09:21"), { type: "sticker", mediaUrl: "/assets/images/stickers/sticker12.gif" });
  // Pago en colones
  const { send: sendMoney } = require("../models/Transaction");
  const crcId = await sendMoney(u.karla.id, u.andres.id, 850000, "Almuerzo en la soda 🍽️", { currency: "CRC", createdAt: at(0, "09:30") });
  await say(c, u.karla, at(0, "09:30"), { type: "payment", body: "Almuerzo en la soda 🍽️", meta: { amountCents: 850000, currency: "CRC", transactionId: crcId, toUserId: u.andres.id } });
  await readUpTo(c, u.andres);
  await readUpTo(c, u.karla);

  // Andrés ↔ Mauricio (3 sin leer)
  c = await direct(u.andres, u.mauricio);
  await say(c, u.mauricio, at(0, "14:40"), "¡Hola, mae! ¿Cómo va todo?");
  await say(c, u.mauricio, at(0, "14:43"), "¿Vamos al cine en Multiplaza esta noche? 🍿");
  await say(c, u.mauricio, at(0, "14:45"), "Hay estreno de Marvel 😎");
  await readUpTo(c, u.andres, 3);
  await readUpTo(c, u.mauricio);

  // Andrés ↔ Daniela
  c = await direct(u.andres, u.daniela);
  await say(c, u.andres, at(0, "12:10"), "¡Hola, Dani! ¿Te llegó el archivo?");
  await say(c, u.daniela, at(0, "12:22"), "Sí, ya lo revisé, ¡quedó tuanis! 🙌");
  await readUpTo(c, u.andres, 1);
  await readUpTo(c, u.daniela);

  // Andrés ↔ Esteban (con llamada registrada)
  c = await direct(u.andres, u.esteban);
  await say(c, u.esteban, at(0, "13:05"), "Tenemos reunión a las 4 📅");
  await say(c, u.andres, at(0, "13:06"), "Perfecto, ahí estaré");
  await say(c, u.esteban, at(0, "13:40"), { type: "call", meta: { callType: "video", status: "completed", duration: 754 } });
  await readUpTo(c, u.andres);
  await readUpTo(c, u.esteban);

  // Andrés ↔ Valeria (con pago real de la billetera)
  c = await direct(u.andres, u.valeria);
  await say(c, u.andres, at(2, "15:40"), "¿Me pasás lo del viernes? 😅");
  await say(c, u.valeria, at(2, "15:43"), "¿La plata? 💰 Jaja ya te la paso por Yabla");
  const { send } = require("../models/Transaction");
  const transactionId = await send(u.valeria.id, u.andres.id, 2500, "Cena del viernes 🍕", { createdAt: at(2, "15:45") });
  await say(c, u.valeria, at(2, "15:45"), { type: "payment", body: "Cena del viernes 🍕", meta: { amountCents: 2500, currency: "USD", transactionId, toUserId: u.andres.id } });
  await readUpTo(c, u.andres);
  await readUpTo(c, u.valeria);

  // Más chats individuales
  const more = [
    [u.fernanda, 3, [["them", "10:00", "El curso de inglés empieza el lunes 📚"], ["me", "10:15", "¡Gracias, profe! 😄"]]],
    [u.mariana, 3, [["me", "18:20", "¿Quedamos para las fotos?"], ["them", "18:31", "Dale, nos vemos mañana en La Sabana"]]],
    [u.diego, 1, [["them", "13:05", "¿Mejenga el viernes? ⚽"]]],
    [u.josepablo, 1, [["me", "15:40", "Mirá mis tenis nuevas 👟"], ["them", "15:43", "¡Qué chivas! ¿Dónde las compraste? 😍"]]],
  ];
  for (const [friend, days, lines] of more) {
    const id = await direct(u.andres, friend);
    for (const [who, time, text] of lines) await say(id, who === "me" ? u.andres : friend, at(days, time), text);
    await readUpTo(id, u.andres);
    await readUpTo(id, friend);
  }

  // Grupos
  const chicos = await Conversation.createGroup({ name: "Mejenga de los viernes", avatar: AV + "friend-avatar6.jpg", description: "Fútbol 5 todos los viernes a las 7 p. m. en La Sabana ⚽", createdBy: u.mauricio.id, memberIds: [u.andres.id, u.esteban.id, u.diego.id, u.josepablo.id] });
  await say(chicos, u.mauricio, at(1, "20:00"), { type: "system", meta: { action: "created", name: "Mejenga de los viernes" } });
  // Mensaje fijado arriba del chat (como en WhatsApp)
  const plan = await say(chicos, u.mauricio, at(1, "20:05"), "📍 Cancha sintética de La Sabana, viernes 7 p. m. ¡Lleven camiseta blanca y oscura!");
  await Conversation.togglePin(chicos, plan.id, u.mauricio.id);
  await say(chicos, u.mauricio, at(0, "02:30"), "¡Buenas, maes! ¿Cómo amanecieron?");
  await say(chicos, u.diego, at(0, "02:32"), "Con un sueño… 😴");
  await say(chicos, u.josepablo, at(0, "02:34"), { type: "sticker", mediaUrl: "/assets/images/stickers/sticker3.gif" });
  for (const m of [u.mauricio, u.diego, u.josepablo, u.esteban]) await readUpTo(chicos, m);
  await readUpTo(chicos, u.andres, 3);

  const pelis = await Conversation.createGroup({ name: "Noches de película", avatar: AV + "friend-avatar12.jpg", description: "Cada sábado elegimos una peli. ¡Se vale traer palomitas! 🎬", createdBy: u.andres.id, memberIds: [u.karla.id, u.daniela.id, u.mariana.id] });
  await say(pelis, u.andres, at(2, "19:00"), { type: "system", meta: { action: "created", name: "Noches de película" } });
  await say(pelis, u.daniela, at(1, "00:20"), "¿Qué vemos el sábado?");
  await say(pelis, u.karla, at(1, "00:25"), "¡Algo de miedo! 👻");
  await say(pelis, u.mariana, at(1, "00:30"), "Vamos a ver Dune 🏜️");
  for (const m of [u.andres, u.karla, u.daniela, u.mariana]) await readUpTo(pelis, m);

  // «Conocer»: perfiles de citas de ejemplo (todas las personas son mayores de edad)
  const Dating = require("../models/Dating");
  const born = (years, month = "06", day = "15") => `${new Date().getFullYear() - years}-${month}-${day}`;
  const datingProfiles = [
    [u.andres, { birthdate: born(29, "03", "14"), gender: "man", interestedIn: "women", lookingFor: "pareja", province: "san-jose", about: "Ingeniero de día, cocinero aficionado de noche. Siempre con un café en la mano ☕", interests: ["Café ☕", "Cocinar 🍳", "Senderismo 🥾", "Música 🎵", "Viajar ✈️"], prompts: [{ q: "Mi plan ideal un sábado es…", a: "Subir al Irazú temprano y terminar con un gallo pinto en Cartago." }] }],
    [u.karla, { birthdate: born(27), gender: "woman", interestedIn: "men", lookingFor: "pareja", province: "heredia", about: "Viajera, cafetera y fan de los atardeceres en la playa 🌅", interests: ["Café ☕", "Playa 🏖️", "Viajar ✈️", "Fotografía 📷", "Comida tica 🌮"], prompts: [{ q: "Un lugar de Costa Rica que te tengo que mostrar…", a: "Playa Conchal en Guanacaste, el agua es transparente." }] }],
    [u.daniela, { birthdate: born(26, "09", "02"), gender: "woman", interestedIn: "men", lookingFor: "pareja", province: "san-jose", about: "Diseñadora UX. Me encantan los museos, las series y los gatos 🐱", interests: ["Arte 🎨", "Series 📺", "Gatos 🐱", "Café ☕", "Música 🎵"], prompts: [{ q: "La mejor primera cita sería…", a: "Un café en Barrio Escalante y caminar sin rumbo." }] }],
    [u.valeria, { birthdate: born(28, "08", "02"), gender: "woman", interestedIn: "men", lookingFor: "algo_casual", province: "puntarenas", about: "Yoga al amanecer y playa al atardecer 🧘‍♀️", interests: ["Yoga 🧘", "Playa 🏖️", "Surf 🏄", "Naturaleza 🌿", "Cocinar 🍳"], prompts: [{ q: "Me río mucho cuando…", a: "Intento surfear y la ola gana." }] }],
    [u.mariana, { birthdate: born(30, "11", "20"), gender: "woman", interestedIn: "everyone", lookingFor: "no_se", province: "alajuela", about: "Fotógrafa de paisajes. Si hay un volcán cerca, ahí estoy 🌋", interests: ["Fotografía 📷", "Volcanes 🌋", "Senderismo 🥾", "Viajar ✈️", "Café ☕"], prompts: [{ q: "Un dato curioso sobre mí…", a: "He fotografiado los 5 volcanes activos del país." }] }],
    [u.fernanda, { birthdate: born(31, "04", "08"), gender: "woman", interestedIn: "men", lookingFor: "amistad", province: "cartago", about: "Profe de inglés. Libros, té y conversaciones largas 📚", interests: ["Lectura 📚", "Idiomas 🗣️", "Cine 🎬", "Café ☕"], prompts: [{ q: "Lo que más valoro en alguien es…", a: "Que sepa escuchar y me recomiende libros." }] }],
    [u.sofia, { birthdate: born(25, "01", "30"), gender: "woman", interestedIn: "men", lookingFor: "pareja", province: "san-jose", about: "Estudiante de Medicina en la UCR. Bailo salsa los viernes 💃", interests: ["Bailar 💃", "Música 🎵", "Café ☕", "Voluntariado 🤝", "Playa 🏖️"], prompts: [{ q: "Mi canción para un viaje en carro…", a: "Cualquiera de Malpaís, sin discusión." }] }],
    [u.mauricio, { birthdate: born(30), gender: "man", interestedIn: "women", lookingFor: "pareja", province: "san-jose", about: "Cine, palomitas y mejenga los viernes ⚽", interests: ["Cine 🎬", "Mejenga ⚽", "Series 📺", "Videojuegos 🎮"], prompts: [{ q: "Mi comida tica favorita es…", a: "Un casado con chuleta, sin pensarlo." }] }],
    [u.diego, { birthdate: born(28, "05", "05"), gender: "man", interestedIn: "women", lookingFor: "algo_casual", province: "heredia", about: "Ciclista y fan del café de altura 🚴", interests: ["Ciclismo 🚴", "Café ☕", "Naturaleza 🌿", "Mejenga ⚽"], prompts: [{ q: "Mi plan ideal un sábado es…", a: "Rodar hasta Barva y bajar por un café." }] }],
    [u.kevin, { birthdate: born(27, "07", "12"), gender: "man", interestedIn: "women", lookingFor: "no_se", province: "puntarenas", about: "Surfista en Santa Teresa 🏄 Si no estoy en el agua, estoy en la hamaca.", interests: ["Surf 🏄", "Playa 🏖️", "Música 🎵", "Viajar ✈️", "Fotografía 📷"], prompts: [{ q: "La mejor primera cita sería…", a: "Ver el atardecer en Playa Hermosa con un pipa fría." }] }],
  ];
  for (const [user, d] of datingProfiles) {
    await Dating.upsertProfile(user.id, { ...d, photos: [user.avatar], ageMin: 21, ageMax: 40, maxKm: 250, paused: false });
  }
  await Dating.verify(u.daniela.id);
  await Dating.verify(u.karla.id);
  await Dating.verify(u.mariana.id);

  // Les gustas: al deslizarles a la derecha habrá match
  for (const fan of [u.daniela, u.valeria]) await Dating.swipe(fan.id, u.andres.id, "like");
  await Dating.swipe(u.mariana.id, u.andres.id, "superlike");
  for (const fan of [u.mauricio, u.diego]) await Dating.swipe(fan.id, u.karla.id, "like");

  // Un match ya hecho con su chat (Andrés ↔ Sofía)
  await Dating.swipe(u.sofia.id, u.andres.id, "like");
  const sofiaMatch = await Dating.swipe(u.andres.id, u.sofia.id, "like");
  const matchChat = await direct(u.andres, u.sofia);
  await Conversation.setOrigin(matchChat, "match");
  await Dating.setMatchConversation(sofiaMatch.matchId, matchChat);
  await say(matchChat, u.andres, at(1, "18:00"), { type: "system", meta: { action: "matched" } });
  await say(matchChat, u.sofia, at(1, "18:04"), "¡Hola! Vi que también te gusta el café ☕ ¿Cuál es tu favorito?");
  await say(matchChat, u.andres, at(1, "18:10"), "¡Hola Sofía! El de Tarrazú, sin duda. ¿Y vos?");
  await say(matchChat, u.sofia, at(0, "08:15"), "Naranjo 😄 Un día de estos te reto a una cata.");
  await readUpTo(matchChat, u.andres, 1);
  await readUpTo(matchChat, u.sofia);

  // Un mensaje programado de ejemplo
  await require("../models/Scheduled").create({
    conversationId: await direct(u.andres, u.karla),
    senderId: u.andres.id,
    body: "¡Feliz cumple, Karla! 🎂🎉",
    sendAt: Date.now() + 2 * 24 * HOUR,
  });

  // Estados (24 h)
  const stories = [
    [u.karla, "/assets/images/stories/story1.jpg", "Atardecer en Manuel Antonio 🌊", 3],
    [u.karla, "/assets/images/stories/story4.gif", null, 2.5],
    [u.daniela, "/assets/images/stories/story2.jpg", "Nuevo proyecto en camino 🎨", 8],
    [u.mauricio, "/assets/images/stories/story3.jpg", null, 12],
    [u.mariana, "/assets/images/stories/story2.jpg", "Sesión de fotos en Monteverde 📷", 20],
  ];
  for (const [user, mediaUrl, caption, hoursAgo] of stories) {
    await Story.create({ userId: user.id, mediaUrl, caption, createdAt: Date.now() - hoursAgo * HOUR });
  }

  return people;
}

module.exports = { seed, isEmpty };

// Uso por consola: npm run seed / npm run db:reset
if (require.main === module) {
  (async () => {
    await db.init();
    const created = await seed({ reset: process.argv.includes("--reset") });
    await require("../services/welcome").ensureOfficialAccount();
    if (!created) {
      console.log("La base de datos ya tiene usuarios. Usa `npm run db:reset` para borrarla y volver a sembrar.");
    } else {
      console.log(`Usuarios de demostración creados (contraseña: ${PASSWORD}):`);
      created.forEach((p) => console.log(`  · ${p.name.padEnd(18)} usuario: ${p.key}`));
    }
    db.close();
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
