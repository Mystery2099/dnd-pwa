<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		details: Record<string, unknown>;
	}

	let { details }: Props = $props();

	const desc = details.desc as string[] | string | undefined;
	const descriptionMd = $derived(
		Array.isArray(desc) ? desc.join('\n\n') : desc || (details.summary as string) || ''
	);

	let SvelteMarkdown: any = $state(null);

	onMount(async () => {
		if (descriptionMd) {
			const module = await import('svelte-markdown');
			SvelteMarkdown = module.default;
		}
	});

	const isWeapon = details.weapon_category !== undefined;
	const isArmor = details.armor_category !== undefined;
</script>

<div class="mb-8 flex flex-wrap gap-4">
	<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2">
		<div class="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Type</div>
		<div class="text-sm text-[var(--color-text-primary)]">
			{isWeapon ? details.weapon_category : isArmor ? details.armor_category : details.equipment_category ?? 'Unknown'}
		</div>
	</div>

	{#if details.rarity}
		<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2">
			<div class="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Rarity</div>
			<div class="text-sm font-medium text-[var(--color-gem-sapphire)]">{details.rarity}</div>
		</div>
	{/if}

	{#if details.weight}
		<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2">
			<div class="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Weight</div>
			<div class="text-sm text-[var(--color-text-primary)]">{details.weight} lbs</div>
		</div>
	{/if}

	{#if details.cost}
		<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-2">
			<div class="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Value</div>
			<div class="text-sm text-[var(--color-text-primary)]">{details.cost}</div>
		</div>
	{/if}

	{#if details.requires_attunement}
		<div class="rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-4 py-2">
			<div class="text-[10px] font-bold text-[var(--color-accent)] uppercase">Attunement</div>
			<div class="text-sm text-[var(--color-accent)]">Required</div>
		</div>
	{/if}
</div>

{#if isWeapon}
	<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
		<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
			<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Damage</div>
			<div class="text-lg font-bold text-[var(--color-text-primary)]">
				{details.damage_dice ?? 'Unknown'} {details.damage_type ?? ''}
			</div>
		</div>
		{#if details.range}
			<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
				<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Range</div>
				<div class="text-lg font-bold text-[var(--color-text-primary)]">
					{typeof details.range === 'object' && details.range !== null
						? `${(details.range as { normal?: number }).normal ?? 0}ft${(details.range as { long?: number }).long ? ` / ${(details.range as { long?: number }).long}ft` : ''}`
						: `${details.range}ft`}
				</div>
			</div>
		{/if}
		{#if details.properties && Array.isArray(details.properties) && details.properties.length > 0}
			<div class="col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
				<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
					Properties
				</div>
				<div class="flex flex-wrap gap-2">
					{#each details.properties as prop (prop)}
						<span
							class="rounded bg-[var(--color-bg-card)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
							>{prop}</span
						>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{:else if isArmor}
	<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
		<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
			<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Armor Class</div>
			<div class="text-lg font-bold text-[var(--color-text-primary)]">{details.armor_class ?? 'Unknown'}</div>
		</div>
		{#if details.str_minimum}
			<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
				<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">
					Str Required
				</div>
				<div class="text-lg font-bold text-[var(--color-text-primary)]">
					{details.str_minimum}
				</div>
			</div>
		{/if}
		<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
			<div class="mb-1 text-xs font-bold text-[var(--color-text-muted)] uppercase">Stealth</div>
			<div class="text-sm font-medium text-[var(--color-text-primary)]">
				{details.stealth_disadvantage ? 'Disadvantage' : 'Normal'}
			</div>
		</div>
	</div>
{/if}

{#if descriptionMd && SvelteMarkdown}
	<div class="prose prose-sm max-w-none text-[var(--color-text-secondary)] prose-invert">
		<SvelteMarkdown source={descriptionMd} />
	</div>
{:else if descriptionMd}
	<div class="text-sm whitespace-pre-wrap text-[var(--color-text-secondary)]">
		{descriptionMd}
	</div>
{/if}

<div class="mt-8 font-mono text-xs text-[var(--color-text-muted)]">
	ID: {details.slug ?? details.id ?? 'Unknown'}
</div>
