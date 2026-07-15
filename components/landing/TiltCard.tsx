'use client';
import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * TiltCard — wraps children in a mouse-tracked 3D tilt with a moving glare
 * highlight. Pure CSS transforms driven by pointer position; resets smoothly
 * on leave. Disabled for touch-only devices and reduced motion.
 */

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** max tilt in degrees */
  max?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({ children, className, max = 7 }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;   // 0..1
    const y = (e.clientY - rect.top) / rect.height;

    const rx = (0.5 - y) * max;
    const ry = (x - 0.5) * max;
    el.style.transform = `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(6px)`;
    el.style.setProperty('--glare-x', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--glare-y', `${(y * 100).toFixed(1)}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn('tilt-card relative', className)}
    >
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </div>
  );
};
