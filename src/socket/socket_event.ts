import { MatchDocument } from '../types/match.types'

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
  // playerJoined: (playerData: Player) => void
  // playerLeft: (playerData: Player) => void
  // chatMessage: (message: ChatMessage) => void
  // gameState: (state: GameState) => void
  error: (message: string) => void
  pong: (message: string) => void
}

export interface ClientToServerEvents {
  // createMatch: (data: CreateMatchDto) => void
  createMatch: (data: { maxPlayersCount: number }, callback?: any) => void
  joinMatch: (data: { roomId: string }, callback?: any) => void
  leaveMatch: (data: { roomId: string }, callback?: any) => void
  rollDice: (data: { roomId: string }, callback?: any) => void
  ping: () => void
  // sendMessage: (data: SendMessageDto) => void
  // updateGameState: (state: GameState) => void
}
