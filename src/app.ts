import express from 'express'
import { ApiResponse } from '@/utils/ApiResponse.js'
import { sessionMiddleware } from '@/middlewares/sessionMiddleware.js'
import router from './routes/index.js'
import logger from './utils/logger.js'

const app = express()

app.use(express.json())
app.use(sessionMiddleware)

app.use('/api', router)
app.get('/', (req, res) => {
  logger.info(req.session.user)
  res.json(new ApiResponse('Server is up'))
})

export default app
