<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import DamageTypeIcon from '$lib/components/compendium/icons/DamageTypeIcon.svelte';
	import AoeIcon from '$lib/components/compendium/icons/AoeIcon.svelte';
	import CompendiumTypeIcon from '$lib/components/compendium/icons/CompendiumTypeIcon.svelte';
	import SpellSchoolIcon from '$lib/components/compendium/icons/SpellSchoolIcon.svelte';
	import { getImageKindLabel } from '$lib/utils/compendium';
	import type { CompendiumDetailHeaderBadge } from '$lib/core/types/compendium';

	type RelatedImage = {
		key: string;
		name: string;
		assetUrl: string | null;
		altText: string | null;
	};

	interface Props {
		label: string;
		title: string;
		source?: string | null;
		documentLabel?: string;
		icon: string;
		type: string;
		headerBadges: CompendiumDetailHeaderBadge[];
		featuredRelatedImage?: RelatedImage;
	}

	let {
		label,
		title,
		source,
		documentLabel,
		icon,
		type,
		headerBadges,
		featuredRelatedImage
	}: Props = $props();
</script>

<div>
	<div class="flex items-start justify-between gap-6">
		<div class="min-w-0 flex-1">
			<div class="mb-3 flex flex-wrap items-center gap-2">
				<Badge variant="outline" class="text-xs tracking-[0.18em] uppercase">
					{label}
				</Badge>
				{#if source && source !== 'open5e'}
					<Badge variant="outline" class="text-xs">{source}</Badge>
				{/if}
			</div>
			<h1 class="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] lg:text-4xl">
				{title}
			</h1>
			{#if source && source !== 'open5e'}
				<p class="mt-2 text-sm text-[var(--color-text-muted)]">
					{source}
					{#if documentLabel}
						• {documentLabel}
					{/if}
				</p>
			{:else if documentLabel}
				<p class="mt-2 text-sm text-[var(--color-text-muted)]">
					{documentLabel}
				</p>
			{/if}
		</div>

		{#if type === 'conditions' && featuredRelatedImage}
			<a
				href={`/compendium/images/${featuredRelatedImage.key}`}
				class="group hidden shrink-0 lg:block"
			>
				<div
					class="relative w-40 overflow-hidden rounded-[2rem] border border-accent/30 bg-linear-to-br from-white via-white to-white/88 p-4"
					style={`box-shadow:
						inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 18%, transparent),
						inset 0 1rem 1.75rem color-mix(in srgb, white 55%, transparent),
						0 1rem 2.5rem color-mix(in srgb, var(--color-accent) 14%, transparent);`}
				>
					<div
						class="pointer-events-none absolute inset-3 rounded-[1.5rem] border border-[var(--color-border)]/70"
					></div>
					{#if featuredRelatedImage.assetUrl}
						<img
							src={featuredRelatedImage.assetUrl}
							alt={featuredRelatedImage.altText ?? featuredRelatedImage.name}
							class="relative z-10 aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-[1.05]"
							loading="lazy"
						/>
					{/if}
				</div>
				<div class="mt-3 flex items-center justify-between gap-3 px-1">
					<div class="min-w-0">
						<p
							class="text-[11px] font-medium tracking-[0.18em] text-[var(--color-text-muted)] uppercase"
						>
							{getImageKindLabel(featuredRelatedImage.assetUrl)}
						</p>
						<p class="truncate text-sm text-[var(--color-text-secondary)]">
							{featuredRelatedImage.name}
						</p>
					</div>
					<span class="text-xs text-accent transition-colors group-hover:text-accent/80">
						Open
					</span>
				</div>
			</a>
		{:else}
			<CompendiumTypeIcon {type} fallback={icon} class="h-10 w-10" />
		{/if}
	</div>

	{#if headerBadges.length > 0}
		<div class="mt-5 flex flex-wrap gap-2">
			{#each headerBadges as badge, index (`${badge.label}-${index}`)}
				<Badge variant={badge.variant} class={badge.icon ? 'gap-1.5' : ''}>
					{#if badge.icon?.family === 'spell-school'}
						<SpellSchoolIcon school={badge.icon.value} class="h-3.5 w-3.5" />
					{:else if badge.icon?.family === 'damage-type'}
						<DamageTypeIcon type={badge.icon.value} class="h-3.5 w-3.5" />
					{:else if badge.icon?.family === 'aoe'}
						<AoeIcon shape={badge.icon.value} class="h-3.5 w-3.5" />
					{/if}
					{badge.label}
				</Badge>
			{/each}
		</div>
	{/if}

	{#if type === 'conditions' && featuredRelatedImage}
		<div class="mt-5 flex flex-wrap gap-2">
			<Badge variant="solid">{getImageKindLabel(featuredRelatedImage.assetUrl)}</Badge>
			<Badge variant="outline">Linked art</Badge>
		</div>
		<a
			href={`/compendium/images/${featuredRelatedImage.key}`}
			class="group mt-5 block rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/30 p-3 transition-colors hover:border-accent/40 lg:hidden"
		>
			<div class="flex items-center gap-3">
				<div
					class="shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-linear-to-br from-white via-white to-white/88 p-2"
				>
					{#if featuredRelatedImage.assetUrl}
						<img
							src={featuredRelatedImage.assetUrl}
							alt={featuredRelatedImage.altText ?? featuredRelatedImage.name}
							class="h-14 w-14 object-contain transition-transform duration-300 group-hover:scale-[1.05]"
							loading="lazy"
						/>
					{/if}
				</div>
				<div class="min-w-0 flex-1">
					<p
						class="text-[11px] font-medium tracking-[0.18em] text-[var(--color-text-muted)] uppercase"
					>
						Related image
					</p>
					<p class="truncate font-medium text-[var(--color-text-primary)]">
						{featuredRelatedImage.name}
					</p>
				</div>
				<span class="text-sm text-accent transition-colors group-hover:text-accent/80"> Open </span>
			</div>
		</a>
	{/if}
</div>
