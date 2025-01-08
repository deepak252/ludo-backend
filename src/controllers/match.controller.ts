import { LudoState, MatchStatus } from '../enums/match.enum.js'
import { RoomService } from '../services/room.service.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { generateUID } from '../utils/uuidHelper.js'

export const createMatch = asyncHandler(async (req, _) => {
  const { maxPlayers } = req.body
  if (isNaN(maxPlayers) || maxPlayers > 4 || maxPlayers < 2) {
    throw new ApiError(`Invalid maxPlayers value - ${maxPlayers}`)
  }
  const username = req.session.user?.username ?? ''

  const currRoom = await RoomService.getUserRoom(username)
  if (currRoom) {
    throw new ApiError(`Already in a match - ${currRoom}`)
  }
  const roomId = generateUID()

  /// TODO: Create room in the database
  await RoomService.setRoom({
    roomId,
    maxPlayers,
    createdBy: username,
    diceValue: 0,
    players: {
      green: { username, tokens: [], isJoined: false, isOnline: false },
      yellow: { tokens: [], isJoined: false, isOnline: false },
      blue: { tokens: [], isJoined: false, isOnline: false },
      red: { tokens: [], isJoined: false, isOnline: false }
    },
    status: MatchStatus.NotStarted,
    turn: 'green',
    ludoState: LudoState.throwDice
  })
  return new ApiResponse('Match created successfully', { roomId }, 201)
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
