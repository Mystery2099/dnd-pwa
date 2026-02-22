<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { marked } from 'marked';
	import type { PageData } from './$types';

	marked.setOptions({ gfm: true, breaks: true });

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let item = $derived(data.item);
	let itemData = $derived(item.data as Record<string, unknown>);

	interface LinkedItem {
		name?: string;
		key?: string;
		url?: string;
	}

	interface WeaponProperty {
		property?: {
			name?: string;
			type?: string | null;
			desc?: string;
		};
		detail?: string | null;
	}

	interface DescriptionItem {
		desc: string;
		document?: string;
		gamesystem?: string;
	}

	interface BenefitItem {
		desc: string;
	}

	interface SpeedData {
		unit?: string;
		walk?: number;
		crawl?: number;
		fly?: number;
		hover?: boolean;
		burrow?: number;
		climb?: number;
		swim?: number;
	}

	interface LanguageData {
		as_string?: string;
		data?: LinkedItem[];
		languages?: string[];
		any_languages?: number;
		any_one_language?: number;
		telepathy?: number;
		understands_but_cant_speak?: string[];
	}

	function isLinkedItem(obj: unknown): obj is LinkedItem {
		if (!obj || typeof obj !== 'object') return false;
		const o = obj as Record<string, unknown>;
		return (typeof o.name === 'string' || typeof o.key === 'string') && typeof o.url === 'string';
	}

	function isLinkedArray(value: unknown): value is LinkedItem[] {
		return Array.isArray(value) && value.length > 0 && isLinkedItem(value[0]);
	}

	function getLinkedItems(value: unknown): LinkedItem[] | null {
		if (isLinkedArray(value)) return value;
		if (isLinkedItem(value)) return [value];
		return null;
	}

	function isWeaponPropertyArray(value: unknown): value is WeaponProperty[] {
		if (!Array.isArray(value) || value.length === 0) return false;
		const first = value[0] as Record<string, unknown>;
		return typeof first.property === 'object';
	}

	function getWeaponProperties(value: unknown): WeaponProperty[] | null {
		return isWeaponPropertyArray(value) ? value : null;
	}

	function isDescriptionArray(value: unknown): value is DescriptionItem[] {
		if (!Array.isArray(value) || value.length === 0) return false;
		const first = value[0] as Record<string, unknown>;
		return typeof first.desc === 'string' && ('document' in first || 'gamesystem' in first);
	}

	function getDescriptions(value: unknown): DescriptionItem[] | null {
		return isDescriptionArray(value) ? value : null;
	}

	function isBenefitArray(value: unknown): value is BenefitItem[] {
		if (!Array.isArray(value) || value.length === 0) return false;
		const first = value[0] as Record<string, unknown>;
		return typeof first.desc === 'string' && !('document' in first) && !('gamesystem' in first) && !('property' in first);
	}

	function getBenefits(value: unknown): BenefitItem[] | null {
		return isBenefitArray(value) ? value : null;
	}

	function isSpeedObject(value: unknown): value is SpeedData {
		if (!value || typeof value !== 'object') return false;
		const o = value as Record<string, unknown>;
		return typeof o.walk === 'number' || typeof o.swim === 'number' || typeof o.fly === 'number';
	}

	function formatSpeed(speed: SpeedData): string {
		const parts: string[] = [];
		const unit = speed.unit ?? 'ft';
		if (speed.walk) parts.push(`Walk ${speed.walk} ${unit}`);
		if (speed.swim) parts.push(`Swim ${speed.swim} ${unit}`);
		if (speed.fly && speed.fly > 0) parts.push(`Fly ${speed.fly} ${unit}${speed.hover ? ' (hover)' : ''}`);
		if (speed.burrow) parts.push(`Burrow ${speed.burrow} ${unit}`);
		if (speed.climb) parts.push(`Climb ${speed.climb} ${unit}`);
		if (speed.crawl) parts.push(`Crawl ${speed.crawl} ${unit}`);
		return parts.join(', ') || '—';
	}

	function isLanguageObject(value: unknown): value is LanguageData {
		if (!value || typeof value !== 'object') return false;
		const o = value as Record<string, unknown>;
		return typeof o.as_string === 'string' || Array.isArray(o.data) || Array.isArray(o.languages);
	}

	function formatLanguages(lang: LanguageData): string {
		if (lang.as_string) return lang.as_string;
		const parts: string[] = [];
		if (lang.data && lang.data.length > 0) {
			parts.push(lang.data.map(l => l.name ?? l.key ?? '').filter(Boolean).join(', '));
		}
		if (lang.languages && lang.languages.length > 0) {
			parts.push(lang.languages.join(', '));
		}
		if (lang.any_languages) parts.push(`any ${lang.any_languages} languages`);
		if (lang.any_one_language) parts.push(`any one language`);
		if (lang.telepathy) parts.push(`telepathy ${lang.telepathy} ft`);
		if (lang.understands_but_cant_speak?.length) {
			parts.push(`understands ${lang.understands_but_cant_speak.join(', ')} but can't speak`);
		}
		return parts.join('; ') || '—';
	}

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
		if (isLinkedArray(value)) return value.map(v => v.name ?? v.key ?? '').filter(Boolean).join(', ');
		if (isWeaponPropertyArray(value)) {
			return value
				.map(wp => {
					const name = wp.property?.name ?? '';
					return wp.detail ? `${name} (${wp.detail})` : name;
				})
				.filter(Boolean)
				.join(', ');
		}
		if (Array.isArray(value)) {
			if (value.length === 0) return 'None';
			if (typeof value[0] === 'string') return value.join(', ');
			return JSON.stringify(value);
		}
		if (isLanguageObject(value)) return formatLanguages(value);
		if (isSpeedObject(value)) return formatSpeed(value);
		if (typeof value === 'object' && value !== null) {
			const o = value as Record<string, unknown>;
			if (typeof o.name === 'string') return o.name;
		}
		return String(value);
	}

	function renderMarkdown(text: string): string {
		return marked.parse(text) as string;
	}

	const DISPLAY_FIELDS: Record<string, string[]> = {
		spells: ['level', 'school', 'casting_time', 'duration', 'range', 'range_text', 'concentration', 'ritual', 'verbal', 'somatic', 'material', 'material_specified', 'material_cost', 'material_consumed', 'target_type', 'target_count', 'saving_throw_ability', 'attack_roll', 'damage_roll', 'damage_types', 'classes'],
		creatures: ['type', 'size', 'challenge_rating_text', 'alignment', 'armor_class', 'armor_detail', 'hit_points', 'hit_dice', 'experience_points'],
		classes: ['hit_dice', 'saving_throws', 'primary_abilities'],
		species: ['size', 'speed'],
		backgrounds: [],
		feats: [],
		weapons: ['damage_dice', 'damage_type', 'weight', 'range'],
		armor: ['armor_class', 'armor_type', 'weight', 'strength_required', 'stealth_disadvantage'],
		magicitems: ['rarity', 'requires_attunement', 'type']
	};

	function getDisplayFields(): string[] {
		return DISPLAY_FIELDS[data.type] ?? [];
	}

	function shouldDisplayField(key: string): boolean {
		const excludeFields = ['key', 'name', 'desc', 'description', 'descriptions', 'document', 'document_key', 'document_name', 'gamesystem_key', 'gamesystem_name', 'publisher_key', 'publisher_name', 'created_at', 'updated_at', 'url', 'features', 'benefits', 'properties', 'speed_all', 'languages'];
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
							<Badge variant="outline" >{formatValue(itemData.school)}</Badge>
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
							<Badge variant="outline" >{formatValue(itemData.size)}</Badge>
						{/if}
						{#if itemData.type}
							<Badge variant="outline" >{formatValue(itemData.type)}</Badge>
						{/if}
						{#if itemData.alignment}
							<Badge variant="outline" >{formatValue(itemData.alignment)}</Badge>
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

			{#if itemData.desc || item.description}
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Description</h2>
					<div class="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
						{@html renderMarkdown(String(itemData.desc || item.description))}
					</div>
				</div>
			{/if}

			{#if isDescriptionArray(itemData.descriptions) }
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Descriptions</h2>
					<div class="space-y-4">
						{#each getDescriptions(itemData.descriptions) as desc}
							<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
								<div class="mb-2 flex flex-wrap gap-2">
									{#if desc.gamesystem}
										<span class="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent">{desc.gamesystem}</span>
									{/if}
									{#if desc.document}
										<span class="rounded bg-[var(--color-bg-secondary)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">{desc.document}</span>
									{/if}
								</div>
								<div class="prose prose-invert prose-sm max-w-none text-[var(--color-text-secondary)]">
									{@html renderMarkdown(desc.desc)}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if isBenefitArray(itemData.benefits) }
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Benefits</h2>
					<ul class="list-inside list-disc space-y-2 text-[var(--color-text-secondary)]">
						{#each getBenefits(itemData.benefits) as benefit}
							<li class="prose prose-invert prose-sm max-w-none">{@html renderMarkdown(benefit.desc)}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if data.type === 'weapons' && isWeaponPropertyArray(itemData.properties) }
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Properties</h2>
					<div class="space-y-3">
						{#each getWeaponProperties(itemData.properties) as wp}
							<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
								<div class="flex items-center gap-2">
									<span class="font-semibold text-accent">{wp.property?.name ?? ''}</span>
									{#if wp.property?.type}
										<span class="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent">{wp.property.type}</span>
									{/if}
									{#if wp.detail}
										<span class="text-sm text-[var(--color-text-muted)]">({wp.detail})</span>
									{/if}
								</div>
								{#if wp.property?.desc}
									<div class="prose prose-invert prose-sm mt-2 max-w-none text-[var(--color-text-secondary)]">
										{@html renderMarkdown(wp.property.desc)}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if data.type === 'creatures' && isSpeedObject(itemData.speed_all)}
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Speed</h2>
					<p class="text-[var(--color-text-secondary)]">{formatSpeed(itemData.speed_all)}</p>
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
										<div class="prose prose-invert prose-sm mt-1 max-w-none text-[var(--color-text-secondary)]">
											{@html renderMarkdown(action.desc)}
										</div>
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
										<div class="prose prose-invert prose-sm mt-1 max-w-none text-[var(--color-text-secondary)]">
											{@html renderMarkdown(trait.desc)}
										</div>
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
						<div class="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
							{@html renderMarkdown(String(itemData.higher_level))}
						</div>
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
										<div class="prose prose-invert prose-sm mt-2 max-w-none text-[var(--color-text-secondary)]">
											{@html renderMarkdown(feature.desc)}
										</div>
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
