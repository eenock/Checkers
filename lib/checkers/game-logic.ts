import type { Board, Move, Piece, Player, Position } from './types'

export function createInitialBoard(): Board {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Place Player 2 pieces (dark, top of board - rows 0-2)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: 2, type: 'regular' }
      }
    }
  }

  // Place Player 1 pieces (light, bottom of board - rows 5-7)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: 1, type: 'regular' }
      }
    }
  }

  return board
}

export function deepCloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)))
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}

export function isDarkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1
}

export function getValidMoves(board: Board, position: Position, player: Player): Move[] {
  const piece = board[position.row][position.col]
  if (!piece || piece.player !== player) return []

  const moves: Move[] = []
  const directions = getDirections(piece)

  // Check for jumps first
  const jumps = getJumps(board, position, piece, directions)
  if (jumps.length > 0) {
    return jumps
  }

  // If no jumps, check for regular moves
  for (const [dRow, dCol] of directions) {
    const newRow = position.row + dRow
    const newCol = position.col + dCol

    if (isValidPosition(newRow, newCol) && board[newRow][newCol] === null) {
      moves.push({
        from: position,
        to: { row: newRow, col: newCol },
        isJump: false,
      })
    }
  }

  return moves
}

function getDirections(piece: Piece): [number, number][] {
  if (piece.type === 'king') {
    return [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ]
  }
  // Regular pieces: Player 1 moves up (negative row), Player 2 moves down (positive row)
  return piece.player === 1
    ? [
        [-1, -1],
        [-1, 1],
      ]
    : [
        [1, -1],
        [1, 1],
      ]
}

function getJumps(
  board: Board,
  position: Position,
  piece: Piece,
  directions: [number, number][],
  capturedPositions: Position[] = []
): Move[] {
  const jumps: Move[] = []

  for (const [dRow, dCol] of directions) {
    const midRow = position.row + dRow
    const midCol = position.col + dCol
    const endRow = position.row + dRow * 2
    const endCol = position.col + dCol * 2

    if (!isValidPosition(endRow, endCol)) continue

    const midPiece = board[midRow][midCol]
    const endCell = board[endRow][endCol]

    // Check if we can jump over an opponent's piece
    const alreadyCaptured = capturedPositions.some((p) => p.row === midRow && p.col === midCol)

    if (midPiece && midPiece.player !== piece.player && endCell === null && !alreadyCaptured) {
      const capturedPosition = { row: midRow, col: midCol }
      const newCaptured = [...capturedPositions, capturedPosition]

      // Check for chain jumps
      const tempBoard = deepCloneBoard(board)
      tempBoard[position.row][position.col] = null
      tempBoard[midRow][midCol] = null
      tempBoard[endRow][endCol] = piece

      // Check if piece gets promoted
      const willPromote =
        piece.type === 'regular' && ((piece.player === 1 && endRow === 0) || (piece.player === 2 && endRow === 7))

      const newPiece: Piece = willPromote ? { ...piece, type: 'king' } : piece
      tempBoard[endRow][endCol] = newPiece

      const chainJumps = getJumps(
        tempBoard,
        { row: endRow, col: endCol },
        newPiece,
        getDirections(newPiece),
        newCaptured
      )

      if (chainJumps.length > 0) {
        // Add chain jumps with accumulated captures
        for (const chainJump of chainJumps) {
          jumps.push({
            from: position,
            to: chainJump.to,
            captured: chainJump.captured || newCaptured,
            isJump: true,
          })
        }
      } else {
        jumps.push({
          from: position,
          to: { row: endRow, col: endCol },
          captured: newCaptured,
          isJump: true,
        })
      }
    }
  }

  return jumps
}

export function getAllValidMoves(board: Board, player: Player): Move[] {
  const allMoves: Move[] = []
  const allJumps: Move[] = []

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.player === player) {
        const moves = getValidMoves(board, { row, col }, player)
        for (const move of moves) {
          if (move.isJump) {
            allJumps.push(move)
          } else {
            allMoves.push(move)
          }
        }
      }
    }
  }

  // If there are jumps available, only jumps are valid (forced capture)
  return allJumps.length > 0 ? allJumps : allMoves
}

export function hasJumps(board: Board, player: Player): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.player === player) {
        const moves = getValidMoves(board, { row, col }, player)
        if (moves.some((m) => m.isJump)) {
          return true
        }
      }
    }
  }
  return false
}

export function applyMove(board: Board, move: Move): Board {
  const newBoard = deepCloneBoard(board)
  const piece = newBoard[move.from.row][move.from.col]

  if (!piece) return board

  // Remove piece from original position
  newBoard[move.from.row][move.from.col] = null

  // Remove captured pieces
  if (move.captured) {
    for (const pos of move.captured) {
      newBoard[pos.row][pos.col] = null
    }
  }

  // Check for promotion
  const shouldPromote =
    piece.type === 'regular' && ((piece.player === 1 && move.to.row === 0) || (piece.player === 2 && move.to.row === 7))

  // Place piece at new position
  newBoard[move.to.row][move.to.col] = shouldPromote ? { ...piece, type: 'king' } : piece

  return newBoard
}

export function countPieces(board: Board, player: Player): number {
  let count = 0
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col]?.player === player) {
        count++
      }
    }
  }
  return count
}

export function checkWinCondition(
  board: Board,
  currentPlayer: Player
): 'player1_wins' | 'player2_wins' | 'playing' {
  const player1Pieces = countPieces(board, 1)
  const player2Pieces = countPieces(board, 2)

  if (player1Pieces === 0) return 'player2_wins'
  if (player2Pieces === 0) return 'player1_wins'

  // Check if current player has any valid moves
  const validMoves = getAllValidMoves(board, currentPlayer)
  if (validMoves.length === 0) {
    return currentPlayer === 1 ? 'player2_wins' : 'player1_wins'
  }

  return 'playing'
}

export function formatPosition(pos: Position): string {
  const col = String.fromCharCode(65 + pos.col) // A-H
  const row = 8 - pos.row // 1-8 from bottom
  return `${col}${row}`
}
