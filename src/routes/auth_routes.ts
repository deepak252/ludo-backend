import {
  checkUsernameAvailable,
  signIn,
  signOut,
  signUp
} from '../controllers/auth_controller.js'
import { Router } from 'express'
import { requireAuth } from '../middlewares/auth_middleware.js'
const router = Router()

router.post('/sign-up', signUp)
router.post('/sign-in', signIn)
router.post('/sign-out', requireAuth, signOut)
router.post('/check-username', checkUsernameAvailable)

export default router
