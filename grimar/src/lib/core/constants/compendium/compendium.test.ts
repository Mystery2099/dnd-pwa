import { describe, it, expect } from 'vitest';
import { getTypeFromPath, getCompendiumConfig, getDbTypeFromPath, getUrlPathFromDbType, DB_TYPES } from '$lib/core/constants/compendium';

describe('Compendium Constants', () => {
	describe('getTypeFromPath', () => {
		it('should convert "creatures" to "creature"', () => {
			expect(getTypeFromPath('creatures')).toBe('creature');
		});

		it('should convert "spells" to "spell"', () => {
			expect(getTypeFromPath('spells')).toBe('spell');
		});

		it('should convert "feats" to "feat"', () => {
			expect(getTypeFromPath('feats')).toBe('feat');
		});

		it('should convert "backgrounds" to "background"', () => {
			expect(getTypeFromPath('backgrounds')).toBe('background');
		});

		it('should convert "races" to "species" (standardized type)', () => {
			// URL path 'races' maps to DB type 'species', singular form is 'species'
			expect(getTypeFromPath('races')).toBe('species');
		});

		it('should convert "species" to "species"', () => {
			expect(getTypeFromPath('species')).toBe('species');
		});

		it('should convert "classes" to "class"', () => {
			expect(getTypeFromPath('classes')).toBe('class');
		});

		it('should convert "magicitems" to "item"', () => {
			expect(getTypeFromPath('magicitems')).toBe('item');
		});

		it('should convert "weapons" to "weapon"', () => {
			expect(getTypeFromPath('weapons')).toBe('weapon');
		});

		it('should convert "armor" to "armor"', () => {
			expect(getTypeFromPath('armor')).toBe('armor');
		});

		it('should convert "conditions" to "condition"', () => {
			expect(getTypeFromPath('conditions')).toBe('condition');
		});

		it('should convert "planes" to "plane"', () => {
			expect(getTypeFromPath('planes')).toBe('plane');
		});

		it('should throw error for unknown path', () => {
			expect(() => getTypeFromPath('unknown')).toThrow('Unknown compendium path: unknown');
		});
	});

	describe('getDbTypeFromPath', () => {
		it('should return "species" for "races" URL path', () => {
			expect(getDbTypeFromPath('races')).toBe('species');
		});

		it('should return "creatures" for "monsters" URL path (backward compat)', () => {
			expect(getDbTypeFromPath('monsters')).toBe('creatures');
		});
	});

	describe('getUrlPathFromDbType', () => {
		it('should return "races" for "species" DB type', () => {
			expect(getUrlPathFromDbType('species')).toBe('races');
		});

		it('should return "items" for "magicitems" DB type', () => {
			expect(getUrlPathFromDbType('magicitems')).toBe('items');
		});
	});

	describe('type mappings are bidirectional', () => {
		// Note: 'races' and 'species' both map to singular 'species', so we test them separately
		const pathTypes = [
			['creatures', 'creature'],
			['spells', 'spell'],
			['feats', 'feat'],
			['backgrounds', 'background'],
			['species', 'species'],
			['classes', 'class'],
			['magicitems', 'item'],
			['weapons', 'weapon'],
			['armor', 'armor'],
			['conditions', 'condition'],
			['planes', 'plane']
		];

		it('should have valid mappings for all types', () => {
			for (const [path, dbType] of pathTypes) {
				expect(getTypeFromPath(path)).toBe(dbType);
			}
		});

		it('should have unique singular types in pathTypes array', () => {
			const singularTypes = pathTypes.map(([, type]) => type);
			const uniqueTypes = new Set(singularTypes);
			expect(uniqueTypes.size).toBe(singularTypes.length);
		});
	});

	describe('DB_TYPES constant', () => {
		it('should have SPECIES defined', () => {
			expect(DB_TYPES.SPECIES).toBe('species');
		});

		it('should have MAGIC_ITEMS defined', () => {
			expect(DB_TYPES.MAGIC_ITEMS).toBe('magicitems');
		});
	});
});
