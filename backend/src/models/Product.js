import mongoose from 'mongoose'
import slugify from '../utils/slugify.js'

export const CATEGORIES = ['bebidas', 'postres', 'snacks']

const URL_REGEX = /^https?:\/\/\S+$/i
const IMAGE_KEY_REGEX = /^[a-z0-9-]+$/

// Lista de textos (etiquetas, ingredientes, alérgenos) con límite de elementos.
const textList = (label, max = 15) => ({
  type: [{ type: String, trim: true, maxlength: [60, `Cada elemento de ${label} admite máximo 60 caracteres.`] }],
  default: [],
  validate: {
    validator: (list) => list.length <= max,
    message: `${label}: máximo ${max} elementos.`,
  },
})

const sizeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del tamaño es obligatorio.'],
      trim: true,
      maxlength: [30, 'El nombre del tamaño admite máximo 30 caracteres.'],
    },
    price: {
      type: Number,
      required: [true, 'El precio del tamaño es obligatorio.'],
      min: [0, 'El precio no puede ser negativo.'],
    },
  },
  { _id: false }
)

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio.'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres.'],
      maxlength: [80, 'El nombre no puede superar los 80 caracteres.'],
    },
    // Identificador legible para URLs. Se crea una sola vez y no cambia al renombrar.
    slug: { type: String, unique: true, lowercase: true, trim: true },
    // Versión normalizada del nombre ("Café Cortado" -> "cafe-cortado"): evita nombres repetidos.
    nameKey: { type: String, unique: true, select: false },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria.'],
      enum: { values: CATEGORIES, message: `La categoría debe ser: ${CATEGORIES.join(', ')}.` },
    },
    // Precio base ("desde"). Si hay tamaños, se calcula solo con el más barato.
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio.'],
      min: [0, 'El precio no puede ser negativo.'],
      max: [100000, 'El precio es demasiado alto.'],
    },
    sizes: { type: [sizeSchema], default: [] },
    shortDesc: { type: String, trim: true, maxlength: [160, 'La descripción corta admite máximo 160 caracteres.'], default: '' },
    description: { type: String, trim: true, maxlength: [1500, 'La descripción admite máximo 1500 caracteres.'], default: '' },
    tags: textList('etiquetas'),
    ingredients: textList('ingredientes'),
    allergens: textList('alérgenos'),
    // Imagen: nombre de una foto del proyecto (biblioteca) o una URL externa.
    imageKey: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [60, 'La clave de imagen es demasiado larga.'],
      match: [IMAGE_KEY_REGEX, 'La clave de imagen solo admite letras minúsculas, números y guiones.'],
      default: '',
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'La URL de la imagen es demasiado larga.'],
      match: [URL_REGEX, 'La URL de la imagen debe empezar con http:// o https://.'],
      default: '',
    },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.nameKey
        return ret
      },
    },
  }
)

productSchema.pre('validate', function () {
  if (this.name && (this.isNew || this.isModified('name'))) this.nameKey = slugify(this.name)
  if (this.isNew && !this.slug && this.name) this.slug = slugify(this.name)
  if (this.sizes?.length > 0) {
    this.price = Math.min(...this.sizes.map((size) => size.price))
  }
})

productSchema.index({ category: 1, createdAt: 1 })

export default mongoose.model('Product', productSchema)
