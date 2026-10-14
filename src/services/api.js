/**
 * Cliente HTTP de la API de Neko Coffee.
 * Centraliza: la URL base, el token de sesión, los errores y los tiempos de espera,
 * para que ningún componente tenga que repetir esa lógica con fetch.
 */

// En desarrollo se usa el backend local por defecto; en producción VITE_API_URL es obligatoria.
const API_URL = (
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:5000/api' : '')
).replace(/\/+$/, '')

// Render (plan gratuito) puede tardar cerca de un minuto en "despertar" tras un rato inactivo.
const TIMEOUT_MS = 60_000

export class ApiError extends Error {
  constructor(status, message, details = undefined) {
    super(message)
    this.name = 'ApiError'
    this.status = status // 0 = no se pudo contactar al servidor
    this.details = details // [{ field, message }] cuando el servidor valida campos
  }
}

let authToken = null
let onUnauthorized = null

/** El AuthContext guarda aquí el token vigente; se envía en cada petición. */
export const setAuthToken = (token) => {
  authToken = token || null
}

/** El AuthContext registra qué hacer si el servidor rechaza el token (sesión vencida). */
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

// Rutas donde un 401 significa "credenciales incorrectas", no "sesión vencida".
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register']

async function request(path, { method = 'GET', body, signal } = {}) {
  if (!API_URL) {
    throw new ApiError(0, 'Falta configurar VITE_API_URL (la dirección de la API).')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort('timeout'), TIMEOUT_MS)
  signal?.addEventListener('abort', () => controller.abort(signal.reason), { once: true })

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (error) {
    if (controller.signal.reason === 'timeout') {
      throw new ApiError(0, 'El servidor tardó demasiado en responder. Inténtalo de nuevo en unos segundos.')
    }
    if (signal?.aborted) throw error // cancelada a propósito por quien la llamó
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.')
  } finally {
    clearTimeout(timer)
  }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!response.ok) {
    if (response.status === 401 && authToken && !PUBLIC_AUTH_PATHS.includes(path)) {
      onUnauthorized?.()
    }
    throw new ApiError(
      response.status,
      payload?.message ?? `El servidor respondió con un error (${response.status}).`,
      payload?.errors
    )
  }

  return payload // { ok: true, data, meta? }
}

/** [{ field, message }] que devuelve el servidor -> { field: message } para mostrar cada error en su campo. */
export function fieldErrorsFrom(error) {
  const result = {}
  for (const item of error?.details ?? []) {
    if (item?.field && !result[item.field]) result[item.field] = item.message
  }
  return result
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options) => request(path, { method: 'POST', body, ...options }),
  put: (path, body, options) => request(path, { method: 'PUT', body, ...options }),
  patch: (path, body, options) => request(path, { method: 'PATCH', body, ...options }),
  delete: (path, options) => request(path, { method: 'DELETE', ...options }),
}
