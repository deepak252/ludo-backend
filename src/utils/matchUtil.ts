import BoardConstants from '@/constants/boardConstants.js'
import { LudoState, MatchStatus } from '@/enums/match.enum.js'
import { MatchState, PlayerType } from '@/types/match.types.js'

export const createNewMatch = (
  playerCount: number,
  roomId: string,
  userId?: string
): MatchState => {
  const matchState: MatchState = {
    roomId,
    status: MatchStatus.NotStarted,
    diceValue: 0,
    ludoState: LudoState.throwDice,
    turn: 'green',
    players: {
      green: { userId, tokens: [], isActive: false },
      yellow: { tokens: [], isActive: false },
      blue: { tokens: [], isActive: false },
      red: { tokens: [], isActive: false }
    }
  }

  const playerTypes: PlayerType[] = []
  playerTypes.push('green')
  if (playerCount >= 2) {
    playerTypes.push('blue')
  }
  if (playerCount >= 3) {
    playerTypes.push('yellow')
  }
  if (playerCount == 4) {
    playerTypes.push('red')
  }

  for (const playerType of playerTypes) {
    // ToDO: remove isActive
    matchState.players[playerType].isActive = true
    for (let i = 0; i < 4; i++) {
      matchState.players[playerType].tokens.push({
        id: `${playerType}_${i}`,
        index: i,
        color: playerType,
        pathIndex: -1,
        position: BoardConstants.HOME[playerType][i]
      })
    }
  }

  return matchState
}
