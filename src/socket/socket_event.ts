import { BoardState } from '../constants/enums.js'
import { KilledToken, MatchDocument, TokenMove } from '../types/match.types.js'
import { UserDocument } from '../types/user.types.js'

export const ROOM_EVENT = {
  JOIN_RANDOM: 'joinRandom',
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom'
}

export const MATCH_EVENT = {
  ROLL_DICE: 'rollDice',
  DICE_ROLLING: 'diceRolling',
  DICE_ROLLED: 'diceRolled',

  PICK_TOKEN: 'pickToken',
  MOVE_TOKEN: 'moveToken',
  TOKEN_MOVING: 'tokenMoving',

  KILL_TOKEN: 'killToken'
}

export interface ServerToClientEvents {
  matchCreated: (matchData: MatchDocument) => void
  matchStarted: (matchData: MatchDocument) => void
  matchEnded: (matchData: MatchDocument) => void
  ongoingMatch: (matchData: MatchDocument) => void
  // playerJoined: (playerData: Player) => void
  // playerLeft: (playerData: Player) => void
  // chatMessage: (message: ChatMessage) => void
  // gameState: (state: GameState) => void
  error: (message: string) => void
  pong: (message: string) => void

  matchStateChange: (data: Partial<MatchDocument>) => void
  tokenMoved: (data: { boardState: BoardState; move: TokenMove }) => void
  tokenKilled: (data: { killedTokens: KilledToken[] }) => void
  userOnline: (data: UserDocument[]) => void
  userOffline: (data: UserDocument[]) => void
}

export interface ClientToServerEvents {
  createMatch: (data: { maxPlayersCount: number }, callback?: any) => void
  joinMatch: (data: { roomId: string }, callback?: any) => void
  leaveMatch: (data: { roomId: string }, callback?: any) => void
  ongoingMatch: () => void
  rollDice: (data: { roomId: string }, callback?: any) => void
  pickToken: (
    data: { roomId: string; tokenIndex: number },
    callback?: any
  ) => void
  ping: () => void
  // sendMessage: (data: SendMessageDto) => void
  // updateGameState: (state: GameState) => void
}
