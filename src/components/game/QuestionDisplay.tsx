/**
 * QuestionDisplay — Shows the current question with reveal animation
 *
 * Largest element on screen — top-center, generous line-height.
 * Designed for back-of-hall legibility on a 1920×1080 projector.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/lib/GameContext';

export default function QuestionDisplay() {
  const { state } = useGame();
  const question = state.questions[state.currentQuestionIndex];

  if (!question) return null;

  return (
    <div className="w-full max-w-4xl mx-auto text-center">
      {/* Question number badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`qnum-${question.questionNumber}`}
          className="inline-block mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <span className="font-title text-sm md:text-base tracking-[0.3em] uppercase text-gold/70">
            Question
          </span>
          <span className="ml-3 font-title text-2xl md:text-3xl font-bold text-gold-gradient">
            {question.questionNumber}
          </span>
          <span className="ml-2 text-gold/40 font-body text-sm">/ 12</span>
        </motion.div>
      </AnimatePresence>

      {/* Question text */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={`q-${question.questionNumber}`}
          className="font-title text-2xl md:text-3xl lg:text-4xl font-semibold text-ink-white leading-relaxed px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          style={{
            textShadow: '0 2px 20px rgba(232, 200, 107, 0.1)',
          }}
        >
          {question.questionText}
        </motion.h2>
      </AnimatePresence>

      {/* Correct/Wrong message */}
      <AnimatePresence>
        {(state.gameStatus === 'CORRECT' || state.gameStatus === 'WRONG' || state.gameStatus === 'TIMEOUT') && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {state.gameStatus === 'CORRECT' && question.correctMessage && (
              <p className="text-lg md:text-xl font-body text-success-glow">
                {question.correctMessage}
              </p>
            )}
            {(state.gameStatus === 'WRONG' || state.gameStatus === 'TIMEOUT') && (
              <p className="text-lg md:text-xl font-body text-danger-glow">
                {question.wrongMessage || (state.gameStatus === 'TIMEOUT' ? '⏰ Time\'s up!' : 'Oops!')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
