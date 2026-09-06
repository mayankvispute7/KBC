/**
 * AudiencePollOverlay — Shows animated horizontal bars for A–D
 *
 * Bars animate from 0 to their configured percentage.
 * Uses the exact values from the question data (Q2 has real deck values).
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, X } from 'lucide-react';
import { useGame } from '@/lib/GameContext';
import { audioManager } from '@/lib/audio';
import type { OptionLetter } from '@/lib/types';

const BAR_COLORS: Record<OptionLetter, string> = {
  A: '#E8C86B',
  B: '#3A5AFF',
  C: '#3DDC84',
  D: '#E85B5B',
};

export default function AudiencePollOverlay() {
  const { state, dispatch } = useGame();
  const isVisible = state.activeLifeline === 'audiencePoll';
  const question = state.questions[state.currentQuestionIndex];

  if (!question) return null;

  const polls = {
    A: question.audiencePollA ?? 25,
    B: question.audiencePollB ?? 25,
    C: question.audiencePollC ?? 25,
    D: question.audiencePollD ?? 25,
  };

  const handleClose = () => {
    dispatch({ type: 'CLOSE_LIFELINE' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            className="fixed inset-0 bg-void/70 z-40"
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
              className="bg-navy-light border-2 border-gold/30 rounded-2xl p-8 md:p-12 max-w-2xl w-full mx-4 shadow-gold"
              initial={{ y: 50, scale: 0.9, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 50, scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-gold" />
                  <h3 className="font-title text-2xl md:text-3xl font-bold text-gold-gradient">
                    Audience Poll 📊
                  </h3>
                </div>
                <motion.button
                  className="w-10 h-10 rounded-full bg-neutral-line/20 flex items-center justify-center text-ink-white/50 hover:text-ink-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Poll bars */}
              <div className="space-y-5">
                {(['A', 'B', 'C', 'D'] as OptionLetter[]).map((letter, i) => {
                  const percent = polls[letter];
                  const isEliminated = state.fiftyFiftyRemoved?.includes(letter);

                  return (
                    <motion.div
                      key={letter}
                      className={`${isEliminated ? 'opacity-30' : ''}`}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: isEliminated ? 0.3 : 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-title font-bold text-gold w-6">{letter}</span>
                        <span className="font-mono text-lg font-bold text-ink-white tabular-nums">
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full h-8 bg-navy rounded-lg overflow-hidden border border-neutral-line/30">
                        <motion.div
                          className="h-full rounded-lg"
                          style={{ backgroundColor: BAR_COLORS[letter] }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${percent}%` }}
                          transition={{
                            delay: 0.4 + i * 0.15,
                            duration: 0.8,
                            ease: 'easeOut',
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Tagline */}
              <p className="mt-6 text-center text-sm text-ink-white/40 font-body">
                &quot;Students vote karenge. Accuracy ki guarantee zero hai.&quot;
              </p>

              {/* Close button */}
              <div className="mt-6 text-center">
                <motion.button
                  className="px-6 py-2.5 bg-gold/10 border border-gold/30 text-gold font-body rounded-xl hover:bg-gold/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
