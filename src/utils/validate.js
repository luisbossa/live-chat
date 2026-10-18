const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Acceso sencillo: basta con 6 caracteres (el indicador de seguridad sugiere mejorarla)
const PASSWORD = /^.{6,72}$/s;
const USERNAME = /^[a-z0-9_.]{3,20}$/i;

const str = (value, max = 500) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** Convierte "1,2,3", ["1","2"] o 3 en una lista de enteros positivos únicos. */
function idList(value) {
  const raw = Array.isArray(value) ? value : String(value ?? "").split(",");
  return [...new Set(raw.map(Number).filter((n) => Number.isInteger(n) && n > 0))];
}

const toId = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const toBool = (value) => value === true || value === "true" || value === 1 || value === "1" || value === "on";

/** "MM-DD" que existe en el calendario (29 de febrero incluido). */
function birthday(value) {
  const m = /^(\d{2})-(\d{2})$/.exec(value || "");
  if (!m) return false;
  const month = Number(m[1]);
  const day = Number(m[2]);
  return month >= 1 && month <= 12 && day >= 1 && day <= new Date(2024, month, 0).getDate();
}

/** Errores de registro por campo (sin correo: solo nombre, usuario y contraseña). */
function registration({ name, password, username }) {
  const errors = {};
  if (name.length < 2) errors.name = "Escribe tu nombre.";
  if (!PASSWORD.test(password)) errors.password = "La contraseña necesita al menos 6 caracteres.";
  if (!USERNAME.test(username)) errors.username = "De 3 a 20 caracteres: letras, números, punto o guion bajo.";
  return errors;
}

module.exports = { EMAIL, PASSWORD, USERNAME, str, idList, toId, toBool, registration, birthday };
