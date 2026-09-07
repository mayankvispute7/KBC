/**
 * WelcomeSection — First section of the pre-show landing
 *
 * Staggered letter/word reveal for the title, gold light-sweep,
 * "Teachers' Day Special" subtitle fade, and "LET'S START" button
 * that unlocks the Web Audio context.
 */

'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Clapperboard } from 'lucide-react';
import { audioManager } from '@/lib/audio';

interface WelcomeSectionProps {
  onStart: () => void;
}

export default function WelcomeSection({ onStart }: WelcomeSectionProps) {
  useEffect(() => {
    // Attempt to play immediately (usually blocked by browsers)
    audioManager.playHeroSound();

    // Play as soon as user interacts with the page
    const unlockAudio = () => {
      audioManager.playHeroSound();
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const handleStart = () => {
    audioManager.unlock();
    audioManager.stopHeroSound(); // Stop hero sound when starting the game
    audioManager.play('intro');
    onStart();
  };

  const titleWords = ['KAUN', 'BANEGA', 'COLLEGE', 'PATI?', '👑'];

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-4">
      {/* Decorative sparkles */}
      <motion.div
        className="absolute top-20 left-10 text-gold/20"
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <Sparkles className="w-12 h-12" />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-gold/20"
        animate={{ rotate: -360, scale: [1, 1.3, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      >
        <Sparkles className="w-16 h-16" />
      </motion.div>

      {/* Main title & Logo — word-by-word stagger */}
      <div className="text-center mb-8 overflow-hidden flex flex-col items-center">
        {/* Logo with Shine/Glow Effect */}
        <motion.div 
          className="relative mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Radial glow behind logo */}
          <div className="absolute inset-0 bg-gold/30 blur-[60px] rounded-full scale-150 animate-pulse" />
          <Image 
            src="/KBCLOGO.png" 
            alt="KBC Logo" 
            width={280} 
            height={280} 
            className="relative z-10 drop-shadow-[0_0_20px_rgba(232,200,107,0.5)]"
            priority
          />
        </motion.div>

        <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-4 max-w-4xl">
          {titleWords.map((word, i) => (
            <motion.span
              key={`title-${i}`}
              className="font-title text-3xl md:text-5xl lg:text-6xl font-black text-gold-embossed"
              initial={{ y: 50, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{
                delay: 0.3 + i * 0.15,
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        {/* Gold shimmer sweep */}
        <motion.div
          className="h-1 mx-auto mt-4 rounded-full bg-gold-shimmer"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '80%', opacity: 1 }}
          transition={{ delay: 1.5, duration: 1, ease: 'easeOut' }}
          style={{ maxWidth: '600px', backgroundSize: '200% 100%' }}
        />
      </div>

      {/* Subtitle */}
      <motion.p
        className="font-body text-lg md:text-xl text-ink-white/60 text-center mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        Where knowledge meets attendance shortage.
      </motion.p>

      {/* Teachers' Day badge */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.2, duration: 0.5 }}
      >
        <div className="px-6 py-2 border border-gold/30 rounded-full bg-gold/5">
          <span className="font-title text-sm md:text-base tracking-[0.2em] text-gold">
            TEACHERS&apos; DAY SPECIAL 👑
          </span>
        </div>
      </motion.div>

      {/* Credits line */}
      <motion.p
        className="font-body text-sm text-ink-white/30 text-center mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.5 }}
      >
        Hosted by: Literally Every Student Ever • Powered by: 100% Attendance Dreams
      </motion.p>

      {/* Clapperboard line */}
      <motion.div
        className="flex items-center gap-2 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 0.5 }}
      >
        <Clapperboard className="w-5 h-5 text-gold/40" />
        <span className="font-body text-sm text-ink-white/40">
          🎬 Lights. Camera. Attendance. 🎬
        </span>
        <Clapperboard className="w-5 h-5 text-gold/40" />
      </motion.div>

      {/* LET'S START button — unlocks Web Audio */}
      <motion.button
        className="px-10 py-4 bg-gold text-void font-body font-bold rounded-2xl text-xl shadow-gold-intense hover:bg-gold-bright transition-all duration-300"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 0.5 }}
        whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(232, 200, 107, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStart}
      >
        LET&apos;S START 🎬
      </motion.button>
    </section>
  );
}
