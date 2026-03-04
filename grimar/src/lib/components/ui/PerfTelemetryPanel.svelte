<script lang="ts">
	import { browser } from '$app/environment';
	import { perfTelemetryStore } from '$lib/core/client/perf-telemetry';

	type PerfSummary = ReturnType<typeof perfTelemetryStore.getSummaries>[number];

	let summaries = $state<PerfSummary[]>([]);
	let totalSamples = $state(0);

	$effect(() => {
		if (!browser) return;
		return perfTelemetryStore.subscribe((state) => {
			totalSamples = state.samples.length;
			summaries = perfTelemetryStore.getSummaries(6);
		});
	});
</script>

{#if import.meta.env.DEV && totalSamples > 0}
	<div
		class="pointer-events-none fixed bottom-4 left-4 z-50 w-[360px] rounded-lg border border-cyan-400/40 bg-black/80 p-3 font-mono text-xs text-cyan-200 shadow-lg backdrop-blur-md"
	>
		<div class="mb-2 flex items-center justify-between">
			<span class="font-semibold text-cyan-300">API Perf</span>
			<span class="text-[10px] text-cyan-400/80">{totalSamples} samples</span>
		</div>
		<div class="space-y-1.5">
			{#each summaries as summary (summary.endpoint)}
				<div class="rounded border border-cyan-400/20 bg-cyan-950/20 px-2 py-1">
					<div class="truncate text-[10px] text-cyan-100/90">{summary.endpoint}</div>
					<div class="mt-1 flex gap-2 text-[10px] text-cyan-300/85">
						<span>avg {summary.avgMs}ms</span>
						<span>p95 {summary.p95Ms}ms</span>
						<span>last {summary.lastMs}ms</span>
						<span>n {summary.count}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
