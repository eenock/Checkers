'use client'

import { memo, useCallback, useEffect, useId, useState, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Crown, Zap, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TutorialProps {
  animationsEnabled: boolean
  isForcedOpen?: boolean
  onForcedClose?: () => void
}

const TUTORIAL_KEY = 'checkers_tutorial_seen'
const emptySubscribe = () => () => {}

const tutorialSteps = [
  {
    title: 'Welcome to Checkers!',
    description: 'Learn the basics of this classic board game. Light pieces move first.',
    icon: Target,
    accent: 'from-primary/20 to-primary/5',
  },
  {
    title: 'Moving Pieces',
    description:
      'Tap a piece to select it, then tap a highlighted square to move. Regular pieces move diagonally forward only.',
    icon: ChevronRight,
    accent: 'from-amber-500/20 to-amber-500/5',
  },
  {
    title: 'Capturing',
    description:
      'Jump over opponent pieces to capture them. If you can capture, you must! Chain jumps are automatic.',
    icon: Zap,
    accent: 'from-destructive/20 to-destructive/5',
  },
  {
    title: 'Becoming a King',
    description:
      'Reach the opposite end of the board to become a King. Kings can move diagonally in any direction!',
    icon: Crown,
    accent: 'from-emerald-500/20 to-emerald-500/5',
  },
]

function TutorialComponent({
  animationsEnabled,
  isForcedOpen = false,
  onForcedClose,
}: TutorialProps) {
  const [dismissed, setDismissed] = useState(false)
  const [step, setStep] = useState(0)
  const titleId = useId()
  const descriptionId = useId()
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  const shouldShowTutorial = hydrated && !localStorage.getItem(TUTORIAL_KEY)
  const isOpen = isForcedOpen || (shouldShowTutorial && !dismissed)

  const handleClose = useCallback(() => {
    localStorage.setItem(TUTORIAL_KEY, 'true')
    setDismissed(true)
    setStep(0)
    onForcedClose?.()
  }, [onForcedClose])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClose, isOpen])

  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const currentStep = tutorialSteps[step]
  const Icon = currentStep.icon
  const progress = ((step + 1) / tutorialSteps.length) * 100

  if (!hydrated) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={animationsEnabled ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={animationsEnabled ? { opacity: 0 } : {}}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              handleClose()
            }
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            initial={animationsEnabled ? { scale: 0.9, y: 20 } : {}}
            animate={{ scale: 1, y: 0 }}
            exit={animationsEnabled ? { scale: 0.9, y: 20 } : {}}
            className={cn(
              'relative w-full max-w-sm overflow-hidden rounded-3xl border border-border/80',
              'bg-card/95 shadow-2xl backdrop-blur-xl'
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={cn(
                'pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b',
                currentStep.accent
              )}
              aria-hidden="true"
            />

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                'absolute top-4 right-4 z-10 rounded-full border border-border/60 bg-background/80 p-1.5',
                'transition-colors hover:bg-muted'
              )}
              aria-label="Close tutorial"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="relative z-0 flex flex-col gap-5 p-6 pt-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Quick Start</span>
                  <span>
                    Step {step + 1} of {tutorialSteps.length}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted/80">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={animationsEnabled ? { width: 0 } : false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Icon */}
              <motion.div
                key={step}
                initial={animationsEnabled ? { scale: 0.8, opacity: 0 } : {}}
                animate={{ scale: 1, opacity: 1 }}
                className="mx-auto flex h-18 w-18 items-center justify-center rounded-2xl border border-border/60 bg-background/85 shadow-sm"
              >
                <Icon className="h-8 w-8 text-primary" />
              </motion.div>

              {/* Content */}
              <motion.div
                key={`content-${step}`}
                initial={animationsEnabled ? { x: 20, opacity: 0 } : {}}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-2 text-center"
              >
                <h2 id={titleId} className="text-2xl font-bold tracking-tight text-foreground">
                  {currentStep.title}
                </h2>
                <p
                  id={descriptionId}
                  className="mx-auto max-w-[28ch] text-sm leading-6 text-muted-foreground"
                >
                  {currentStep.description}
                </p>
              </motion.div>

              {/* Progress dots */}
              <div
                className="flex items-center justify-center gap-2"
                aria-label="Tutorial progress"
                role="tablist"
              >
                {tutorialSteps.map((item, i) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setStep(i)}
                    className={cn(
                      'flex h-7 items-center justify-center rounded-full px-2.5 transition-all',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      i === step
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                    aria-label={`Go to step ${i + 1}`}
                    aria-selected={i === step}
                    role="tab"
                  >
                    <span className="text-[11px] font-semibold">
                      {i + 1}
                    </span>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={step === 0}
                  className="flex-1 gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="px-4 text-muted-foreground hover:text-foreground"
                >
                  Skip
                </Button>
                <Button onClick={handleNext} className="flex-1 gap-1 shadow-sm">
                  {step === tutorialSteps.length - 1 ? "Let's Play!" : 'Next'}
                  {step < tutorialSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const Tutorial = memo(TutorialComponent)
