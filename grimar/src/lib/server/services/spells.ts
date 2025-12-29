import type { PaginatedResult, PaginationOptions } from '$lib/server/repositories/compendium';
import { getPaginatedCompendiumItems } from '$lib/server/repositories/compendium';
import type { SrdSpell } from '$lib/server/services/srd';

export interface SpellSearchParams {
	limit?: number;
	offset?: number;
	search?: string;
	level?: string[];
	school?: string[];
	filters?: {
		spellLevel?: number[];
		spellSchool?: string[];
	};
}

export class SpellService {
	/**
	 * Get paginated spells with optional filtering
	 */
	async getSpells(params: SpellSearchParams = {}): Promise<PaginatedResult<SrdSpell>> {
		const { limit = 50, offset = 0, search, filters } = params;

		const options: PaginationOptions = {
			limit,
			offset,
			search: search || undefined,
			filters: filters
				? {
						spellLevel: filters.spellLevel,
						spellSchool: filters.spellSchool
					}
				: undefined
		};

		const result = await getPaginatedCompendiumItems('spells', options);

		// Transform compendium items to SrdSpell format
		const spells: SrdSpell[] = result.items.map((item) => {
			const details = item.details as any;
			return {
				index: item.externalId || item.id.toString(),
				name: item.name,
				level: details?.level || 0,
				school: { name: details?.school || 'Unknown' },
				classes: details?.classes || [],
				desc: Array.isArray(details?.desc) ? details.desc : [details?.desc || ''],
				higher_level: Array.isArray(details?.higher_level)
					? details.higher_level
					: details?.higher_level
						? [details.higher_level]
						: [],
				range: details?.range || '',
				components: details?.components || [],
				ritual: details?.ritual || false,
				duration: details?.duration || '',
				concentration: details?.concentration || false,
				casting_time: details?.casting_time || ''
			};
		});

		return {
			...result,
			items: spells
		};
	}

	/**
	 * Search spells by term
	 */
	async searchSpells(term: string, limit: number = 50): Promise<PaginatedResult<SrdSpell>> {
		return this.getSpells({
			search: term,
			limit
		});
	}

	/**
	 * Get spells filtered by level
	 */
	async getSpellsByLevel(levels: string[], limit: number = 50): Promise<PaginatedResult<SrdSpell>> {
		// Convert level strings to numbers
		const numericLevels = levels
			.map((l) => {
				if (l === 'Cantrip' || l === 'cantrip') return 0;
				return parseInt(l) || 0;
			})
			.filter((l) => l >= 0 && l <= 9);

		return this.getSpells({
			limit,
			filters: {
				spellLevel: numericLevels
			}
		});
	}

	/**
	 * Get spells filtered by school
	 */
	async getSpellsBySchool(
		schools: string[],
		limit: number = 50
	): Promise<PaginatedResult<SrdSpell>> {
		return this.getSpells({
			limit,
			filters: {
				spellSchool: schools
			}
		});
	}
}

export const spellService = new SpellService();
