<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Breadcrumb from '$lib/components/ui/Breadcrumb.svelte';
	import CreatureEncounterPanel from '$lib/components/compendium/CreatureEncounterPanel.svelte';
	import CreatureHeader from '$lib/components/compendium/CreatureHeader.svelte';
	import StructuredValue from '$lib/components/ui/StructuredValue.svelte';
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent
	} from '$lib/components/ui/accordion';
	import type { PageData } from './$types';
	import {
		isWeaponPropertyArray,
		getWeaponProperties,
		isDescriptionArray,
		getDescriptions,
		isBenefitArray,
		getBenefits,
		formatFieldName,
		formatValue,
		getSortedFields,
		getImageKindLabel
	} from '$lib/utils/compendium';

	interface Props {
		data: PageData;
	}

	type ImageDocumentData = {
		name?: string;
		display_name?: string;
		permalink?: string;
		publisher?: { name?: string };
		gamesystem?: { name?: string };
	};

	type ImageItemData = {
		file_url?: string;
		alt_text?: string;
		attribution?: string;
		document?: ImageDocumentData;
	};

	type NamedDetailEntry = {
		key?: string;
		name?: string;
		desc?: string;
	};

	const CREATURE_DETAIL_FIELDS_IN_REFERENCE = [
		'armor_class',
		'armor_detail',
		'hit_points',
		'hit_dice',
		'type',
		'size',
		'alignment',
		'challenge_rating_text',
		'experience_points'
	];

	let { data }: Props = $props();

	let item = $derived(data.item);
	let itemData = $derived(item.data as Record<string, unknown>);
	let imageData = $derived((item.data as ImageItemData | undefined) ?? {});
	let featuredRelatedImage = $derived(data.type === 'images' ? undefined : data.relatedImages?.[0]);
	let remainingRelatedImages = $derived(data.relatedImages?.slice(1) ?? []);
	let creatureAbilityScores = $derived(getAbilityScoreEntries(itemData.ability_scores));
	let creatureActionEntries = $derived(getNamedDetailEntries(itemData.actions));
	let creatureTraitEntries = $derived(getNamedDetailEntries(itemData.traits));
	let sortedFields = $derived.by(() => {
		const fields = getSortedFields(itemData, data.type);
		if (data.type === 'images') {
			return fields.filter(
				([key]) => !['file_url', 'alt_text', 'attribution', 'document'].includes(key)
			);
		}

		if (data.type === 'creatures') {
			return fields.filter(([key]) => !CREATURE_DETAIL_FIELDS_IN_REFERENCE.includes(key));
		}

		return fields;
	});
	let markdownHtml = $derived<Record<string, string>>(data.markdownHtml ?? {});
	let activeClassFeature = $state('');

	function markdownAt(path: string): string {
		return markdownHtml[path] ?? '';
	}

	function getNonEmptyString(value: unknown): string | undefined {
		if (typeof value !== 'string') return undefined;
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : undefined;
	}

	function getDocumentLabel(): string | undefined {
		return (
			getNonEmptyString(imageData.document?.display_name) ??
			getNonEmptyString(imageData.document?.name) ??
			getNonEmptyString(item.documentName) ??
			undefined
		);
	}

	function getImageAltText(): string | undefined {
		return getNonEmptyString(imageData.alt_text);
	}

	function getImageAttribution(): string | undefined {
		return getNonEmptyString(imageData.attribution);
	}

	function getImagePublisher(): string | undefined {
		return getNonEmptyString(imageData.document?.publisher?.name);
	}

	function getImageGameSystem(): string | undefined {
		return getNonEmptyString(imageData.document?.gamesystem?.name);
	}

	function getImagePermalink(): string | undefined {
		return getNonEmptyString(imageData.document?.permalink);
	}

	function getImageKindText(fileUrl: unknown): string {
		return getImageKindLabel(fileUrl);
	}

	function hasImageMetadata(): boolean {
		return Boolean(getImageAltText() || getImageAttribution());
	}

	function hasImageDocumentMetadata(): boolean {
		return Boolean(
			getDocumentLabel() || getImagePublisher() || getImageGameSystem() || getImagePermalink()
		);
	}

	function getRelatedImageDescription(image: {
		description: string | null;
		altText: string | null;
	}): string | undefined {
		return getNonEmptyString(image.description) ?? getNonEmptyString(image.altText);
	}

	function getAbilityScoreEntries(value: unknown): Array<[string, number]> {
		if (!value || typeof value !== 'object' || Array.isArray(value)) {
			return [];
		}

		const abilityScores = value as Record<string, unknown>;
		const orderedAbilities = [
			'strength',
			'dexterity',
			'constitution',
			'intelligence',
			'wisdom',
			'charisma'
		];

		return orderedAbilities
			.map((ability) => [ability, abilityScores[ability]])
			.filter((entry): entry is [string, number] => typeof entry[1] === 'number');
	}

	function getNamedDetailEntries(
		value: unknown
	): Array<{ key?: string; name?: string; desc?: string }> {
		if (!Array.isArray(value)) {
			return [];
		}

		return value.filter(
			(entry): entry is NamedDetailEntry => Boolean(entry) && typeof entry === 'object'
		);
	}
</script>

<svelte:head>
	<title>{item.name} | {data.config.plural} | Compendium | D&D</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-b from-(--color-bg-primary) to-(--color-bg-secondary)">
	<div class="mx-auto max-w-6xl px-4 py-8">
		<div class="mb-6">
			<Breadcrumb
				items={[
					{ label: 'Compendium', href: '/compendium' },
					{ label: data.config.plural, href: `/compendium/${data.type}` },
					{ label: item.name }
				]}
			/>
		</div>

		<div class="card-crystal overflow-hidden">
			<div
				class="border-b border-[var(--color-border)] bg-gradient-to-r from-accent/12 via-accent/5 to-transparent p-6 lg:p-8"
			>
				{#if data.type === 'creatures'}
					<CreatureHeader
						label={data.config.label}
						title={item.name}
						source={item.source}
						documentLabel={getDocumentLabel()}
						icon={data.config.icon}
						challengeRatingText={itemData.challenge_rating_text}
						size={itemData.size}
						typeValue={itemData.type}
						alignment={itemData.alignment}
						experiencePoints={itemData.experience_points}
						{featuredRelatedImage}
					/>
				{:else}
					<div>
						<div class="flex items-start justify-between gap-4">
							<div>
								<div class="mb-3 flex flex-wrap items-center gap-2">
									<Badge variant="outline" class="text-xs tracking-[0.18em] uppercase">
										{data.config.label}
									</Badge>
									{#if item.source}
										<Badge variant="outline" class="text-xs">{item.source}</Badge>
									{/if}
								</div>
								<h1
									class="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] lg:text-4xl"
								>
									{item.name}
								</h1>
								{#if item.source && item.source !== 'open5e'}
									<p class="mt-2 text-sm text-[var(--color-text-muted)]">
										{item.source}
										{#if getDocumentLabel()}
											• {getDocumentLabel()}
										{/if}
									</p>
								{:else if getDocumentLabel()}
									<p class="mt-2 text-sm text-[var(--color-text-muted)]">
										{getDocumentLabel()}
									</p>
								{/if}
							</div>
							<div class="text-4xl">{data.config.icon}</div>
						</div>

						{#if data.type === 'spells' && itemData}
							<div class="mt-5 flex flex-wrap gap-2">
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
						{:else if data.type === 'classes' && itemData}
							<div class="mt-5 flex flex-wrap gap-2">
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
							<div class="mt-5 flex flex-wrap gap-2">
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
						{:else if data.type === 'images' && itemData}
							<div class="mt-5 flex flex-wrap gap-2">
								<Badge variant="solid">{getImageKindText(imageData.file_url)}</Badge>
								{#if getImageAttribution()}
									<Badge variant="outline">Attributed</Badge>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>

			{#if data.type === 'images'}
				<div class="border-b border-[var(--color-border)] p-6">
					<div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
						<div
							class="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white/95 p-6"
						>
							{#if data.imageAssetUrl}
								<img
									src={data.imageAssetUrl}
									alt={getImageAltText() ?? item.name}
									class="h-auto max-h-[26rem] w-full object-contain"
									loading="eager"
								/>
							{:else}
								<div
									class="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/40 px-6 text-center text-sm text-[var(--color-text-muted)]"
								>
									Image preview unavailable
								</div>
							{/if}
						</div>

						<div class="space-y-4">
							{#if hasImageMetadata()}
								<div
									class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
								>
									<h2 class="text-lg font-semibold text-[var(--color-text-primary)]">Image Data</h2>
									<dl class="mt-3 space-y-3">
										{#if getImageAltText()}
											<div>
												<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
													Alt Text
												</dt>
												<dd class="mt-1 text-sm text-[var(--color-text-primary)]">
													{getImageAltText()}
												</dd>
											</div>
										{/if}
										{#if getImageAttribution()}
											<div>
												<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
													Attribution
												</dt>
												<dd class="mt-1 text-sm text-[var(--color-text-primary)]">
													{getImageAttribution()}
												</dd>
											</div>
										{/if}
									</dl>
								</div>
							{/if}

							{#if hasImageDocumentMetadata()}
								<div
									class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
								>
									<h2 class="text-lg font-semibold text-[var(--color-text-primary)]">
										Source Document
									</h2>
									<dl class="mt-3 space-y-3">
										{#if getDocumentLabel()}
											<div>
												<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
													Document
												</dt>
												<dd class="mt-1 text-sm text-[var(--color-text-primary)]">
													{getDocumentLabel()}
												</dd>
											</div>
										{/if}
										{#if getImagePublisher()}
											<div>
												<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
													Publisher
												</dt>
												<dd class="mt-1 text-sm text-[var(--color-text-primary)]">
													{getImagePublisher()}
												</dd>
											</div>
										{/if}
										{#if getImageGameSystem()}
											<div>
												<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
													Game System
												</dt>
												<dd class="mt-1 text-sm text-[var(--color-text-primary)]">
													{getImageGameSystem()}
												</dd>
											</div>
										{/if}
										{#if getImagePermalink()}
											<div>
												<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
													Permalink
												</dt>
												<dd class="mt-1 text-sm">
													<a
														href={getImagePermalink()}
														target="_blank"
														rel="noreferrer"
														class="break-all text-accent transition-colors hover:text-accent/80"
													>
														{getImagePermalink()}
													</a>
												</dd>
											</div>
										{/if}
									</dl>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			{#if data.type !== 'images' && featuredRelatedImage && data.type !== 'creatures'}
				<div class="border-b border-[var(--color-border)] p-6">
					<div
						class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/20 p-4"
					>
						<a
							href={`/compendium/images/${featuredRelatedImage.key}`}
							class="group flex items-center gap-4"
						>
							<div
								class="shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-linear-to-b from-white via-white to-white/90 p-3 transition-colors group-hover:border-accent/40"
							>
								{#if featuredRelatedImage.assetUrl}
									<img
										src={featuredRelatedImage.assetUrl}
										alt={featuredRelatedImage.altText ?? featuredRelatedImage.name}
										class="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-[1.04]"
										loading="lazy"
									/>
								{/if}
							</div>

							<div class="flex min-w-0 flex-1 items-center justify-between gap-4">
								<div class="min-w-0">
									<p
										class="text-xs font-medium tracking-[0.18em] text-[var(--color-text-muted)] uppercase"
									>
										{getImageKindText(featuredRelatedImage.assetUrl)}
									</p>
									<p class="mt-1 truncate font-semibold text-[var(--color-text-primary)]">
										{featuredRelatedImage.name}
									</p>
								</div>
								<span
									class="shrink-0 text-sm text-accent transition-colors group-hover:text-accent/80"
								>
									Open asset details
								</span>
							</div>
						</a>
					</div>
				</div>
			{/if}

			{#if data.type === 'creatures' && itemData}
				<CreatureEncounterPanel
					{itemData}
					abilityScores={creatureAbilityScores}
					actions={creatureActionEntries}
					traits={creatureTraitEntries}
					{markdownAt}
				/>
			{/if}

			{#if data.type !== 'creatures' && (itemData.desc || item.description)}
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Description</h2>
					<div class="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html markdownAt('description')}
					</div>
				</div>
			{/if}

			{#if isDescriptionArray(itemData.descriptions)}
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Descriptions</h2>
					<div class="space-y-4">
						{#each getDescriptions(itemData.descriptions) as desc, index (`${desc.document ?? 'description'}-${index}`)}
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
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									{@html markdownAt(`descriptions.${index}.desc`)}
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
						{#each getBenefits(itemData.benefits) as _benefit, index (index)}
							<li class="prose prose-invert prose-sm max-w-none">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html markdownAt(`benefits.${index}.desc`)}
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if data.type === 'weapons' && isWeaponPropertyArray(itemData.properties)}
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Properties</h2>
					<div class="space-y-3">
						{#each getWeaponProperties(itemData.properties) as wp, index (`${wp.property?.key ?? wp.property?.name ?? 'property'}-${index}`)}
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
										<!-- eslint-disable-next-line svelte/no-at-html-tags -->
										{@html markdownAt(`weaponProperties.${index}.desc`)}
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
						{#each itemData.traits as trait, index (`${trait.key ?? trait.name ?? 'trait'}-${index}`)}
							<div
								class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
							>
								<h3 class="font-semibold text-accent">{trait.name}</h3>
								{#if trait.desc}
									<div
										class="prose prose-invert prose-sm mt-1 max-w-none text-[var(--color-text-secondary)]"
									>
										<!-- eslint-disable-next-line svelte/no-at-html-tags -->
										{@html markdownAt(`traits.${index}.desc`)}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if data.type !== 'images' && remainingRelatedImages.length > 0}
				<div class="border-b border-[var(--color-border)] p-6">
					<div class="mb-5 flex items-end justify-between gap-4">
						<div>
							<h2 class="text-lg font-semibold text-[var(--color-text-primary)]">Related Images</h2>
							<p class="mt-1 text-sm text-[var(--color-text-secondary)]">
								Matched assets from the image compendium for this entry.
							</p>
						</div>
						<a
							href="/compendium/images"
							class="text-sm text-accent transition-colors hover:text-accent/80"
						>
							Browse all images
						</a>
					</div>

					<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{#each remainingRelatedImages as relatedImage (relatedImage.key)}
							<a
								href={`/compendium/images/${relatedImage.key}`}
								class="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/85 transition-colors hover:border-accent/50"
							>
								<div
									class="flex aspect-[4/3] items-center justify-center bg-linear-to-b from-white via-white to-white/90 p-4"
								>
									{#if relatedImage.assetUrl}
										<img
											src={relatedImage.assetUrl}
											alt={relatedImage.altText ?? relatedImage.name}
											class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
											loading="lazy"
										/>
									{:else}
										<div class="px-4 text-center text-sm text-[var(--color-text-muted)]">
											Image preview unavailable
										</div>
									{/if}
								</div>
								<div class="space-y-2 p-4">
									<div class="flex items-start justify-between gap-3">
										<h3
											class="font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-accent"
										>
											{relatedImage.name}
										</h3>
										<Badge variant="outline" class="shrink-0 text-xs">
											{getImageKindText(relatedImage.assetUrl)}
										</Badge>
									</div>
									{#if getRelatedImageDescription(relatedImage)}
										<p class="line-clamp-3 text-sm text-[var(--color-text-secondary)]">
											{getRelatedImageDescription(relatedImage)}
										</p>
									{/if}
									{#if relatedImage.documentName}
										<p class="text-xs tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
											{relatedImage.documentName}
										</p>
									{/if}
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}

			{#if data.type === 'creatures' && (itemData.desc || item.description)}
				<div class="border-b border-[var(--color-border)] p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Description</h2>
					<div class="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html markdownAt('description')}
					</div>
				</div>
			{/if}

			{#if data.type === 'spells' && itemData}
				{#if itemData.classes && Array.isArray(itemData.classes) && itemData.classes.length > 0}
					<div class="border-b border-[var(--color-border)] p-6">
						<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Classes</h2>
						<div class="flex flex-wrap gap-2">
							{#each itemData.classes as cls, index (`${cls.key ?? cls.name ?? cls}-${index}`)}
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
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html markdownAt('higher_level')}
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
						<Accordion
							bind:value={activeClassFeature}
							class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4"
						>
							{#each itemData.features as feature, index (`${feature.key ?? feature.name ?? 'feature'}-${index}`)}
								{@const featureValue = String(feature.key || feature.name || `feature-${index}`)}
								<AccordionItem value={featureValue} class="border-[var(--color-border)]">
									<AccordionTrigger class="py-3 hover:no-underline">
										<span class="mr-3 text-left font-semibold text-accent">
											{feature.name || feature.key}
										</span>
										{#if feature.gained_at}
											<span class="text-xs text-[var(--color-text-muted)]">
												{#if Array.isArray(feature.gained_at)}
													Level {feature.gained_at[0]?.level ?? '?'}
												{:else}
													Level {feature.gained_at.level ?? '?'}
												{/if}
											</span>
										{/if}
									</AccordionTrigger>
									<AccordionContent>
										{#if feature.desc && activeClassFeature === featureValue}
											<div
												class="prose prose-invert prose-sm max-w-none text-[var(--color-text-secondary)]"
											>
												<!-- eslint-disable-next-line svelte/no-at-html-tags -->
												{@html markdownAt(`features.${index}.desc`)}
											</div>
										{/if}
									</AccordionContent>
								</AccordionItem>
							{/each}
						</Accordion>
					</div>
				{/if}
			{/if}

			{#if sortedFields.length > 0}
				<div class="p-6">
					<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Details</h2>
					<dl class="grid gap-2 sm:grid-cols-2">
						{#each sortedFields as [key, value] (key)}
							<div
								class="flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3"
							>
								<dt class="text-xs font-medium text-[var(--color-text-muted)] uppercase">
									{formatFieldName(key)}
								</dt>
								<dd class="mt-1 text-sm text-[var(--color-text-primary)]">
									<StructuredValue {value} />
								</dd>
							</div>
						{/each}
					</dl>
				</div>
			{/if}
		</div>
	</div>
</div>
