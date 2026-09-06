/**
 * Kaun Banega College Pati — Game Context Provider
 *
 * Wraps the game reducer in React Context so all components can read/dispatch
 * game state without prop drilling. This is the single centralized store —
 * no game state should live in component-local useState calls.
 *
 * Usage:
 *   const { state, dispatch } = useGame();
 */

'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { GameState, GameAction } from './types';
import { gameReducer, initialGameState } from './gameState';

// ─── Context Shape ───────────────────────────────────────────────────────────

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// ─── Convenience Hooks ───────────────────────────────────────────────────────

/** Hook that returns just the current game status */
export function useGameStatus() {
  const { state } = useGame();
  return state.gameStatus;
}

/** Hook that returns the current question */
export function useCurrentQuestion() {
  const { state } = useGame();
  return state.questions[state.currentQuestionIndex] ?? null;
}
