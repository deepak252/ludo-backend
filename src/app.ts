import express from 'express'
import cors from 'cors'
import { ApiResponse } from '@/utils/ApiResponse.js'
import { sessionMiddleware } from '@/middlewares/sessionMiddleware.js'
import router from './routes/index.js'

const app = express()

app.use(express.json())
app.use(sessionMiddleware)
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

export default app
