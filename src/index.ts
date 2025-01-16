import { createServer } from 'http'
import app from './app.js'
import { setupSocket } from './socket/index.js'
import { SERVER_PORT } from './config/environment.js'
import { connectDB } from './config/db.js'
import './utils/listUtil.ts'

connectDB()
  .then(() => {
    const httpServer = createServer(app)
    setupSocket(httpServer)

    httpServer.listen(SERVER_PORT, () => {
      console.log('Server is running on port : ', SERVER_PORT)
    })
  })
  .catch((err) => {
    console.log('ERROR Starting Server', err)
    process.exit(1)
  })
