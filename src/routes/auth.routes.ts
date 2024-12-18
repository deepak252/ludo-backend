import { signIn, signOut, signUp } from '@/controllers/auth.controller.js'
import { Router } from 'express'
const router = Router()

router.post('/sign-up', signUp)
router.post('/sign-in', signIn)
router.post('/sign-out', signOut)

export default router
