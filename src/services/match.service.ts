import { redisClient } from '@/config/redis.js'
import { LudoState, MatchStatus } from '@/enums/match.enum.js'
import { MatchState, PlayerType } from '@/types/match.types.js'
import { createNewMatch } from '@/utils/matchUtil.js'
import { generateUID } from '@/utils/uuidHelper.js'

export class MatchService {
  static async checkRoomExists(roomId: string) {
    return await redisClient.exists(`room:${roomId}`)
  }

  static async getUserRoom(username: string) {
    console.log(`user:${username}`)

    return await redisClient.hget(`user:${username}`, 'room')
  }

  static async setUserRoom(username: string, roomId: string) {
    await redisClient.hset(`user:${username}`, 'room', roomId)
  }

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

  static async setRoom(match: MatchState): Promise<MatchState> {
    await redisClient.hset(`room:${match.roomId}`, {
      ...match,
      players: JSON.stringify(match.players)
    })
    // await redisClient.hset(`room:${match.roomId}`, {
    //   ...match,
    //   players: JSON.stringify(match.players),
    //   maxPlayers: String(match.maxPlayers),
    //   diceValue: String(match.diceValue)
    // })
    return match
  }

  static async deleteRoom(match: MatchState) {
    await redisClient.del(`room:${match.roomId}`)
  }

  static async addUserToRoom(
    userId: string,
    roomId?: string,
    playerCount?: number = 4
  ) {
    if (!roomId) {
      const roomId = generateUID()
      const match = createNewMatch(playerCount, roomId, userId)
      await this.setRoom(match)
      await this.setUserRoom(userId, roomId)
      return match
    } else {
      const match = await this.getRoom(roomId)
      if (!match) {
        throw new Error('Room does not exists')
      }
      if (match.status !== MatchStatus.NotStarted) {
        throw new Error('Unable to join room')
      }
      // match.
    }
    // if (await this.checkRoomExists(roomId)) {
    //   // const users = await redisClient.hget(`room:${roomId}`)
    //   const match = await redisClient.get(`room:${roomId}`)
    // } else {
    //   const newMatch = createNewMatch(4, roomId, userId)
    //   await redisClient.hset(`room:${roomId}`, {
    //     ...newMatch,
    //     players: JSON.stringify(newMatch.players)
    //   })
    //   await this.setUserRoom(userId, roomId)
    //   return newMatch
    // }
  }
}

// export class MatchService {
//   private static ROOM_PREFIX = 'room:'
//   private static USER_PREFIX = 'room:users:'
//   private static USERS_PREFIX = 'room:users:'

//   static async checkRoomExists(roomId: string) {
//     return await redisClient.exists(`room:${roomId}`)
//   }

//   static async getUserRoom(userId: string) {
//     return await redisClient.hget(`user:${userId}`, 'room')
//   }

//   static async addUserToRoom(roomId: string, userId: string) {
//     if (await this.checkRoomExists(roomId)) {
//       const users = await redisClient.hget(`room:${roomId}`)
//     }else{
//       await redisClient.hset(`room:${roomId}`, )
//     }
//     // redisClient.hset(`room:${roomId}`, userId, {})
//     // await redisClient.hset(`room:${roomId}`, {
//     //   users: { userId }
//     // })
//     await redisClient.hset(`user:${userId}`, 'room', roomId)
//   }

//   static async removeUserFromRoom(userId: string) {
//     // redisClient.hset(`room:${roomId}`, userId, {})
//     // await redisClient.hdel(`room:${roomId}`, {
//     //   users: { userId }
//     // })
//     await redisClient.hdel(`user:${userId}`, 'room')
//   }
// }
