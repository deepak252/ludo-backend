import express from 'express'
import cors from 'cors'
import { ApiResponse } from '@/utils/ApiResponse.js'
import router from './routes/index.js'
import { sessionMiddleware } from './middlewares/session.middleware.js'
import { errorHandler } from './middlewares/errorHandler.middleware.js'

const app = express()

app.use(sessionMiddleware)
app.use(express.json())
app.use(
  cors({
    origin: '*',
    credentials: true
  })
)

app.use('/api', router)
app.get('/', (req, res) => {
  // logger.info(req.session.user)
  res.json(new ApiResponse('Server is up'))
})

app.use(errorHandler)

export default app
