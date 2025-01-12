import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { pubClient, subClient } from '../config/redis.js'
// import { connectUser } from './connectUser.js'
import { sessionMiddleware } from '../middlewares/session.middleware.js'
import { UserService } from '../services/user.service.js'
import { handleRoom } from './room.js'
import { handleMatch } from './match.js'

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
  // connectUser(io)

  io.use(async (socket, next) => {
    // socket.user = {}
    const username = socket.handshake.headers?.username as string
    if (!username) {
      next(new Error('Invalid user'))
    } else {
      socket.user = {
        username
      }
      await UserService.setUserSocketId(username, socket.id)
      next()
    }
    // console.log(socket.handshake.headers)
    // console.log(socket.handshake.headers.userid)
  })

  io.on('connection', (socket) => {
    const { username } = socket.user ?? {}
    console.log(`User connected: ${username}, ${socket.id}`)
    // console.log('Rooms', rootNamespace.adapter.rooms)

    handleRoom(socket)
    handleMatch(io, socket)

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`)
      await UserService.removeUserSocketId(socket.user?.username)
    })

    socket.on('error', () => {
      console.log(`User error: ${socket.id}`)
    })
  })
}
