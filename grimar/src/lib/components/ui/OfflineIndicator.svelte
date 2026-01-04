<script lang="ts">
	import { Wifi, WifiOff, Database, RefreshCw } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import { offlineStore, formatLastOnline } from '$lib/core/client/offline-store';
	import { queryClient } from '$lib/core/client/query-client';

	interface Props {
		showDetails?: boolean;
	}

	let { showDetails = false }: Props = $props();

	// State for offline indicator
	let isOnline = $state(true);
	let lastOnline = $state<number | null>(null);
	let pendingSync = $state(0);

	// Initialize from store
	$effect(() => {
		if (!browser) return;

		const unsubscribe = offlineStore.subscribe((state) => {
			isOnline = state.isOnline;
			lastOnline = state.lastOnline;
			pendingSync = state.pendingSync;
		});

		return unsubscribe;
	});

	/**
	 * Trigger a manual sync when online.
	 */
	async function handleSync() {
		if (!browser || !isOnline || !queryClient) return;

		try {
			await queryClient.invalidateQueries();
		} catch (error) {
			console.error('[OfflineIndicator] Sync failed:', error);
		}
	}
</script>

{#if showDetails}
	<!-- Detailed offline status panel -->
	<div
		class="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 backdrop-blur-sm"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				{#if isOnline}
					<Wifi class="h-4 w-4 text-green-400" />
					<span class="text-sm font-medium text-green-400">Online</span>
				{:else}
					<WifiOff class="h-4 w-4 text-red-400" />
					<span class="text-sm font-medium text-red-400">Offline</span>
				{/if}
			</div>

			{#if isOnline && queryClient}
				<button
					class="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
					onclick={handleSync}
				>
					<RefreshCw class="h-3 w-3" />
					Sync
				</button>
			{/if}
		</div>

		<div class="space-y-1 text-xs text-[var(--color-text-secondary)]">
			{#if isOnline}
				<p>Connected to server. All features available.</p>
				{#if lastOnline}
					<p class="text-[var(--color-text-muted)]">
						Last online: {formatLastOnline(lastOnline)}
					</p>
				{/if}
			{:else}
				<p>Offline mode active.</p>
				<div class="mt-2 flex items-center gap-1 text-[var(--color-text-muted)]">
					<Database class="h-3 w-3" />
					<span>Viewing cached data</span>
				</div>
				{#if pendingSync > 0}
					<p class="mt-1 text-amber-400">
						{pendingSync} pending sync operation{pendingSync > 1 ? 's' : ''}
					</p>
				{/if}
			{/if}
		</div>
	</div>
{:else}
	<!-- Compact offline indicator -->
	<div
		class="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2 py-1 backdrop-blur-sm"
	>
		{#if isOnline}
			<Wifi class="h-3 w-3 text-green-400" />
		{:else}
			<WifiOff class="h-3 w-3 text-red-400" />
		{/if}

		<span class="text-xs text-[var(--color-text-muted)]">
			{isOnline ? 'Online' : 'Offline'}
		</span>

		{#if !isOnline && pendingSync > 0}
			<span class="text-xs text-amber-400">
				({pendingSync})
			</span>
		{/if}
	</div>
{/if}
