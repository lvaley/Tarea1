import env from './src/config/env.js'
import { connectDB, disconnectDB } from './src/config/db.js'
import app from './src/app.js'

async function start() {
  // Primero la base de datos; el servidor solo escucha si la conexión funciona.
  await connectDB()

  const server = app.listen(env.port, () => {
    console.log(`🚀 API lista en el puerto ${env.port} (${env.nodeEnv})`)
    console.log(`   Salud: http://localhost:${env.port}/api/health`)
  })

  // Cierre ordenado cuando la plataforma detiene el servicio (Render envía SIGTERM).
  const shutdown = (signal) => {
    console.log(`\n${signal} recibido: cerrando servidor...`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

start().catch((error) => {
  console.error(`\n❌ ${error.message}\n`)
  process.exit(1)
})
