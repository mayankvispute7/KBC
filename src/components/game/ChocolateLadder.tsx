/**
 * ChocolateLadder — Persistent sidebar showing the 12-level prize progression
 *
 * Current level is highlighted with a gold glow. Milestone levels (4, 8, 12)
 * have a special gold accent. The ladder is always visible but not distracting.
 */

'use client';

import { motion } from 'framer-motion';
import { getChocolateLadder } from '@/lib/types';
import { useGame } from '@/lib/GameContext';

interface ChocolateLadderProps {
  /** Whether to animate the ladder reveal (used in pre-show) */
  animateReveal?: boolean;
}

export default function ChocolateLadder({ animateReveal = false }: ChocolateLadderProps) {
  const { state } = useGame();
  const currentLevel = state.currentChocolateLevel;
  const currentQuestionLevel = state.currentQuestionIndex + 1;

  return (
    <div className="flex flex-col-reverse gap-1.5 w-full max-w-[220px]">
      {getChocolateLadder().map((tier, index) => {
        const isCompleted = tier.level <= currentLevel;
        const isCurrent = tier.level === currentQuestionLevel;
        const isNext = tier.level === currentLevel + 1;

        return (
          <motion.div
            key={tier.level}
            className={`
              relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-body
              transition-all duration-500 border
              ${isCurrent
                ? 'bg-gold/15 border-gold text-gold-bright shadow-gold font-semibold'
                : isCompleted
                ? 'bg-success/10 border-success/30 text-success-glow'
                : isNext
                ? 'bg-navy-light border-neutral-line text-ink-white/80'
                : 'bg-navy/50 border-neutral-line/30 text-ink-white/40'}
              ${tier.isMilestone ? 'border-gold/40' : ''}
            `}
            initial={animateReveal ? { opacity: 0, x: 50 } : false}
            animate={animateReveal ? { opacity: 1, x: 0 } : undefined}
            transition={animateReveal ? {
              delay: index * 0.1,
              duration: 0.5,
              ease: 'easeOut',
            } : undefined}
          >
            {/* Level number */}
            <span
              className={`
                w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0
                ${isCurrent
                  ? 'bg-gold text-void'
                  : isCompleted
                  ? 'bg-success/20 text-success'
                  : 'bg-neutral-line/30 text-ink-white/40'}
              `}
            >
              {tier.level}
            </span>

            {/* Tier label */}
            <span className="truncate text-xs">{tier.label}</span>

            {/* Current level indicator */}
            {isCurrent && (
              <motion.div
                className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gold"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Milestone gold shimmer */}
            {tier.isMilestone && !isCompleted && (
              <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gold-shimmer opacity-5 animate-shimmer" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
