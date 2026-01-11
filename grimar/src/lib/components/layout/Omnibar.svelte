<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import {
		CommandDialog,
		CommandInput,
		CommandList,
		CommandGroup,
		CommandItem,
		CommandSeparator,
		CommandLoading
	} from '$lib/components/ui/command';
	import {
		BookOpen,
		Settings,
		Database,
		Users,
		Loader2,
		Search,
		Trash2,
		ArrowLeft
	} from 'lucide-svelte';

	interface SearchResult {
		type: string;
		typePath: string;
		name: string;
		slug: string;
		summary: string | null;
		source: string;
		provider: string;
		sourceBook: string;
	}

	let open = $state(false);
	let inputValue = $state('');
	let results = $state<SearchResult[]>([]);
	let isLoading = $state(false);
	let searchMode = $state<string | null>(null);
	let inputRef = $state<HTMLInputElement | null>(null);
	let errorMessage = $state<string | null>(null);
	let debugMode = $state(false);

	const isDev = import.meta.env.DEV;

	// Navigate to a path
	function navigate(path: string) {
		goto(path);
		open = false;
		inputValue = '';
		searchMode = null;
		results = [];
	}

	// Perform a compendium search
	async function performSearch(section: string) {
		if (isDev) {
			console.group(`🔍 Omnibar Search: ${section}`);
			console.log('Section:', section);
		}

		searchMode = section;
		isLoading = true;
		errorMessage = null;

		try {
			const params = new SvelteURLSearchParams();
			params.set('q', '*');
			params.set('section', section);
			params.set('limit', '12');

			const url = `/api/compendium/search?${params.toString()}`;

			if (isDev) {
				console.log('API URL:', url);
			}

			const res = await fetch(url);

			if (!res.ok) {
				const statusText = res.statusText;
				const status = res.status;
				if (isDev) {
					console.error(`HTTP Error: ${status} ${statusText}`);
				}
				throw new Error(`HTTP ${status}: ${statusText}`);
			}

			const data = await res.json();
			results = data.results || [];

			if (isDev) {
				const snapshot = $state.snapshot(results);
				console.log('Results count:', snapshot.length);
				console.log('Results:', snapshot);
			}
		} catch (error) {
			const msg = error instanceof Error ? error.message : 'Unknown error';
			if (isDev) {
				console.error('❌ Search failed:', error);
			}
			errorMessage = msg;
			results = [];
		} finally {
			isLoading = false;
			if (isDev) {
				console.groupEnd();
			}
		}
	}

	// Handle search result selection
	function handleSearchSelect(result: SearchResult) {
		const href = `/compendium/${result.typePath}/${result.provider}/${result.sourceBook}/${result.slug}`;
		goto(href);
		open = false;
		inputValue = '';
		searchMode = null;
		results = [];
	}

	// Go back to commands list
	function backToCommands() {
		searchMode = null;
		results = [];
		errorMessage = null;
		setTimeout(() => inputRef?.focus(), 0);
	}

	// Sync compendium
	function handleSync() {
		fetch('/api/compendium/sync', { method: 'POST' });
		open = false;
		inputValue = '';
	}

	// Clear cache
	function handleClearCache() {
		if (browser && 'caches' in window) {
			caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
			localStorage.clear();
			window.location.reload();
		}
		open = false;
		inputValue = '';
	}

	// Set dark theme
	function handleThemeDark() {
		document.documentElement.classList.add('dark');
		localStorage.setItem('theme', 'dark');
		open = false;
		inputValue = '';
	}

	// Set light theme
	function handleThemeLight() {
		document.documentElement.classList.remove('dark');
		localStorage.setItem('theme', 'light');
		open = false;
		inputValue = '';
	}

	function handleOpenChange(isOpen: boolean) {
		open = isOpen;
		if (isOpen) {
			setTimeout(() => inputRef?.focus(), 0);
		} else {
			inputValue = '';
			searchMode = null;
			results = [];
		}
	}

	onMount(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const isMac = navigator.platform.toLowerCase().includes('mac');
			const isCmdK = isMac && e.metaKey && e.key.toLowerCase() === 'k';
			const isCtrlK = !isMac && e.ctrlKey && e.key.toLowerCase() === 'k';

			if (isCmdK || isCtrlK) {
				e.preventDefault();
				open = true;
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});
</script>

<!-- Trigger Button -->
<button
	onclick={() => (open = true)}
	class="border-theme bg-theme-card text-theme-muted hover:bg-theme-overlay flex h-10 w-full items-center gap-2 rounded-md border px-3 text-sm transition-colors hover:border-accent"
>
	<Search class="size-4" />
	<span class="flex-1 text-left">Search commands...</span>
	<div
		class="border-theme bg-theme-card text-theme-muted flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold"
	>
		<span>⌘</span><span>K</span>
	</div>
</button>

<CommandDialog {open} onOpenChange={handleOpenChange}>
	<CommandInput
		bind:ref={inputRef}
		bind:value={inputValue}
		placeholder={searchMode ? `Search ${searchMode}...` : 'Type to search commands...'}
		class="border-theme bg-theme-card text-theme-primary placeholder:text-theme-muted h-12 border-b text-base"
	/>
	<CommandList class="max-h-[60vh] overflow-y-auto">
		{#if isLoading}
			<CommandLoading>
				<div class="flex items-center justify-center py-8">
					<Loader2 class="size-5 animate-spin text-accent" />
				</div>
			</CommandLoading>
		{/if}

		{#if searchMode}
			<!-- Search Results Panel (plain HTML, no Command filtering) -->
			<div class="py-2">
				<div class="border-theme bg-theme-card flex items-center gap-2 border-b px-3 py-2">
					<button
						class="hover:bg-theme-overlay flex cursor-pointer items-center gap-1 rounded border-none bg-transparent px-2 py-1 text-sm text-accent"
						onclick={backToCommands}
					>
						<ArrowLeft class="size-4" />
						<span>Back</span>
					</button>
					<span class="text-sm font-semibold capitalize">Results for {searchMode}</span>
				</div>

				{#if results.length > 0}
					<div class="py-1">
						{#each results as result (result.slug)}
							<button
								class="text-theme-primary hover:bg-theme-overlay flex w-full cursor-pointer flex-col items-start gap-1 border-none bg-transparent p-[10px] text-left"
								onclick={() => handleSearchSelect(result)}
							>
								<div class="flex w-full flex-wrap items-center gap-2">
									<span class="text-sm font-medium">{result.name}</span>
									<span
										class="text-theme-muted bg-theme-card rounded px-1.5 py-0.5 text-[10px] uppercase"
										>{result.type}</span
									>
									{#if result.sourceBook}
										<span
											class="text-theme-muted bg-theme-overlay rounded px-1.5 py-0.5 text-[10px]"
											>{result.sourceBook}</span
										>
									{/if}
									{#if result.provider}
										<span
											class="text-theme-muted bg-theme-card rounded px-1.5 py-0.5 text-[10px] font-medium"
											>{result.provider}</span
										>
									{/if}
								</div>
								{#if result.summary}
									<span class="text-theme-secondary w-full text-xs">{result.summary}</span>
								{/if}
							</button>
						{/each}
					</div>
				{:else if errorMessage}
					<div class="text-theme-muted p-6 text-center">
						<p>Error: {errorMessage}</p>
						<button
							class="bg-theme-card border-theme text-theme-primary mt-3 cursor-pointer rounded border px-3 py-1.5 hover:border-accent"
							onclick={backToCommands}
						>
							Go Back
						</button>
					</div>
				{:else}
					<div class="text-theme-muted p-6 text-center">
						<p>No results found</p>
						<button
							class="bg-theme-card border-theme text-theme-primary mt-3 cursor-pointer rounded border px-3 py-1.5 hover:border-accent"
							onclick={backToCommands}
						>
							Go Back
						</button>
					</div>
				{/if}
			</div>
		{:else}
			<!-- Commands Panel -->
			<!-- Search Sections -->
			<CommandGroup heading="Search">
				<CommandItem
					value="search-spells"
					onclick={() => performSearch('spells')}
					class="flex items-center gap-3 px-4 py-2.5"
				>
					<BookOpen class="size-5 text-blue-500" />
					<span class="flex-1">Search Spells</span>
					<span class="text-theme-muted text-xs">spells</span>
				</CommandItem>
				<CommandItem
					value="search-monsters"
					onclick={() => performSearch('monsters')}
					class="flex items-center gap-3 px-4 py-2.5"
				>
					<Database class="size-5 text-red-500" />
					<span class="flex-1">Search Monsters</span>
					<span class="text-theme-muted text-xs">monsters</span>
				</CommandItem>
				<CommandItem
					value="search-items"
					onclick={() => performSearch('items')}
					class="flex items-center gap-3 px-4 py-2.5"
				>
					<Database class="size-5 text-amber-500" />
					<span class="flex-1">Search Items</span>
					<span class="text-theme-muted text-xs">items</span>
				</CommandItem>
				<CommandItem
					value="search-feats"
					onclick={() => performSearch('feats')}
					class="flex items-center gap-3 px-4 py-2.5"
				>
					<BookOpen class="size-5 text-emerald-500" />
					<span class="flex-1">Search Feats</span>
					<span class="text-theme-muted text-xs">feats</span>
				</CommandItem>
			</CommandGroup>

			<CommandSeparator class="my-1" />

			<!-- Navigate -->
			<CommandGroup heading="Navigate">
				<CommandItem
					value="goto-spells"
					onclick={() => navigate('/compendium/spells')}
					class="flex items-center gap-3 px-4 py-2.5"
				>
					<BookOpen class="size-5 text-blue-500" />
					<span class="flex-1">Go to Spells</span>
				</CommandItem>
				<CommandItem
					value="goto-monsters"
					onclick={() => navigate('/compendium/monsters')}
					class="flex items-center gap-3 px-4 py-2.5"
				>
					<Database class="size-5 text-red-500" />
					<span class="flex-1">Go to Monsters</span>
				</CommandItem>
				<CommandItem
					value="goto-characters"
					onclick={() => navigate('/characters')}
					class="flex items-center gap-3 px-4 py-2.5"
				>
					<Users class="size-5 text-green-500" />
					<span class="flex-1">Go to Characters</span>
				</CommandItem>
				<CommandItem
					value="goto-settings"
					onclick={() => navigate('/settings')}
					class="flex items-center gap-3 px-4 py-2.5"
				>
					<Settings class="size-5 text-purple-500" />
					<span class="flex-1">Go to Settings</span>
				</CommandItem>
			</CommandGroup>

			<CommandSeparator class="my-1" />

			<!-- Commands -->
			<CommandGroup heading="Commands">
				<CommandItem
					value="sync-compendium"
					onclick={handleSync}
					class="flex items-center gap-3 px-4 py-2.5"
				>
					<Database class="size-5 text-accent" />
					<span class="flex-1">Sync Compendium</span>
					<span class="text-theme-muted text-xs">sync</span>
				</CommandItem>
				<CommandItem
					value="clear-cache"
					onclick={handleClearCache}
					class="flex items-center gap-3 px-4 py-2.5"
				>
					<Trash2 class="size-5 text-red-500" />
					<span class="flex-1">Clear Cache</span>
					<span class="text-theme-muted text-xs">cache</span>
				</CommandItem>
			</CommandGroup>

			<CommandSeparator class="my-1" />

			<!-- Theme -->
			<CommandGroup heading="Theme">
				<CommandItem
					value="theme-dark"
					onclick={handleThemeDark}
					class="flex items-center gap-3 px-4 py-2.5"
				>
					<span class="flex-1">Dark Theme</span>
					<span class="text-theme-muted text-xs">dark</span>
				</CommandItem>
				<CommandItem
					value="theme-light"
					onclick={handleThemeLight}
					class="flex items-center gap-3 px-4 py-2.5"
				>
					<span class="flex-1">Light Theme</span>
					<span class="text-theme-muted text-xs">light</span>
				</CommandItem>
			</CommandGroup>
		{/if}
	</CommandList>
</CommandDialog>

<!-- Debug Panel (development only) -->
{#if isDev && searchMode}
	<div
		class="fixed top-20 right-5 left-5 z-[9999] max-h-[80vh] max-w-xs overflow-y-auto rounded-lg bg-slate-950/95 font-mono text-xs shadow-xl dark:border dark:border-red-500"
	>
		<div
			class="flex items-center justify-between bg-red-900/20 px-3 py-2 font-semibold text-red-400 dark:border-b dark:border-red-500/50"
		>
			<span>🔍 Omnibar Debug</span>
			<button
				class="cursor-pointer border-none bg-transparent p-1 text-sm text-red-400 opacity-70 hover:opacity-100"
				onclick={() => (searchMode = null)}
			>
				✕
			</button>
		</div>
		<div class="p-3 text-slate-300">
			<div class="mb-1.5 flex items-center justify-between">
				<span class="text-slate-400">Mode:</span>
				<code class="rounded bg-slate-800/60 px-1.5 py-0.5 text-xs">{searchMode}</code>
			</div>
			<div class="mb-1.5 flex items-center justify-between">
				<span class="text-slate-400">Results:</span>
				<code class="rounded bg-slate-800/60 px-1.5 py-0.5 text-xs">{results.length}</code>
			</div>
			{#if errorMessage}
				<div class="mb-1.5 flex items-center justify-between text-red-400">
					<span class="text-slate-400">Error:</span>
					<code class="rounded bg-slate-800/60 px-1.5 py-0.5 text-xs">{errorMessage}</code>
				</div>
			{/if}
			<div class="mt-2.5 border-t border-slate-700/50 pt-2.5">
				<button
					class="cursor-pointer rounded border border-slate-600/50 bg-slate-700/40 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700/60"
					onclick={() => (debugMode = !debugMode)}
				>
					{debugMode ? 'Hide' : 'Show'} Details
				</button>
			</div>
			{#if debugMode && results.length > 0}
				<details class="mt-2.5 border-t border-slate-700/50 pt-2.5">
					<summary class="mb-1.5 cursor-pointer text-xs text-slate-400">Results JSON</summary>
					<pre
						class="max-h-48 overflow-auto rounded border border-slate-700/50 bg-slate-950/80 px-2 py-1 text-[10px] break-all whitespace-pre-wrap">{JSON.stringify(
							results,
							null,
							2
						)}</pre>
				</details>
			{/if}
		</div>
	</div>
{/if}
