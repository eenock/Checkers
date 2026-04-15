'use client'

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, ChevronDown, ChevronUp, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MoveRecord } from '@/lib/checkers/types'
import { formatPosition } from '@/lib/checkers/game-logic'
import { cn } from '@/lib/utils'

interface MoveHistoryProps {
  moves: MoveRecord[]
  animationsEnabled: boolean
}

function MoveHistoryComponent({ moves, animationsEnabled }: MoveHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (moves.length === 0) return null

  return (
    <div className="w-full max-w-[320px] md:max-w-[480px]">
      {/* Mobile: Collapsible drawer */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full gap-2 justify-between"
          aria-expanded={isOpen}
          aria-controls="move-history-mobile"
        >
          <span className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Move History ({moves.length})
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="move-history-mobile"
              initial={animationsEnabled ? { height: 0, opacity: 0 } : {}}
              animate={{ height: 'auto', opacity: 1 }}
              exit={animationsEnabled ? { height: 0, opacity: 0 } : {}}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <MoveList moves={moves} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: Side panel */}
      <div className="hidden md:block">
        <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
          <History className="w-4 h-4" />
          Move History
        </div>
        <MoveList moves={moves} />
      </div>
    </div>
  )
}

function MoveList({ moves }: { moves: MoveRecord[] }) {
  return (
    <div
      className={cn(
        'mt-2 p-3 rounded-lg bg-card border border-border',
        'max-h-[200px] md:max-h-[300px] overflow-y-auto',
        'text-sm'
      )}
      role="log"
      aria-label="Move history"
    >
      <ol className="space-y-1.5">
        {moves.map((move, index) => (
          <li
            key={index}
            className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50"
          >
            <span className="text-muted-foreground w-6 text-right">{index + 1}.</span>
            <div
              className={cn(
                'w-3 h-3 rounded-full shadow-sm flex-shrink-0',
                move.player === 1 ? 'bg-piece-light' : 'bg-piece-dark'
              )}
              aria-hidden="true"
            />
            <span>
              {formatPosition(move.from)} → {formatPosition(move.to)}
            </span>
            {move.captured > 0 && (
              <span className="text-destructive text-xs">×{move.captured}</span>
            )}
            {move.promoted && (
              <Crown className="w-3 h-3 text-amber-500" aria-label="Promoted to king" />
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

export const MoveHistory = memo(MoveHistoryComponent)
