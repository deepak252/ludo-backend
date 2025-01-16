import { getUserProfile } from '../controllers/user.controller.js'
import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware.js'
const router = Router()

router.get('/profile', requireAuth, getUserProfile)

export default router
