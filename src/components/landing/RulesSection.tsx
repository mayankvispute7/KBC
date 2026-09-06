/**
 * RulesSection — 5 rules revealed with alternating slide-in animation
 *
 * Each rule slides in from alternating sides with a soft gold underglow on entry.
 * Rules are from the master brief §10.
 */

'use client';

import { motion } from 'framer-motion';
import { ScrollText } from 'lucide-react';

const RULES = [
  { emoji: '🏃', text: 'Har question ka answer dena COMPULSORY hai. Bhaagna allowed nahi hai.' },
  { emoji: '💀', text: 'Confidence marks nahi deta. Confidence toh exam mein bhi nahi deta tha.' },
  { emoji: '😌', text: 'Galat answer pe koi FAIL nahi hoga. Aaj din hai Teachers\' Day ka.' },
  { emoji: '📚', text: 'Faculty privilege: "I know this because I AM faculty."' },
  { emoji: '🗿', text: '"Lock kiya jaye?" bolne ke baad REGRET allowed nahi hai.' },
];

export default function RulesSection() {
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
        <ScrollText className="w-8 h-8 text-gold" />
        <h2 className="font-title text-3xl md:text-4xl font-bold text-gold-gradient">
          THE RULES
        </h2>
        <ScrollText className="w-8 h-8 text-gold" />
      </motion.div>

      {/* Rules list */}
      <div className="max-w-3xl w-full space-y-6">
        {RULES.map((rule, index) => (
          <motion.div
            key={index}
            className="relative group"
            initial={{
              opacity: 0,
              x: index % 2 === 0 ? -60 : 60,
            }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.6,
              delay: index * 0.15,
              ease: 'easeOut',
            }}
          >
            {/* Gold underglow on entry */}
            <div className="absolute inset-0 rounded-xl bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex items-start gap-4 p-5 md:p-6 rounded-xl border border-neutral-line/30 bg-navy-light/50">
              {/* Rule number */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                <span className="font-title font-bold text-gold text-sm">{index + 1}</span>
              </div>

              {/* Rule text */}
              <p className="font-body text-lg md:text-xl text-ink-white/80 leading-relaxed">
                {rule.text} {rule.emoji}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
