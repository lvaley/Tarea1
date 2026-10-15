import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import generateToken from '../utils/generateToken.js'

const isText = (value) => typeof value === 'string' && value.trim() !== ''

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body ?? {}

  // Solo se aceptan textos: evita que se envíen objetos como { "$gt": "" } (inyección NoSQL).
  const errors = []
  if (!isText(name)) errors.push({ field: 'name', message: 'El nombre es obligatorio.' })
  if (!isText(email)) errors.push({ field: 'email', message: 'El correo es obligatorio.' })
  if (!isText(password)) errors.push({ field: 'password', message: 'La contraseña es obligatoria.' })
  if (errors.length > 0) throw new ApiError(400, 'Datos inválidos.', errors)

  const exists = await User.exists({ email: email.trim().toLowerCase() })
  if (exists) throw new ApiError(409, 'Este correo ya está registrado.')

  // Se toman SOLO estos campos: aunque el body traiga "role", se ignora.
  // Todo usuario registrado desde la web es "cliente"; los admin salen del seed.
  const user = await User.create({ name, email, password })

  res.status(201).json({
    ok: true,
    data: { user, token: generateToken(user) },
  })
})

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {}

  if (!isText(email) || !isText(password)) {
    throw new ApiError(400, 'Correo y contraseña son obligatorios.')
  }

  // select('+password') porque el campo está oculto por defecto en el esquema.
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')

  // Mismo mensaje si el correo no existe o la contraseña falla (no revela cuál).
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Correo o contraseña incorrectos.')
  }

  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  res.json({
    ok: true,
    data: { user, token: generateToken(user) },
  })
})

// GET /api/auth/me  (requiere token)
export const me = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: { user: req.user } })
})
