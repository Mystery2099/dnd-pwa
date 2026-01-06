<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import {
		CommandDialog,
		CommandInput,
		CommandList,
		CommandGroup,
		CommandItem,
		CommandSeparator,
		CommandLoading
	} from '$lib/components/ui/command';
	import { BookOpen, Settings, Database, Users, Loader2, Search, Trash2 } from 'lucide-svelte';

	interface SearchResult {
		type: string;
		typePath: string;
		name: string;
		slug: string;
		summary: string | null;
		source: string;
	}

	let open = $state(false);
	let inputValue = $state('');
	let results = $state<SearchResult[]>([]);
	let isLoading = $state(false);
	let searchMode = $state<string | null>(null);
	let inputRef = $state<HTMLInputElement | null>(null);
	let errorMessage = $state<string | null>(null);
	let debugMode = $state(false); // Toggle for debug panel

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
			const params = new URLSearchParams();
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
				console.log('Results count:', results.length);
				console.log('Results:', results);
				if (results.length === 0) {
					console.warn('⚠️ No results returned - check if compendium data exists');
				} else {
					console.log('First result:', results[0]);
				}
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
		const href = `/compendium/${result.typePath}/${result.slug}`;
		goto(href);
		open = false;
		inputValue = '';
		searchMode = null;
		results = [];
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
	class="flex h-10 w-full items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-overlay)]"
>
	<Search class="size-4" />
	<span class="flex-1 text-left">Search commands...</span>
	<div
		class="flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-card)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-text-muted)]"
	>
		<span>⌘</span><span>K</span>
	</div>
</button>

<CommandDialog {open} onOpenChange={handleOpenChange}>
	<CommandInput
		bind:ref={inputRef}
		bind:value={inputValue}
		placeholder="Type to search commands..."
		class="h-12 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
	/>
	<CommandList class="max-h-[60vh] overflow-y-auto">
		{#if isLoading}
			<CommandLoading>
				<div class="flex items-center justify-center py-8">
					<Loader2 class="size-5 animate-spin text-[var(--color-accent)]" />
				</div>
			</CommandLoading>
		{/if}

		<!-- Search Sections - fuzzy matches on value -->
		<CommandGroup heading="Search">
			<CommandItem
				value="search-spells"
				onclick={() => performSearch('spells')}
				class="flex items-center gap-3 px-4 py-2.5"
			>
				<BookOpen class="size-5 text-blue-500" />
				<span class="flex-1">Search Spells</span>
				<span class="text-xs text-[var(--color-text-muted)]">spells</span>
			</CommandItem>
			<CommandItem
				value="search-monsters"
				onclick={() => performSearch('monsters')}
				class="flex items-center gap-3 px-4 py-2.5"
			>
				<Database class="size-5 text-red-500" />
				<span class="flex-1">Search Monsters</span>
				<span class="text-xs text-[var(--color-text-muted)]">monsters</span>
			</CommandItem>
			<CommandItem
				value="search-items"
				onclick={() => performSearch('items')}
				class="flex items-center gap-3 px-4 py-2.5"
			>
				<Database class="size-5 text-amber-500" />
				<span class="flex-1">Search Items</span>
				<span class="text-xs text-[var(--color-text-muted)]">items</span>
			</CommandItem>
			<CommandItem
				value="search-feats"
				onclick={() => performSearch('feats')}
				class="flex items-center gap-3 px-4 py-2.5"
			>
				<BookOpen class="size-5 text-emerald-500" />
				<span class="flex-1">Search Feats</span>
				<span class="text-xs text-[var(--color-text-muted)]">feats</span>
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
				<Database class="size-5 text-[var(--color-accent)]" />
				<span class="flex-1">Sync Compendium</span>
				<span class="text-xs text-[var(--color-text-muted)]">sync</span>
			</CommandItem>
			<CommandItem
				value="clear-cache"
				onclick={handleClearCache}
				class="flex items-center gap-3 px-4 py-2.5"
			>
				<Trash2 class="size-5 text-red-500" />
				<span class="flex-1">Clear Cache</span>
				<span class="text-xs text-[var(--color-text-muted)]">cache</span>
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
				<span class="text-xs text-[var(--color-text-muted)]">dark</span>
			</CommandItem>
			<CommandItem
				value="theme-light"
				onclick={handleThemeLight}
				class="flex items-center gap-3 px-4 py-2.5"
			>
				<span class="flex-1">Light Theme</span>
				<span class="text-xs text-[var(--color-text-muted)]">light</span>
			</CommandItem>
		</CommandGroup>

		<!-- Search Results -->
		{#if searchMode && results.length > 0}
			<CommandSeparator class="my-1" />
			<CommandGroup heading="Results">
				{#each results as result, index}
					<CommandItem
						value="result-{result.slug}"
						onclick={() => handleSearchSelect(result)}
						class="flex items-center gap-3 px-4 py-2.5"
					>
						<div class="flex-1">
							<span class="font-medium">{result.name}</span>
							<span
								class="ml-2 rounded px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)] uppercase"
							>
								{result.type}
							</span>
						</div>
						{#if result.summary}
							<span class="line-clamp-1 text-sm text-[var(--color-text-secondary)]"
								>{result.summary}</span
							>
						{/if}
					</CommandItem>
				{/each}
			</CommandGroup>
		{:else if searchMode && !isLoading}
			<CommandSeparator class="my-1" />
			<CommandGroup heading="Results">
				<div class="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
					No results found
				</div>
			</CommandGroup>
		{/if}
	</CommandList>
</CommandDialog>

<!-- Debug Panel (development only) -->
{#if isDev && searchMode}
	<div class="omnibar-debug-panel">
		<div class="debug-header">
			<span>🔍 Omnibar Debug</span>
			<button class="debug-close" onclick={() => (searchMode = null)}>✕</button>
		</div>
		<div class="debug-content">
			<div class="debug-row">
				<span class="debug-label">Mode:</span>
				<code>{searchMode}</code>
			</div>
			<div class="debug-row">
				<span class="debug-label">Results:</span>
				<code>{results.length}</code>
			</div>
			{#if errorMessage}
				<div class="debug-row error">
					<span class="debug-label">Error:</span>
					<code>{errorMessage}</code>
				</div>
			{/if}
			<div class="debug-actions">
				<button onclick={() => (debugMode = !debugMode)}>
					{debugMode ? 'Hide' : 'Show'} Details
				</button>
			</div>
			{#if debugMode && results.length > 0}
				<details class="debug-details">
					<summary>Results JSON</summary>
					<pre>{JSON.stringify(results, null, 2)}</pre>
				</details>
			{/if}
		</div>
	</div>
{/if}

<style>
	.omnibar-debug-panel {
		position: fixed;
		bottom: 20px;
		right: 20px;
		background: rgba(15, 23, 42, 0.95);
		border: 1px solid #ef4444;
		border-radius: 8px;
		padding: 0;
		font-size: 12px;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
		z-index: 9999;
		max-width: 320px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
	}

	.debug-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		background: rgba(239, 68, 68, 0.2);
		border-bottom: 1px solid rgba(239, 68, 68, 0.3);
		color: #fca5a5;
		font-weight: 600;
	}

	.debug-close {
		background: none;
		border: none;
		color: #fca5a5;
		cursor: pointer;
		padding: 2px 6px;
		font-size: 14px;
		line-height: 1;
		opacity: 0.7;
	}

	.debug-close:hover {
		opacity: 1;
	}

	.debug-content {
		padding: 12px;
		color: #cbd5e1;
	}

	.debug-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6px;
	}

	.debug-row.error {
		color: #fca5a5;
	}

	.debug-label {
		color: #94a3b8;
	}

	.debug-row code {
		background: rgba(51, 65, 85, 0.6);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 11px;
	}

	.debug-actions {
		margin-top: 10px;
		padding-top: 10px;
		border-top: 1px solid rgba(71, 85, 105, 0.5);
	}

	.debug-actions button {
		background: rgba(71, 85, 105, 0.4);
		border: 1px solid rgba(100, 116, 139, 0.5);
		color: #cbd5e1;
		padding: 4px 10px;
		border-radius: 4px;
		font-size: 11px;
		cursor: pointer;
	}

	.debug-actions button:hover {
		background: rgba(71, 85, 105, 0.6);
	}

	.debug-details {
		margin-top: 10px;
		padding-top: 10px;
		border-top: 1px solid rgba(71, 85, 105, 0.5);
	}

	.debug-details summary {
		color: #94a3b8;
		font-size: 11px;
		cursor: pointer;
		margin-bottom: 6px;
	}

	.debug-details pre {
		background: rgba(15, 23, 42, 0.8);
		border: 1px solid rgba(71, 85, 105, 0.5);
		border-radius: 4px;
		padding: 8px;
		font-size: 10px;
		max-height: 200px;
		overflow: auto;
		white-space: pre-wrap;
		word-break: break-all;
	}
</style>
