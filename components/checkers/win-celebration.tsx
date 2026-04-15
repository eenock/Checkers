'use client'

import { memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, RotateCcw } from 'lucide-react'
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

  const getWinnerText = () => {
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

  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          initial={animationsEnabled ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={animationsEnabled ? { opacity: 0 } : {}}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
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
            initial={animationsEnabled ? { scale: 0.8, y: 20 } : {}}
            animate={{ scale: 1, y: 0 }}
            exit={animationsEnabled ? { scale: 0.8, y: 20 } : {}}
            transition={{ type: 'spring', damping: 15 }}
            className={cn(
              'relative flex flex-col items-center gap-6 p-8 rounded-2xl',
              'bg-card border border-border shadow-2xl',
              'max-w-[90vw] w-[320px]'
            )}
          >
            {isWin && (
              <motion.div
                animate={animationsEnabled ? { rotate: [0, -10, 10, -10, 0] } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Trophy className="w-16 h-16 text-amber-500" />
              </motion.div>
            )}

            <div className="text-center">
              <motion.h2
                className="text-2xl font-bold text-foreground"
                animate={
                  animationsEnabled
                    ? { scale: [1, 1.05, 1] }
                    : {}
                }
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {getWinnerText()}
              </motion.h2>
              <p className="mt-2 text-muted-foreground">
                {isWin ? 'Congratulations!' : '50 moves without a capture'}
              </p>
            </div>

            <Button onClick={onReset} className="gap-2 w-full">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const WinCelebration = memo(WinCelebrationComponent)
