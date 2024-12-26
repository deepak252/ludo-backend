import { redisClient } from '@/config/redis.js'
import { User } from '@/types/user.types.js'

export class UserService {
  static async getUser(username: string): Promise<User | null> {
    const data = await redisClient.get(`user:${username}`)
    if (data) {
      return JSON.parse(data) as User
    }
    return null
  }

  static async createUser(username: string): Promise<User> {
    // const user = await this.getUser(username)
    // if (user) {
    //   throw new Error('User already exists')
    // }
    //// Use hset here
    // await redisClient.set(`user:${username}`, JSON.stringify({ username }))
    // return { username }
  }
}
