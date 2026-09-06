/**
 * OptionCard — Single answer option with all 8 visual states
 *
 * This is the most important visual component in the app.
 * Each state is a named Framer Motion variant — NOT ad-hoc className toggles.
 *
 * States: DEFAULT, HOVER, SELECTED, LOCKED, CORRECT, WRONG, ELIMINATED, DISABLED
 * See Architecture.md §3 for the full spec.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { OptionLetter } from '@/lib/types';

type VisualState = 'DEFAULT' | 'SELECTED' | 'LOCKED' | 'CORRECT' | 'WRONG' | 'ELIMINATED' | 'DISABLED';

interface OptionCardProps {
  letter: OptionLetter;
  text: string;
  state: VisualState;
  onClick: () => void;
  disabled?: boolean;
}

const letterIndex: Record<OptionLetter, number> = { A: 0, B: 1, C: 2, D: 3 };

// Framer Motion variants for each visual state
// Using 'as const' to satisfy Framer Motion's strict Easing type
const cardVariants = {
  DEFAULT: {
    scale: 1,
    opacity: 1,
    borderColor: '#2A3352',
    backgroundColor: 'rgba(20, 27, 52, 1)',
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  SELECTED: {
    scale: 1.03,
    opacity: 1,
    borderColor: '#E8C86B',
    backgroundColor: 'rgba(232, 200, 107, 0.12)',
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  LOCKED: {
    scale: 1.05,
    opacity: 1,
    borderColor: '#FFE9A8',
    backgroundColor: 'rgba(232, 200, 107, 0.18)',
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
  CORRECT: {
    scale: 1.03,
    opacity: 1,
    borderColor: '#3DDC84',
    backgroundColor: 'rgba(61, 220, 132, 0.15)',
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
  WRONG: {
    scale: 1,
    opacity: 1,
    borderColor: '#E85B5B',
    backgroundColor: 'rgba(232, 91, 91, 0.15)',
    x: [0, -4, 4, -4, 4, 0],
    transition: {
      x: { duration: 0.15, ease: 'easeInOut' as const },
      default: { duration: 0.5, ease: 'easeOut' as const },
    },
  },
  ELIMINATED: {
    scale: 0.97,
    opacity: 0.3,
    borderColor: 'rgba(42, 51, 82, 0.3)',
    backgroundColor: 'rgba(20, 27, 52, 0.3)',
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
  DISABLED: {
    scale: 1,
    opacity: 0.5,
    borderColor: 'rgba(42, 51, 82, 0.5)',
    backgroundColor: 'rgba(20, 27, 52, 0.5)',
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

// Glow ring variants (the outer glow effect)
const glowVariants = {
  DEFAULT: { opacity: 0, scale: 1 },
  SELECTED: {
    opacity: [0.4, 0.7, 0.4],
    scale: 1,
    transition: { opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  LOCKED: {
    opacity: [0.6, 1, 0.6],
    scale: 1,
    transition: { opacity: { duration: 1, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  CORRECT: { opacity: 0.8, scale: 1 },
  WRONG: { opacity: 0.6, scale: 1 },
  ELIMINATED: { opacity: 0, scale: 1 },
  DISABLED: { opacity: 0, scale: 1 },
};

function getGlowColor(state: VisualState): string {
  switch (state) {
    case 'SELECTED': return 'rgba(232, 200, 107, 0.3)';
    case 'LOCKED': return 'rgba(232, 200, 107, 0.5)';
    case 'CORRECT': return 'rgba(61, 220, 132, 0.4)';
    case 'WRONG': return 'rgba(232, 91, 91, 0.4)';
    default: return 'transparent';
  }
}

export default function OptionCard({ letter, text, state, onClick, disabled }: OptionCardProps) {
  const isInteractive = state === 'DEFAULT' || state === 'SELECTED';

  return (
    <motion.button
      className="relative w-full text-left rounded-xl border-2 px-6 py-5 cursor-pointer group overflow-hidden"
      variants={cardVariants}
      animate={state}
      initial="DEFAULT"
      onClick={() => {
        if (!disabled && isInteractive) onClick();
      }}
      disabled={disabled || !isInteractive}
      whileHover={isInteractive ? { scale: 1.02, borderColor: '#E8C86B' } : undefined}
      style={{ minHeight: '80px' }}
      layout
    >
      {/* Glow ring behind the card */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        variants={glowVariants}
        animate={state}
        style={{
          boxShadow: `0 0 30px ${getGlowColor(state)}, inset 0 0 20px ${getGlowColor(state)}`,
        }}
      />

      {/* Correct answer sweep fill */}
      <AnimatePresence>
        {state === 'CORRECT' && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ backgroundColor: 'rgba(61, 220, 132, 0.12)' }}
          />
        )}
      </AnimatePresence>

      {/* Wrong answer sweep fill */}
      <AnimatePresence>
        {state === 'WRONG' && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ backgroundColor: 'rgba(232, 91, 91, 0.12)' }}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        {/* Letter badge */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-title font-bold text-lg
            transition-colors duration-300
            ${state === 'CORRECT' ? 'bg-success/20 text-success-glow border border-success/40' :
              state === 'WRONG' ? 'bg-danger/20 text-danger-glow border border-danger/40' :
              state === 'ELIMINATED' ? 'bg-neutral-line/20 text-neutral-line border border-neutral-line/20' :
              'bg-gold/10 text-gold border border-gold/30'}
          `}
        >
          {letter}
        </div>

        {/* Option text */}
        <span
          className={`
            font-body text-lg md:text-xl leading-relaxed flex-1
            transition-colors duration-300
            ${state === 'CORRECT' ? 'text-success-glow' :
              state === 'WRONG' ? 'text-danger-glow' :
              state === 'ELIMINATED' ? 'text-neutral-line line-through' :
              state === 'DISABLED' ? 'text-ink-white/50' :
              'text-ink-white'}
          `}
        >
          {text}
        </span>

        {/* Lock icon (appears on LOCKED state) */}
        <AnimatePresence>
          {state === 'LOCKED' && (
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Lock className="w-6 h-6 text-gold-bright" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Eliminated X overlay */}
      <AnimatePresence>
        {state === 'ELIMINATED' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-6xl font-bold text-neutral-line">✕</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success particles (small sparkles on correct) */}
      <AnimatePresence>
        {state === 'CORRECT' && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full bg-success-glow pointer-events-none"
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 100}%`,
                  y: `${50 + (Math.random() - 0.5) * 100}%`,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.05,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
