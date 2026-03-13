import { describe, expect, it } from 'vitest';
import { getImageKind, getImageKindLabel } from './images';

describe('image kind helpers', () => {
	it('detects condition icons from file paths', () => {
		expect(
			getImageKind('/static/img/object_icons/elderberry-inn-icons/conditions/blinded.svg')
		).toBe('condition-icon');
		expect(
			getImageKindLabel('/static/img/object_icons/elderberry-inn-icons/conditions/blinded.svg')
		).toBe('Condition Icon');
	});

	it('detects creature illustrations from file paths', () => {
		expect(
			getImageKind('/static/img/object_illustrations/open5e-illustrations/monsters/aboleth.png')
		).toBe('creature-illustration');
		expect(
			getImageKindLabel(
				'/static/img/object_illustrations/open5e-illustrations/monsters/aboleth.png'
			)
		).toBe('Creature Illustration');
	});

	it('falls back to a generic image label when the path is unknown', () => {
		expect(getImageKind('/assets/misc/banner.png')).toBe('image');
		expect(getImageKindLabel('/assets/misc/banner.png')).toBe('Image');
	});
});
