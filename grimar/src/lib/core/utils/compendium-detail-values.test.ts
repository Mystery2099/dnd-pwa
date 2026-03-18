import { describe, expect, it } from 'vitest';
import {
	getCompendiumDetailReferenceLabel,
	isCompendiumDetailReference
} from './compendium-detail-values';

describe('compendium-detail-values', () => {
	it('recognizes normalized compendium detail references', () => {
		const value = {
			kind: 'entity',
			type: 'spellschools',
			key: 'illusion',
			label: 'Illusion',
			href: '/compendium/spellschools/illusion',
			meta: 'illusion',
			sourceUrl: 'http://10.147.20.240:8888/v2/spellschools/illusion/'
		};

		expect(isCompendiumDetailReference(value)).toBe(true);
		expect(getCompendiumDetailReferenceLabel(value)).toBe('Illusion');
	});

	it('accepts normalized references without a sourceUrl', () => {
		const value = {
			kind: 'entity',
			type: 'spellschools',
			key: 'illusion',
			label: 'Illusion',
			href: '/compendium/spellschools/illusion'
		};

		expect(isCompendiumDetailReference(value)).toBe(true);
		expect(getCompendiumDetailReferenceLabel(value)).toBe('Illusion');
	});

	it('rejects raw linked objects from the pre-normalized shape', () => {
		const value = {
			name: 'Illusion',
			key: 'illusion',
			url: 'http://10.147.20.240:8888/v2/spellschools/illusion/'
		};

		expect(isCompendiumDetailReference(value)).toBe(false);
		expect(getCompendiumDetailReferenceLabel(value)).toBeNull();
	});
});
