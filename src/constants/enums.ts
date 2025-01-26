export enum MatchStatus {
  Waiting = 'Waiting',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum BoardState {
  RollDice = 'RollDice',
  DiceRolling = 'DiceRolling',
  PickToken = 'PickToken',
  // MoveToken = 'MoveToken',
  TokenMoving = 'TokenMoving'
}
