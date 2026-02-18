<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { Switch } from '$lib/components/ui/switch';

	type Props = {
		contentType: string;
		initialData?: Record<string, unknown>;
		onsubmit: (data: Record<string, unknown>) => void;
		oncancel?: () => void;
		isEditing?: boolean;
		saving?: boolean;
	};

	let { contentType, initialData = {}, onsubmit, oncancel, isEditing = false, saving = false }: Props = $props();

	let formData = $state<Record<string, unknown>>({});
	let inputMode = $state<'form' | 'json'>('form');

	$effect(() => {
		if (Object.keys(initialData).length > 0 && Object.keys(formData).length === 0) {
			formData = { ...initialData };
		}
	});

	function getString(field: string): string {
		const val = formData[field];
		if (typeof val === 'string') return val;
		if (typeof val === 'number') return String(val);
		return '';
	}

	function getNumber(field: string): number | undefined {
		const val = formData[field];
		if (typeof val === 'number') return val;
		if (typeof val === 'string') {
			const num = parseFloat(val);
			return isNaN(num) ? undefined : num;
		}
		return undefined;
	}

	function getBool(field: string): boolean {
		const val = formData[field];
		return val === true || val === 'true';
	}

	function getArray(field: string): string {
		const val = formData[field];
		if (Array.isArray(val)) return val.join('\n');
		if (typeof val === 'string') return val;
		return '';
	}

	function set(field: string, value: unknown) {
		formData[field] = value;
	}

	function setFromInput(field: string, value: string) {
		formData[field] = value;
	}

	function setFromNumberInput(field: string, value: string) {
		const num = parseFloat(value);
		formData[field] = isNaN(num) ? undefined : num;
	}

	function toggleBool(field: string) {
		formData[field] = !getBool(field);
	}

	function parseArray(field: string, separator: string = '\n'): string[] {
		const val = getArray(field);
		if (!val.trim()) return [];
		return val.split(separator).map(s => s.trim()).filter(Boolean);
	}

	const CONTENT_TYPES = {
		spells: { label: 'Spell', icon: '✨' },
		creatures: { label: 'Creature', icon: '🐉' },
		magicitems: { label: 'Magic Item', icon: '💎' },
		feats: { label: 'Feat', icon: '⭐' },
		backgrounds: { label: 'Background', icon: '📜' },
		species: { label: 'Species', icon: '🧬' },
		classes: { label: 'Class', icon: '⚔️' },
		subclasses: { label: 'Subclass', icon: '🔱' },
		subraces: { label: 'Subrace', icon: '🌿' }
	} as const;

	const SPELL_SCHOOLS = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'];
	const SPELL_LEVELS = ['Cantrip', '1st Level', '2nd Level', '3rd Level', '4th Level', '5th Level', '6th Level', '7th Level', '8th Level', '9th Level'];
	const CREATURE_SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
	const CREATURE_TYPES = ['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'];
	const RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'];
	const ABILITIES = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
	const ABBREV_ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

	let jsonInput = $state('');
	let jsonError = $state('');
	let isDragging = $state(false);

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (inputMode === 'json') {
			try {
				const parsed = JSON.parse(jsonInput);
				jsonError = '';
				onsubmit(parsed);
			} catch {
				jsonError = 'Invalid JSON format';
			}
		} else {
			onsubmit(formData);
		}
	}

	function handleFileDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files[0];
		if (file) processFile(file);
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) processFile(file);
	}

	function processFile(file: File) {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				jsonInput = content;
				inputMode = 'json';
				jsonError = '';
			} catch {
				jsonError = 'Failed to read file';
			}
		};
		reader.readAsText(file);
	}

	const typeInfo = $derived(CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES] || { label: contentType, icon: '📝' });
</script>

<div class="max-w-4xl mx-auto">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold flex items-center gap-2">
			<span>{typeInfo.icon}</span>
			{isEditing ? 'Edit' : 'Create'} {typeInfo.label}
		</h1>
		<div class="flex gap-2">
			<button
				type="button"
				class="px-3 py-1.5 text-sm rounded-lg transition-all {inputMode === 'form' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)]'}"
				onclick={() => inputMode = 'form'}
			>
				Form
			</button>
			<button
				type="button"
				class="px-3 py-1.5 text-sm rounded-lg transition-all {inputMode === 'json' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)]'}"
				onclick={() => inputMode = 'json'}
			>
				JSON
			</button>
		</div>
	</div>

	<form onsubmit={handleSubmit} class="space-y-6">
		{#if inputMode === 'json'}
			<div
				class="relative"
				ondragover={(e) => { e.preventDefault(); isDragging = true; }}
				ondragleave={() => isDragging = false}
				ondrop={handleFileDrop}
			>
				<textarea
					bind:value={jsonInput}
					placeholder="Paste JSON here or drag & drop a file..."
					class="w-full h-96 p-4 font-mono text-sm input-crystal rounded-xl resize-none {isDragging ? 'ring-2 ring-[var(--color-accent)]' : ''}"
				></textarea>
				{#if isDragging}
					<div class="absolute inset-0 bg-[var(--color-accent)]/10 rounded-xl flex items-center justify-center pointer-events-none">
						<span class="text-lg font-medium">Drop file here</span>
					</div>
				{/if}
				<label class="absolute bottom-4 right-4 cursor-pointer">
					<input type="file" accept=".json" class="hidden" onchange={handleFileSelect} />
					<span class="px-3 py-1.5 text-sm bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card-hover)] rounded-lg transition-all">
						Upload File
					</span>
				</label>
			</div>
			{#if jsonError}
				<p class="text-red-400 text-sm">{jsonError}</p>
			{/if}
		{:else}
			<div class="space-y-6">
				<div>
					<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Name *</label>
					<Input value={getString('name')} onchange={(e) => setFromInput('name', e.currentTarget.value)} placeholder="Enter name..." />
				</div>

				{#if contentType === 'spells'}
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Level *</label>
							<select value={getNumber('level') ?? 0} onchange={(e) => set('level', parseInt(e.currentTarget.value))} class="input-crystal w-full px-4 py-2 rounded-xl">
								{#each SPELL_LEVELS as level, i}
									<option value={i}>{level}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">School *</label>
							<select value={getString('school')} onchange={(e) => set('school', e.currentTarget.value)} class="input-crystal w-full px-4 py-2 rounded-xl">
								{#each SPELL_SCHOOLS as school}
									<option value={school}>{school}</option>
								{/each}
							</select>
						</div>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Casting Time</label>
							<Input value={getString('casting_time')} onchange={(e) => setFromInput('casting_time', e.currentTarget.value)} placeholder="1 action" />
						</div>
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Range</label>
							<Input value={getString('range')} onchange={(e) => setFromInput('range', e.currentTarget.value)} placeholder="60 feet" />
						</div>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Duration</label>
							<Input value={getString('duration')} onchange={(e) => setFromInput('duration', e.currentTarget.value)} placeholder="1 minute" />
						</div>
						<div class="flex items-center gap-2 pt-6">
							<Switch checked={getBool('concentration')} onCheckedChange={() => toggleBool('concentration')} />
							<label class="text-sm" for="concentration">Concentration</label>
						</div>
						<div class="flex items-center gap-2 pt-6">
							<Switch checked={getBool('ritual')} onCheckedChange={() => toggleBool('ritual')} />
							<label class="text-sm" for="ritual">Ritual</label>
						</div>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Verbal (V)</label>
							<Switch checked={getBool('v')} onCheckedChange={() => toggleBool('v')} />
						</div>
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Somatic (S)</label>
							<Switch checked={getBool('s')} onCheckedChange={() => toggleBool('s')} />
						</div>
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Material (M)</label>
							<Switch checked={getBool('m')} onCheckedChange={() => toggleBool('m')} />
						</div>
					</div>
					{#if getBool('m')}
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Material Components</label>
							<Input value={getString('material')} onchange={(e) => setFromInput('material', e.currentTarget.value)} placeholder="a pinch of bat fur" />
						</div>
					{/if}
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Description *</label>
						<textarea value={getString('description')} onchange={(e) => setFromInput('description', e.currentTarget.value)} class="input-crystal w-full p-4 rounded-xl h-40 resize-none" placeholder="Spell description..."></textarea>
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">At Higher Levels</label>
						<textarea value={getString('higher_level')} onchange={(e) => setFromInput('higher_level', e.currentTarget.value)} class="input-crystal w-full p-4 rounded-xl h-20 resize-none" placeholder="When cast at higher levels..."></textarea>
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Classes (comma-separated)</label>
						<Input value={getString('classes')} onchange={(e) => setFromInput('classes', e.currentTarget.value)} placeholder="Wizard, Sorcerer" />
					</div>

				{:else if contentType === 'creatures'}
					<div class="grid grid-cols-3 gap-4">
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Size *</label>
							<select value={getString('size')} onchange={(e) => set('size', e.currentTarget.value)} class="input-crystal w-full px-4 py-2 rounded-xl">
								{#each CREATURE_SIZES as size}
									<option value={size}>{size}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Type *</label>
							<select value={getString('type')} onchange={(e) => set('type', e.currentTarget.value)} class="input-crystal w-full px-4 py-2 rounded-xl">
								{#each CREATURE_TYPES as type}
									<option value={type}>{type}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Alignment</label>
							<Input value={getString('alignment')} onchange={(e) => setFromInput('alignment', e.currentTarget.value)} placeholder="Lawful Good" />
						</div>
					</div>

					<div class="border-t border-[var(--color-border)] pt-4 mb-4">
						<h3 class="text-lg font-semibold mb-3">Combat Stats</h3>
						<div class="grid grid-cols-4 gap-4">
							<div>
								<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">AC</label>
								<Input type="number" value={getNumber('armor_class')} onchange={(e) => setFromNumberInput('armor_class', e.currentTarget.value)} placeholder="15" />
							</div>
							<div>
								<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Armor Type</label>
								<Input value={getString('armor_desc')} onchange={(e) => setFromInput('armor_desc', e.currentTarget.value)} placeholder="Natural Armor" />
							</div>
							<div>
								<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">HP</label>
								<Input type="number" value={getNumber('hit_points')} onchange={(e) => setFromNumberInput('hit_points', e.currentTarget.value)} placeholder="120" />
							</div>
							<div>
								<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Hit Dice</label>
								<Input value={getString('hit_dice')} onchange={(e) => setFromInput('hit_dice', e.currentTarget.value)} placeholder="12d8+24" />
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4 mt-4">
							<div>
								<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Speed</label>
								<Input value={getString('speed')} onchange={(e) => setFromInput('speed', e.currentTarget.value)} placeholder="30 ft., fly 60 ft." />
							</div>
							<div>
								<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">CR</label>
								<Input value={getString('challenge_rating')} onchange={(e) => setFromInput('challenge_rating', e.currentTarget.value)} placeholder="5" />
							</div>
						</div>
					</div>

					<div class="border-t border-[var(--color-border)] pt-4 mb-4">
						<h3 class="text-lg font-semibold mb-3">Ability Scores</h3>
						<div class="grid grid-cols-6 gap-2">
							{#each ABBREV_ABILITIES as abbr, i}
								<div>
									<label class="block text-xs uppercase text-center mb-1">{ABILITIES[i].slice(0, 3)}</label>
									<Input type="number" value={getNumber(abbr)} onchange={(e) => setFromNumberInput(abbr, e.currentTarget.value)} placeholder="10" />
								</div>
							{/each}
						</div>
					</div>

					<div class="border-t border-[var(--color-border)] pt-4 mb-4">
						<h3 class="text-lg font-semibold mb-3">Saving Throws</h3>
						<Input value={getString('saving_throws')} onchange={(e) => setFromInput('saving_throws', e.currentTarget.value)} placeholder="Dex +5, Con +3" />
					</div>

					<div class="border-t border-[var(--color-border)] pt-4 mb-4">
						<h3 class="text-lg font-semibold mb-3">Skills</h3>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Skills</label>
								<Input value={getString('skills')} onchange={(e) => setFromInput('skills', e.currentTarget.value)} placeholder="Perception +7, Stealth +5" />
							</div>
							<div>
								<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Senses</label>
								<Input value={getString('senses')} onchange={(e) => setFromInput('senses', e.currentTarget.value)} placeholder="Blindsight 60 ft., Passive Perception 15" />
							</div>
						</div>
					</div>

					<div class="border-t border-[var(--color-border)] pt-4 mb-4">
						<h3 class="text-lg font-semibold mb-3">Damage & Conditions</h3>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Damage Vulnerabilities</label>
								<Input value={getString('damage_vulnerabilities')} onchange={(e) => setFromInput('damage_vulnerabilities', e.currentTarget.value)} placeholder="Fire" />
							</div>
							<div>
								<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Damage Resistances</label>
								<Input value={getString('damage_resistances')} onchange={(e) => setFromInput('damage_resistances', e.currentTarget.value)} placeholder="Cold, Bludgeoning" />
							</div>
							<div>
								<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Damage Immunities</label>
								<Input value={getString('damage_immunities')} onchange={(e) => setFromInput('damage_immunities', e.currentTarget.value)} placeholder="Poison" />
							</div>
							<div>
								<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Condition Immunities</label>
								<Input value={getString('condition_immunities')} onchange={(e) => setFromInput('condition_immunities', e.currentTarget.value)} placeholder="Poisoned, Frightened" />
							</div>
						</div>
						<div class="mt-4">
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Languages</label>
							<Input value={getString('languages')} onchange={(e) => setFromInput('languages', e.currentTarget.value)} placeholder="Common, Elvish" />
						</div>
					</div>

					<div class="border-t border-[var(--color-border)] pt-4 mb-4">
						<h3 class="text-lg font-semibold mb-3">Abilities (one per line)</h3>
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Special Abilities / Traits</label>
							<textarea value={getArray('special_abilities')} onchange={(e) => set('special_abilities', parseArray('special_abilities'))} class="input-crystal w-full p-4 rounded-xl h-32 resize-none" placeholder="Innate Spellcasting. The creature can cast..."></textarea>
						</div>
						<div class="mt-4">
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Actions (one per line)</label>
							<textarea value={getArray('actions')} onchange={(e) => set('actions', parseArray('actions'))} class="input-crystal w-full p-4 rounded-xl h-32 resize-none" placeholder="Multiattack. The creature makes two attacks.&#10;Claw. Melee Weapon Attack..."></textarea>
						</div>
						<div class="mt-4">
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Reactions</label>
							<textarea value={getArray('reactions')} onchange={(e) => set('reactions', parseArray('reactions'))} class="input-crystal w-full p-4 rounded-xl h-24 resize-none" placeholder="Parry. When a creature attacks..."></textarea>
						</div>
						<div class="mt-4">
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Legendary Actions (one per line)</label>
							<textarea value={getArray('legendary_actions')} onchange={(e) => set('legendary_actions', parseArray('legendary_actions'))} class="input-crystal w-full p-4 rounded-xl h-24 resize-none" placeholder="Detect. The creature makes a Wisdom check.&#10;Claw Attack."></textarea>
						</div>
					</div>

				{:else if contentType === 'magicitems'}
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Type</label>
							<Input value={getString('type')} onchange={(e) => setFromInput('type', e.currentTarget.value)} placeholder="Wondrous Item" />
						</div>
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Rarity</label>
							<select value={getString('rarity')} onchange={(e) => set('rarity', e.currentTarget.value)} class="input-crystal w-full px-4 py-2 rounded-xl">
								{#each RARITIES as rarity}
									<option value={rarity}>{rarity}</option>
								{/each}
							</select>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<Switch checked={getBool('requires_attunement')} onCheckedChange={() => toggleBool('requires_attunement')} />
						<label class="text-sm" for="requires_attunement">Requires Attunement</label>
					</div>
					{#if getBool('requires_attunement')}
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Attunement</label>
							<Input value={getString('attunement')} onchange={(e) => setFromInput('attunement', e.currentTarget.value)} placeholder="Requires attunement by a spellcaster" />
						</div>
					{/if}
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Description *</label>
						<textarea value={getString('description')} onchange={(e) => setFromInput('description', e.currentTarget.value)} class="input-crystal w-full p-4 rounded-xl h-40 resize-none" placeholder="Item description..."></textarea>
					</div>

				{:else if contentType === 'feats'}
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Prerequisites</label>
						<Input value={getString('prerequisites')} onchange={(e) => setFromInput('prerequisites', e.currentTarget.value)} placeholder="None" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Description *</label>
						<textarea value={getString('description')} onchange={(e) => setFromInput('description', e.currentTarget.value)} class="input-crystal w-full p-4 rounded-xl h-40 resize-none" placeholder="Feat description..."></textarea>
					</div>

				{:else if contentType === 'backgrounds'}
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Feature Name</label>
						<Input value={getString('feature_name')} onchange={(e) => setFromInput('feature_name', e.currentTarget.value)} placeholder="Feature name" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Feature Description</label>
						<textarea value={getString('feature')} onchange={(e) => setFromInput('feature', e.currentTarget.value)} class="input-crystal w-full p-4 rounded-xl h-32 resize-none" placeholder="Background feature description..."></textarea>
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Description *</label>
						<textarea value={getString('description')} onchange={(e) => setFromInput('description', e.currentTarget.value)} class="input-crystal w-full p-4 rounded-xl h-40 resize-none" placeholder="Background description..."></textarea>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Skill Proficiencies</label>
							<Input value={getString('skill_proficiencies')} onchange={(e) => setFromInput('skill_proficiencies', e.currentTarget.value)} placeholder="Stealth, Perception" />
						</div>
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Tool Proficiencies</label>
							<Input value={getString('tool_proficiencies')} onchange={(e) => setFromInput('tool_proficiencies', e.currentTarget.value)} placeholder="Thieves' Tools" />
						</div>
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Languages</label>
						<Input value={getString('languages')} onchange={(e) => setFromInput('languages', e.currentTarget.value)} placeholder="One language of your choice" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Equipment</label>
						<Input value={getString('equipment')} onchange={(e) => setFromInput('equipment', e.currentTarget.value)} placeholder="A small knife, a map..." />
					</div>

				{:else if contentType === 'species'}
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Description</label>
						<textarea value={getString('desc')} onchange={(e) => setFromInput('desc', e.currentTarget.value)} class="input-crystal w-full p-4 rounded-xl h-32 resize-none" placeholder="Species description..."></textarea>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Size</label>
							<select value={getString('size')} onchange={(e) => set('size', e.currentTarget.value)} class="input-crystal w-full px-4 py-2 rounded-xl">
								{#each CREATURE_SIZES as size}
									<option value={size}>{size}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Speed (ft)</label>
							<Input type="number" value={getNumber('speed')} onchange={(e) => setFromNumberInput('speed', e.currentTarget.value)} placeholder="30" />
						</div>
					</div>
					<div>
						<label class="block text-sm font-medium mb-3 text-[var(--color-text-secondary)]">Ability Bonuses</label>
						<div class="grid grid-cols-3 gap-2">
							{#each ABBREV_ABILITIES as ability}
								<div class="flex items-center gap-2">
									<label class="text-xs uppercase w-8">{ability}</label>
									<Input type="number" value={getNumber('ability_' + ability)} onchange={(e) => setFromNumberInput('ability_' + ability, e.currentTarget.value)} placeholder="+1" />
								</div>
							{/each}
						</div>
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Age</label>
						<Input value={getString('age')} onchange={(e) => setFromInput('age', e.currentTarget.value)} placeholder="Reach adulthood at 20, live up to 350 years" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Alignment</label>
						<Input value={getString('alignment')} onchange={(e) => setFromInput('alignment', e.currentTarget.value)} placeholder="Most are chaotic good" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Size Description</label>
						<Input value={getString('size_desc')} onchange={(e) => setFromInput('size_desc', e.currentTarget.value)} placeholder="Range from 5 to over 6 feet tall" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Languages</label>
						<Input value={getString('languages')} onchange={(e) => setFromInput('languages', e.currentTarget.value)} placeholder="Can speak, read, and write Common and one other language" />
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Darkvision (ft)</label>
							<Input type="number" value={getNumber('darkvision')} onchange={(e) => setFromNumberInput('darkvision', e.currentTarget.value)} placeholder="60" />
						</div>
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Traits (one per line)</label>
						<textarea value={getArray('traits')} onchange={(e) => set('traits', parseArray('traits'))} class="input-crystal w-full p-4 rounded-xl h-32 resize-none" placeholder="Ability Score Increase. Your Wisdom score increases by 1.&#10;Keen Senses. You have proficiency in Perception."></textarea>
					</div>

				{:else if contentType === 'classes'}
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Description</label>
						<textarea value={getString('description')} onchange={(e) => setFromInput('description', e.currentTarget.value)} class="input-crystal w-full p-4 rounded-xl h-32 resize-none" placeholder="Class description..."></textarea>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Hit Die</label>
							<select value={getNumber('hit_die') ?? 8} onchange={(e) => set('hit_die', parseInt(e.currentTarget.value))} class="input-crystal w-full px-4 py-2 rounded-xl">
								{#each [6, 8, 10, 12] as die}
									<option value={die}>d{die}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Primary Ability</label>
							<select value={getString('primary_ability')} onchange={(e) => set('primary_ability', e.currentTarget.value)} class="input-crystal w-full px-4 py-2 rounded-xl">
								{#each ABILITIES as ability}
									<option value={ability}>{ability}</option>
								{/each}
							</select>
						</div>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Saving Throws</label>
							<Input value={getString('saving_throws')} onchange={(e) => setFromInput('saving_throws', e.currentTarget.value)} placeholder="Strength, Constitution" />
						</div>
						<div>
							<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Skill Proficiencies (#)</label>
							<Input type="number" value={getNumber('skill_proficiencies')} onchange={(e) => setFromNumberInput('skill_proficiencies', e.currentTarget.value)} placeholder="2" />
						</div>
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Armor Proficiencies</label>
						<Input value={getString('armor_proficiencies')} onchange={(e) => setFromInput('armor_proficiencies', e.currentTarget.value)} placeholder="All armor, shields" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Weapon Proficiencies</label>
						<Input value={getString('weapon_proficiencies')} onchange={(e) => setFromInput('weapon_proficiencies', e.currentTarget.value)} placeholder="Simple weapons, martial weapons" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Tool Proficiencies</label>
						<Input value={getString('tool_proficiencies')} onchange={(e) => setFromInput('tool_proficiencies', e.currentTarget.value)} placeholder="Thieves' tools, musical instrument" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Spellcasting Ability</label>
						<select value={getString('spellcasting_ability')} onchange={(e) => set('spellcasting_ability', e.currentTarget.value)} class="input-crystal w-full px-4 py-2 rounded-xl">
							<option value="">None</option>
							{#each ABILITIES as ability}
								<option value={ability}>{ability}</option>
							{/each}
						</select>
					</div>

				{:else}
					<div>
						<label class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Description</label>
						<textarea value={getString('description')} onchange={(e) => setFromInput('description', e.currentTarget.value)} class="input-crystal w-full p-4 rounded-xl h-40 resize-none" placeholder="Description..."></textarea>
					</div>
				{/if}
			</div>
		{/if}

		<div class="flex gap-4 pt-4">
			<Button type="submit" variant="gem" disabled={saving}>
				{isEditing ? 'Save Changes' : 'Create'} {typeInfo.label}
			</Button>
			{#if oncancel}
				<Button type="button" variant="ghost" onclick={oncancel}>
					Cancel
				</Button>
			{/if}
		</div>
	</form>
</div>
