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
import { MatchDocument } from '../types/match.types.js'
import { BoardState } from '../constants/enums.js'
import {
  checkTokenKill,
  delay,
  getMovableTokens,
  getNextPlayerTurn,
  getRandomDiceNumber,
  getTokenAutoMove
} from '../utils/match_util.js'
import BoardConstants from '../constants/boardConstants.js'

export const setupSocket = (httpServer: any) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
      },
      pingInterval: 300000,
      pingTimeout: 300000
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

    const checkMatchJoined = async (roomId: string) => {
      if (!userId) {
        throw new Error('User not found')
      }
      if (!Array.from(socket.rooms.values()).includes(roomId)) {
        throw new Error('Invalid room id')
      }
      const match = await MatchService.getUserActiveMatch(userId)
      if (!match) {
        throw new Error('Match not found')
      }
      return match
    }

    const checkPlayerTurn = (match: MatchDocument) => {
      const turn = match.turn
      if (
        !socket.user?.username ||
        match.players[turn].userId !== socket.user?._id?.toString()
      ) {
        throw new Error('Not allowed')
      }
    }

    const handleMatchStateChange = async (
      roomId: string,
      matchState: Partial<MatchDocument>
    ) => {
      await MatchService.updateMatch(roomId, matchState)
      io.to(roomId).emit('matchStateChange', matchState)
    }

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
        socket.emit('ongoingMatch', match)
        callback?.(new ResponseSuccess('Match created successfully', match))
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
        callback?.(new ResponseSuccess('Room joined successfully', match))
      } catch (e: any) {
        console.error('Error: JoinRoom', e)
        return callback?.(new ResponseFailure(e.message))
      }
    })

    socket.on('ongoingMatch', async () => {
      console.log('ongoingMatch: ', socket.id)
      if (!userId) return
      const match = await MatchService.getUserActiveMatch(userId)
      if (!match) return
      socket.emit('ongoingMatch', match)
      // return new ApiResponse('Fetched successfully', match)
    })

    socket.on('rollDice', async ({ roomId }, callback) => {
      try {
        const match = await checkMatchJoined(roomId)
        checkPlayerTurn(match)
        if (match.boardState !== BoardState.RollDice) {
          throw new Error('Invalid move')
        }
        await handleMatchStateChange(roomId, {
          boardState: BoardState.DiceRolling
        })
        const diceValue = getRandomDiceNumber()
        await delay(BoardConstants.DICE_DELAY)
        await handleMatchStateChange(roomId, {
          boardState: BoardState.TokenMoving,
          diceValue
        })

        match.diceValue = diceValue
        match.boardState = BoardState.TokenMoving

        const movableTokens = getMovableTokens(match)
        if (movableTokens.length) {
          const tokenAutoMove = getTokenAutoMove(match)
          if (tokenAutoMove) {
            const { nextIndex, tokenIndex, delayInterval } = tokenAutoMove
            match.players[match.turn].tokens[tokenIndex].pathIndex = nextIndex
            match.boardState = BoardState.TokenMoving
            await MatchService.updateMatch(roomId, {
              boardState: BoardState.TokenMoving,
              players: match.players
            })

            io.to(roomId).emit('tokenMoved', {
              boardState: BoardState.TokenMoving,
              move: tokenAutoMove
            })
            await delay(delayInterval)

            const killedTokens = checkTokenKill(match, nextIndex)
            if (killedTokens.length) {
              killedTokens.forEach((killedToken) => {
                const { token, player } = killedToken
                match.players[player].tokens[token.index].pathIndex = -1
              })
              await MatchService.updateMatch(roomId, {
                players: match.players
              })
              io.to(roomId).emit('tokenKilled', {
                killedTokens
              })
            }
          } else {
            await MatchService.updateMatch(roomId, {
              boardState: BoardState.PickToken
            })
            io.to(roomId).emit('pickToken', {
              movableTokens
            })
            return
          }
        }
        const nextPlayerTurn =
          diceValue === 6 ? match.turn : getNextPlayerTurn(match)
        await handleMatchStateChange(roomId, {
          boardState: BoardState.RollDice,
          turn: nextPlayerTurn
        })
      } catch (e: any) {
        console.error('Error: rollDice', e)
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

// socket.on('rollDice', async ({ roomId }, callback) => {
//   try {
//     const match = await checkMatchJoined(roomId)
//     checkPlayerTurn(match)
//     if (match.boardState !== BoardState.RollDice) {
//       throw new Error('Invalid move')
//     }
//     // io.to(roomId).emit('diceRolling', 'true')
//     await handleMatchStateChange(roomId, {
//       boardState: BoardState.DiceRolling
//     })
//     const diceValue = getRandomDiceNumber()
//     await delay(1000)
//     // const diceValue = await MatchService.rollDice(roomId)
//     // io.to(roomId).emit('diceRolled', { diceValue })
//     await handleMatchStateChange(roomId, {
//       boardState: BoardState.PickToken,
//       diceValue
//     })

//     match.diceValue = diceValue
//     match.boardState = BoardState.PickToken

//     const movableTokens = getMovableTokens(match)
//     if (!movableTokens.length) {
//       const nextPlayerTurn =
//         diceValue === 6 ? match.turn : getNextPlayerTurn(match)
//       await handleMatchStateChange(roomId, {
//         boardState: BoardState.RollDice,
//         turn: nextPlayerTurn
//       })
//       // const data = {
//       //   // diceValue,
//       //   boardState: BoardState.RollDice,
//       //   turn: nextPlayerTurn
//       // }
//       // await MatchService.updateMatch(roomId, data)
//       // // io.to(roomId).emit('rollDice', data)
//       // io.to(roomId).emit('nextPlayerTurn', data)
//     } else {
//       const tokenAutoMove = getTokenAutoMove(match)
//       if (tokenAutoMove) {
//         const { nextIndex, tokenIndex, delayInterval } = tokenAutoMove
//         match.players[match.turn].tokens[tokenIndex].pathIndex = nextIndex
//         await MatchService.updateMatch(roomId, {
//           // diceValue,
//           boardState: BoardState.TokenMoving,
//           players: match.players
//         })

//         io.to(roomId).emit('moveToken', {
//           // match,
//           boardState: BoardState.TokenMoving,
//           tokenIndex,
//           pathIndex: nextIndex,
//           delayInterval
//         })
//         await delay(delayInterval)

//         const killedTokens = checkTokenKill(match, nextIndex)
//         if (killedTokens.length) {
//           killedTokens.forEach((killedToken) => {
//             const { token, player } = killedToken
//             match.players[player].tokens[token.index].pathIndex = -1
//           })
//           await MatchService.updateMatch(roomId, {
//             diceValue,
//             boardState: BoardState.RollDice,
//             players: match.players
//           })
//           io.to(roomId).emit('killToken', {
//             match,
//             killedTokens
//           })
//         }
//         io.to(roomId).emit('nextPlayerTurn', {
//           // diceValue,
//           boardState: BoardState.RollDice,
//           turn: match.turn
//         })
//       } else {
//         await MatchService.updateMatch(roomId, {
//           diceValue,
//           boardState: BoardState.PickToken
//         })
//         io.to(roomId).emit('pickToken', {
//           match,
//           movableTokens
//         })
//       }
//     }
//   } catch (e: any) {
//     console.error('Error: rollDice', e)
//     return callback?.(new ResponseFailure(e.message))
//   }
// })
