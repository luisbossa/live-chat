const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{6,72}$/;
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

/** Errores de registro por campo. */
function registration({ name, email, password, username }) {
  const errors = {};
  if (name.length < 2) errors.name = "Ingresa tu nombre.";
  if (!EMAIL.test(email)) errors.email = "Ingresa un correo electrónico válido.";
  if (!PASSWORD.test(password)) errors.password = "Mínimo 6 caracteres, con al menos una letra y un número.";
  if (!USERNAME.test(username)) errors.username = "De 3 a 20 caracteres: letras, números, punto o guion bajo.";
  return errors;
}

module.exports = { EMAIL, PASSWORD, USERNAME, str, idList, toId, toBool, registration };
