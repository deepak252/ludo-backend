import { createMatch, deleteMatch } from '../controllers/match.controller.js'
import { verifyUer } from '../middlewares/auth.middleware.js'
import { Router } from 'express'
const router = Router()

router.post('/', verifyUer, createMatch)
router.delete('/', verifyUer, deleteMatch)

export default router
