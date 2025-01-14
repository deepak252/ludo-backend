import { redisClient } from '../config/redis.js'
import { LudoState } from '../enums/match.enum.js'
import { MatchState } from '../types/match.types.js'
import { delay, getRandomDiceNumber } from '../utils/matchUtil.js'
export class MatchService {
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

  static async updateMatch(roomId: string, match: Partial<MatchState>) {
    const updatedMatch = match.players
      ? { ...match, players: JSON.stringify(match.players) }
      : { ...match }

    await redisClient.hset(`room:${roomId}`, updatedMatch)
  }
}
