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

<svelte:head>
	<title>Compendium | Grimar</title>
</svelte:head>

<PageShell
	title="Compendium"
	description="Browse the complete D&D 5e reference library"
	showHeader={false}
	surface={false}
	class="!bg-transparent !px-3 !py-3 md:!px-5 md:!py-4"
>
	<div class="space-y-6 pb-2">
		<section
			class="relative overflow-hidden rounded-[1.85rem] border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_58%,transparent),color-mix(in_srgb,var(--color-bg-overlay)_10%,transparent))] p-5 shadow-[0_0.75rem_1.8rem_color-mix(in_srgb,var(--color-shadow)_9%,transparent)] md:p-6"
		>
			<div
				class="absolute inset-y-0 right-0 w-[34%] bg-[linear-gradient(120deg,transparent,color-mix(in_srgb,var(--color-accent)_5%,transparent),transparent)] opacity-45"
			></div>
			<div class="relative grid gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(16rem,0.9fr)] xl:items-end">
				<div>
					<div class="flex flex-wrap items-center gap-3">
						<p
							class="text-[0.68rem] font-medium tracking-[0.24em] text-[var(--color-text-muted)] uppercase"
						>
							Reference Atlas
						</p>
						<span
							class="rounded-full border border-[color-mix(in_srgb,var(--color-border)_82%,var(--color-accent))] bg-[color-mix(in_srgb,var(--color-bg-card)_54%,transparent)] px-2.5 py-1 text-[0.65rem] tracking-[0.2em] text-[color-mix(in_srgb,var(--color-text-primary)_64%,var(--color-text-muted))] uppercase"
						>
							{indexedTypes} indexed shelves
						</span>
						<a
							href="/beta/compendium"
							class="rounded-full border border-[color-mix(in_srgb,var(--color-accent)_48%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] px-3 py-1 text-[0.65rem] tracking-[0.2em] text-[color-mix(in_srgb,var(--color-text-primary)_84%,var(--color-accent))] uppercase transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]"
						>
							Atlas Preview
						</a>
					</div>
					<h2
						class="mt-3 max-w-4xl text-[2rem] leading-[1.02] font-black tracking-tight text-[var(--color-text-primary)] md:text-[2.5rem]"
					>
						Find rules, dossiers, spells, and archives without wading through a flat encyclopedia.
					</h2>
					<p
						class="mt-3 max-w-3xl text-sm leading-6 text-[color-mix(in_srgb,var(--color-text-primary)_72%,var(--color-text-secondary))] md:text-base"
					>
						Use the category shelves below to jump straight into the part of the ruleset you need.
						Everything here is arranged for fast scanning first, deep reading second.
					</p>
				</div>

				<div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
					<div
						class="rounded-[1.35rem] border border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_26%,transparent)] px-4 py-3.5"
					>
						<p
							class="text-[0.64rem] font-medium tracking-[0.2em] text-[var(--color-text-muted)] uppercase"
						>
							Total Entries
						</p>
						<p class="mt-1.5 text-[1.7rem] leading-none font-black text-[var(--color-text-primary)]">
							{totalEntries.toLocaleString()}
						</p>
					</div>
					<div
						class="rounded-[1.35rem] border border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_26%,transparent)] px-4 py-3.5"
					>
						<p
							class="text-[0.64rem] font-medium tracking-[0.2em] text-[var(--color-text-muted)] uppercase"
						>
							Categories
						</p>
						<p class="mt-1.5 text-[1.7rem] leading-none font-black text-[var(--color-text-primary)]">
							{COMPENDIUM_CATEGORIES.length}
						</p>
					</div>
					<div
						class="rounded-[1.35rem] border border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_26%,transparent)] px-4 py-3.5"
					>
						<p
							class="text-[0.64rem] font-medium tracking-[0.2em] text-[var(--color-text-muted)] uppercase"
						>
							Indexed Types
						</p>
						<p class="mt-1.5 text-[1.7rem] leading-none font-black text-[var(--color-text-primary)]">
							{indexedTypes}
						</p>
					</div>
				</div>
			</div>
		</section>

		<div class="grid items-start gap-5 xl:grid-cols-2 2xl:grid-cols-3">
			{#each COMPENDIUM_CATEGORIES as category (category.name)}
				{@const categoryTypes = category.types.filter(
					(t: string) => COMPENDIUM_TYPE_CONFIGS[t as keyof typeof COMPENDIUM_TYPE_CONFIGS]
				)}
				{#if categoryTypes.length > 0}
					<section
						class="group relative overflow-hidden rounded-[1.55rem] border border-[color-mix(in_srgb,var(--color-border)_86%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-card)_82%,transparent),color-mix(in_srgb,var(--color-bg-primary)_94%,transparent))] p-5 shadow-[0_0.9rem_2rem_color-mix(in_srgb,var(--color-shadow)_12%,transparent)] transition-transform duration-300 hover:-translate-y-0.5"
					>
						<div
							class="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-accent/8 blur-2xl"
						></div>
						<div class="relative">
							<div class="flex items-start justify-between gap-4">
								<div>
									<p
										class="text-[0.68rem] font-medium tracking-[0.22em] text-[color-mix(in_srgb,var(--color-text-primary)_52%,var(--color-text-muted))] uppercase"
									>
										Category
									</p>
									<h2 class="mt-2 text-xl font-bold text-[var(--color-text-primary)]">
										{category.name}
									</h2>
								</div>
								<div
									class="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)]/60 px-3 py-1 text-xs text-[var(--color-text-secondary)]"
								>
									{categoryTypes.length} shelves
								</div>
							</div>
							<p
								class="mt-2.5 text-sm leading-6 text-[color-mix(in_srgb,var(--color-text-primary)_68%,var(--color-text-secondary))]"
							>
								{category.description}
							</p>
							<div class="mt-4 space-y-2.5">
								{#each categoryTypes as type (type)}
									{@const config = COMPENDIUM_TYPE_CONFIGS[type]}
									{@const count = counts[type] ?? 0}
									<a
										href="/compendium/{type}"
										class="flex items-center justify-between gap-4 rounded-[1.4rem] border border-[color-mix(in_srgb,var(--color-border)_76%,transparent)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--color-bg-card)_64%,transparent),color-mix(in_srgb,var(--color-accent)_8%,var(--color-bg-primary)))] px-4 py-3.5 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_7%,transparent),0_0.8rem_1.5rem_color-mix(in_srgb,var(--color-shadow)_8%,transparent)] transition-all duration-300 hover:border-accent/35 hover:bg-[linear-gradient(145deg,color-mix(in_srgb,var(--color-bg-card)_78%,transparent),color-mix(in_srgb,var(--color-accent)_12%,var(--color-bg-primary)))]"
									>
										<div class="flex min-w-0 items-center gap-4">
											<span
												class="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-[color-mix(in_srgb,var(--color-border)_54%,var(--color-accent))] bg-[radial-gradient(circle_at_30%_28%,color-mix(in_srgb,var(--color-text-primary)_14%,transparent),transparent_32%),linear-gradient(155deg,color-mix(in_srgb,var(--color-accent)_18%,transparent),color-mix(in_srgb,var(--color-bg-card)_88%,transparent))] text-lg shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_12%,transparent),0_0.75rem_1.5rem_color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
											>
												<span
													class="absolute inset-[0.3rem] rounded-[0.8rem] border border-[color-mix(in_srgb,var(--color-text-primary)_10%,transparent)]"
												></span>
												<CompendiumTypeIcon
													{type}
													fallback={config.icon}
													class="relative h-7 w-7"
												/>
											</span>
											<div class="min-w-0">
												<p
													class="truncate text-base leading-tight font-semibold text-[var(--color-text-primary)]"
												>
													{config.plural}
												</p>
												<p
													class="truncate pt-1 text-[0.64rem] tracking-[0.18em] text-[color-mix(in_srgb,var(--color-text-primary)_46%,var(--color-text-muted))] uppercase"
												>
													{config.label} archive
												</p>
											</div>
										</div>
										<div class="text-right">
											<p
												class="text-[1.05rem] leading-none font-semibold text-[var(--color-text-primary)]"
											>
												{count.toLocaleString()}
											</p>
											<p
												class="pt-1 text-[0.64rem] tracking-[0.18em] text-[color-mix(in_srgb,var(--color-text-primary)_46%,var(--color-text-muted))] uppercase"
											>
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
