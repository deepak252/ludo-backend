/* eslint-disable @typescript-eslint/no-unused-vars */
import { Socket, Server } from 'socket.io'
import { MATCH_EVENT } from './socket.event.js'
import { ResponseFailure, ResponseSuccess } from '../utils/ApiResponse.js'
import { RoomService } from '../services/room.service.js'
import { MatchService } from '../services/match.service.js'
import { LudoState, MatchStatus } from '../enums/match.enum.js'
import { getMovableTokens } from '../utils/matchUtil.js'

export const handleMatch = (io: Server, socket: Socket) => {
  const { username = '' } = socket.user ?? {}

  const checkMatchJoined = async (roomId: string) => {
    if (!Array.from(socket.rooms.values()).includes(roomId)) {
      throw new Error('Invalid room id')
    }
    const match = await RoomService.getRoom(roomId)
    if (!match) {
      throw new Error('Match not found')
    }
    if (
      match.status === MatchStatus.Completed ||
      match.status === MatchStatus.Cancelled
    ) {
      throw new Error('Match has ended')
    }
    return match
  }

  socket.on(MATCH_EVENT.ROLL_DICE, async ({ roomId }, callback) => {
    try {
      const match = await checkMatchJoined(roomId)
      if (match.ludoState !== LudoState.RollDice) {
        throw new Error('Invalid move')
      }

      io.to(roomId).emit(
        MATCH_EVENT.DICE_ROLLING,
        new ResponseSuccess('Dice rolling')
      )
      const diceValue = await MatchService.rollDice(roomId)
      callback?.(new ResponseSuccess('Dice rolled', { diceValue }))
      // io.to(roomId).emit(MATCH_EVENT.DICE_ROLLED, { diceValue })
      match.diceValue = diceValue
      const movableTokens = getMovableTokens(match)
      if (!movableTokens.length) {
        // yield put(
        //   throwDiceSuccess({
        //     diceValue,
        //     status: LudoStatus.throwDice,
        //     isNextPlayerTurn: diceValue !== 6,
        //   })
        // )
        // return
      }
    } catch (e: any) {
      console.error('Error: throwDice', e)
      return callback?.(new ResponseFailure(e.message))
    }
  })
}
