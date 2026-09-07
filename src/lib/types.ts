/**
 * Kaun Banega College Pati — Shared Type Definitions
 *
 * Central type system for the entire app. All game-related types live here
 * so they're importable from any component or utility without circular deps.
 * See Architecture.md §2 for the state machine spec.
 */

// ─── Option & Answer Types ───────────────────────────────────────────────────

export type OptionLetter = 'A' | 'B' | 'C' | 'D';

export type OptionState =
  | 'DEFAULT'
  | 'HOVER'
  | 'SELECTED'
  | 'LOCKED'
  | 'CORRECT'
  | 'WRONG'
  | 'ELIMINATED'   // 50-50 removal — greyed + struck-through, visually distinct from DISABLED
  | 'DISABLED';     // General non-interactive (e.g., non-selected options after lock)

// ─── Game Status (State Machine) ─────────────────────────────────────────────

export type GameStatus =
  | 'WELCOME'
  | 'RULES'
  | 'LIFELINE_INTRO'
  | 'LADDER_REVEAL'
  | 'QUESTION'
  | 'TIMER_RUNNING'
  | 'OPTION_SELECTED'
  | 'LOCK_CONFIRMATION'
  | 'LOCKED'
  | 'ANSWER_REVEAL'
  | 'CORRECT'
  | 'WRONG'
  | 'TIMEOUT'
  | 'NEXT_TRANSITION'
  | 'PAUSED'
  | 'FINALE'
  | 'COMPLETE';

// ─── Lifelines ───────────────────────────────────────────────────────────────

export type LifelineType = 'fiftyFifty' | 'audiencePoll' | 'askStudent' | 'hotline';

export interface LifelineState {
  fiftyFifty: boolean;
  audiencePoll: boolean;
  askStudent: boolean;
  hotline: boolean;
}

// ─── Question Data ───────────────────────────────────────────────────────────

export interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOptions: OptionLetter[];
  fiftyFiftyRemove?: OptionLetter[] | null;
  fiftyFiftyEligible: boolean;
  timerDuration: number;              // seconds
  audiencePollA?: number | null;
  audiencePollB?: number | null;
  audiencePollC?: number | null;
  audiencePollD?: number | null;
  correctMessage?: string | null;
  wrongMessage?: string | null;
  enabled: boolean;
}

// ─── Audience Poll Data ──────────────────────────────────────────────────────

export interface AudiencePollData {
  A: number;
  B: number;
  C: number;
  D: number;
}

// ─── Game State ──────────────────────────────────────────────────────────────

export interface GameState {
  currentQuestionIndex: number;
  selectedOption: OptionLetter | null;
  lockedOption: OptionLetter | null;
  timerEnd: number | null;            // absolute epoch ms — NOT a naive countdown int
  remainingAtPauseMs: number | null;
  timerRunning: boolean;
  usedLifelines: LifelineState;
  fiftyFiftyRemoved: OptionLetter[] | null;
  gameStatus: GameStatus;
  currentChocolateLevel: number;      // 0–12
  sessionId: string;
  questions: Question[];
  /** The status before PAUSED was entered, so we can resume correctly */
  preGameStatus: GameStatus | null;
  /** Sound on/off — persisted in settings */
  soundEnabled: boolean;
  /** Active lifeline overlay currently showing */
  activeLifeline: LifelineType | null;
  /** Host notes for lifelines (Ask a Student, Staffroom Hotline) */
  hostNotes: Record<string, string>;
  /** Whether admin panel is open */
  adminOpen: boolean;
  /** Whether admin PIN has been verified this session */
  adminVerified: boolean;
}

// ─── Game Actions (Discriminated Union) ──────────────────────────────────────

export type GameAction =
  | { type: 'START_GAME'; questions: Question[] }
  | { type: 'SET_STATUS'; status: GameStatus }
  | { type: 'SELECT_OPTION'; option: OptionLetter }
  | { type: 'DESELECT_OPTION' }
  | { type: 'REQUEST_LOCK' }
  | { type: 'CONFIRM_LOCK' }
  | { type: 'CANCEL_LOCK' }
  | { type: 'START_TIMER'; duration: number }
  | { type: 'TIMER_TICK' }           // recompute remaining from timerEnd
  | { type: 'TIMER_EXPIRED' }
  | { type: 'REVEAL_ANSWER' }
  | { type: 'SHOW_CORRECT' }
  | { type: 'SHOW_WRONG' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PAUSE' }
  | { type: 'UNPAUSE' }
  | { type: 'USE_LIFELINE'; lifeline: LifelineType }
  | { type: 'CLOSE_LIFELINE' }
  | { type: 'APPLY_FIFTY_FIFTY'; removed: OptionLetter[] }
  | { type: 'SET_HOST_NOTE'; key: string; note: string }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'OPEN_ADMIN' }
  | { type: 'CLOSE_ADMIN' }
  | { type: 'VERIFY_ADMIN' }
  | { type: 'RESET_GAME' }
  | { type: 'RESTORE_SESSION'; state: Partial<GameState> }
  | { type: 'ENTER_FINALE' }
  | { type: 'COMPLETE_GAME' }
  | { type: 'UPDATE_QUESTION_DATA'; questionIndex: number; question: Question }
  | { type: 'JUMP_TO_QUESTION'; index: number };

// ─── Chocolate Ladder ────────────────────────────────────────────────────────

export interface ChocolateTier {
  level: number;           // 1–12
  label: string;           // display name for the chocolate tier
  isMilestone: boolean;    // levels 4, 8 are safe milestones
}

export function getLadderLabel(level: number): string {
  if (level === 12) {
    return "Whole Box of Dark Fantasy 🎁👑";
  }
  return `${level} Dark Fantasy 🍪`;
}

export function getChocolateLadder(): ChocolateTier[] {
  return Array.from({ length: 12 }, (_, i) => {
    const level = i + 1;
    return {
      level,
      label: getLadderLabel(level),
      isMilestone: level % 4 === 0, // 4, 8, 12 are milestones
    };
  });
}
