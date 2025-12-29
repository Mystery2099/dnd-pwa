<script lang="ts">
	import { AlertCircle, X, Trash2 } from 'lucide-svelte';
	import { fly } from 'svelte/transition';

	interface Props {
		reason: string;
		details?: {
			itemsRemoved?: number;
			spaceFreed?: string;
			cacheUsage?: number;
		};
		duration?: number;
	}

	let { reason, details, duration = 5000 }: Props = $props();

	let isVisible = $state(true);
	let progress = $state(0);

	// Auto-hide after duration
	$effect(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				isVisible = false;
			}, duration);

			return () => clearTimeout(timer);
		}
	});

	// Simulate cleanup progress for budget enforcement
	$effect(() => {
		if (reason.includes('budget enforcement')) {
			const interval = setInterval(() => {
				progress += Math.random() * 30;
				if (progress >= 100) {
					progress = 100;
					clearInterval(interval);
				}
			}, 200);

			return () => clearInterval(interval);
		}
	});

	function dismiss() {
		isVisible = false;
	}

	function getNotificationType(): 'warning' | 'info' | 'success' {
		if (reason.includes('budget enforcement')) return 'warning';
		if (reason.includes('routine cleanup')) return 'info';
		return 'info';
	}

	function getBackground(): string {
		const type = getNotificationType();
		switch (type) {
			case 'warning':
				return 'bg-yellow-500/10 border-yellow-500/20';
			case 'success':
				return 'bg-green-500/10 border-green-500/20';
			default:
				return 'bg-blue-500/10 border-blue-500/20';
		}
	}
</script>

{#if isVisible}
	<div
		class="fixed right-4 bottom-4 z-50 max-w-sm rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all {getBackground()}"
		transition:fly={{ y: 50, duration: 300 }}
	>
		<!-- Header -->
		<div class="flex items-start justify-between">
			<div class="flex items-center gap-2">
				{#if reason.includes('budget enforcement')}
					<Trash2 class="h-4 w-4 text-yellow-400" />
				{:else}
					<AlertCircle class="h-4 w-4 text-blue-400" />
				{/if}

				<div>
					<h4 class="text-sm font-medium text-white">
						{#if reason.includes('budget enforcement')}
							Cache Cleanup Required
						{:else if reason.includes('routine cleanup')}
							Cache Maintenance
						{:else}
							Cache Activity
						{/if}
					</h4>
					<p class="mt-1 text-xs text-gray-400">
						{reason}
					</p>
				</div>
			</div>

			<button
				onclick={dismiss}
				class="text-gray-400 transition-colors hover:text-white"
				aria-label="Dismiss notification"
			>
				<X class="h-4 w-4" />
			</button>
		</div>

		<!-- Details -->
		{#if details}
			<div class="mt-3 space-y-2">
				{#if details.itemsRemoved !== undefined}
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-400">Items removed:</span>
						<span class="font-medium text-white">{details.itemsRemoved}</span>
					</div>
				{/if}

				{#if details.spaceFreed}
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-400">Space freed:</span>
						<span class="font-medium text-green-400">{details.spaceFreed}</span>
					</div>
				{/if}

				{#if details.cacheUsage !== undefined}
					<div class="mt-2">
						<div class="mb-1 flex items-center justify-between text-sm">
							<span class="text-gray-400">Cache usage:</span>
							<span class="font-medium text-white">{details.cacheUsage.toFixed(1)}%</span>
						</div>
						<!-- Progress bar -->
						<div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
							<div
								class="h-full transition-all duration-500 ease-out"
								class:bg-red-500={details.cacheUsage > 90}
								class:bg-yellow-500={details.cacheUsage > 70 && details.cacheUsage <= 90}
								class:bg-green-500={details.cacheUsage <= 70}
								style="width: {details.cacheUsage}%"
							></div>
						</div>
					</div>
				{/if}

				{#if reason.includes('budget enforcement')}
					<div class="mt-3">
						<div class="mb-1 flex items-center justify-between text-sm">
							<span class="text-gray-400">Cleanup progress:</span>
							<span class="font-medium text-yellow-400">{progress.toFixed(0)}%</span>
						</div>
						<div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
							<div
								class="h-full bg-yellow-500 transition-all duration-200 ease-out"
								style="width: {progress}%"
							></div>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Action buttons -->
		{#if reason.includes('budget enforcement')}
			<div class="mt-3 flex gap-2">
				<button
					onclick={dismiss}
					class="flex-1 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
				>
					Dismiss
				</button>
			</div>
		{:else}
			<div class="mt-3 flex gap-2">
				<button
					onclick={dismiss}
					class="flex-1 rounded-md bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/30"
				>
					OK
				</button>
			</div>
		{/if}
	</div>
{/if}
