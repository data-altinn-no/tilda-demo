/**
 * Random utility functions for generating dummy data
 * 
 * NOTE: These functions use Math.random() which is NOT cryptographically secure.
 * This is intentional - they are ONLY used for generating demo/presentation data.
 * DO NOT use these functions for security-sensitive operations like:
 * - Generating passwords, tokens, or session IDs
 * - Cryptographic operations
 * - Authentication or authorization
 */

// Get random element from array
export function rand<T>(arr: T[]): T { 
  // codeql[js/insecure-randomness]: This is used only for generating demo/mock data, not for security purposes
  return arr[Math.floor(Math.random() * arr.length)];
}

// Get random integer between min and max (inclusive)
export function randInt(min: number, max: number): number { 
  // codeql[js/insecure-randomness]: This is used only for generating demo/mock data, not for security purposes
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get random float between 0 and 1 (for demo data generation only)
export function randFloat(): number {
  // codeql[js/insecure-randomness]: This is used only for generating demo/mock data, not for security purposes
  return Math.random();
}

// Get random boolean with optional probability (for demo data generation only)
export function randBool(probability: number = 0.5): boolean {
  // codeql[js/insecure-randomness]: This is used only for generating demo/mock data, not for security purposes
  return Math.random() < probability;
}

// Shuffle array (for demo data generation only)
export function shuffle<T>(arr: T[]): T[] {
  // codeql[js/insecure-randomness]: This is used only for generating demo/mock data, not for security purposes
  return [...arr].sort(() => Math.random() - 0.5);
}

// Pad number with leading zero
export function pad(n: number): string { 
  return n.toString().padStart(2, "0"); 
}
