import { redisClient } from '../config/redis.js'
import User from '../models/user_model.js'
// import { User } from '../types/user.types.js'
// import _ from 'lodash'

export class UserService {
  // static async getUser(username: string): Promise<User | null> {
  //   const data = await redisClient.hgetall(`user:${username}`)
  //   if (!_.isEmpty(data)) {
  //     return {
  //       username: data['username']
  //     }
  //   }
  //   return null
  // }
  // static async createUser(username: string): Promise<User> {
  //   const user = await this.getUser(username)
  //   if (user) {
  //     throw new Error('User already exists')
  //   }
  //   await redisClient.hset(`user:${username}`, { username })
  //   return { username }
  // }

  static async getUserRoomId(userId: string) {
    const roomId = await redisClient.hget(`user:${userId}`, 'room')
    if (roomId) {
      return roomId
    }
  }
  static async setUserRoomId(userId: string, roomId: string) {
    await redisClient.hset(`user:${userId}`, 'room', roomId)
  }

  static async getUserSocketId(userId: string) {
    return await redisClient.hget(`user:${userId}`, 'socketId')
  }

  static async setUserSocketId(userId: string, socketId: string) {
    await redisClient.hset(`user:${userId}`, 'socketId', socketId)
  }

  static async removeUserSocketId(userId?: string) {
    await redisClient.hdel(`user:${userId}`, 'socketId')
  }

  static async getLiveUsers() {
    const users = await User.find()

    return users
  }
}

// export class UserService {
//   static async getUser(username: string): Promise<User | null> {
//     const data = await redisClient.hgetall(`user:${username}`)
//     if (!_.isEmpty(data)) {
//       return {
//         username: data['username']
//       }
//     }
//     return null
//   }

//   static async createUser(username: string): Promise<User> {
//     const user = await this.getUser(username)
//     if (user) {
//       throw new Error('User already exists')
//     }
//     await redisClient.hset(`user:${username}`, { username })
//     return { username }
//   }

//   static async getUserSocketId(username: string) {
//     return await redisClient.hget(`user:${username}`, 'socketId')
//   }

//   static async setUserSocketId(username: string, socketId: string) {
//     await redisClient.hset(`user:${username}`, 'socketId', socketId)
//   }

//   static async removeUserSocketId(username?: string) {
//     await redisClient.hdel(`user:${username}`, 'socketId')
//   }
// }
