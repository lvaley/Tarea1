import { Router } from 'express'
import {
  listBanners,
  getBanner,
  createBanner,
  replaceBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/banner.controller.js'
import { optionalAuth, protect, restrictTo } from '../middlewares/auth.js'

const router = Router()
const adminOnly = [protect, restrictTo('admin')]

router.get('/', optionalAuth, listBanners)
router.get('/:id', optionalAuth, getBanner)

router.post('/', adminOnly, createBanner)
router.put('/:id', adminOnly, replaceBanner)
router.patch('/:id', adminOnly, updateBanner)
router.delete('/:id', adminOnly, deleteBanner)

export default router
