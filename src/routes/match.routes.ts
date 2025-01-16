import { createMatch, deleteMatch } from '../controllers/match.controller.js'
import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware.js'
const router = Router()

router.post('/', requireAuth, createMatch)
router.delete('/', requireAuth, deleteMatch)

export default router
