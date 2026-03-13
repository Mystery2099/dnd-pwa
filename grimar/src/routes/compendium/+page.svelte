<script lang="ts">
	import PageShell from '$lib/components/ui/PageShell.svelte';
	import CompendiumTypeIcon from '$lib/components/compendium/icons/CompendiumTypeIcon.svelte';
	import { COMPENDIUM_CATEGORIES, COMPENDIUM_TYPE_CONFIGS } from '$lib/core/constants/compendium';

	interface Props {
		data: {
			counts: Record<string, number>;
		};
	}

	let { data }: Props = $props();
	const counts = $derived(data.counts ?? {});
	const totalEntries = $derived(
		Object.values(counts).reduce((sum, count) => sum + Number(count ?? 0), 0)
	);
	const indexedTypes = $derived(Object.keys(COMPENDIUM_TYPE_CONFIGS).length);
</script>

<PageShell
	title="Compendium"
	description="Browse the complete D&D 5e reference library"
	class="!bg-transparent !px-4 !py-3 md:!px-6 md:!py-5"
>
	<div class="space-y-8 pb-2">
		<section
			class="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent_36%),linear-gradient(145deg,color-mix(in_srgb,var(--color-bg-card)_86%,transparent),color-mix(in_srgb,var(--color-bg-primary)_96%,transparent))] p-6 shadow-[0_1.5rem_3rem_color-mix(in_srgb,var(--color-shadow)_18%,transparent)] md:p-7"
		>
			<div class="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(120deg,transparent,color-mix(in_srgb,var(--color-accent)_10%,transparent),transparent)] opacity-60"></div>
			<div class="relative">
				<div>
					<p class="text-[0.72rem] font-medium tracking-[0.24em] text-[var(--color-text-muted)] uppercase">
						Reference Atlas
					</p>
					<h2 class="mt-3 max-w-3xl text-3xl font-black tracking-tight text-[var(--color-text-primary)] md:text-[2.4rem]">
						Every ruleset, creature dossier, spell ledger, and item archive in one navigable stack.
					</h2>
					<p class="mt-3 max-w-3xl text-[color-mix(in_srgb,var(--color-text-primary)_72%,var(--color-text-secondary))]">
						Start with a category, then drill into a type-specific shelf. The index below is tuned for
						fast scanning rather than a flat encyclopedia dump.
					</p>
					<div class="mt-5 grid gap-3 sm:grid-cols-3">
						<div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/50 px-5 py-4">
							<p class="text-[0.68rem] font-medium tracking-[0.2em] text-[var(--color-text-muted)] uppercase">
								Total Entries
							</p>
							<p class="mt-2 text-2xl font-black text-[var(--color-text-primary)]">
								{totalEntries.toLocaleString()}
							</p>
						</div>
						<div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/50 px-5 py-4">
							<p class="text-[0.68rem] font-medium tracking-[0.2em] text-[var(--color-text-muted)] uppercase">
								Categories
							</p>
							<p class="mt-2 text-2xl font-black text-[var(--color-text-primary)]">
								{COMPENDIUM_CATEGORIES.length}
							</p>
						</div>
						<div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/50 px-5 py-4">
							<p class="text-[0.68rem] font-medium tracking-[0.2em] text-[var(--color-text-muted)] uppercase">
								Indexed Types
							</p>
							<p class="mt-2 text-2xl font-black text-[var(--color-text-primary)]">
								{indexedTypes}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<div class="grid items-start gap-6 lg:grid-cols-2 2xl:grid-cols-3">
			{#each COMPENDIUM_CATEGORIES as category (category.name)}
				{@const categoryTypes = category.types.filter(
					(t: string) => COMPENDIUM_TYPE_CONFIGS[t as keyof typeof COMPENDIUM_TYPE_CONFIGS]
				)}
				{#if categoryTypes.length > 0}
					<section
						class="group relative overflow-hidden rounded-[1.7rem] border border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_88%,transparent),color-mix(in_srgb,var(--color-bg-primary)_95%,transparent))] p-5 shadow-[0_1.1rem_2.4rem_color-mix(in_srgb,var(--color-shadow)_16%,transparent)] transition-transform duration-300 hover:-translate-y-1"
					>
						<div class="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl"></div>
						<div class="relative">
							<div class="flex items-start justify-between gap-4">
								<div>
									<p class="text-[0.68rem] font-medium tracking-[0.22em] text-[color-mix(in_srgb,var(--color-text-primary)_52%,var(--color-text-muted))] uppercase">
										Category
									</p>
									<h2 class="mt-2 text-xl font-bold text-[var(--color-text-primary)]">
										{category.name}
									</h2>
								</div>
								<div class="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)]/60 px-3 py-1 text-xs text-[var(--color-text-secondary)]">
									{categoryTypes.length} shelves
								</div>
							</div>
							<p class="mt-3 text-sm leading-6 text-[color-mix(in_srgb,var(--color-text-primary)_70%,var(--color-text-secondary))]">
								{category.description}
							</p>
							<div class="mt-5 space-y-3">
								{#each categoryTypes as type (type)}
									{@const config = COMPENDIUM_TYPE_CONFIGS[type]}
									{@const count = counts[type] ?? 0}
									<a
										href="/compendium/{type}"
										class="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/48 px-4 py-3.5 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)] transition-all duration-300 hover:border-accent/45 hover:bg-[var(--color-bg-card)]/74"
									>
										<div class="flex min-w-0 items-center gap-3">
											<span
												class="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/75 text-lg"
											>
												<CompendiumTypeIcon
													type={type}
													fallback={config.icon}
													class="h-5 w-5"
												/>
											</span>
											<div class="min-w-0">
												<p class="truncate font-semibold text-[var(--color-text-primary)]">
													{config.plural}
												</p>
												<p class="truncate text-[0.65rem] tracking-[0.14em] text-[color-mix(in_srgb,var(--color-text-primary)_46%,var(--color-text-muted))] uppercase">
													{config.label} archive
												</p>
											</div>
										</div>
										<div class="text-right">
											<p class="text-sm font-semibold text-[var(--color-text-primary)]">
												{count.toLocaleString()}
											</p>
											<p class="text-[0.68rem] tracking-[0.16em] text-[color-mix(in_srgb,var(--color-text-primary)_46%,var(--color-text-muted))] uppercase">
												entries
											</p>
										</div>
									</a>
								{/each}
							</div>
						</div>
					</section>
				{/if}
			{/each}
		</div>
	</div>
</PageShell>
