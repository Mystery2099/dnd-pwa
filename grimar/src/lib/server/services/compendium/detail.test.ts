import { describe, expect, it } from 'vitest';
import { buildCompendiumDetailPayload } from './detail';
import type { CompendiumItem } from '$lib/server/db/schema';

function createItem(overrides: Partial<CompendiumItem>): CompendiumItem {
	return {
		key: 'test-item',
		type: 'languages',
		name: 'Test Item',
		source: 'open5e',
		documentKey: null,
		documentName: null,
		gamesystemKey: null,
		gamesystemName: null,
		publisherKey: null,
		publisherName: null,
		description: null,
		data: {},
		createdAt: new Date(),
		updatedAt: new Date(),
		createdBy: null,
		...overrides
	};
}

describe('buildCompendiumDetailPayload', () => {
	it('normalizes plain Open5e URL strings into internal entity references', () => {
		const item = createItem({
			type: 'languages',
			data: {
				script_language: 'http://10.147.20.240:8888/v2/languages/infernal/'
			}
		});

		const payload = buildCompendiumDetailPayload(item);

		expect(payload.fields).toEqual([
			{
				key: 'script_language',
				label: 'Script Language',
				value: {
					kind: 'entity',
					type: 'languages',
					key: 'infernal',
					label: 'Infernal',
					href: '/compendium/languages/infernal',
					meta: undefined,
					sourceUrl: 'http://10.147.20.240:8888/v2/languages/infernal/'
				}
			}
		]);
	});

	it('promotes creature set rosters into a dedicated section', () => {
		const item = createItem({
			type: 'creaturesets',
			data: {
				name: 'Common Mounts',
				creatures: [
					{
						name: 'Camel',
						key: 'srd_camel',
						url: 'http://10.147.20.240:8888/v2/creatures/srd_camel/'
					}
				]
			}
		});

		const payload = buildCompendiumDetailPayload(item);

		expect(payload.fields).toEqual([]);
		expect(payload.sections).toEqual([
			{
				key: 'creatures',
				title: 'Roster',
				description: 'Creatures included in this set.',
				kind: 'creature-set-roster',
				items: [
					{
						key: 'srd_camel',
						label: 'Camel',
						href: '/compendium/creatures/srd_camel',
						type: undefined,
						size: undefined,
						documentLabel: undefined,
						environments: [],
						challengeRatingText: undefined,
						armorClass: undefined,
						hitPoints: undefined,
						speed: undefined
					}
				]
			}
		]);
	});

	it('returns curated sidebar fields instead of raw unfiltered metadata', () => {
		const item = createItem({
			type: 'languages',
			data: {
				is_exotic: true,
				is_secret: false,
				script_language: 'http://10.147.20.240:8888/v2/languages/infernal/'
			}
		});

		const payload = buildCompendiumDetailPayload(item);

		expect(payload.fields.map((field) => field.key)).toEqual([
			'is_exotic',
			'is_secret',
			'script_language'
		]);
	});
});
