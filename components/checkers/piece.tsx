'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import type { Piece as PieceType } from '@/lib/checkers/types'
import { cn } from '@/lib/utils'

interface PieceProps {
  piece: PieceType
  isSelected: boolean
  canSelect: boolean
  animationsEnabled: boolean
  onClick: () => void
}

function PieceComponent({ piece, isSelected, canSelect, animationsEnabled, onClick }: PieceProps) {
  const isLight = piece.player === 1
  const isKing = piece.type === 'king'

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center rounded-full shadow-lg',
        'w-[85%] h-[85%]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'touch-manipulation',
        isLight ? 'bg-piece-light' : 'bg-piece-dark',
        canSelect && 'cursor-pointer hover:scale-105',
        !canSelect && 'cursor-default'
      )}
      style={{
        boxShadow: isLight
          ? 'inset 0 -4px 8px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.3)'
          : 'inset 0 -4px 8px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.4)',
      }}
      whileHover={canSelect && animationsEnabled ? { scale: 1.05 } : {}}
      whileTap={canSelect && animationsEnabled ? { scale: 0.95 } : {}}
      animate={
        isSelected && animationsEnabled
          ? {
              boxShadow: [
                '0 0 0 0 rgba(var(--selected), 0.4)',
                '0 0 0 8px rgba(var(--selected), 0)',
              ],
            }
          : {}
      }
      transition={
        isSelected && animationsEnabled
          ? { duration: 1, repeat: Infinity, ease: 'easeOut' }
          : { duration: 0.2 }
      }
      aria-label={`${isLight ? 'Light' : 'Dark'} ${isKing ? 'king' : 'piece'}${isSelected ? ', selected' : ''}`}
    >
      {/* Inner circle for depth */}
      <div
        className={cn(
          'absolute inset-[12%] rounded-full',
          isLight ? 'bg-piece-light' : 'bg-piece-dark'
        )}
        style={{
          boxShadow: isLight
            ? 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.1)'
            : 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.2)',
        }}
      />

      {/* King crown */}
      {isKing && (
        <Crown
          className={cn(
            'absolute w-[40%] h-[40%] z-10',
            isLight ? 'text-amber-600' : 'text-amber-400'
          )}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      )}

      {/* Selection ring */}
      {isSelected && (
        <motion.div
          className="absolute inset-[-4px] rounded-full border-2 border-selected"
          initial={animationsEnabled ? { opacity: 0, scale: 0.8 } : {}}
          animate={animationsEnabled ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Shape indicator for color-blind accessibility */}
      <div
        className={cn(
          'absolute bottom-[8%] w-[20%] h-[20%]',
          isLight ? 'rounded-full bg-amber-600/30' : 'rounded-sm bg-amber-400/30'
        )}
        aria-hidden="true"
      />
    </motion.button>
  )
}

export const Piece = memo(PieceComponent)
