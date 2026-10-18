// Cuenta oficial "Yabla": da la bienvenida a cada usuario nuevo, como hacen
// WhatsApp o Telegram, para que la app no esté vacía la primera vez.
const crypto = require("crypto");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const realtime = require("./realtime");

const OFFICIAL_USERNAME = User.OFFICIAL_USERNAME;

async function ensureOfficialAccount() {
  const existing = await User.findByUsername(OFFICIAL_USERNAME);
  if (existing) return existing;
  return User.create({
    name: "Yabla",
    username: OFFICIAL_USERNAME,
    email: "equipo@yabla.app",
    // Contraseña aleatoria: nadie puede iniciar sesión con esta cuenta
    password: crypto.randomBytes(24).toString("hex"),
    avatar: "/assets/images/ui/yabla-official.svg",
    bio: "Cuenta oficial de Yabla. Novedades y consejos ✨",
  });
}

const firstName = (name) => name.split(" ")[0];

/** Chat de bienvenida para un usuario recién registrado. */
async function sendWelcome(user) {
  const official = await ensureOfficialAccount();
  const { id: conversationId } = await Conversation.getOrCreateDirect(official.id, user.id);
  const now = Date.now();
  const say = (data, offset) => Message.create({ conversationId, senderId: official.id, createdAt: now + offset, ...data });

  await say({ body: `¡Hola, ${firstName(user.name)}! 👋 Te damos la bienvenida a Yabla.` }, 0);
  await say(
    {
      body: [
        "Esto es lo que puedes hacer:",
        "💬 Toca el botón de nuevo chat para hablar con alguien",
        "👥 Crea grupos con tus amigos",
        "📹 Haz llamadas y videollamadas gratis",
        "✨ Comparte estados que duran 24 horas",
        "💸 Envía dinero desde la Billetera (tienes $500 de prueba)",
      ].join("\n"),
    },
    1
  );
  await say({ type: "sticker", mediaUrl: "/assets/images/stickers/sticker5.gif" }, 2);
  return conversationId;
}

/** Respuesta automática si alguien escribe a la cuenta oficial. */
function autoReply(conversationId, officialId) {
  setTimeout(async () => {
    try {
      const message = await Message.create({
        conversationId,
        senderId: officialId,
        body: "¡Gracias por escribir! 💙 Esta es una cuenta automática, así que no podemos responder aquí. Invita a tus amigos para empezar a chatear.",
      });
      await realtime.message(message);
    } catch (err) {
      console.error("[bienvenida]", err);
    }
  }, 1200);
}

module.exports = { OFFICIAL_USERNAME, ensureOfficialAccount, sendWelcome, autoReply };
