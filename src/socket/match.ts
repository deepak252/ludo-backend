/* eslint-disable @typescript-eslint/no-unused-vars */
import { Socket, Server } from 'socket.io'
import { MATCH_EVENT } from './socket_event.js'
import { ResponseFailure, ResponseSuccess } from '../utils/ApiResponse.js'
import { RoomService } from '../services/room_service.js'
import { MatchService } from '../services/match_service.js'
import { BoardState, MatchStatus } from '../constants/enums.js'
import {
  checkTokenKill,
  delay,
  getMovableTokens,
  getNextPlayerTurn,
  getTokenAutoMove
} from '../utils/match_util.js'
import { MatchDocument } from '../types/match.types.js'

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

  const checkPlayerTurn = (match: MatchDocument) => {
    const turn = match.turn
    if (
      !socket.user?.username ||
      match.players[turn].username !== socket.user?.username
    ) {
      throw new Error('Not allowed')
    }
  }

  socket.on(MATCH_EVENT.ROLL_DICE, async ({ roomId }, callback) => {
    try {
      const match = await checkMatchJoined(roomId)
      checkPlayerTurn(match)
      if (match.boardState !== BoardState.RollDice) {
        throw new Error('Invalid move')
      }

      io.to(roomId).emit(
        MATCH_EVENT.DICE_ROLLING,
        new ResponseSuccess('Dice rolling')
      )
      const diceValue = await MatchService.rollDice(roomId)
      match.diceValue = diceValue
      // callback?.(new ResponseSuccess('Dice rolled', { diceValue }))
      io.to(roomId).emit(MATCH_EVENT.DICE_ROLLED, { diceValue })
      const movableTokens = getMovableTokens(match)
      if (!movableTokens.length) {
        const nextPlayerTurn =
          diceValue === 6 ? match.turn : getNextPlayerTurn(match)
        const data = {
          diceValue,
          boardState: BoardState.RollDice,
          turn: nextPlayerTurn
        }
        await MatchService.updateMatch(roomId, data)
        io.to(roomId).emit(MATCH_EVENT.ROLL_DICE, data)
      } else {
        const tokenAutoMove = getTokenAutoMove(match)
        if (tokenAutoMove) {
          const { nextIndex, tokenIndex, delayInterval } = tokenAutoMove
          match.players[match.turn].tokens[tokenIndex].pathIndex = nextIndex
          await MatchService.updateMatch(roomId, {
            diceValue,
            boardState: BoardState.TokenMoving,
            players: match.players
          })

          io.to(roomId).emit(MATCH_EVENT.MOVE_TOKEN, {
            match,
            boardState: BoardState.TokenMoving,
            tokenIndex,
            pathIndex: nextIndex,
            delayInterval
          })
          await delay(delayInterval)

          const killedTokens = checkTokenKill(match, nextIndex)
          if (killedTokens.length) {
            killedTokens.forEach((killedToken) => {
              const { token, player } = killedToken
              match.players[player].tokens[token.index].pathIndex = -1
            })
            await MatchService.updateMatch(roomId, {
              diceValue,
              boardState: BoardState.RollDice,
              players: match.players
            })
            io.to(roomId).emit(MATCH_EVENT.KILL_TOKEN, {
              match,
              killedTokens
            })
          }
          io.to(roomId).emit(MATCH_EVENT.ROLL_DICE, {
            diceValue,
            boardState: BoardState.RollDice
          })
        } else {
          await MatchService.updateMatch(roomId, {
            diceValue,
            boardState: BoardState.PickToken
          })
          io.to(roomId).emit(MATCH_EVENT.PICK_TOKEN, {
            match,
            movableTokens
          })
        }
      }
    } catch (e: any) {
      console.error('Error: throwDice', e)
      return callback?.(new ResponseFailure(e.message))
    }
  })
}

// export const handleMatch = (io: Server, socket: Socket) => {
//   const { username = '' } = socket.user ?? {}

//   const checkMatchJoined = async (roomId: string) => {
//     if (!Array.from(socket.rooms.values()).includes(roomId)) {
//       throw new Error('Invalid room id')
//     }
//     const match = await RoomService.getRoom(roomId)
//     if (!match) {
//       throw new Error('Match not found')
//     }
//     if (
//       match.status === MatchStatus.Completed ||
//       match.status === MatchStatus.Cancelled
//     ) {
//       throw new Error('Match has ended')
//     }
//     return match
//   }

//   const checkPlayerTurn = (match: MatchDocument) => {
//     const turn = match.turn
//     if (
//       !socket.user?.username ||
//       match.players[turn].username !== socket.user?.username
//     ) {
//       throw new Error('Not allowed')
//     }
//   }

//   socket.on(MATCH_EVENT.ROLL_DICE, async ({ roomId }, callback) => {
//     try {
//       const match = await checkMatchJoined(roomId)
//       checkPlayerTurn(match)
//       if (match.boardState !== BoardState.RollDice) {
//         throw new Error('Invalid move')
//       }

//       io.to(roomId).emit(
//         MATCH_EVENT.DICE_ROLLING,
//         new ResponseSuccess('Dice rolling')
//       )
//       const diceValue = await MatchService.rollDice(roomId)
//       match.diceValue = diceValue
//       // callback?.(new ResponseSuccess('Dice rolled', { diceValue }))
//       io.to(roomId).emit(MATCH_EVENT.DICE_ROLLED, { diceValue })
//       const movableTokens = getMovableTokens(match)
//       if (!movableTokens.length) {
//         const nextPlayerTurn =
//           diceValue === 6 ? match.turn : getNextPlayerTurn(match)
//         const data = {
//           diceValue,
//           boardState: BoardState.RollDice,
//           turn: nextPlayerTurn
//         }
//         await MatchService.updateMatch(roomId, data)
//         io.to(roomId).emit(MATCH_EVENT.ROLL_DICE, data)
//       } else {
//         const tokenAutoMove = getTokenAutoMove(match)
//         if (tokenAutoMove) {
//           const { nextIndex, tokenIndex, delayInterval } = tokenAutoMove
//           match.players[match.turn].tokens[tokenIndex].pathIndex = nextIndex
//           await MatchService.updateMatch(roomId, {
//             diceValue,
//             boardState: BoardState.TokenMoving,
//             players: match.players
//           })

//           io.to(roomId).emit(MATCH_EVENT.MOVE_TOKEN, {
//             match,
//             boardState: BoardState.TokenMoving,
//             tokenIndex,
//             pathIndex: nextIndex,
//             delayInterval
//           })
//           await delay(delayInterval)

//           const killedTokens = checkTokenKill(match, nextIndex)
//           if (killedTokens.length) {
//             killedTokens.forEach((killedToken) => {
//               const { token, player } = killedToken
//               match.players[player].tokens[token.index].pathIndex = -1
//             })
//             await MatchService.updateMatch(roomId, {
//               diceValue,
//               boardState: BoardState.RollDice,
//               players: match.players
//             })
//             io.to(roomId).emit(MATCH_EVENT.KILL_TOKEN, {
//               match,
//               killedTokens
//             })
//           }
//           io.to(roomId).emit(MATCH_EVENT.ROLL_DICE, {
//             diceValue,
//             boardState: BoardState.RollDice
//           })
//         } else {
//           await MatchService.updateMatch(roomId, {
//             diceValue,
//             boardState: BoardState.PickToken
//           })
//           io.to(roomId).emit(MATCH_EVENT.PICK_TOKEN, {
//             match,
//             movableTokens
//           })
//         }
//       }
//     } catch (e: any) {
//       console.error('Error: throwDice', e)
//       return callback?.(new ResponseFailure(e.message))
//     }
//   })
// }
