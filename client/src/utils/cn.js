import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind class names safely, resolving conflicts so the last
 * class always wins (e.g. twMerge('text-red-500', 'text-blue-500') → 'text-blue-500').
 * Use this anywhere you're composing classNames conditionally or spreading props.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
