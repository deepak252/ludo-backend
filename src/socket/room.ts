import { Socket } from 'socket.io'
import { ROOM_EVENT } from './socket.event.js'
import { ResponseFailure, ResponseSuccess } from '../utils/ApiResponse.js'
import { RoomService } from '../services/room.service.js'

export const handleRoom = (socket: Socket) => {
  const { username = '' } = socket.user ?? {}

  socket.on(ROOM_EVENT.JOIN_ROOM, async ({ roomId }, callback) => {
    try {
      if (!roomId) {
        throw new Error('RoomId is required')
      }
      const currRoom = await RoomService.getUserRoom(username)
      if (currRoom && currRoom.roomId !== roomId) {
        throw new Error(`Already in a room: ${currRoom.roomId}`)
      }
      const room = await RoomService.joinRoom(username, roomId)
      await socket.join(roomId)
      callback?.(new ResponseSuccess('Room joined successfully', { room }))
    } catch (e: any) {
      console.error('Error: JoinRoom', e)
      return callback?.(new ResponseFailure(e.message))
    }
  })

  socket.on(ROOM_EVENT.JOIN_RANDOM, async (_, callback) => {
    try {
      //TODO: Implement
    } catch (e: any) {
      console.error('Error: JoinRandom', e)
      return callback?.(new ResponseFailure(e.message))
    }
  })

  socket.on(ROOM_EVENT.LEAVE_ROOM, async ({ roomId }, callback) => {
    try {
      if (!roomId) {
        throw new Error('RoomId is required')
      }
      //TODO: Implement
    } catch (e: any) {
      console.error('Error: LeaveRoom', e)
      return callback?.(new ResponseFailure(e.message))
    }
  })
}
