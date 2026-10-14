import { Router } from 'express'
import {
  createOrder,
  myOrders,
  listOrders,
  getOrder,
  updateStatus,
  cancelOrder,
} from '../controllers/order.controller.js'
import { protect, restrictTo } from '../middlewares/auth.js'
import { limiter } from '../middlewares/rateLimit.js'

const router = Router()

// Todas las rutas de pedidos exigen sesión iniciada.
router.use(protect)

// Solo cuentan los pedidos creados con éxito: los intentos inválidos no agotan el límite.
router.post('/', limiter(30, { skipFailedRequests: true }), createOrder)
router.get('/me', myOrders) // debe ir antes de "/:id"
router.get('/', restrictTo('admin'), listOrders)
router.get('/:id', getOrder)
router.patch('/:id/status', restrictTo('admin'), updateStatus)
router.patch('/:id/cancel', cancelOrder)

export default router
