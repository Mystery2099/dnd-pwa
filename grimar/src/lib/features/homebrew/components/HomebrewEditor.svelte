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

	let {
		contentType,
		initialData = {},
		onsubmit,
		oncancel,
		isEditing = false,
		saving = false
	}: Props = $props();

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
		return val
			.split(separator)
			.map((s) => s.trim())
			.filter(Boolean);
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

	const SPELL_SCHOOLS = [
		'Abjuration',
		'Conjuration',
		'Divination',
		'Enchantment',
		'Evocation',
		'Illusion',
		'Necromancy',
		'Transmutation'
	];
	const SPELL_LEVELS = [
		'Cantrip',
		'1st Level',
		'2nd Level',
		'3rd Level',
		'4th Level',
		'5th Level',
		'6th Level',
		'7th Level',
		'8th Level',
		'9th Level'
	];
	const CREATURE_SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
	const CREATURE_TYPES = [
		'Aberration',
		'Beast',
		'Celestial',
		'Construct',
		'Dragon',
		'Elemental',
		'Fey',
		'Fiend',
		'Giant',
		'Humanoid',
		'Monstrosity',
		'Ooze',
		'Plant',
		'Undead'
	];
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

	const typeInfo = $derived(
		CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES] || { label: contentType, icon: '📝' }
	);
</script>

<div class="mx-auto max-w-4xl">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="flex items-center gap-2 text-2xl font-bold">
			<span>{typeInfo.icon}</span>
			{isEditing ? 'Edit' : 'Create'}
			{typeInfo.label}
		</h1>
		<div class="flex gap-2">
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-sm transition-all {inputMode === 'form'
					? 'bg-[var(--color-accent)] text-white'
					: 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)]'}"
				onclick={() => (inputMode = 'form')}
			>
				Form
			</button>
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-sm transition-all {inputMode === 'json'
					? 'bg-[var(--color-accent)] text-white'
					: 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)]'}"
				onclick={() => (inputMode = 'json')}
			>
				JSON
			</button>
		</div>
	</div>

	<form onsubmit={handleSubmit} class="space-y-6">
		{#if inputMode === 'json'}
			<div
				class="relative"
				role="region"
				aria-label="JSON input area"
				ondragover={(e) => {
					e.preventDefault();
					isDragging = true;
				}}
				ondragleave={() => (isDragging = false)}
				ondrop={handleFileDrop}
			>
				<textarea
					bind:value={jsonInput}
					placeholder="Paste JSON here or drag & drop a file..."
					class="input-crystal h-96 w-full resize-none rounded-xl p-4 font-mono text-sm {isDragging
						? 'ring-2 ring-[var(--color-accent)]'
						: ''}"
				></textarea>
				{#if isDragging}
					<div
						class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-[var(--color-accent)]/10"
					>
						<span class="text-lg font-medium">Drop file here</span>
					</div>
				{/if}
				<label class="absolute right-4 bottom-4 cursor-pointer">
					<input type="file" accept=".json" class="hidden" onchange={handleFileSelect} />
					<span
						class="rounded-lg bg-[var(--color-bg-card)] px-3 py-1.5 text-sm transition-all hover:bg-[var(--color-bg-card-hover)]"
					>
						Upload File
					</span>
				</label>
			</div>
			{#if jsonError}
				<p class="text-sm text-red-400">{jsonError}</p>
			{/if}
		{:else}
			<div class="space-y-6">
				<div>
					<label
						for="name"
						class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">Name *</label
					>
					<Input
						id="name"
						value={getString('name')}
						onchange={(e) => setFromInput('name', e.currentTarget.value)}
						placeholder="Enter name..."
					/>
				</div>

				{#if contentType === 'spells'}
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label
								for="spell-level"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Level *</label
							>
							<select
								id="spell-level"
								value={getNumber('level') ?? 0}
								onchange={(e) => set('level', parseInt(e.currentTarget.value))}
								class="input-crystal w-full rounded-xl px-4 py-2"
							>
								{#each SPELL_LEVELS as level, i}
									<option value={i}>{level}</option>
								{/each}
							</select>
						</div>
						<div>
							<label
								for="spell-school"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>School *</label
							>
							<select
								id="spell-school"
								value={getString('school')}
								onchange={(e) => set('school', e.currentTarget.value)}
								class="input-crystal w-full rounded-xl px-4 py-2"
							>
								{#each SPELL_SCHOOLS as school}
									<option value={school}>{school}</option>
								{/each}
							</select>
						</div>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label
								for="casting-time"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Casting Time</label
							>
							<Input
								id="casting-time"
								value={getString('casting_time')}
								onchange={(e) => setFromInput('casting_time', e.currentTarget.value)}
								placeholder="1 action"
							/>
						</div>
						<div>
							<label
								for="range"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Range</label
							>
							<Input
								id="range"
								value={getString('range')}
								onchange={(e) => setFromInput('range', e.currentTarget.value)}
								placeholder="60 feet"
							/>
						</div>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div>
							<label
								for="duration"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Duration</label
							>
							<Input
								id="duration"
								value={getString('duration')}
								onchange={(e) => setFromInput('duration', e.currentTarget.value)}
								placeholder="1 minute"
							/>
						</div>
						<div class="flex items-center gap-2 pt-6">
							<Switch
								id="concentration"
								checked={getBool('concentration')}
								onCheckedChange={() => toggleBool('concentration')}
							/>
							<label class="text-sm" for="concentration">Concentration</label>
						</div>
						<div class="flex items-center gap-2 pt-6">
							<Switch
								id="ritual"
								checked={getBool('ritual')}
								onCheckedChange={() => toggleBool('ritual')}
							/>
							<label class="text-sm" for="ritual">Ritual</label>
						</div>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div>
							<label
								for="verbal"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Verbal (V)</label
							>
							<Switch id="verbal" checked={getBool('v')} onCheckedChange={() => toggleBool('v')} />
						</div>
						<div>
							<label
								for="somatic"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Somatic (S)</label
							>
							<Switch id="somatic" checked={getBool('s')} onCheckedChange={() => toggleBool('s')} />
						</div>
						<div>
							<label
								for="material"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Material (M)</label
							>
							<Switch
								id="material"
								checked={getBool('m')}
								onCheckedChange={() => toggleBool('m')}
							/>
						</div>
					</div>
					{#if getBool('m')}
						<div>
							<label
								for="material-components"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Material Components</label
							>
							<Input
								id="material-components"
								value={getString('material')}
								onchange={(e) => setFromInput('material', e.currentTarget.value)}
								placeholder="a pinch of bat fur"
							/>
						</div>
					{/if}
					<div>
						<label
							for="spell-description"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Description *</label
						>
						<textarea
							id="spell-description"
							value={getString('description')}
							onchange={(e) => setFromInput('description', e.currentTarget.value)}
							class="input-crystal h-40 w-full resize-none rounded-xl p-4"
							placeholder="Spell description..."
						></textarea>
					</div>
					<div>
						<label
							for="higher-levels"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>At Higher Levels</label
						>
						<textarea
							id="higher-levels"
							value={getString('higher_level')}
							onchange={(e) => setFromInput('higher_level', e.currentTarget.value)}
							class="input-crystal h-20 w-full resize-none rounded-xl p-4"
							placeholder="When cast at higher levels..."
						></textarea>
					</div>
					<div>
						<label
							for="classes"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Classes (comma-separated)</label
						>
						<Input
							id="classes"
							value={getString('classes')}
							onchange={(e) => setFromInput('classes', e.currentTarget.value)}
							placeholder="Wizard, Sorcerer"
						/>
					</div>
				{:else if contentType === 'creatures'}
					<div class="grid grid-cols-3 gap-4">
						<div>
							<label
								for="creature-size"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Size *</label
							>
							<select
								id="creature-size"
								value={getString('size')}
								onchange={(e) => set('size', e.currentTarget.value)}
								class="input-crystal w-full rounded-xl px-4 py-2"
							>
								{#each CREATURE_SIZES as size}
									<option value={size}>{size}</option>
								{/each}
							</select>
						</div>
						<div>
							<label
								for="creature-type"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Type *</label
							>
							<select
								id="creature-type"
								value={getString('type')}
								onchange={(e) => set('type', e.currentTarget.value)}
								class="input-crystal w-full rounded-xl px-4 py-2"
							>
								{#each CREATURE_TYPES as type}
									<option value={type}>{type}</option>
								{/each}
							</select>
						</div>
						<div>
							<label
								for="creature-alignment"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Alignment</label
							>
							<Input
								id="creature-alignment"
								value={getString('alignment')}
								onchange={(e) => setFromInput('alignment', e.currentTarget.value)}
								placeholder="Lawful Good"
							/>
						</div>
					</div>

					<div class="mb-4 border-t border-[var(--color-border)] pt-4">
						<h3 class="mb-3 text-lg font-semibold">Combat Stats</h3>
						<div class="grid grid-cols-4 gap-4">
							<div>
								<label
									for="armor-class"
									class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
									>AC</label
								>
								<Input
									id="armor-class"
									type="number"
									value={getNumber('armor_class')}
									onchange={(e) => setFromNumberInput('armor_class', e.currentTarget.value)}
									placeholder="15"
								/>
							</div>
							<div>
								<label
									for="armor-desc"
									class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
									>Armor Type</label
								>
								<Input
									id="armor-desc"
									value={getString('armor_desc')}
									onchange={(e) => setFromInput('armor_desc', e.currentTarget.value)}
									placeholder="Natural Armor"
								/>
							</div>
							<div>
								<label
									for="hit-points"
									class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
									>HP</label
								>
								<Input
									id="hit-points"
									type="number"
									value={getNumber('hit_points')}
									onchange={(e) => setFromNumberInput('hit_points', e.currentTarget.value)}
									placeholder="120"
								/>
							</div>
							<div>
								<label
									for="hit-dice"
									class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
									>Hit Dice</label
								>
								<Input
									id="hit-dice"
									value={getString('hit_dice')}
									onchange={(e) => setFromInput('hit_dice', e.currentTarget.value)}
									placeholder="12d8+24"
								/>
							</div>
						</div>
						<div class="mt-4 grid grid-cols-2 gap-4">
							<div>
								<label
									for="speed"
									class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
									>Speed</label
								>
								<Input
									id="speed"
									value={getString('speed')}
									onchange={(e) => setFromInput('speed', e.currentTarget.value)}
									placeholder="30 ft., fly 60 ft."
								/>
							</div>
							<div>
								<label
									for="challenge-rating"
									class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
									>CR</label
								>
								<Input
									id="challenge-rating"
									value={getString('challenge_rating')}
									onchange={(e) => setFromInput('challenge_rating', e.currentTarget.value)}
									placeholder="5"
								/>
							</div>
						</div>
					</div>

					<div class="mb-4 border-t border-[var(--color-border)] pt-4">
						<h3 class="mb-3 text-lg font-semibold">Ability Scores</h3>
						<div class="grid grid-cols-6 gap-2">
							{#each ABBREV_ABILITIES as abbr, i}
								<div>
									<label for="ability-{abbr}" class="mb-1 block text-center text-xs uppercase"
										>{ABILITIES[i].slice(0, 3)}</label
									>
									<Input
										id="ability-{abbr}"
										type="number"
										value={getNumber(abbr)}
										onchange={(e) => setFromNumberInput(abbr, e.currentTarget.value)}
										placeholder="10"
									/>
								</div>
							{/each}
						</div>
					</div>

					<div class="mb-4 border-t border-[var(--color-border)] pt-4">
						<h3 class="mb-3 text-lg font-semibold">Saving Throws</h3>
						<Input
							value={getString('saving_throws')}
							onchange={(e) => setFromInput('saving_throws', e.currentTarget.value)}
							placeholder="Dex +5, Con +3"
						/>
					</div>

					<div class="mb-4 border-t border-[var(--color-border)] pt-4">
						<h3 class="mb-3 text-lg font-semibold">Skills</h3>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label
									for="skills"
									class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
									>Skills</label
								>
								<Input
									id="skills"
									value={getString('skills')}
									onchange={(e) => setFromInput('skills', e.currentTarget.value)}
									placeholder="Perception +7, Stealth +5"
								/>
							</div>
							<div>
								<label
									for="senses"
									class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
									>Senses</label
								>
								<Input
									id="senses"
									value={getString('senses')}
									onchange={(e) => setFromInput('senses', e.currentTarget.value)}
									placeholder="Blindsight 60 ft., Passive Perception 15"
								/>
							</div>
						</div>
					</div>

					<div class="mb-4 border-t border-[var(--color-border)] pt-4">
						<h3 class="mb-3 text-lg font-semibold">Damage & Conditions</h3>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label
									for="damage-vulnerabilities"
									class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
									>Damage Vulnerabilities</label
								>
								<Input
									id="damage-vulnerabilities"
									value={getString('damage_vulnerabilities')}
									onchange={(e) => setFromInput('damage_vulnerabilities', e.currentTarget.value)}
									placeholder="Fire"
								/>
							</div>
							<div>
								<label
									for="damage-resistances"
									class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
									>Damage Resistances</label
								>
								<Input
									id="damage-resistances"
									value={getString('damage_resistances')}
									onchange={(e) => setFromInput('damage_resistances', e.currentTarget.value)}
									placeholder="Cold, Bludgeoning"
								/>
							</div>
							<div>
								<label
									for="damage-immunities"
									class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
									>Damage Immunities</label
								>
								<Input
									id="damage-immunities"
									value={getString('damage_immunities')}
									onchange={(e) => setFromInput('damage_immunities', e.currentTarget.value)}
									placeholder="Poison"
								/>
							</div>
							<div>
								<label
									for="condition-immunities"
									class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
									>Condition Immunities</label
								>
								<Input
									id="condition-immunities"
									value={getString('condition_immunities')}
									onchange={(e) => setFromInput('condition_immunities', e.currentTarget.value)}
									placeholder="Poisoned, Frightened"
								/>
							</div>
						</div>
						<div class="mt-4">
							<label
								for="languages"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Languages</label
							>
							<Input
								id="languages"
								value={getString('languages')}
								onchange={(e) => setFromInput('languages', e.currentTarget.value)}
								placeholder="Common, Elvish"
							/>
						</div>
					</div>

					<div class="mb-4 border-t border-[var(--color-border)] pt-4">
						<h3 class="mb-3 text-lg font-semibold">Abilities (one per line)</h3>
						<div>
							<label
								for="special-abilities"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Special Abilities / Traits</label
							>
							<textarea
								id="special-abilities"
								value={getArray('special_abilities')}
								onchange={(e) => set('special_abilities', parseArray('special_abilities'))}
								class="input-crystal h-32 w-full resize-none rounded-xl p-4"
								placeholder="Innate Spellcasting. The creature can cast..."
							></textarea>
						</div>
						<div class="mt-4">
							<label
								for="actions"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Actions (one per line)</label
							>
							<textarea
								id="actions"
								value={getArray('actions')}
								onchange={(e) => set('actions', parseArray('actions'))}
								class="input-crystal h-32 w-full resize-none rounded-xl p-4"
								placeholder="Multiattack. The creature makes two attacks.&#10;Claw. Melee Weapon Attack..."
							></textarea>
						</div>
						<div class="mt-4">
							<label
								for="reactions"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Reactions</label
							>
							<textarea
								id="reactions"
								value={getArray('reactions')}
								onchange={(e) => set('reactions', parseArray('reactions'))}
								class="input-crystal h-24 w-full resize-none rounded-xl p-4"
								placeholder="Parry. When a creature attacks..."
							></textarea>
						</div>
						<div class="mt-4">
							<label
								for="legendary-actions"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Legendary Actions (one per line)</label
							>
							<textarea
								id="legendary-actions"
								value={getArray('legendary_actions')}
								onchange={(e) => set('legendary_actions', parseArray('legendary_actions'))}
								class="input-crystal h-24 w-full resize-none rounded-xl p-4"
								placeholder="Detect. The creature makes a Wisdom check.&#10;Claw Attack."
							></textarea>
						</div>
					</div>
				{:else if contentType === 'magicitems'}
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label
								for="item-type"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Type</label
							>
							<Input
								id="item-type"
								value={getString('type')}
								onchange={(e) => setFromInput('type', e.currentTarget.value)}
								placeholder="Wondrous Item"
							/>
						</div>
						<div>
							<label
								for="rarity"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Rarity</label
							>
							<select
								id="rarity"
								value={getString('rarity')}
								onchange={(e) => set('rarity', e.currentTarget.value)}
								class="input-crystal w-full rounded-xl px-4 py-2"
							>
								{#each RARITIES as rarity}
									<option value={rarity}>{rarity}</option>
								{/each}
							</select>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<Switch
							id="requires-attunement"
							checked={getBool('requires_attunement')}
							onCheckedChange={() => toggleBool('requires_attunement')}
						/>
						<label class="text-sm" for="requires-attunement">Requires Attunement</label>
					</div>
					{#if getBool('requires_attunement')}
						<div>
							<label
								for="attunement"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Attunement</label
							>
							<Input
								id="attunement"
								value={getString('attunement')}
								onchange={(e) => setFromInput('attunement', e.currentTarget.value)}
								placeholder="Requires attunement by a spellcaster"
							/>
						</div>
					{/if}
					<div>
						<label
							for="item-description"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Description *</label
						>
						<textarea
							id="item-description"
							value={getString('description')}
							onchange={(e) => setFromInput('description', e.currentTarget.value)}
							class="input-crystal h-40 w-full resize-none rounded-xl p-4"
							placeholder="Item description..."
						></textarea>
					</div>
				{:else if contentType === 'feats'}
					<div>
						<label
							for="prerequisites"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Prerequisites</label
						>
						<Input
							id="prerequisites"
							value={getString('prerequisites')}
							onchange={(e) => setFromInput('prerequisites', e.currentTarget.value)}
							placeholder="None"
						/>
					</div>
					<div>
						<label
							for="feat-description"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Description *</label
						>
						<textarea
							id="feat-description"
							value={getString('description')}
							onchange={(e) => setFromInput('description', e.currentTarget.value)}
							class="input-crystal h-40 w-full resize-none rounded-xl p-4"
							placeholder="Feat description..."
						></textarea>
					</div>
				{:else if contentType === 'backgrounds'}
					<div>
						<label
							for="feature-name"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Feature Name</label
						>
						<Input
							id="feature-name"
							value={getString('feature_name')}
							onchange={(e) => setFromInput('feature_name', e.currentTarget.value)}
							placeholder="Feature name"
						/>
					</div>
					<div>
						<label
							for="feature-description"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Feature Description</label
						>
						<textarea
							id="feature-description"
							value={getString('feature')}
							onchange={(e) => setFromInput('feature', e.currentTarget.value)}
							class="input-crystal h-32 w-full resize-none rounded-xl p-4"
							placeholder="Background feature description..."
						></textarea>
					</div>
					<div>
						<label
							for="bg-description"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Description *</label
						>
						<textarea
							id="bg-description"
							value={getString('description')}
							onchange={(e) => setFromInput('description', e.currentTarget.value)}
							class="input-crystal h-40 w-full resize-none rounded-xl p-4"
							placeholder="Background description..."
						></textarea>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label
								for="skill-proficiencies"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Skill Proficiencies</label
							>
							<Input
								id="skill-proficiencies"
								value={getString('skill_proficiencies')}
								onchange={(e) => setFromInput('skill_proficiencies', e.currentTarget.value)}
								placeholder="Stealth, Perception"
							/>
						</div>
						<div>
							<label
								for="tool-proficiencies-bg"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Tool Proficiencies</label
							>
							<Input
								id="tool-proficiencies-bg"
								value={getString('tool_proficiencies')}
								onchange={(e) => setFromInput('tool_proficiencies', e.currentTarget.value)}
								placeholder="Thieves' Tools"
							/>
						</div>
					</div>
					<div>
						<label
							for="languages-bg"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Languages</label
						>
						<Input
							id="languages-bg"
							value={getString('languages')}
							onchange={(e) => setFromInput('languages', e.currentTarget.value)}
							placeholder="One language of your choice"
						/>
					</div>
					<div>
						<label
							for="equipment"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Equipment</label
						>
						<Input
							id="equipment"
							value={getString('equipment')}
							onchange={(e) => setFromInput('equipment', e.currentTarget.value)}
							placeholder="A small knife, a map..."
						/>
					</div>
				{:else if contentType === 'species'}
					<div>
						<label
							for="species-desc"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Description</label
						>
						<textarea
							id="species-desc"
							value={getString('desc')}
							onchange={(e) => setFromInput('desc', e.currentTarget.value)}
							class="input-crystal h-32 w-full resize-none rounded-xl p-4"
							placeholder="Species description..."
						></textarea>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label
								for="species-size"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Size</label
							>
							<select
								id="species-size"
								value={getString('size')}
								onchange={(e) => set('size', e.currentTarget.value)}
								class="input-crystal w-full rounded-xl px-4 py-2"
							>
								{#each CREATURE_SIZES as size}
									<option value={size}>{size}</option>
								{/each}
							</select>
						</div>
						<div>
							<label
								for="species-speed"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Speed (ft)</label
							>
							<Input
								id="species-speed"
								type="number"
								value={getNumber('speed')}
								onchange={(e) => setFromNumberInput('speed', e.currentTarget.value)}
								placeholder="30"
							/>
						</div>
					</div>
					<div>
						<span class="mb-3 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Ability Bonuses</span
						>
						<div class="grid grid-cols-3 gap-2">
							{#each ABBREV_ABILITIES as ability}
								<div class="flex items-center gap-2">
									<label for="ability-{ability}" class="w-8 text-xs uppercase">{ability}</label>
									<Input
										id="ability-{ability}"
										type="number"
										value={getNumber('ability_' + ability)}
										onchange={(e) =>
											setFromNumberInput('ability_' + ability, e.currentTarget.value)}
										placeholder="+1"
									/>
								</div>
							{/each}
						</div>
					</div>
					<div>
						<label
							for="age"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">Age</label
						>
						<Input
							id="age"
							value={getString('age')}
							onchange={(e) => setFromInput('age', e.currentTarget.value)}
							placeholder="Reach adulthood at 20, live up to 350 years"
						/>
					</div>
					<div>
						<label
							for="species-alignment"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Alignment</label
						>
						<Input
							id="species-alignment"
							value={getString('alignment')}
							onchange={(e) => setFromInput('alignment', e.currentTarget.value)}
							placeholder="Most are chaotic good"
						/>
					</div>
					<div>
						<label
							for="size-desc"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Size Description</label
						>
						<Input
							id="size-desc"
							value={getString('size_desc')}
							onchange={(e) => setFromInput('size_desc', e.currentTarget.value)}
							placeholder="Range from 5 to over 6 feet tall"
						/>
					</div>
					<div>
						<label
							for="species-languages"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Languages</label
						>
						<Input
							id="species-languages"
							value={getString('languages')}
							onchange={(e) => setFromInput('languages', e.currentTarget.value)}
							placeholder="Can speak, read, and write Common and one other language"
						/>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label
								for="darkvision"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Darkvision (ft)</label
							>
							<Input
								id="darkvision"
								type="number"
								value={getNumber('darkvision')}
								onchange={(e) => setFromNumberInput('darkvision', e.currentTarget.value)}
								placeholder="60"
							/>
						</div>
					</div>
					<div>
						<label
							for="traits"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Traits (one per line)</label
						>
						<textarea
							id="traits"
							value={getArray('traits')}
							onchange={(e) => set('traits', parseArray('traits'))}
							class="input-crystal h-32 w-full resize-none rounded-xl p-4"
							placeholder="Ability Score Increase. Your Wisdom score increases by 1.&#10;Keen Senses. You have proficiency in Perception."
						></textarea>
					</div>
				{:else if contentType === 'classes'}
					<div>
						<label
							for="class-description"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Description</label
						>
						<textarea
							id="class-description"
							value={getString('description')}
							onchange={(e) => setFromInput('description', e.currentTarget.value)}
							class="input-crystal h-32 w-full resize-none rounded-xl p-4"
							placeholder="Class description..."
						></textarea>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label
								for="hit-die"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Hit Die</label
							>
							<select
								id="hit-die"
								value={getNumber('hit_die') ?? 8}
								onchange={(e) => set('hit_die', parseInt(e.currentTarget.value))}
								class="input-crystal w-full rounded-xl px-4 py-2"
							>
								{#each [6, 8, 10, 12] as die}
									<option value={die}>d{die}</option>
								{/each}
							</select>
						</div>
						<div>
							<label
								for="primary-ability"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Primary Ability</label
							>
							<select
								id="primary-ability"
								value={getString('primary_ability')}
								onchange={(e) => set('primary_ability', e.currentTarget.value)}
								class="input-crystal w-full rounded-xl px-4 py-2"
							>
								{#each ABILITIES as ability}
									<option value={ability}>{ability}</option>
								{/each}
							</select>
						</div>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label
								for="saving-throws"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Saving Throws</label
							>
							<Input
								id="saving-throws"
								value={getString('saving_throws')}
								onchange={(e) => setFromInput('saving_throws', e.currentTarget.value)}
								placeholder="Strength, Constitution"
							/>
						</div>
						<div>
							<label
								for="skill-proficiencies-num"
								class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
								>Skill Proficiencies (#)</label
							>
							<Input
								id="skill-proficiencies-num"
								type="number"
								value={getNumber('skill_proficiencies')}
								onchange={(e) => setFromNumberInput('skill_proficiencies', e.currentTarget.value)}
								placeholder="2"
							/>
						</div>
					</div>
					<div>
						<label
							for="armor-proficiencies"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Armor Proficiencies</label
						>
						<Input
							id="armor-proficiencies"
							value={getString('armor_proficiencies')}
							onchange={(e) => setFromInput('armor_proficiencies', e.currentTarget.value)}
							placeholder="All armor, shields"
						/>
					</div>
					<div>
						<label
							for="weapon-proficiencies"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Weapon Proficiencies</label
						>
						<Input
							id="weapon-proficiencies"
							value={getString('weapon_proficiencies')}
							onchange={(e) => setFromInput('weapon_proficiencies', e.currentTarget.value)}
							placeholder="Simple weapons, martial weapons"
						/>
					</div>
					<div>
						<label
							for="tool-proficiencies-class"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Tool Proficiencies</label
						>
						<Input
							id="tool-proficiencies-class"
							value={getString('tool_proficiencies')}
							onchange={(e) => setFromInput('tool_proficiencies', e.currentTarget.value)}
							placeholder="Thieves' tools, musical instrument"
						/>
					</div>
					<div>
						<label
							for="spellcasting-ability"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Spellcasting Ability</label
						>
						<select
							id="spellcasting-ability"
							value={getString('spellcasting_ability')}
							onchange={(e) => set('spellcasting_ability', e.currentTarget.value)}
							class="input-crystal w-full rounded-xl px-4 py-2"
						>
							<option value="">None</option>
							{#each ABILITIES as ability}
								<option value={ability}>{ability}</option>
							{/each}
						</select>
					</div>
				{:else}
					<div>
						<label
							for="generic-description"
							class="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
							>Description</label
						>
						<textarea
							id="generic-description"
							value={getString('description')}
							onchange={(e) => setFromInput('description', e.currentTarget.value)}
							class="input-crystal h-40 w-full resize-none rounded-xl p-4"
							placeholder="Description..."
						></textarea>
					</div>
				{/if}
			</div>
		{/if}

		<div class="flex gap-4 pt-4">
			<Button type="submit" variant="gem" disabled={saving}>
				{isEditing ? 'Save Changes' : 'Create'}
				{typeInfo.label}
			</Button>
			{#if oncancel}
				<Button type="button" variant="ghost" onclick={oncancel}>Cancel</Button>
			{/if}
		</div>
	</form>
</div>
