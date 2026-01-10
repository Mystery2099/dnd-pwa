#!/usr/bin/env bun
/**
 * Fix corrupted race summaries in the database
 * Some races have full markdown content in the summary field instead of a short description
 */

import { Database } from 'bun:sqlite';

const db = new Database('local.db');

console.log('Fixing corrupted race summaries...\n');

// Get all races with corrupted summaries (contains newlines or markdown headers)
const races = db
	.query(
		`
	SELECT id, name, summary, details
	FROM compendium_items
	WHERE type = 'race'
`
	)
	.all() as Array<{ id: number; name: string; summary: string; details: string }>;

let fixed = 0;

function stripMarkdown(text: string): string {
	// Remove markdown headers
	let cleaned = text.replace(/^#+\s+/gm, '');
	// Remove markdown emphasis markers
	cleaned = cleaned.replace(/\*\*|__/g, '');
	// Remove single emphasis
	cleaned = cleaned.replace(/\*|_/g, '');
	// Clean up extra whitespace
	cleaned = cleaned.replace(/\s+/g, ' ').trim();
	return cleaned;
}

for (const race of races) {
	const details = JSON.parse(race.details || '{}');

	// Check if summary looks corrupted (contains newlines or markdown headers)
	const isCorrupted = race.summary.includes('\n') || race.summary.startsWith('##');

	if (isCorrupted) {
		console.log(`Fixing: ${race.name}`);
		console.log(`  Before: ${race.summary.slice(0, 60)}...`);

		// Generate a proper short summary - use trait names or a generic one
		let newSummary = '';
		if (details.traits && Array.isArray(details.traits) && details.traits.length > 0) {
			// Use first trait name
			const firstTrait = details.traits[0];
			if (typeof firstTrait === 'object' && firstTrait.name) {
				newSummary = firstTrait.name;
			}
		}

		// If no trait name, use a generic summary
		if (!newSummary) {
			newSummary = `${race.name} race`;
		}

		// Update the database
		db.prepare(
			`
			UPDATE compendium_items
			SET summary = ?
			WHERE id = ?
		`
		).run(newSummary, race.id);

		console.log(`  After:  ${newSummary}`);
		fixed++;
	}
}

console.log(`\nDone! Fixed ${fixed} race summaries.`);
