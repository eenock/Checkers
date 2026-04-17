'use client'

import { memo, useEffect, useId, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, RotateCcw, Trophy, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GameStatus } from '@/lib/checkers/types'
import { cn } from '@/lib/utils'

interface WinCelebrationProps {
  status: GameStatus
  animationsEnabled: boolean
  onReset: () => void
}

interface Confetti {
  id: number
  x: number
  color: string
  delay: number
  duration: number
  rotate: number
}

function WinCelebrationComponent({ status, animationsEnabled, onReset }: WinCelebrationProps) {
  const isWin = status === 'player1_wins' || status === 'player2_wins'
  const isDraw = status === 'draw'
  const showCelebration = isWin || isDraw
  const titleId = useId()
  const descriptionId = useId()

  const confetti = useMemo<Confetti[]>(() => {
    if (!isWin || !animationsEnabled) {
      return []
    }

    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6']
    const seed = status === 'player1_wins' ? 11 : 23

    return Array.from({ length: 30 }, (_, index) => {
      const value = seed * (index + 3)

      return {
        id: index,
        x: (value * 17) % 100,
        color: colors[(value * 7) % colors.length],
        delay: ((value * 13) % 50) / 100,
        duration: 2 + ((value * 19) % 200) / 100,
        rotate: index % 2 === 0 ? 360 : -360,
      }
    })
  }, [animationsEnabled, isWin, status])

  useEffect(() => {
    if (!showCelebration) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onReset()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onReset, showCelebration])

  const getStatusText = () => {
    switch (status) {
      case 'player1_wins':
        return 'Light Wins!'
      case 'player2_wins':
        return 'Dark Wins!'
      case 'draw':
        return "It's a Draw!"
      default:
        return ''
    }
  }

  const getSupportingText = () => {
    if (isDraw) {
      return 'The game ended in a draw after 50 moves without a capture.'
    }

    return 'A clean finish. Start a new round and run it back.'
  }

  const accentClass = isDraw ? 'from-slate-500/20 to-slate-500/5' : 'from-amber-500/20 to-amber-500/5'
  const badgeLabel = isDraw ? 'Match Complete' : 'Victory'

  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          initial={animationsEnabled ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={animationsEnabled ? { opacity: 0 } : {}}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onReset()}
        >
          {/* Confetti */}
          {confetti.map((c) => (
            <motion.div
              key={c.id}
              className="absolute top-0 w-2 h-2 rounded-full"
              style={{
                left: `${c.x}%`,
                backgroundColor: c.color,
              }}
              initial={{ y: -20, opacity: 1 }}
              animate={{
                y: '100vh',
                opacity: 0,
                rotate: c.rotate,
              }}
              transition={{
                duration: c.duration,
                delay: c.delay,
                ease: 'easeIn',
              }}
            />
          ))}

          {/* Celebration card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            initial={animationsEnabled ? { scale: 0.8, y: 20 } : {}}
            animate={{ scale: 1, y: 0 }}
            exit={animationsEnabled ? { scale: 0.8, y: 20 } : {}}
            transition={{ type: 'spring', damping: 15 }}
            className={cn(
              'relative w-full max-w-sm overflow-hidden rounded-3xl border border-border/80',
              'bg-card/95 shadow-2xl backdrop-blur-xl'
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={cn(
                'pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b',
                accentClass
              )}
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={onReset}
              className={cn(
                'absolute top-4 right-4 z-10 rounded-full border border-border/60 bg-background/80 p-1.5',
                'transition-colors hover:bg-muted'
              )}
              aria-label="Close celebration"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="relative z-0 flex flex-col gap-5 p-6 pt-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Game Over</span>
                  <span>{badgeLabel}</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted/80">
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      isDraw ? 'bg-muted-foreground/70' : 'bg-primary'
                    )}
                    initial={animationsEnabled ? { width: 0 } : false}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <motion.div
                animate={animationsEnabled && isWin ? { rotate: [0, -10, 10, -10, 0] } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mx-auto flex h-18 w-18 items-center justify-center rounded-2xl border border-border/60 bg-background/85 shadow-sm"
              >
                {isWin ? (
                  <Trophy className="h-9 w-9 text-amber-500" />
                ) : (
                  <Crown className="h-9 w-9 text-muted-foreground" />
                )}
              </motion.div>

              <motion.h2
                id={titleId}
                className="text-center text-2xl font-bold tracking-tight text-foreground"
                animate={animationsEnabled ? { scale: [1, 1.04, 1] } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {getStatusText()}
              </motion.h2>

              <p
                id={descriptionId}
                className="mx-auto max-w-[28ch] text-center text-sm leading-6 text-muted-foreground"
              >
                {getSupportingText()}
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={onReset}
                  className="w-full gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  New Game
                </Button>
                <Button
                  onClick={onReset}
                  className="w-full gap-2 shadow-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  Play Again
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const WinCelebration = memo(WinCelebrationComponent)
