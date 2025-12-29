<script lang="ts">
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';

	interface CharacterStats {
		// Define character stat fields based on your character model
		[key: string]: unknown;
	}

	interface Props {
		character: {
			id: number;
			name: string;
			portraitUrl: string | null;
			stats: CharacterStats;
		};
	}

	let { character }: Props = $props();
</script>

<SurfaceCard
	href="/characters/{character.id}"
	class="group aspect-3/4 hover:scale-[1.02] hover:border-purple-400/50 hover:shadow-[0_0_25px_rgba(139,92,246,0.25)]"
>
	<!-- Static Glossy Overlay -->
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-1/2
	 bg-linear-to-br from-white/15 to-transparent opacity-60 transition-opacity group-hover:opacity-80"
	></div>

	<!-- Portrait Background -->
	{#if character.portraitUrl}
		<img
			src={character.portraitUrl}
			alt={character.name}
			class="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-80"
		/>
	{:else}
		<div class="absolute inset-0 bg-linear-to-br from-indigo-900 to-purple-900 opacity-50"></div>
		<div class="absolute inset-0 flex items-center justify-center text-white/20">
			<!-- Placeholder Icon -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="64"
				height="64"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-user"
				><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle
					cx="12"
					cy="7"
					r="4"
				/></svg
			>
		</div>
	{/if}

	<!-- Content Overlay -->
	<div
		class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/60 to-transparent p-4 pt-12"
	>
		<h3 class="text-holo truncate text-xl leading-tight font-bold text-white">
			{character.name}
		</h3>
		<p class="mt-1 text-sm font-medium text-gray-300">
			Level {character.stats?.level || 1}
			{character.stats?.class || 'Traveler'}
		</p>
	</div>
</SurfaceCard>
