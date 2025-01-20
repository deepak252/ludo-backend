import { redisClient } from '../config/redis.js'
import { LudoState } from '../constants/enums.js'
import { IMatch } from '../interfaces/match_interface.js'
// import { MatchState } from '../types/match.types.js'
import { delay, getRandomDiceNumber } from '../utils/match_util.js'
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

  static async updateMatch(roomId: string, match: Partial<IMatch>) {
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
