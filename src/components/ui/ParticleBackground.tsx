/**
 * ParticleBackground — Ambient gold particle field
 *
 * Always-present, subtle, non-distracting. Slow-drifting gold particles
 * with faint blue spotlight sweeps and a soft vignette.
 * Lightweight canvas-based implementation to keep GPU cost low
 * since this runs the entire event duration.
 */

'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  hue: number;
}

interface ParticleBackgroundProps {
  /** Increase particle count for finale sequences */
  intensity?: 'low' | 'normal' | 'high' | 'finale';
}

export default function ParticleBackground({ intensity = 'normal' }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particleCount = {
      low: 15,
      normal: 30,
      high: 60,
      finale: 100,
    }[intensity];

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speedY: -(Math.random() * 0.3 + 0.1),
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.1,
      hue: Math.random() * 20 + 35, // Gold range: 35–55 hue
    }));

    let spotlightAngle = 0;

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Slow sweeping blue spotlight beams
      spotlightAngle += 0.002;
      const spotX = canvas.width * 0.5 + Math.sin(spotlightAngle) * canvas.width * 0.4;
      const spotY = canvas.height * 0.3;
      const gradient = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, canvas.width * 0.5);
      gradient.addColorStop(0, 'rgba(58, 90, 255, 0.04)');
      gradient.addColorStop(0.5, 'rgba(58, 90, 255, 0.02)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Second spotlight beam (counter-rotating)
      const spot2X = canvas.width * 0.5 + Math.cos(spotlightAngle * 0.7) * canvas.width * 0.3;
      const spot2Y = canvas.height * 0.6;
      const gradient2 = ctx.createRadialGradient(spot2X, spot2Y, 0, spot2X, spot2Y, canvas.width * 0.4);
      gradient2.addColorStop(0, 'rgba(232, 200, 107, 0.03)');
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update particles
      particlesRef.current.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity += (Math.random() - 0.5) * 0.01;
        p.opacity = Math.max(0.05, Math.min(0.6, p.opacity));

        // Wrap around
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue}, 70%, 70%)`;
        ctx.fill();

        // Soft glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, 0.1)`;
        ctx.fill();
        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [intensity]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
      />
      {/* Vignette overlay */}
      <div className="fixed inset-0 vignette pointer-events-none z-[1]" aria-hidden="true" />
    </>
  );
}
