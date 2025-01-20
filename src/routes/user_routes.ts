import { getUserProfile, searchUsers } from '../controllers/user_controller.js'
import { Router } from 'express'
import { requireAuth } from '../middlewares/auth_middleware.js'
const router = Router()

router.get('/profile', requireAuth, getUserProfile)
router.get('/search', requireAuth, searchUsers)

export default router
