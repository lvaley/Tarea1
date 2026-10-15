import jwt from 'jsonwebtoken'
import env from '../config/env.js'

/**
 * Crea un JWT firmado (HS256) que caduca según JWT_EXPIRES_IN (5 minutos por defecto).
 * Payload: sub (id), email y role. El rol del token es informativo: el servidor siempre
 * vuelve a leer al usuario en la base de datos antes de autorizar (ver middlewares/auth.js).
 */
export default function generateToken(user) {
  return jwt.sign(
    { sub: String(user.id), email: user.email, role: user.role },
    env.jwtSecret,
    { algorithm: 'HS256', expiresIn: env.jwtExpiresIn }
  )
}
