<script lang="ts">
	interface Props {
		message?: string;
		subtext?: string;
		accentColor?: string; // e.g. "border-t-purple-400"
	}

	let {
		message = 'Loading...',
		subtext = 'Fetching data',
		accentColor = 'border-t-purple-400'
	}: Props = $props();
</script>

<div class="absolute inset-0 z-30 flex items-center justify-center bg-gray-700/80 backdrop-blur-sm">
	<div
		class="card-crystal flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-gray-800/60 p-6 text-gray-200 shadow-xl"
	>
		<div
			class={`h-10 w-10 animate-spin rounded-full border-2 border-white/20 ${accentColor}`}
		></div>
		<div class="text-sm font-semibold tracking-wide text-gray-300 uppercase">
			{message}
		</div>
		<div class="text-xs text-gray-400">{subtext}</div>
	</div>
</div>
