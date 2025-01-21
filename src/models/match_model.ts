import { HydratedDocument, Model, Schema, model } from 'mongoose'
import { LudoState, MatchStatus } from '../constants/enums'
import { PLAYER_TYPES } from '../constants'
import { MatchDocument } from '../types/match.types'

interface MatchModel extends Model<MatchDocument, object, object> {
  findByRoomId(roomId: string): Promise<HydratedDocument<MatchDocument, object>>
  findByRoomIdAndUpdate(
    roomId: string,
    update: Partial<MatchDocument>
  ): Promise<MatchDocument | null>
  findActiveMatchesByUser(userId: string): Promise<MatchDocument[]>

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

// const playerSchema = new Schema(
//   {
//     userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
//     tokens: [tokenInfoSchema],
//     isPlaying: { type: Boolean, required: true, default: false }
//   },
//   { _id: false }
// )

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
      default: MatchStatus.Waiting
    },
    ludoState: {
      type: String,
      enum: Object.values(LudoState),
      required: true,
      default: LudoState.RollDice
    },
    players: {
      type: {
        red: playerSchema,
        green: playerSchema,
        blue: playerSchema,
        yellow: playerSchema
      },
      _id: false,
      required: true,
      default: () => ({
        red: { tokens: [], isPlaying: false },
        green: { tokens: [], isPlaying: false },
        blue: { tokens: [], isPlaying: false },
        yellow: { tokens: [], isPlaying: false }
      })
    },
    // players: {
    //   type: Map,
    //   of: playerSchema,
    //   required: true,
    //   default: () => ({
    //     green: { tokens: [], isPlaying: false },
    //     yellow: { tokens: [], isPlaying: false },
    //     blue: { tokens: [], isPlaying: false },
    //     red: { tokens: [], isPlaying: false }
    //   })
    // },
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
    timestamps: true,
    statics: {
      findByRoomId(roomId) {
        return this.findOne({ roomId })
      },
      findByRoomIdAndUpdate(roomId, update) {
        return this.findOneAndUpdate({ roomId }, update, {
          new: true,
          runValidators: true
        })
      },
      findActiveMatchesByUser(userId) {
        return this.find({
          $and: [
            {
              $or: [
                { 'players.green.userId': userId },
                { 'players.yellow.userId': userId },
                { 'players.blue.userId': userId },
                { 'players.red.userId': userId }
              ]
            },
            {
              status: {
                $in: [MatchStatus.Waiting, MatchStatus.InProgress]
              }
            }
          ]
        }).sort({ createdAt: -1 })
      }
    }
  }
)

const Match = model<MatchDocument, MatchModel>('Match', matchSchema)

export default Match
