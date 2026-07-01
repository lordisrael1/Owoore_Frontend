/**
 * cn.ts — class name utility
 *
 * Combines clsx (conditional classes) with tailwind-merge
 * (deduplicates conflicting Tailwind classes).
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-green-600', 'px-6')
 *   → 'py-2 bg-green-600 px-6'   (px-4 is overridden by px-6)
 *
 * Why both?
 *   clsx     — handles conditional logic: booleans, arrays, objects
 *   tw-merge — resolves Tailwind conflicts: keeps the LAST class wins
 *
 */
 
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
 
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
 