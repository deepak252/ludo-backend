import { Types } from 'mongoose'
import { redisClient } from '../config/redis.js'
import { LudoState, MatchStatus } from '../constants/enums.js'
import Match from '../models/match_model.js'
// import { MatchState } from '../types/match.types.js'
import {
  createNewMatch,
  delay,
  getRandomDiceNumber
} from '../utils/match_util.js'
import { generateUID } from '../utils/uuid_util.js'
import { MatchDocument, PlayerColor } from '../types/match.types.js'
import { UserService } from './user_service.js'
import { strToMongoId } from '../utils/mongo_util.js'
import { PLAYER_TYPES } from '../constants/index.js'
import { ApiError } from '../utils/ApiError.js'
export class MatchService {
  static async createMatch(userId: Types.ObjectId, maxPlayersCount: number) {
    const currRoom = await MatchService.getUserActiveMatch(userId.toString())
    if (currRoom) {
      throw new ApiError(`Already in a match - ${currRoom.roomId}`)
    }
    const roomId = generateUID()

    let match = new Match(createNewMatch({ roomId, userId, maxPlayersCount }))
    const error = match.validateSync()
    if (error) {
      throw new ApiError(error.message)
    }
    match = await match.save()
    await redisClient.hset(`room:${roomId}`, match)
    await UserService.setUserRoomId(userId.toString(), match.roomId)
    return match
  }

  static async joinMatch(userId: Types.ObjectId, roomId: string) {
    if (!roomId) {
      throw new ApiError('RoomId is required')
    }
    const match = await this.getMatch(roomId)
    if (
      !match ||
      [MatchStatus.Completed, MatchStatus.Cancelled].includes(match.status)
    ) {
      throw new ApiError('Unable to join match')
    }
    const ongoingMatch = await this.getUserActiveMatch(userId.toString())
    if (ongoingMatch) {
      if (ongoingMatch?.roomId !== roomId) {
        throw new ApiError(`Already in a match: ${ongoingMatch.roomId}`)
      }
      return ongoingMatch
    }

    if (match.joinedPlayersCount >= match.maxPlayersCount) {
      throw new ApiError('Room is fully occupied')
    }

    for (const player of PLAYER_TYPES) {
      // Add user to room
      if (!match.players[player].userId) {
        match.players[player].userId = userId
        match.players[player].isPlaying = true
        match.joinedPlayersCount++
        break
      }
    }

    const result = await Match.findByRoomIdAndUpdate(match.roomId, match)
    if (!result) {
      throw new ApiError('Match not found')
    }

    await this.updateMatch(roomId, match)
    await UserService.setUserRoomId(roomId, userId.toString())
    return match
  }

  static async rollDice(roomId: string) {
    const num = getRandomDiceNumber()
    await redisClient.hset(`room:${roomId}`, {
      diceValue: num,
      ludoState: LudoState.DiceRolling
    })

    // const pipeline = redisClient.pipeline()
    // pipeline.hset(`room:${roomId}`, 'diceValue', num)
    // pipeline.hset(`room:${roomId}`, 'ludoState', LudoState.DiceRolling)
    // await pipeline.exec()
    await delay(1000)
    return num
  }

  // static async getUserMatch(userId: Types.ObjectId) {
  //   const roomId = await UserService.getUserRoomId(userId.toString())
  //   if (roomId) {
  //     return await this.getMatch(roomId)
  //   }
  // }

  static async getUserActiveMatch(userId: string) {
    let roomId = await UserService.getUserRoomId(userId)
    if (!roomId) {
      // Get user active matches from mongodb
      const matches = await Match.findActiveMatchesByUser(userId)
      roomId = matches?.[0]?.roomId
      await UserService.setUserRoomId(userId, roomId)
    }

    if (roomId) {
      const match = await this.getMatch(roomId)
      if (
        match &&
        [MatchStatus.InProgress, MatchStatus.Waiting].includes(match.status)
      ) {
        return match
      }
    }
  }

  static async getMatch(roomId: string): Promise<MatchDocument | null> {
    const cachedMatch = await redisClient.hgetall(`room:${roomId}`)
    if (!cachedMatch.roomId) {
      const match = await Match.findByRoomId(roomId)
      if (match) {
        this.updateMatch(roomId, match)
      }
      return match
    }
    return {
      roomId: cachedMatch.roomId,
      maxPlayersCount: Number(cachedMatch.maxPlayersCount),
      joinedPlayersCount: Number(cachedMatch.joinedPlayersCount),
      createdBy: strToMongoId(cachedMatch.createdBy),
      status: cachedMatch.status as MatchStatus,
      ludoState: cachedMatch.ludoState as LudoState,
      players: JSON.parse(cachedMatch.players),
      turn: cachedMatch.turn as PlayerColor,
      diceValue: Number(cachedMatch.diceValue)
    }
  }

  static async updateMatch(roomId: string, match: Partial<MatchDocument>) {
    const updatedMatch = match.players
      ? { ...match, players: JSON.stringify(match.players) }
      : { ...match }

    await redisClient.hset(`room:${roomId}`, updatedMatch)
  }
}

// export class MatchService {
//   static async rollDice(roomId: string) {
//     const num = getRandomDiceNumber()
//     await redisClient.hset(`room:${roomId}`, {
//       diceValue: num,
//       ludoState: LudoState.DiceRolling
//     })

//     // const pipeline = redisClient.pipeline()
//     // pipeline.hset(`room:${roomId}`, 'diceValue', num)
//     // pipeline.hset(`room:${roomId}`, 'ludoState', LudoState.DiceRolling)
//     // await pipeline.exec()
//     await delay(1000)
//     return num
//   }

//   static async updateMatch(roomId: string, match: Partial<MatchState>) {
//     const updatedMatch = match.players
//       ? { ...match, players: JSON.stringify(match.players) }
//       : { ...match }

//     await redisClient.hset(`room:${roomId}`, updatedMatch)
//   }
// }
