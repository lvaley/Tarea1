import mongoose from 'mongoose'
import env from './env.js'

// Mensajes de ayuda según el tipo de fallo más común al conectar con Atlas.
function explainError(error) {
  const text = `${error.name} ${error.message}`.toLowerCase()

  if (text.includes('bad auth') || text.includes('authentication failed')) {
    return 'Usuario o contraseña incorrectos. Revisa MONGODB_URI y el usuario en Atlas (Database Access).'
  }
  if (text.includes('enotfound') || text.includes('querysrv')) {
    return 'No se encontró el clúster. Revisa el host de MONGODB_URI y tu conexión a internet.'
  }
  if (text.includes('serverselection') || text.includes('timed out')) {
    return 'No se pudo llegar al clúster. Revisa que 0.0.0.0/0 esté activo en Atlas (Network Access).'
  }
  return null
}

// Avisos de estado: se registran solo cuando la conexión inicial ya funcionó.
function listenConnectionEvents() {
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB desconectado')
  })
  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconectado')
  })
  mongoose.connection.on('error', (error) => {
    console.error('❌ Error de MongoDB:', error.message)
  })
}

export async function connectDB() {
  try {
    const connection = await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 10000,
    })
    listenConnectionEvents()
    // Solo se imprime el host y la BD, nunca la URI (lleva la contraseña).
    console.log(
      `✅ MongoDB conectado: ${connection.connection.host} / base "${connection.connection.name}"`
    )
  } catch (error) {
    const hint = explainError(error)
    throw new Error(`No se pudo conectar a MongoDB. ${hint ?? error.message}`, {
      cause: error,
    })
  }
}

export async function disconnectDB() {
  // Cierre voluntario: se quitan los avisos para que no parezca una caída.
  mongoose.connection.removeAllListeners('disconnected')
  await mongoose.disconnect()
}
