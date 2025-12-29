<script lang="ts">
	import CharacterCard from './CharacterCard.svelte';

	let { characters } = $props();
</script>

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
	{#each characters as char (char.id)}
		<CharacterCard character={char} />
	{/each}
</div>
