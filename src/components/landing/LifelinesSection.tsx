/**
 * LifelinesSection — 2×2 grid of lifeline cards
 *
 * Each card flips/fades in with a stagger — icon first, then title, then tagline.
 * From the master brief §10.
 */

'use client';

import { motion } from 'framer-motion';
import { Dice3, BarChart3, HandHelping, Phone, Zap } from 'lucide-react';

const LIFELINES = [
  {
    icon: <Dice3 className="w-10 h-10" />,
    emoji: '🎲',
    title: '50–50',
    tagline: 'Do galat options gayab. Baaki do mein se confusion aapka apna hai.',
  },
  {
    icon: <BarChart3 className="w-10 h-10" />,
    emoji: '📊',
    title: 'Audience Poll',
    tagline: 'Students vote karenge. Accuracy ki guarantee zero hai.',
  },
  {
    icon: <HandHelping className="w-10 h-10" />,
    emoji: '🙋',
    title: 'Ask a Student',
    tagline: 'Backbencher se pooch liya toh hum zimmedar nahi.',
  },
  {
    icon: <Phone className="w-10 h-10" />,
    emoji: '☎️',
    title: 'Staffroom Hotline',
    tagline: 'Direct staffroom call. Wahan already chai chal rahi hai.',
  },
];

export default function LifelinesSection() {
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
        <Zap className="w-8 h-8 text-gold" />
        <h2 className="font-title text-3xl md:text-4xl font-bold text-gold-gradient">
          YOUR LIFELINES
        </h2>
        <Zap className="w-8 h-8 text-gold" />
      </motion.div>

      {/* 2×2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {LIFELINES.map((lifeline, index) => (
          <motion.div
            key={lifeline.title}
            className="relative p-6 md:p-8 rounded-2xl border border-neutral-line/30 bg-navy-light/50 group overflow-hidden"
            initial={{ opacity: 0, y: 40, rotateY: -15 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.6,
              delay: index * 0.15,
              ease: 'easeOut',
            }}
          >
            {/* Hover glow */}
            <div className="absolute inset-0 rounded-2xl bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Icon */}
            <motion.div
              className="text-gold mb-4"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.15, duration: 0.4 }}
            >
              {lifeline.icon}
            </motion.div>

            {/* Title */}
            <motion.h3
              className="font-title text-xl md:text-2xl font-bold text-gold-gradient mb-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.15, duration: 0.4 }}
            >
              {lifeline.title} {lifeline.emoji}
            </motion.h3>

            {/* Tagline */}
            <motion.p
              className="font-body text-sm md:text-base text-ink-white/60 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + index * 0.15, duration: 0.4 }}
            >
              &quot;{lifeline.tagline}&quot;
            </motion.p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
