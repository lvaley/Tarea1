import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import env from './config/env.js'
import routes from './routes/index.js'
import notFound from './middlewares/notFound.js'
import errorHandler from './middlewares/error.js'

const app = express()

// Render y Railway colocan un proxy delante del servidor.
app.set('trust proxy', 1)

app.use(helmet())

// CORS: solo los orígenes de CLIENT_URL pueden usar la API desde un navegador.
// Las peticiones sin origen (Postman, curl, health checks) se permiten.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin)) return callback(null, true)
      return callback(new Error('Origen no permitido por CORS'))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json({ limit: '1mb' }))
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app
