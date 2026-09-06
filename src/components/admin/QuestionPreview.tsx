'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Question, OptionLetter } from '@/lib/types';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import OptionCard from '@/components/game/OptionCard';
import { GameContext } from '@/lib/GameContext';
import { useMemo } from 'react';

interface QuestionPreviewProps {
  question: Question;
  onClose: () => void;
}

export default function QuestionPreview({ question, onClose }: QuestionPreviewProps) {
  // Create a mock state to render the game components
  const mockState = useMemo(() => {
    return {
      currentQuestionIndex: 0,
      selectedOption: null,
      lockedOption: null,
      timerEnd: null,
      remainingAtPauseMs: null,
      timerRunning: false,
      usedLifelines: { fiftyFifty: false, audiencePoll: false, askStudent: false, hotline: false },
      fiftyFiftyRemoved: null,
      gameStatus: 'QUESTION' as const,
      currentChocolateLevel: 1,
      sessionId: 'preview',
      questions: [question],
      preGameStatus: null,
      soundEnabled: false,
      activeLifeline: null,
      hostNotes: {},
      adminOpen: false,
      adminVerified: false,
    };
  }, [question]);

  return (
    <motion.div
      className="fixed inset-0 bg-void/95 z-[80] flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-6xl relative bg-navy border-2 border-gold/30 rounded-2xl overflow-hidden flex flex-col shadow-2xl h-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-line/30 bg-navy-light shrink-0">
          <h3 className="font-title text-xl font-bold text-gold-gradient">
            Preview: Q{question.questionNumber}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-neutral-line/20 flex items-center justify-center text-ink-white/50 hover:text-ink-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scaled-down Game Screen container */}
        <div className="flex-1 overflow-auto bg-void relative p-8 flex flex-col items-center justify-center">
          <GameContext.Provider value={{ state: mockState, dispatch: () => {} }}>
            <div className="w-full max-w-5xl">
              <div className="mb-8 w-full">
                <QuestionDisplay />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
                {(['A', 'B', 'C', 'D'] as OptionLetter[]).map((letter) => {
                  const getOptionText = (l: OptionLetter) => {
                    switch (l) {
                      case 'A': return question.optionA;
                      case 'B': return question.optionB;
                      case 'C': return question.optionC;
                      case 'D': return question.optionD;
                    }
                  };
                  return (
                    <OptionCard
                      key={letter}
                      letter={letter}
                      text={getOptionText(letter)}
                      state="DEFAULT"
                      onClick={() => {}}
                    />
                  );
                })}
              </div>
            </div>
          </GameContext.Provider>
        </div>
      </div>
    </motion.div>
  );
}
