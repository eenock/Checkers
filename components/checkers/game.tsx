'use client'

import { useReducer, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Board } from './board'
import { GameControls } from './game-controls'
import { MoveHistory } from './move-history'
import { WinCelebration } from './win-celebration'
import { Tutorial } from './tutorial'
import { gameReducer, createInitialState } from '@/lib/checkers/game-reducer'
import type { Move, Position } from '@/lib/checkers/types'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'checkers_game_state'

export function CheckersGame() {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    // Try to load saved state
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          // Validate the saved state has required properties
          if (parsed.board && parsed.currentPlayer) {
            return {
              ...createInitialState(),
              ...parsed,
              // Reset these to prevent issues
              previousState: null,
              canUndo: false,
            }
          }
        }
      } catch (e) {
        console.error('[v0] Failed to load saved game:', e)
      }
    }
    return createInitialState()
  })

  // Save state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && state.status === 'playing') {
      try {
        const toSave = {
          board: state.board,
          currentPlayer: state.currentPlayer,
          mustJump: state.mustJump,
          jumpingPiece: state.jumpingPiece,
          moveHistory: state.moveHistory,
          movesWithoutCapture: state.movesWithoutCapture,
          status: state.status,
          animationsEnabled: state.animationsEnabled,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
      } catch (e) {
        console.error('[v0] Failed to save game:', e)
      }
    }
  }, [state])

  // Clear saved state on game end
  useEffect(() => {
    if (state.status !== 'playing' && typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [state.status])

  const handleSelectPiece = useCallback((position: Position) => {
    dispatch({ type: 'SELECT_PIECE', position })
  }, [])

  const handleMovePiece = useCallback((move: Move) => {
    dispatch({ type: 'MOVE_PIECE', move })
  }, [])

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET_GAME' })
  }, [])

  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO_MOVE' })
  }, [])

  const handleSurrender = useCallback(() => {
    dispatch({ type: 'SURRENDER' })
  }, [])

  const handleToggleAnimations = useCallback(() => {
    dispatch({ type: 'TOGGLE_ANIMATIONS' })
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'DESELECT' })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center gap-6 p-4',
        'bg-background'
      )}
    >
      <motion.header
        initial={state.animationsEnabled ? { y: -20, opacity: 0 } : {}}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Checkers
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Classic board game</p>
      </motion.header>

      <main className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
        <div className="flex flex-col items-center gap-4">
          <GameControls
            currentPlayer={state.currentPlayer}
            status={state.status}
            canUndo={state.canUndo}
            animationsEnabled={state.animationsEnabled}
            mustJump={state.mustJump}
            onReset={handleReset}
            onUndo={handleUndo}
            onSurrender={handleSurrender}
            onToggleAnimations={handleToggleAnimations}
          />

          <Board
            board={state.board}
            currentPlayer={state.currentPlayer}
            selectedPiece={state.selectedPiece}
            validMoves={state.validMoves}
            jumpingPiece={state.jumpingPiece}
            animationsEnabled={state.animationsEnabled}
            isPlaying={state.status === 'playing'}
            onSelectPiece={handleSelectPiece}
            onMovePiece={handleMovePiece}
          />

          <MoveHistory
            moves={state.moveHistory}
            animationsEnabled={state.animationsEnabled}
          />
        </div>
      </main>

      <WinCelebration
        status={state.status}
        animationsEnabled={state.animationsEnabled}
        onReset={handleReset}
      />

      <Tutorial animationsEnabled={state.animationsEnabled} />
    </div>
  )
}
