import { Socket } from 'socket.io'
import { ROOM_EVENT } from './socket.event.js'
import { ResponseFailure, ResponseSuccess } from '../utils/ApiResponse.js'
import { RoomService } from '../services/room.service.js'

export const handleRoom = (socket: Socket) => {
  const { username = '' } = socket.user ?? {}

  // socket.on(ROOM_EVENT.CREATE_ROOM, async (_, callback) => {
  //   try {
  //     if (await MatchService.getUserRoom(userId)) {
  //       return callback?.(
  //         new ApiResponse('Already in a room', { roomId: socket.rooms }, 400)
  //       )
  //     }
  //     const roomId = generateUID()
  //     await MatchService.addUserToRoom(roomId, userId)
  //     socket.join(roomId)
  //     callback?.(new ApiResponse('success', { roomId }))
  //   } catch (e) {
  //     console.error('Error: JoinRoom', e)
  //   }
  // })
  socket.on(ROOM_EVENT.JOIN_ROOM, async ({ roomId }, callback) => {
    try {
      if (!roomId) {
        throw new Error('RoomId is required')
      }
      const currRoom = await RoomService.getUserRoom(username)
      if (currRoom && currRoom.status) {
        throw new Error(`Already in a room: ${currRoom?.roomId}`)
      }
      await RoomService.joinRoom(username, roomId)
      socket.join(roomId)
      callback?.(new ResponseSuccess('success', { roomId }))
    } catch (e: any) {
      console.error('Error: JoinRoom', e)
      return callback?.(new ResponseFailure(e.message))
    }
  })
}

// export const handleRoom = (socket: Socket) => {
//   const { userId = '' } = socket.user

//   socket.on(ROOM_EVENT.JOIN_ROOM, async ({roomId}, callback) => {
//     try {
//       if (await MatchService.getUserRoom(userId)) {
//         return callback?.(
//           new ApiResponse('Already in a room', { roomId: socket.rooms }, 400)
//         )
//       }
//       const roomId = generateUID()
//       await MatchService.addUserToRoom(roomId, userId)
//       socket.join(roomId)
//       callback?.(new ApiResponse('success', { roomId }))
//     } catch (e) {
//       console.error('Error: JoinRoom', e)
//     }
//   })

//   socket.on(ROOM_EVENT.CREATE_ROOM, async (_, callback) => {
//     try {
//       if (await MatchService.getUserRoom(userId)) {
//         return callback?.(
//           new ApiResponse('Already in a room', { roomId: socket.rooms }, 400)
//         )
//       }
//       const roomId = generateUID()
//       await MatchService.addUserToRoom(roomId, userId)
//       socket.join(roomId)
//       callback?.(new ApiResponse('success', { roomId }))
//     } catch (e) {
//       console.error('Error: JoinRoom', e)
//     }
//   })

//   socket.on(ROOM_EVENT.LEAVE_ROOM, async (_, callback) => {
//     try {
//       if (await MatchService.getUserRoom(userId)) {
//         return callback(
//           new ApiResponse('Already in a room', { roomId: socket.rooms }, 400)
//         )
//       }
//       const roomId = generateUID()
//       await MatchService.addUserToRoom(roomId, userId)
//       socket.join(roomId)
//       callback(new ApiResponse('success', { roomId }))
//     } catch (e) {
//       console.error('Error: JoinRoom', e)
//     }
//   })
// }
