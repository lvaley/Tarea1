import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio.'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres.'],
      maxlength: [80, 'El nombre no puede superar los 80 caracteres.'],
    },
    email: {
      type: String,
      required: [true, 'El correo es obligatorio.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'Ingresa un correo válido.'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria.'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres.'],
      // bcrypt ignora todo lo que pase de 72 caracteres, así que se rechaza en vez de truncarlo en silencio.
      maxlength: [72, 'La contraseña no puede superar los 72 caracteres.'],
      select: false, // nunca se devuelve en las consultas por defecto
    },
    role: {
      type: String,
      enum: { values: ['admin', 'cliente'], message: 'Rol inválido.' },
      default: 'cliente',
    },
    // Texto que muestra el Perfil (ej. "Cliente frecuente"); no da permisos.
    membership: {
      type: String,
      trim: true,
      default: 'Cliente',
    },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true, // createdAt y updatedAt automáticos
    toJSON: {
      // Lo que se envía al frontend: "id" en vez de "_id", sin __v ni password.
      transform(doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.password
        return ret
      },
    },
  }
)

// Encripta la contraseña solo cuando se crea o se cambia.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

export default mongoose.model('User', userSchema)
