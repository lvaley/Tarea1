import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

// Carga backend/.env sin importar desde qué carpeta se ejecute el servidor.
// En Render/Railway el archivo no existe y las variables las inyecta la plataforma.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true })

// Un error de configuración detiene el arranque con un mensaje claro (sin stack trace).
function fail(message) {
  console.error(`\n❌ ${message}\n`)
  process.exit(1)
}

const REQUIRED = ['MONGODB_URI', 'JWT_SECRET']
const missing = REQUIRED.filter((name) => !process.env[name]?.trim())

if (missing.length > 0) {
  fail(
    `Faltan variables de entorno obligatorias: ${missing.join(', ')}. ` +
      'Revisa tu archivo backend/.env (usa .env.example como guía).'
  )
}

const mongodbUri = process.env.MONGODB_URI.trim()

if (!/^mongodb(\+srv)?:\/\//.test(mongodbUri)) {
  fail('MONGODB_URI debe empezar con "mongodb://" o "mongodb+srv://".')
}

if (mongodbUri.includes('<') || mongodbUri.includes('>')) {
  fail(
    'MONGODB_URI todavía contiene "<password>" u otro marcador con "< >". ' +
      'Reemplázalo completo por tu contraseña real, sin los símbolos < >.'
  )
}

if (process.env.JWT_SECRET.trim().length < 16) {
  fail(
    'JWT_SECRET es demasiado corto: usa una frase larga y aleatoria (mínimo 16 caracteres).'
  )
}

// El valor de ejemplo del .env.example no es un secreto: cualquiera lo conoce.
if (process.env.JWT_SECRET.includes('cambia_esto')) {
  const msg =
    'JWT_SECRET sigue con el valor de ejemplo. Cámbialo por una frase propia, larga y aleatoria.'
  if (process.env.NODE_ENV === 'production') fail(msg)
  console.warn(`⚠️  ${msg}`)
}

// CLIENT_URL admite varios orígenes separados por coma; se quita el "/" final.
const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean)

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongodbUri,
  clientUrls,
  jwtSecret: process.env.JWT_SECRET.trim(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
}

export default env
