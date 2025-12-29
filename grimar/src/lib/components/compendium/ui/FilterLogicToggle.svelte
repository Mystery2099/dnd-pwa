<script lang="ts">
	interface Props {
		logic: 'and' | 'or';
		onToggle: () => void;
	}

	let { logic, onToggle }: Props = $props();
</script>

<div class="px-4 py-2">
	<button
		onclick={onToggle}
		class="group flex w-full items-center justify-between rounded-md border border-white/10 bg-linear-to-br from-white/10 to-white/5 px-3 py-2 text-xs font-bold tracking-wider text-gray-400 uppercase transition-all hover:from-white/15 hover:to-white/8"
	>
		<span class="transition-colors group-hover:text-gray-300">Filter Logic</span>
		<span class={logic === 'and' ? 'text-purple-400' : 'text-blue-400'}>
			{logic.toUpperCase()}
		</span>
	</button>
</div>
