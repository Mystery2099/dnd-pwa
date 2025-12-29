<script lang="ts">
	import { Wifi, WifiOff, RefreshCw, Database, Clock } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { offlineStore, formatBytes } from '$lib/core/client/offline-store-ui';

	interface Props {
		showDetails?: boolean;
	}

	let { showDetails = false }: Props = $props();

	// Reactive state from store
	let isOnline = $state(true);
	let available = $state(false);
	let seeding = $state(false);
	let lastSync = $state<number | null>(null);
	let stats = $state({ spells: 0, monsters: 0, items: 0 });
	let storage = $state<{ usage: number; quota: number; percent: number } | null>(null);

	let isSyncingLocal = $state(false);

	onMount(() => {
		// Subscribe to store manually
		const unsubscribe = offlineStore.subscribe((state) => {
			isOnline = state.online;
			available = state.available;
			seeding = state.seeding;
			lastSync = state.lastSync;
			stats = state.stats;
			storage = state.storage;
		});

		return () => {
			unsubscribe();
			offlineStore.destroy();
		};
	});

	async function handleSync() {
		isSyncingLocal = true;
		try {
			await offlineStore.seed(true);
		} finally {
			isSyncingLocal = false;
		}
	}

	function formatLastSync(timestamp: number | null): string {
		if (!timestamp) return 'Never';

		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		return 'Just now';
	}
</script>

{#if showDetails}
	<!-- Detailed offline status panel -->
	<div
		class="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
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

			{#if isSyncingLocal || seeding}
				<div class="flex items-center gap-2">
					<RefreshCw class="h-4 w-4 animate-spin text-blue-400" />
					<span class="text-sm text-blue-400">Syncing...</span>
				</div>
			{:else if available}
				<button
					onclick={handleSync}
					class="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
				>
					<RefreshCw class="h-3 w-3" />
					Sync Now
				</button>
			{/if}
		</div>

		<!-- Offline data availability -->
		<div class="flex items-center gap-2 text-sm text-gray-300">
			<Database class="h-4 w-4 text-gray-400" />
			<span>
				{#if available}
					{stats.spells} spells,
					{stats.monsters} monsters,
					{stats.items} items
				{:else}
					No offline data
				{/if}
			</span>
		</div>

		<!-- Last sync time -->
		{#if lastSync}
			<div class="flex items-center gap-2 text-sm text-gray-400">
				<Clock class="h-4 w-4" />
				<span>Last sync: {formatLastSync(lastSync)}</span>
			</div>
		{/if}

		<!-- Storage usage -->
		{#if storage}
			<div class="flex items-center gap-2 text-sm">
				<span class="text-gray-300">
					{formatBytes(storage.usage)} / {formatBytes(storage.quota)}
				</span>
				<span class="text-gray-400">({storage.percent.toFixed(1)}%)</span>
			</div>

			<!-- Storage usage bar -->
			<div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
				<div
					class="h-full transition-all duration-300 ease-out"
					class:bg-blue-500={storage.percent < 70}
					class:bg-yellow-500={storage.percent >= 70 && storage.percent < 90}
					class:bg-red-500={storage.percent >= 90}
					style="width: {storage.percent}%"
				></div>
			</div>
		{/if}
	</div>
{:else}
	<!-- Compact offline indicator -->
	<div
		class="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 backdrop-blur-sm"
	>
		{#if isOnline}
			<Wifi class="h-3 w-3 text-green-400" />
		{:else}
			<WifiOff class="h-3 w-3 text-red-400" />
		{/if}

		{#if available}
			<span class="text-xs text-gray-400">
				{stats.spells + stats.monsters + stats.items} items
			</span>
		{:else}
			<span class="text-xs text-gray-500">No offline</span>
		{/if}

		{#if isSyncingLocal || seeding}
			<RefreshCw class="h-3 w-3 animate-spin text-blue-400" />
		{/if}
	</div>
{/if}
