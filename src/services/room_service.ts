// import { redisClient } from '../config/redis.js'
// import { PLAYER_TYPES } from '../constants/index.js'
// import { BoardState, MatchStatus } from '../constants/enums.js'
// import { PlayerColor } from '../types/match.types.js'

// export class RoomService {
//   static async checkRoomExists(roomId: string) {
//     return await redisClient.exists(`room:${roomId}`)
//   }

//   static async getUserRoom(username: string) {
//     const roomId = await redisClient.hget(`user:${username}`, 'room')
//     if (roomId) {
//       return await this.getRoom(roomId)
//     }
//   }

//   // static async setUserRoom(username: string, roomId: string) {
//   //   await redisClient.hset(`user:${username}`, 'room', roomId)
//   // }
//   // static async deleteUserRoom(username?: string | null) {
//   //   if (!username) return
//   //   await redisClient.hdel(`user:${username}`, 'room')
//   // }

//   static async getRoom(roomId: string): Promise<MatchState | null> {
//     const res = await redisClient.hgetall(`room:${roomId}`)
//     if (!res.roomId) {
//       return null
//     }
//     return {
//       roomId: res.roomId,
//       maxPlayersCount: Number(res.maxPlayersCount),
//       joinedPlayersCount: Number(res.joinedPlayersCount),
//       createdBy: res.createdBy,
//       status: res.status as MatchStatus,
//       players: JSON.parse(res.players),
//       turn: res.turn as PlayerColor,
//       diceValue: Number(res.diceValue), // Parse JSON string
//       boardState: res.boardState ? (res.boardState as BoardState) : undefined
//     }
//   }

//   static async setRoom(
//     room: MatchState,
//     username?: string
//   ): Promise<MatchState> {
//     const pipeline = redisClient.pipeline()
//     pipeline.hset(`room:${room.roomId}`, {
//       ...room,
//       players: JSON.stringify(room.players)
//     })
//     if (username) {
//       pipeline.hset(`user:${username}`, 'room', room.roomId)
//     }
//     try {
//       await pipeline.exec()
//     } catch (error) {
//       console.error(`Failed to create room ${room.roomId}:`, error)
//       throw new Error(`Failed to create room ${room.roomId}`)
//     }
//     return room
//   }

//   static async deleteRoom(room: MatchState) {
//     const pipeline = redisClient.pipeline()
//     pipeline.del(`room:${room.roomId}`)
//     for (const player of PLAYER_TYPES) {
//       if (room.players?.[player]?.username) {
//         pipeline.hdel(`user:${room.players?.[player].username}`, 'room')
//       }
//     }
//     try {
//       await pipeline.exec()
//     } catch (error) {
//       console.error(`Failed to delete room ${room.roomId}:`, error)
//       throw new Error(`Failed to delete room ${room.roomId}`)
//     }
//   }

//   static async joinRoom(username: string, roomId: string) {
//     const room = await this.getRoom(roomId)
//     if (!room) {
//       throw new Error('Room does not exists')
//     }
//     if (
//       room.status === MatchStatus.Completed ||
//       room.status === MatchStatus.Cancelled
//     ) {
//       throw new Error('Unable to join room')
//     }
//     let isJoined = false
//     for (const player of PLAYER_TYPES) {
//       // If user is already present in this room, set isPlaying
//       if (room.players[player].username === username) {
//         room.players[player].isPlaying = true
//         isJoined = true
//       }
//     }

//     if (!isJoined) {
//       if (room.joinedPlayersCount >= room.maxPlayersCount) {
//         throw new Error('Room is fully occupied')
//       }
//       for (const player of PLAYER_TYPES) {
//         // Add user to room
//         if (!room.players[player].username) {
//           room.players[player].username = username
//           room.players[player].isPlaying = true
//           room.joinedPlayersCount++
//           isJoined = true
//           break
//         }
//       }
//     }

//     if (isJoined) {
//       await this.setRoom(room, username)
//       return room
//     }
//   }
// }

// // export class RoomService {
// //   static async checkRoomExists(roomId: string) {
// //     return await redisClient.exists(`room:${roomId}`)
// //   }

// //   static async getUserRoom(username: string) {
// //     const roomId = await redisClient.hget(`user:${username}`, 'room')
// //     if (roomId) {
// //       return await this.getRoom(roomId)
// //     }
// //   }

// //   // static async setUserRoom(username: string, roomId: string) {
// //   //   await redisClient.hset(`user:${username}`, 'room', roomId)
// //   // }
// //   // static async deleteUserRoom(username?: string | null) {
// //   //   if (!username) return
// //   //   await redisClient.hdel(`user:${username}`, 'room')
// //   // }

// //   static async getRoom(roomId: string): Promise<MatchState | null> {
// //     const res = await redisClient.hgetall(`room:${roomId}`)
// //     if (!res.roomId) {
// //       return null
// //     }
// //     return {
// //       roomId: res.roomId,
// //       maxPlayersCount: Number(res.maxPlayersCount),
// //       joinedPlayersCount: Number(res.joinedPlayersCount),
// //       createdBy: res.createdBy,
// //       status: res.status as MatchStatus,
// //       players: JSON.parse(res.players),
// //       turn: res.turn as PlayerColor,
// //       diceValue: Number(res.diceValue), // Parse JSON string
// //       boardState: res.boardState ? (res.boardState as BoardState) : undefined
// //     }
// //   }

// //   static async setRoom(
// //     room: MatchState,
// //     username?: string
// //   ): Promise<MatchState> {
// //     const pipeline = redisClient.pipeline()
// //     pipeline.hset(`room:${room.roomId}`, {
// //       ...room,
// //       players: JSON.stringify(room.players)
// //     })
// //     if (username) {
// //       pipeline.hset(`user:${username}`, 'room', room.roomId)
// //     }
// //     try {
// //       await pipeline.exec()
// //     } catch (error) {
// //       console.error(`Failed to create room ${room.roomId}:`, error)
// //       throw new Error(`Failed to create room ${room.roomId}`)
// //     }
// //     return room
// //   }

// //   static async deleteRoom(room: MatchState) {
// //     const pipeline = redisClient.pipeline()
// //     pipeline.del(`room:${room.roomId}`)
// //     for (const player of PLAYER_TYPES) {
// //       if (room.players?.[player]?.username) {
// //         pipeline.hdel(`user:${room.players?.[player].username}`, 'room')
// //       }
// //     }
// //     try {
// //       await pipeline.exec()
// //     } catch (error) {
// //       console.error(`Failed to delete room ${room.roomId}:`, error)
// //       throw new Error(`Failed to delete room ${room.roomId}`)
// //     }
// //   }

// //   static async joinRoom(username: string, roomId: string) {
// //     const room = await this.getRoom(roomId)
// //     if (!room) {
// //       throw new Error('Room does not exists')
// //     }
// //     if (
// //       room.status === MatchStatus.Completed ||
// //       room.status === MatchStatus.Cancelled
// //     ) {
// //       throw new Error('Unable to join room')
// //     }
// //     let isJoined = false
// //     for (const player of PLAYER_TYPES) {
// //       // If user is already present in this room, set isPlaying
// //       if (room.players[player].username === username) {
// //         room.players[player].isPlaying = true
// //         isJoined = true
// //       }
// //     }

// //     if (!isJoined) {
// //       if (room.joinedPlayersCount >= room.maxPlayersCount) {
// //         throw new Error('Room is fully occupied')
// //       }
// //       for (const player of PLAYER_TYPES) {
// //         // Add user to room
// //         if (!room.players[player].username) {
// //           room.players[player].username = username
// //           room.players[player].isPlaying = true
// //           room.joinedPlayersCount++
// //           isJoined = true
// //           break
// //         }
// //       }
// //     }

// //     if (isJoined) {
// //       await this.setRoom(room, username)
// //       return room
// //     }
// //   }

// //   // static async addUserToRoom(
// //   //   userId: string,
// //   //   roomId?: string,
// //   //   playerCount: number = 4
// //   // ) {
// //   //   if (!roomId) {
// //   //     const roomId = generateUID()
// //   //     const match = createNewMatch(playerCount, roomId, userId)
// //   //     await this.setRoom(match)
// //   //     await this.setUserRoom(userId, roomId)
// //   //     return match
// //   //   } else {
// //   //     const match = await this.getRoom(roomId)
// //   //     if (!match) {
// //   //       throw new Error('Room does not exists')
// //   //     }
// //   //     if (match.status !== MatchStatus.NotStarted) {
// //   //       throw new Error('Unable to join room')
// //   //     }
// //   //     // match.
// //   //   }
// //   //   // if (await this.checkRoomExists(roomId)) {
// //   //   //   // const users = await redisClient.hget(`room:${roomId}`)
// //   //   //   const match = await redisClient.get(`room:${roomId}`)
// //   //   // } else {
// //   //   //   const newMatch = createNewMatch(4, roomId, userId)
// //   //   //   await redisClient.hset(`room:${roomId}`, {
// //   //   //     ...newMatch,
// //   //   //     players: JSON.stringify(newMatch.players)
// //   //   //   })
// //   //   //   await this.setUserRoom(userId, roomId)
// //   //   //   return newMatch
// //   //   // }
// //   // }
// // }
