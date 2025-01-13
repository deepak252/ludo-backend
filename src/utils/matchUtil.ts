import { DICE_VALUES, PLAYER_TYPES } from '../constants'
import { LudoState, MatchStatus } from '../enums/match.enum'
import { MatchState } from '../types/match.types'

export const createRoom = ({
  roomId,
  username,
  maxPlayersCount
}: {
  roomId: string
  username: string
  maxPlayersCount: number
}) => {
  const match: MatchState = {
    roomId,
    maxPlayersCount,
    joinedPlayersCount: 1,
    createdBy: username,
    diceValue: 0,
    players: {
      green: { username, tokens: [], isPlaying: false },
      yellow: { tokens: [], isPlaying: false },
      blue: { tokens: [], isPlaying: false },
      red: { tokens: [], isPlaying: false }
    },
    status: MatchStatus.NotStarted,
    turn: 'green',
    ludoState: LudoState.throwDice
  }
  for (const player of PLAYER_TYPES) {
    for (let i = 0; i < 4; i++) {
      match.players[player].tokens.push({
        id: `${player}_${i}`,
        index: i,
        color: player,
        pathIndex: -1
      })
    }
  }
  return match
}

export const getRandomDiceNumber = () => {
  const di = Math.floor(Math.random() * DICE_VALUES.length)
  return DICE_VALUES[di]
}

// export const createNewMatch = (
//   playerCount: number,
//   roomId: string,
//   userId?: string
// ): MatchState => {
//   const matchState: MatchState = {
//     roomId,
//     status: MatchStatus.NotStarted,
//     diceValue: 0,
//     ludoState: LudoState.throwDice,
//     turn: 'green',
//     players: {
//       green: { userId, tokens: [], isActive: false },
//       yellow: { tokens: [], isActive: false },
//       blue: { tokens: [], isActive: false },
//       red: { tokens: [], isActive: false }
//     }
//   }

//   const playerTypes: PlayerType[] = []
//   playerTypes.push('green')
//   if (playerCount >= 2) {
//     playerTypes.push('blue')
//   }
//   if (playerCount >= 3) {
//     playerTypes.push('yellow')
//   }
//   if (playerCount == 4) {
//     playerTypes.push('red')
//   }

//   for (const playerType of playerTypes) {
//     // ToDO: remove isActive
//     matchState.players[playerType].isActive = true
//     for (let i = 0; i < 4; i++) {
//       matchState.players[playerType].tokens.push({
//         id: `${playerType}_${i}`,
//         index: i,
//         color: playerType,
//         pathIndex: -1,
//         position: BoardConstants.HOME[playerType][i]
//       })
//     }
//   }

//   return matchState
// }
