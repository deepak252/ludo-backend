import { Socket } from 'socket.io'
import { ROOM_EVENT } from './socket.event.js'
import { generateUID } from '@/utils/uuidHelper.js'
import { ApiResponse } from '@/utils/ApiResponse.js'
import { MatchService } from '@/services/matchService.js'

export const handleRoom = (socket: Socket) => {
  const { userId = '' } = socket.user

  socket.on(ROOM_EVENT.CREATE_ROOM, async (_, callback) => {
    try {
      if (await MatchService.getUserRoom(userId)) {
        return callback?.(
          new ApiResponse('Already in a room', { roomId: socket.rooms }, 400)
        )
      }
      const roomId = generateUID()
      await MatchService.addUserToRoom(roomId, userId)
      socket.join(roomId)
      callback?.(new ApiResponse('success', { roomId }))
    } catch (e) {
      console.error('Error: JoinRoom', e)
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
