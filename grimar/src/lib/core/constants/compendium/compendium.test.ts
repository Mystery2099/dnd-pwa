import { describe, it, expect } from 'vitest';
import { getTypeFromPath, getCompendiumConfig, getDbTypeFromPath, getUrlPathFromDbType, DB_TYPES } from '$lib/core/constants/compendium';

describe('Compendium Constants', () => {
	describe('getTypeFromPath', () => {
		it('should convert "creatures" to "creatures"', () => {
			expect(getTypeFromPath('creatures')).toBe('creatures');
		});

		it('should convert "spells" to "spells"', () => {
			expect(getTypeFromPath('spells')).toBe('spells');
		});

		it('should convert "feats" to "feats"', () => {
			expect(getTypeFromPath('feats')).toBe('feats');
		});

		it('should convert "backgrounds" to "backgrounds"', () => {
			expect(getTypeFromPath('backgrounds')).toBe('backgrounds');
		});

		it('should convert "races" to "species"', () => {
			expect(getTypeFromPath('races')).toBe('species');
		});

		it('should convert "species" to "species"', () => {
			expect(getTypeFromPath('species')).toBe('species');
		});

		it('should convert "classes" to "classes"', () => {
			expect(getTypeFromPath('classes')).toBe('classes');
		});

		it('should convert "magicitems" to "magic_items"', () => {
			expect(getTypeFromPath('magicitems')).toBe('magic_items');
		});

		it('should convert "items" to "magic_items"', () => {
			expect(getTypeFromPath('items')).toBe('magic_items');
		});

		it('should convert "weapons" to "weapons"', () => {
			expect(getTypeFromPath('weapons')).toBe('weapons');
		});

		it('should convert "armor" to "armor"', () => {
			expect(getTypeFromPath('armor')).toBe('armor');
		});

		it('should convert "conditions" to "conditions"', () => {
			expect(getTypeFromPath('conditions')).toBe('conditions');
		});

		it('should convert "planes" to "planes"', () => {
			expect(getTypeFromPath('planes')).toBe('planes');
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

		it('should return "magicitems" for "items" URL path', () => {
			expect(getDbTypeFromPath('items')).toBe('magicitems');
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
		const pathTypes = [
			['creatures', 'creatures'],
			['spells', 'spells'],
			['feats', 'feats'],
			['backgrounds', 'backgrounds'],
			['species', 'species'],
			['classes', 'classes'],
			['magicitems', 'magic_items'],
			['weapons', 'weapons'],
			['armor', 'armor'],
			['conditions', 'conditions'],
			['planes', 'planes']
		];

		it('should have valid mappings for all types', () => {
			for (const [path, dbType] of pathTypes) {
				expect(getTypeFromPath(path)).toBe(dbType);
			}
		});

		it('should have unique types in pathTypes array', () => {
			const types = pathTypes.map(([, type]) => type);
			const uniqueTypes = new Set(types);
			expect(uniqueTypes.size).toBe(types.length);
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
