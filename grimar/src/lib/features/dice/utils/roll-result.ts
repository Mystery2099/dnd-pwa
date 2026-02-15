/**
 * Utilities for creating and manipulating roll results
 */

import type { RollResult } from '../types';
import { nanoid } from 'nanoid';

/**
 * Create a roll result from notation and total
 * Used by both service and store
 */
export function createRollResult(
  notation: string,
  total: number,
  breakdown: string,
  individual: number[] = [],
  isCritical: boolean = false,
  isFumble: boolean = false
): RollResult {
  return {
    id: nanoid(),
    notation,
    total,
    breakdown,
    individual,
    isCritical,
    isFumble,
    timestamp: Date.now()  // Using number, not Date object
  };
}

/**
 * Parse individual dice rolls from rpg-dice-roller breakdown string
 * Example: "4 + 3 + 2 + 5 = 14" -> [4, 3, 2, 5]
 * Example: "1d20+5: 15 = 15" -> [] (can't parse, unknown format)
 */
export function parseIndividualRolls(notation: string, breakdown: string): number[] {
  // Try to parse from breakdown format: "X + Y + Z = Total"
  const match = breakdown.match(/^(\d+(?: \+ \d+)*) = \d+$/);
  if (match) {
    return match[1].split(' + ').map(Number);
  }

  // Try to parse from notation for simple cases
  const simpleMatch = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (simpleMatch) {
    // For simple dice, we can't determine individual rolls from breakdown
    // Return empty array - will be populated by dice-box rolls
    return [];
  }

  return [];
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}