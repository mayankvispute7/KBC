/**
 * Timer — Countdown display using timerEnd-based computation
 *
 * Never uses setInterval for state — uses requestAnimationFrame and computes
 * remaining time as Math.max(0, timerEnd - Date.now()) every frame.
 * This makes the timer self-correcting across dropped frames.
 *
 * Visual: circular progress ring with monospace digit readout.
 * Last 5 seconds trigger a warning pulse and sound cue.
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/lib/GameContext';
import { audioManager } from '@/lib/audio';

export default function Timer() {
  const { state, dispatch } = useGame();
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [totalMs, setTotalMs] = useState<number>(30000);
  const rafRef = useRef<number>(0);
  const lastTickSoundRef = useRef<number>(-1);

  const question = state.questions[state.currentQuestionIndex];

  // Set total duration when question changes
  useEffect(() => {
    if (question) {
      setTotalMs(question.timerDuration * 1000);
    }
  }, [question]);

  // Handle looping timer sound
  useEffect(() => {
    if (state.timerRunning) {
      audioManager.startTimerSound();
    } else {
      audioManager.stopTimerSound();
    }
    return () => {
      audioManager.stopTimerSound();
    };
  }, [state.timerRunning]);

  // RAF-based timer loop
  useEffect(() => {
    if (!state.timerRunning || !state.timerEnd) {
      setRemainingMs(state.remainingAtPauseMs ?? (question ? question.timerDuration * 1000 : 30000));
      return;
    }

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, state.timerEnd! - now);
      setRemainingMs(remaining);

      // Timer expired
      if (remaining <= 0) {
        dispatch({ type: 'TIMER_EXPIRED' });
        audioManager.play('wrong');
        return;
      }

      // Last 5 seconds warning tick sound
      const secondsLeft = Math.ceil(remaining / 1000);
      if (secondsLeft <= 5 && secondsLeft !== lastTickSoundRef.current) {
        lastTickSoundRef.current = secondsLeft;
        audioManager.play('timerWarning');
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    lastTickSoundRef.current = -1;

    return () => cancelAnimationFrame(rafRef.current);
  }, [state.timerRunning, state.timerEnd, state.remainingAtPauseMs, dispatch, question]);

  const seconds = Math.ceil(remainingMs / 1000);
  const progress = totalMs > 0 ? remainingMs / totalMs : 1;
  const isWarning = seconds <= 5 && state.timerRunning;
  const isActive = state.timerRunning;

  // SVG circle properties
  const size = 120;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="relative"
        animate={isWarning ? {
          scale: [1, 1.05, 1],
        } : { scale: 1 }}
        transition={isWarning ? {
          duration: 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        } : {}}
      >
        {/* SVG Ring */}
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2A3352"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isWarning ? '#E85B5B' : isActive ? '#E8C86B' : '#2A3352'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: isWarning
                ? 'drop-shadow(0 0 8px rgba(232, 91, 91, 0.6))'
                : isActive
                ? 'drop-shadow(0 0 6px rgba(232, 200, 107, 0.4))'
                : 'none',
            }}
          />
        </svg>

        {/* Digit readout */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`
              font-mono text-4xl font-bold tabular-nums
              ${isWarning ? 'text-danger' : isActive ? 'text-gold' : 'text-neutral-line'}
            `}
          >
            {seconds}
          </span>
        </div>
      </motion.div>

      {/* Timer label */}
      <AnimatePresence>
        {!isActive && state.gameStatus === 'QUESTION' && (
          <motion.p
            className="mt-2 text-xs text-neutral-line font-body uppercase tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Press Enter to start
          </motion.p>
        )}
      </AnimatePresence>

      {/* Timer stopped indicator */}
      <AnimatePresence>
        {state.gameStatus === 'LOCKED' && (
          <motion.p
            className="mt-2 text-xs text-gold/60 font-body uppercase tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Timer stopped
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
