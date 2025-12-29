import type { PageServerLoad } from './$types';
import {
	getPaginatedCompendiumItems,
	parsePaginationQuery
} from '$lib/server/db/repositories/compendium';
import { measureAsync, logPagePerformance } from '$lib/server/monitoring';
import { SPELL_LEVELS } from '$lib/constants/spells';

function normalizeSpell(details: Record<string, any>) {
	const desc = Array.isArray(details?.desc) ? details.desc : details?.desc ? [details.desc] : [];

	const higher_level = Array.isArray(details?.higher_level)
		? details.higher_level
		: details?.higher_level
			? [details.higher_level]
			: [];

	const components = Array.isArray(details?.components)
		? details.components
		: details?.components
			? [details.components]
			: [];

	const classes =
		Array.isArray(details?.classes) && details.classes.length > 0
			? details.classes.map((c: any) => (typeof c === 'string' ? { name: c } : c))
			: details?.classes
				? String(details.classes)
						.split(',')
						.map((c) => c.trim())
						.filter(Boolean)
						.map((name) => ({ name }))
				: [];

	const school =
		typeof details?.school === 'string'
			? { name: details.school }
			: details?.school?.name
				? details.school
				: { name: 'Unknown' };

	return {
		...details,
		name: details.name,
		level: details.level,
		school,
		desc,
		higher_level,
		components,
		classes
	};
}

export const load: PageServerLoad = async ({ url }) => {
	// Parse pagination options synchronously (fast)
	const options = parsePaginationQuery(url);

	// Prepare filters for the client (fast)
	const filters = {
		search: options.search,
		levels: options.filters?.spellLevel?.map((l: number) => SPELL_LEVELS[l]) || [],
		schools: options.filters?.spellSchool || []
	};

	// Create a promise for the heavy data (slow)
	const loadSpells = async () => {
		const startTime = performance.now();

		// Get paginated spells with filters
		const result = await measureAsync('compendium_spells_load', () =>
			getPaginatedCompendiumItems('spell', options)
		);

		console.info('[spells-page] Loaded spells:', {
			total: result.total,
			items: result.items.length
		});

		// Normalize spells for the UI
		const spells = result.items.map((row: any) => {
			const normalized = normalizeSpell(row.details as any);
			return {
				...normalized,
				name: row.details.name || normalized.name,
				level: row.details.level || normalized.level,
				school: row.details.school || normalized.school,
				externalId: row.externalId,
				__rowId: row.id,
				source: row.source
			};
		});

		const loadTime = performance.now() - startTime;
		logPagePerformance('/compendium/spells', loadTime);

		// Determine if we have any spells.
		// If filters are active, we can't trust result.total to tell us if the DB is empty.
		// We assume if filters are active, the DB is not empty.
		// Only if result.total is 0 AND no filters are active do we say "hasAnySpells = false".
		const hasFilters =
			(options.filters?.spellLevel?.length ?? 0) > 0 ||
			(options.filters?.spellSchool?.length ?? 0) > 0 ||
			!!options.search;

		const hasAnySpells = result.total > 0 || hasFilters;

		return {
			spells,
			pagination: {
				...result,
				items: spells
			},
			hasAnySpells
		};
	};

	return {
		filters,
		streamed: {
			spells: loadSpells()
		}
	};
};
