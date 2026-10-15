import mongoose from 'mongoose'

export const STATUSES = ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado']
export const DELIVERIES = ['recoger', 'domicilio']
export const PAYMENTS = ['efectivo', 'tarjeta', 'transferencia']

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[0-9+()\-\s]{7,20}$/

// Cada línea guarda una "foto" del producto al momento de la compra (nombre y precio):
// si después editas o eliminas el producto, el historial del pedido no cambia.
const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    size: { type: String, default: '' },
    unitPrice: { type: Number, required: true, min: 0 },
    qty: {
      type: Number,
      required: true,
      min: [1, 'La cantidad mínima es 1.'],
      max: [20, 'La cantidad máxima por producto es 20.'],
      validate: { validator: Number.isInteger, message: 'La cantidad debe ser un número entero.' },
    },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: {
      type: [itemSchema],
      validate: {
        validator: (items) => items.length >= 1 && items.length <= 30,
        message: 'El pedido debe tener entre 1 y 30 productos.',
      },
    },
    customer: {
      name: {
        type: String,
        required: [true, 'El nombre es obligatorio.'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres.'],
        maxlength: [80, 'El nombre no puede superar los 80 caracteres.'],
      },
      phone: {
        type: String,
        required: [true, 'El teléfono es obligatorio.'],
        trim: true,
        match: [PHONE_REGEX, 'Ingresa un teléfono válido (solo números, +, - y paréntesis).'],
      },
      email: {
        type: String,
        required: [true, 'El correo es obligatorio.'],
        trim: true,
        lowercase: true,
        match: [EMAIL_REGEX, 'Ingresa un correo válido.'],
      },
      address: {
        type: String,
        trim: true,
        maxlength: [200, 'La dirección admite máximo 200 caracteres.'],
        default: '',
        validate: {
          // La dirección solo es obligatoria si el pedido es a domicilio.
          validator(value) {
            return this.delivery !== 'domicilio' || (value ?? '').trim().length >= 5
          },
          message: 'La dirección es obligatoria para entrega a domicilio (mínimo 5 caracteres).',
        },
      },
    },
    delivery: {
      type: String,
      required: [true, 'El tipo de entrega es obligatorio.'],
      enum: { values: DELIVERIES, message: `La entrega debe ser: ${DELIVERIES.join(', ')}.` },
    },
    payment: {
      type: String,
      required: [true, 'El método de pago es obligatorio.'],
      enum: { values: PAYMENTS, message: `El pago debe ser: ${PAYMENTS.join(', ')}.` },
    },
    notes: { type: String, trim: true, maxlength: [200, 'Las notas admiten máximo 200 caracteres.'], default: '' },
    // Lo calcula el servidor con los precios guardados; nunca viene del cliente.
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: { values: STATUSES, message: `El estado debe ser: ${STATUSES.join(', ')}.` },
      default: 'pendiente',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        if (ret.user instanceof mongoose.Types.ObjectId) ret.user = ret.user.toString()
        for (const item of ret.items ?? []) {
          if (item.product instanceof mongoose.Types.ObjectId) item.product = item.product.toString()
        }
        return ret
      },
    },
  }
)

orderSchema.index({ user: 1, createdAt: -1 })

export default mongoose.model('Order', orderSchema)
