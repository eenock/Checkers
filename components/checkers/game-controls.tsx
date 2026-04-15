'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Flag, Undo2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Player, GameStatus } from '@/lib/checkers/types'
import { cn } from '@/lib/utils'

interface GameControlsProps {
  currentPlayer: Player
  status: GameStatus
  canUndo: boolean
  animationsEnabled: boolean
  mustJump: boolean
  onReset: () => void
  onUndo: () => void
  onSurrender: () => void
  onToggleAnimations: () => void
}

function GameControlsComponent({
  currentPlayer,
  status,
  canUndo,
  animationsEnabled,
  mustJump,
  onReset,
  onUndo,
  onSurrender,
  onToggleAnimations,
}: GameControlsProps) {
  const isPlaying = status === 'playing'

  const getStatusText = () => {
    switch (status) {
      case 'player1_wins':
        return 'Light Wins!'
      case 'player2_wins':
        return 'Dark Wins!'
      case 'draw':
        return 'Draw!'
      default:
        return mustJump
          ? `${currentPlayer === 1 ? 'Light' : 'Dark'}'s Turn - Must Jump!`
          : `${currentPlayer === 1 ? 'Light' : 'Dark'}'s Turn`
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[320px] md:max-w-[480px]">
      {/* Status display */}
      <motion.div
        key={status + currentPlayer + (mustJump ? '-jump' : '')}
        initial={animationsEnabled ? { y: -10, opacity: 0 } : {}}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          'flex items-center justify-center gap-3 px-4 py-2 rounded-full',
          'bg-card border border-border shadow-sm',
          'text-sm md:text-base font-medium'
        )}
      >
        {isPlaying && (
          <div
            className={cn(
              'w-4 h-4 rounded-full shadow-inner',
              currentPlayer === 1 ? 'bg-piece-light' : 'bg-piece-dark'
            )}
            aria-hidden="true"
          />
        )}
        <span className={cn(mustJump && isPlaying && 'text-destructive font-semibold')}>
          {getStatusText()}
        </span>
      </motion.div>

      {/* Control buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2"
          aria-label="Reset game"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo || !isPlaying}
          className="gap-2"
          aria-label="Undo last move"
        >
          <Undo2 className="w-4 h-4" />
          <span className="hidden sm:inline">Undo</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onSurrender}
          disabled={!isPlaying}
          className="gap-2 text-destructive hover:text-destructive"
          aria-label="Surrender"
        >
          <Flag className="w-4 h-4" />
          <span className="hidden sm:inline">Surrender</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAnimations}
          className="gap-2"
          aria-label={animationsEnabled ? 'Disable animations' : 'Enable animations'}
        >
          {animationsEnabled ? (
            <Sparkles className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4 opacity-50" />
          )}
          <span className="hidden sm:inline">
            {animationsEnabled ? 'Animations On' : 'Animations Off'}
          </span>
        </Button>
      </div>
    </div>
  )
}

export const GameControls = memo(GameControlsComponent)
