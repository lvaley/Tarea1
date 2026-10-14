import { Router } from 'express'
import mongoose from 'mongoose'
import env from '../config/env.js'
import authRoutes from './auth.routes.js'
import productRoutes from './product.routes.js'
import bannerRoutes from './banner.routes.js'
import orderRoutes from './order.routes.js'

const router = Router()

const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting']

// GET /api/health -> comprobación rápida de que el servidor y la BD responden.
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    data: {
      status: 'ok',
      environment: env.nodeEnv,
      database: DB_STATES[mongoose.connection.readyState] ?? 'unknown',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  })
})

router.use('/auth', authRoutes)
router.use('/recursos', productRoutes) // "recurso" = producto del menú
router.use('/banners', bannerRoutes)
router.use('/orders', orderRoutes)

export default router
