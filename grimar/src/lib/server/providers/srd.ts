/**
 * SRD Provider
 *
 * Adapter for the D&D 5e SRD API (https://www.dnd5eapi.co)
 * Wraps the existing srd.ts client to implement the provider interface.
 */

import { BaseProvider } from './base-provider';
import {
	getSpells as getSpellsApi,
	getSpellDetail,
	getMonsters as getMonstersApi,
	getMonsterDetail,
	getMonstersWithDetails,
	type SrdSpell,
	type SrdMonsterSummary
} from '$lib/server/services/compendium/srd';
import type { FetchOptions, ProviderListResponse, TransformResult } from './types';
import type { CompendiumTypeName } from '$lib/core/types/compendium';
import {
	SrdSpellSchema,
	SrdMonsterDetailSchema,
	validateData,
	tryValidate
} from '$lib/core/types/compendium/schemas';

/**
 * SRD Provider Implementation
 * Uses GraphQL for efficient list fetching
 */
export class SrdProvider extends BaseProvider {
	readonly id = 'srd';
	readonly name = 'D&D 5e SRD';
	readonly baseUrl = 'https://www.dnd5eapi.co/api';
	readonly supportedTypes = ['spell', 'monster'] as const;

	async fetchList(type: CompendiumTypeName, options?: FetchOptions): Promise<ProviderListResponse> {
		const limit = options?.limit || 500;

		if (type === 'spell') {
			const spells = await getSpellsApi(limit);
			return {
				items: spells,
				hasMore: false
			};
		}

		if (type === 'monster') {
			const monsters = await getMonstersApi(limit);
			return {
				items: monsters,
				hasMore: false
			};
		}

		throw new Error(`SRD does not support type: ${type}`);
	}

	async fetchAllPages(type: CompendiumTypeName): Promise<unknown[]> {
		console.info(`[srd] Fetching all ${type}s`);

		if (type === 'spell') {
			const spells = await getSpellsApi(500);
			console.info(`[srd] Received ${spells.length} spells`);
			return spells;
		}
		if (type === 'monster') {
			// Fetch full details for each monster (not just summary)
			const monsters = await getMonstersWithDetails(500);
			console.info(`[srd] Received ${monsters.length} monsters with full details`);
			return monsters;
		}
		return [];
	}

	async fetchDetail(
		type: CompendiumTypeName,
		externalId: string
	): Promise<Record<string, unknown>> {
		if (type === 'monster') {
			const result = await getMonsterDetail(externalId);
			if (!result) throw new Error(`Failed to fetch monster detail: ${externalId}`);
			return result;
		}
		if (type === 'spell') {
			const result = await getSpellDetail(externalId);
			if (!result) throw new Error(`Failed to fetch spell detail: ${externalId}`);
			return result;
		}
		throw new Error(`SRD does not support type: ${type}`);
	}

	transformItem(rawItem: unknown, type: CompendiumTypeName): TransformResult {
		if (type === 'spell') {
			const spell = validateData(SrdSpellSchema, rawItem, 'SRD spell');
			return this.transformSpell(spell);
		}
		if (type === 'monster') {
			// Use tryValidate to accept raw data if validation fails
			const monster = tryValidate(SrdMonsterDetailSchema, rawItem, 'SRD monster detail') || rawItem;
			return this.transformMonster(monster as SrdMonsterSummary);
		}
		throw new Error(`SRD does not support type: ${type}`);
	}

	private transformSpell(spell: SrdSpell): TransformResult {
		return {
			externalId: spell.index,
			name: spell.name,
			summary: `Level ${spell.level} ${spell.school.name}`,
			details: spell as unknown as Record<string, unknown>,
			spellLevel: spell.level,
			spellSchool: spell.school.name
		};
	}

	private transformMonster(monster: SrdMonsterSummary): TransformResult {
		const size = this.toTitleCase(monster.size);
		const typeName = this.toTitleCase(monster.type);
		const cr = String(monster.challenge_rating);

		const summary = `${size} ${typeName}, CR ${cr}`;

		return {
			externalId: monster.index,
			name: monster.name,
			summary,
			details: monster as unknown as Record<string, unknown>,
			challengeRating: cr,
			monsterSize: size,
			monsterType: typeName
		};
	}

	protected getEndpoint(type: CompendiumTypeName): string {
		switch (type) {
			case 'spell':
				return '/spells/';
			case 'monster':
				return '/monsters/';
			default:
				throw new Error(`SRD does not support type: ${type}`);
		}
	}
}
