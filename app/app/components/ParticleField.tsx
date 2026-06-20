'use client';

import { useEffect, useRef } from 'react';

/**
 * Lightweight drifting-particle canvas behind all content (mirrors the
 * dashboard mockup's atmosphere layer). Pauses when the tab is hidden and
 * respects prefers-reduced-motion.
 */
export default function ParticleField({ count = 46 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const COLORS = ['211, 187, 255', '255, 198, 64', '74, 225, 118'];

    type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; c: string };
    let parts: P[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const seed = () => {
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.45 + 0.05,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    };

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          p.x = Math.random() * canvas.width; p.y = Math.random() * canvas.height;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c}, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const onVis = () => {
      running = !document.hidden;
      if (running) { raf = requestAnimationFrame(tick); } else { cancelAnimationFrame(raf); }
    };

    resize(); seed(); tick();
    window.addEventListener('resize', () => { resize(); seed(); });
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [count]);

  return <canvas ref={ref} className="particle-field" aria-hidden="true" />;
}
