import { Server } from 'socket.io'
import { MATCH_EVENTS } from './match.event.js'
import logger from '@/utils/logger.js'
import { generateUID } from '@/utils/uuidHelper.js'
import { ApiResponse } from '@/utils/ApiResponse.js'
// import { matchHandler } from './match.handler.js'

export const connectMatch = (io: Server) => {
  const matchNamespace = io.of('/match')

  matchNamespace.on('connection', (socket) => {
    logger.info(`Player connected: ${socket.id}`)

    // const isRoomJoined = () => {
    //   const joinedRoomCount =
    //     matchNamespace.adapter.sids.get(socket.id)?.size ?? 0
    //   return joinedRoomCount > 1
    // }

    // const isRoomExists = (roomId: string) => {
    //   return matchNamespace.adapter.rooms.has(roomId)
    // }

    socket.on(MATCH_EVENTS.CREATE_ROOM, (_, callback) => {
      logger.info(JSON.stringify(matchNamespace.adapter.sids))
      logger.info(matchNamespace.adapter.sids.has(socket.id))
      logger.info(matchNamespace.adapter.sids.entries())
      logger.info(matchNamespace.adapter.sids.get(socket.id)?.size)
      logger.info(socket.rooms)
      // TODO: Check if user is not present in any room
      if (isRoomJoined()) {
        return callback(
          new ApiResponse('Already in a room', { roomId: socket.rooms }, 400)
        )
      }
      const roomId = generateUID()
      socket.join(roomId)
      callback(new ApiResponse('success', { roomId }))
    })

    socket.on(MATCH_EVENTS.JOIN_ROOM, ({ roomId } = {}, callback) => {
      logger.info(JSON.stringify(matchNamespace.adapter.sids))
      logger.info(matchNamespace.adapter.sids.has(socket.id))
      logger.info(matchNamespace.adapter.sids.entries())
      logger.info(matchNamespace.adapter.sids.get(socket.id)?.size)
      logger.info(socket.rooms)
      if (!isRoomExists(roomId)) {
        return callback(
          new ApiResponse('Room does not exists', { roomId }, 400)
        )
      }
      if (isRoomJoined()) {
        return callback(
          new ApiResponse('Already in a room', { roomId: socket.rooms }, 400)
        )
      }
      socket.join(roomId)
      callback(new ApiResponse('Room joined successfully', { roomId }))
    })

    matchNamespace.adapter.on('create-room', (room) => {
      logger.info(`room ${room} was created`)
    })
    matchNamespace.adapter.on('delete-room', (room) => {
      logger.info(`room ${room} was deleted`)
    })
    matchNamespace.adapter.on('join-room', (room, id) => {
      logger.info(`socket ${id} has joined room ${room}`)
    })
    matchNamespace.adapter.on('leave-room', (room, id) => {
      logger.info(`socket ${id} has left room ${room}`)
    })

    socket.on('disconnect', () => {
      logger.info(`Player disconnected: ${socket.id}`)
    })
  })
}
