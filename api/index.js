// Entrada de Vercel: todas las rutas llegan aquí (ver vercel.json) y las atiende Express.
const app = require("../src/app");
const bootstrap = require("../src/bootstrap");

module.exports = async (req, res) => {
  try {
    await bootstrap();
  } catch (err) {
    console.error("No se pudo iniciar Yabla:", err);
    res.statusCode = 503;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("Yabla no está disponible en este momento. Inténtalo de nuevo en unos segundos.");
  }
  return app(req, res);
};
