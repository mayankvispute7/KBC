/**
 * Kaun Banega College Pati — Keyboard Controls Hook
 *
 * Implements all host keyboard shortcuts from Architecture.md §7.
 * Crucially, all shortcuts no-op when focus is inside an input/textarea/contentEditable
 * element — tested explicitly including inside the admin form.
 *
 * Shortcut Map:
 *   1-4        → Select option A/B/C/D
 *   Enter/Space → Context-sensitive advance (lock → confirm → continue)
 *   N          → Next question (only after question is resolved)
 *   F          → Toggle fullscreen
 *   P          → Pause / Unpause
 *   Shift+A    → Open Admin PIN prompt
 *   R          → Reset game (with confirmation)
 */

'use client';

import { useEffect, useCallback } from 'react';
import { GameState, GameAction, OptionLetter } from './types';
import { isAnswerCorrect } from './gameState';

interface UseKeyboardControlsProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onToggleFullscreen: () => void;
  onResetConfirm: () => void;
}

/** Check if the event target is an interactive form element */
function isInputFocused(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  if (!target) return false;
  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;
  if (target.isContentEditable) return true;
  // Also check for role="textbox" (some rich text editors use this)
  if (target.getAttribute('role') === 'textbox') return true;
  return false;
}

export function useKeyboardControls({
  state,
  dispatch,
  onToggleFullscreen,
  onResetConfirm,
}: UseKeyboardControlsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Never intercept when focus is in an input element
      if (isInputFocused(event)) return;

      const key = event.key;
      const { gameStatus } = state;

      // ── Shift+A → Admin Panel ─────────────────────────────────────────
      if (key === 'A' && event.shiftKey) {
        event.preventDefault();
        dispatch({ type: 'OPEN_ADMIN' });
        return;
      }

      // ── F → Fullscreen ────────────────────────────────────────────────
      if (key === 'f' || key === 'F') {
        if (!event.shiftKey) {
          event.preventDefault();
          onToggleFullscreen();
          return;
        }
      }

      // ── P → Pause/Unpause ─────────────────────────────────────────────
      if (key === 'p' || key === 'P') {
        event.preventDefault();
        if (gameStatus === 'PAUSED') {
          dispatch({ type: 'UNPAUSE' });
        } else {
          dispatch({ type: 'PAUSE' });
        }
        return;
      }

      // ── R → Reset ─────────────────────────────────────────────────────
      if (key === 'r' || key === 'R') {
        event.preventDefault();
        onResetConfirm();
        return;
      }

      // ── 1-4 → Select Option A-D ───────────────────────────────────────
      const optionMap: Record<string, OptionLetter> = {
        '1': 'A', '2': 'B', '3': 'C', '4': 'D',
      };
      if (optionMap[key]) {
        event.preventDefault();
        dispatch({ type: 'SELECT_OPTION', option: optionMap[key] });
        return;
      }

      // ── Enter/Space → Context-sensitive advance ────────────────────────
      if (key === 'Enter' || key === ' ') {
        event.preventDefault();

        switch (gameStatus) {
          case 'QUESTION':
          case 'TIMER_RUNNING':
            // If no option selected yet, start timer (Enter as "Start Timer")
            if (!state.selectedOption && !state.timerRunning) {
              const question = state.questions[state.currentQuestionIndex];
              if (question) {
                dispatch({ type: 'START_TIMER', duration: question.timerDuration });
              }
            }
            break;

          case 'OPTION_SELECTED':
            // Lock the selected option
            dispatch({ type: 'REQUEST_LOCK' });
            break;

          case 'LOCK_CONFIRMATION':
            // Confirm the lock
            dispatch({ type: 'CONFIRM_LOCK' });
            break;

          case 'LOCKED':
            // Reveal the answer
            dispatch({ type: 'REVEAL_ANSWER' });
            break;

          case 'ANSWER_REVEAL':
            // Show correct or wrong
            if (isAnswerCorrect(state)) {
              dispatch({ type: 'SHOW_CORRECT' });
            } else {
              dispatch({ type: 'SHOW_WRONG' });
            }
            break;

          case 'CORRECT':
          case 'WRONG':
          case 'TIMEOUT':
            // Next question
            dispatch({ type: 'NEXT_QUESTION' });
            break;

          case 'NEXT_TRANSITION':
            // Show the next question
            dispatch({ type: 'SET_STATUS', status: 'QUESTION' });
            break;

          case 'FINALE':
            dispatch({ type: 'COMPLETE_GAME' });
            break;

          default:
            break;
        }
        return;
      }

      // ── N → Next Question ─────────────────────────────────────────────
      if (key === 'n' || key === 'N') {
        if (
          gameStatus === 'CORRECT' ||
          gameStatus === 'WRONG' ||
          gameStatus === 'TIMEOUT'
        ) {
          event.preventDefault();
          dispatch({ type: 'NEXT_QUESTION' });
        } else if (gameStatus === 'NEXT_TRANSITION') {
          event.preventDefault();
          dispatch({ type: 'SET_STATUS', status: 'QUESTION' });
        }
        return;
      }
    },
    [state, dispatch, onToggleFullscreen, onResetConfirm]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
