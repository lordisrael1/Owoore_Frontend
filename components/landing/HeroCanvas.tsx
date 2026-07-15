'use client';
import * as React from 'react';

/**
 * HeroCanvas — a 3D particle field rendered with true perspective projection
 * on a plain 2D canvas (no three.js payload, same visual language).
 *
 * - ~140 particles drift in a 3D volume and wrap around the camera
 * - Near particles connect with fading lines (constellation effect)
 * - Mouse moves the camera — subtle parallax rotation on both axes
 * - Depth controls size, opacity, and color temperature
 * - Pauses off-screen and respects prefers-reduced-motion
 */

interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
}

const DEPTH = 900;          // z-volume of the field
const FOCAL = 520;          // perspective focal length
const COUNT_DESKTOP = 140;
const COUNT_MOBILE  = 70;
const LINK_DIST = 110;      // px (projected) distance to draw connecting lines

export const HeroCanvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let w = 0, h = 0, dpr = 1;
    const mouse = { x: 0, y: 0 };     // -1..1, eased
    const target = { x: 0, y: 0 };

    const isDark = () =>
      window.matchMedia('(prefers-color-scheme: dark)').matches ||
      document.documentElement.classList.contains('dark');

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const count = w < 640 ? COUNT_MOBILE : COUNT_DESKTOP;
    const parts: Particle[] = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * w * 1.6,
      y: (Math.random() - 0.5) * h * 1.6,
      z: Math.random() * DEPTH,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      vz: 0.35 + Math.random() * 0.5,   // drift toward the camera
    }));

    const onMouse = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth)  * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    // Pause rendering when hero is off-screen
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
    });
    io.observe(canvas);

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      // ease camera toward mouse
      mouse.x += (target.x - mouse.x) * 0.04;
      mouse.y += (target.y - mouse.y) * 0.04;

      const dark = isDark();
      const cx = w / 2, cy = h / 2;
      const rotX = mouse.y * 0.12;
      const rotY = mouse.x * 0.12;
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      const projected: { px: number; py: number; depth: number }[] = [];

      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.z -= p.vz;

        // recycle behind the camera / out of volume
        if (p.z < 1) {
          p.z = DEPTH;
          p.x = (Math.random() - 0.5) * w * 1.6;
          p.y = (Math.random() - 0.5) * h * 1.6;
        }

        // rotate around Y then X (camera parallax)
        let x = p.x * cosY - p.z * sinY;
        let z = p.x * sinY + p.z * cosY;
        let y = p.y * cosX - z * sinX;
        z     = p.y * sinX + z * cosX;
        if (z < 1) z = 1;

        const scale = FOCAL / z;
        const px = cx + x * scale;
        const py = cy + y * scale;
        const depth = 1 - z / DEPTH;          // 0 far → 1 near
        projected.push({ px, py, depth });

        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;

        const r = Math.max(0.4, depth * 2.4);
        const alpha = 0.15 + depth * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = dark
          ? `rgba(74, 222, 128, ${alpha * 0.8})`
          : `rgba(21, 128, 61, ${alpha})`;
        ctx.fill();
      }

      // constellation lines between near projected points
      for (let i = 0; i < projected.length; i++) {
        const a = projected[i];
        if (a.depth < 0.35) continue;         // only link nearer particles
        for (let j = i + 1; j < projected.length; j++) {
          const b = projected[j];
          if (b.depth < 0.35) continue;
          const dx = a.px - b.px, dy = a.py - b.py;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          const t = 1 - Math.sqrt(d2) / LINK_DIST;
          const alpha = t * 0.16 * Math.min(a.depth, b.depth);
          ctx.beginPath();
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(b.px, b.py);
          ctx.strokeStyle = dark
            ? `rgba(74, 222, 128, ${alpha})`
            : `rgba(22, 163, 74, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
};
