/**
 * Random utility functions for generating dummy data
 */

// Get random element from array
export function rand<T>(arr: T[]): T { 
  return arr[Math.floor(Math.random() * arr.length)]; 
}

// Get random integer between min and max (inclusive)
export function randInt(min: number, max: number): number { 
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}

// Pad number with leading zero
export function pad(n: number): string { 
  return n.toString().padStart(2, "0"); 
}
