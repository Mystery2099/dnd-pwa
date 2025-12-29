<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		monster: Record<string, unknown> & { externalId?: string };
	}

	let { monster }: Props = $props();

	// Helper to get ability modifier
	function getMod(stat: unknown): string {
		const numStat = typeof stat === 'number' ? stat : Number(stat) || 10;
		const mod = Math.floor((numStat - 10) / 2);
		return mod >= 0 ? `+${mod}` : String(mod);
	}

	// Safely access armor class
	const armorClass = $derived(
		monster.armor_class as number | { type: string; value: number }[] | undefined
	);
	const hitPoints = $derived(monster.hit_points as number);
	const hitDice = $derived(monster.hit_dice as string | undefined);
	const speed = $derived(monster.speed as Record<string, string> | undefined);
	const actions = $derived(monster.actions as Array<Record<string, unknown>> | undefined);
	const specialAbilities = $derived(
		monster.special_abilities as Array<Record<string, unknown>> | undefined
	);

	// Lazy load svelte-markdown only when needed
	let SvelteMarkdown: any = $state(null);
	let hasMarkdown = $derived(
		(actions?.some((a) => a.desc) ?? false) || (specialAbilities?.some((s) => s.desc) ?? false)
	);

	onMount(async () => {
		if (hasMarkdown) {
			const module = await import('svelte-markdown');
			SvelteMarkdown = module.default;
		}
	});
</script>

<!-- Monster Stats Header -->
<div class="mb-6 grid grid-cols-3 gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
	<div class="text-center">
		<div class="text-xs font-bold text-gray-500 uppercase">AC</div>
		<div class="text-xl font-bold text-white">
			{Array.isArray(armorClass) ? armorClass[0]?.value : armorClass}
		</div>
		<div class="text-xs text-gray-500">
			{Array.isArray(armorClass) ? armorClass[0]?.type : 'Natural'}
		</div>
	</div>
	<div class="border-l border-white/10 text-center">
		<div class="text-xs font-bold text-gray-500 uppercase">HP</div>
		<div class="text-xl font-bold text-emerald-400">{hitPoints}</div>
		{#if hitDice}
			<div class="text-xs text-gray-500">{hitDice}</div>
		{/if}
	</div>
	<div class="border-l border-white/10 text-center">
		<div class="text-xs font-bold text-gray-500 uppercase">Speed</div>
		<div class="mt-1 text-sm font-medium text-white">
			{speed
				? Object.entries(speed)
						.map(([k, v]) => `${k} ${v}`)
						.join(', ')
				: 'N/A'}
		</div>
	</div>
</div>

<!-- Ability Scores -->
<div class="mb-8 grid grid-cols-6 gap-2">
	{#each ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as stat (stat)}
		{@const value = monster[stat] as number}
		<div class="rounded-lg border border-white/5 bg-black/40 p-2 text-center">
			<div class="text-[10px] font-bold text-gray-500 uppercase">{stat.slice(0, 3)}</div>
			<div class="text-sm font-bold text-white">{value}</div>
			<div class="text-[10px] text-gray-400">{getMod(value)}</div>
		</div>
	{/each}
</div>

<!-- Actions -->
{#if actions}
	<h3 class="mb-4 border-b border-white/10 pb-2 font-bold text-white">Actions</h3>
	<div class="space-y-6">
		{#each actions as action (action.name)}
			<div>
				<div class="mb-1 flex items-center gap-2 text-lg font-bold text-white">
					{action.name}
					{#if action.attack_bonus}
						<span class="rounded bg-white/10 px-1.5 py-0.5 text-xs text-gray-300"
							>+{action.attack_bonus} to hit</span
						>
					{/if}
				</div>
				{#if action.desc && SvelteMarkdown}
					<div class="prose prose-sm max-w-none text-gray-300 prose-invert">
						<SvelteMarkdown source={action.desc as string} />
					</div>
				{/if}
				{#if action.damage}
					<div class="mt-1 font-mono text-xs text-red-300">
						Damage:
						{Array.isArray(action.damage)
							? action.damage.map((d: Record<string, unknown>) => d.damage_dice).join(' + ')
							: action.damage}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

{#if specialAbilities}
	<h3 class="mt-8 mb-4 border-b border-white/10 pb-2 font-bold text-white">Traits</h3>
	<div class="space-y-4">
		{#each specialAbilities as trait (trait.name)}
			<div>
				<div class="mb-1 font-bold text-white">{trait.name}</div>
				{#if trait.desc && SvelteMarkdown}
					<div class="prose prose-sm max-w-none text-gray-300 prose-invert">
						<SvelteMarkdown source={trait.desc as string} />
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<div class="mt-8 font-mono text-xs text-gray-600">
	ID: {monster.externalId ?? monster.id}
</div>
