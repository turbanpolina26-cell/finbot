/**
 * Utility functions for the app
 */

/**
 * Format currency value with locale-aware formatting
 * @param value - numeric value
 * @param locale - BCP 47 language tag (e.g., 'ru-RU', 'en-US')
 * @param currency - ISO 4217 code (e.g., 'RUB', 'USD')
 * @returns formatted string with currency symbol
 */
export function formatCurrency(
  value: number,
  locale: string = 'ru-RU',
  currency: string = 'RUB'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    // Fallback for unsupported currency
    return `${Math.round(value).toLocaleString(locale)} ${currency}`;
  }
}

/**
 * Format date with locale awareness
 * @param date - Date object or timestamp
 * @param locale - BCP 47 language tag
 * @param format - options for Intl.DateTimeFormat
 * @returns formatted date string
 */
export function formatDate(
  date: Date | number,
  locale: string = 'ru-RU',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
}

/**
 * Parse a numeric string to number, returning 0 if invalid
 * @param value - string or number
 * @returns parsed number or 0
 */
export function parseNumberOrZero(value: string | number | undefined): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Debounce a function
 * @param func - function to debounce
 * @param delay - delay in milliseconds
 * @returns debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Check if value is valid currency amount
 * @param value - value to check
 * @param minAmount - minimum allowed amount (default 0)
 * @returns true if valid
 */
export function isValidAmount(value: string | number, minAmount: number = 0): boolean {
  const num = parseNumberOrZero(value);
  return num >= minAmount && num < 1_000_000_000; // max 1 billion
}

/**
 * Calculate percentage of a value
 * @param value - base value
 * @param percentage - percentage to calculate
 * @returns calculated value
 */
export function calculatePercentage(value: number, percentage: number): number {
  return (value * percentage) / 100;
}

/**
 * Calculate compound interest
 * @param principal - initial amount
 * @param rate - annual interest rate (as percentage)
 * @param periods - number of compounding periods
 * @param timeInYears - time in years
 * @returns future value
 */
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  periods: number = 12, // monthly by default
  timeInYears: number = 1
): number {
  const r = rate / 100 / periods;
  const n = periods * timeInYears;
  return principal * Math.pow(1 + r, n);
}

/**
 * Generate a unique ID
 * @returns unique string ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clamp a number between min and max
 * @param value - value to clamp
 * @param min - minimum
 * @param max - maximum
 * @returns clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
