<script lang="ts">
	import Breadcrumb from '$lib/components/ui/Breadcrumb.svelte';
	import ClassFeaturesSection from '$lib/components/compendium/ClassFeaturesSection.svelte';
	import CompendiumAccordionSection from '$lib/components/compendium/CompendiumAccordionSection.svelte';
	import CompendiumDetailHeader from '$lib/components/compendium/CompendiumDetailHeader.svelte';
	import CompendiumDetailsPanel from '$lib/components/compendium/CompendiumDetailsPanel.svelte';
	import CreatureSetRosterSection from '$lib/components/compendium/CreatureSetRosterSection.svelte';
	import CreatureEncounterPanel from '$lib/components/compendium/CreatureEncounterPanel.svelte';
	import CreatureHeader from '$lib/components/compendium/CreatureHeader.svelte';
	import ImageDetailPanel from '$lib/components/compendium/ImageDetailPanel.svelte';
	import RelatedImagesPanel from '$lib/components/compendium/RelatedImagesPanel.svelte';
	import SpellDetailSections from '$lib/components/compendium/SpellDetailSections.svelte';
	import type {
		CompendiumCreatureSetRosterSection,
		CompendiumDetailField
	} from '$lib/core/types/compendium';
	import type { PageData } from './$types';
	import {
		isWeaponPropertyArray,
		getWeaponProperties,
		isDescriptionArray,
		getDescriptions,
		isBenefitArray,
		getBenefits
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

	let { data }: Props = $props();

	let item = $derived(data.item);
	let itemData = $derived(item.data as Record<string, unknown>);
	let imageData = $derived((item.data as ImageItemData | undefined) ?? {});
	let featuredRelatedImage = $derived(data.type === 'images' ? undefined : data.relatedImages?.[0]);
	let remainingRelatedImages = $derived(data.relatedImages?.slice(1) ?? []);
	let creatureAbilityScores = $derived(getAbilityScoreEntries(itemData.ability_scores));
	let creatureActionEntries = $derived(getNamedDetailEntries(itemData.actions));
	let creatureTraitEntries = $derived(getNamedDetailEntries(itemData.traits));
	let detailFields = $derived(data.detail.fields as CompendiumDetailField[]);
	let markdownHtml = $derived<Record<string, string>>(data.markdownHtml ?? {});
	let creatureSetRosterSection = $derived.by(() => {
		const sections = data.detail.sections as Array<CompendiumCreatureSetRosterSection | { kind: string }>;
		const rosterSection = sections.find(
			(section): section is CompendiumCreatureSetRosterSection =>
				section.kind === 'creature-set-roster'
		);
		return rosterSection ?? null;
	});
	let hasSidebarDetails = $derived(detailFields.length > 0);

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

	function getDetailValue(key: string, value: unknown): unknown {
		if (key !== 'prerequisite') {
			return value;
		}

		if (typeof value === 'string') {
			return value.trim().length > 0 ? value : 'None';
		}

		if (value === null || value === undefined) {
			return 'None';
		}

		if (Array.isArray(value) && value.length === 0) {
			return 'None';
		}

		return value;
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
	<title>{item.name} | {data.config.plural} | Compendium | Grimar</title>
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
					<CompendiumDetailHeader
						label={data.config.label}
						title={item.name}
						source={item.source}
						documentLabel={getDocumentLabel()}
						icon={data.config.icon}
						type={data.type}
						{itemData}
						{featuredRelatedImage}
						imageAttribution={getImageAttribution()}
						imageFileUrl={imageData.file_url}
					/>
				{/if}
			</div>

			{#if data.type === 'images'}
				<ImageDetailPanel
					title={item.name}
					imageAssetUrl={data.imageAssetUrl}
					altText={getImageAltText()}
					attribution={getImageAttribution()}
					documentLabel={getDocumentLabel()}
					publisher={getImagePublisher()}
					gameSystem={getImageGameSystem()}
					permalink={getImagePermalink()}
				/>
			{/if}

			{#if data.type !== 'images'}
				<RelatedImagesPanel
					featuredImage={featuredRelatedImage}
					showFeaturedCard={Boolean(
						featuredRelatedImage && data.type !== 'creatures' && data.type !== 'conditions'
					)}
					images={remainingRelatedImages}
				/>
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

			<div
				class={`grid gap-6 p-6 ${
					hasSidebarDetails ? 'xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]' : ''
				}`}
			>
				<div class="space-y-6">
					{#if creatureSetRosterSection}
						<CreatureSetRosterSection creatures={creatureSetRosterSection.items} />
					{/if}

					{#if data.type !== 'creatures' && (itemData.desc || item.description)}
						<CompendiumAccordionSection
							title="Description"
							description="Core rules text and narrative summary."
							open={true}
							value="description"
						>
							<div class="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html markdownAt('description')}
							</div>
						</CompendiumAccordionSection>
					{/if}

					{#if data.type === 'creatures' && (itemData.desc || item.description)}
						<CompendiumAccordionSection
							title="Description"
							description="Lore and encounter-facing rules text."
							open={true}
							value="creature-description"
						>
							<div class="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html markdownAt('description')}
							</div>
						</CompendiumAccordionSection>
					{/if}

					{#if isDescriptionArray(itemData.descriptions)}
						<CompendiumAccordionSection
							title="Descriptions"
							description="Variant text grouped by system and source document."
							value="descriptions"
						>
							<div class="space-y-4">
								{#each getDescriptions(itemData.descriptions) as desc, index (`${desc.document ?? 'description'}-${index}`)}
									<div
										class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 p-4"
									>
										<div class="mb-2 flex flex-wrap gap-2">
											{#if desc.gamesystem}
												<span class="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent">
													{desc.gamesystem}
												</span>
											{/if}
											{#if desc.document}
												<span
													class="rounded bg-[var(--color-bg-secondary)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
												>
													{desc.document}
												</span>
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
						</CompendiumAccordionSection>
					{/if}

					{#if isBenefitArray(itemData.benefits)}
						<CompendiumAccordionSection
							title="Benefits"
							description="Mechanical benefits and repeatable advantages."
							value="benefits"
						>
							<ul class="list-inside list-disc space-y-2 text-[var(--color-text-secondary)]">
								{#each getBenefits(itemData.benefits) as _benefit, index (index)}
									<li class="prose prose-invert prose-sm max-w-none [&>p]:m-0">
										<!-- eslint-disable-next-line svelte/no-at-html-tags -->
										{@html markdownAt(`benefits.${index}.desc`)}
									</li>
								{/each}
							</ul>
						</CompendiumAccordionSection>
					{/if}

					{#if data.type === 'weapons' && isWeaponPropertyArray(itemData.properties)}
						<CompendiumAccordionSection
							title="Properties"
							description="Rules traits attached to this weapon."
							value="weapon-properties"
						>
							<div class="grid gap-3">
								{#each getWeaponProperties(itemData.properties) as wp, index (`${wp.property?.key ?? wp.property?.name ?? 'property'}-${index}`)}
									<div
										class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 p-4"
									>
										<div class="flex items-center gap-2">
											<span class="font-semibold text-accent">{wp.property?.name ?? ''}</span>
											{#if wp.property?.type}
												<span class="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent">
													{wp.property.type}
												</span>
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
						</CompendiumAccordionSection>
					{/if}

					{#if data.type === 'species' && itemData.traits && Array.isArray(itemData.traits) && itemData.traits.length > 0}
						<CompendiumAccordionSection
							title="Traits"
							description="Species-specific traits and inherited features."
							value="species-traits"
						>
							<div class="grid gap-3">
								{#each itemData.traits as trait, index (`${trait.key ?? trait.name ?? 'trait'}-${index}`)}
									<div
										class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 p-4"
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
						</CompendiumAccordionSection>
					{/if}

					{#if data.type === 'spells' && itemData}
						<SpellDetailSections
							classes={Array.isArray(itemData.classes) ? itemData.classes : []}
							higherLevel={itemData.higher_level}
							{markdownAt}
						/>
					{/if}

					{#if data.type === 'classes' && itemData}
						<ClassFeaturesSection
							features={Array.isArray(itemData.features) ? itemData.features : []}
							{markdownAt}
						/>
					{/if}
				</div>

				{#if hasSidebarDetails}
					<div class="space-y-6 xl:sticky xl:top-6 xl:self-start">
						<CompendiumDetailsPanel fields={detailFields} resolveValue={getDetailValue} />
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
