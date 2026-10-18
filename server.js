const http = require("http");
const config = require("./src/config");
const db = require("./src/config/database");
const app = require("./src/app");
const createSocketServer = require("./src/sockets");
const Story = require("./src/models/Story");

// Primer despliegue: datos de demostración si la base está vacía (SEED_DEMO=true)
if (config.seedDemo) {
  const { seed } = require("./src/db/seed");
  if (seed()) console.log("Datos de demostración creados (contraseña: demo1234).");
}

const server = http.createServer(app);
const io = createSocketServer(server);

// Los estados caducan a las 24 h
const purgeStories = () => Story.purgeExpired();
purgeStories();
setInterval(purgeStories, 10 * 60 * 1000).unref();

server.listen(config.port, () => {
  console.log(`Yabla escuchando en ${config.isProduction ? config.baseUrl : `http://localhost:${config.port}`}`);
});

// Cierre ordenado: la plataforma envía SIGTERM al redesplegar
function shutdown(signal) {
  console.log(`${signal} recibido, cerrando…`);
  // io.close() también cierra el servidor HTTP
  io.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 8000).unref();
}

["SIGTERM", "SIGINT"].forEach((signal) => process.on(signal, () => shutdown(signal)));
