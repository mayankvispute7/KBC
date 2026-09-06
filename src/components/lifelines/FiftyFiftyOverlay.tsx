/**
 * FiftyFiftyOverlay — Removes two incorrect options with animation
 *
 * Uses the configured fiftyFiftyRemove from question data.
 * If not configured, auto-picks two incorrect options.
 */

'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice3 } from 'lucide-react';
import { useGame } from '@/lib/GameContext';
import type { OptionLetter } from '@/lib/types';

export default function FiftyFiftyOverlay() {
  const { state, dispatch } = useGame();
  const isVisible = state.activeLifeline === 'fiftyFifty';
  const question = state.questions[state.currentQuestionIndex];

  useEffect(() => {
    if (!isVisible || !question) return;

    // Determine which options to remove
    let toRemove: OptionLetter[];

    if (question.fiftyFiftyRemove && question.fiftyFiftyRemove.length === 2) {
      toRemove = question.fiftyFiftyRemove as OptionLetter[];
    } else {
      // Auto-pick two incorrect options
      const allOptions: OptionLetter[] = ['A', 'B', 'C', 'D'];
      const incorrect = allOptions.filter(o => !question.correctOptions.includes(o));
      toRemove = incorrect.slice(0, 2);
    }

    // Animate: show the overlay briefly, then apply
    const timer = setTimeout(() => {
      dispatch({ type: 'APPLY_FIFTY_FIFTY', removed: toRemove });
    }, 1200);

    return () => clearTimeout(timer);
  }, [isVisible, question, dispatch]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            className="fixed inset-0 bg-void/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <motion.div
                className="mx-auto mb-4 w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              >
                <Dice3 className="w-10 h-10 text-gold" />
              </motion.div>

              <h3 className="font-title text-3xl md:text-4xl font-bold text-gold-gradient">
                50–50 🎲
              </h3>
              <p className="mt-2 font-body text-lg text-ink-white/50">
                Removing two wrong options...
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
