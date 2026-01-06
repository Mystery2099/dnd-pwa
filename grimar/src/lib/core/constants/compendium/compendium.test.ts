import { describe, it, expect } from 'vitest';
import { getTypeFromPath } from '$lib/core/constants/compendium';

describe('Compendium Constants', () => {
	describe('getTypeFromPath', () => {
		it('should convert "monsters" to "monster"', () => {
			expect(getTypeFromPath('monsters')).toBe('monster');
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

		it('should convert "races" to "race"', () => {
			expect(getTypeFromPath('races')).toBe('race');
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

		it('should convert "sections" to "section"', () => {
			expect(getTypeFromPath('sections')).toBe('section');
		});

		it('should throw error for unknown path', () => {
			expect(() => getTypeFromPath('unknown')).toThrow('Unknown compendium path: unknown');
		});
	});

	describe('type mappings are bidirectional', () => {
		const pathTypes = [
			['monsters', 'monster'],
			['spells', 'spell'],
			['feats', 'feat'],
			['backgrounds', 'background'],
			['races', 'race'],
			['classes', 'class'],
			['magicitems', 'item'],
			['weapons', 'weapon'],
			['armor', 'armor'],
			['conditions', 'condition'],
			['planes', 'plane'],
			['sections', 'section']
		];

		it('should have valid mappings for all types', () => {
			for (const [path, dbType] of pathTypes) {
				expect(getTypeFromPath(path)).toBe(dbType);
			}
		});

		it('should have unique database types', () => {
			const dbTypes = pathTypes.map(([, type]) => type);
			const uniqueTypes = new Set(dbTypes);
			expect(uniqueTypes.size).toBe(dbTypes.length);
		});
	});
});
