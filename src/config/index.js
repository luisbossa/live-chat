require("dotenv").config();
const path = require("path");

const root = path.resolve(__dirname, "../..");
const resolve = (p) => path.resolve(root, p);

function parseIceServers(raw) {
  try {
    const servers = JSON.parse(raw);
    if (Array.isArray(servers)) return servers;
  } catch {
    /* se usa el valor por defecto */
  }
  return [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }];
}

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
  throw new Error("Define SESSION_SECRET (mínimo 32 caracteres) en el entorno de producción.");
}

/** URL pública: BASE_URL, o la que asignan Render/Railway automáticamente. */
function publicUrl() {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, "");
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL;
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return `http://localhost:${process.env.PORT || 3000}`;
}

module.exports = {
  root,
  isProduction,
  port: Number(process.env.PORT) || 3000,
  baseUrl: publicUrl(),
  seedDemo: process.env.SEED_DEMO === "true",
  sessionSecret: process.env.SESSION_SECRET || "yabla-dev-secret",
  databasePath: resolve(process.env.DATABASE_PATH || "./data/yabla.db"),
  uploadsDir: resolve(process.env.UPLOADS_DIR || "./data/uploads"),
  iceServers: parseIceServers(process.env.ICE_SERVERS),
  sessionMaxAge: 1000 * 60 * 60 * 24 * 30, // 30 días
  storyTtl: 1000 * 60 * 60 * 24, // 24 horas
  uploadLimit: 25 * 1024 * 1024, // 25 MB
  initialBalanceCents: 50000, // $500 de saldo de demostración
};
