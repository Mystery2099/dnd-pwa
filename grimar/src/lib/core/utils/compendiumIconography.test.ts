import { describe, expect, it } from 'vitest';
import {
	resolveAoeToken,
	resolveCompendiumCardIcon,
	resolveDamageTypeTokens
} from './compendiumIconography';

describe('compendiumIconography', () => {
	it('resolves spell and creature card icons from string and object values', () => {
		expect(resolveCompendiumCardIcon('spells', { school: 'Evocation Magic' })).toEqual({
			family: 'spell-school',
			value: 'evocation-magic'
		});
		expect(resolveCompendiumCardIcon('creatures', { type: { name: 'Aberration' } })).toEqual({
			family: 'creature-type',
			value: 'aberration'
		});
		expect(resolveCompendiumCardIcon('items', { type: 'weapon' })).toBeUndefined();
	});

	it('normalizes damage type tokens from strings and arrays', () => {
		expect(resolveDamageTypeTokens('Fire, Cold, Acid')).toEqual(['fire', 'cold', 'acid']);
		expect(
			resolveDamageTypeTokens(['Lightning', { name: 'Thunder' }, { key: 'force' }, null, {}])
		).toEqual(['lightning', 'thunder', 'force']);
	});

	it('maps area-of-effect phrases to canonical icon tokens', () => {
		expect(resolveAoeToken('20-foot radius')).toBe('sphere');
		expect(resolveAoeToken('Self (30-foot cone)')).toBe('cone');
		expect(resolveAoeToken('120-foot line')).toBe('line');
		expect(resolveAoeToken('Point you can see')).toBe('point');
		expect(resolveAoeToken(42)).toBeUndefined();
	});
});
