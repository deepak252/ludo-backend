import { createServer } from 'http'
import { Server } from 'socket.io'
import app from './app.js'
import { SERVER_PORT } from '@/config/environment.js'
import { initSocket } from './services/socket/index.js'

const httpServer = createServer(app)
const io = new Server(httpServer, {
  connectionStateRecovery: {}
})

initSocket(io)

httpServer.listen(SERVER_PORT, () => {
  console.log('Server is running on port : ', SERVER_PORT)
})
