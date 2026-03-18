<script lang="ts">
	import CompendiumAccordionSection from './CompendiumAccordionSection.svelte';
	import type { CompendiumCreatureSetRosterEntry } from '$lib/core/types/compendium';

	interface Props {
		creatures: CompendiumCreatureSetRosterEntry[];
	}

	let { creatures }: Props = $props();

	let creatureCount = $derived(creatures.length);
	let creatureTypes = $derived(
		Array.from(new Set(creatures.map((creature) => creature.type).filter(Boolean))).join(' · ')
	);
	let challengeBand = $derived(
		Array.from(
			new Set(creatures.map((creature) => creature.challengeRatingText).filter(Boolean))
		).join(' · ')
	);
</script>

{#if creatures.length > 0}
	<CompendiumAccordionSection
		title="Roster"
		description="Every creature bundled into this set, with quick combat-facing reference."
		open={true}
		value="creature-set-roster"
	>
		<div class="space-y-5">
			<div class="grid gap-3 md:grid-cols-3">
				<div
					class="rounded-[1.4rem] border border-[var(--color-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--color-accent)_14%,transparent),color-mix(in_srgb,var(--color-bg-card)_88%,transparent))] px-4 py-4 shadow-[0_1rem_2rem_color-mix(in_srgb,var(--color-shadow)_14%,transparent)]"
				>
					<p
						class="text-[0.68rem] font-medium tracking-[0.2em] text-[var(--color-text-muted)] uppercase"
					>
						Creature Count
					</p>
					<p class="mt-2 text-2xl font-black text-[var(--color-text-primary)]">
						{creatureCount}
					</p>
				</div>

				<div
					class="rounded-[1.4rem] border border-[var(--color-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--color-bg-card)_92%,transparent),color-mix(in_srgb,var(--color-accent)_8%,transparent))] px-4 py-4 shadow-[0_1rem_2rem_color-mix(in_srgb,var(--color-shadow)_10%,transparent)]"
				>
					<p
						class="text-[0.68rem] font-medium tracking-[0.2em] text-[var(--color-text-muted)] uppercase"
					>
						Type Spread
					</p>
					<p class="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
						{creatureTypes || 'Mixed'}
					</p>
				</div>

				<div
					class="rounded-[1.4rem] border border-[var(--color-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--color-bg-card)_90%,transparent),color-mix(in_srgb,var(--color-accent)_10%,transparent))] px-4 py-4 shadow-[0_1rem_2rem_color-mix(in_srgb,var(--color-shadow)_10%,transparent)]"
				>
					<p
						class="text-[0.68rem] font-medium tracking-[0.2em] text-[var(--color-text-muted)] uppercase"
					>
						Challenge Band
					</p>
					<p class="mt-2 text-sm leading-6 text-[var(--color-text-primary)]">
						{challengeBand || 'Varied'}
					</p>
				</div>
			</div>

			<div class="grid gap-4 lg:grid-cols-2">
				{#each creatures as creature (creature.key)}
					<a
						href={creature.href}
						class="group relative overflow-hidden rounded-[1.5rem] border border-[color-mix(in_srgb,var(--color-border)_80%,var(--color-accent))] bg-[linear-gradient(155deg,color-mix(in_srgb,var(--color-bg-card)_88%,transparent),color-mix(in_srgb,var(--color-accent)_9%,transparent),color-mix(in_srgb,var(--color-bg-primary)_92%,transparent))] p-5 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_1.2rem_2.4rem_color-mix(in_srgb,var(--color-shadow)_12%,transparent)] transition-transform duration-300 hover:-translate-y-1 hover:border-accent/45"
					>
						<div
							class="absolute top-0 right-0 h-24 w-24 rounded-full bg-accent/10 blur-2xl transition-opacity duration-300 group-hover:opacity-90"
						></div>
						<div class="relative">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div class="min-w-0">
									<p class="text-xl font-bold text-[var(--color-text-primary)]">
										{creature.label}
									</p>
									<div class="mt-2 flex flex-wrap gap-2">
										{#if creature.size}
											<span
												class="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/60 px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.14em] text-[var(--color-text-secondary)] uppercase"
											>
												{creature.size}
											</span>
										{/if}
										{#if creature.type}
											<span
												class="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.14em] text-accent uppercase"
											>
												{creature.type}
											</span>
										{/if}
										{#if creature.challengeRatingText}
											<span
												class="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/60 px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.14em] text-[var(--color-text-secondary)] uppercase"
											>
												CR {creature.challengeRatingText}
											</span>
										{/if}
									</div>
								</div>
								<div
									class="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)]/65 px-3 py-1 text-[0.7rem] tracking-[0.16em] text-[var(--color-text-muted)] uppercase"
								>
									View
								</div>
							</div>

							<div class="mt-5 grid gap-3 sm:grid-cols-3">
								<div
									class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 px-3 py-3"
								>
									<p
										class="text-[0.68rem] tracking-[0.16em] text-[var(--color-text-muted)] uppercase"
									>
										Armor
									</p>
									<p class="mt-1 text-base font-semibold text-[var(--color-text-primary)]">
										{creature.armorClass ?? '—'}
									</p>
								</div>
								<div
									class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 px-3 py-3"
								>
									<p
										class="text-[0.68rem] tracking-[0.16em] text-[var(--color-text-muted)] uppercase"
									>
										Hit Points
									</p>
									<p class="mt-1 text-base font-semibold text-[var(--color-text-primary)]">
										{creature.hitPoints ?? '—'}
									</p>
								</div>
								<div
									class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 px-3 py-3"
								>
									<p
										class="text-[0.68rem] tracking-[0.16em] text-[var(--color-text-muted)] uppercase"
									>
										Speed
									</p>
									<p class="mt-1 text-base font-semibold text-[var(--color-text-primary)]">
										{creature.speed ?? '—'}
									</p>
								</div>
							</div>

							<div
								class="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]"
							>
								{#if creature.documentLabel}
									<span>{creature.documentLabel}</span>
								{/if}
								{#if creature.environments.length > 0}
									<span class="text-[var(--color-text-muted)]">•</span>
									<span>{creature.environments.slice(0, 3).join(', ')}</span>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</CompendiumAccordionSection>
{/if}
