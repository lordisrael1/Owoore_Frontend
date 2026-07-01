/**
 * kobo.ts
 *
 * Kobo ↔ Naira conversion utilities for the Owoore frontend.
 * Mirrors the backend's kobo.ts exactly — same function names,
 * same behaviour so the two environments stay in sync.
 *
 * Rule: ALL money is stored and transmitted in kobo (integer).
 * Naira appears ONLY in UI display and user-facing input fields.
 *
 * Why kobo?
 *   - Avoids floating-point errors (0.1 + 0.2 !== 0.3 in JS)
 *   - Matches Nomba's API (amounts are in kobo)
 *   - Safe integer arithmetic throughout the system
 */

/**
 * toKobo — converts naira (from a user input) to kobo.
 *
 * Examples:
 *   toKobo(50000)  → 5000000
 *   toKobo(0.5)    → 50
 *   toKobo(1.005)  → 100  (rounds)
 *
 * Always use Math.round to prevent fractional kobo from floating-point.
 */
export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * fromKobo — converts kobo (from the API) to naira.
 *
 * Examples:
 *   fromKobo(5000000) → 50000
 *   fromKobo(50)      → 0.5
 */
export function fromKobo(kobo: number): number {
  return kobo / 100;
}

/**
 * assertKobo — throws if a value looks like naira (too small to be kobo).
 * Guards against accidentally passing naira where kobo is expected.
 *
 * Threshold: amounts under ₦1 (100 kobo) are suspicious for church giving.
 */
export function assertKobo(value: number, fieldName = 'amount'): void {
  if (value > 0 && value < 100) {
    throw new Error(
      `${fieldName} looks like naira (${value}), not kobo. ` +
      `Use toKobo() before passing to the API.`,
    );
  }
}

/**
 * safeKoboAdd — adds two kobo values with overflow protection.
 */
export function safeKoboAdd(a: number, b: number): number {
  return Math.round(a + b);
}

/**
 * safeKoboSubtract — subtracts kobo values, floors at 0.
 */
export function safeKoboSubtract(a: number, b: number): number {
  return Math.max(0, Math.round(a - b));
}

/**
 * koboToInputValue — converts kobo to a string for a number input field.
 * Strips trailing zeros for clean display.
 *
 * Example:
 *   koboToInputValue(5000000) → "50000"  (not "50000.00")
 */
export function koboToInputValue(kobo: number): string {
  const naira = fromKobo(kobo);
  return naira % 1 === 0 ? String(naira) : naira.toFixed(2);
}

/**
 * inputValueToKobo — parses a user-typed naira string to kobo.
 * Strips commas (e.g. "50,000" → 5000000).
 * Returns 0 for empty or invalid input.
 */
export function inputValueToKobo(input: string): number {
  const clean = input.replace(/,/g, '').trim();
  const naira = parseFloat(clean);
  if (isNaN(naira) || naira < 0) return 0;
  return toKobo(naira);
}