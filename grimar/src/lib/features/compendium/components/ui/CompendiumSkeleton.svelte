<script lang="ts">
	type SkeletonVariant = 'grid' | 'list';

	interface Props {
		variant?: SkeletonVariant;
		count?: number;
	}

	let { variant = 'grid', count = 8 }: Props = $props();
</script>

<div class="contents" data-testid="skeleton-{variant}">
	{#each Array(count) as _, _i (_i)}
		<div
			class="group relative w-full overflow-hidden rounded-2xl border border-[var(--color-border)]/40 bg-[color-mix(in_srgb,var(--color-bg-card)_85%,var(--color-bg-overlay))] backdrop-blur-sm {variant ===
			'grid'
				? 'h-full'
				: 'mb-2'}"
		>
			<!-- Skeleton shimmer effect -->
			<div class="animate-pulse">
				{#if variant === 'grid'}
					<!-- Grid skeleton: icon + title + subtitle -->
					<div class="flex h-full flex-col items-center justify-center gap-2 p-3 text-center">
						<div
							class="size-10 rounded-xl bg-[color-mix(in_srgb,var(--color-bg-overlay)_60%,transparent)]"
						></div>
						<div class="flex flex-col items-center gap-2">
							<div class="h-4 w-24 rounded bg-[var(--color-bg-overlay)]"></div>
							<div class="h-3 w-16 rounded bg-[var(--color-bg-overlay)]"></div>
						</div>
					</div>
				{:else}
					<!-- List skeleton: icon + title + subtitle + badge -->
					<div class="flex items-center justify-between gap-3 p-3">
						<div class="flex items-center gap-3">
							<div
								class="size-10 rounded-xl bg-[color-mix(in_srgb,var(--color-bg-overlay)_60%,transparent)]"
							></div>
							<div class="flex flex-col gap-2">
								<div class="h-4 w-32 rounded bg-[var(--color-bg-overlay)]"></div>
								<div class="h-3 w-20 rounded bg-[var(--color-bg-overlay)]"></div>
							</div>
						</div>
						<div class="h-5 w-12 rounded bg-[var(--color-bg-overlay)]"></div>
					</div>
				{/if}
			</div>

			<!-- Gem accent placeholder (subtle) -->
			<div class="absolute inset-y-0 left-0 w-1 bg-[var(--color-gem-amethyst)]/20"></div>
		</div>
	{/each}
</div>

<style>
	/* Shimmer animation override for smoother effect */
	.animate-pulse {
		animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes skeleton-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
