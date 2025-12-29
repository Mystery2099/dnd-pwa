<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';

	interface Props {
		title?: string;
		message: string;
	}

	let { title = 'Error loading content', message }: Props = $props();
</script>

<div class="flex h-full items-center justify-center p-8">
	<SurfaceCard
		class="max-w-md border-red-500/20 bg-gray-800/60 p-6 text-center shadow-[0_0_20px_rgba(239,68,68,0.15)]"
	>
		<div class="mb-3 flex justify-center">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30"
			>
				<svg
					class="size-6 text-red-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
			</div>
		</div>
		<p class="mb-2 font-bold text-red-400">{title}</p>
		<p class="text-sm text-gray-400">{message}</p>
	</SurfaceCard>
</div>
