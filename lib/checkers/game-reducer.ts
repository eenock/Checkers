import type { GameAction, GameState, MoveRecord } from './types'
import {
  applyMove,
  checkWinCondition,
  createInitialBoard,
  getAllValidMoves,
  getValidMoves,
  hasJumps,
} from './game-logic'

export function createInitialState(): GameState {
  const board = createInitialBoard()
  const validMoves = getAllValidMoves(board, 1)
  const mustJump = validMoves.some((m) => m.isJump)

  return {
    board,
    currentPlayer: 1,
    selectedPiece: null,
    validMoves: [],
    mustJump,
    jumpingPiece: null,
    moveHistory: [],
    movesWithoutCapture: 0,
    status: 'playing',
    previousState: null,
    canUndo: false,
    animationsEnabled: true,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_PIECE': {
      if (state.status !== 'playing') return state

      const { position } = action
      const piece = state.board[position.row][position.col]

      // If we're in a jump chain, only the jumping piece can be selected
      if (state.jumpingPiece) {
        if (position.row !== state.jumpingPiece.row || position.col !== state.jumpingPiece.col) {
          return state
        }
      }

      // Check if the piece belongs to current player
      if (!piece || piece.player !== state.currentPlayer) {
        return { ...state, selectedPiece: null, validMoves: [] }
      }

      // Get valid moves for this piece
      const validMoves = getValidMoves(state.board, position, state.currentPlayer)

      // If must jump, only allow pieces that can jump
      if (state.mustJump && !validMoves.some((m) => m.isJump)) {
        return { ...state, selectedPiece: null, validMoves: [] }
      }

      // Filter to only jumps if must jump
      const filteredMoves = state.mustJump ? validMoves.filter((m) => m.isJump) : validMoves

      return {
        ...state,
        selectedPiece: position,
        validMoves: filteredMoves,
      }
    }

    case 'MOVE_PIECE': {
      if (state.status !== 'playing' || !state.selectedPiece) return state

      const { move } = action
      const piece = state.board[move.from.row][move.from.col]
      if (!piece) return state

      // Save previous state for undo (only if not in a jump chain)
      const previousState = state.jumpingPiece === null ? state : state.previousState

      // Apply the move
      const newBoard = applyMove(state.board, move)

      // Check for promotion
      const willPromote =
        piece.type === 'regular' &&
        ((piece.player === 1 && move.to.row === 0) || (piece.player === 2 && move.to.row === 7))

      // Record the move
      const moveRecord: MoveRecord = {
        player: state.currentPlayer,
        from: move.from,
        to: move.to,
        captured: move.captured?.length || 0,
        promoted: willPromote,
      }

      // Update moves without capture counter
      const newMovesWithoutCapture = move.isJump ? 0 : state.movesWithoutCapture + 1

      // Check for draw (50 moves without capture)
      if (newMovesWithoutCapture >= 50) {
        return {
          ...state,
          board: newBoard,
          status: 'draw',
          selectedPiece: null,
          validMoves: [],
          moveHistory: [...state.moveHistory, moveRecord],
          movesWithoutCapture: newMovesWithoutCapture,
          previousState,
          canUndo: false,
        }
      }

      // Check if there are more jumps available with this piece (chain jump)
      if (move.isJump) {
        const newPiece = newBoard[move.to.row][move.to.col]
        if (newPiece) {
          const moreJumps = getValidMoves(newBoard, move.to, state.currentPlayer).filter((m) => m.isJump)
          if (moreJumps.length > 0) {
            // Continue jumping with the same piece
            return {
              ...state,
              board: newBoard,
              selectedPiece: move.to,
              validMoves: moreJumps,
              jumpingPiece: move.to,
              moveHistory: [...state.moveHistory, moveRecord],
              movesWithoutCapture: 0,
              previousState,
              canUndo: false,
            }
          }
        }
      }

      // Switch players
      const nextPlayer = state.currentPlayer === 1 ? 2 : 1

      // Check win condition
      const status = checkWinCondition(newBoard, nextPlayer)

      // Check if next player must jump
      const mustJump = hasJumps(newBoard, nextPlayer)

      return {
        ...state,
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedPiece: null,
        validMoves: [],
        mustJump,
        jumpingPiece: null,
        moveHistory: [...state.moveHistory, moveRecord],
        movesWithoutCapture: newMovesWithoutCapture,
        status,
        previousState,
        canUndo: true,
      }
    }

    case 'UNDO_MOVE': {
      if (!state.canUndo || !state.previousState) return state

      return {
        ...state.previousState,
        canUndo: false,
        animationsEnabled: state.animationsEnabled,
      }
    }

    case 'SURRENDER': {
      if (state.status !== 'playing') return state

      return {
        ...state,
        status: state.currentPlayer === 1 ? 'player2_wins' : 'player1_wins',
        selectedPiece: null,
        validMoves: [],
      }
    }

    case 'RESET_GAME': {
      return {
        ...createInitialState(),
        animationsEnabled: state.animationsEnabled,
      }
    }

    case 'TOGGLE_ANIMATIONS': {
      return {
        ...state,
        animationsEnabled: !state.animationsEnabled,
      }
    }

    case 'DESELECT': {
      if (state.jumpingPiece) return state // Can't deselect during jump chain
      return {
        ...state,
        selectedPiece: null,
        validMoves: [],
      }
    }

    default:
      return state
  }
}
