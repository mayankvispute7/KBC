/**
 * Kaun Banega College Pati — Game State Machine (Reducer)
 *
 * This is the SINGLE source of truth for all game state.
 * Every state transition is handled here — no component should mutate game state directly.
 *
 * Key design decisions (see Architecture.md §2):
 * - Timer uses absolute epoch timestamps (timerEnd), not naive counters
 * - Lock is enforced at the state level (inputs disabled in reducer), not just CSS
 * - Lifeline usage is permanent and checked before dispatch
 * - State transitions are explicit — no implicit fallthrough
 */

import { GameState, GameAction, GameStatus, OptionLetter } from './types';

// ─── Initial State ───────────────────────────────────────────────────────────

export const initialGameState: GameState = {
  currentQuestionIndex: 0,
  selectedOption: null,
  lockedOption: null,
  timerEnd: null,
  remainingAtPauseMs: null,
  timerRunning: false,
  usedLifelines: {
    fiftyFifty: false,
    audiencePoll: false,
    askStudent: false,
    hotline: false,
  },
  fiftyFiftyRemoved: null,
  gameStatus: 'WELCOME',
  currentChocolateLevel: 0,
  sessionId: '',
  questions: [],
  preGameStatus: null,
  soundEnabled: true,
  activeLifeline: null,
  hostNotes: {},
  adminOpen: false,
  adminVerified: false,
};

// ─── Status Guards ───────────────────────────────────────────────────────────
// These define which transitions are legal from each state.

/** Statuses where option selection is allowed */
const SELECTABLE_STATUSES: GameStatus[] = [
  'QUESTION',
  'TIMER_RUNNING',
  'OPTION_SELECTED',
];

/** Statuses where timer can be started */
const TIMER_STARTABLE: GameStatus[] = ['QUESTION'];

/** Statuses where pausing is allowed */
const PAUSABLE_STATUSES: GameStatus[] = [
  'QUESTION',
  'TIMER_RUNNING',
  'OPTION_SELECTED',
  'LOCK_CONFIRMATION',
];

/** Statuses that are part of the pre-show scroll sequence */
const PRE_SHOW_STATUSES: GameStatus[] = [
  'WELCOME',
  'RULES',
  'LIFELINE_INTRO',
  'LADDER_REVEAL',
];

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    // ── Game Lifecycle ─────────────────────────────────────────────────────

    case 'START_GAME':
      return {
        ...initialGameState,
        gameStatus: 'QUESTION',
        questions: action.questions,
        sessionId: generateSessionId(),
        soundEnabled: state.soundEnabled,
      };

    case 'SET_STATUS': {
      // Allow pre-show navigation (scroll sections)
      if (PRE_SHOW_STATUSES.includes(action.status)) {
        return { ...state, gameStatus: action.status };
      }
      return { ...state, gameStatus: action.status };
    }

    case 'RESET_GAME':
      return {
        ...initialGameState,
        soundEnabled: state.soundEnabled,
        adminVerified: state.adminVerified,
      };

    // ── Option Selection ───────────────────────────────────────────────────

    case 'SELECT_OPTION': {
      // Guard: only allow selection in valid states
      if (!SELECTABLE_STATUSES.includes(state.gameStatus)) return state;

      // Guard: can't select an eliminated (50-50) option
      if (state.fiftyFiftyRemoved?.includes(action.option)) return state;

      return {
        ...state,
        selectedOption: action.option,
        gameStatus: 'OPTION_SELECTED',
      };
    }

    case 'DESELECT_OPTION': {
      if (state.gameStatus !== 'OPTION_SELECTED') return state;
      return {
        ...state,
        selectedOption: null,
        gameStatus: state.timerRunning ? 'TIMER_RUNNING' : 'QUESTION',
      };
    }

    // ── Lock Sequence (highest priority flow) ──────────────────────────────

    case 'REQUEST_LOCK': {
      // Guard: must have a selected option and be in the right state
      if (state.gameStatus !== 'OPTION_SELECTED' || !state.selectedOption) return state;
      return {
        ...state,
        gameStatus: 'LOCK_CONFIRMATION',
      };
    }

    case 'CONFIRM_LOCK': {
      // Guard: must be in lock confirmation with a selected option
      if (state.gameStatus !== 'LOCK_CONFIRMATION' || !state.selectedOption) return state;

      return {
        ...state,
        lockedOption: state.selectedOption,
        gameStatus: 'LOCKED',
        // Force-stop timer on lock
        timerRunning: false,
        timerEnd: null,
      };
    }

    case 'CANCEL_LOCK': {
      if (state.gameStatus !== 'LOCK_CONFIRMATION') return state;
      return {
        ...state,
        gameStatus: 'OPTION_SELECTED',
      };
    }

    // ── Timer ──────────────────────────────────────────────────────────────

    case 'START_TIMER': {
      if (!TIMER_STARTABLE.includes(state.gameStatus) && state.gameStatus !== 'OPTION_SELECTED') {
        // Also allow starting timer if we haven't started yet but have selected
        if (state.gameStatus !== 'TIMER_RUNNING') return state;
      }
      const now = Date.now();
      return {
        ...state,
        timerEnd: now + (action.duration * 1000),
        timerRunning: true,
        gameStatus: state.selectedOption ? 'OPTION_SELECTED' : 'TIMER_RUNNING',
      };
    }

    case 'TIMER_TICK': {
      // Just a signal to re-render — actual time is computed from timerEnd
      if (!state.timerRunning || !state.timerEnd) return state;

      const remaining = Math.max(0, state.timerEnd - Date.now());
      if (remaining <= 0) {
        return {
          ...state,
          timerRunning: false,
          timerEnd: null,
          gameStatus: state.lockedOption ? state.gameStatus : 'TIMEOUT',
        };
      }
      return state; // No state change needed — component reads timerEnd directly
    }

    case 'TIMER_EXPIRED': {
      if (state.lockedOption) return state; // Already locked, timer doesn't matter
      return {
        ...state,
        timerRunning: false,
        timerEnd: null,
        gameStatus: 'TIMEOUT',
      };
    }

    // ── Answer Reveal ──────────────────────────────────────────────────────

    case 'REVEAL_ANSWER': {
      // Can reveal from LOCKED or TIMEOUT
      if (state.gameStatus !== 'LOCKED' && state.gameStatus !== 'TIMEOUT') return state;
      return {
        ...state,
        gameStatus: 'ANSWER_REVEAL',
      };
    }

    case 'SHOW_CORRECT': {
      if (state.gameStatus !== 'ANSWER_REVEAL') return state;
      return {
        ...state,
        gameStatus: 'CORRECT',
        currentChocolateLevel: state.currentChocolateLevel + 1,
      };
    }

    case 'SHOW_WRONG': {
      if (state.gameStatus !== 'ANSWER_REVEAL') return state;
      return {
        ...state,
        gameStatus: 'WRONG',
      };
    }

    // ── Question Navigation ────────────────────────────────────────────────

    case 'NEXT_QUESTION': {
      if (state.gameStatus !== 'CORRECT' && state.gameStatus !== 'WRONG' && state.gameStatus !== 'TIMEOUT') {
        return state;
      }

      const nextIndex = state.currentQuestionIndex + 1;

      // Check if this was the last question and it was correct → finale
      if (nextIndex >= state.questions.length && state.gameStatus === 'CORRECT') {
        return {
          ...state,
          gameStatus: 'FINALE',
        };
      }

      // If wrong or timeout on last question, game is complete without crowning
      if (nextIndex >= state.questions.length) {
        return {
          ...state,
          gameStatus: 'COMPLETE',
        };
      }

      return {
        ...state,
        currentQuestionIndex: nextIndex,
        selectedOption: null,
        lockedOption: null,
        timerEnd: null,
        remainingAtPauseMs: null,
        timerRunning: false,
        fiftyFiftyRemoved: null,
        activeLifeline: null,
        gameStatus: 'NEXT_TRANSITION',
      };
    }

    // ── Pause ──────────────────────────────────────────────────────────────

    case 'PAUSE': {
      if (!PAUSABLE_STATUSES.includes(state.gameStatus)) return state;

      let remainingMs: number | null = null;
      if (state.timerRunning && state.timerEnd) {
        remainingMs = Math.max(0, state.timerEnd - Date.now());
      }

      return {
        ...state,
        preGameStatus: state.gameStatus,
        gameStatus: 'PAUSED',
        timerRunning: false,
        remainingAtPauseMs: remainingMs,
      };
    }

    case 'UNPAUSE': {
      if (state.gameStatus !== 'PAUSED' || !state.preGameStatus) return state;

      let newTimerEnd: number | null = null;
      let timerRunning = false;

      // Restore timer from remaining pause time
      if (state.remainingAtPauseMs !== null && state.remainingAtPauseMs > 0) {
        newTimerEnd = Date.now() + state.remainingAtPauseMs;
        timerRunning = true;
      }

      return {
        ...state,
        gameStatus: state.preGameStatus,
        preGameStatus: null,
        timerEnd: newTimerEnd,
        timerRunning,
        remainingAtPauseMs: null,
      };
    }

    // ── Lifelines ──────────────────────────────────────────────────────────

    case 'USE_LIFELINE': {
      // Guard: can't reuse a lifeline
      if (state.usedLifelines[action.lifeline]) return state;

      // Guard: must be in a playable state
      const lifelineAllowedStates: GameStatus[] = [
        'QUESTION', 'TIMER_RUNNING', 'OPTION_SELECTED',
      ];
      if (!lifelineAllowedStates.includes(state.gameStatus)) return state;

      // Mark as used and show the overlay
      return {
        ...state,
        usedLifelines: {
          ...state.usedLifelines,
          [action.lifeline]: true,
        },
        activeLifeline: action.lifeline,
      };
    }

    case 'CLOSE_LIFELINE': {
      return {
        ...state,
        activeLifeline: null,
      };
    }

    case 'APPLY_FIFTY_FIFTY': {
      return {
        ...state,
        fiftyFiftyRemoved: action.removed,
        activeLifeline: null,
        // Deselect if the selected option was eliminated
        selectedOption:
          state.selectedOption && action.removed.includes(state.selectedOption)
            ? null
            : state.selectedOption,
        gameStatus:
          state.selectedOption && !action.removed.includes(state.selectedOption)
            ? 'OPTION_SELECTED'
            : state.timerRunning
            ? 'TIMER_RUNNING'
            : 'QUESTION',
      };
    }

    case 'SET_HOST_NOTE': {
      return {
        ...state,
        hostNotes: {
          ...state.hostNotes,
          [action.key]: action.note,
        },
      };
    }

    // ── Sound ──────────────────────────────────────────────────────────────

    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };

    // ── Admin ──────────────────────────────────────────────────────────────

    case 'OPEN_ADMIN':
      return { ...state, adminOpen: true };

    case 'CLOSE_ADMIN':
      return { ...state, adminOpen: false };

    case 'VERIFY_ADMIN':
      return { ...state, adminVerified: true };

    // ── Finale ─────────────────────────────────────────────────────────────

    case 'ENTER_FINALE':
      return { ...state, gameStatus: 'FINALE' };

    case 'COMPLETE_GAME':
      return { ...state, gameStatus: 'COMPLETE' };

    // ── Session Restore ────────────────────────────────────────────────────

    case 'RESTORE_SESSION': {
      return {
        ...state,
        ...action.state,
      };
    }

    default:
      return state;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if the locked answer is correct for the current question.
 * Used by the reveal sequence to determine CORRECT vs WRONG.
 */
export function isAnswerCorrect(state: GameState): boolean {
  if (!state.lockedOption) return false;
  const question = state.questions[state.currentQuestionIndex];
  if (!question) return false;
  return question.correctOptions.includes(state.lockedOption);
}

/**
 * Get the correct option letters for the current question.
 */
export function getCorrectOptions(state: GameState): OptionLetter[] {
  const question = state.questions[state.currentQuestionIndex];
  if (!question) return [];
  return question.correctOptions;
}

/**
 * Get the current question from state.
 */
export function getCurrentQuestion(state: GameState) {
  return state.questions[state.currentQuestionIndex] ?? null;
}

/**
 * Determine the visual state for an option card.
 * This centralizes all option-state logic so components don't need to figure it out.
 */
export function getOptionState(
  state: GameState,
  option: OptionLetter
): 'DEFAULT' | 'SELECTED' | 'LOCKED' | 'CORRECT' | 'WRONG' | 'ELIMINATED' | 'DISABLED' {
  const question = state.questions[state.currentQuestionIndex];

  // Eliminated by 50-50
  if (state.fiftyFiftyRemoved?.includes(option)) {
    return 'ELIMINATED';
  }

  // After answer is revealed
  if (state.gameStatus === 'CORRECT' || state.gameStatus === 'WRONG' || state.gameStatus === 'TIMEOUT') {
    if (question?.correctOptions.includes(option)) return 'CORRECT';
    if (state.lockedOption === option) return 'WRONG';
    return 'DISABLED';
  }

  // During answer reveal pause
  if (state.gameStatus === 'ANSWER_REVEAL') {
    if (state.lockedOption === option) return 'LOCKED';
    return 'DISABLED';
  }

  // Locked state
  if (state.gameStatus === 'LOCKED' || state.gameStatus === 'LOCK_CONFIRMATION') {
    if (state.selectedOption === option) return 'LOCKED';
    return 'DISABLED';
  }

  // Selected
  if (state.selectedOption === option) return 'SELECTED';

  return 'DEFAULT';
}
