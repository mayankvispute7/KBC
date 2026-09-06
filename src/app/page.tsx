/**
 * Main Page — Kaun Banega College Pati
 *
 * Renders either:
 * 1. Pre-show landing sequence (scroll-driven) — Welcome → Rules → Lifelines → Ladder
 * 2. In-game screen (state-driven, host-controlled) — after "BEGIN THE HOTSEAT"
 *
 * The transition from scroll-based to state-based happens once and is irreversible
 * (within a single session — reset goes back to WELCOME).
 */

'use client';

import { useState, useCallback } from 'react';
import { GameProvider, useGame } from '@/lib/GameContext';
import { useKeyboardControls } from '@/lib/useKeyboardControls';
import { useFullscreen } from '@/lib/useFullscreen';
import { audioManager } from '@/lib/audio';
import { MOCK_QUESTIONS } from '@/lib/mockQuestions';

import ParticleBackground from '@/components/ui/ParticleBackground';
import WelcomeSection from '@/components/landing/WelcomeSection';
import RulesSection from '@/components/landing/RulesSection';
import LifelinesSection from '@/components/landing/LifelinesSection';
import LadderRevealSection from '@/components/landing/LadderRevealSection';
import GameScreen from '@/components/game/GameScreen';
import AdminPanel from '@/components/admin/AdminPanel';

function AppContent() {
  const { state, dispatch } = useGame();
  const { toggleFullscreen } = useFullscreen();
  const [showLanding, setShowLanding] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  // Keyboard controls
  useKeyboardControls({
    state,
    dispatch,
    onToggleFullscreen: toggleFullscreen,
    onResetConfirm: handleReset,
  });

  const handleStartLanding = () => {
    // Scroll past welcome to show rules
    // The landing is scroll-driven via Framer Motion whileInView
  };

  const handleBeginGame = () => {
    setShowLanding(false);
    audioManager.play('questionReveal');
    dispatch({ type: 'START_GAME', questions: MOCK_QUESTIONS });
  };

  // Determine particle intensity based on game state
  const particleIntensity = state.gameStatus === 'FINALE' || state.gameStatus === 'COMPLETE'
    ? 'finale'
    : showLanding
    ? 'normal'
    : 'low';

  return (
    <div className="relative min-h-screen bg-void">
      {/* Ambient background — always present */}
      <ParticleBackground intensity={particleIntensity} />

      {/* Pre-show landing sequence */}
      {showLanding && (
        <div className="relative z-10">
          <WelcomeSection onStart={handleStartLanding} />
          <RulesSection />
          <LifelinesSection />
          <LadderRevealSection onBegin={handleBeginGame} />
        </div>
      )}

      {/* In-game screen */}
      {!showLanding && <GameScreen />}

      {/* Admin panel (overlays everything) */}
      <AdminPanel />

      {/* Reset confirmation dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-void/80 z-[80] flex items-center justify-center">
          <div className="bg-navy-light border-2 border-danger/30 rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
            <h3 className="font-title text-xl font-bold text-danger-glow mb-4">Reset Game?</h3>
            <p className="font-body text-sm text-ink-white/60 mb-6">
              This will clear all progress and return to the welcome screen.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                className="px-6 py-2.5 bg-danger text-ink-white font-body font-bold rounded-xl hover:bg-danger-glow hover:text-void transition-colors"
                onClick={() => {
                  dispatch({ type: 'RESET_GAME' });
                  setShowLanding(true);
                  setShowResetConfirm(false);
                }}
              >
                Reset
              </button>
              <button
                className="px-6 py-2.5 border border-neutral-line text-ink-white/70 font-body rounded-xl hover:border-ink-white/50 transition-colors"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
