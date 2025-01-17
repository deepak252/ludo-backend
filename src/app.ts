import express from 'express'
import cors from 'cors'
import router from './routes/index.js'
import { sessionMiddleware } from './middlewares/session.middleware.js'
import { ApiResponse } from './utils/ApiResponse.js'
import { errorHandler } from './middlewares/errorHandler.middleware.js'
import { CLIENT_URL } from './config/environment.js'

const app = express()

app.use(sessionMiddleware)
app.use(express.json())
app.use(
  cors({
    origin: CLIENT_URL,
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
