<script lang="ts">
	type Props = {
		pathname?: string;
	};

	let { pathname = '' }: Props = $props();

	const isCompendiumDetail = $derived(/^\/compendium\/[^/]+\/[^/]+/.test(pathname));
	const isCompendiumList = $derived(/^\/compendium\/[^/]+$/.test(pathname));
</script>

<div
	class="pointer-events-none fixed inset-0 z-[65] bg-[var(--color-bg-canvas)]/45 backdrop-blur-[1px]"
>
	<div class="mx-auto max-w-7xl px-4 py-8">
		{#if isCompendiumDetail}
			<div class="mx-auto max-w-4xl space-y-4">
				<div class="h-10 w-2/3 animate-pulse rounded bg-[var(--color-bg-card)]/80"></div>
				<div class="h-5 w-1/3 animate-pulse rounded bg-[var(--color-bg-card)]/70"></div>
				<div
					class="h-56 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/65"
				></div>
				<div
					class="h-40 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55"
				></div>
			</div>
		{:else if isCompendiumList}
			<div class="space-y-5">
				<div class="h-11 w-72 animate-pulse rounded bg-[var(--color-bg-card)]/80"></div>
				<div
					class="h-16 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/65"
				></div>
				<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each Array(8) as _, index (`card-${index}`)}
						<div
							class="h-40 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/60"
						></div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="space-y-4">
				<div class="h-10 w-56 animate-pulse rounded bg-[var(--color-bg-card)]/80"></div>
				<div
					class="h-24 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/65"
				></div>
				<div
					class="h-40 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/60"
				></div>
			</div>
		{/if}
	</div>
</div>
