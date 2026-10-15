/**
 * Utilidades para leer un JWT en el navegador.
 * OJO: aquí NO se verifica la firma (eso solo puede hacerlo el servidor, que tiene la clave
 * secreta). Solo se lee el campo "exp" para saber cuándo avisar al usuario.
 */

/** Momento de expiración del token en milisegundos (Date.now()), o null si no se puede leer. */
export function getTokenExpiry(token) {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(base64))
    return typeof exp === 'number' ? exp * 1000 : null
  } catch {
    return null
  }
}

/** true si el token ya superó su vigencia según su propio "exp". */
export function isTokenExpired(token) {
  const expiry = getTokenExpiry(token)
  return expiry !== null && Date.now() >= expiry
}
