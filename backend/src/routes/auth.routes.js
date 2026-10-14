import { Router } from 'express'
import { register, login, me } from '../controllers/auth.controller.js'
import { protect } from '../middlewares/auth.js'
import { limiter } from '../middlewares/rateLimit.js'

const router = Router()

router.post('/register', limiter(20), register)
// En el login solo cuentan los intentos fallidos.
router.post('/login', limiter(10, { skipSuccessfulRequests: true }), login)
router.get('/me', protect, me)

export default router
