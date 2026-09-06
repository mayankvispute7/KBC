/**
 * PauseOverlay — "Back in a moment" card shown when host presses P
 *
 * Dims the screen and freezes the timer. Timer remaining is stored
 * in state.remainingAtPauseMs and restored on unpause.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useGame } from '@/lib/GameContext';

export default function PauseOverlay() {
  const { state, dispatch } = useGame();
  const isVisible = state.gameStatus === 'PAUSED';

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Heavy dim */}
          <motion.div
            className="fixed inset-0 bg-void/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Card */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[51]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <motion.div
                className="mx-auto mb-6 w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/20 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Pause className="w-10 h-10 text-gold" />
              </motion.div>

              <h2 className="font-title text-4xl md:text-5xl font-bold text-gold-gradient mb-4">
                Back in a moment
              </h2>

              <p className="font-body text-lg text-ink-white/50 mb-8">
                Game is paused
              </p>

              <motion.button
                className="px-8 py-3 bg-gold/10 border-2 border-gold/30 text-gold font-body font-semibold rounded-xl text-lg hover:bg-gold/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch({ type: 'UNPAUSE' })}
              >
                <Play className="w-5 h-5 inline mr-2" />
                Resume (P)
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
