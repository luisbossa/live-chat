// Datos de ejemplo del dashboard. En una app real vendrían de una API.
const AV = "/assets/images/avatars/";

const DATA = {
  contacts: [
    {
      id: "karla",
      name: "Karla Castro",
      avatar: AV + "avatar-female-1.jpg",
      online: true,
      phone: "+971 58 223 5010",
      bio: "Amante del café y los viajes ☕✈️",
      messages: [
        { date: "Ayer" },
        { from: "them", text: "Hola, ¿cómo estás? 😀 Encontré un postre delicioso para ti. Te está esperando en casa.", time: "22:24" },
        { from: "them", type: "image", src: AV + "avatar-female-5.jpg", text: "Mira esta foto tuya antigua", time: "22:25" },
        { from: "me", text: "¡Jajaja no puede ser! Gracias 💙", time: "22:30" },
        { date: "Hoy" },
        { from: "me", text: "Hoy estoy muy ocupada en la oficina, ¿nos vemos mañana?", time: "09:12" },
        { from: "them", text: "¡No hay problema! Te mando una canción para el día 🎶", time: "09:20" },
        { from: "them", type: "audio", src: "https://cdn.plyr.io/static/demo/Kishi_Bashi_-_It_All_Began_With_a_Burst.mp3", duration: "3:12", time: "09:21" },
        { from: "them", type: "sticker", src: "/assets/images/stickers/sticker12.gif", time: "09:21" },
      ],
    },
    {
      id: "bucky",
      name: "Bucky Barnes",
      avatar: AV + "friend-avatar.jpg",
      online: true,
      unread: 3,
      phone: "+34 611 220 118",
      bio: "Siempre listo para un partido ⚽",
      messages: [
        { date: "Hoy" },
        { from: "them", text: "¡Hola amigos! ¿Cómo están hoy?", time: "14:40" },
        { from: "them", text: "¿Alguien se apunta al cine esta noche? 🍿", time: "14:43" },
        { from: "them", text: "Hay estreno de Marvel 😎", time: "14:45" },
      ],
    },
    {
      id: "susan",
      name: "Susan Miller",
      avatar: AV + "friend-avatar2.jpg",
      online: false,
      lastSeen: "hace 20 min",
      unread: 1,
      phone: "+34 622 918 007",
      bio: "Diseñadora UX 🎨",
      messages: [
        { date: "Hoy" },
        { from: "me", text: "¡Hola Susan! ¿Te llegó el archivo?", time: "12:10" },
        { from: "them", text: "Hola, este es mi nuevo número 📱 Sí, ya lo revisé, ¡está genial!", time: "12:22" },
      ],
    },
    {
      id: "alan",
      name: "Alan Bernaby",
      avatar: AV + "friend-avatar3.jpg",
      online: true,
      phone: "+34 633 004 551",
      bio: "Product manager",
      messages: [
        { date: "Hoy" },
        { from: "them", text: "Tenemos una reunión a las 4 📅", time: "13:05" },
        { from: "me", text: "Perfecto, ahí estaré", time: "13:06" },
      ],
    },
    {
      id: "lucie",
      name: "Lucie Logan",
      avatar: AV + "friend-avatar4.jpg",
      online: false,
      lastSeen: "hace 2 h",
      phone: "+34 644 778 210",
      bio: "🌱 Vida sana",
      messages: [
        { date: "Hoy" },
        { from: "me", text: "¿Me devuelves lo del viernes? 😅", time: "15:40" },
        { from: "them", text: "¿Mi dinero? 💰 Jajaja mañana te lo paso", time: "15:43" },
      ],
    },
    {
      id: "lucy",
      name: "Lucy Will",
      avatar: AV + "friend-avatar7.jpg",
      online: false,
      lastSeen: "hace 2 días",
      phone: "+49 151 2233 4455",
      bio: "Profesora de idiomas",
      messages: [
        { date: "Hace 2 días" },
        { from: "them", text: "Curso básico de alemán: empezamos el lunes 🇩🇪", time: "10:00" },
        { from: "me", text: "Danke! 😄", time: "10:15" },
      ],
    },
    {
      id: "sarah",
      name: "Sarah K",
      avatar: AV + "friend-avatar8.jpg",
      online: true,
      phone: "+34 655 312 900",
      bio: "Fotógrafa 📷",
      messages: [
        { date: "Hace 2 días" },
        { from: "me", text: "¿Quedamos para las fotos?", time: "18:20" },
        { from: "them", text: "Ok, nos vemos mañana", time: "18:31" },
      ],
    },
    {
      id: "diego",
      name: "Diego Torres",
      avatar: AV + "friend-avatar9.jpg",
      online: false,
      lastSeen: "ayer",
      phone: "+34 666 401 233",
      bio: "Fútbol los viernes",
      messages: [
        { date: "Ayer" },
        { from: "them", text: "¿Partido el viernes?", time: "13:05" },
      ],
    },
    {
      id: "fawad",
      name: "Fawad K.",
      avatar: AV + "friend-avatar10.jpg",
      online: false,
      lastSeen: "ayer",
      phone: "+44 7700 900 123",
      bio: "Sneakerhead 👟",
      messages: [
        { date: "Ayer" },
        { from: "me", text: "Mira mis zapatillas nuevas", time: "15:40" },
        { from: "them", text: "¿Dónde conseguiste esas? 😍", time: "15:43" },
      ],
    },
  ],

  groups: [
    {
      id: "g-chicos",
      name: "Diversión de chicos",
      avatar: AV + "friend-avatar11.jpg",
      members: ["bucky", "alan", "diego", "fawad"],
      unread: 3,
      messages: [
        { date: "Hoy" },
        { from: "bucky", text: "¡Hola amigos! ¿Cómo están hoy?", time: "02:30" },
        { from: "diego", text: "Con sueño 😴", time: "02:32" },
        { from: "fawad", type: "sticker", src: "/assets/images/stickers/sticker3.gif", time: "02:34" },
      ],
    },
    {
      id: "g-pelis",
      name: "Mundo de películas",
      avatar: AV + "friend-avatar5.jpg",
      members: ["karla", "susan", "sarah"],
      unread: 3,
      messages: [
        { date: "Hoy" },
        { from: "susan", text: "¿Qué vemos el sábado?", time: "00:20" },
        { from: "karla", text: "¡Algo de terror! 👻", time: "00:25" },
        { from: "sarah", text: "Vamos chicos a ver Dune 🏜️", time: "00:30" },
      ],
    },
    {
      id: "g-primos",
      name: "Hobbies de primos",
      avatar: AV + "friend-avatar6.jpg",
      members: ["lucie", "lucy"],
      messages: [
        { date: "Ayer" },
        { from: "lucy", text: "Hola, quiero verlos a todos en la reunión familiar", time: "00:30" },
      ],
    },
    {
      id: "g-familia",
      name: "Mi familia",
      avatar: AV + "avatar-female-2.jpg",
      members: ["karla", "lucie"],
      messages: [
        { date: "Ayer" },
        { from: "lucie", text: "Hey, ¿dónde estás ahora?", time: "00:30" },
      ],
    },
    {
      id: "g-ciencia",
      name: "Grupo de ciencia",
      avatar: AV + "friend-avatar13.jpg",
      members: ["alan", "sarah", "susan"],
      messages: [
        { date: "Hace 3 días" },
        { from: "alan", text: "La última fórmula del círculo mundial 🔬", time: "00:30" },
      ],
    },
  ],

  stories: [
    { id: "s1", name: "Emily Kate", avatar: AV + "avatar-female-2.jpg", time: "hace 21 h", items: ["/assets/images/stories/story1.jpg", "/assets/images/stories/story4.gif"] },
    { id: "s2", name: "Dasha Daniel", avatar: AV + "friend-avatar14.jpg", time: "hace 22 h", items: ["/assets/images/stories/story2.jpg"] },
    { id: "s3", name: "Jawan King", avatar: AV + "friend-avatar13.jpg", time: "hace 1 día", items: ["/assets/images/stories/story3.jpg", "/assets/images/stories/story1.jpg"] },
    { id: "s4", name: "Mikal", avatar: AV + "friend-avatar10.jpg", time: "hace 2 días", items: ["/assets/images/stories/story4.gif"] },
    { id: "s5", name: "Frank Bob", avatar: AV + "friend-avatar3.jpg", time: "hace 3 días", items: ["/assets/images/stories/story2.jpg", "/assets/images/stories/story3.jpg"] },
  ],

  // Respuestas automáticas para simular una conversación
  replies: [
    "¡Jaja, totalmente! 😂",
    "Me parece perfecto 👍",
    "¿En serio? Cuéntame más 👀",
    "Ahora no puedo, te escribo luego 🙏",
    "¡Qué buena noticia! 🎉",
    "Mmm déjame pensarlo 🤔",
    "Dale, hablamos ✌️",
    "😍😍😍",
  ],

  emojis: "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 😉 😍 🥰 😘 😋 😛 😜 🤪 😎 🤩 🥳 😏 😒 😔 😢 😭 😤 😡 🤯 😳 🥺 😱 🤔 🤫 🙄 😴 🤤 😷 🤗 👍 👎 👏 🙌 🙏 💪 👋 ✌️ 🤞 👌 ❤️ 🧡 💛 💚 💙 💜 🖤 💔 ✨ 🔥 🎉 🎶 ☕ 🍕 🍿 ⚽ 🎮 📷 ✈️ 🌙".split(" "),

  stickers: Array.from({ length: 35 }, (_, i) => `/assets/images/stickers/sticker${i + 1}.gif`),

  wallet: {
    balance: "$304.06",
    activity: [
      { title: "Transferencia a Karla", amount: "-$25.00", time: "Hoy, 10:24" },
      { title: "Pago recibido de Alan", amount: "+$120.00", time: "Ayer, 18:02" },
      { title: "Recarga de saldo", amount: "+$50.00", time: "12 oct, 09:15" },
    ],
  },
};
