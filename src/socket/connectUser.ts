import { Server } from 'socket.io'
import { handleRoom } from './room.js'
import { UserService } from '../services/user.service.js'

export const connectUser = (io: Server) => {
  const rootNamespace = io.of('/')

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

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`)
      await UserService.removeUserSocketId(socket.user?.username)
    })

    socket.on('error', () => {
      console.log(`User error: ${socket.id}`)
    })
  })

  rootNamespace.on('create-room', (room) => {
    console.log(`room ${room} was created`)
  })
  rootNamespace.adapter.on('delete-room', (room) => {
    console.log(`room ${room} was deleted`)
  })
  rootNamespace.adapter.on('join-room', (room, id) => {
    console.log(`socket ${id} has joined room ${room}`)
  })
  rootNamespace.adapter.on('leave-room', (room, id) => {
    console.log(`socket ${id} has left room ${room}`)
  })
}
