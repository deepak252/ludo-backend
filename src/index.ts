import { createServer } from 'http'
import app from './app.js'
import { SERVER_PORT } from '@/config/environment.js'
import { setupSocket } from './socket/index.js'

const httpServer = createServer(app)
// const io = new Server(httpServer, {
//   connectionStateRecovery: {}
// })

setupSocket(httpServer)

httpServer.listen(SERVER_PORT, () => {
  console.log('Server is running on port : ', SERVER_PORT)
})
