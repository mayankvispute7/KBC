'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGame } from '@/lib/GameContext';
import { OptionLetter, Question } from '@/lib/types';

interface GameEditorOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameEditorOverlay({ isOpen, onClose }: GameEditorOverlayProps) {
  const { state, dispatch } = useGame();
  
  // Local state for the form so we don't dispatch on every keystroke
  const [formData, setFormData] = useState<Question | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(state.questions[state.currentQuestionIndex]);
    }
  }, [isOpen, state.currentQuestionIndex, state.questions]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleCorrectOptionToggle = (letter: OptionLetter) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const options = prev.correctOptions.includes(letter)
        ? prev.correctOptions.filter(o => o !== letter)
        : [...prev.correctOptions, letter];
      return { ...prev, correctOptions: options };
    });
  };

  const handleFiftyFiftyToggle = (letter: OptionLetter) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const current = prev.fiftyFiftyRemove || [];
      const updated = current.includes(letter)
        ? current.filter(o => o !== letter)
        : [...current, letter];
      return { ...prev, fiftyFiftyRemove: updated };
    });
  };

  const handleSave = () => {
    if (formData) {
      dispatch({ 
        type: 'UPDATE_QUESTION_DATA', 
        questionIndex: state.currentQuestionIndex, 
        question: formData 
      });
      onClose();
    }
  };

  const handlePrev = () => {
    if (state.currentQuestionIndex > 0) {
      // Auto-save before jumping if you want, or just jump
      if (formData) {
        dispatch({ type: 'UPDATE_QUESTION_DATA', questionIndex: state.currentQuestionIndex, question: formData });
      }
      dispatch({ type: 'JUMP_TO_QUESTION', index: state.currentQuestionIndex - 1 });
    }
  };

  const handleNext = () => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      if (formData) {
        dispatch({ type: 'UPDATE_QUESTION_DATA', questionIndex: state.currentQuestionIndex, question: formData });
      }
      dispatch({ type: 'JUMP_TO_QUESTION', index: state.currentQuestionIndex + 1 });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-deep-blue border border-gold/30 rounded-2xl p-6 w-full max-w-3xl shadow-gold max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-title text-gold font-bold flex items-center gap-2">
              <Settings className="w-6 h-6" /> Edit Question {formData.questionNumber}
            </h2>
            <button onClick={onClose} className="p-2 text-neutral-line hover:text-danger transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 font-body">
            <div>
              <label className="block text-sm text-gold/80 mb-1">Question Text</label>
              <textarea
                name="questionText"
                value={formData.questionText}
                onChange={handleChange}
                className="w-full bg-void border border-gold/20 rounded-lg p-3 text-ink-white focus:outline-none focus:border-gold"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['A', 'B', 'C', 'D'].map((letter) => {
                const optKey = `option${letter}` as keyof Question;
                return (
                  <div key={letter}>
                    <label className="block text-sm text-gold/80 mb-1">Option {letter}</label>
                    <input
                      type="text"
                      name={optKey}
                      value={formData[optKey] as string}
                      onChange={handleChange}
                      className="w-full bg-void border border-gold/20 rounded-lg p-3 text-ink-white focus:outline-none focus:border-gold"
                    />
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gold/80 mb-2">Correct Options</label>
                <div className="flex gap-2">
                  {(['A', 'B', 'C', 'D'] as OptionLetter[]).map((letter) => (
                    <button
                      key={`correct-${letter}`}
                      onClick={() => handleCorrectOptionToggle(letter)}
                      className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                        formData.correctOptions.includes(letter)
                          ? 'bg-success text-void'
                          : 'bg-void border border-gold/20 text-neutral-line hover:border-gold/50'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gold/80 mb-2">50:50 Remove Options</label>
                <div className="flex gap-2">
                  {(['A', 'B', 'C', 'D'] as OptionLetter[]).map((letter) => (
                    <button
                      key={`fifty-${letter}`}
                      onClick={() => handleFiftyFiftyToggle(letter)}
                      className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                        formData.fiftyFiftyRemove?.includes(letter)
                          ? 'bg-danger text-void'
                          : 'bg-void border border-gold/20 text-neutral-line hover:border-gold/50'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gold/80 mb-1">Timer Duration (Seconds)</label>
              <input
                type="number"
                name="timerDuration"
                value={formData.timerDuration}
                onChange={handleChange}
                className="w-full md:w-1/3 bg-void border border-gold/20 rounded-lg p-3 text-ink-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center border-t border-gold/20 pt-6">
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={state.currentQuestionIndex === 0}
                className="flex items-center px-4 py-2 bg-void border border-gold/30 rounded-lg text-gold hover:bg-gold/10 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Prev
              </button>
              <button
                onClick={handleNext}
                disabled={state.currentQuestionIndex === state.questions.length - 1}
                className="flex items-center px-4 py-2 bg-void border border-gold/30 rounded-lg text-gold hover:bg-gold/10 disabled:opacity-50 transition-colors"
              >
                Next <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
            
            <button
              onClick={handleSave}
              className="flex items-center px-6 py-2 bg-gold text-void font-bold rounded-lg hover:bg-gold-bright transition-colors"
            >
              <Save className="w-5 h-5 mr-2" /> Save & Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
