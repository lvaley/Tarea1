/**
 * Envuelve un controlador async para que cualquier error llegue al middleware
 * de errores sin necesidad de escribir try/catch en cada función.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

export default asyncHandler
