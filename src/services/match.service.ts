import { redisClient } from '../config/redis.js'
import { getRandomDiceNumber } from '../utils/matchUtil.js'

export class MatchService {
  static async rollDice(roomId: string) {
    if (!roomId) return
    const num = getRandomDiceNumber()

    const pipeline = redisClient.pipeline()
    pipeline.hset(`room:${roomId}`, 'diceValue', num)

    try {
      await pipeline.exec()
    } catch (error) {
      console.error(`Failed to rollDice ${roomId}:`, error)
      throw new Error(`Failed to rollDice ${roomId}`)
    }
    return num
  }
}
