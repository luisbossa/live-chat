/** Express 4 no captura promesas rechazadas: envuelve un handler async para pasar el error a next(). */
module.exports = (fn) =>
  function asyncHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
