import { describe, expect, it } from 'vitest'

import { createInitialState, gameReducer } from './game-reducer'
import type { Board, GameState, Piece } from './types'

function createEmptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array(8).fill(null))
}

function placePiece(board: Board, row: number, col: number, piece: Piece) {
  board[row][col] = piece
}

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState(),
    ...overrides,
  }
}

describe('game reducer', () => {
  it('only allows selecting a jumping piece when a capture is forced', () => {
    const board = createEmptyBoard()
    placePiece(board, 5, 0, { player: 1, type: 'regular' })
    placePiece(board, 5, 4, { player: 1, type: 'regular' })
    placePiece(board, 4, 1, { player: 2, type: 'regular' })

    const state = createState({
      board,
      currentPlayer: 1,
      mustJump: true,
    })

    const invalidSelection = gameReducer(state, {
      type: 'SELECT_PIECE',
      position: { row: 5, col: 4 },
    })
    const validSelection = gameReducer(state, {
      type: 'SELECT_PIECE',
      position: { row: 5, col: 0 },
    })

    expect(invalidSelection.selectedPiece).toBeNull()
    expect(validSelection.selectedPiece).toEqual({ row: 5, col: 0 })
    expect(validSelection.validMoves).toHaveLength(1)
    expect(validSelection.validMoves[0].isJump).toBe(true)
  })

  it('records a chained jump and completes the turn in one move', () => {
    const board = createEmptyBoard()
    placePiece(board, 5, 0, { player: 1, type: 'regular' })
    placePiece(board, 4, 1, { player: 2, type: 'regular' })
    placePiece(board, 2, 3, { player: 2, type: 'regular' })

    const selectedState = gameReducer(
      createState({
        board,
        currentPlayer: 1,
      }),
      {
        type: 'SELECT_PIECE',
        position: { row: 5, col: 0 },
      }
    )

    const nextState = gameReducer(selectedState, {
      type: 'MOVE_PIECE',
      move: selectedState.validMoves[0],
    })

    expect(nextState.currentPlayer).toBe(2)
    expect(nextState.jumpingPiece).toBeNull()
    expect(nextState.selectedPiece).toBeNull()
    expect(nextState.moveHistory).toHaveLength(1)
    expect(nextState.moveHistory[0]).toMatchObject({
      captured: 2,
      isJump: true,
      from: { row: 5, col: 0 },
      to: { row: 1, col: 4 },
    })
    expect(nextState.canUndo).toBe(true)
  })

  it('switches turns and enables undo after a normal move', () => {
    const state = createInitialState()
    const selectedState = gameReducer(state, {
      type: 'SELECT_PIECE',
      position: { row: 5, col: 0 },
    })

    const nextState = gameReducer(selectedState, {
      type: 'MOVE_PIECE',
      move: selectedState.validMoves[0],
    })

    expect(nextState.currentPlayer).toBe(2)
    expect(nextState.canUndo).toBe(true)
    expect(nextState.moveHistory).toHaveLength(1)
    expect(nextState.moveHistory[0].isJump).toBe(false)
  })

  it('declares a draw after 50 non-capturing moves', () => {
    const board = createEmptyBoard()
    placePiece(board, 5, 0, { player: 1, type: 'regular' })
    placePiece(board, 0, 1, { player: 2, type: 'regular' })

    const state = createState({
      board,
      currentPlayer: 1,
      selectedPiece: { row: 5, col: 0 },
      validMoves: [
        {
          from: { row: 5, col: 0 },
          to: { row: 4, col: 1 },
          isJump: false,
        },
      ],
      movesWithoutCapture: 49,
    })

    const nextState = gameReducer(state, {
      type: 'MOVE_PIECE',
      move: state.validMoves[0],
    })

    expect(nextState.status).toBe('draw')
    expect(nextState.canUndo).toBe(false)
    expect(nextState.movesWithoutCapture).toBe(50)
  })

  it('restores the previous board state on undo', () => {
    const state = createInitialState()
    const selectedState = gameReducer(state, {
      type: 'SELECT_PIECE',
      position: { row: 5, col: 0 },
    })
    const movedState = gameReducer(selectedState, {
      type: 'MOVE_PIECE',
      move: selectedState.validMoves[0],
    })

    const undoneState = gameReducer(movedState, { type: 'UNDO_MOVE' })

    expect(undoneState.board).toEqual(state.board)
    expect(undoneState.currentPlayer).toBe(1)
    expect(undoneState.canUndo).toBe(false)
  })
})
