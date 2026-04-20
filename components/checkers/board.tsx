'use client'

import { memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { Board as BoardType, Move, MoveRecord, Player, Position } from '@/lib/checkers/types'
import { Square } from './square'
import { cn } from '@/lib/utils'

interface BoardProps {
  board: BoardType
  currentPlayer: Player
  selectedPiece: Position | null
  validMoves: Move[]
  jumpingPiece: Position | null
  lastMove: MoveRecord | null
  animationsEnabled: boolean
  isPlaying: boolean
  onSelectPiece: (position: Position) => void
  onMovePiece: (move: Move) => void
}

function BoardComponent({
  board,
  currentPlayer,
  selectedPiece,
  validMoves,
  jumpingPiece,
  lastMove,
  animationsEnabled,
  isPlaying,
  onSelectPiece,
  onMovePiece,
}: BoardProps) {
  const isSelected = useCallback(
    (row: number, col: number) =>
      selectedPiece?.row === row && selectedPiece?.col === col,
    [selectedPiece]
  )

  const isValidMoveTarget = useCallback(
    (row: number, col: number) =>
      validMoves.some((m) => m.to.row === row && m.to.col === col),
    [validMoves]
  )

  const isJumpTarget = useCallback(
    (row: number, col: number) =>
      validMoves.some((m) => m.to.row === row && m.to.col === col && m.isJump),
    [validMoves]
  )

  const canSelectPiece = useCallback(
    (row: number, col: number) => {
      if (!isPlaying) return false
      const cell = board[row][col]
      if (!cell || cell.player !== currentPlayer) return false

      // If in a jump chain, only the jumping piece can be selected
      if (jumpingPiece) {
        return row === jumpingPiece.row && col === jumpingPiece.col
      }

      return true
    },
    [board, currentPlayer, isPlaying, jumpingPiece]
  )

  return (
    <motion.div
      role="grid"
      aria-label="Checkers board"
      className={cn(
        'grid grid-cols-8 rounded-lg overflow-hidden shadow-2xl',
        'w-[90vw] max-w-[320px] md:max-w-[480px]',
        'aspect-square',
        'border-4 border-primary/20'
      )}
      initial={animationsEnabled ? { scale: 0.95, opacity: 0 } : {}}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Square
            key={`${rowIndex}-${colIndex}`}
            row={rowIndex}
            col={colIndex}
            cell={cell}
            isSelected={isSelected(rowIndex, colIndex)}
            isValidMove={isValidMoveTarget(rowIndex, colIndex)}
            isJumpTarget={isJumpTarget(rowIndex, colIndex)}
            canSelectPiece={canSelectPiece(rowIndex, colIndex)}
            isLastMoveFrom={lastMove?.from.row === rowIndex && lastMove?.from.col === colIndex}
            isLastMoveTo={lastMove?.to.row === rowIndex && lastMove?.to.col === colIndex}
            animationsEnabled={animationsEnabled}
            onSelect={() => onSelectPiece({ row: rowIndex, col: colIndex })}
            onMove={onMovePiece}
            validMoves={validMoves}
          />
        ))
      )}
    </motion.div>
  )
}

export const Board = memo(BoardComponent)
