import { getUserProfile } from '@/controllers/user.controller.js'
import { verifyUer } from '@/middlewares/auth.middleware.js'
import { Router } from 'express'
const router = Router()

router.get('/profile', verifyUer, getUserProfile)

export default router
