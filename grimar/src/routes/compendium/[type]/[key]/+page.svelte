<script lang="ts">
	import Breadcrumb from '$lib/components/ui/Breadcrumb.svelte';
	import ClassFeaturesSection from '$lib/components/compendium/ClassFeaturesSection.svelte';
	import ClassTableSection from '$lib/components/compendium/ClassTableSection.svelte';
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
		CompendiumBenefitsSection,
		CompendiumClassFeaturesSection,
		CompendiumClassTableSection,
		CompendiumCreatureEncounterSection,
		CompendiumCreatureSetRosterSection,
		CompendiumDetailField
		,
		CompendiumDescriptionsSection,
		CompendiumMarkdownSection,
		CompendiumSpellClassesSection,
		CompendiumTraitsSection,
		CompendiumWeaponPropertiesSection
	} from '$lib/core/types/compendium';
	import type { PageData } from './$types';

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

	let { data }: Props = $props();

	let item = $derived(data.item);
	let presentation = $derived(data.detail.presentation);
	let featuredRelatedImage = $derived.by(() => {
		if (data.type === 'images') {
			return undefined;
		}

		if (data.type === 'conditions' && presentation.conditionArtwork) {
			return {
				key: presentation.conditionArtwork.key,
				name: presentation.conditionArtwork.name,
				documentName: presentation.conditionArtwork.documentLabel ?? null,
				description: null,
				assetUrl: presentation.conditionArtwork.assetUrl,
				altText: presentation.conditionArtwork.altText ?? null
			};
		}

		return data.relatedImages?.[0];
	});
	let remainingRelatedImages = $derived(
		data.type === 'conditions' ? (data.relatedImages ?? []) : (data.relatedImages?.slice(1) ?? [])
	);
	let detailFields = $derived(data.detail.fields as CompendiumDetailField[]);
	let detailSections = $derived(data.detail.sections);
	let markdownHtml = $derived<Record<string, string>>(data.markdownHtml ?? {});
	let creatureSetRosterSection = $derived.by(() => {
		const sections = detailSections as Array<CompendiumCreatureSetRosterSection | { kind: string }>;
		const rosterSection = sections.find(
			(section): section is CompendiumCreatureSetRosterSection =>
				section.kind === 'creature-set-roster'
		);
		return rosterSection ?? null;
	});
	let descriptionsSection = $derived.by(() => {
		const section = detailSections.find(
			(entry): entry is CompendiumDescriptionsSection => entry.kind === 'descriptions'
		);
		return section ?? null;
	});
	let benefitsSection = $derived.by(() => {
		const section = detailSections.find(
			(entry): entry is CompendiumBenefitsSection => entry.kind === 'benefits'
		);
		return section ?? null;
	});
	let weaponPropertiesSection = $derived.by(() => {
		const section = detailSections.find(
			(entry): entry is CompendiumWeaponPropertiesSection => entry.kind === 'weapon-properties'
		);
		return section ?? null;
	});
	let traitsSection = $derived.by(() => {
		const section = detailSections.find(
			(entry): entry is CompendiumTraitsSection => entry.kind === 'traits'
		);
		return section ?? null;
	});
	let descriptionSection = $derived.by(() => {
		const section = detailSections.find(
			(entry): entry is CompendiumMarkdownSection =>
				entry.kind === 'markdown' && entry.key === 'description'
		);
		return section ?? null;
	});
	let higherLevelSection = $derived.by(() => {
		const section = detailSections.find(
			(entry): entry is CompendiumMarkdownSection =>
				entry.kind === 'markdown' && entry.key === 'higher_level'
		);
		return section ?? null;
	});
	let supplementalMarkdownSections = $derived.by(() =>
		detailSections.filter(
			(entry): entry is CompendiumMarkdownSection =>
				entry.kind === 'markdown' &&
				entry.key !== 'description' &&
				entry.key !== 'higher_level'
		)
	);
	let spellClassesSection = $derived.by(() => {
		const section = detailSections.find(
			(entry): entry is CompendiumSpellClassesSection => entry.kind === 'spell-classes'
		);
		return section ?? null;
	});
	let classFeaturesSection = $derived.by(() => {
		const section = detailSections.find(
			(entry): entry is CompendiumClassFeaturesSection => entry.kind === 'class-features'
		);
		return section ?? null;
	});
	let classTableSections = $derived.by(() =>
		detailSections.filter(
			(entry): entry is CompendiumClassTableSection => entry.kind === 'class-table'
		)
	);
	let creatureEncounterSection = $derived.by(() => {
		const section = detailSections.find(
			(entry): entry is CompendiumCreatureEncounterSection => entry.kind === 'creature-encounter'
		);
		return section ?? null;
	});
	let hasSidebarDetails = $derived(detailFields.length > 0);

	function markdownAt(path: string): string {
		return markdownHtml[path] ?? '';
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
						documentLabel={presentation.documentLabel}
						icon={data.config.icon}
						challengeRatingText={presentation.creatureHeader?.challengeRatingText}
						size={presentation.creatureHeader?.size}
						typeValue={presentation.creatureHeader?.typeValue}
						alignment={presentation.creatureHeader?.alignment}
						experiencePoints={presentation.creatureHeader?.experiencePoints}
						{featuredRelatedImage}
					/>
				{:else}
					<CompendiumDetailHeader
						label={data.config.label}
						title={item.name}
						source={item.source}
						documentLabel={presentation.documentLabel}
						icon={data.config.icon}
						type={data.type}
						headerBadges={presentation.headerBadges}
						{featuredRelatedImage}
					/>
				{/if}
			</div>

			{#if data.type === 'images'}
				<ImageDetailPanel
					title={item.name}
					imageAssetUrl={presentation.image?.assetUrl ?? null}
					altText={presentation.image?.altText}
					attribution={presentation.image?.attribution}
					documentLabel={presentation.documentLabel}
					publisher={presentation.image?.publisher}
					gameSystem={presentation.image?.gameSystem}
					permalink={presentation.image?.permalink}
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

			{#if creatureEncounterSection}
				<CreatureEncounterPanel section={creatureEncounterSection} {markdownAt} />
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

					{#if descriptionSection}
						<CompendiumAccordionSection
							title={descriptionSection.title}
							description={descriptionSection.description}
							open={descriptionSection.defaultOpen ?? false}
							value={descriptionSection.key}
						>
							<div class="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html markdownAt(descriptionSection.markdownKey)}
							</div>
						</CompendiumAccordionSection>
					{/if}

					{#each supplementalMarkdownSections as markdownSection (markdownSection.key)}
						<CompendiumAccordionSection
							title={markdownSection.title}
							description={markdownSection.description}
							open={markdownSection.defaultOpen ?? false}
							value={markdownSection.key}
						>
							<div class="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html markdownAt(markdownSection.markdownKey)}
							</div>
						</CompendiumAccordionSection>
					{/each}

					{#if descriptionsSection}
						<CompendiumAccordionSection
							title={descriptionsSection.title}
							description={descriptionsSection.description}
							value="descriptions"
						>
							<div class="space-y-4">
								{#each descriptionsSection.items as desc, index (`${desc.document ?? 'description'}-${index}`)}
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
											{@html markdownAt(desc.markdownKey)}
										</div>
									</div>
								{/each}
							</div>
						</CompendiumAccordionSection>
					{/if}

					{#if benefitsSection}
						<CompendiumAccordionSection
							title={benefitsSection.title}
							description={benefitsSection.description}
							value="benefits"
						>
							<ul class="list-inside list-disc space-y-2 text-[var(--color-text-secondary)]">
								{#each benefitsSection.items as benefit, index (index)}
									<li class="prose prose-invert prose-sm max-w-none [&>p]:m-0">
										<!-- eslint-disable-next-line svelte/no-at-html-tags -->
										{@html markdownAt(benefit.markdownKey)}
									</li>
								{/each}
							</ul>
						</CompendiumAccordionSection>
					{/if}

					{#if weaponPropertiesSection}
						<CompendiumAccordionSection
							title={weaponPropertiesSection.title}
							description={weaponPropertiesSection.description}
							value="weapon-properties"
						>
							<div class="grid gap-3">
								{#each weaponPropertiesSection.items as property, index (`${property.name}-${index}`)}
									<div
										class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 p-4"
									>
										<div class="flex items-center gap-2">
											<span class="font-semibold text-accent">{property.name}</span>
											{#if property.propertyType}
												<span class="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent">
													{property.propertyType}
												</span>
											{/if}
											{#if property.detail}
												<span class="text-sm text-[var(--color-text-muted)]">({property.detail})</span>
											{/if}
										</div>
										{#if property.markdownKey}
											<div
												class="prose prose-invert prose-sm mt-2 max-w-none text-[var(--color-text-secondary)]"
											>
												<!-- eslint-disable-next-line svelte/no-at-html-tags -->
												{@html markdownAt(property.markdownKey)}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</CompendiumAccordionSection>
					{/if}

					{#if traitsSection}
						<CompendiumAccordionSection
							title={traitsSection.title}
							description={traitsSection.description}
							value="species-traits"
						>
							<div class="grid gap-3">
								{#each traitsSection.items as trait, index (`${trait.name}-${index}`)}
									<div
										class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 p-4"
									>
										<h3 class="font-semibold text-accent">{trait.name}</h3>
										{#if trait.markdownKey}
											<div
												class="prose prose-invert prose-sm mt-1 max-w-none text-[var(--color-text-secondary)]"
											>
												<!-- eslint-disable-next-line svelte/no-at-html-tags -->
												{@html markdownAt(trait.markdownKey)}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</CompendiumAccordionSection>
					{/if}

					{#if spellClassesSection || higherLevelSection}
						<SpellDetailSections
							classes={spellClassesSection?.items ?? []}
							higherLevelSection={higherLevelSection}
							{markdownAt}
						/>
					{/if}

					{#if classFeaturesSection}
						<ClassFeaturesSection
							features={classFeaturesSection.items}
							title={classFeaturesSection.title}
							description={classFeaturesSection.description}
							defaultOpen={classFeaturesSection.defaultOpen ?? false}
							{markdownAt}
						/>
					{/if}

					{#each classTableSections as classTableSection (classTableSection.key)}
						<ClassTableSection section={classTableSection} />
					{/each}
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
