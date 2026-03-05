<script lang="ts">
	import { browser } from '$app/environment';
	import { debugFlagsStore } from '$lib/core/client/debug-flags';

	let expanded = $state(false);
	let showVirtualDebug = $state(true);
	let showPerfPanel = $state(true);

	$effect(() => {
		if (!browser) return;
		return debugFlagsStore.subscribe((state) => {
			showVirtualDebug = state.showVirtualDebug;
			showPerfPanel = state.showPerfPanel;
		});
	});
</script>

{#if import.meta.env.DEV}
	<div class="fixed top-20 right-4 z-50 text-xs">
		<button
			type="button"
			class="rounded border border-cyan-400/40 bg-black/80 px-2 py-1 font-mono text-cyan-200 backdrop-blur-sm"
			onclick={() => {
				expanded = !expanded;
			}}
		>
			Debug UI {expanded ? '−' : '+'}
		</button>

		{#if expanded}
			<div class="mt-2 w-56 rounded border border-cyan-400/30 bg-black/85 p-2 font-mono text-cyan-100 backdrop-blur-sm">
				<label class="flex items-center justify-between py-1">
					<span>Virtual Debug</span>
					<input
						type="checkbox"
						checked={showVirtualDebug}
						onchange={() => debugFlagsStore.toggle('showVirtualDebug')}
					/>
				</label>
				<label class="flex items-center justify-between py-1">
					<span>Perf Panel</span>
					<input
						type="checkbox"
						checked={showPerfPanel}
						onchange={() => debugFlagsStore.toggle('showPerfPanel')}
					/>
				</label>
				<button
					type="button"
					class="mt-2 w-full rounded border border-cyan-400/40 px-2 py-1 text-cyan-200"
					onclick={() => debugFlagsStore.reset()}
				>
					Reset Defaults
				</button>
			</div>
		{/if}
	</div>
{/if}
