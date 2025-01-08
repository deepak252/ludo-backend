import { redisClient } from '../config/redis.js'
import { PlayerTypes } from '../constants/index.js'
import { LudoState, MatchStatus } from '../enums/match.enum.js'
import { MatchState, PlayerType } from '../types/match.types.js'

export class RoomService {
  static async checkRoomExists(roomId: string) {
    return await redisClient.exists(`room:${roomId}`)
  }

  static async getUserRoom(username: string) {
    return await redisClient.hget(`user:${username}`, 'room')
  }

  // static async setUserRoom(username: string, roomId: string) {
  //   await redisClient.hset(`user:${username}`, 'room', roomId)
  // }
  // static async deleteUserRoom(username?: string | null) {
  //   if (!username) return
  //   await redisClient.hdel(`user:${username}`, 'room')
  // }

  static async getRoom(roomId: string): Promise<MatchState | null> {
    const res = await redisClient.hgetall(`room:${roomId}`)
    if (!res.roomId) {
      return null
    }
    return {
      roomId: res.roomId,
      maxPlayers: Number(res.maxPlayers),
      createdBy: res.createdBy,
      status: res.status as MatchStatus,
      players: JSON.parse(res.players),
      turn: res.turn as PlayerType,
      diceValue: Number(res.diceValue), // Parse JSON string
      ludoState: res.ludoState ? (res.ludoState as LudoState) : undefined
    }
  }

  static async setRoom(room: MatchState): Promise<MatchState> {
    const pipeline = redisClient.pipeline()
    pipeline.hset(`room:${room.roomId}`, {
      ...room,
      players: JSON.stringify(room.players)
    })
    pipeline.hset(`user:${room.players.green.username}`, 'room', room.roomId)
    try {
      await pipeline.exec()
    } catch (error) {
      console.error(`Failed to create room ${room.roomId}:`, error)
      throw new Error(`Failed to create room ${room.roomId}`)
    }
    return room
  }

  static async deleteRoom(room: MatchState) {
    const pipeline = redisClient.pipeline()
    pipeline.del(`room:${room.roomId}`)
    for (const player of PlayerTypes) {
      if (room.players?.[player]?.username) {
        pipeline.hdel(`user:${room.players?.[player].username}`, 'room')
      }
    }
    try {
      await pipeline.exec()
    } catch (error) {
      console.error(`Failed to delete room ${room.roomId}:`, error)
      throw new Error(`Failed to delete room ${room.roomId}`)
    }
  }

  static async joinRoom(username: string, roomId: string) {
    const rooom = await this.getRoom(roomId)
    if (!rooom) {
      throw new Error('Room does not exists')
    }
    if (
      rooom.status === MatchStatus.Completed ||
      rooom.status === MatchStatus.Cancelled
    ) {
      throw new Error('Unable to join room')
    }
  }

  // static async addUserToRoom(
  //   userId: string,
  //   roomId?: string,
  //   playerCount: number = 4
  // ) {
  //   if (!roomId) {
  //     const roomId = generateUID()
  //     const match = createNewMatch(playerCount, roomId, userId)
  //     await this.setRoom(match)
  //     await this.setUserRoom(userId, roomId)
  //     return match
  //   } else {
  //     const match = await this.getRoom(roomId)
  //     if (!match) {
  //       throw new Error('Room does not exists')
  //     }
  //     if (match.status !== MatchStatus.NotStarted) {
  //       throw new Error('Unable to join room')
  //     }
  //     // match.
  //   }
  //   // if (await this.checkRoomExists(roomId)) {
  //   //   // const users = await redisClient.hget(`room:${roomId}`)
  //   //   const match = await redisClient.get(`room:${roomId}`)
  //   // } else {
  //   //   const newMatch = createNewMatch(4, roomId, userId)
  //   //   await redisClient.hset(`room:${roomId}`, {
  //   //     ...newMatch,
  //   //     players: JSON.stringify(newMatch.players)
  //   //   })
  //   //   await this.setUserRoom(userId, roomId)
  //   //   return newMatch
  //   // }
  // }
}
