'use client'

import { memo, useState, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Crown, Zap, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TutorialProps {
  animationsEnabled: boolean
}

const TUTORIAL_KEY = 'checkers_tutorial_seen'
const emptySubscribe = () => () => {}

const tutorialSteps = [
  {
    title: 'Welcome to Checkers!',
    description: 'Learn the basics of this classic board game. Light pieces move first.',
    icon: Target,
  },
  {
    title: 'Moving Pieces',
    description:
      'Tap a piece to select it, then tap a highlighted square to move. Regular pieces move diagonally forward only.',
    icon: ChevronRight,
  },
  {
    title: 'Capturing',
    description:
      'Jump over opponent pieces to capture them. If you can capture, you must! Chain jumps are automatic.',
    icon: Zap,
  },
  {
    title: 'Becoming a King',
    description:
      'Reach the opposite end of the board to become a King. Kings can move diagonally in any direction!',
    icon: Crown,
  },
]

function TutorialComponent({ animationsEnabled }: TutorialProps) {
  const [dismissed, setDismissed] = useState(false)
  const [step, setStep] = useState(0)
  const shouldShowTutorial = useSyncExternalStore(
    emptySubscribe,
    () => !localStorage.getItem(TUTORIAL_KEY),
    () => false
  )
  const isOpen = shouldShowTutorial && !dismissed

  const handleClose = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true')
    setDismissed(true)
  }

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={animationsEnabled ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={animationsEnabled ? { opacity: 0 } : {}}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={animationsEnabled ? { scale: 0.9, y: 20 } : {}}
            animate={{ scale: 1, y: 0 }}
            exit={animationsEnabled ? { scale: 0.9, y: 20 } : {}}
            className={cn(
              'relative flex flex-col items-center gap-4 p-6 rounded-2xl',
              'bg-card border border-border shadow-2xl',
              'max-w-[90vw] w-[360px]'
            )}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Close tutorial"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Icon */}
            <motion.div
              key={step}
              initial={animationsEnabled ? { scale: 0.8, opacity: 0 } : {}}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Icon className="w-8 h-8 text-primary" />
            </motion.div>

            {/* Content */}
            <motion.div
              key={`content-${step}`}
              initial={animationsEnabled ? { x: 20, opacity: 0 } : {}}
              animate={{ x: 0, opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-xl font-bold text-foreground">{currentStep.title}</h2>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {currentStep.description}
              </p>
            </motion.div>

            {/* Progress dots */}
            <div className="flex gap-2">
              {tutorialSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    i === step ? 'bg-primary' : 'bg-muted'
                  )}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={step === 0}
                className="flex-1 gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1 gap-1">
                {step === tutorialSteps.length - 1 ? "Let's Play!" : 'Next'}
                {step < tutorialSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const Tutorial = memo(TutorialComponent)
