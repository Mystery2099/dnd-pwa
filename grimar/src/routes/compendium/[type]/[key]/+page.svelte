<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { marked } from 'marked';
	import DOMPurify from 'isomorphic-dompurify';
	import type { PageData } from './$types';
	import {
		isLinkedItem,
		isLinkedArray,
		getLinkedItems,
		isWeaponPropertyArray,
		getWeaponProperties,
		isDescriptionArray,
		getDescriptions,
		isBenefitArray,
		getBenefits,
		isSpeedObject,
		isLanguageObject,
		formatSpeed,
		formatLanguages,
		formatFieldName,
		formatValue,
		DISPLAY_FIELDS,
		getSortedFields,
		renderDescription
	} from '$lib/utils/compendium';

	marked.setOptions({ gfm: true, breaks: true });

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let item = $derived(data.item);
	let itemData = $derived(item.data as Record<string, unknown>);

	function getDisplayFields(): string[] {
		return DISPLAY_FIELDS[data.type] ?? [];
	}

	function shouldDisplayField(key: string): boolean {
		const excludeFields = [
			'key',
			'name',
			'desc',
			'description',
			'descriptions',
			'document',
			'document_key',
			'document_name',
			'gamesystem_key',
			'gamesystem_name',
			'publisher_key',
			'publisher_name',
			'created_at',
			'updated_at',
			'url',
			'features',
			'benefits',
			'properties',
			'speed_all',
			'languages'
		];
		if (excludeFields.includes(key)) return false;

		const displayFields = getDisplayFields();
		if (displayFields.length > 0) {
			return displayFields.includes(key);
		}
		return true;
	}

	function getSortedFieldsLocal(): [string, unknown][] {
		return getSortedFields(itemData, data.type);
	}

	function renderMarkdown(text: string): string {
		return DOMPurify.sanitize(marked.parse(text) as string);
	}
</script>

<svelte:head>
	<title>{item.name} | {data.config.plural} | Compendium | D&D</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-b from-(--color-bg-primary) to-(--color-bg-secondary)">
	<div class="mx-auto max-w-4xl px-4 py-8">
		<div class="mb-6">
			<a
				href="/compendium/{data.type}"
				class="text-text-muted) text-sm transition-colors hover:text-accent"
			>
				← Back to {data.config.plural}
			</a>
		</div>

		<div class="card-crystal overflow-hidden">
			<div
				class="border-b border-[var(--color-border)] bg-gradient-to-r from-accent/10 to-transparent p-6"
			>
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
							<Badge variant="solid">
								{itemData.level === 0 ? 'Cantrip' : `Level ${itemData.level}`}
							</Badge>
						{/if}
						{#if itemData.school}
							<Badge variant="outline">{formatValue(itemData.school)}</Badge>
						{/if}
						{#if itemData.concentration}
							<Badge variant="outline">Concentration</Badge>
						{/if}
						{#if itemData.ritual}
							<Badge variant="outline">Ritual</Badge>
						{/if}
					</div>
				{:else if data.type === 'creatures' && itemData}
					<div class="mt-4 flex flex-wrap gap-2">
						{#if itemData.challenge_rating_text}
							<Badge variant="solid">CR {itemData.challenge_rating_text}</Badge>
						{/if}
						{#if itemData.size}
							<Badge variant="outline">{formatValue(itemData.size)}</Badge>
						{/if}
						{#if itemData.type}
							<Badge variant="outline">{formatValue(itemData.type)}</Badge>
						{/if}
						{#if itemData.alignment}
							<Badge variant="outline">{formatValue(itemData.alignment)}</Badge>
						{/if}
					</div>
				{:else if data.type === 'classes' && itemData}
					<div class="mt-4 flex flex-wrap gap-2">
						{#if itemData.hit_dice}
							<Badge variant="solid">Hit Die: d{itemData.hit_dice}</Badge>
						{/if}
						{#if itemData.primary_abilities}
							<Badge variant="outline">{formatValue(itemData.primary_abilities)}</Badge>
						{/if}
						{#if itemData.saving_throws}
							<Badge variant="outline">Saves: {formatValue(itemData.saving_throws)}</Badge>
						{/if}
					</div>
				{:else if data.type === 'magicitems' && itemData}
					<div class="mt-4 flex flex-wrap gap-2">
						{#if itemData.rarity}
							<Badge variant="solid">{String(itemData.rarity)}</Badge>
						{/if}
						{#if itemData.type}
							<Badge variant="outline">{String(itemData.type)}</Badge>
						{/if}
						{#if itemData.requires_attunement}
							<Badge variant="outline">Requires Attunement</Badge>
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

			{#if isDescriptionArray(itemData.descriptions)}
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Descriptions</h2>
					<div class="space-y-4">
						{#each getDescriptions(itemData.descriptions) as desc}
							<div
								class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
							>
								<div class="mb-2 flex flex-wrap gap-2">
									{#if desc.gamesystem}
										<span class="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent"
											>{desc.gamesystem}</span
										>
									{/if}
									{#if desc.document}
										<span
											class="rounded bg-[var(--color-bg-secondary)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
											>{desc.document}</span
										>
									{/if}
								</div>
								<div
									class="prose prose-invert prose-sm max-w-none text-[var(--color-text-secondary)]"
								>
									{@html renderMarkdown(desc.desc)}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if isBenefitArray(itemData.benefits)}
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Benefits</h2>
					<ul class="list-inside list-disc space-y-2 text-[var(--color-text-secondary)]">
						{#each getBenefits(itemData.benefits) as benefit}
							<li class="prose prose-invert prose-sm max-w-none">
								{@html renderMarkdown(benefit.desc)}
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if data.type === 'weapons' && isWeaponPropertyArray(itemData.properties)}
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Properties</h2>
					<div class="space-y-3">
						{#each getWeaponProperties(itemData.properties) as wp}
							<div
								class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
							>
								<div class="flex items-center gap-2">
									<span class="font-semibold text-accent">{wp.property?.name ?? ''}</span>
									{#if wp.property?.type}
										<span class="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent"
											>{wp.property.type}</span
										>
									{/if}
									{#if wp.detail}
										<span class="text-sm text-[var(--color-text-muted)]">({wp.detail})</span>
									{/if}
								</div>
								{#if wp.property?.desc}
									<div
										class="prose prose-invert prose-sm mt-2 max-w-none text-[var(--color-text-secondary)]"
									>
										{@html renderMarkdown(wp.property.desc)}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if data.type === 'species' && itemData.traits && Array.isArray(itemData.traits) && itemData.traits.length > 0}
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Traits</h2>
					<div class="space-y-3">
						{#each itemData.traits as trait}
							<div
								class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
							>
								<h3 class="font-semibold text-accent">{trait.name}</h3>
								{#if trait.desc}
									<div
										class="prose prose-invert prose-sm mt-1 max-w-none text-[var(--color-text-secondary)]"
									>
										{@html renderMarkdown(trait.desc)}
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
						<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
							Ability Scores
						</h2>
						<div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
							{#each Object.entries(itemData.ability_scores as Record<string, number>) as [ability, score]}
								<div
									class="flex flex-col items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-2"
								>
									<span class="text-xs font-medium text-[var(--color-text-muted)] uppercase"
										>{ability.slice(0, 3).toUpperCase()}</span
									>
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
								<div
									class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
								>
									<h3 class="font-semibold text-accent">{action.name || action.key}</h3>
									{#if action.desc}
										<div
											class="prose prose-invert prose-sm mt-1 max-w-none text-[var(--color-text-secondary)]"
										>
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
								<div
									class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
								>
									<h3 class="font-semibold text-accent">{trait.name || trait.key}</h3>
									{#if trait.desc}
										<div
											class="prose prose-invert prose-sm mt-1 max-w-none text-[var(--color-text-secondary)]"
										>
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
								<a
									href="/compendium/classes/{cls.key || cls}"
									class="transition-colors hover:text-accent"
								>
									<Badge variant="outline">{cls.name || cls}</Badge>
								</a>
							{/each}
						</div>
					</div>
				{/if}

				{#if itemData.higher_level}
					<div class="border-b border-[var(--color-border)] p-6">
						<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
							At Higher Levels
						</h2>
						<div class="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
							{@html renderMarkdown(String(itemData.higher_level))}
						</div>
					</div>
				{/if}
			{/if}

			{#if data.type === 'classes' && itemData}
				{#if itemData.features && Array.isArray(itemData.features) && itemData.features.length > 0}
					<div class="border-b border-[var(--color-border)] p-6">
						<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
							Class Features
						</h2>
						<div class="space-y-3">
							{#each itemData.features as feature}
								<div
									class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
								>
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
										<div
											class="prose prose-invert prose-sm mt-2 max-w-none text-[var(--color-text-secondary)]"
										>
											{@html renderMarkdown(feature.desc)}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/if}

			{#if getSortedFieldsLocal().length > 0}
				<div class="p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Details</h2>
					<dl class="grid gap-2 sm:grid-cols-2">
						{#each getSortedFieldsLocal() as [key, value]}
							<div
								class="flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3"
							>
								<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
									{formatFieldName(key)}
								</dt>
								<dd class="mt-1 text-sm text-[var(--color-text-primary)]">{formatValue(value)}</dd>
							</div>
						{/each}
					</dl>
				</div>
			{/if}
		</div>
	</div>
</div>
