import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import env from '../config/env.js'
import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'

// Respuesta exigida cuando el token superó su vigencia (5 minutos).
export const TOKEN_EXPIRED_MESSAGE =
  'La sesión ha expirado o ya no es válida. Por favor, inicie sesión nuevamente.'

/** Extrae el token de "Authorization: Bearer <token>". Devuelve null si no viene. */
function getBearerToken(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ')
  return scheme === 'Bearer' && token ? token : null
}

/**
 * Verifica la firma y la vigencia del token con la clave secreta del servidor.
 * - Vencido (TokenExpiredError)  -> 401 { error: "token_expired", message }
 * - Firma/formato inválido       -> 401 { error: "token_invalid", message }
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] })
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, TOKEN_EXPIRED_MESSAGE, undefined, 'token_expired')
    }
    throw new ApiError(401, TOKEN_EXPIRED_MESSAGE, undefined, 'token_invalid')
  }
}

/** Busca en MongoDB al dueño del token (sub). Devuelve null si el id no es válido o no existe. */
async function findTokenUser(payload) {
  return mongoose.isObjectIdOrHexString(payload.sub) ? User.findById(payload.sub) : null
}

/**
 * protect: exige un token válido y vigente en la cabecera "Authorization: Bearer <token>".
 * Carga al usuario desde MongoDB y lo deja disponible en req.user.
 * Sin cabecera o sin token -> 401.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const token = getBearerToken(req)
  if (!token) {
    throw new ApiError(401, 'Debes iniciar sesión para realizar esta acción.', undefined, 'token_missing')
  }

  const user = await findTokenUser(verifyToken(token))
  if (!user) {
    throw new ApiError(401, 'La cuenta de este token ya no existe.', undefined, 'token_invalid')
  }

  req.user = user
  next()
})

/**
 * optionalAuth: para rutas públicas que muestran más datos a un administrador.
 * - Sin token                -> sigue como visitante.
 * - Token válido y vigente   -> deja al usuario en req.user.
 * - Token vencido o inválido -> 401, igual que en protect. Así el cliente se entera de que su
 *   sesión caducó aunque esté navegando por páginas públicas (y puede cerrar la sesión).
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getBearerToken(req)
  if (token) {
    const user = await findTokenUser(verifyToken(token))
    if (!user) {
      throw new ApiError(401, 'La cuenta de este token ya no existe.', undefined, 'token_invalid')
    }
    req.user = user
  }
  next()
})

/** restrictTo('admin'): solo deja pasar a los roles indicados (usar después de protect). */
export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'No tienes permiso para realizar esta acción.'))
    }
    next()
  }
