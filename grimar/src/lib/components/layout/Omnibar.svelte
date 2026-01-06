<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Search, ChevronRight } from 'lucide-svelte';

	interface SearchResult {
		type: string;
		typePath: string;
		name: string;
		slug: string;
		summary: string | null;
		source: string;
	}

	type Props = {
		placeholder?: string;
	};

	let { placeholder = 'Search spells, items, monsters…' }: Props = $props();

	let inputEl = $state<HTMLInputElement | null>(null);
	let query = $state('');
	let results = $state<SearchResult[]>([]);
	let selectedIndex = $state(0);
	let isOpen = $state(false);
	let isLoading = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Detect current compendium type from URL
	const currentCompendiumType = $derived.by(() => {
		const path = page.url.pathname;
		const match = path.match(/^\/compendium\/([^\/]+)/);
		return match ? match[1] : null; // 'spells', 'monsters', etc.
	});

	// Debounced search
	function handleInput() {
		if (debounceTimer) clearTimeout(debounceTimer);

		if (query.trim().length < 2) {
			results = [];
			isOpen = false;
			return;
		}

		debounceTimer = setTimeout(async () => {
			await performSearch();
		}, 150);
	}

	async function performSearch() {
		if (!browser || !query.trim()) return;

		isLoading = true;
		try {
			// Build URL with optional type filter
			const typeParam = currentCompendiumType ? `&type=${currentCompendiumType}` : '';
			const res = await fetch(
				`/api/compendium/search?q=${encodeURIComponent(query)}${typeParam}&limit=8`
			);
			const data = await res.json();
			results = data.results || [];
			selectedIndex = 0;
			isOpen = results.length > 0;
		} catch (error) {
			console.error('Search failed:', error);
			results = [];
			isOpen = false;
		} finally {
			isLoading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				break;
			case 'Enter':
				e.preventDefault();
				if (results[selectedIndex]) {
					navigateToResult(results[selectedIndex]);
				}
				break;
			case 'Escape':
				isOpen = false;
				break;
		}
	}

	function navigateToResult(result: SearchResult) {
		const href = `/compendium/${result.typePath}/${result.slug}`;
		goto(href);
		isOpen = false;
		query = '';
		results = [];
	}

	function handleFocus() {
		if (query.trim().length >= 2 && results.length > 0) {
			isOpen = true;
		}
	}

	function handleBlur() {
		// Delay to allow click on result
		setTimeout(() => {
			isOpen = false;
		}, 200);
	}

	onMount(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const isMac = navigator.platform.toLowerCase().includes('mac');
			const isCmdK = isMac && e.metaKey && e.key.toLowerCase() === 'k';
			const isCtrlK = !isMac && e.ctrlKey && e.key.toLowerCase() === 'k';

			if (isCmdK || isCtrlK) {
				e.preventDefault();
				inputEl?.focus();
				inputEl?.select();
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});
</script>

<div class="relative w-full">
	<!-- Search Input -->
	<div class="relative">
		<Search
			class="absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[var(--color-text-secondary)]"
		/>
		<input
			bind:this={inputEl}
			type="search"
			{placeholder}
			bind:value={query}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={handleFocus}
			onblur={handleBlur}
			class="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] pr-3 pl-9 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
		/>
		{#if isLoading}
			<div
				class="absolute top-1/2 right-10 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent"
			></div>
		{/if}
		<div
			class="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-card)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-text-muted)] lg:flex"
		>
			<span>⌘</span>
			<span>K</span>
		</div>
	</div>

	<!-- Results Dropdown -->
	{#if isOpen && results.length > 0}
		<div
			class="absolute top-full right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-xl"
		>
			{#each results as result, index (index)}
				<button
					class="flex w-full items-start gap-3 border-b border-[var(--color-border)] px-4 py-3 text-left last:border-0 hover:bg-[var(--color-bg-overlay)]"
					class:bg-[var(--color-bg-overlay)]={index === selectedIndex}
					onclick={() => navigateToResult(result)}
					onmouseenter={() => (selectedIndex = index)}
				>
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<span class="font-medium text-[var(--color-text-primary)]">{result.name}</span>
							<span
								class="rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-[var(--color-text-muted)] uppercase"
							>
								{result.type}
							</span>
						</div>
						{#if result.summary}
							<p class="mt-0.5 truncate text-sm text-[var(--color-text-secondary)]">
								{result.summary}
							</p>
						{/if}
					</div>
					<div
						class="size-4 shrink-0 text-[var(--color-text-muted)]"
						class:opacity-0={index !== selectedIndex}
					>
						<ChevronRight class="size-4" />
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
