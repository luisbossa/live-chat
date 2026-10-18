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
  const lastId = (await db.get("SELECT MAX(id) AS id FROM messages WHERE conversation_id = ?", [conversationId])).id || 0;
  const readId = unread ? ids[ids.length - unread - 1] || 0 : lastId;
  await Conversation.updateReceipts(conversationId, user.id, { delivered: lastId, read: readId });
}

async function isEmpty() {
  return (await db.get("SELECT COUNT(*) AS n FROM users")).n === 0;
}

async function clear() {
  const tables = ["reactions", "story_views", "stories", "transactions", "blocks", "messages", "conversation_members", "conversations", "sessions", "files", "users"];
  await db.transaction(async (tx) => {
    for (const t of tables) await tx.run(`DELETE FROM ${t}`);
    await tx.run("DELETE FROM sqlite_sequence");
  });
}

const people = [
  { key: "alex", name: "Alex Rivera", avatar: "avatar-male-1.jpg", bio: "Disponible para chatear ✨", phone: "+34 600 123 456" },
  { key: "karla", name: "Karla Castro", avatar: "avatar-female-1.jpg", bio: "Amante del café y los viajes ☕✈️", phone: "+971 58 223 5010" },
  { key: "bucky", name: "Bucky Barnes", avatar: "friend-avatar.jpg", bio: "Siempre listo para un partido ⚽", phone: "+34 611 220 118" },
  { key: "susan", name: "Susan Miller", avatar: "friend-avatar2.jpg", bio: "Diseñadora UX 🎨", phone: "+34 622 918 007" },
  { key: "alan", name: "Alan Bernaby", avatar: "friend-avatar3.jpg", bio: "Product manager", phone: "+34 633 004 551" },
  { key: "lucie", name: "Lucie Logan", avatar: "friend-avatar4.jpg", bio: "🌱 Vida sana", phone: "+34 644 778 210" },
  { key: "lucy", name: "Lucy Will", avatar: "friend-avatar7.jpg", bio: "Profesora de idiomas", phone: "+49 151 2233 4455" },
  { key: "sarah", name: "Sarah K", avatar: "friend-avatar8.jpg", bio: "Fotógrafa 📷", phone: "+34 655 312 900" },
  { key: "diego", name: "Diego Torres", avatar: "friend-avatar9.jpg", bio: "Fútbol los viernes", phone: "+34 666 401 233" },
  { key: "fawad", name: "Fawad K.", avatar: "friend-avatar10.jpg", bio: "Sneakerhead 👟", phone: "+44 7700 900 123" },
];

/** Crea los datos de demostración. Devuelve false si ya había usuarios y no se pidió reset. */
async function seed({ reset = false } = {}) {
  if (reset) await clear();
  else if (!(await isEmpty())) return false;

  const u = {};
  for (const [i, p] of people.entries()) {
    u[p.key] = await User.create({ name: p.name, username: p.key, email: `${p.key}@yabla.app`, password: PASSWORD, avatar: AV + p.avatar, bio: p.bio, phone: p.phone });
    // Última conexión variada para que se vea "últ. vez hace…"
    await User.touchLastSeen(u[p.key].id, Date.now() - (i + 1) * 17 * 60 * 1000);
  }

  const direct = async (a, b) => (await Conversation.getOrCreateDirect(a.id, b.id)).id;

  // Alex ↔ Karla
  let c = await direct(u.alex, u.karla);
  await say(c, u.karla, at(1, "22:24"), "Hola, ¿cómo estás? 😀 Encontré un postre delicioso para ti. Te está esperando en casa.");
  await say(c, u.karla, at(1, "22:25"), { type: "image", mediaUrl: AV + "avatar-female-5.jpg", body: "Mira esta foto tuya antigua" });
  const reply = await say(c, u.alex, at(1, "22:30"), "¡Jajaja no puede ser! Gracias 💙");
  await Message.react(reply.id, u.karla.id, "❤️");
  await say(c, u.alex, at(0, "09:12"), "Hoy estoy muy ocupado en la oficina, ¿nos vemos mañana?");
  await say(c, u.karla, at(0, "09:20"), "¡No hay problema! Te mando una canción para el día 🎶");
  await say(c, u.karla, at(0, "09:21"), {
    type: "audio",
    mediaUrl: "https://cdn.plyr.io/static/demo/Kishi_Bashi_-_It_All_Began_With_a_Burst.mp3",
    meta: { duration: 192, name: "cancion.mp3" },
  });
  await say(c, u.karla, at(0, "09:21"), { type: "sticker", mediaUrl: "/assets/images/stickers/sticker12.gif" });
  // Pago en colones
  const { send: sendMoney } = require("../models/Transaction");
  const crcId = await sendMoney(u.karla.id, u.alex.id, 850000, "Almuerzo 🍽️", { currency: "CRC", createdAt: at(0, "09:30") });
  await say(c, u.karla, at(0, "09:30"), { type: "payment", body: "Almuerzo 🍽️", meta: { amountCents: 850000, currency: "CRC", transactionId: crcId, toUserId: u.alex.id } });
  await readUpTo(c, u.alex);
  await readUpTo(c, u.karla);

  // Alex ↔ Bucky (3 sin leer)
  c = await direct(u.alex, u.bucky);
  await say(c, u.bucky, at(0, "14:40"), "¡Hola! ¿Cómo estás hoy?");
  await say(c, u.bucky, at(0, "14:43"), "¿Te apuntas al cine esta noche? 🍿");
  await say(c, u.bucky, at(0, "14:45"), "Hay estreno de Marvel 😎");
  await readUpTo(c, u.alex, 3);
  await readUpTo(c, u.bucky);

  // Alex ↔ Susan
  c = await direct(u.alex, u.susan);
  await say(c, u.alex, at(0, "12:10"), "¡Hola Susan! ¿Te llegó el archivo?");
  await say(c, u.susan, at(0, "12:22"), "Sí, ya lo revisé, ¡está genial! 🙌");
  await readUpTo(c, u.alex, 1);
  await readUpTo(c, u.susan);

  // Alex ↔ Alan (con llamada registrada)
  c = await direct(u.alex, u.alan);
  await say(c, u.alan, at(0, "13:05"), "Tenemos una reunión a las 4 📅");
  await say(c, u.alex, at(0, "13:06"), "Perfecto, ahí estaré");
  await say(c, u.alan, at(0, "13:40"), { type: "call", meta: { callType: "video", status: "completed", duration: 754 } });
  await readUpTo(c, u.alex);
  await readUpTo(c, u.alan);

  // Alex ↔ Lucie (con pago real de la billetera)
  c = await direct(u.alex, u.lucie);
  await say(c, u.alex, at(2, "15:40"), "¿Me devuelves lo del viernes? 😅");
  await say(c, u.lucie, at(2, "15:43"), "¿Mi dinero? 💰 Jajaja te lo paso ahora");
  const { send } = require("../models/Transaction");
  const transactionId = await send(u.lucie.id, u.alex.id, 2500, "Cena del viernes 🍕", { createdAt: at(2, "15:45") });
  await say(c, u.lucie, at(2, "15:45"), { type: "payment", body: "Cena del viernes 🍕", meta: { amountCents: 2500, currency: "USD", transactionId, toUserId: u.alex.id } });
  await readUpTo(c, u.alex);
  await readUpTo(c, u.lucie);

  // Más chats individuales
  const more = [
    [u.lucy, 3, [["them", "10:00", "Curso básico de alemán: empezamos el lunes 🇩🇪"], ["me", "10:15", "Danke! 😄"]]],
    [u.sarah, 3, [["me", "18:20", "¿Quedamos para las fotos?"], ["them", "18:31", "Ok, nos vemos mañana"]]],
    [u.diego, 1, [["them", "13:05", "¿Partido el viernes? ⚽"]]],
    [u.fawad, 1, [["me", "15:40", "Mira mis zapatillas nuevas"], ["them", "15:43", "¿Dónde conseguiste esas? 😍"]]],
  ];
  for (const [friend, days, lines] of more) {
    const id = await direct(u.alex, friend);
    for (const [who, time, text] of lines) await say(id, who === "me" ? u.alex : friend, at(days, time), text);
    await readUpTo(id, u.alex);
    await readUpTo(id, friend);
  }

  // Grupos
  const chicos = await Conversation.createGroup({ name: "Diversión de chicos", avatar: AV + "friend-avatar11.jpg", createdBy: u.bucky.id, memberIds: [u.alex.id, u.alan.id, u.diego.id, u.fawad.id] });
  await say(chicos, u.bucky, at(1, "20:00"), { type: "system", meta: { action: "created", name: "Diversión de chicos" } });
  await say(chicos, u.bucky, at(0, "02:30"), "¡Hola amigos! ¿Cómo están hoy?");
  await say(chicos, u.diego, at(0, "02:32"), "Con sueño 😴");
  await say(chicos, u.fawad, at(0, "02:34"), { type: "sticker", mediaUrl: "/assets/images/stickers/sticker3.gif" });
  for (const m of [u.bucky, u.diego, u.fawad, u.alan]) await readUpTo(chicos, m);
  await readUpTo(chicos, u.alex, 3);

  const pelis = await Conversation.createGroup({ name: "Mundo de películas", avatar: AV + "friend-avatar5.jpg", createdBy: u.alex.id, memberIds: [u.karla.id, u.susan.id, u.sarah.id] });
  await say(pelis, u.alex, at(2, "19:00"), { type: "system", meta: { action: "created", name: "Mundo de películas" } });
  await say(pelis, u.susan, at(1, "00:20"), "¿Qué vemos el sábado?");
  await say(pelis, u.karla, at(1, "00:25"), "¡Algo de terror! 👻");
  await say(pelis, u.sarah, at(1, "00:30"), "Vamos a ver Dune 🏜️");
  for (const m of [u.alex, u.karla, u.susan, u.sarah]) await readUpTo(pelis, m);

  // Estados (24 h)
  const stories = [
    [u.karla, "/assets/images/stories/story1.jpg", "Día de playa 🌊", 3],
    [u.karla, "/assets/images/stories/story4.gif", null, 2.5],
    [u.susan, "/assets/images/stories/story2.jpg", "Nuevo proyecto 🎨", 8],
    [u.bucky, "/assets/images/stories/story3.jpg", null, 12],
    [u.sarah, "/assets/images/stories/story2.jpg", "Sesión de fotos 📷", 20],
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
      created.forEach((p) => console.log(`  · ${p.name.padEnd(14)} ${p.key}@yabla.app`));
    }
    db.close();
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
