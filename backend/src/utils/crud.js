import mongoose from 'mongoose'
import ApiError from './ApiError.js'

/** Escapa los caracteres especiales para usar un texto del usuario dentro de una RegExp. */
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Copia solo los campos permitidos del body (evita que se envíen campos como "slug" o "_id"). */
export function pick(source, allowed) {
  const result = {}
  for (const key of allowed) {
    if (Object.hasOwn(source, key)) result[key] = source[key]
  }
  return result
}

/** El body debe ser un objeto JSON (no un arreglo ni un texto). */
export function requireBodyObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'El cuerpo de la petición debe ser un objeto JSON.')
  }
  return body
}

/**
 * Los parámetros de la URL deben ser texto simple. Si llega un arreglo
 * (por ejemplo ?tag=a&tag=b) se rechaza en vez de procesarlo.
 */
export function assertTextQuery(query) {
  for (const [key, value] of Object.entries(query)) {
    if (typeof value !== 'string') {
      throw new ApiError(400, `El parámetro "${key}" debe ser un único valor de texto.`)
    }
  }
}

export function parseBoolean(value, name) {
  if (value === 'true') return true
  if (value === 'false') return false
  throw new ApiError(400, `El parámetro "${name}" debe ser true o false.`)
}

export function parsePagination({ page = '1', limit = '50' }, maxLimit = 100) {
  const p = Number(page)
  const l = Number(limit)
  if (!Number.isInteger(p) || p < 1) throw new ApiError(400, '"page" debe ser un entero mayor o igual a 1.')
  if (!Number.isInteger(l) || l < 1 || l > maxLimit) {
    throw new ApiError(400, `"limit" debe ser un entero entre 1 y ${maxLimit}.`)
  }
  return { page: p, limit: l, skip: (p - 1) * l }
}

/** Acepta el id de MongoDB (24 caracteres hexadecimales) o un slug (ej. "matcha-latte"). */
export function idOrSlugQuery(value) {
  const text = String(value)
  return mongoose.isObjectIdOrHexString(text)
    ? { _id: text }
    : { slug: text.toLowerCase() }
}
