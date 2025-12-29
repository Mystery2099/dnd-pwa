<script lang="ts">
	interface Props {
		armorClass: number | { type: string; value: number }[];
		hitPoints: number;
		hitDice?: string;
		speed?: Record<string, string>;
	}

	let { armorClass, hitPoints, hitDice, speed }: Props = $props();

	const acValue = $derived(Array.isArray(armorClass) ? armorClass[0]?.value : armorClass);
	const acType = $derived(Array.isArray(armorClass) ? armorClass[0]?.type : 'Natural');
	const speedText = $derived(
		speed
			? Object.entries(speed)
					.map(([k, v]) => `${k} ${v}`)
					.join(', ')
			: 'N/A'
	);
</script>

<div class="mb-6 grid grid-cols-3 gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
	<div class="text-center">
		<div class="text-xs font-bold text-gray-500 uppercase">AC</div>
		<div class="text-xl font-bold text-white">{acValue}</div>
		<div class="text-xs text-gray-500">{acType}</div>
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
		<div class="mt-1 text-sm font-medium text-white">{speedText}</div>
	</div>
</div>
