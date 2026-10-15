import env from '../config/env.js'
import ApiError from '../utils/ApiError.js'

/**
 * Manejador central de errores: todas las respuestas de error tienen la forma
 * { ok: false, message, errors? } para que el frontend las lea siempre igual.
 */
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500
  let message = err.message || 'Error interno del servidor'
  let errors

  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    status = 400
    message = 'El cuerpo de la petición no es un JSON válido.'
  }

  // Validaciones del esquema de Mongoose
  if (err.name === 'ValidationError' && err.errors) {
    status = 400
    message = 'Datos inválidos.'
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message:
        e.name === 'CastError' ? `Valor inválido para "${e.path}".` : e.message,
    }))
  }

  // Id con formato inválido (CastError de Mongoose)
  if (err.name === 'CastError') {
    status = 400
    message = `Valor inválido para "${err.path}".`
  }

  // Clave duplicada (por ejemplo, correo ya registrado)
  if (err.code === 11000) {
    status = 409
    const key = Object.keys(err.keyValue || {})[0] || 'campo'
    const labels = { email: 'correo', slug: 'nombre', nameKey: 'nombre', orderNumber: 'número de pedido' }
    message = `Ya existe un registro con ese ${labels[key] ?? key}.`
  }

  // Origen bloqueado por CORS
  if (err.message === 'Origen no permitido por CORS') {
    status = 403
  }

  if (err.details) errors = err.details

  if (status >= 500) {
    console.error('💥', err)
    // En producción no se filtran detalles internos al cliente.
    if (env.nodeEnv === 'production') message = 'Error interno del servidor'
  }

  res.status(status).json({
    ok: false,
    // Código estable (p. ej. "token_expired") para que el cliente reaccione sin leer el texto.
    ...(err instanceof ApiError && err.code && { error: err.code }),
    message,
    ...(errors && { errors }),
    ...(env.nodeEnv !== 'production' && status >= 500 && { stack: err.stack }),
  })
}
