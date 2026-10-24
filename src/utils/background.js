const { waitUntil } = require("@vercel/functions");

/**
 * Tarea que no debe retrasar la respuesta (avisos en vivo, notificaciones push).
 * En Vercel la función se congela al responder: waitUntil la mantiene viva hasta que
 * termine la tarea. Fuera de Vercel (npm run dev) no hace nada y la promesa sigue sola.
 */
module.exports = function background(promise, label = "tarea") {
  const task = Promise.resolve(promise).catch((err) => console.error(`[${label}]`, err));
  waitUntil(task);
  return task;
};
