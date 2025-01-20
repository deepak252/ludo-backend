import { Types, Model, HydratedDocument, Document } from 'mongoose'
import { LudoState, MatchStatus } from '../constants/enums'
import { PlayerColor } from '../types/match.types'

export interface TokenInfo {
  id: string
  index: number
  color: PlayerColor
  pathIndex: number
  highlight?: boolean
}

export interface Player {
  userId?: Types.ObjectId
  //   username?: string | null
  tokens: TokenInfo[]
  isPlaying: boolean
}

export interface IMatch extends Document {
  roomId: string
  maxPlayersCount: number
  joinedPlayersCount: number
  status: MatchStatus
  ludoState: LudoState
  players: Record<PlayerColor, Player>
  turn: PlayerColor
  diceValue: number
  //   createdBy: string
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface MatchModel extends Model<IMatch, object, object> {
  findByRoomId(roomId: string): Promise<HydratedDocument<IMatch, object>>
  //   findActiveMatches(): Promise<(IMatch & IMatchMethods)[]>
  //   findMatchesByUserId(
  //     userId: Types.ObjectId
  //   ): Promise<(IMatch & IMatchMethods)[]>
}
