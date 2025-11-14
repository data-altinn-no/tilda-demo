/**
 * Random utility functions for generating dummy data
 */

// Get random element from array
export function rand(arr) { 
  return arr[Math.floor(Math.random() * arr.length)]; 
}

// Get random integer between min and max (inclusive)
export function randInt(min, max) { 
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}

// Pad number with leading zero
export function pad(n) { 
  return n.toString().padStart(2, "0"); 
}