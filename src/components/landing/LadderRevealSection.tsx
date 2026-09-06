/**
 * LadderRevealSection — Chocolate ladder animates up sequentially
 *
 * All 12 levels animate from bottom, level 1 first, level 12 last.
 * Each has a gold shimmer as it settles. After reveal completes,
 * shows "BEGIN THE HOTSEAT" button to enter fullscreen game mode.
 */

'use client';

import { motion } from 'framer-motion';
import { Trophy, Crown } from 'lucide-react';
import { getChocolateLadder } from '@/lib/types';

interface LadderRevealSectionProps {
  onBegin: () => void;
}

export default function LadderRevealSection({ onBegin }: LadderRevealSectionProps) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      {/* Section title */}
      <motion.div
        className="flex items-center gap-3 mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <Trophy className="w-8 h-8 text-gold" />
        <h2 className="font-title text-3xl md:text-4xl font-bold text-gold-gradient">
          THE CHOCOLATE LADDER 🍫
        </h2>
        <Trophy className="w-8 h-8 text-gold" />
      </motion.div>

      {/* Ladder */}
      <div className="flex flex-col-reverse gap-2 max-w-md w-full mb-12">
        {getChocolateLadder().map((tier, index) => (
          <motion.div
            key={tier.level}
            className={`
              flex items-center gap-3 px-5 py-3 rounded-xl border transition-all
              ${tier.isMilestone
                ? 'border-gold/50 bg-gold/10'
                : 'border-neutral-line/30 bg-navy-light/50'}
            `}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{
              delay: index * 0.1,
              duration: 0.5,
              ease: 'easeOut',
            }}
          >
            {/* Level badge */}
            <div
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
                ${tier.isMilestone
                  ? 'bg-gold text-void'
                  : 'bg-neutral-line/30 text-ink-white/50'}
              `}
            >
              {tier.level}
            </div>

            {/* Label */}
            <span
              className={`
                font-body text-base md:text-lg
                ${tier.isMilestone
                  ? 'text-gold font-semibold'
                  : 'text-ink-white/70'}
              `}
            >
              {tier.label}
            </span>

            {/* Milestone icon */}
            {tier.level === 12 && (
              <Crown className="w-5 h-5 text-gold ml-auto" />
            )}

            {/* Gold shimmer on reveal */}
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: [0, 0.3, 0] }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
            >
              <div className="w-full h-full bg-gold-shimmer" style={{ backgroundSize: '200% 100%' }} />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* BEGIN THE HOTSEAT button */}
      <motion.button
        className="px-10 py-4 bg-gold text-void font-body font-bold rounded-2xl text-xl shadow-gold-intense hover:bg-gold-bright transition-all duration-300"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.5, duration: 0.5 }}
        whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(232, 200, 107, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        onClick={onBegin}
      >
        BEGIN THE HOTSEAT 🔥
      </motion.button>
    </section>
  );
}
