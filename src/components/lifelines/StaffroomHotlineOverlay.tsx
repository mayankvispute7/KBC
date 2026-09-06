/**
 * StaffroomHotlineOverlay — Cinematic phone call sequence
 *
 * "CALLING STAFFROOM…" → "CONNECTING…" → "CONNECTED ☎️"
 * No real telephony — the host narrates live.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X } from 'lucide-react';
import { useGame } from '@/lib/GameContext';
import { audioManager } from '@/lib/audio';

type CallPhase = 'calling' | 'connecting' | 'connected';

export default function StaffroomHotlineOverlay() {
  const { state, dispatch } = useGame();
  const isVisible = state.activeLifeline === 'hotline';
  const [phase, setPhase] = useState<CallPhase>('calling');
  const [note, setNote] = useState('');

  // Auto-advance through call phases
  useEffect(() => {
    if (!isVisible) {
      setPhase('calling');
      setNote('');
      return;
    }

    const timer1 = setTimeout(() => setPhase('connecting'), 1500);
    const timer2 = setTimeout(() => {
      setPhase('connected');
      audioManager.play('hotlineConnect');
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isVisible]);

  const handleClose = () => {
    if (note.trim()) {
      dispatch({ type: 'SET_HOST_NOTE', key: `hotline_q${state.currentQuestionIndex}`, note });
    }
    dispatch({ type: 'CLOSE_LIFELINE' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            className="fixed inset-0 bg-void/80 z-40"
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
              {/* Phone icon with ring animation */}
              <motion.div
                className="mx-auto mb-6 w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center"
                animate={phase !== 'connected' ? {
                  rotate: [0, -15, 15, -15, 15, 0],
                  scale: [1, 1.1, 1],
                } : { rotate: 0, scale: 1 }}
                transition={phase !== 'connected' ? {
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                } : {}}
              >
                <Phone className={`w-10 h-10 ${phase === 'connected' ? 'text-success' : 'text-gold'}`} />
              </motion.div>

              {/* Phase text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {phase === 'calling' && (
                    <h3 className="font-title text-3xl md:text-4xl font-bold text-gold-gradient">
                      Calling Staffroom… ☎️
                    </h3>
                  )}
                  {phase === 'connecting' && (
                    <>
                      <h3 className="font-title text-3xl md:text-4xl font-bold text-gold-gradient">
                        Connecting…
                      </h3>
                      <motion.div
                        className="mt-4 flex justify-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-3 h-3 rounded-full bg-gold"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </motion.div>
                    </>
                  )}
                  {phase === 'connected' && (
                    <>
                      <h3 className="font-title text-3xl md:text-4xl font-bold text-success-glow">
                        Connected ☎️
                      </h3>
                      <p className="mt-2 font-body text-sm text-ink-white/40 italic">
                        &quot;Direct staffroom call. Wahan already chai chal rahi hai.&quot;
                      </p>

                      {/* Host note */}
                      <motion.div
                        className="mt-6 text-left"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="block text-sm text-neutral-line font-body mb-2">
                          Faculty suggestion (optional):
                        </label>
                        <textarea
                          className="w-full bg-navy border border-neutral-line/50 rounded-lg p-3 text-ink-white font-body text-sm resize-none focus:border-gold/50 focus:outline-none transition-colors"
                          rows={3}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="e.g., Prof. Sharma says Option C"
                        />
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Close button (only when connected) */}
              {phase === 'connected' && (
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    className="px-6 py-2.5 bg-gold/10 border border-gold/30 text-gold font-body rounded-xl hover:bg-gold/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                  >
                    End Call & Continue
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
