<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let item = $derived(data.item);
	let itemData = $derived(item.data as Record<string, unknown>);

	function formatFieldName(key: string): string {
		return key
			.replace(/_/g, ' ')
			.replace(/([A-Z])/g, ' $1')
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ')
			.trim();
	}

	function formatValue(value: unknown): string {
		if (value === null || value === undefined) return '—';
		if (typeof value === 'boolean') return value ? 'Yes' : 'No';
		if (typeof value === 'number') return value.toLocaleString();
		if (typeof value === 'string') return value;
		if (Array.isArray(value)) {
			if (value.length === 0) return 'None';
			if (typeof value[0] === 'string') return value.join(', ');
			return JSON.stringify(value);
		}
		if (typeof value === 'object') return JSON.stringify(value);
		return String(value);
	}

	const DISPLAY_FIELDS: Record<string, string[]> = {
		spell: ['level', 'school', 'casting_time', 'duration', 'range', 'range_text', 'concentration', 'ritual', 'verbal', 'somatic', 'material', 'material_specified', 'material_cost', 'material_consumed', 'target_type', 'target_count', 'saving_throw_ability', 'attack_roll', 'damage_roll', 'damage_types', 'classes'],
		creature: ['type', 'size', 'challenge_rating_text', 'alignment', 'armor_class', 'armor_detail', 'hit_points', 'hit_dice', 'speed_all', 'languages', 'experience_points'],
		class: ['hit_dice', 'saving_throws', 'primary_abilities'],
		species: ['size', 'speed'],
		background: [],
		feat: [],
		weapon: ['damage_dice', 'damage_type', 'weight', 'range', 'properties'],
		armor: ['armor_class', 'armor_type', 'weight', 'strength_required', 'stealth_disadvantage'],
		magicitem: ['rarity', 'requires_attunement', 'type']
	};

	function getDisplayFields(): string[] {
		return DISPLAY_FIELDS[data.type] ?? [];
	}

	function shouldDisplayField(key: string): boolean {
		const excludeFields = ['key', 'name', 'desc', 'description', 'document', 'document_key', 'document_name', 'gamesystem_key', 'gamesystem_name', 'publisher_key', 'publisher_name', 'created_at', 'updated_at', 'url'];
		if (excludeFields.includes(key)) return false;

		const displayFields = getDisplayFields();
		if (displayFields.length > 0) {
			return displayFields.includes(key);
		}
		return true;
	}

	function getSortedFields(): [string, unknown][] {
		const fields = Object.entries(itemData).filter(([key]) => shouldDisplayField(key));
		const displayFields = getDisplayFields();

		if (displayFields.length > 0) {
			fields.sort((a, b) => {
				const aIndex = displayFields.indexOf(a[0]);
				const bIndex = displayFields.indexOf(b[0]);
				if (aIndex === -1 && bIndex === -1) return 0;
				if (aIndex === -1) return 1;
				if (bIndex === -1) return -1;
				return aIndex - bIndex;
			});
		} else {
			fields.sort((a, b) => a[0].localeCompare(b[0]));
		}

		return fields;
	}

	function renderDescription(desc: unknown): string {
		if (typeof desc !== 'string') return '';
		return desc
			.replace(/<\/?p>/gi, '\n')
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<[^>]+>/g, '')
			.replace(/\n{3,}/g, '\n\n')
			.trim();
	}
</script>

<svelte:head>
	<title>{item.name} | {data.config.plural} | Compendium | D&D</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-[var(--color-bg-primary)] to-[var(--color-bg-secondary)]">
	<div class="mx-auto max-w-4xl px-4 py-8">
		<div class="mb-6">
			<a href="/compendium/{data.type}" class="text-sm text-[var(--color-text-muted)] hover:text-accent transition-colors">
				← Back to {data.config.plural}
			</a>
		</div>

		<div class="card-crystal overflow-hidden">
			<div class="border-b border-[var(--color-border)] bg-gradient-to-r from-accent/10 to-transparent p-6">
				<div class="flex items-start justify-between gap-4">
					<div>
						<h1 class="text-3xl font-bold text-[var(--color-text-primary)]">
							{item.name}
						</h1>
						{#if item.source && item.source !== 'open5e'}
							<p class="mt-1 text-sm text-[var(--color-text-muted)]">
								{item.source}
								{#if (itemData.document as { name?: string })?.name}
									• {(itemData.document as { name?: string }).name}
								{/if}
							</p>
						{:else if (itemData.document as { name?: string })?.name}
							<p class="mt-1 text-sm text-[var(--color-text-muted)]">
								{(itemData.document as { name?: string }).name}
							</p>
						{/if}
					</div>
					<div class="text-4xl">{data.config.icon}</div>
				</div>

				{#if data.type === 'spells' && itemData}
					<div class="mt-4 flex flex-wrap gap-2">
						{#if itemData.level !== undefined}
							<Badge variant="solid" >
								{itemData.level === 0 ? 'Cantrip' : `Level ${itemData.level}`}
							</Badge>
						{/if}
						{#if itemData.school}
							<Badge variant="outline" >{String(itemData.school)}</Badge>
						{/if}
						{#if itemData.concentration}
							<Badge variant="outline" >Concentration</Badge>
						{/if}
						{#if itemData.ritual}
							<Badge variant="outline" >Ritual</Badge>
						{/if}
					</div>
				{:else if data.type === 'creatures' && itemData}
					<div class="mt-4 flex flex-wrap gap-2">
						{#if itemData.challenge_rating_text}
							<Badge variant="solid" >CR {itemData.challenge_rating_text}</Badge>
						{/if}
						{#if itemData.size}
							<Badge variant="outline" >{String(itemData.size)}</Badge>
						{/if}
						{#if itemData.type}
							<Badge variant="outline" >{String(itemData.type)}</Badge>
						{/if}
						{#if itemData.alignment}
							<Badge variant="outline" >{String(itemData.alignment)}</Badge>
						{/if}
					</div>
				{:else if data.type === 'classes' && itemData}
					<div class="mt-4 flex flex-wrap gap-2">
						{#if itemData.hit_dice}
							<Badge variant="solid" >Hit Die: d{itemData.hit_dice}</Badge>
						{/if}
						{#if itemData.primary_abilities}
							<Badge variant="outline" >{formatValue(itemData.primary_abilities)}</Badge>
						{/if}
						{#if itemData.saving_throws}
							<Badge variant="outline" >Saves: {formatValue(itemData.saving_throws)}</Badge>
						{/if}
					</div>
				{:else if data.type === 'magicitems' && itemData}
					<div class="mt-4 flex flex-wrap gap-2">
						{#if itemData.rarity}
							<Badge variant="solid" >{String(itemData.rarity)}</Badge>
						{/if}
						{#if itemData.type}
							<Badge variant="outline" >{String(itemData.type)}</Badge>
						{/if}
						{#if itemData.requires_attunement}
							<Badge variant="outline" >Requires Attunement</Badge>
						{/if}
					</div>
				{/if}
			</div>

			{#if item.description || itemData.desc}
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Description</h2>
					<div class="prose prose-invert max-w-none text-[var(--color-text-secondary)] whitespace-pre-line">
						{renderDescription(item.description || itemData.desc)}
					</div>
				</div>
			{/if}

			{#if data.type === 'creatures' && itemData}
				{#if itemData.ability_scores}
					<div class="border-b border-[var(--color-border)] p-6">
						<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Ability Scores</h2>
						<div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
							{#each Object.entries(itemData.ability_scores as Record<string, number>) as [ability, score]}
								<div class="flex flex-col items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-2">
									<span class="text-xs font-medium uppercase text-[var(--color-text-muted)]">{ability.slice(0, 3).toUpperCase()}</span>
									<span class="text-xl font-bold text-[var(--color-text-primary)]">{score}</span>
									<span class="text-xs text-[var(--color-text-muted)]">
										{score >= 10 ? '+' : ''}{Math.floor((score - 10) / 2)}
									</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if itemData.actions && Array.isArray(itemData.actions) && itemData.actions.length > 0}
					<div class="border-b border-[var(--color-border)] p-6">
						<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Actions</h2>
						<div class="space-y-4">
							{#each itemData.actions as action}
								<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
									<h3 class="font-semibold text-accent">{action.name || action.key}</h3>
									{#if action.desc}
										<p class="mt-1 text-sm text-[var(--color-text-secondary)] whitespace-pre-line">{action.desc}</p>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if itemData.traits && Array.isArray(itemData.traits) && itemData.traits.length > 0}
					<div class="border-b border-[var(--color-border)] p-6">
						<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Traits</h2>
						<div class="space-y-3">
							{#each itemData.traits as trait}
								<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
									<h3 class="font-semibold text-accent">{trait.name || trait.key}</h3>
									{#if trait.desc}
										<p class="mt-1 text-sm text-[var(--color-text-secondary)] whitespace-pre-line">{trait.desc}</p>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/if}

			{#if data.type === 'spells' && itemData}
				{#if itemData.classes && Array.isArray(itemData.classes) && itemData.classes.length > 0}
					<div class="border-b border-[var(--color-border)] p-6">
						<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Classes</h2>
						<div class="flex flex-wrap gap-2">
							{#each itemData.classes as cls}
								<a href="/compendium/classes/{cls.key || cls}" class="hover:text-accent transition-colors">
									<Badge variant="outline">{cls.name || cls}</Badge>
								</a>
							{/each}
						</div>
					</div>
				{/if}

				{#if itemData.higher_level}
					<div class="border-b border-[var(--color-border)] p-6">
						<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">At Higher Levels</h2>
						<p class="text-[var(--color-text-secondary)] whitespace-pre-line">{renderDescription(itemData.higher_level)}</p>
					</div>
				{/if}
			{/if}

			{#if data.type === 'classes' && itemData}
				{#if itemData.features && Array.isArray(itemData.features) && itemData.features.length > 0}
					<div class="border-b border-[var(--color-border)] p-6">
						<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Class Features</h2>
						<div class="space-y-3">
							{#each itemData.features as feature}
								<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
									<div class="flex items-center justify-between">
										<h3 class="font-semibold text-accent">{feature.name || feature.key}</h3>
										{#if feature.gained_at}
											<span class="text-xs text-[var(--color-text-muted)]">
												{#if Array.isArray(feature.gained_at)}
													Level {feature.gained_at[0]?.level ?? '?'}
												{:else}
													Level {feature.gained_at.level ?? '?'}
												{/if}
											</span>
										{/if}
									</div>
									{#if feature.desc}
										<p class="mt-2 text-sm text-[var(--color-text-secondary)] whitespace-pre-line">{feature.desc}</p>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/if}

			{#if getSortedFields().length > 0}
				<div class="p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Details</h2>
					<dl class="grid gap-2 sm:grid-cols-2">
						{#each getSortedFields() as [key, value]}
							<div class="flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3">
								<dt class="text-xs font-medium uppercase text-[var(--color-text-muted)]">{formatFieldName(key)}</dt>
								<dd class="mt-1 text-sm text-[var(--color-text-primary)]">{formatValue(value)}</dd>
							</div>
						{/each}
					</dl>
				</div>
			{/if}
		</div>
	</div>
</div>
