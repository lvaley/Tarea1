import jwt from 'jsonwebtoken'
import env from '../config/env.js'

/** Crea un JWT firmado cuyo contenido es solo el id del usuario. */
export default function generateToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: env.jwtExpiresIn,
  })
}
