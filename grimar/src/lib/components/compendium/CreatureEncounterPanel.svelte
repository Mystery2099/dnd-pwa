<script lang="ts">
	import type { Snippet } from 'svelte';
	import { isSpeedObject, formatSpeed } from '$lib/utils/compendium';

	type NamedDetailEntry = {
		key?: string;
		name?: string;
		desc?: string;
	};

	interface Props {
		itemData: Record<string, unknown>;
		abilityScores: Array<[string, number]>;
		actions: NamedDetailEntry[];
		traits: NamedDetailEntry[];
		markdownAt: (path: string) => string;
	}

	let { itemData, abilityScores, actions, traits, markdownAt }: Props = $props();

	function getAbilityAbbreviation(ability: string): string {
		return ability.slice(0, 3).toUpperCase();
	}

	function getAbilityModifier(score: number): string {
		const modifier = Math.floor((score - 10) / 2);
		return `${modifier >= 0 ? '+' : ''}${modifier}`;
	}
</script>

<div class="border-b border-[var(--color-border)] p-6">
	<div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/35 p-6">
		<div class="space-y-6">
			<div>
				<p class="text-xs font-medium tracking-[0.18em] text-[var(--color-text-muted)] uppercase">
					Encounter Reference
				</p>
			</div>

			{#if abilityScores.length > 0}
				<div>
					<h2
						class="mb-3 text-sm font-semibold tracking-[0.16em] text-[var(--color-text-muted)] uppercase"
					>
						Ability Scores
					</h2>
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
						{#each abilityScores as [ability, score] (ability)}
							<div
								class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 px-3 py-5 text-center"
							>
								<div
									class="text-[0.7rem] font-medium tracking-[0.18em] text-[var(--color-text-muted)] uppercase"
								>
									{getAbilityAbbreviation(ability)}
								</div>
								<div class="mt-2 text-3xl font-bold text-[var(--color-text-primary)]">
									{score}
								</div>
								<div class="mt-1 text-xs text-[var(--color-text-secondary)]">
									{getAbilityModifier(score)}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<div>
				<h2
					class="mb-3 text-sm font-semibold tracking-[0.16em] text-[var(--color-text-muted)] uppercase"
				>
					Combat Stats
				</h2>
				<div class="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
					<div
						class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 p-5"
					>
						<dt
							class="text-xs font-medium tracking-[0.18em] text-[var(--color-text-muted)] uppercase"
						>
							Armor Class
						</dt>
						<dd class="mt-3 text-4xl font-bold text-[var(--color-text-primary)]">
							{itemData.armor_class ? String(itemData.armor_class) : '—'}
						</dd>
						{#if itemData.armor_detail}
							<p class="mt-2 text-sm text-[var(--color-text-secondary)]">
								{String(itemData.armor_detail)}
							</p>
						{/if}
					</div>
					<div
						class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 p-5"
					>
						<dt
							class="text-xs font-medium tracking-[0.18em] text-[var(--color-text-muted)] uppercase"
						>
							Hit Points
						</dt>
						<dd class="mt-3 text-4xl font-bold text-[var(--color-text-primary)]">
							{itemData.hit_points ? String(itemData.hit_points) : '—'}
						</dd>
						{#if itemData.hit_dice}
							<p class="mt-2 text-sm text-[var(--color-text-secondary)]">
								{String(itemData.hit_dice)}
							</p>
						{/if}
					</div>
					<div
						class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 p-5"
					>
						<dt
							class="text-xs font-medium tracking-[0.18em] text-[var(--color-text-muted)] uppercase"
						>
							Speed
						</dt>
						<dd class="mt-3 text-sm leading-6 font-semibold text-[var(--color-text-primary)]">
							{#if isSpeedObject(itemData.speed_all)}
								{formatSpeed(itemData.speed_all)}
							{:else}
								—
							{/if}
						</dd>
					</div>
				</div>
			</div>

			<div class="columns-1 gap-5 xl:columns-2">
				{#if actions.length > 0}
					<div class="mb-5 break-inside-avoid-column">
						<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Actions</h2>
						<div class="space-y-4">
							{#each actions as action, index (`${action.key ?? action.name ?? 'action'}-${index}`)}
								<div
									class="break-inside-avoid rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 p-5"
								>
									<h3 class="font-semibold text-accent">{action.name || action.key}</h3>
									{#if action.desc}
										<div
											class="prose prose-invert prose-sm mt-2 max-w-none text-[var(--color-text-secondary)]"
										>
											<!-- eslint-disable-next-line svelte/no-at-html-tags -->
											{@html markdownAt(`actions.${index}.desc`)}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if traits.length > 0}
					<div class="mb-5 break-inside-avoid-column">
						<h2 class="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Traits</h2>
						<div class="space-y-4">
							{#each traits as trait, index (`${trait.key ?? trait.name ?? 'trait'}-${index}`)}
								<div
									class="break-inside-avoid rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/55 p-5"
								>
									<h3 class="font-semibold text-accent">{trait.name || trait.key}</h3>
									{#if trait.desc}
										<div
											class="prose prose-invert prose-sm mt-2 max-w-none text-[var(--color-text-secondary)]"
										>
											<!-- eslint-disable-next-line svelte/no-at-html-tags -->
											{@html markdownAt(`traits.${index}.desc`)}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
