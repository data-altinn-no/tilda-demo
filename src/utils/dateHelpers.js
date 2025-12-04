import { randInt, pad } from './randomHelpers.js';

/**
 * Date utility functions for generating random dates
 */

// Generate random date within the past/future year
export function randomDateISOYearAround() {
  const now = new Date();
  const t = new Date(now.getTime() - Math.random() * 31536000000 + Math.random() * 31536000000);
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}

// Generate random date within a specified date range
export function randomDateInRange(fromDate, toDate) {
  const from = fromDate ? new Date(fromDate) : new Date(new Date().setFullYear(new Date().getFullYear() - 10));
  const to = toDate ? new Date(toDate) : new Date();
  const randomTime = from.getTime() + Math.random() * (to.getTime() - from.getTime());
  const t = new Date(randomTime);
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}

// Generate random future date within specified months ahead
export function randomFutureDateISO(monthsAheadMin = 1, monthsAheadMax = 9) {
  const now = new Date();
  const months = randInt(monthsAheadMin, monthsAheadMax);
  const d = new Date(now);
  d.setMonth(d.getMonth() + months);
  d.setDate(randInt(1, 28));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}