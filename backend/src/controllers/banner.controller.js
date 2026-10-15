import Banner from '../models/Banner.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import { assertTextQuery, parseBoolean, pick, requireBodyObject } from '../utils/crud.js'
import mongoose from 'mongoose'

const FIELDS = ['title', 'text', 'imageKey', 'imageUrl', 'order', 'isActive']
const OPTIONAL_DEFAULTS = { text: '', imageKey: '', imageUrl: '', order: 0, isActive: true }

const isAdmin = (req) => req.user?.role === 'admin'

async function findOr404(req) {
  const { id } = req.params
  const banner = mongoose.isObjectIdOrHexString(id) ? await Banner.findById(id) : null
  // Un visitante no puede ver los banners desactivados.
  if (!banner || (!isAdmin(req) && !banner.isActive)) {
    throw new ApiError(404, 'Banner no encontrado.')
  }
  return banner
}

// GET /api/banners
export const listBanners = asyncHandler(async (req, res) => {
  assertTextQuery(req.query)
  const filter = {}
  if (!isAdmin(req)) filter.isActive = true
  else if (req.query.active !== undefined) filter.isActive = parseBoolean(req.query.active, 'active')

  const data = await Banner.find(filter).sort({ order: 1, createdAt: 1, _id: 1 })
  res.json({ ok: true, data, meta: { total: data.length } })
})

// GET /api/banners/:id
export const getBanner = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await findOr404(req) })
})

// POST /api/banners   (admin)
export const createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create(pick(requireBodyObject(req.body), FIELDS))
  res.status(201).json({ ok: true, data: banner })
})

// PUT /api/banners/:id   (admin) -> reemplazo completo
export const replaceBanner = asyncHandler(async (req, res) => {
  const body = pick(requireBodyObject(req.body), FIELDS)
  if (body.title === undefined) {
    throw new ApiError(
      400,
      'PUT reemplaza todo el recurso: falta el título. Usa PATCH para cambios parciales.',
      [{ field: 'title', message: 'Campo obligatorio en PUT.' }]
    )
  }
  const banner = await findOr404(req)
  banner.set({ ...OPTIONAL_DEFAULTS, ...body })
  await banner.save()
  res.json({ ok: true, data: banner })
})

// PATCH /api/banners/:id   (admin) -> cambios parciales
export const updateBanner = asyncHandler(async (req, res) => {
  const body = pick(requireBodyObject(req.body), FIELDS)
  if (Object.keys(body).length === 0) {
    throw new ApiError(400, 'Envía al menos un campo para actualizar.')
  }
  const banner = await findOr404(req)
  banner.set(body)
  await banner.save()
  res.json({ ok: true, data: banner })
})

// DELETE /api/banners/:id   (admin)
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await findOr404(req)
  await banner.deleteOne()
  res.json({ ok: true, message: 'Banner eliminado.', data: { id: banner.id } })
})
