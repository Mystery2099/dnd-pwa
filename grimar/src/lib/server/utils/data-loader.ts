/**
 * Data Loader Utility
 *
 * Handles loading of detailed compendium data from external JSON files.
 * Supports the "external storage" pattern to keep the database lightweight.
 */

import { readFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { CompendiumTypeName } from '$lib/core/types/compendium';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('DataLoader');

// Default data directory relative to project root
const DEFAULT_DATA_ROOT = 'data/compendium';

/**
 * Load detailed data for a single item from its JSON file
 * @param jsonPath Path to the JSON file (relative to project root)
 */
export async function loadDetails(jsonPath: string): Promise<Record<string, unknown>> {
	const fullPath = join(process.cwd(), jsonPath);

	if (!existsSync(fullPath)) {
		throw new Error(`Compendium data file not found: ${jsonPath}`);
	}

	try {
		const content = readFileSync(fullPath, 'utf-8');
		return JSON.parse(content) as Record<string, unknown>;
	} catch (error) {
		log.error({ jsonPath, error }, 'Failed to parse compendium data');
		throw new Error(`Invalid JSON in compendium data file: ${jsonPath}`);
	}
}

/**
 * Load all detailed data for a specific compendium type
 * Useful for exports or bulk processing.
 * @param type The compendium type (e.g., 'spell', 'monster')
 * @param dataRoot Optional custom root directory
 */
export async function loadAllDetails(
	type: CompendiumTypeName,
	dataRoot: string = DEFAULT_DATA_ROOT
): Promise<Map<string, Record<string, unknown>>> {
	const typeDir = join(process.cwd(), dataRoot, type);
	const detailsMap = new Map<string, Record<string, unknown>>();

	if (!existsSync(typeDir)) {
		log.warn({ type, path: typeDir }, 'Data directory not found');
		return detailsMap;
	}

	try {
		const files = readdirSync(typeDir).filter((f) => f.endsWith('.json'));

		for (const file of files) {
			const filePath = join(typeDir, file);
			const content = readFileSync(filePath, 'utf-8');
			const data = JSON.parse(content) as Record<string, unknown>;
			const slug = file.replace('.json', '');
			detailsMap.set(slug, data);
		}
	} catch (error) {
		log.error({ type, error }, 'Failed to load all details');
	}

	return detailsMap;
}

/**
 * Helper to ensure the data directory structure exists
 */
export function ensureDataDirectory(
	_type: CompendiumTypeName,
	dataRoot: string = DEFAULT_DATA_ROOT
): string {
	const targetDir = join(process.cwd(), dataRoot, _type);

	if (!existsSync(targetDir)) {
		mkdirSync(targetDir, { recursive: true });
	}

	return targetDir;
}
