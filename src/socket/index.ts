import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { pubClient, subClient } from 'config/redis.js'
import { connectUser } from './connectUser.js'
import { sessionMiddleware } from 'middlewares/session.middleware.js'

export const setupSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  })
  io.adapter(createAdapter(pubClient, subClient))

  io.engine.use(sessionMiddleware)

  // console.log('Initializing Socket.IO namespaces...')
  connectUser(io)
}
