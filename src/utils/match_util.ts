import { DICE_VALUES, PLAYER_TYPES } from '../constants'
import BoardConstants from '../constants/boardConstants'
import { LudoState, MatchStatus } from '../constants/enums'
import {
  KilledToken,
  MatchDocument,
  PlayerColor,
  TokenMove
} from '../types/match.types'
import _ from 'lodash'
import { Types } from 'mongoose'

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const createNewMatch = ({
  roomId,
  userId,
  maxPlayersCount
}: {
  roomId: string
  userId: Types.ObjectId
  maxPlayersCount: number
}): MatchDocument => {
  const match: MatchDocument = {
    roomId,
    maxPlayersCount,
    joinedPlayersCount: 1,
    createdBy: userId,
    diceValue: 0,
    players: {
      green: { userId: userId, tokens: [], isPlaying: false },
      yellow: { tokens: [], isPlaying: false },
      blue: { tokens: [], isPlaying: false },
      red: { tokens: [], isPlaying: false }
    },
    status: MatchStatus.Waiting,
    ludoState: LudoState.RollDice,
    turn: 'green'
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
    status: MatchStatus.Waiting,
    turn: 'green',
    ludoState: LudoState.RollDice
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

/**
 * Evaluates selected token next path index
 * @param index - Token index
 */
export const getTokenMove = (
  state: MatchState,
  tokenIndex: number
): TokenMove | null => {
  const currPlayer = state.turn
  const diceValue = state.diceValue
  const currIndex = state.players[currPlayer].tokens[tokenIndex].pathIndex
  let nextIndex = currIndex
  if (currIndex === -1) {
    if (diceValue === 6) {
      nextIndex = 0
    } else {
      return null
    }
  } else {
    if (currIndex + diceValue <= 56) {
      nextIndex += diceValue
    } else {
      return null
    }
  }
  const delayInterval = BoardConstants.ANIMATION_DELAY * (nextIndex - currIndex)
  return { currIndex, nextIndex, delayInterval }
}

export const getMovableTokens = (state: MatchState) => {
  const movableTokens: (TokenMove & {
    tokenIndex: number
  })[] = []

  for (let i = 0; i < 4; i++) {
    const move = getTokenMove(state, i)
    if (move) {
      movableTokens.push({ ...move, tokenIndex: i })
    }
  }
  return movableTokens
}

export const getTokenAutoMove = (state: MatchState) => {
  const movableTokens = getMovableTokens(state)
  if (!movableTokens.length) {
    return null
  }
  const tokenAutoMove = movableTokens[0]
  for (let i = 1; i < movableTokens.length; i++) {
    movableTokens[i].tokenIndex = tokenAutoMove.tokenIndex
    if (!_.isEqual(tokenAutoMove, movableTokens[i])) {
      return null
    }
  }
  return tokenAutoMove
}

export const getNextPlayerTurn = (match: MatchState) => {
  const currPlayer = match.turn
  let nextPlayer = currPlayer
  for (let i = 0; i < 8; i++) {
    if (PLAYER_TYPES[i] === currPlayer) {
      i++
      while (i < 8) {
        const j = i % 4
        if (match.players[PLAYER_TYPES[j]].isPlaying) {
          nextPlayer = PLAYER_TYPES[j]
          break
        }
        i++
      }
      break
    }
  }
  return nextPlayer
}

export const checkTokenKill = (
  match: MatchState,
  pathIndex: number
): KilledToken[] => {
  const currPlayer = match.turn
  const pos = BoardConstants.PATH[currPlayer][pathIndex]
  if (BoardConstants.SAFE_CELLS.includesDeep(pos)) {
    console.log('Safe Cell')
    return []
  }
  const killedTokens: KilledToken[] = []
  Object.entries(match.players).forEach(([key, player]) => {
    if (key === currPlayer || killedTokens.length) {
      return
    }
    const tokens = player.tokens
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].pathIndex === -1) continue

      if (
        _.isEqual(
          BoardConstants.PATH[key as PlayerColor][tokens[i].pathIndex],
          pos
        )
      ) {
        killedTokens.push({
          token: tokens[i],
          player: key as PlayerColor
        })
      }
    }
  })
  return killedTokens
}
// /**
//  * Check if token is present at selected position, return token index
//  * @param position
//  * @returns token index if present at position, otherwise -1
//  */
// export const checkTokenPresent = (state: MatchState, position: Position) => {
//   const currPlayer = state.turn
//   const tokens = state.players[currPlayer].tokens
//   for (let i = 0; i < 4; i++) {
//     if (_.isEqual(tokens[i].position, position)) {
//       return i
//     }
//   }
//   return -1
// }
