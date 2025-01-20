import { HydratedDocument, Model, Schema, model } from 'mongoose'
import { LudoState, MatchStatus } from '../constants/enums'
import { PLAYER_TYPES } from '../constants'
import { Match } from '../types/match.types'

type MatchDocument = Match

interface MatchModel extends Model<MatchDocument, object, object> {
  findByRoomId(roomId: string): Promise<HydratedDocument<MatchDocument, object>>
  //   findActiveMatches(): Promise<(IMatch & IMatchMethods)[]>
  //   findMatchesByUserId(
  //     userId: Types.ObjectId
  //   ): Promise<(IMatch & IMatchMethods)[]>
}

const tokenInfoSchema = new Schema(
  {
    id: { type: String, required: true },
    index: { type: Number, required: true },
    color: {
      type: String,
      required: true,
      enum: PLAYER_TYPES
    },
    pathIndex: { type: Number, required: true },
    highlight: { type: Boolean, default: false }
  },
  { _id: false }
)

const playerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    tokens: [tokenInfoSchema],
    isPlaying: { type: Boolean, required: true, default: false }
  },
  { _id: false }
)

const matchSchema = new Schema<MatchDocument, MatchModel, object>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    maxPlayersCount: {
      type: Number,
      required: true,
      min: 2,
      max: 4
    },
    joinedPlayersCount: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(MatchStatus),
      required: true,
      default: MatchStatus.NotStarted
    },
    ludoState: {
      type: String,
      enum: Object.values(LudoState),
      required: true,
      default: LudoState.RollDice
    },
    players: {
      type: Map,
      of: playerSchema,
      required: true,
      default: () => ({
        green: { tokens: [], isPlaying: false },
        yellow: { tokens: [], isPlaying: false },
        blue: { tokens: [], isPlaying: false },
        red: { tokens: [], isPlaying: false }
      })
    },
    turn: {
      type: String,
      enum: PLAYER_TYPES,
      required: true,
      default: 'green'
    },
    diceValue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 6
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: [true, 'Owner Id is required']
    }
  },
  {
    timestamps: true
  }
)

const Match = model<MatchDocument, MatchModel>('Match', matchSchema)

export default Match
