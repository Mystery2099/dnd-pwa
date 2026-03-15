<script lang="ts">
	import CompendiumAccordionSection from './CompendiumAccordionSection.svelte';

	type LinkedLabel = {
		name?: string;
		key?: string;
	};

	type CreatureSetEntry = {
		key?: string;
		name?: string;
		type?: LinkedLabel | string;
		size?: LinkedLabel | string;
		document?: {
			name?: string;
			display_name?: string;
		};
		environments?: LinkedLabel[];
		challenge_rating_text?: string;
		armor_class?: number;
		hit_points?: number;
		speed?: {
			walk?: number;
			unit?: string;
		};
	};

	interface Props {
		creatures: CreatureSetEntry[];
	}

	let { creatures }: Props = $props();

	function getLinkedLabel(value: LinkedLabel | string | undefined): string | null {
		if (!value) return null;
		if (typeof value === 'string') return value.trim() || null;
		return value.name?.trim() || value.key?.trim() || null;
	}

	function getDocumentLabel(creature: CreatureSetEntry): string | null {
		return creature.document?.display_name?.trim() || creature.document?.name?.trim() || null;
	}

	function getSpeedLabel(creature: CreatureSetEntry): string | null {
		const walk = creature.speed?.walk;
		if (typeof walk !== 'number') return null;
		return `${walk} ${creature.speed?.unit ?? 'ft'}`;
	}

	function getEnvironmentPreview(creature: CreatureSetEntry): string[] {
		return (creature.environments ?? [])
			.map((environment) => environment.name?.trim() || environment.key?.trim() || '')
			.filter(Boolean)
			.slice(0, 3);
	}

	let creatureCount = $derived(creatures.length);
	let creatureTypes = $derived(
		Array.from(
			new Set(creatures.map((creature) => getLinkedLabel(creature.type)).filter(Boolean))
		).join(' · ')
	);
	let challengeBand = $derived(
		Array.from(
			new Set(creatures.map((creature) => creature.challenge_rating_text?.trim()).filter(Boolean))
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
				{#each creatures as creature (creature.key ?? creature.name)}
					<a
						href={creature.key ? `/compendium/creatures/${creature.key}` : undefined}
						class="group relative overflow-hidden rounded-[1.5rem] border border-[color-mix(in_srgb,var(--color-border)_80%,var(--color-accent))] bg-[linear-gradient(155deg,color-mix(in_srgb,var(--color-bg-card)_88%,transparent),color-mix(in_srgb,var(--color-accent)_9%,transparent),color-mix(in_srgb,var(--color-bg-primary)_92%,transparent))] p-5 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_1.2rem_2.4rem_color-mix(in_srgb,var(--color-shadow)_12%,transparent)] transition-transform duration-300 hover:-translate-y-1 hover:border-accent/45"
					>
						<div
							class="absolute top-0 right-0 h-24 w-24 rounded-full bg-accent/10 blur-2xl transition-opacity duration-300 group-hover:opacity-90"
						></div>
						<div class="relative">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div class="min-w-0">
									<p class="text-xl font-bold text-[var(--color-text-primary)]">
										{creature.name ?? 'Unnamed Creature'}
									</p>
									<div class="mt-2 flex flex-wrap gap-2">
										{#if getLinkedLabel(creature.size)}
											<span
												class="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/60 px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.14em] text-[var(--color-text-secondary)] uppercase"
											>
												{getLinkedLabel(creature.size)}
											</span>
										{/if}
										{#if getLinkedLabel(creature.type)}
											<span
												class="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.14em] text-accent uppercase"
											>
												{getLinkedLabel(creature.type)}
											</span>
										{/if}
										{#if creature.challenge_rating_text}
											<span
												class="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/60 px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.14em] text-[var(--color-text-secondary)] uppercase"
											>
												CR {creature.challenge_rating_text}
											</span>
										{/if}
									</div>
								</div>
								{#if creature.key}
									<div
										class="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)]/65 px-3 py-1 text-[0.7rem] tracking-[0.16em] text-[var(--color-text-muted)] uppercase"
									>
										View
									</div>
								{/if}
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
										{creature.armor_class ?? '—'}
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
										{creature.hit_points ?? '—'}
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
										{getSpeedLabel(creature) ?? '—'}
									</p>
								</div>
							</div>

							<div
								class="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]"
							>
								{#if getDocumentLabel(creature)}
									<span>{getDocumentLabel(creature)}</span>
								{/if}
								{#if getEnvironmentPreview(creature).length > 0}
									<span class="text-[var(--color-text-muted)]">•</span>
									<span>{getEnvironmentPreview(creature).join(', ')}</span>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</CompendiumAccordionSection>
{/if}
