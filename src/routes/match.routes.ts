import { createMatch } from '@/controllers/match.controller.js'
import { verifyUer } from '@/middlewares/auth.middleware.js'
import { Router } from 'express'
const router = Router()

router.post('/create', verifyUer, createMatch)

export default router
