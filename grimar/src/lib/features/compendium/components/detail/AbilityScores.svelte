<script lang="ts">
	interface Props {
		scores: {
			strength: number;
			dexterity: number;
			constitution: number;
			intelligence: number;
			wisdom: number;
			charisma: number;
		};
	}

	let { scores }: Props = $props();

	const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

	function getMod(stat: number): string {
		const mod = Math.floor((stat - 10) / 2);
		return mod >= 0 ? `+${mod}` : String(mod);
	}
</script>

<div class="grid grid-cols-6 gap-2">
	{#each abilities as stat (stat)}
		{@const value = scores[stat as keyof typeof scores]}
		<div class="rounded-lg border border-white/5 bg-black/40 p-2 text-center">
			<div class="text-[10px] font-bold text-gray-500 uppercase">{stat.slice(0, 3)}</div>
			<div class="text-sm font-bold text-white">{value}</div>
			<div class="text-[10px] text-gray-400">{getMod(value)}</div>
		</div>
	{/each}
</div>
