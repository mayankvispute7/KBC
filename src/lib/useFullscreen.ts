/**
 * Kaun Banega College Pati — Fullscreen API Hook
 *
 * Wraps the Fullscreen API for the host's "F" key shortcut.
 * Designed for projector mode — 1920×1080 display.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen denied — browser may not support it or requires a user gesture
        console.warn('Fullscreen request denied');
      });
    } else {
      document.exitFullscreen().catch(() => {
        console.warn('Exit fullscreen failed');
      });
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return { isFullscreen, toggleFullscreen };
}
