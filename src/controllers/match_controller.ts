import { RoomService } from '../services/room_service.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/async_handler.js'
import { createRoom } from '../utils/match_util.js'
import { generateUID } from '../utils/uuid_util.js'

export const createMatch = asyncHandler(async (req, _) => {
  const { maxPlayersCount } = req.body
  if (isNaN(maxPlayersCount) || maxPlayersCount > 4 || maxPlayersCount < 2) {
    throw new ApiError(`Invalid maxPlayers value - ${maxPlayersCount}`)
  }
  const username = req.session.user?.username ?? ''

  const currRoom = await RoomService.getUserRoom(username)
  if (currRoom) {
    throw new ApiError(`Already in a match - ${currRoom}`)
  }
  const roomId = generateUID()

  /// TODO: Create room in the database
  await RoomService.setRoom(
    createRoom({
      roomId,
      username,
      maxPlayersCount
    })
  )
  return new ApiResponse('Match created successfully', { roomId }, 201)
  // await RoomService.setRoom({
  //   roomId,
  //   maxPlayersCount,
  //   joinedPlayersCount: 1,
  //   createdBy: username,
  //   diceValue: 0,
  //   players: {
  //     green: { username, tokens: [], isPlaying: false },
  //     yellow: { tokens: [], isPlaying: false },
  //     blue: { tokens: [], isPlaying: false },
  //     red: { tokens: [], isPlaying: false }
  //   },
  //   status: MatchStatus.NotStarted,
  //   turn: 'green',
  //   ludoState: LudoState.throwDice
  // })

  // id: string
  // index: number
  // color: LudoColor
  // pathIndex: number
  // position: Position
  // highlight?: boolean

  // for (const playerType of playerTypes) {
  //   state.players[playerType].isActive = true
  //   for (let i = 0; i < 4; i++) {
  //     state.players[playerType].tokens.push({
  //       id: `${playerType}_${i}`,
  //       index: i,
  //       color: playerType,
  //       pathIndex: -1,
  //       position: BoardConstants.HOME[playerType][i],
  //     })
  //   }
  // }
  // return new ApiResponse('Match created successfully', { roomId }, 201)
})

export const deleteMatch = asyncHandler(async (req, _) => {
  const { roomId } = req.body
  if (!roomId) {
    throw new ApiError('Field roomId is required')
  }
  const username = req.session.user?.username ?? ''
  const currRoom = await RoomService.getRoom(roomId)
  if (!currRoom) {
    throw new ApiError('Match not found')
  }
  if (currRoom?.createdBy !== username) {
    throw new ApiError("Can't delete match")
  }
  await RoomService.deleteRoom(currRoom)

  return new ApiResponse('Match deleted successfully', { roomId }, 201)
})
