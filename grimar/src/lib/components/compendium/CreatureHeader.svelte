<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import { isCompendiumDetailReference } from '$lib/core/utils/compendium-detail-values';
	import { formatValue } from '$lib/utils/compendium';

	type CreatureRelatedImage = {
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
		challengeRatingText?: unknown;
		size?: unknown;
		typeValue?: unknown;
		alignment?: unknown;
		experiencePoints?: unknown;
		featuredRelatedImage?: CreatureRelatedImage;
	}

	let {
		label,
		title,
		source,
		documentLabel,
		icon,
		challengeRatingText,
		size,
		typeValue,
		alignment,
		experiencePoints,
		featuredRelatedImage
	}: Props = $props();

</script>

<div class="flex items-start justify-between gap-6">
	<div class="min-w-0 flex-1">
		<div class="flex items-start justify-between gap-4">
			<div>
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
			<div class="text-4xl">{icon}</div>
		</div>

		<div class="mt-5 flex flex-wrap gap-2">
			{#if challengeRatingText}
				<Badge variant="solid">CR {challengeRatingText}</Badge>
			{/if}
			{#if size}
				{@const sizeLink = isCompendiumDetailReference(size) ? size : null}
				{#if sizeLink}
					<a href={sizeLink.href} class="transition-transform hover:-translate-y-0.5">
						<Badge variant="outline" class="hover:border-accent/50 hover:text-accent">
							{sizeLink.label}
						</Badge>
					</a>
				{:else}
					<Badge variant="outline">{formatValue(size)}</Badge>
				{/if}
			{/if}
			{#if typeValue}
				{@const typeLink = isCompendiumDetailReference(typeValue) ? typeValue : null}
				{#if typeLink}
					<a href={typeLink.href} class="transition-transform hover:-translate-y-0.5">
						<Badge variant="outline" class="hover:border-accent/50 hover:text-accent">
							{typeLink.label}
						</Badge>
					</a>
				{:else}
					<Badge variant="outline">{formatValue(typeValue)}</Badge>
				{/if}
			{/if}
			{#if alignment}
				<Badge variant="outline">{formatValue(alignment)}</Badge>
			{/if}
			{#if experiencePoints}
				<Badge variant="outline">XP {formatValue(experiencePoints)}</Badge>
			{/if}
		</div>
	</div>

	{#if featuredRelatedImage}
		<a
			href={`/compendium/images/${featuredRelatedImage.key}`}
			class="group hidden shrink-0 lg:block"
		>
			<div
				class="relative aspect-square w-40 overflow-hidden rounded-full border border-accent/30 bg-[var(--color-bg-card)]/70 p-3"
				style={`box-shadow:
					inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 22%, transparent),
					inset 0 1.25rem 2rem color-mix(in srgb, var(--color-bg-secondary) 45%, transparent),
					inset 0 -1rem 1.75rem color-mix(in srgb, var(--color-accent) 12%, transparent),
					0 0 2rem color-mix(in srgb, var(--color-accent) 12%, transparent);`}
			>
				<div class="absolute inset-[8%] rounded-full border border-[var(--color-border)]/60"></div>
				{#if featuredRelatedImage.assetUrl}
					<img
						src={featuredRelatedImage.assetUrl}
						alt={featuredRelatedImage.altText ?? featuredRelatedImage.name}
						class="relative z-10 h-full w-full rounded-full object-cover opacity-90 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.04]"
						style={`filter:
							saturate(1.08)
							contrast(1.03)
							drop-shadow(0 0 1rem color-mix(in srgb, var(--color-accent) 28%, transparent))
							drop-shadow(0 0 2rem color-mix(in srgb, var(--color-accent) 18%, transparent));`}
						loading="lazy"
					/>
				{/if}
			</div>
			<div class="mt-3 flex items-center justify-between gap-3 px-1">
				<p class="text-xs font-medium tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
					Scrying Orb
				</p>
				<span class="text-xs text-accent transition-colors group-hover:text-accent/80"> Open </span>
			</div>
		</a>
	{/if}
</div>
