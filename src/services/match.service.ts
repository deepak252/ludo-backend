import { redisClient } from '../config/redis.js'
import { LudoState } from '../enums/match.enum.js'
import { delay, getRandomDiceNumber } from '../utils/matchUtil.js'
export class MatchService {
  static async rollDice(roomId: string) {
    const num = getRandomDiceNumber()

    const pipeline = redisClient.pipeline()
    pipeline.hset(`room:${roomId}`, 'diceValue', num)
    pipeline.hset(`room:${roomId}`, 'ludoState', LudoState.DiceRolling)

    try {
      await pipeline.exec()
      await delay(1000)
      return num
    } catch (error) {
      console.error(`Failed to rollDice ${roomId}:`, error)
      throw new Error(`Failed to rollDice ${roomId}`)
    }
  }

  // getMovableTokens = (state: OfflineMatchState) => {
  //   const movableTokens: (TokenMove & {
  //     tokenIndex: number
  //   })[] = []

  //   for (let i = 0; i < 4; i++) {
  //     const move = getTokenMove(state, i)
  //     if (move) {
  //       movableTokens.push({ ...move, tokenIndex: i })
  //     }
  //   }
  //   return movableTokens
  // }
}
