import { Server } from 'socket.io'
import { handleRoom } from './room.js'

export const connectUser = (io: Server) => {
  const rootNamespace = io.of('/')

  io.use((socket, next) => {
    socket.user = {}
    const userId = socket.handshake.headers?.userid as string
    const email = socket.handshake.headers?.email as string
    if (!userId) {
      next(new Error('Invalid user'))
    } else {
      socket.user = {
        userId,
        email
      }
      next()
    }
    // console.log(socket.handshake.headers)
    // console.log(socket.handshake.headers.userid)
  })

  io.on('connection', (socket) => {
    const { userId = '', email } = socket.user
    console.log(`User connected: ${userId}, ${email}, ${socket.id}`)
    // console.log('Rooms', rootNamespace.adapter.rooms)

    handleRoom(socket)

    // io.adapter.on('create-room', (room) => {
    //   logger.info(`room ${room} was created`)
    // })

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
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
