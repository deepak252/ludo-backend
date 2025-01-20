import { Router } from 'express'
import authRouter from './auth_routes.js'
import userRouter from './user_routes.js'
import matchRouter from './match_routes.js'

const router = Router()

const wait = async (ms: number) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve(true)
    }, ms)
  )

router.use(async (req, res, next) => {
  await wait(1000)
  next()
})

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/match', matchRouter)

export default router
