/**
 * GameScreen — Main orchestrator for the in-game question UI
 *
 * Layout priority (largest to smallest, per game-show hierarchy):
 * 1. Question text — top-center, generous line-height
 * 2. Four options — 2×2 grid with gold badges
 * 3. Timer — top-right, circular countdown
 * 4. Lifeline bar — bottom, 4 icon+label chips
 * 5. Chocolate ladder — side rail, current level highlighted
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useGame } from '@/lib/GameContext';
import { getOptionState, isAnswerCorrect } from '@/lib/gameState';
import { audioManager } from '@/lib/audio';
import type { OptionLetter } from '@/lib/types';
import QuestionDisplay from './QuestionDisplay';
import OptionCard from './OptionCard';
import Timer from './Timer';
import LifelineBar from './LifelineBar';
import ChocolateLadder from './ChocolateLadder';
import LockConfirmation from './LockConfirmation';
import PauseOverlay from './PauseOverlay';
import FiftyFiftyOverlay from '@/components/lifelines/FiftyFiftyOverlay';
import AudiencePollOverlay from '@/components/lifelines/AudiencePollOverlay';
import AskStudentOverlay from '@/components/lifelines/AskStudentOverlay';
import StaffroomHotlineOverlay from '@/components/lifelines/StaffroomHotlineOverlay';
import GrandFinale from '@/components/finale/GrandFinale';
import GameEditorOverlay from './GameEditorOverlay';

const OPTIONS: OptionLetter[] = ['A', 'B', 'C', 'D'];

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const question = state.questions[state.currentQuestionIndex];
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleOptionClick = useCallback((option: OptionLetter) => {
    audioManager.play('optionSelect');
    dispatch({ type: 'SELECT_OPTION', option });
  }, [dispatch]);

  // Audio trigger for CORRECT/WRONG reveal
  useEffect(() => {
    if (state.gameStatus === 'CORRECT') {
      audioManager.play('correct');
    } else if (state.gameStatus === 'WRONG') {
      audioManager.play('wrong');
    }
  }, [state.gameStatus]);

  const handleAdvance = useCallback(() => {
    const { gameStatus } = state;

    switch (gameStatus) {
      case 'QUESTION':
        if (question) {
          dispatch({ type: 'START_TIMER', duration: question.timerDuration });
        }
        break;
      case 'OPTION_SELECTED':
        dispatch({ type: 'REQUEST_LOCK' });
        break;
      case 'CORRECT':
      case 'WRONG':
      case 'TIMEOUT':
        dispatch({ type: 'NEXT_QUESTION' });
        break;
      case 'NEXT_TRANSITION':
        audioManager.play('questionReveal');
        dispatch({ type: 'SET_STATUS', status: 'QUESTION' });
        break;
    }
  }, [state, dispatch, question]);

  if (!question) return null;

  const getOptionText = (letter: OptionLetter): string => {
    switch (letter) {
      case 'A': return question.optionA;
      case 'B': return question.optionB;
      case 'C': return question.optionC;
      case 'D': return question.optionD;
    }
  };

  // Next transition screen
  if (state.gameStatus === 'NEXT_TRANSITION') {
    return (
      <div className="flex items-center justify-center min-h-screen relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-title text-3xl md:text-4xl font-bold text-gold-gradient mb-4">
            Question {state.currentQuestionIndex + 1}
          </h2>
          <p className="font-body text-lg text-ink-white/50 mb-8">
            Level {state.currentChocolateLevel} / 12
          </p>
          <motion.button
            className="px-8 py-3 bg-gold text-void font-body font-bold rounded-xl text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdvance}
          >
            Show Question (Enter)
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Finale / Complete
  if (state.gameStatus === 'FINALE' || state.gameStatus === 'COMPLETE') {
    return <GrandFinale />;
  }

  // Main game layout
  return (
    <div className="min-h-screen flex relative z-10">
      {/* Chocolate Ladder — Left sidebar */}
      <div className="hidden lg:flex flex-col justify-center items-center w-[240px] p-4 border-r border-neutral-line/20 relative">
        <button 
          onClick={() => setIsEditorOpen(true)}
          className="absolute top-4 left-4 p-3 bg-gold text-void rounded-full hover:bg-gold-bright hover:scale-105 transition-all z-20 shadow-[0_0_15px_rgba(232,200,107,0.5)]"
          title="Edit Game Settings"
        >
          <Settings className="w-6 h-6" />
        </button>
        <ChocolateLadder />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-8 min-h-screen relative">
        {/* Mobile Settings Button (visible only when sidebar is hidden) */}
        <button 
          onClick={() => setIsEditorOpen(true)}
          className="lg:hidden absolute top-4 left-4 p-3 bg-gold text-void rounded-full hover:bg-gold-bright hover:scale-105 transition-all z-20 shadow-[0_0_15px_rgba(232,200,107,0.5)]"
          title="Edit Game Settings"
        >
          <Settings className="w-6 h-6" />
        </button>
        {/* Top: Timer */}
        <div className="w-full flex justify-end mb-4">
          <Timer />
        </div>

        {/* Center: Question + Options */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl">
          {/* Question */}
          <div className="mb-8 w-full">
            <QuestionDisplay />
          </div>

          {/* Options 2×2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
            {OPTIONS.map((letter) => (
              <OptionCard
                key={letter}
                letter={letter}
                text={getOptionText(letter)}
                state={getOptionState(state, letter)}
                onClick={() => handleOptionClick(letter)}
                disabled={
                  state.gameStatus === 'LOCKED' ||
                  state.gameStatus === 'LOCK_CONFIRMATION' ||
                  state.gameStatus === 'ANSWER_REVEAL' ||
                  state.gameStatus === 'CORRECT' ||
                  state.gameStatus === 'WRONG' ||
                  state.gameStatus === 'TIMEOUT'
                }
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex gap-4 items-center">
            {/* Start Timer button */}
            <AnimatePresence>
              {state.gameStatus === 'QUESTION' && !state.timerRunning && (
                <motion.button
                  className="px-6 py-2.5 bg-gold/10 border border-gold/30 text-gold font-body rounded-xl hover:bg-gold/20 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => question && dispatch({ type: 'START_TIMER', duration: question.timerDuration })}
                >
                  Start Timer (Enter)
                </motion.button>
              )}
            </AnimatePresence>

            {/* Lock button */}
            <AnimatePresence>
              {state.gameStatus === 'OPTION_SELECTED' && (
                <motion.button
                  className="px-8 py-3 bg-gold text-void font-body font-bold rounded-xl text-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => dispatch({ type: 'REQUEST_LOCK' })}
                >
                  Lock Answer (Enter) 🔒
                </motion.button>
              )}
            </AnimatePresence>

            {/* Next button */}
            <AnimatePresence>
              {(state.gameStatus === 'CORRECT' || state.gameStatus === 'WRONG' || state.gameStatus === 'TIMEOUT') && (
                <motion.button
                  className="px-8 py-3 bg-gold text-void font-body font-bold rounded-xl text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => dispatch({ type: 'NEXT_QUESTION' })}
                >
                  Next Question (N)
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom: Lifeline bar */}
        <div className="w-full flex justify-center mt-4 pb-4">
          <LifelineBar />
        </div>
      </div>

      {/* Overlays */}
      <LockConfirmation />
      <PauseOverlay />
      <FiftyFiftyOverlay />
      <AudiencePollOverlay />
      <AskStudentOverlay />
      <StaffroomHotlineOverlay />

      {/* Full-screen correct flash */}
      <AnimatePresence>
        {state.gameStatus === 'CORRECT' && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.3 }}
            style={{ backgroundColor: '#3DDC84' }}
          />
        )}
      </AnimatePresence>

      {/* Status label overlay */}
      <AnimatePresence>
        {state.gameStatus === 'LOCKED' && (
          <motion.div
            className="fixed top-8 left-1/2 -translate-x-1/2 z-30"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="px-8 py-3 bg-gold/10 border-2 border-gold rounded-2xl shadow-gold-intense">
              <span className="font-title text-2xl font-bold text-gold-gradient tracking-wider">
                FINAL ANSWER 🔒
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.gameStatus === 'CORRECT' && (
          <motion.div
            className="fixed top-8 left-1/2 -translate-x-1/2 z-30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="px-8 py-3 bg-success/10 border-2 border-success rounded-2xl shadow-success">
              <span className="font-title text-2xl font-bold text-success-glow tracking-wider">
                ✅ CORRECT!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(state.gameStatus === 'WRONG' || state.gameStatus === 'TIMEOUT') && (
          <motion.div
            className="fixed top-8 left-1/2 -translate-x-1/2 z-30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="px-8 py-3 bg-danger/10 border-2 border-danger rounded-2xl shadow-danger">
              <span className="font-title text-2xl font-bold text-danger-glow tracking-wider">
                {state.gameStatus === 'TIMEOUT' ? '⏰ TIME\'S UP!' : '❌ WRONG!'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GameEditorOverlay isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} />
    </div>
  );
}
