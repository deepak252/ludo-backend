/* eslint-disable @typescript-eslint/no-unused-vars */
import { Socket, Server } from 'socket.io'
import { MATCH_EVENT } from './socket.event.js'
import { ResponseFailure, ResponseSuccess } from '../utils/ApiResponse.js'
import { RoomService } from '../services/room.service.js'

export const handleMatch = (io: Server, socket: Socket) => {
  const { username = '' } = socket.user ?? {}

  socket.on(MATCH_EVENT.THROW_DICE, async ({ roomId }, callback) => {
    try {
      // TODO: Implement
    } catch (e: any) {
      console.error('Error: throwDice', e)
      return callback?.(new ResponseFailure(e.message))
    }
  })
}
