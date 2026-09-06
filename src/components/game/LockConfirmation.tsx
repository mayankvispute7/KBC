/**
 * LockConfirmation — "Lock kiya jaye?" overlay
 *
 * Part of the highest-priority animation sequence in the app.
 * Drops in with a heavy spring, dims the background slightly.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { useGame } from '@/lib/GameContext';
import { audioManager } from '@/lib/audio';

export default function LockConfirmation() {
  const { state, dispatch } = useGame();
  const isVisible = state.gameStatus === 'LOCK_CONFIRMATION';

  const handleConfirm = () => {
    audioManager.play('lock');
    dispatch({ type: 'CONFIRM_LOCK' });

    // Dramatic pause, then reveal
    setTimeout(() => {
      audioManager.play('finalAnswer');
    }, 400);

    setTimeout(() => {
      dispatch({ type: 'REVEAL_ANSWER' });
    }, 1500);
  };

  const handleCancel = () => {
    dispatch({ type: 'CANCEL_LOCK' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Dimming overlay */}
          <motion.div
            className="fixed inset-0 bg-void/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Confirmation card */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-navy-light border-2 border-gold rounded-2xl p-8 md:p-12 text-center max-w-lg mx-4 shadow-gold-intense"
              initial={{ y: -100, scale: 0.8, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 100, scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Lock icon */}
              <motion.div
                className="mx-auto mb-6 w-16 h-16 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center"
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Lock className="w-8 h-8 text-gold" />
              </motion.div>

              {/* Title */}
              <h3 className="font-title text-3xl md:text-4xl font-bold text-gold-gradient mb-4">
                Lock kiya jaye?
              </h3>

              {/* Selected option preview */}
              <p className="font-body text-lg text-ink-white/70 mb-8">
                Your answer: <span className="text-gold font-semibold">{state.selectedOption}</span>
              </p>

              {/* Buttons */}
              <div className="flex gap-4 justify-center">
                <motion.button
                  className="px-8 py-3 bg-gold text-void font-body font-bold rounded-xl text-lg hover:bg-gold-bright transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirm}
                >
                  LOCK IT! 🔒
                </motion.button>
                <motion.button
                  className="px-8 py-3 bg-transparent border-2 border-neutral-line text-ink-white/70 font-body rounded-xl text-lg hover:border-ink-white/50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                >
                  <X className="w-5 h-5 inline mr-2" />
                  Wait
                </motion.button>
              </div>

              {/* Keyboard hint */}
              <p className="mt-4 text-xs text-neutral-line font-body">
                Press Enter to confirm • Esc to go back
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
