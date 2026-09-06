/**
 * AskStudentOverlay — Cinematic "Ask a Student" lifeline
 *
 * Shows a cinematic card with optional hostNote field.
 * No real audience integration — the host narrates live.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandHelping, X } from 'lucide-react';
import { useGame } from '@/lib/GameContext';

export default function AskStudentOverlay() {
  const { state, dispatch } = useGame();
  const isVisible = state.activeLifeline === 'askStudent';
  const [note, setNote] = useState('');

  const handleClose = () => {
    if (note.trim()) {
      dispatch({ type: 'SET_HOST_NOTE', key: `askStudent_q${state.currentQuestionIndex}`, note });
    }
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
              className="bg-navy-light border-2 border-gold/30 rounded-2xl p-8 md:p-12 max-w-lg w-full mx-4 shadow-gold"
              initial={{ y: 50, scale: 0.9, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 50, scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <HandHelping className="w-8 h-8 text-gold" />
                  <h3 className="font-title text-2xl md:text-3xl font-bold text-gold-gradient">
                    Ask a Student 🙋
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

              {/* Instruction */}
              <motion.p
                className="font-body text-xl text-ink-white/80 mb-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Choose a student from the audience
              </motion.p>

              <motion.p
                className="font-body text-sm text-ink-white/40 mb-6 text-center italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                &quot;Backbencher se pooch liya toh hum zimmedar nahi.&quot;
              </motion.p>

              {/* Host note (optional) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm text-neutral-line font-body mb-2">
                  Host Note (optional — who was asked, what they said):
                </label>
                <textarea
                  className="w-full bg-navy border border-neutral-line/50 rounded-lg p-3 text-ink-white font-body text-sm resize-none focus:border-gold/50 focus:outline-none transition-colors"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., Asked Rahul from CSE — he said Option B"
                />
              </motion.div>

              {/* Continue button */}
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
