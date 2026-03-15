<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import { getImageKindLabel } from '$lib/utils/compendium';

	type RelatedImage = {
		key: string;
		name: string;
		documentName: string | null;
		description: string | null;
		assetUrl: string | null;
		altText: string | null;
	};

	interface Props {
		featuredImage?: RelatedImage;
		showFeaturedCard?: boolean;
		images: RelatedImage[];
	}

	let { featuredImage, showFeaturedCard = false, images }: Props = $props();

	function getDescription(image: RelatedImage): string | undefined {
		if (typeof image.description === 'string' && image.description.trim()) {
			return image.description;
		}

		if (typeof image.altText === 'string' && image.altText.trim()) {
			return image.altText;
		}

		return undefined;
	}
</script>

{#if showFeaturedCard && featuredImage}
	<div class="border-b border-[var(--color-border)] p-6">
		<div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/20 p-4">
			<a href={`/compendium/images/${featuredImage.key}`} class="group flex items-center gap-4">
				<div
					class="shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-linear-to-b from-white via-white to-white/90 p-3 transition-colors group-hover:border-accent/40"
				>
					{#if featuredImage.assetUrl}
						<img
							src={featuredImage.assetUrl}
							alt={featuredImage.altText ?? featuredImage.name}
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
							{getImageKindLabel(featuredImage.assetUrl)}
						</p>
						<p class="mt-1 truncate font-semibold text-[var(--color-text-primary)]">
							{featuredImage.name}
						</p>
					</div>
					<span class="shrink-0 text-sm text-accent transition-colors group-hover:text-accent/80">
						Open asset details
					</span>
				</div>
			</a>
		</div>
	</div>
{/if}

{#if images.length > 0}
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
			{#each images as image (image.key)}
				<a
					href={`/compendium/images/${image.key}`}
					class="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/85 transition-colors hover:border-accent/50"
				>
					<div
						class="flex aspect-[4/3] items-center justify-center bg-linear-to-b from-white via-white to-white/90 p-4"
					>
						{#if image.assetUrl}
							<img
								src={image.assetUrl}
								alt={image.altText ?? image.name}
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
								{image.name}
							</h3>
							<Badge variant="outline" class="shrink-0 text-xs">
								{getImageKindLabel(image.assetUrl)}
							</Badge>
						</div>
						{#if getDescription(image)}
							<p class="line-clamp-3 text-sm text-[var(--color-text-secondary)]">
								{getDescription(image)}
							</p>
						{/if}
						{#if image.documentName}
							<p class="text-xs tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
								{image.documentName}
							</p>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	</div>
{/if}
