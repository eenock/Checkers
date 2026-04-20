'use client'

import { useReducer, useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { Board } from './board'
import { GameControls } from './game-controls'
import { MoveHistory } from './move-history'
import { WinCelebration } from './win-celebration'
import { Tutorial } from './tutorial'
import { gameReducer, createInitialState } from '@/lib/checkers/game-reducer'
import type { GameState, Move, Position } from '@/lib/checkers/types'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'checkers_game_state'
const emptySubscribe = () => () => {}

type PersistedGameState = Pick<
  GameState,
  | 'board'
  | 'currentPlayer'
  | 'mustJump'
  | 'jumpingPiece'
  | 'moveHistory'
  | 'movesWithoutCapture'
  | 'status'
  | 'animationsEnabled'
>

function parseSavedGame(raw: string | null): PersistedGameState | null {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)

    if (parsed.board && parsed.currentPlayer) {
      return {
        board: parsed.board,
        currentPlayer: parsed.currentPlayer,
        mustJump: parsed.mustJump,
        jumpingPiece: parsed.jumpingPiece,
        moveHistory: parsed.moveHistory ?? [],
        movesWithoutCapture: parsed.movesWithoutCapture ?? 0,
        status: parsed.status ?? 'playing',
        animationsEnabled: parsed.animationsEnabled ?? true,
      }
    }
  } catch (error) {
    console.error('[checkers] Failed to load saved game:', error)
  }

  return null
}

function createStateFromSavedGame(savedState: PersistedGameState | null): GameState {
  if (!savedState) {
    return createInitialState()
  }

  return {
    ...createInitialState(),
    ...savedState,
    previousState: null,
    canUndo: false,
  }
}

export function CheckersGame() {
  const storageReady = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  const initialSavedGame = storageReady
    ? parseSavedGame(localStorage.getItem(STORAGE_KEY))
    : null

  return (
    <CheckersGameContent
      key={storageReady ? (initialSavedGame ? 'saved-game' : 'new-game') : 'loading'}
      initialSavedGame={initialSavedGame}
      storageReady={storageReady}
    />
  )
}

interface CheckersGameContentProps {
  initialSavedGame: PersistedGameState | null
  storageReady: boolean
}

function CheckersGameContent({
  initialSavedGame,
  storageReady,
}: CheckersGameContentProps) {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialSavedGame,
    createStateFromSavedGame
  )
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const lastMove = state.moveHistory.at(-1) ?? null

  // Save state to localStorage after hydration has completed.
  useEffect(() => {
    if (!storageReady || state.status !== 'playing') {
      return
    }

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
      console.error('[checkers] Failed to save game:', e)
    }
  }, [state, storageReady])

  useEffect(() => {
    if (!storageReady || state.status === 'playing') {
      return
    }

    localStorage.removeItem(STORAGE_KEY)
  }, [state.status, storageReady])

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

  const handleShowTutorial = useCallback(() => {
    setIsTutorialOpen(true)
  }, [])

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
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Checkers
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Classic board game</p>
      </header>

      <main className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
        <div className="flex flex-col items-center gap-4">
          <GameControls
            currentPlayer={state.currentPlayer}
            status={state.status}
            canUndo={state.canUndo}
            animationsEnabled={state.animationsEnabled}
            mustJump={state.mustJump}
            selectedPiece={state.selectedPiece}
            validMoves={state.validMoves}
            onReset={handleReset}
            onShowTutorial={handleShowTutorial}
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
            lastMove={lastMove}
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

      <Tutorial
        animationsEnabled={state.animationsEnabled}
        isForcedOpen={isTutorialOpen}
        onForcedClose={() => setIsTutorialOpen(false)}
      />
    </div>
  )
}
