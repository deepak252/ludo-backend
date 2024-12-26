import { Router } from 'express'
import authRouter from './auth.routes.js'
import userRouter from './user.routes.js'
import matchRouter from './match.routes.js'

const router = Router()

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/match', matchRouter)

export default router
