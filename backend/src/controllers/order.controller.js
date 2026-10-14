import crypto from 'node:crypto'
import mongoose from 'mongoose'
import Order, { STATUSES } from '../models/Order.js'
import Product from '../models/Product.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import {
  assertTextQuery,
  escapeRegex,
  idOrSlugQuery,
  parsePagination,
  pick,
  requireBodyObject,
} from '../utils/crud.js'

const MAX_LINES = 30
const MAX_QTY = 20

// Estados a los que puede pasar un pedido desde cada estado.
const TRANSITIONS = {
  pendiente: ['preparando', 'cancelado'],
  preparando: ['listo', 'cancelado'],
  listo: ['entregado', 'cancelado'],
  entregado: [],
  cancelado: [],
}

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100
const isAdmin = (req) => req.user?.role === 'admin'
const generateOrderNumber = () => `NEKO-${crypto.randomInt(100000, 1000000)}`

/**
 * Convierte las líneas que envía el cliente ({ productId, size, qty }) en líneas
 * reales usando los datos guardados en MongoDB. El cliente NO decide precios ni nombres.
 */
async function buildItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new ApiError(400, 'El pedido debe tener al menos un producto.')
  }
  if (rawItems.length > MAX_LINES) {
    throw new ApiError(400, `El pedido admite máximo ${MAX_LINES} líneas.`)
  }

  const errors = []
  const lines = rawItems.map((raw, i) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      errors.push({ field: `items[${i}]`, message: 'Cada línea debe ser un objeto.' })
      return null
    }
    const { productId, size, qty } = raw
    if (typeof productId !== 'string' || !productId.trim() || productId.length > 80) {
      errors.push({ field: `items[${i}].productId`, message: 'El producto es obligatorio (id o slug).' })
    }
    if (size != null && size !== '' && typeof size !== 'string') {
      errors.push({ field: `items[${i}].size`, message: 'El tamaño debe ser un texto.' })
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      errors.push({ field: `items[${i}].qty`, message: `La cantidad debe ser un entero entre 1 y ${MAX_QTY}.` })
    }
    return { index: i, productId: String(productId ?? '').trim().toLowerCase(), size: size ?? '', qty }
  })
  if (errors.length > 0) throw new ApiError(400, 'Datos inválidos.', errors)

  // Solo se pueden pedir productos disponibles.
  const refs = [...new Set(lines.map((l) => l.productId))]
  const products = await Product.find({ isAvailable: true, $or: refs.map(idOrSlugQuery) })
  const byRef = new Map()
  for (const product of products) {
    byRef.set(product.id, product)
    byRef.set(product.slug, product)
  }

  const merged = new Map() // misma línea repetida (producto + tamaño) -> se suman las cantidades
  for (const line of lines) {
    const product = byRef.get(line.productId)
    if (!product) {
      errors.push({ field: `items[${line.index}].productId`, message: `Producto no disponible: "${line.productId}".` })
      continue
    }

    let sizeName = ''
    let unitPrice = product.price
    const wanted = String(line.size).trim().toLowerCase()

    if (product.sizes.length > 0) {
      // Con un único tamaño no hay nada que elegir: se asigna solo. Con varios, el cliente debe indicarlo.
      const size =
        !wanted && product.sizes.length === 1
          ? product.sizes[0]
          : product.sizes.find((s) => s.name.toLowerCase() === wanted)
      if (!size) {
        const options = product.sizes.map((s) => s.name).join(', ')
        errors.push({
          field: `items[${line.index}].size`,
          message: wanted ? `Tamaño inválido para ${product.name}. Opciones: ${options}.` : `Indica el tamaño de ${product.name}. Opciones: ${options}.`,
        })
        continue
      }
      sizeName = size.name
      unitPrice = size.price
    } else if (wanted) {
      errors.push({ field: `items[${line.index}].size`, message: `${product.name} no tiene tamaños.` })
      continue
    }

    const key = `${product.id}|${sizeName}`
    const existing = merged.get(key)
    const qty = (existing?.qty ?? 0) + line.qty
    if (qty > MAX_QTY) {
      errors.push({ field: `items[${line.index}].qty`, message: `La cantidad máxima por producto es ${MAX_QTY}.` })
      continue
    }
    merged.set(key, {
      product: product._id,
      name: product.name,
      size: sizeName,
      unitPrice,
      qty,
      subtotal: round2(unitPrice * qty),
    })
  }
  if (errors.length > 0) throw new ApiError(400, 'Datos inválidos.', errors)

  const items = [...merged.values()]
  const total = round2(items.reduce((sum, item) => sum + item.subtotal, 0))
  return { items, total }
}

// "NEKO-123456" o id de MongoDB
function orderQuery(idOrNumber) {
  const text = String(idOrNumber)
  if (mongoose.isObjectIdOrHexString(text)) return { _id: text }
  if (/^NEKO-\d{6}$/i.test(text)) return { orderNumber: text.toUpperCase() }
  return null
}

// Un cliente solo accede a SUS pedidos; el admin a todos. Si no corresponde, se responde 404.
async function findAccessible(req, { ownerOnly = false } = {}) {
  const query = orderQuery(req.params.id)
  const order = query ? await Order.findOne(query) : null
  const allowed = order && (order.user.equals(req.user._id) || (!ownerOnly && isAdmin(req)))
  if (!allowed) throw new ApiError(404, 'Pedido no encontrado.')
  return order
}

function assertTransition(order, next) {
  if (!TRANSITIONS[order.status].includes(next)) {
    throw new ApiError(409, `No se puede cambiar un pedido de "${order.status}" a "${next}".`)
  }
}

// POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const body = requireBodyObject(req.body)
  const { items, total } = await buildItems(body.items)

  const customer =
    body.customer && typeof body.customer === 'object' && !Array.isArray(body.customer)
      ? pick(body.customer, ['name', 'phone', 'email', 'address'])
      : {}

  const order = new Order({
    user: req.user._id,
    items,
    customer,
    delivery: body.delivery,
    payment: body.payment,
    notes: body.notes,
    total,
  })

  // El número de pedido es aleatorio; si por casualidad ya existe, se genera otro.
  for (let attempt = 1; ; attempt++) {
    order.orderNumber = generateOrderNumber()
    try {
      await order.save()
      break
    } catch (error) {
      const duplicated = error.code === 11000 && 'orderNumber' in (error.keyPattern ?? error.keyValue ?? {})
      if (!duplicated || attempt >= 5) throw error
    }
  }

  res.status(201).json({ ok: true, data: order })
})

// GET /api/orders/me
export const myOrders = asyncHandler(async (req, res) => {
  assertTextQuery(req.query)
  const { status } = req.query
  if (status !== undefined && !STATUSES.includes(status)) {
    throw new ApiError(400, `"status" debe ser uno de: ${STATUSES.join(', ')}.`)
  }
  const filter = { user: req.user._id, ...(status && { status }) }
  const { page, limit, skip } = parsePagination(req.query)

  const [data, total, spent] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
    // Total acumulado: los pedidos cancelados no cuentan.
    Order.aggregate([
      { $match: { user: req.user._id, status: { $ne: 'cancelado' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ])

  res.json({
    ok: true,
    data,
    meta: { total, page, limit, pages: Math.ceil(total / limit), totalSpent: round2(spent[0]?.total ?? 0) },
  })
})

// GET /api/orders   (admin)
export const listOrders = asyncHandler(async (req, res) => {
  assertTextQuery(req.query)
  const { status, search } = req.query
  const filter = {}
  if (status !== undefined) {
    if (!STATUSES.includes(status)) throw new ApiError(400, `"status" debe ser uno de: ${STATUSES.join(', ')}.`)
    filter.status = status
  }
  if (search?.trim()) {
    if (search.length > 60) throw new ApiError(400, 'La búsqueda admite máximo 60 caracteres.')
    const rx = new RegExp(escapeRegex(search.trim()), 'i')
    filter.$or = [{ orderNumber: rx }, { 'customer.name': rx }, { 'customer.email': rx }]
  }
  const { page, limit, skip } = parsePagination(req.query)

  const [data, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
    Order.countDocuments(filter),
  ])
  res.json({ ok: true, data, meta: { total, page, limit, pages: Math.ceil(total / limit) } })
})

// GET /api/orders/:id   (id de MongoDB o número "NEKO-123456")
export const getOrder = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: await findAccessible(req) })
})

// PATCH /api/orders/:id/status   (admin)
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = requireBodyObject(req.body)
  if (typeof status !== 'string' || !STATUSES.includes(status)) {
    throw new ApiError(400, `"status" debe ser uno de: ${STATUSES.join(', ')}.`)
  }
  const order = await findAccessible(req)
  assertTransition(order, status)
  order.status = status
  await order.save()
  res.json({ ok: true, data: order })
})

// PATCH /api/orders/:id/cancel   (dueño del pedido, solo si sigue pendiente)
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await findAccessible(req, { ownerOnly: true })
  if (order.status !== 'pendiente') {
    throw new ApiError(409, 'Solo se pueden cancelar los pedidos que están pendientes.')
  }
  order.status = 'cancelado'
  await order.save()
  res.json({ ok: true, data: order })
})
