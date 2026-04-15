export type Player = 1 | 2

export type PieceType = 'regular' | 'king'

export interface Piece {
  player: Player
  type: PieceType
}

export type Cell = Piece | null

export type Board = Cell[][]

export interface Position {
  row: number
  col: number
}

export interface Move {
  from: Position
  to: Position
  captured?: Position[]
  isJump: boolean
}

export interface MoveRecord {
  player: Player
  from: Position
  to: Position
  captured: number
  promoted: boolean
}

export type GameStatus = 'playing' | 'player1_wins' | 'player2_wins' | 'draw'

export interface GameState {
  board: Board
  currentPlayer: Player
  selectedPiece: Position | null
  validMoves: Move[]
  mustJump: boolean
  jumpingPiece: Position | null
  moveHistory: MoveRecord[]
  movesWithoutCapture: number
  status: GameStatus
  previousState: GameState | null
  canUndo: boolean
  animationsEnabled: boolean
}

export type GameAction =
  | { type: 'SELECT_PIECE'; position: Position }
  | { type: 'MOVE_PIECE'; move: Move }
  | { type: 'RESET_GAME' }
  | { type: 'UNDO_MOVE' }
  | { type: 'SURRENDER' }
  | { type: 'TOGGLE_ANIMATIONS' }
  | { type: 'DESELECT' }
