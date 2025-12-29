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

<div
	class="mb-6 grid grid-cols-3 gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
>
	<div class="text-center">
		<div class="text-xs font-bold text-[var(--color-text-muted)] uppercase">AC</div>
		<div class="text-xl font-bold text-[var(--color-text-primary)]">{acValue}</div>
		<div class="text-xs text-[var(--color-text-muted)]">{acType}</div>
	</div>
	<div class="border-l border-[var(--color-border)] text-center">
		<div class="text-xs font-bold text-[var(--color-text-muted)] uppercase">HP</div>
		<div class="text-xl font-bold text-[var(--color-accent)]">{hitPoints}</div>
		{#if hitDice}
			<div class="text-xs text-[var(--color-text-muted)]">{hitDice}</div>
		{/if}
	</div>
	<div class="border-l border-[var(--color-border)] text-center">
		<div class="text-xs font-bold text-[var(--color-text-muted)] uppercase">Speed</div>
		<div class="mt-1 text-sm font-medium text-[var(--color-text-primary)]">{speedText}</div>
	</div>
</div>
