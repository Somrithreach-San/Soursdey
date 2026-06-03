import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates the number of days remaining until a given date.
 */
export function getDaysRemaining(endDateString: string | undefined): number {
  if (!endDateString) return 0;
  
  const now = new Date();
  const end = new Date(endDateString);
  const diffTime = end.getTime() - now.getTime();
  
  if (diffTime <= 0) return 0;
  
  // Calculate full days remaining
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
