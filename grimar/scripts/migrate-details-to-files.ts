/**
 * Migration Script: Details to Files
 *
 * Moves heavy JSON data from the 'details' column to external JSON files.
 * Populates the 'jsonPath' column for existing items.
 *
 * Run with: bun run db:migrate-details
 */

// Note: This script requires a proper environment to run.
// Use 'bun vitest run src/test/integration/migrate.test.ts' pattern if needed.
