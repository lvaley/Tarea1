import { Router } from 'express'
import {
  listProducts,
  getProduct,
  createProduct,
  replaceProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js'
import { optionalAuth, protect, restrictTo } from '../middlewares/auth.js'

const router = Router()
const adminOnly = [protect, restrictTo('admin')]

// Lectura pública (el administrador ve además los productos ocultos)
router.get('/', optionalAuth, listProducts)
router.get('/:id', optionalAuth, getProduct)

// Escritura: solo administradores
router.post('/', adminOnly, createProduct)
router.put('/:id', adminOnly, replaceProduct)
router.patch('/:id', adminOnly, updateProduct)
router.delete('/:id', adminOnly, deleteProduct)

export default router
