import rateLimit from 'express-rate-limit'
import ApiError from '../utils/ApiError.js'

/** Máximo de peticiones por IP cada 15 minutos. */
export const limiter = (limit, options = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res, next) =>
      next(new ApiError(429, 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.')),
    ...options,
  })
