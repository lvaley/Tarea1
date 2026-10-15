/**
 * Error con código HTTP. Los controladores lo lanzan con `throw new ApiError(404, '...')`
 * y el middleware central lo convierte en una respuesta JSON.
 *
 * `code` es un identificador estable para que el cliente decida qué hacer sin depender del
 * texto del mensaje (por ejemplo "token_expired" cuando el JWT superó su vigencia).
 */
export default class ApiError extends Error {
  constructor(statusCode, message, details = undefined, code = undefined) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
    this.code = code
  }
}
