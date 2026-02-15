import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Open5eProvider } from './open5e'

describe('Open5eProvider', () => {
	let provider: Open5eProvider

	beforeEach(() => {
		provider = new Open5eProvider()
		global.fetch = vi.fn()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('fetchAllPages', () => {
		it('should fetch all items from GitHub raw URL', async () => {
			const mockSpells = [
				{
					pk: 'srd_fireball',
					model: 'api_v2.spell',
					document: 'srd-2014',
					fields: {
						name: 'Fireball',
						level: 3,
						school: 'Evocation',
						desc: ['A bright streak flashes from your pointing finger...'],
						higher_level: ['When you cast this spell using a spell slot of 4th level or higher...'],
						range: '150 feet',
						components: ['V', 'S', 'M'],
						material: 'A tiny ball of bat guano and sulfur',
						ritual: false,
						duration: 'Instantaneous',
						concentration: false,
						casting_time: '1 action'
					}
				}
			]

			// Mock the sources to avoid GitHub API calls
			const mockSources = new Map()
			mockSources.set('srd_fireball', {
				publisher: 'wizards-of-the-coast',
				source: 'srd-2014',
				displayName: 'SRD 2014',
				gamesystem: '5e-2014'
			})

			// Mock fetch for Document.json and type files
			const mockFetch = vi.fn()
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: async () => JSON.stringify([{
					pk: 'srd_fireball',
					fields: {
						name: 'Fireball',
						display_name: 'Fireball',
						publisher: 'wizards-of-the-coast',
						gamesystem: '5e-2014'
					}
				}])
			})
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: async () => JSON.stringify(mockSpells)
			})

			// Create a proper fetch mock
			const fetchMock = vi.fn()
			fetchMock.mockImplementation((url) => {
				if (url.includes('Document.json')) {
					return mockFetch(url)
				} else {
					return mockFetch(url)
				}
			})

			global.fetch = fetchMock as any

			const provider = new Open5eProvider()
			// Mock the sources property
			Object.defineProperty(provider, 'sources', { value: mockSources })
			Object.defineProperty(provider, 'sourcesLoaded', { value: true })

			const results = await provider.fetchAllPages('spell')

			expect(results).toHaveLength(1)
			expect(results[0]).toMatchObject({ pk: 'srd_fireball' })
			expect(global.fetch).toHaveBeenCalledTimes(2)
		})
	})

	describe('transformItem', () => {
		it('should transform feat correctly', () => {
			const validFeat = {
				pk: 'srd_alert',
				model: 'api_v2.feat',
				document: 'srd-2014',
				fields: {
					name: 'Alert',
					prerequisites: ['Level 4'],
					description: ['Always on the lookout for danger...']
				},
				_sourceInfo: {
					publisher: 'wizards-of-the-coast',
					source: 'srd-2014',
					displayName: 'SRD 2014',
					gamesystem: '5e-2014'
				}
			}

			const result = provider.transformItem(validFeat, 'feat')
			expect(result.externalId).toBe('srd_alert')
			expect(result.name).toBe('Alert')
			expect(result.featPrerequisites).toBe('Level 4')
			expect(result.jsonData).toBeDefined()
			expect(result.sourceBook).toBe('srd-2014')
			expect(result.sourcePublisher).toBe('wizards-of-the-cast')
		})

		it('should transform creature correctly', () => {
			const validCreature = {
				pk: 'srd_ancient-red-dragon',
				model: 'api_v2.creature',
				document: 'srd-2014',
				fields: {
					name: 'Ancient Red Dragon',
					size: 'Gargantuan',
					type: 'Dragon',
					challenge_rating: 24
				},
				_sourceInfo: {
					publisher: 'wizards-of-the-cast',
					source: 'srd-2014',
					displayName: 'SRD 2014',
					gamesystem: '5e-2014'
				}
			}

			const result = provider.transformItem(validCreature, 'creature')
			expect(result.externalId).toBe('srd_ancient-red-dragon')
			expect(result.name).toBe('Ancient Red Dragon')
			expect(result.creatureSize).toBe('Gargantuan')
			expect(result.creatureType).toBe('Dragon')
			expect(result.challengeRating).toBe('24')
			expect(result.jsonData).toBeDefined()
			expect(result.sourceBook).toBe('srd-2014')
			expect(result.sourcePublisher).toBe('wizards-of-the-cast')
		})

		it('should transform spell correctly', () => {
			const validSpell = {
				pk: 'srd_fireball',
				model: 'api_v2.spell',
				document: 'srd-2014',
				fields: {
					name: 'Fireball',
					level: 3,
					school: 'Evocation',
					desc: ['A bright streak flashes from your pointing finger...'],
					higher_level: ['When you cast this spell using a spell slot of 4th level or higher...'],
					range: '150 feet',
					components: ['V', 'S', 'M'],
					material: 'A tiny ball of bat guano and sulfur',
					ritual: false,
					duration: 'Instantaneous',
					concentration: false,
					casting_time: '1 action'
				},
				_sourceInfo: {
					publisher: 'wizards-of-the-cast',
					source: 'srd-2014',
					displayName: 'SRD 2014',
					gamesystem: '5e-2014'
				}
			}

			const result = provider.transformItem(validSpell, 'spell')
			expect(result.externalId).toBe('srd_fireball')
			expect(result.name).toBe('Fireball')
			expect(result.spellLevel).toBe(3)
			expect(result.spellSchool).toBe('Evocation')
			expect(result.jsonData).toBeDefined()
			expect(result.sourceBook).toBe('srd-2014')
			expect(result.sourcePublisher).toBe('wizards-of-the-cast')
		})

		it('should transform species correctly', () => {
			const validSpecies = {
				pk: 'srd_elf',
				model: 'api_v2.species',
				document: 'srd-2014',
				fields: {
					name: 'Elf',
					desc: 'Elves are magical people of otherworldly grace...'
				},
				_sourceInfo: {
					publisher: 'wizards-of-the-cast',
					source: 'srd-2014',
					displayName: 'SRD 2014',
					gamesystem: '5e-2014'
				}
			}

			const result = provider.transformItem(validSpecies, 'race')
			expect(result.externalId).toBe('srd_elf')
			expect(result.name).toBe('Elf')
			expect(result.jsonData).toBeDefined()
			expect(result.sourceBook).toBe('srd-2014')
			expect(result.sourcePublisher).toBe('wizards-of-the-cast')
		})

		it('should extract edition from gamesystem', () => {
			const spell2024 = {
				pk: 'srd_fireball-2024',
				model: 'api_v2.spell',
				document: 'srd-2024',
				fields: {
					name: 'Fireball',
					level: 3,
					school: 'Evocation',
					desc: ['A bright streak...'],
					ritual: false,
					concentration: false
				},
				_sourceInfo: {
					publisher: 'wizards-of-the-cast',
					source: 'srd-2024',
					displayName: 'SRD 2024',
					gamesystem: '5e-2024'
				}
			}

			const result = provider.transformItem(spell2024, 'spell')
			expect(result.edition).toBe('2024')
		})
	})
})