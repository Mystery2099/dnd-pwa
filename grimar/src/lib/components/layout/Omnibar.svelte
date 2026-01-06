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
		searchMode = section;
		isLoading = true;

		try {
			const params = new URLSearchParams();
			params.set('q', '*');
			params.set('section', section);
			params.set('limit', '12');

			const res = await fetch(`/api/compendium/search?${params.toString()}`);
			if (!res.ok) throw new Error('Search failed');
			const data = await res.json();
			results = data.results || [];
		} catch (error) {
			console.error('Search failed:', error);
			results = [];
		} finally {
			isLoading = false;
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
				{#each results as result (result.slug + result.type)}
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
