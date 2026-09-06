/**
 * LifelineBar — Shows the 4 lifeline chips with used/available/disabled states
 *
 * Each lifeline chip stays visible permanently once used (with "USED" label).
 * Never disappears, never becomes clickable again, resets only on full game Reset.
 */

'use client';

import { motion } from 'framer-motion';
import { Dice3, BarChart3, HandHelping, Phone } from 'lucide-react';
import { useGame } from '@/lib/GameContext';
import { audioManager } from '@/lib/audio';
import type { LifelineType, GameStatus } from '@/lib/types';

interface LifelineInfo {
  type: LifelineType;
  icon: React.ReactNode;
  label: string;
  shortLabel: string;
}

const LIFELINES: LifelineInfo[] = [
  { type: 'fiftyFifty', icon: <Dice3 className="w-5 h-5" />, label: '50–50', shortLabel: '50:50' },
  { type: 'audiencePoll', icon: <BarChart3 className="w-5 h-5" />, label: 'Audience Poll', shortLabel: 'Poll' },
  { type: 'askStudent', icon: <HandHelping className="w-5 h-5" />, label: 'Ask a Student', shortLabel: 'Student' },
  { type: 'hotline', icon: <Phone className="w-5 h-5" />, label: 'Staffroom Hotline', shortLabel: 'Hotline' },
];

const USABLE_STATUSES: GameStatus[] = ['QUESTION', 'TIMER_RUNNING', 'OPTION_SELECTED'];

export default function LifelineBar() {
  const { state, dispatch } = useGame();

  const handleLifeline = (type: LifelineType) => {
    if (state.usedLifelines[type]) return;
    if (!USABLE_STATUSES.includes(state.gameStatus)) return;

    // Check 50-50 eligibility for current question
    if (type === 'fiftyFifty') {
      const question = state.questions[state.currentQuestionIndex];
      if (question && !question.fiftyFiftyEligible) return;
    }

    audioManager.play('lifelineUse');
    dispatch({ type: 'USE_LIFELINE', lifeline: type });
  };

  return (
    <div className="flex items-center gap-3">
      {LIFELINES.map((lifeline) => {
        const isUsed = state.usedLifelines[lifeline.type];
        const isDisabled = !USABLE_STATUSES.includes(state.gameStatus);

        // Check 50-50 eligibility
        let isUnavailable = false;
        if (lifeline.type === 'fiftyFifty' && !isUsed) {
          const question = state.questions[state.currentQuestionIndex];
          if (question && !question.fiftyFiftyEligible) {
            isUnavailable = true;
          }
        }

        return (
          <motion.button
            key={lifeline.type}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-body text-sm
              transition-all duration-300 group
              ${isUsed
                ? 'bg-navy/50 border-neutral-line/30 text-neutral-line cursor-not-allowed'
                : isDisabled || isUnavailable
                ? 'bg-navy-light border-neutral-line/50 text-ink-white/40 cursor-not-allowed'
                : 'bg-navy-light border-gold/30 text-gold hover:border-gold hover:bg-gold/10 cursor-pointer'}
            `}
            whileHover={!isUsed && !isDisabled && !isUnavailable ? { scale: 1.05 } : undefined}
            whileTap={!isUsed && !isDisabled && !isUnavailable ? { scale: 0.95 } : undefined}
            onClick={() => handleLifeline(lifeline.type)}
            disabled={isUsed || isDisabled || isUnavailable}
            title={isUnavailable ? 'Not available this question' : isUsed ? 'Already used' : lifeline.label}
          >
            {/* Icon */}
            <span className={isUsed ? 'opacity-30' : ''}>{lifeline.icon}</span>

            {/* Label */}
            <span className="hidden md:inline">{lifeline.label}</span>
            <span className="md:hidden">{lifeline.shortLabel}</span>

            {/* USED badge */}
            {isUsed && (
              <motion.span
                className="absolute -top-1.5 -right-1.5 bg-neutral-line text-void text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                USED
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
