#!/usr/bin/env bun
/**
 * GitHub 5e-database Import Script
 *
 * Imports all SRD data from the 5e-bits/5e-database GitHub repository.
 * Uses the latest tagged release for reproducibility.
 *
 * Usage: bun run scripts/sync-github-srd.ts
 */

import { getDb } from '../src/lib/server/db';
import { compendiumItems } from '../src/lib/server/db/schema';
import { extractSearchableContent } from '../src/lib/server/db/db-fts';
import { createModuleLogger } from '../src/lib/server/logger';
import { eq, and } from 'drizzle-orm';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const log = createModuleLogger('GitHubSRDSync');

// Data directory for JSON files
const DATA_ROOT = 'data/compendium';

// 5e-database configuration
const REPO_OWNER = '5e-bits';
const REPO_NAME = '5e-database';
const SOURCE_NAME = '5ebits';

/**
 * Ensure the data directory exists for a given type
 */
function ensureDataDir(type: string): string {
	const dir = join(process.cwd(), DATA_ROOT, type);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	return dir;
}

// Map JSON files to compendium types
const FILE_MAPPINGS: Record<string, { type: string; sourceBook: string }> = {
	// 2014 SRD
	'5e-SRD-Monsters.json': { type: 'monster', sourceBook: 'SRD' },
	'5e-SRD-Spells.json': { type: 'spell', sourceBook: 'SRD' },
	'5e-SRD-Classes.json': { type: 'class', sourceBook: 'SRD' },
	'5e-SRD-Races.json': { type: 'race', sourceBook: 'SRD' },
	'5e-SRD-Subraces.json': { type: 'subrace', sourceBook: 'SRD' },
	'5e-SRD-Subclasses.json': { type: 'subclass', sourceBook: 'SRD' },
	'5e-SRD-Backgrounds.json': { type: 'background', sourceBook: 'SRD' },
	'5e-SRD-Feats.json': { type: 'feat', sourceBook: 'SRD' },
	'5e-SRD-Features.json': { type: 'feature', sourceBook: 'SRD' },
	'5e-SRD-Conditions.json': { type: 'condition', sourceBook: 'SRD' },
	'5e-SRD-Traits.json': { type: 'trait', sourceBook: 'SRD' },
	'5e-SRD-Rules.json': { type: 'rule', sourceBook: 'SRD' },
	'5e-SRD-Rule-Sections.json': { type: 'ruleSection', sourceBook: 'SRD' },
	'5e-SRD-Equipment.json': { type: 'equipment', sourceBook: 'SRD' },
	'5e-SRD-Magic-Items.json': { type: 'item', sourceBook: 'SRD' },
	'5e-SRD-Equipment-Categories.json': { type: 'equipmentCategory', sourceBook: 'SRD' },
	'5e-SRD-Weapon-Properties.json': { type: 'weaponProperty', sourceBook: 'SRD' },
	'5e-SRD-Ability-Scores.json': { type: 'abilityScore', sourceBook: 'SRD' },
	'5e-SRD-Skills.json': { type: 'skill', sourceBook: 'SRD' },
	'5e-SRD-Languages.json': { type: 'language', sourceBook: 'SRD' },
	'5e-SRD-Alignments.json': { type: 'alignment', sourceBook: 'SRD' },
	'5e-SRD-Proficiencies.json': { type: 'proficiency', sourceBook: 'SRD' },
	'5e-SRD-Damage-Types.json': { type: 'damageType', sourceBook: 'SRD' },
	'5e-SRD-Magic-Schools.json': { type: 'magicSchool', sourceBook: 'SRD' },
	'5e-SRD-Levels.json': { type: 'level', sourceBook: 'SRD' },

	// 2024 SRD
	'5e-SRD-Equipment-Categories.json': { type: 'equipmentCategory', sourceBook: 'SRD' },
	'5e-SRD-Equipment.json': { type: 'equipment', sourceBook: 'SRD' },
	'5e-SRD-Conditions.json': { type: 'condition', sourceBook: 'SRD' },
	'5e-SRD-Feats.json': { type: 'feat', sourceBook: 'SRD' }
};

async function getLatestReleaseTag(): Promise<{ tag: string; commit: string }> {
	log.info('Fetching latest release from GitHub...');
	const response = await fetch(
		`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`
	);

	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
	}

	const release = await response.json();
	log.info({ tag: release.tag_name }, 'Found latest release');
	return { tag: release.tag_name, commit: release.target_commitish };
}

async function downloadJsonFile(tag: string, filepath: string): Promise<unknown> {
	const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${tag}/${filepath}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to download ${filepath}: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

async function listJsonFiles(tag: string, path: string): Promise<string[]> {
	const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${tag}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
	}

	const files = await response.json();
	return files
		.filter((f: { type: string; name: string }) => f.type === 'file' && f.name.endsWith('.json'))
		.map((f: { name: string }) => f.name);
}

function generateSummary(item: Record<string, unknown>, type: string): string {
	switch (type) {
		case 'spell': {
			const level = item.level ?? item.level_int ?? 0;
			const school = typeof item.school === 'string' ? item.school : item.school?.name || '';
			return level === 0 ? `Cantrip ${school}` : `Level ${level} ${school}`;
		}
		case 'monster': {
			const size = String(item.size || '');
			const monsterType = String(item.type || '');
			const cr = String(item.challenge_rating || '');
			return `${size} ${monsterType}, CR ${cr}`;
		}
		case 'class': {
			const hitDie = item.hit_die ? `d${item.hit_die}` : '';
			return `Hit Die: ${hitDie}`;
		}
		case 'race': {
			const size = String(item.size || 'Medium');
			const speed = item.speed ?? 30;
			return `${size} | Speed ${speed}`;
		}
		case 'background': {
			const feature = item.feature as Record<string, unknown> | undefined;
			const featureName = feature?.name as string | undefined;
			return featureName ? `Feature: ${featureName}` : 'Background';
		}
		case 'feat': {
			const prereqs = item.prerequisites as string[] | undefined;
			return prereqs?.length ? `Prerequisite: ${prereqs.join(', ')}` : 'Feat';
		}
		case 'condition':
			return 'Condition';
		case 'trait': {
			const races = (item.races as Array<{ name: string }>) || [];
			const raceNames = races.map((r) => r.name).join(', ') || 'All Races';
			return `Racial Trait - ${raceNames}`;
		}
		case 'subclass': {
			const className = (item.class as Record<string, string>)?.name || '';
			const flavor = (item.subclass_flavor as string) || 'Archetype';
			return `${className} - ${flavor}`;
		}
		case 'subrace': {
			const raceName = (item.race as Record<string, string>)?.name || '';
			return `${raceName} Subrace`;
		}
		case 'equipment': {
			const category = (item.equipment_category as Record<string, string>)?.name || '';
			const weight = item.weight ? `, ${item.weight} lbs` : '';
			return `${category}${weight}`;
		}
		case 'skill': {
			const ability = (item.ability_score as Record<string, string>)?.name || '';
			return `${ability} skill`;
		}
		case 'language': {
			const speakers = (item.typical_speakers as string[])?.join(', ') || '';
			const script = item.script ? ` (${item.script})` : '';
			return speakers ? `${speakers}${script}` : `Language${script}`;
		}
		default:
			return String(item.name || item.index || '');
	}
}

async function syncFile(
	db: Awaited<ReturnType<typeof getDb>>,
	tag: string,
	edition: string,
	filepath: string,
	data: unknown[]
): Promise<number> {
	const mapping = FILE_MAPPINGS[filepath];
	if (!mapping) {
		log.warn({ file: filepath }, 'No mapping found for file, skipping');
		return 0;
	}

	const { type, sourceBook } = mapping;
	log.info({ file: filepath, type, edition, count: data.length }, 'Syncing file');

	// Ensure data directory exists for this type
	const dataDir = ensureDataDir(type);

	// Delete ALL existing items of this type from this source with matching external IDs
	// (This allows re-importing the same items from a different edition)
	const externalIds = (data as Record<string, unknown>[]).map((item) =>
		String(item.index || item.slug || '')
	);

	// Delete by type, source, and the external IDs we're about to insert
	// This handles the case where 2014 and 2024 data share the same externalId
	const deleteResult = await db.delete(compendiumItems).where(
		and(
			eq(compendiumItems.source, SOURCE_NAME),
			eq(compendiumItems.type, type)
			// Note: We intentionally don't filter by edition to allow re-importing
		)
	);
	log.info({ deleted: deleteResult.changes }, 'Deleted existing items of this type');

	let inserted = 0;
	for (const item of data as Record<string, unknown>[]) {
		const index = String(item.index || item.slug || '');
		const name = String(item.name || 'Unknown');
		const summary = generateSummary(item, type);
		const content = extractSearchableContent(item);
		const details = item;

		// Write to JSON file (like Open5e provider does)
		const fileName = `${index}.json`;
		const jsonPath = join(type, fileName);
		const fullPath = join(dataDir, fileName);
		try {
			writeFileSync(fullPath, JSON.stringify(details, null, 2));
		} catch (err) {
			log.error({ error: (err as Error).message, file: fullPath }, 'Failed to write JSON file');
		}

		// Extract type-specific columns
		const typeColumns: Record<string, unknown> = {};
		switch (type) {
			case 'spell': {
				typeColumns.spellLevel = item.level ?? item.level_int ?? 0;
				typeColumns.spellSchool =
					typeof item.school === 'string' ? item.school : item.school?.name || '';
				break;
			}
			case 'monster': {
				typeColumns.challengeRating = String(item.challenge_rating || '');
				typeColumns.monsterSize = String(item.size || '');
				typeColumns.monsterType = String(item.type || '');
				break;
			}
			case 'class':
				typeColumns.classHitDie = Number(item.hit_die) || 0;
				break;
			case 'race': {
				typeColumns.raceSize = String(item.size || 'Medium');
				typeColumns.raceSpeed = Number(item.speed) || 30;
				break;
			}
			case 'background': {
				const feature = item.feature as Record<string, unknown>;
				typeColumns.backgroundFeature = (feature?.name as string) || '';
				const skills = item.skill_proficiencies as string[];
				typeColumns.backgroundSkillProficiencies = (skills || []).join(', ');
				break;
			}
			case 'feat': {
				const prereqs = item.prerequisites as string[];
				typeColumns.featPrerequisites = (prereqs || []).join(', ');
				break;
			}
			case 'trait': {
				typeColumns.traitName = String(item.name || '');
				const races = (item.races as Array<{ name: string }>) || [];
				typeColumns.traitRaces = races.map((r) => r.name).join(', ');
				break;
			}
			case 'subclass': {
				typeColumns.subclassName = String(item.name || '');
				const cls = item.class as Record<string, string>;
				typeColumns.className = cls?.name || '';
				typeColumns.subclassFlavor = item.subclass_flavor || '';
				break;
			}
			case 'subrace': {
				typeColumns.subraceName = String(item.name || '');
				const race = item.race as Record<string, string>;
				typeColumns.raceName = race?.name || '';
				break;
			}
			case 'condition':
				typeColumns.conditionName = String(item.name || '');
				break;
			case 'feature': {
				typeColumns.featureName = String(item.name || '');
				typeColumns.featureLevel = Number(item.level) || 0;
				const cls = item.class as Record<string, string>;
				typeColumns.className = cls?.name || '';
				break;
			}
		}

		try {
			await db.insert(compendiumItems).values({
				source: SOURCE_NAME,
				type,
				externalId: index,
				slug: index, // Normalize slug to match index for consistency across providers
				name,
				summary,
				details: details as any,
				content,
				jsonPath,
				edition,
				sourceBook,
				dataVersion: tag,
				spellLevel: (typeColumns.spellLevel as number) ?? null,
				spellSchool: (typeColumns.spellSchool as string) ?? null,
				challengeRating: (typeColumns.challengeRating as string) ?? null,
				monsterSize: (typeColumns.monsterSize as string) ?? null,
				monsterType: (typeColumns.monsterType as string) ?? null,
				classHitDie: (typeColumns.classHitDie as number) ?? null,
				raceSize: (typeColumns.raceSize as string) ?? null,
				raceSpeed: (typeColumns.raceSpeed as number) ?? null,
				backgroundFeature: (typeColumns.backgroundFeature as string) ?? null,
				backgroundSkillProficiencies: (typeColumns.backgroundSkillProficiencies as string) ?? null,
				featPrerequisites: (typeColumns.featPrerequisites as string) ?? null,
				traitName: (typeColumns.traitName as string) ?? null,
				traitRaces: (typeColumns.traitRaces as string) ?? null,
				subclassName: (typeColumns.subclassName as string) ?? null,
				className: (typeColumns.className as string) ?? null,
				subclassFlavor: (typeColumns.subclassFlavor as string) ?? null,
				subraceName: (typeColumns.subraceName as string) ?? null,
				raceName: (typeColumns.raceName as string) ?? null,
				conditionName: (typeColumns.conditionName as string) ?? null,
				featureName: (typeColumns.featureName as string) ?? null,
				featureLevel: (typeColumns.featureLevel as number) ?? null
			});
			inserted++;
		} catch (err) {
			log.error({ error: (err as Error).message, item: index }, 'Failed to insert item');
		}
	}

	log.info({ inserted }, 'Finished syncing file');
	return inserted;
}

async function main() {
	console.log('\n🚀 GitHub 5e-database Import\n');
	log.info('Starting GitHub 5e-database import...');

	try {
		const { tag, commit } = await getLatestReleaseTag();
		log.info({ tag, commit }, 'Using release');

		const json2014 = await listJsonFiles(commit, 'src/2014');
		log.info({ count: json2014.length }, 'Found 2014 JSON files');

		const json2024 = await listJsonFiles(commit, 'src/2024');
		log.info({ count: json2024.length }, 'Found 2024 JSON files');

		const db = await getDb();
		let totalInserted = 0;

		// Sync 2014 data
		for (const file of json2014) {
			try {
				const data = await downloadJsonFile(commit, `src/2014/${file}`);
				if (Array.isArray(data)) {
					const inserted = await syncFile(db, tag, '2014', file, data);
					totalInserted += inserted;
				}
			} catch (err) {
				log.error({ file, error: (err as Error).message }, 'Failed to sync 2014 file');
			}
		}

		// Sync 2024 data
		for (const file of json2024) {
			try {
				const data = await downloadJsonFile(commit, `src/2024/${file}`);
				if (Array.isArray(data)) {
					const inserted = await syncFile(db, tag, '2024', file, data);
					totalInserted += inserted;
				}
			} catch (err) {
				log.error({ file, error: (err as Error).message }, 'Failed to sync 2024 file');
			}
		}

		log.info({ totalInserted }, 'Import completed successfully');
		console.log(`\n✅ Successfully imported ${totalInserted} items from 5e-database ${tag}\n`);
	} catch (err) {
		log.error({ error: (err as Error).message }, 'Import failed');
		console.error(`\n❌ Import failed: ${(err as Error).message}\n`);
		process.exit(1);
	}
}

main();
