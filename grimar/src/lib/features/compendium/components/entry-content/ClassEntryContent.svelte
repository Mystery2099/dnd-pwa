<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		details: Record<string, unknown>;
	}

	let { details }: Props = $props();

	const desc = details.desc as string[] | string | undefined;
	const descriptionMd = $derived(Array.isArray(desc) ? desc.join('\n\n') : desc || '');

	interface Proficiency {
		name?: string;
	}

	interface Feature {
		name?: string;
		level?: number;
		desc?: string;
	}

	const profArmor = details.prof_armor as string | undefined;
	const profWeapons = details.prof_weapons as string | undefined;
	const profTools = (details.prof_tools as string | string[] | undefined) ?? [];
	const profSkills = (details.prof_skills as Proficiency[] | string[] | undefined) ?? [];
	const profSaves = (details.prof_saving_throws as string[] | undefined) ?? [];

	const features = details.features as Feature[] | undefined;
	const spellcasting = details.spellcasting as
		| { ability?: string; dc?: number; attack_modifier?: number }
		| undefined;

	let SvelteMarkdown: any = $state(null);

	onMount(async () => {
		if (descriptionMd) {
			const module = await import('svelte-markdown');
			SvelteMarkdown = module.default;
		}
	});
</script>

<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
	<div
		class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-center"
	>
		<div class="text-xs font-bold text-[var(--color-text-muted)] uppercase">Hit Die</div>
		<div class="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">
			d{details.hit_dice ?? 8}
		</div>
	</div>

	<div
		class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 md:col-span-2"
	>
		<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
			Proficiencies
		</div>
		<div class="flex flex-wrap gap-2 pt-1">
			{#if profArmor}
				<span
					class="rounded bg-[var(--color-bg-card)] px-2 py-0.5 text-xs text-[var(--color-text-primary)]"
					>{profArmor}</span
				>
			{/if}
			{#if profWeapons}
				<span
					class="rounded bg-[var(--color-bg-card)] px-2 py-0.5 text-xs text-[var(--color-text-primary)]"
					>{profWeapons}</span
				>
			{/if}
			{#if Array.isArray(profTools)}
				{#each profTools as tool (tool)}
					<span
						class="rounded bg-[var(--color-bg-card)] px-2 py-0.5 text-xs text-[var(--color-text-primary)]"
						>{tool}</span
					>
				{/each}
			{/if}
			{#if Array.isArray(profSkills)}
				{#each profSkills as skill (typeof skill === 'string' ? skill : skill.name ?? 'unknown')}
					<span
						class="rounded bg-[var(--color-bg-card)] px-2 py-0.5 text-xs text-[var(--color-text-primary)]"
						>{typeof skill === 'string' ? skill : skill.name}</span
					>
				{/each}
			{/if}
		</div>
		{#if profSaves.length > 0}
			<div class="mt-3 flex items-center gap-2">
				<span class="text-xs font-bold text-[var(--color-text-muted)] uppercase">Saves:</span>
				{#each profSaves as save (save)}
					<span class="text-xs font-medium text-[var(--color-accent)]">{save}</span>
				{/each}
			</div>
		{/if}
	</div>
</div>

{#if spellcasting}
	<div
		class="mb-8 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-4"
	>
		<div class="mb-2 flex items-center gap-2">
			<span class="text-xs font-bold text-[var(--color-accent)] uppercase">Spellcasting</span>
		</div>
		<div class="text-sm text-[var(--color-text-secondary)]">
			Uses <span class="font-bold text-[var(--color-text-primary)]"
				>{spellcasting.ability ?? 'Unknown'}</span
			>
			as spellcasting ability. DC
			<span class="font-bold text-[var(--color-text-primary)]">{spellcasting.dc ?? 0}</span
			>, Modifier
			<span class="font-bold text-[var(--color-text-primary)]"
				>+{spellcasting.attack_modifier ?? 0}</span
			>.
		</div>
	</div>
{/if}

{#if features && features.length > 0}
	<div class="mb-8">
		<h3 class="mb-4 font-bold text-[var(--color-text-primary)]">Class Features</h3>
		<div class="space-y-4">
			{#each features as feature, i (i)}
				<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
					<div class="mb-1 flex items-center justify-between">
						<span class="font-bold text-[var(--color-text-primary)]">{feature.name ?? 'Unknown'}</span>
						<span class="text-xs text-[var(--color-text-muted)]">Level {feature.level ?? 1}</span>
					</div>
					{#if feature.desc}
						<div class="text-sm text-[var(--color-text-secondary)]">{feature.desc}</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

{#if descriptionMd && SvelteMarkdown}
	<div class="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)]">
		<SvelteMarkdown source={descriptionMd} />
	</div>
{:else if descriptionMd}
	<div class="text-sm whitespace-pre-wrap text-[var(--color-text-secondary)]">
		{descriptionMd}
	</div>
{/if}


