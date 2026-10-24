// Servidor para desarrollo local (npm run dev). En Vercel la entrada es api/index.js.
const http = require("http");
const config = require("./src/config");
const db = require("./src/config/database");
const app = require("./src/app");
const bootstrap = require("./src/bootstrap");
const cron = require("./src/services/cron");

async function start() {
  await bootstrap();

  const server = http.createServer(app);

  // Mensajes programados, temporales, estados caducados, sesiones y llamadas sin respuesta.
  // En Vercel lo hace un cron externo llamando a /api/cron/tick.
  cron.tick();
  setInterval(cron.tick, 10 * 1000).unref();

  // Puerto ocupado (otra copia del servidor ya está encendida): mensaje claro en lugar de un error largo
  server.on("error", (err) => {
    if (err.code !== "EADDRINUSE") throw err;
    console.error(
      `\n✖ El puerto ${config.port} ya está en uso: probablemente Yabla ya está encendido en otra terminal.\n` +
        `  · Ciérralo (Ctrl + C en esa terminal) o usa otro puerto: PORT=3001 npm run dev\n` +
        `  · En Windows puedes ver qué lo usa con: netstat -ano | findstr :${config.port}\n`
    );
    process.exit(1);
  });

  server.listen(config.port, () => {
    const where = db.isLocal ? "SQLite local" : "Turso";
    console.log(`Yabla escuchando en ${config.isProduction ? config.baseUrl : `http://localhost:${config.port}`} · base de datos: ${where}`);
  });

  function shutdown(signal) {
    console.log(`${signal} recibido, cerrando…`);
    server.close(() => {
      db.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 8000).unref();
  }

  ["SIGTERM", "SIGINT"].forEach((signal) => process.on(signal, () => shutdown(signal)));
}

start().catch((err) => {
  console.error("No se pudo iniciar Yabla:", err);
  process.exit(1);
});
