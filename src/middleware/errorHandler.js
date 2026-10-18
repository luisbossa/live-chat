const multer = require("multer");
const config = require("../config");

function wantsJson(req) {
  return req.path.startsWith("/api/") || req.xhr || req.get("accept")?.includes("application/json");
}

function notFound(req, res) {
  if (wantsJson(req)) return res.status(404).json({ error: "No encontrado" });
  res.status(404).render("pages/error", { styles: ["register"], title: "Página no encontrada", status: 404, message: "La página que buscas no existe o se movió." });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.expose === false || status >= 500 ? "Algo salió mal. Inténtalo de nuevo." : err.message;

  if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? `El archivo supera el límite de ${config.uploadLimit / 1024 / 1024} MB.` : "No se pudo subir el archivo.";
  }

  if (status >= 500) console.error(err);
  if (wantsJson(req)) return res.status(status).json({ error: message });
  res.status(status).render("pages/error", { styles: ["register"], title: "Error", status, message });
}

/** Crea un error HTTP con mensaje visible para el usuario. */
function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

module.exports = { notFound, errorHandler, httpError };
