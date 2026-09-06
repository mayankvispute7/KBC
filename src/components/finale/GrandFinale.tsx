/**
 * GrandFinale — The most cinematic sequence in the entire app
 *
 * Denser gold particle burst, theatrical word-by-word title reveal,
 * crown icon animating in with light rays, richest sound cue.
 *
 * Flow: "THE GRAND FINALE ❤️" → "SAHI JAWAB… aur dil ka bhi. ❤️"
 *       → Congratulations / College Pati crowning → COMPLETE
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Heart, Sparkles } from 'lucide-react';
import { useGame } from '@/lib/GameContext';
import { audioManager } from '@/lib/audio';

type FinalePhase = 'grandFinale' | 'sahiJawab' | 'congratulations';

export default function GrandFinale() {
  const { state, dispatch } = useGame();
  const isVisible = state.gameStatus === 'FINALE' || state.gameStatus === 'COMPLETE';
  const [phase, setPhase] = useState<FinalePhase>('grandFinale');

  useEffect(() => {
    if (state.gameStatus !== 'FINALE') return;

    setPhase('grandFinale');
    audioManager.play('finale');

    const timer1 = setTimeout(() => setPhase('sahiJawab'), 3500);
    const timer2 = setTimeout(() => {
      setPhase('congratulations');
      dispatch({ type: 'COMPLETE_GAME' });
    }, 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [state.gameStatus, dispatch]);

  if (!isVisible) return null;

  const congratsText = [
    'CONGRATULATIONS! 🎉',
    'Aap officially ban chuke hain…',
    '👑 COLLEGE PATI 👑',
    '"Because teaching us was already a million-dollar job."',
    '',
    'Happy Teachers\' Day ❤️',
    'Thank you for surviving us. 🫡',
    '',
    '— With chaos, attendance excuses & love,',
    'Your Students 💌',
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-void"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Dense gold particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={`finale-particle-${i}`}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              background: `hsl(${35 + Math.random() * 20}, 70%, ${60 + Math.random() * 30}%)`,
            }}
            initial={{
              top: '110%',
              opacity: 0,
              scale: Math.random() * 2 + 0.5,
            }}
            animate={{
              top: `${Math.random() * -20}%`,
              opacity: [0, 1, 1, 0],
              rotate: Math.random() * 720,
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Light rays from center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            className="absolute w-[2px] origin-center"
            style={{
              height: '120vh',
              background: 'linear-gradient(180deg, transparent, rgba(232, 200, 107, 0.1), transparent)',
              rotate: `${i * 45}deg`,
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: [0, 0.5, 0.3], scaleY: 1 }}
            transition={{
              duration: 2,
              delay: 0.5 + i * 0.1,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Phase 1: THE GRAND FINALE */}
        {phase === 'grandFinale' && (
          <motion.div
            key="grand-finale"
            className="text-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
            >
              <Crown className="w-20 h-20 md:w-28 md:h-28 text-gold mx-auto mb-6" />
            </motion.div>

            <div className="overflow-hidden">
              {'THE GRAND FINALE ❤️'.split(' ').map((word, i) => (
                <motion.span
                  key={`word-${i}`}
                  className="inline-block font-title text-4xl md:text-6xl lg:text-7xl font-black text-gold-embossed mx-2"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.5 + i * 0.2,
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Phase 2: SAHI JAWAB */}
        {phase === 'sahiJawab' && (
          <motion.div
            key="sahi-jawab"
            className="text-center z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-gold" />
              <span className="text-2xl">🎉</span>
              <Sparkles className="w-8 h-8 text-gold" />
            </motion.div>

            <h2 className="font-title text-3xl md:text-5xl lg:text-6xl font-bold text-gold-gradient leading-relaxed">
              SAHI JAWAB…
            </h2>
            <motion.p
              className="mt-4 font-title text-2xl md:text-4xl text-success-glow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              aur dil ka bhi. ❤️
            </motion.p>
          </motion.div>
        )}

        {/* Phase 3: CONGRATULATIONS */}
        {phase === 'congratulations' && (
          <motion.div
            key="congratulations"
            className="text-center z-10 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Crown with light rays */}
            <motion.div
              className="relative mx-auto mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Crown className="w-24 h-24 md:w-32 md:h-32 text-gold mx-auto" />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div
                  className="w-40 h-40 md:w-52 md:h-52 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(232, 200, 107, 0.2) 0%, transparent 70%)',
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Text lines with stagger */}
            {congratsText.map((line, i) => (
              <motion.p
                key={`congrats-${i}`}
                className={`
                  font-body leading-relaxed mb-2
                  ${i === 0 ? 'font-title text-3xl md:text-5xl font-bold text-gold-gradient' :
                    i === 2 ? 'font-title text-4xl md:text-6xl font-black text-gold-embossed my-4' :
                    i === 3 ? 'text-lg md:text-xl text-ink-white/60 italic' :
                    i === 5 ? 'text-2xl md:text-3xl text-danger-glow mt-6' :
                    i === 6 ? 'text-xl text-ink-white/70' :
                    i === 8 ? 'text-sm text-ink-white/40 mt-6' :
                    i === 9 ? 'text-lg text-gold font-semibold' :
                    line === '' ? '' :
                    'text-xl text-ink-white/80'}
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + i * 0.25,
                  duration: 0.5,
                  ease: 'easeOut',
                }}
              >
                {line}
              </motion.p>
            ))}

            {/* Hearts animation */}
            <motion.div
              className="flex justify-center gap-4 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`heart-${i}`}
                  animate={{
                    y: [0, -10, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  <Heart className="w-6 h-6 text-danger fill-danger" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
