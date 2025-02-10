import {
  createMatch,
  // deleteMatch,
  joinMatch,
  userMatchHistory,
  userOngoingMatch
} from '../controllers/match_controller.js'
import { Router } from 'express'
import { requireAuth } from '../middlewares/auth_middleware.js'
const router = Router()

router.post('/', requireAuth, createMatch)
router.post('/join', requireAuth, joinMatch)
// router.delete('/', requireAuth, deleteMatch)
router.get('/ongoing', requireAuth, userOngoingMatch)
router.get('/history', requireAuth, userMatchHistory)

export default router
