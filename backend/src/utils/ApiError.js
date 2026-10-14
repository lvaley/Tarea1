/**
 * Error con código HTTP. Los controladores lo lanzan con `throw new ApiError(404, '...')`
 * y el middleware central lo convierte en una respuesta JSON.
 */
export default class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }
}
