// Datos de demostración.  npm run seed  ·  npm run db:reset (borra todo y vuelve a sembrar)
const db = require("../config/database");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Story = require("../models/Story");

const PASSWORD = "demo1234";
const AV = "/assets/images/avatars/";

const reset = process.argv.includes("--reset");
const hasUsers = db.prepare("SELECT COUNT(*) AS n FROM users").get().n > 0;

if (hasUsers && !reset) {
  console.log("La base de datos ya tiene usuarios. Usa `npm run db:reset` para borrarla y volver a sembrar.");
  process.exit(0);
}

if (reset) {
  const tables = ["reactions", "story_views", "stories", "transactions", "blocks", "messages", "conversation_members", "conversations", "sessions", "users"];
  db.transaction(() => {
    tables.forEach((t) => db.prepare(`DELETE FROM ${t}`).run());
    db.prepare("DELETE FROM sqlite_sequence").run();
  })();
  console.log("Base de datos vaciada.");
}

// Fecha relativa: hace `days` días a la hora indicada
function at(days, time) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

const setDate = db.prepare("UPDATE messages SET created_at = ? WHERE id = ?");

function say(conversationId, sender, when, data) {
  const message = Message.create({ conversationId, senderId: sender.id, ...(typeof data === "string" ? { body: data } : data) });
  setDate.run(when, message.id);
  return message;
}

/** Marca todo como leído excepto los últimos `unread` mensajes que recibió `user`. */
function readUpTo(conversationId, user, unread = 0) {
  const ids = db
    .prepare("SELECT id FROM messages WHERE conversation_id = ? AND (sender_id <> ? OR sender_id IS NULL) ORDER BY id")
    .all(conversationId, user.id)
    .map((r) => r.id);
  const lastId = db.prepare("SELECT MAX(id) AS id FROM messages WHERE conversation_id = ?").get(conversationId).id || 0;
  const readId = unread ? ids[ids.length - unread - 1] || 0 : lastId;
  Conversation.updateReceipts(conversationId, user.id, { delivered: lastId, read: readId });
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

const u = {};
db.transaction(() => {
  people.forEach((p) => {
    u[p.key] = User.create({
      name: p.name,
      username: p.key,
      email: `${p.key}@yabla.app`,
      password: PASSWORD,
      avatar: AV + p.avatar,
      bio: p.bio,
      phone: p.phone,
    });
  });
  // Última conexión variada para que se vea "últ. vez hace…"
  Object.values(u).forEach((user, i) => User.touchLastSeen(user.id, Date.now() - (i + 1) * 17 * 60 * 1000));

  const direct = (a, b) => Conversation.getOrCreateDirect(a.id, b.id).id;

  // Alex ↔ Karla
  let c = direct(u.alex, u.karla);
  say(c, u.karla, at(1, "22:24"), "Hola, ¿cómo estás? 😀 Encontré un postre delicioso para ti. Te está esperando en casa.");
  say(c, u.karla, at(1, "22:25"), { type: "image", mediaUrl: AV + "avatar-female-5.jpg", body: "Mira esta foto tuya antigua" });
  const reply = say(c, u.alex, at(1, "22:30"), "¡Jajaja no puede ser! Gracias 💙");
  db.prepare("INSERT INTO reactions (message_id, user_id, emoji, created_at) VALUES (?, ?, '❤️', ?)").run(reply.id, u.karla.id, Date.now());
  say(c, u.alex, at(0, "09:12"), "Hoy estoy muy ocupado en la oficina, ¿nos vemos mañana?");
  say(c, u.karla, at(0, "09:20"), { body: "¡No hay problema! Te mando una canción para el día 🎶", replyToId: null });
  say(c, u.karla, at(0, "09:21"), {
    type: "audio",
    mediaUrl: "https://cdn.plyr.io/static/demo/Kishi_Bashi_-_It_All_Began_With_a_Burst.mp3",
    meta: { duration: 192, name: "cancion.mp3" },
  });
  say(c, u.karla, at(0, "09:21"), { type: "sticker", mediaUrl: "/assets/images/stickers/sticker12.gif" });
  readUpTo(c, u.alex);
  readUpTo(c, u.karla);

  // Alex ↔ Bucky (3 sin leer)
  c = direct(u.alex, u.bucky);
  say(c, u.bucky, at(0, "14:40"), "¡Hola! ¿Cómo estás hoy?");
  say(c, u.bucky, at(0, "14:43"), "¿Te apuntas al cine esta noche? 🍿");
  say(c, u.bucky, at(0, "14:45"), "Hay estreno de Marvel 😎");
  readUpTo(c, u.alex, 3);
  readUpTo(c, u.bucky);

  // Alex ↔ Susan
  c = direct(u.alex, u.susan);
  say(c, u.alex, at(0, "12:10"), "¡Hola Susan! ¿Te llegó el archivo?");
  say(c, u.susan, at(0, "12:22"), "Sí, ya lo revisé, ¡está genial! 🙌");
  readUpTo(c, u.alex, 1);
  readUpTo(c, u.susan);

  // Alex ↔ Alan (con llamada registrada)
  c = direct(u.alex, u.alan);
  say(c, u.alan, at(0, "13:05"), "Tenemos una reunión a las 4 📅");
  say(c, u.alex, at(0, "13:06"), "Perfecto, ahí estaré");
  say(c, u.alan, at(0, "13:40"), { type: "call", meta: { callType: "video", status: "completed", duration: 754 } });
  readUpTo(c, u.alex);
  readUpTo(c, u.alan);

  // Alex ↔ Lucie (con pago)
  c = direct(u.alex, u.lucie);
  say(c, u.alex, at(2, "15:40"), "¿Me devuelves lo del viernes? 😅");
  say(c, u.lucie, at(2, "15:43"), "¿Mi dinero? 💰 Jajaja te lo paso ahora");
  db.prepare("INSERT INTO transactions (from_user_id, to_user_id, amount_cents, note, created_at) VALUES (?, ?, 2500, 'Cena del viernes 🍕', ?)").run(u.lucie.id, u.alex.id, at(2, "15:45"));
  db.prepare("UPDATE users SET balance_cents = balance_cents + 2500 WHERE id = ?").run(u.alex.id);
  db.prepare("UPDATE users SET balance_cents = balance_cents - 2500 WHERE id = ?").run(u.lucie.id);
  say(c, u.lucie, at(2, "15:45"), { type: "payment", body: "Cena del viernes 🍕", meta: { amountCents: 2500, toUserId: u.alex.id } });
  readUpTo(c, u.alex);
  readUpTo(c, u.lucie);

  // Más chats individuales
  [
    [u.lucy, 3, [["them", "10:00", "Curso básico de alemán: empezamos el lunes 🇩🇪"], ["me", "10:15", "Danke! 😄"]]],
    [u.sarah, 3, [["me", "18:20", "¿Quedamos para las fotos?"], ["them", "18:31", "Ok, nos vemos mañana"]]],
    [u.diego, 1, [["them", "13:05", "¿Partido el viernes? ⚽"]]],
    [u.fawad, 1, [["me", "15:40", "Mira mis zapatillas nuevas"], ["them", "15:43", "¿Dónde conseguiste esas? 😍"]]],
  ].forEach(([friend, days, lines]) => {
    const id = direct(u.alex, friend);
    lines.forEach(([who, time, text]) => say(id, who === "me" ? u.alex : friend, at(days, time), text));
    readUpTo(id, u.alex);
    readUpTo(id, friend);
  });

  // Grupos
  const chicos = Conversation.createGroup({ name: "Diversión de chicos", avatar: AV + "friend-avatar11.jpg", createdBy: u.bucky.id, memberIds: [u.alex.id, u.alan.id, u.diego.id, u.fawad.id] });
  say(chicos, u.bucky, at(1, "20:00"), { type: "system", meta: { action: "created", name: "Diversión de chicos" } });
  say(chicos, u.bucky, at(0, "02:30"), "¡Hola amigos! ¿Cómo están hoy?");
  say(chicos, u.diego, at(0, "02:32"), "Con sueño 😴");
  say(chicos, u.fawad, at(0, "02:34"), { type: "sticker", mediaUrl: "/assets/images/stickers/sticker3.gif" });
  [u.bucky, u.diego, u.fawad, u.alan].forEach((m) => readUpTo(chicos, m));
  readUpTo(chicos, u.alex, 3);

  const pelis = Conversation.createGroup({ name: "Mundo de películas", avatar: AV + "friend-avatar5.jpg", createdBy: u.alex.id, memberIds: [u.karla.id, u.susan.id, u.sarah.id] });
  say(pelis, u.alex, at(2, "19:00"), { type: "system", meta: { action: "created", name: "Mundo de películas" } });
  say(pelis, u.susan, at(1, "00:20"), "¿Qué vemos el sábado?");
  say(pelis, u.karla, at(1, "00:25"), "¡Algo de terror! 👻");
  say(pelis, u.sarah, at(1, "00:30"), "Vamos a ver Dune 🏜️");
  [u.alex, u.karla, u.susan, u.sarah].forEach((m) => readUpTo(pelis, m));

  // Estados (24 h)
  const storyAt = db.prepare("UPDATE stories SET created_at = ?, expires_at = ? WHERE id = ?");
  [
    [u.karla, "/assets/images/stories/story1.jpg", "Día de playa 🌊", 3],
    [u.karla, "/assets/images/stories/story4.gif", null, 2.5],
    [u.susan, "/assets/images/stories/story2.jpg", "Nuevo proyecto 🎨", 8],
    [u.bucky, "/assets/images/stories/story3.jpg", null, 12],
    [u.sarah, "/assets/images/stories/story2.jpg", "Sesión de fotos 📷", 20],
  ].forEach(([user, media, caption, hoursAgo]) => {
    const story = Story.create({ userId: user.id, mediaUrl: media, caption });
    const created = Date.now() - hoursAgo * 3600 * 1000;
    storyAt.run(created, created + 24 * 3600 * 1000, story.id);
  });
})();

console.log(`Usuarios de demostración creados (contraseña: ${PASSWORD}):`);
people.forEach((p) => console.log(`  · ${p.name.padEnd(14)} ${p.key}@yabla.app`));
