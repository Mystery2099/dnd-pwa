<script lang="ts">
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import type { QueryClient } from '@tanstack/svelte-query';

	interface Props {
		client: QueryClient;
		children: Snippet;
	}

	let { client, children }: Props = $props();
</script>

{#if browser}
	<QueryClientProvider {client}>
		{@render children()}
	</QueryClientProvider>
{:else}
	{@render children()}
{/if}
