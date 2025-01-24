import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { pubClient, subClient } from '../config/redis.js'
// import { connectUser } from './connectUser.js'
import { sessionMiddleware } from '../middlewares/session_middleware.js'
import { UserService } from '../services/user_service.js'
// import { handleRoom } from './room.js'
// import { handleMatch } from './match.js'
import { requireSocketAuth } from '../middlewares/auth_middleware.js'
import { ClientToServerEvents, ServerToClientEvents } from './socket_event.js'
import { MatchService } from '../services/match_service.js'
import { ResponseFailure, ResponseSuccess } from '../utils/ApiResponse.js'

export const setupSocket = (httpServer: any) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
      }
    }
  )
  io.adapter(createAdapter(pubClient, subClient))

  io.engine.use(sessionMiddleware)
  io.use(requireSocketAuth)

  io.on('connection', (socket) => {
    const { username, _id } = socket.user ?? {}
    const userId = _id?.toString()
    console.log(`User connected: ${username}, ${socket.id}`)
    // console.log('Rooms', rootNamespace.adapter.rooms)

    // handleRoom(socket)
    // handleMatch(io, socket)

    socket.on('ping', () => {
      console.log('ping: ', socket.id)
      socket.emit('pong', 'Heartbeat')
    })

    socket.on('createMatch', async ({ maxPlayersCount }, callback) => {
      try {
        if (!userId) {
          throw new Error('Not signed in')
        }
        if (
          isNaN(maxPlayersCount) ||
          maxPlayersCount > 4 ||
          maxPlayersCount < 2
        ) {
          throw new Error(`Invalid maxPlayers value - ${maxPlayersCount}`)
        }
        const match = await MatchService.createMatch(userId, maxPlayersCount)
        callback?.(new ResponseSuccess('Match created successfully', { match }))
      } catch (e: any) {
        console.error('Error: createMatch', e)
        return callback?.(new ResponseFailure(e.message))
      }
    })

    socket.on('joinMatch', async ({ roomId }, callback) => {
      try {
        if (!userId) {
          throw new Error('Not signed in')
        }
        if (!roomId) {
          throw new Error('RoomId is required')
        }
        const match = await MatchService.joinMatch(userId.toString(), roomId)
        await socket.join(roomId)
        callback?.(new ResponseSuccess('Room joined successfully', { match }))
      } catch (e: any) {
        console.error('Error: JoinRoom', e)
        return callback?.(new ResponseFailure(e.message))
      }
    })

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`)
      await UserService.removeUserSocketId(socket.user?.username)
    })

    socket.on('error', () => {
      console.log(`User error: ${socket.id}`)
    })
  })

  // console.log('Initializing Socket.IO namespaces...')
  // connectUser(io)

  // io.use(async (socket, next) => {
  //   const username = socket.handshake.headers?.username as string
  //   if (!username) {
  //     next(new Error('Invalid user'))
  //   } else {
  //     socket.user = {
  //       username
  //     }
  //     await UserService.setUserSocketId(username, socket.id)
  //     next()
  //   }
  //   // console.log(socket.handshake.headers)
  //   // console.log(socket.handshake.headers.userid)
  // })
}
