import { createMatch, deleteMatch } from '../controllers/match_controller.js'
import { Router } from 'express'
import { requireAuth } from '../middlewares/auth_middleware.js'
const router = Router()

router.post('/', requireAuth, createMatch)
router.delete('/', requireAuth, deleteMatch)

export default router
