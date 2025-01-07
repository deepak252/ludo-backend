import { redisClient } from '../config/redis.js'
import { User } from '../types/user.types.js'
import _ from 'lodash'

export class UserService {
  static async getUser(username: string): Promise<User | null> {
    const data = await redisClient.hgetall(`user:${username}`)
    if (!_.isEmpty(data)) {
      return {
        username: data['username']
      }
    }
    return null
  }

  static async createUser(username: string): Promise<User> {
    const user = await this.getUser(username)
    if (user) {
      throw new Error('User already exists')
    }
    await redisClient.hset(`user:${username}`, { username })
    return { username }
  }
}
