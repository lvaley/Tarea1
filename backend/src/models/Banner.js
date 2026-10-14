import mongoose from 'mongoose'

const URL_REGEX = /^https?:\/\/\S+$/i
const IMAGE_KEY_REGEX = /^[a-z0-9-]+$/

/** Banner del carrusel del Home. */
const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio.'],
      trim: true,
      minlength: [2, 'El título debe tener al menos 2 caracteres.'],
      maxlength: [80, 'El título no puede superar los 80 caracteres.'],
    },
    text: {
      type: String,
      trim: true,
      maxlength: [200, 'El texto admite máximo 200 caracteres.'],
      default: '',
    },
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
    // Posición en el carrusel (0 aparece primero).
    order: {
      type: Number,
      default: 0,
      min: [0, 'El orden no puede ser negativo.'],
      validate: { validator: Number.isInteger, message: 'El orden debe ser un número entero.' },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

// Un banner sin imagen no tiene sentido en un carrusel.
bannerSchema.pre('validate', function () {
  if (!this.imageKey && !this.imageUrl) {
    this.invalidate('imageKey', 'Elige una imagen de la biblioteca o indica una URL.')
  }
})

export default mongoose.model('Banner', bannerSchema)
