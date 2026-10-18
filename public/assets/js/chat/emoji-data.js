// Emojis por categoría, como en WhatsApp. Solo emojis hasta la versión 12 (2019):
// los más nuevos se ven como cuadrados vacíos en Windows 10. Sin banderas, porque
// Windows no las dibuja (muestra las letras del país).
const list = (s) => s.trim().split(/\s+/);

export const CATEGORIES = [
  {
    id: "smileys",
    label: "Caras y emociones",
    icon: "😀",
    emojis: list(`
      😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 ☺️ 😚 😙 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶
      😏 😒 🙄 😬 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 🤯 🤠 🥳 😎 🤓 🧐 😕 😟 🙁 ☹️ 😮 😯 😲 😳 🥺 😦 😧
      😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 ☠️ 💩 🤡 👹 👺 👻 👽 👾 🤖 😺 😸 😹 😻 😼 😽 🙀
      😿 😾 🙈 🙉 🙊 💋 💌 💘 💝 💖 💗 💓 💞 💕 💟 ❣️ 💔 ❤️ 🧡 💛 💚 💙 💜 🤎 🖤 🤍 💯 💢 💥 💫 💦 💨 💣 💬 💭 💤
    `),
  },
  {
    id: "people",
    label: "Gestos y personas",
    icon: "👋",
    emojis: list(`
      👋 🤚 🖐️ ✋ 🖖 👌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦿
      🦵 🦶 👂 🦻 👃 🧠 🦷 🦴 👀 👁️ 👅 👄 👶 🧒 👦 👧 🧑 👱 👨 🧔 👩 🧓 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🧏 🙇 🤦 🤷 👮 🕵️
      💂 👷 🤴 👸 👳 👲 🧕 🤵 👰 🤰 🤱 👼 🎅 🤶 🦸 🦹 🧙 🧚 🧛 🧜 🧝 🧞 🧟 💆 💇 🚶 🧍 🧎 🏃 💃 🕺 👯 🧖 🧗 🤺 🏇
      ⛷️ 🏂 🏌️ 🏄 🚣 🏊 ⛹️ 🏋️ 🚴 🚵 🤸 🤼 🤽 🤾 🤹 🧘 👭 👫 👬 💏 💑 👪 🗣️ 👤 👥 👣
    `),
  },
  {
    id: "nature",
    label: "Animales y naturaleza",
    icon: "🐶",
    emojis: list(`
      🐵 🐒 🦍 🦧 🐶 🐕 🦮 🐩 🐺 🦊 🦝 🐱 🐈 🦁 🐯 🐅 🐆 🐴 🐎 🦄 🦓 🦌 🐮 🐂 🐃 🐄 🐷 🐖 🐗 🐽 🐏 🐑 🐐 🐪 🐫 🦙
      🦒 🐘 🦏 🦛 🐭 🐁 🐀 🐹 🐰 🐇 🐿️ 🦔 🦇 🐻 🐨 🐼 🦥 🦦 🦨 🦘 🦡 🐾 🦃 🐔 🐓 🐣 🐤 🐥 🐦 🐧 🕊️ 🦅 🦆 🦢 🦉 🦩
      🦚 🦜 🐸 🐊 🐢 🦎 🐍 🐲 🐉 🦕 🦖 🐳 🐋 🐬 🐟 🐠 🐡 🦈 🐙 🐚 🐌 🦋 🐛 🐜 🐝 🐞 🦗 🕷️ 🕸️ 🦂 🦟 🦠 💐 🌸 💮 🏵️
      🌹 🥀 🌺 🌻 🌼 🌷 🌱 🌲 🌳 🌴 🌵 🌾 🌿 ☘️ 🍀 🍁 🍂 🍃 🌍 🌎 🌏 🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘 🌙 🌚 🌛 🌜 ☀️ 🌝 🌞
      ⭐ 🌟 🌠 ☁️ ⛅ ⛈️ 🌤️ 🌥️ 🌦️ 🌧️ 🌨️ 🌩️ 🌪️ 🌫️ 🌬️ 🌈 ☂️ ☔ ⚡ ❄️ ☃️ ⛄ ☄️ 🔥 💧 🌊
    `),
  },
  {
    id: "food",
    label: "Comida y bebida",
    icon: "🍔",
    emojis: list(`
      🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🌽 🥕 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚
      🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🥪 🥙 🧆 🌮 🌯 🥗 🥘 🥫 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🦪 🍤 🍙 🍚 🍘 🍥 🥠 🥮 🍢
      🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 🍯 🥛 🍼 ☕ 🍵 🧃 🥤 🍶 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🧉 🍾 🧊 🥄
      🍴 🍽️ 🥣 🥡 🥢 🧂
    `),
  },
  {
    id: "activities",
    label: "Actividades",
    icon: "⚽",
    emojis: list(`
      ⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🏓 🏸 🏒 🏑 🥍 🏏 🥅 ⛳ 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛷 ⛸️ 🥌 🎿 🎯 🎮 🕹️ 🎰 🎲 🧩 🧸
      ♠️ ♥️ ♦️ ♣️ ♟️ 🃏 🀄 🎴 🎭 🖼️ 🎨 🧵 🧶 🎗️ 🎟️ 🎫 🎖️ 🏆 🏅 🥇 🥈 🥉 🎪 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🎻 🎬 🎉 🎊 🎈
      🎁 🎀 🎃 🎄 🎆 🎇 🧨 ✨ 🎋 🎍 🎎 🎏 🎐 🎑 🧧
    `),
  },
  {
    id: "travel",
    label: "Viajes y lugares",
    icon: "🚗",
    emojis: list(`
      🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🚚 🚛 🚜 🦯 🦽 🦼 🛴 🚲 🛵 🏍️ 🛺 🚨 🚔 🚍 🚘 🚖 🚡 🚠 🚟 🚃 🚋 🚞 🚝 🚄 🚅 🚈
      🚂 🚆 🚇 🚊 🚉 ✈️ 🛫 🛬 🛩️ 💺 🛰️ 🚀 🛸 🚁 🛶 ⛵ 🚤 🛥️ 🛳️ ⛴️ 🚢 ⚓ ⛽ 🚧 🚦 🚥 🚏 🗺️ 🗿 🗽 🗼 🏰 🏯 🏟️ 🎡 🎢
      🎠 ⛲ ⛱️ 🏖️ 🏝️ 🏜️ 🌋 ⛰️ 🏔️ 🗻 🏕️ ⛺ 🏠 🏡 🏘️ 🏚️ 🏗️ 🏭 🏢 🏬 🏣 🏤 🏥 🏦 🏨 🏪 🏫 🏩 💒 🏛️ ⛪ 🕌 🕍 🛕 🕋 ⛩️
      🗾 🏞️ 🌅 🌄 🌇 🌆 🏙️ 🌃 🌌 🌉 🌁
    `),
  },
  {
    id: "objects",
    label: "Objetos",
    icon: "💡",
    emojis: list(`
      ⌚ 📱 📲 💻 ⌨️ 🖥️ 🖨️ 🖱️ 🖲️ 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📽️ 🎞️ 📞 ☎️ 📟 📠 📺 📻 🎙️ 🎚️ 🎛️ 🧭 ⏱️ ⏲️ ⏰ 🕰️ ⌛ ⏳
      📡 🔋 🔌 💡 🔦 🕯️ 🧯 🛢️ 💸 💵 💴 💶 💷 💰 💳 💎 ⚖️ 🧰 🔧 🔨 ⚒️ 🛠️ ⛏️ 🔩 ⚙️ 🧱 ⛓️ 🧲 🔫 🔪 🗡️ ⚔️ 🛡️ 🚬 ⚰️ ⚱️
      🏺 🔮 📿 🧿 💈 ⚗️ 🔭 🔬 🕳️ 🩹 🩺 💊 💉 🩸 🧬 🧫 🧪 🌡️ 🧹 🧺 🧻 🚽 🚰 🚿 🛁 🛀 🧼 🧽 🧴 🛎️ 🔑 🗝️ 🚪 🛋️ 🛏️ 🛌
      🛍️ 🛒 🏮 ✉️ 📩 📨 📧 📥 📤 📦 🏷️ 📪 📫 📬 📭 📮 📯 📜 📃 📄 📑 🧾 📊 📈 📉 🗒️ 🗓️ 📆 📅 🗑️ 📇 🗃️ 🗳️ 🗄️ 📋 📁
      📂 🗂️ 🗞️ 📰 📓 📔 📒 📕 📗 📘 📙 📚 📖 🔖 🧷 🔗 📎 🖇️ 📐 📏 🧮 📌 📍 ✂️ 🖊️ 🖋️ ✒️ 🖌️ 🖍️ 📝 ✏️ 🔍 🔎 🔏 🔐 🔒
      🔓
    `),
  },
  {
    id: "symbols",
    label: "Símbolos",
    icon: "❤️",
    emojis: list(`
      ☮️ ✝️ ☪️ 🕉️ ☸️ ✡️ 🔯 🕎 ☯️ ☦️ 🛐 ⛎ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ 🆔 ⚛️ ☢️ ☣️ 📴 📳 ✴️ 🆚 🅰️ 🅱️ 🆎 🆑
      🅾️ 🆘 ❌ ⭕ 🛑 ⛔ 📛 🚫 ♨️ 🚷 🚯 🚳 🚱 🔞 📵 🚭 ❗ ❕ ❓ ❔ ‼️ ⁉️ 🔅 🔆 〽️ ⚠️ 🚸 🔱 ⚜️ 🔰 ♻️ ✅ 💹 ❇️ ✳️ ❎
      🌐 💠 Ⓜ️ 🌀 🏧 🚾 ♿ 🅿️ 🛂 🛃 🛄 🛅 🚹 🚺 🚼 🚻 🚮 🎦 📶 🔣 ℹ️ 🔤 🔡 🔠 🆖 🆗 🆙 🆒 🆕 🆓 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣
      6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟 🔢 #️⃣ *️⃣ ▶️ ⏸️ ⏯️ ⏹️ ⏺️ ⏭️ ⏮️ ⏩ ⏪ ⏫ ⏬ ◀️ 🔼 🔽 ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↕️ ↔️ ↪️ ↩️ ⤴️ ⤵️
      🔀 🔁 🔂 🔄 🔃 🎵 🎶 ➕ ➖ ➗ ✖️ ♾️ 💲 💱 ™️ ©️ ®️ 〰️ ➰ ➿ 🔚 🔙 🔛 🔝 🔜 ✔️ ☑️ 🔘 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤
      🔺 🔻 🔸 🔹 🔶 🔷 🔳 🔲 ▪️ ▫️ ◾ ◽ ◼️ ◻️ 🟥 🟧 🟨 🟩 🟦 🟪 ⬛ ⬜ 🟫 🔈 🔇 🔉 🔊 🔔 🔕 📣 📢
    `),
  },
];

// Palabras clave en español para el buscador (las más buscadas).
const KEYWORDS = {
  "😀": "sonrisa feliz cara contento", "😃": "sonrisa feliz alegre", "😄": "sonrisa feliz ojos", "😁": "sonrisa dientes feliz",
  "😆": "risa carcajada", "😅": "risa sudor nervios", "🤣": "risa carcajada suelo jaja", "😂": "risa llorar lagrimas jaja",
  "🙂": "sonrisa leve", "🙃": "al reves ironia", "😉": "guiño complice", "😊": "sonrojado feliz timido", "😇": "angel inocente aureola",
  "🥰": "enamorado corazones amor", "😍": "enamorado ojos corazon amor", "🤩": "estrellas asombro wow", "😘": "beso amor",
  "😋": "rico delicioso comida", "😛": "lengua broma", "😜": "guiño lengua loco", "🤪": "loco chiflado", "🤑": "dinero rico",
  "🤗": "abrazo", "🤭": "risita tapar boca", "🤫": "silencio secreto shh", "🤔": "pensar duda hmm", "🤐": "callado cremallera",
  "🤨": "sospecha ceja", "😐": "neutral serio", "😑": "sin expresion", "😶": "sin boca mudo", "😏": "picaro sonrisa ladeada",
  "😒": "aburrido molesto", "🙄": "ojos en blanco fastidio", "😬": "mueca incomodo", "😌": "aliviado tranquilo", "😔": "triste pensativo",
  "😪": "sueño", "🤤": "babeando antojo", "😴": "dormir sueño zzz", "😷": "mascarilla enfermo", "🤒": "fiebre enfermo",
  "🤕": "herido venda", "🤢": "nauseas asco", "🤮": "vomitar asco", "🤧": "estornudo resfriado", "🥵": "calor caliente",
  "🥶": "frio congelado", "🥴": "mareado borracho", "😵": "mareado", "🤯": "explota cabeza mente", "🤠": "vaquero",
  "🥳": "fiesta cumpleaños celebrar", "😎": "gafas genial cool", "🤓": "nerd empollon", "🧐": "monoculo examinar", "😕": "confundido",
  "😟": "preocupado", "🙁": "triste", "😮": "sorpresa boca abierta", "😲": "asombrado", "😳": "sonrojado avergonzado",
  "🥺": "suplicar por favor ojitos", "😨": "miedo", "😰": "ansiedad sudor", "😥": "decepcionado", "😢": "llorar triste lagrima",
  "😭": "llorar mucho triste", "😱": "grito miedo terror", "😩": "cansado agotado", "😫": "harto cansado", "🥱": "bostezo aburrido sueño",
  "😤": "enfadado resoplar", "😡": "enfadado furioso rojo", "😠": "enojado", "🤬": "insultos furioso", "😈": "diablo travieso",
  "💀": "calavera muerto", "💩": "caca", "🤡": "payaso", "👻": "fantasma", "👽": "extraterrestre alien", "🤖": "robot",
  "🙈": "mono no ver", "🙉": "mono no oir", "🙊": "mono no hablar", "💋": "beso labios", "❤️": "corazon rojo amor",
  "🧡": "corazon naranja", "💛": "corazon amarillo", "💚": "corazon verde", "💙": "corazon azul", "💜": "corazon morado",
  "🖤": "corazon negro", "🤍": "corazon blanco", "💔": "corazon roto", "💕": "corazones amor", "💖": "corazon brillante",
  "💯": "cien perfecto", "💥": "explosion", "💤": "dormir zzz", "👋": "hola adios saludo mano", "👌": "ok perfecto",
  "✌️": "paz victoria", "🤞": "dedos cruzados suerte", "🤟": "te quiero", "🤘": "rock cuernos", "🤙": "llamame",
  "👍": "pulgar arriba bien si like", "👎": "pulgar abajo mal no", "✊": "puño", "👊": "puñetazo choque", "👏": "aplausos bravo",
  "🙌": "celebrar manos arriba", "🤝": "apreton manos trato acuerdo", "🙏": "gracias por favor rezar", "💪": "fuerza musculo gym",
  "👀": "ojos mirar", "🧠": "cerebro", "💃": "bailar bailarina", "🕺": "bailar", "🐶": "perro", "🐱": "gato", "🦁": "leon",
  "🐼": "panda", "🦄": "unicornio", "🐻": "oso", "🐷": "cerdo", "🐸": "rana", "🐵": "mono", "🐔": "gallina", "🦋": "mariposa",
  "🌸": "flor cerezo", "🌹": "rosa flor", "🌻": "girasol", "🌈": "arcoiris", "☀️": "sol", "🌙": "luna noche", "⭐": "estrella",
  "🔥": "fuego", "❄️": "nieve frio", "🌊": "ola mar playa", "⚡": "rayo", "🍕": "pizza", "🍔": "hamburguesa", "🍟": "papas fritas",
  "🌮": "taco", "🍣": "sushi", "🍦": "helado", "🎂": "pastel tarta cumpleaños", "🍰": "pastel", "🍫": "chocolate", "🍿": "palomitas cine",
  "🍩": "dona rosquilla", "☕": "cafe", "🍺": "cerveza", "🍻": "brindis cervezas", "🥂": "brindis champan", "🍷": "vino",
  "🍎": "manzana", "🍌": "platano banana", "🍓": "fresa", "🥑": "aguacate", "⚽": "futbol balon", "🏀": "baloncesto", "🎮": "videojuego",
  "🎉": "fiesta confeti celebrar", "🎊": "fiesta", "🎈": "globo", "🎁": "regalo", "🏆": "trofeo ganador", "🥇": "medalla oro primero",
  "🎵": "musica nota", "🎶": "musica notas", "🎤": "microfono cantar", "🎧": "auriculares musica", "🎄": "navidad arbol",
  "🎃": "halloween calabaza", "✨": "brillos magia", "🚗": "coche auto", "✈️": "avion viaje", "🚀": "cohete", "🏠": "casa hogar",
  "🏖️": "playa vacaciones", "💡": "idea bombilla", "📱": "movil telefono", "💻": "portatil ordenador", "📷": "camara foto",
  "💰": "dinero bolsa", "💸": "dinero volando gastar", "💳": "tarjeta", "💎": "diamante", "🔑": "llave", "📚": "libros estudiar",
  "✏️": "lapiz escribir", "📌": "chincheta", "✅": "hecho check correcto", "❌": "error no cruz", "❓": "pregunta", "❗": "exclamacion",
  "⚠️": "advertencia peligro", "🔔": "campana notificacion", "🆗": "ok", "🆒": "cool", "🆕": "nuevo",
};

/** Busca emojis por palabra clave (sin tildes ni mayúsculas). */
const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function searchEmojis(query, limit = 80) {
  const q = normalize(query.trim());
  if (!q) return [];
  return Object.entries(KEYWORDS)
    .filter(([, words]) => normalize(words).split(" ").some((w) => w.startsWith(q)))
    .map(([emoji]) => emoji)
    .slice(0, limit);
}
