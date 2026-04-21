import { describe, expect, it } from 'vitest'

import {
  applyMove,
  checkWinCondition,
  countPieces,
  createInitialBoard,
  getAllValidMoves,
  getValidMoves,
  hasJumps,
} from './game-logic'
import type { Board, Piece } from './types'

function createEmptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array(8).fill(null))
}

function placePiece(board: Board, row: number, col: number, piece: Piece) {
  board[row][col] = piece
}

describe('game logic', () => {
  it('creates the standard opening board', () => {
    const board = createInitialBoard()

    expect(countPieces(board, 1)).toBe(12)
    expect(countPieces(board, 2)).toBe(12)
    expect(board[5][0]).toEqual({ player: 1, type: 'regular' })
    expect(board[2][7]).toEqual({ player: 2, type: 'regular' })
    expect(board[0][0]).toBeNull()
  })

  it('forces captures when a jump is available', () => {
    const board = createEmptyBoard()
    placePiece(board, 5, 0, { player: 1, type: 'regular' })
    placePiece(board, 4, 1, { player: 2, type: 'regular' })

    const moves = getAllValidMoves(board, 1)

    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({
      from: { row: 5, col: 0 },
      to: { row: 3, col: 2 },
      isJump: true,
      captured: [{ row: 4, col: 1 }],
    })
  })

  it('returns chained jumps as a single capture sequence', () => {
    const board = createEmptyBoard()
    placePiece(board, 5, 0, { player: 1, type: 'regular' })
    placePiece(board, 4, 1, { player: 2, type: 'regular' })
    placePiece(board, 2, 3, { player: 2, type: 'regular' })

    const moves = getValidMoves(board, { row: 5, col: 0 }, 1)

    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({
      from: { row: 5, col: 0 },
      to: { row: 1, col: 4 },
      isJump: true,
      captured: [
        { row: 4, col: 1 },
        { row: 2, col: 3 },
      ],
    })
  })

  it('promotes a piece when it reaches the back rank', () => {
    const board = createEmptyBoard()
    placePiece(board, 1, 2, { player: 1, type: 'regular' })

    const nextBoard = applyMove(board, {
      from: { row: 1, col: 2 },
      to: { row: 0, col: 1 },
      isJump: false,
    })

    expect(nextBoard[0][1]).toEqual({ player: 1, type: 'king' })
  })

  it('detects when a player has no legal moves left', () => {
    const board = createEmptyBoard()
    placePiece(board, 0, 1, { player: 1, type: 'regular' })
    placePiece(board, 1, 0, { player: 2, type: 'regular' })
    placePiece(board, 1, 2, { player: 2, type: 'regular' })

    expect(checkWinCondition(board, 1)).toBe('player2_wins')
  })

  it('reports available jumps correctly', () => {
    const board = createEmptyBoard()
    placePiece(board, 5, 2, { player: 1, type: 'regular' })
    placePiece(board, 4, 3, { player: 2, type: 'regular' })
    placePiece(board, 6, 1, { player: 2, type: 'regular' })

    expect(hasJumps(board, 1)).toBe(true)
    expect(hasJumps(board, 2)).toBe(false)
  })
})
