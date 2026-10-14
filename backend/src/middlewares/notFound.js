import ApiError from '../utils/ApiError.js'

export default function notFound(req, res, next) {
  next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`))
}
