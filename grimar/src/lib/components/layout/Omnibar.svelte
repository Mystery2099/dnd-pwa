<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		placeholder?: string;
	};

	let { placeholder = 'Search spells, items, characters…' }: Props = $props();

	let inputEl: HTMLInputElement | null = null;

	onMount(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const isMac = navigator.platform.toLowerCase().includes('mac');
			const isCmdK = isMac && e.metaKey && e.key.toLowerCase() === 'k';
			const isCtrlK = !isMac && e.ctrlKey && e.key.toLowerCase() === 'k';

			if (isCmdK || isCtrlK) {
				e.preventDefault();
				inputEl?.focus();
				inputEl?.select();
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});
</script>

<div class="relative w-full">
	<!-- Inset Input: Concave glass effect -->
	<input
		bind:this={inputEl}
		type="search"
		{placeholder}
		class="h-10 w-full rounded-full border-t border-b border-black/60 border-white/10 bg-black/40 px-4 pr-12 pl-4 text-sm text-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-all placeholder:text-gray-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
	/>
	<div
		class="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-1 rounded border border-white/5 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 lg:flex"
	>
		<span>⌘</span>
		<span>K</span>
	</div>
</div>
