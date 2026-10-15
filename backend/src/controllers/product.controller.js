import Product, { CATEGORIES } from '../models/Product.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import {
  assertTextQuery,
  escapeRegex,
  idOrSlugQuery,
  parseBoolean,
  parsePagination,
  pick,
  requireBodyObject,
} from '../utils/crud.js'

// Únicos campos que el cliente puede enviar (no se aceptan slug, _id ni fechas).
const FIELDS = [
  'name', 'category', 'price', 'sizes', 'shortDesc', 'description',
  'tags', 'ingredients', 'allergens', 'imageKey', 'imageUrl', 'isAvailable', 'isFeatured',
]

// Valores que recupera un campo opcional cuando un PUT (reemplazo) no lo incluye.
const OPTIONAL_DEFAULTS = {
  sizes: [], shortDesc: '', description: '', tags: [], ingredients: [],
  allergens: [], imageKey: '', imageUrl: '', isAvailable: true, isFeatured: false,
}

const SORTS = {
  name: { name: 1 }, '-name': { name: -1 },
  price: { price: 1 }, '-price': { price: -1 },
  createdAt: { createdAt: 1 }, '-createdAt': { createdAt: -1 },
}

const isAdmin = (req) => req.user?.role === 'admin'

// El nombre debe ser único (sin importar mayúsculas, tildes ni espacios repetidos).
async function assertNameFree(product) {
  const taken = await Product.exists({ nameKey: product.nameKey, _id: { $ne: product._id } })
  if (taken) throw new ApiError(409, 'Ya existe un producto con ese nombre.')
}

// Si el slug ya lo usa otro producto (porque fue renombrado), se agrega un sufijo: "-2", "-3"...
async function uniqueSlug(base) {
  let slug = base
  for (let n = 2; await Product.exists({ slug }); n++) slug = `${base}-${n}`
  return slug
}

// Valida y aplica los cambios de un PUT/PATCH comprobando que el nuevo nombre esté libre.
async function applyChanges(product, changes) {
  product.set(changes)
  await product.validate()
  if (product.isModified('name')) await assertNameFree(product)
  await product.save()
}

async function findOr404(req) {
  const filter = idOrSlugQuery(req.params.id)
  // Un visitante no puede ver los productos ocultos.
  if (!isAdmin(req)) filter.isAvailable = true
  const product = await Product.findOne(filter)
  if (!product) throw new ApiError(404, 'Producto no encontrado.')
  return product
}

// GET /api/recursos
export const listProducts = asyncHandler(async (req, res) => {
  assertTextQuery(req.query)
  const { category, search, tag, minPrice, maxPrice, featured, available, sort } = req.query
  const filter = {}

  if (category !== undefined) {
    if (!CATEGORIES.includes(category)) {
      throw new ApiError(400, `La categoría debe ser: ${CATEGORIES.join(', ')}.`)
    }
    filter.category = category
  }

  if (search?.trim()) {
    if (search.length > 60) throw new ApiError(400, 'La búsqueda admite máximo 60 caracteres.')
    const rx = new RegExp(escapeRegex(search.trim()), 'i')
    filter.$or = [{ name: rx }, { shortDesc: rx }, { description: rx }, { tags: rx }]
  }

  if (tag?.trim()) filter.tags = new RegExp(`^${escapeRegex(tag.trim())}$`, 'i')

  for (const [name, value, op] of [['minPrice', minPrice, '$gte'], ['maxPrice', maxPrice, '$lte']]) {
    if (value === undefined) continue
    const number = Number(value)
    if (value.trim() === '' || Number.isNaN(number)) {
      throw new ApiError(400, `"${name}" debe ser un número.`)
    }
    filter.price = { ...filter.price, [op]: number }
  }

  if (featured !== undefined) filter.isFeatured = parseBoolean(featured, 'featured')

  // Visitantes: solo productos disponibles. Administradores: todos (o filtrados con ?available=).
  if (!isAdmin(req)) filter.isAvailable = true
  else if (available !== undefined) filter.isAvailable = parseBoolean(available, 'available')

  if (sort !== undefined && !SORTS[sort]) {
    throw new ApiError(400, `"sort" debe ser uno de: ${Object.keys(SORTS).join(', ')}.`)
  }
  const order = { ...(SORTS[sort] ?? { category: 1, createdAt: 1 }), _id: 1 }

  const { page, limit, skip } = parsePagination(req.query)
  const [data, total] = await Promise.all([
    Product.find(filter).sort(order).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ])

  res.json({
    ok: true,
    data,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  })
})

// GET /api/recursos/:id   (:id = id de MongoDB o slug)
export const getProduct = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await findOr404(req) })
})

// POST /api/recursos   (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const data = pick(requireBodyObject(req.body), FIELDS)
  const product = new Product(data)
  await product.validate()

  await assertNameFree(product)
  product.slug = await uniqueSlug(product.slug)
  await product.save()
  res.status(201).json({ ok: true, data: product })
})

// PUT /api/recursos/:id   (admin) -> reemplazo completo
export const replaceProduct = asyncHandler(async (req, res) => {
  const body = pick(requireBodyObject(req.body), FIELDS)

  const missing = []
  if (body.name === undefined) missing.push('name')
  if (body.category === undefined) missing.push('category')
  if (body.price === undefined && !(Array.isArray(body.sizes) && body.sizes.length > 0)) {
    missing.push('price')
  }
  if (missing.length > 0) {
    throw new ApiError(
      400,
      'PUT reemplaza todo el recurso: faltan campos obligatorios. Usa PATCH para cambios parciales.',
      missing.map((field) => ({ field, message: 'Campo obligatorio en PUT.' }))
    )
  }

  const product = await findOr404(req)
  await applyChanges(product, { ...OPTIONAL_DEFAULTS, ...body })
  res.json({ ok: true, data: product })
})

// PATCH /api/recursos/:id   (admin) -> cambios parciales
export const updateProduct = asyncHandler(async (req, res) => {
  const body = pick(requireBodyObject(req.body), FIELDS)
  if (Object.keys(body).length === 0) {
    throw new ApiError(400, 'Envía al menos un campo para actualizar.')
  }
  const product = await findOr404(req)
  await applyChanges(product, body)
  res.json({ ok: true, data: product })
})

// DELETE /api/recursos/:id   (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await findOr404(req)
  await product.deleteOne()
  res.json({ ok: true, message: 'Producto eliminado.', data: { id: product.id } })
})
