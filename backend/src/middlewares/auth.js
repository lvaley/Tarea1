import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import env from '../config/env.js'
import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'

/**
 * protect: exige un token válido en la cabecera "Authorization: Bearer <token>".
 * Carga al usuario desde MongoDB y lo deja disponible en req.user.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Debes iniciar sesión para realizar esta acción.')
  }

  let payload
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] })
  } catch {
    throw new ApiError(401, 'Tu sesión no es válida o expiró. Inicia sesión de nuevo.')
  }

  const user = mongoose.isObjectIdOrHexString(payload.sub)
    ? await User.findById(payload.sub)
    : null
  if (!user) {
    throw new ApiError(401, 'La cuenta de este token ya no existe.')
  }

  req.user = user
  next()
})

/**
 * optionalAuth: si llega un token válido, deja al usuario en req.user; si no hay
 * token (o no es válido) la petición continúa como visitante. Sirve para rutas
 * públicas que muestran más datos a un administrador.
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ')
  if (scheme === 'Bearer' && token) {
    try {
      const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] })
      if (mongoose.isObjectIdOrHexString(payload.sub)) {
        req.user = (await User.findById(payload.sub)) || undefined
      }
    } catch {
      // Token inválido o vencido: se trata como visitante.
    }
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
