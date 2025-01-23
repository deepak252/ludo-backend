import { Types } from 'mongoose'
import { LudoState, MatchStatus } from '../constants/enums.js'

export type Position = [number, number]
export type PlayerColor = 'green' | 'yellow' | 'blue' | 'red'

export type TokenMove = {
  currIndex: number
  nextIndex: number
  delayInterval: number
}

export type TokenInfo = {
  id: string
  index: number
  color: PlayerColor
  pathIndex: number
  highlight?: boolean
}

export type KilledToken = {
  token: TokenInfo
  player: PlayerColor
}

export type Player = {
  userId?: Types.ObjectId | string | null
  tokens: TokenInfo[]
  isPlaying: boolean
}

export type MatchDocument = {
  _id?: Types.ObjectId
  roomId: string
  maxPlayersCount: number
  joinedPlayersCount: number
  status: MatchStatus
  players: Record<PlayerColor, Player>
  turn: PlayerColor
  diceValue: number
  createdBy: Types.ObjectId | string
  ludoState: LudoState
  createdAt?: Date
  updatedAt?: Date
}

// import { LudoState, MatchStatus } from '../constants/enums.js'

// export type Position = [number, number]
// export type PlayerColor = 'green' | 'yellow' | 'blue' | 'red'

// export type TokenMove = {
//   currIndex: number
//   nextIndex: number
//   delayInterval: number
// }

// export type TokenInfo = {
//   id: string
//   index: number
//   color: PlayerColor
//   pathIndex: number
//   highlight?: boolean
// }

// export type KilledToken = {
//   token: TokenInfo
//   player: PlayerColor
// }

// export type Player = {
//   username?: string | null
//   tokens: TokenInfo[]
//   isPlaying: boolean
// }

// export type MatchState = {
//   roomId: string
//   maxPlayersCount: number
//   joinedPlayersCount: number
//   status: MatchStatus
//   players: Record<PlayerColor, Player>
//   turn: PlayerColor
//   diceValue: number
//   createdBy: string
//   ludoState?: LudoState
// }
