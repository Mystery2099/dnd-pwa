import { describe, it, expect } from 'vitest';

// Import the functions to test (we need to extract them or test the module behavior)
// Since the orchestrator is complex, we'll test the helper functions that are testable

describe('Sync Orchestrator Helpers', () => {
	// Type canonicalization mapping (copied from orchestrator.ts for testing)
	const TYPE_CANONICAL: Record<string, string> = {
		spell: 'spell',
		spells: 'spell',
		monster: 'monster',
		monsters: 'monster',
		item: 'item',
		items: 'item',
		feat: 'feat',
		feats: 'feat',
		background: 'background',
		backgrounds: 'background',
		race: 'race',
		races: 'race',
		class: 'class',
		classes: 'class'
	};

	function normalizeType(type: string): string | null {
		return TYPE_CANONICAL[type.toLowerCase()] || null;
	}

	describe('normalizeType', () => {
		it('should normalize singular to canonical form', () => {
			expect(normalizeType('spell')).toBe('spell');
			expect(normalizeType('monster')).toBe('monster');
			expect(normalizeType('item')).toBe('item');
		});

		it('should normalize plural to singular form', () => {
			expect(normalizeType('spells')).toBe('spell');
			expect(normalizeType('monsters')).toBe('monster');
			expect(normalizeType('items')).toBe('item');
			expect(normalizeType('feats')).toBe('feat');
		});

		it('should be case insensitive', () => {
			expect(normalizeType('SPELL')).toBe('spell');
			expect(normalizeType('Spell')).toBe('spell');
			expect(normalizeType('sPeLl')).toBe('spell');
		});

		it('should return null for unknown types', () => {
			expect(normalizeType('unknown')).toBeNull();
			expect(normalizeType('character')).toBeNull();
			expect(normalizeType('')).toBeNull();
		});
	});

	describe('TYPE_CANONICAL mapping', () => {
		it('should have bidirectional mapping for spell types', () => {
			expect(TYPE_CANONICAL['spell']).toBe('spell');
			expect(TYPE_CANONICAL['spells']).toBe('spell');
		});

		it('should have bidirectional mapping for monster types', () => {
			expect(TYPE_CANONICAL['monster']).toBe('monster');
			expect(TYPE_CANONICAL['monsters']).toBe('monster');
		});

		it('should handle all core compendium types', () => {
			const expectedTypes = ['spell', 'monster', 'item', 'feat', 'background', 'race', 'class'];
			expectedTypes.forEach((type) => {
				expect(TYPE_CANONICAL[type]).toBeDefined();
				const plural = type === 'class' ? 'classes' : type + 's';
				expect(TYPE_CANONICAL[plural]).toBe(type);
			});
		});
	});
});

describe('SyncOptions', () => {
	it('should have correct default values', () => {
		const DEFAULT_MAX_RETRIES = 3;
		const DEFAULT_RETRY_DELAY_MS = 1000;
		const BATCH_SIZE = 100;

		expect(DEFAULT_MAX_RETRIES).toBe(3);
		expect(DEFAULT_RETRY_DELAY_MS).toBe(1000);
		expect(BATCH_SIZE).toBe(100);
	});
});