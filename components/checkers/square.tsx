'use client'

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Cell, Move } from '@/lib/checkers/types'
import { Piece } from './piece'
import { cn } from '@/lib/utils'

interface SquareProps {
  row: number
  col: number
  cell: Cell
  isSelected: boolean
  isValidMove: boolean
  isJumpTarget: boolean
  canSelectPiece: boolean
  isLastMoveFrom: boolean
  isLastMoveTo: boolean
  animationsEnabled: boolean
  onSelect: () => void
  onMove: (move: Move) => void
  validMoves: Move[]
}

function SquareComponent({
  row,
  col,
  cell,
  isSelected,
  isValidMove,
  isJumpTarget,
  canSelectPiece,
  isLastMoveFrom,
  isLastMoveTo,
  animationsEnabled,
  onSelect,
  onMove,
  validMoves,
}: SquareProps) {
  const isDark = (row + col) % 2 === 1

  const handleClick = () => {
    if (cell && canSelectPiece) {
      onSelect()
    } else if (isValidMove) {
      const move = validMoves.find((m) => m.to.row === row && m.to.col === col)
      if (move) {
        onMove(move)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      role="gridcell"
      tabIndex={isDark ? 0 : -1}
      aria-label={`Square ${String.fromCharCode(65 + col)}${8 - row}${
        cell ? `, ${cell.player === 1 ? 'light' : 'dark'} ${cell.type}` : ''
      }${isValidMove ? ', valid move' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex items-center justify-center aspect-square',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        isDark ? 'bg-board-dark' : 'bg-board-light',
        isDark && 'cursor-pointer',
        !isDark && 'cursor-default'
      )}
      style={{
        backgroundImage: isDark
          ? 'linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.1) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
      }}
    >
      {(isLastMoveFrom || isLastMoveTo) && (
        <motion.div
          initial={animationsEnabled ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          className={cn(
            'pointer-events-none absolute inset-0 border-2',
            isLastMoveTo ? 'border-primary/70 bg-primary/10' : 'border-amber-500/60 bg-amber-500/10'
          )}
        />
      )}

      {/* Valid move indicator */}
      <AnimatePresence>
        {isValidMove && !cell && (
          <motion.div
            initial={animationsEnabled ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={animationsEnabled ? { scale: 0, opacity: 0 } : {}}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute w-[40%] h-[40%] rounded-full',
              isJumpTarget ? 'bg-destructive/50' : 'bg-valid-move/50'
            )}
          />
        )}
      </AnimatePresence>

      {/* Piece */}
      <AnimatePresence mode="wait">
        {cell && (
          <motion.div
            key={`piece-${row}-${col}`}
            initial={animationsEnabled ? { scale: 0.8, opacity: 0 } : {}}
            animate={{ scale: 1, opacity: 1 }}
            exit={animationsEnabled ? { scale: 0.8, opacity: 0 } : {}}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center justify-center w-full h-full"
          >
            <Piece
              piece={cell}
              isSelected={isSelected}
              canSelect={canSelectPiece}
              animationsEnabled={animationsEnabled}
              onClick={onSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const Square = memo(SquareComponent)
