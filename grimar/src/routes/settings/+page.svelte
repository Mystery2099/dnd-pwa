<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import {
		Palette,
		Cog,
		Info,
		User,
		LogOut,
		Trash2,
		Download,
		Book,
		RefreshCw,
		HardDrive,
		Users,
		Clock,
		Upload,
		RotateCcw,
		Sword
	} from 'lucide-svelte';
	import ThemeCardSelector from '$lib/components/ui/ThemeCardSelector.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import RadioCardGrid from '$lib/components/ui/RadioCardGrid.svelte';
	import SettingsGroup from '$lib/components/ui/SettingsGroup.svelte';
	import SettingsItem from '$lib/components/ui/SettingsItem.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Tabs } from 'bits-ui';
	import {
		settingsStore,
		SYNC_INTERVAL_OPTIONS,
		GRID_MAX_COLUMNS_OPTIONS
	} from '$lib/core/client/settingsStore.svelte';
	import { userSettingsStore } from '$lib/core/client/userSettingsStore.svelte';
	import {
		getImportedThemes,
		importTheme,
		exportTheme,
		deleteImportedTheme
	} from '$lib/core/client/themeRegistry';
	import { setTheme } from '$lib/core/client/themeStore.svelte';
	import type { ThemeConfig } from '$lib/core/types/theme';

	let { data } = $props();

	// Theme import/export state
	let showImportDialog = $state(false);
	let importText = $state('');
	let importError = $state('');
	let importingTheme = $state(false);
	let importedThemes = $state<ThemeConfig[]>(getImportedThemes());

	// Import theme functions
	function handleImportFromText() {
		importError = '';
		if (!importText.trim()) {
			importError = 'Please enter a theme JSON';
			return;
		}
		importingTheme = true;
		const result = importTheme(importText);
		importingTheme = false;
		if (result.success) {
			importText = '';
			importedThemes = getImportedThemes();
			showImportDialog = false;
		} else {
			importError = result.error || 'Failed to import theme';
		}
	}

	async function handleImportFromFile() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			const text = await file.text();
			importText = text;
			handleImportFromText();
		};
		input.click();
	}

	function handleExportTheme(themeId: string) {
		const json = exportTheme(themeId);
		if (!json) return;
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `grimar-theme-${themeId}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleDeleteImportedTheme(themeId: string) {
		deleteImportedTheme(themeId);
		importedThemes = getImportedThemes();
	}

	function handleApplyTheme(themeId: string) {
		setTheme(themeId);
	}

	// Local reference for TypeScript null tracking
	let user = $derived(data.user ?? null);

	// Form states
	let clearingCache = $state(false);
	let clearingOffline = $state(false);
	let clearingCharacters = $state(false);
	let resettingSettings = $state(false);
	let loggingOut = $state(false);

	// Confirmation dialogs
	let showClearCacheDialog = $state(false);
	let showClearOfflineDialog = $state(false);
	let showClearCharactersDialog = $state(false);
	let showLogoutDialog = $state(false);
	let showResetDialog = $state(false);

	// Navigation sections with gem colors
	const sections = [
		{
			id: 'appearance',
			label: 'Appearance',
			icon: Palette,
			color: 'amethyst',
			accent: 'var(--gem-amethyst)'
		},
		{
			id: 'compendium',
			label: 'Compendium',
			icon: Book,
			color: 'emerald',
			accent: 'var(--gem-emerald)'
		},
		{
			id: 'data',
			label: 'Data & Sync',
			icon: RefreshCw,
			color: 'sapphire',
			accent: 'var(--gem-sapphire)'
		},
		{
			id: 'account',
			label: 'User & Account',
			icon: Users,
			color: 'ruby',
			accent: 'var(--gem-ruby)'
		},
		{ id: 'about', label: 'About', icon: Info, color: 'pearl', accent: 'var(--gem-pearl)' }
	] as const;

	const settingsMetaLabelClass =
		'text-[0.68rem] font-semibold tracking-[0.24em] text-[var(--color-text-muted)] uppercase';
	const settingsMetaValueClass =
		'mt-1 block text-sm font-semibold text-[var(--color-text-primary)]';
	const settingsSummaryCardClass =
		'rounded-[1.4rem] border border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-overlay)_74%,transparent)] px-4 py-4';
	const settingsPanelFrameClass = 'mx-auto flex w-full max-w-[920px] flex-col';
	const settingsTabContentClass = 'flex min-w-0 animate-fade-in flex-col gap-6';
	const settingsNavItemClass =
		'relative flex w-full cursor-pointer items-center gap-3 rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-border)_55%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-overlay)_42%,transparent)] px-4 py-4 text-left text-sm font-medium text-[var(--color-text-secondary)] transition-all hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-accent)_24%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] hover:text-[var(--color-text-primary)] data-[state=active]:border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] data-[state=active]:bg-[linear-gradient(145deg,color-mix(in_srgb,var(--color-accent)_18%,transparent),color-mix(in_srgb,var(--color-accent)_6%,transparent))] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-[0_0_16px_color-mix(in_srgb,var(--color-accent)_18%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent)] max-lg:min-w-[250px] max-lg:shrink-0 max-lg:whitespace-normal max-sm:min-w-[220px] max-sm:px-3 max-sm:py-3';

	function isSectionId(value: string): value is (typeof sections)[number]['id'] {
		return sections.some((section) => section.id === value);
	}

	function getSectionFromUrl(): (typeof sections)[number]['id'] {
		const section = page.url.searchParams.get('section');
		return section && isSectionId(section) ? section : 'appearance';
	}

	function getSectionMeta(sectionId: (typeof sections)[number]['id']) {
		switch (sectionId) {
			case 'appearance':
				return 'Themes and imported palettes';
			case 'compendium':
				return 'Browsing behavior and layout';
			case 'data':
				return 'Caches, storage, and sync';
			case 'account':
				return 'Identity and session details';
			case 'about':
				return 'Build and project information';
		}
	}

	function getSectionSummary(sectionId: (typeof sections)[number]['id']) {
		switch (sectionId) {
			case 'appearance':
				return 'Adjust the visual language of the app and manage imported themes.';
			case 'compendium':
				return 'Set how your archives behave while browsing and loading content.';
			case 'data':
				return 'Control cache strategy, local cleanup, and device-specific persistence.';
			case 'account':
				return 'Review your identity, session lifetime, and sign-out access.';
			case 'about':
				return 'Check release details and project metadata.';
		}
	}

	// Track active section - now bound to Tabs
	let activeSection = $state<(typeof sections)[number]['id']>(getSectionFromUrl());

	function updateSectionUrl(sectionId: (typeof sections)[number]['id']) {
		const nextUrl = new URL(page.url);
		if (sectionId === 'appearance') {
			nextUrl.searchParams.delete('section');
		} else {
			nextUrl.searchParams.set('section', sectionId);
		}

		const nextPath = `${nextUrl.pathname}${nextUrl.search}`;
		const currentPath = `${page.url.pathname}${page.url.search}`;
		if (nextPath === currentPath) return;

		replaceState(nextPath, page.state);
	}

	// Client-side cache clearing functions
	async function clearCache() {
		showClearCacheDialog = true;
	}

	async function confirmClearCache() {
		clearingCache = true;
		try {
			const keys = Object.keys(localStorage).filter((key) => key.startsWith('grimar-'));
			keys.forEach((key) => localStorage.removeItem(key));
			console.log('[Settings] Cache cleared successfully');
		} catch (error) {
			console.error('[Settings] Failed to clear cache:', error);
		} finally {
			clearingCache = false;
			showClearCacheDialog = false;
		}
	}

	async function clearOfflineData() {
		showClearOfflineDialog = true;
	}

	async function confirmClearOfflineData() {
		clearingOffline = true;
		try {
			const databases = await indexedDB.databases();
			databases.forEach((db) => {
				if (db?.name) {
					indexedDB.deleteDatabase(db.name);
				}
			});
			console.log('[Settings] Offline data cleared successfully');
		} catch (error) {
			console.error('[Settings] Failed to clear offline data:', error);
		} finally {
			clearingOffline = false;
			showClearOfflineDialog = false;
		}
	}

	async function clearCharacterData() {
		showClearCharactersDialog = true;
	}

	async function confirmClearCharacterData() {
		clearingCharacters = true;
		try {
			// Clear character-specific data from localStorage
			const keys = Object.keys(localStorage).filter(
				(key) => key.startsWith('grimar-characters') || key.startsWith('grimar-character-')
			);
			keys.forEach((key) => localStorage.removeItem(key));

			// Clear IndexedDB character stores if they exist
			const databases = await indexedDB.databases();
			databases.forEach((db) => {
				if (db?.name?.includes('character')) {
					indexedDB.deleteDatabase(db.name);
				}
			});

			console.log('[Settings] Character data cleared successfully');
		} catch (error) {
			console.error('[Settings] Failed to clear character data:', error);
		} finally {
			clearingCharacters = false;
			showClearCharactersDialog = false;
		}
	}

	function resetAllSettings() {
		showResetDialog = true;
	}

	async function confirmResetSettings() {
		resettingSettings = true;
		try {
			settingsStore.reset();
			await userSettingsStore.refetch();
			console.log('[Settings] All settings reset to defaults');
		} catch (error) {
			console.error('[Settings] Failed to reset settings:', error);
		} finally {
			resettingSettings = false;
			showResetDialog = false;
		}
	}

	async function confirmLogout() {
		showLogoutDialog = false;
		loggingOut = true;
		document.querySelector<HTMLFormElement>('#logout-form')?.requestSubmit();
	}

	// Helper to format session duration
	function getSessionInfo() {
		if (!user) return null;
		const expiresAt = new Date(user.expiresAt);
		const now = new Date();
		const diffMs = expiresAt.getTime() - now.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 0) return { text: 'Expired', valid: false };
		if (diffMins < 60) return { text: `${diffMins} minutes remaining`, valid: true };
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return { text: `${diffHours} hours remaining`, valid: true };
		const diffDays = Math.floor(diffHours / 24);
		return { text: `${diffDays} days remaining`, valid: true };
	}

	const sessionInfo = $derived(getSessionInfo());
	const activeSectionConfig = $derived(
		sections.find((section) => section.id === activeSection) ?? sections[0]
	);
	const syncIntervalLabel = $derived(
		SYNC_INTERVAL_OPTIONS.find((option) => option.value === userSettingsStore.data.autoSyncInterval)
			?.label ?? 'Manual only'
	);

	// Format creation date
	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	$effect(() => {
		updateSectionUrl(activeSection);
	});

	onMount(() => {
		const handlePopState = () => {
			activeSection = getSectionFromUrl();
		};

		window.addEventListener('popstate', handlePopState);

		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	});
</script>

<svelte:head>
	<title>Settings | Grimar</title>
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_20%_0%,rgba(var(--theme-accent-rgb),0.12)_0%,transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(var(--theme-accent-rgb),0.08)_0%,transparent_50%),radial-gradient(circle_at_50%_50%,rgba(var(--theme-accent-rgb),0.03)_0%,transparent_70%),var(--color-bg-canvas)] p-4 before:pointer-events-none before:absolute before:inset-0 before:z-0 before:animate-arcane-particles before:bg-[radial-gradient(1px_1px_at_20%_30%,rgba(var(--theme-accent-rgb),0.3),transparent),radial-gradient(1px_1px_at_40%_70%,rgba(var(--theme-accent-rgb),0.2),transparent),radial-gradient(1px_1px_at_60%_20%,rgba(var(--theme-accent-rgb),0.25),transparent),radial-gradient(1px_1px_at_80%_60%,rgba(var(--theme-accent-rgb),0.2),transparent),radial-gradient(1px_1px_at_90%_40%,rgba(var(--theme-accent-rgb),0.15),transparent)] before:bg-[length:200%_200%] sm:p-6"
>
	<div class="mx-auto flex max-w-[1400px] flex-col gap-8">
		<header
			class="relative overflow-hidden rounded-[2rem] border border-[color-mix(in_srgb,var(--color-border)_75%,transparent)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--color-bg-card)_88%,transparent)_0%,color-mix(in_srgb,black_24%,transparent)_100%)] p-6 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_14%,transparent),0_18px_60px_color-mix(in_srgb,black_45%,transparent)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_left,rgba(var(--theme-accent-rgb),0.18),transparent_36%),linear-gradient(90deg,transparent_0%,color-mix(in_srgb,var(--color-text-primary)_6%,transparent)_50%,transparent_100%)] before:opacity-90 max-sm:rounded-[1.5rem] max-sm:p-5 sm:p-8 lg:p-10"
		>
			<div class="relative z-10">
				<div
					class="mb-5 flex items-center gap-3 text-[0.7rem] font-semibold tracking-[0.32em] text-[var(--color-text-muted)] uppercase"
				>
					<div
						class="flex size-14 items-center justify-center rounded-[1.35rem] border text-[var(--color-accent)] shadow-[0_0_24px_color-mix(in_srgb,var(--color-accent)_18%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_12%,transparent)]"
						style="background: linear-gradient(145deg, color-mix(in srgb, var(--color-accent) 20%, transparent), color-mix(in srgb, black 20%, transparent)); border-color: color-mix(in srgb, var(--color-accent) 28%, transparent)"
					>
						<Cog class="size-7" />
					</div>
					<span>Control nexus</span>
				</div>
				<div class="space-y-3">
					<h1
						class="text-holo text-4xl font-black tracking-tight text-[var(--color-text-primary)] sm:text-5xl"
					>
						Settings
					</h1>
					<p class="max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base">
						Tune the look, cache behavior, and account state of your grimoire from one consistent
						command deck.
					</p>
				</div>
			</div>

			<div class="relative z-10 mt-8 grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-end">
				<div
					class="flex items-center gap-4 rounded-[1.6rem] border border-[color-mix(in_srgb,var(--color-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-overlay)_78%,transparent)] px-4 py-4"
				>
					<div
						class="flex size-14 items-center justify-center rounded-[1.15rem] border shadow-[0_0_20px_color-mix(in_srgb,currentColor_15%,transparent)]"
						style="color: {activeSectionConfig.accent}; background: color-mix(in srgb, currentColor 12%, transparent); border-color: color-mix(in srgb, currentColor 28%, transparent)"
					>
						<activeSectionConfig.icon class="size-6" />
					</div>
					<div>
						<p class={settingsMetaLabelClass}>Active section</p>
						<p class={settingsMetaValueClass}>{activeSectionConfig.label}</p>
					</div>
				</div>
				<div class="grid gap-3 max-sm:grid-cols-1 sm:grid-cols-3">
					<div class={settingsSummaryCardClass}>
						<span class={settingsMetaLabelClass}>Theme library</span>
						<span class={settingsMetaValueClass}>Curated + custom</span>
					</div>
					<div class={settingsSummaryCardClass}>
						<span class={settingsMetaLabelClass}>Sync cadence</span>
						<span class={settingsMetaValueClass}>{syncIntervalLabel}</span>
					</div>
					<div class={settingsSummaryCardClass}>
						<span class={settingsMetaLabelClass}>Account state</span>
						<span class={settingsMetaValueClass}>{user ? 'Signed in' : 'Guest mode'}</span>
					</div>
				</div>
			</div>
		</header>

		<Tabs.Root
			bind:value={activeSection}
			class="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]"
		>
			<aside class="h-fit lg:sticky lg:top-6 lg:pr-2">
				<div
					class="overflow-hidden rounded-[1.75rem] border border-[color-mix(in_srgb,var(--color-border)_80%,transparent)] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-bg-card)_88%,transparent),color-mix(in_srgb,black_18%,transparent))] p-4 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text-primary)_10%,transparent),0_12px_34px_color-mix(in_srgb,black_35%,transparent)]"
				>
					<div
						class="mb-4 rounded-[1.25rem] border border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-overlay)_65%,transparent)] px-4 py-4"
					>
						<p class={settingsMetaLabelClass}>Sections</p>
						<p class="mt-1 text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
							Navigate the stack
						</p>
					</div>

					<nav
						class="flex flex-col gap-2 max-lg:flex-row max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:pb-2"
					>
						{#each sections as section (section.id)}
							<Tabs.Trigger value={section.id} class={settingsNavItemClass}>
								<span
									class="flex size-11 shrink-0 items-center justify-center rounded-[0.95rem] border border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-card)_82%,transparent)]"
								>
									<section.icon class="size-5" style="color: {section.accent}" />
								</span>
								<span class="flex min-w-0 flex-1 flex-col">
									<span class="text-sm font-semibold text-[var(--color-text-primary)]">
										{section.label}
									</span>
									<span class="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
										{getSectionMeta(section.id)}
									</span>
								</span>
							</Tabs.Trigger>
						{/each}
					</nav>

					<div
						class="mt-4 rounded-[1.35rem] border border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--color-bg-overlay)_62%,transparent)] px-4 py-4"
					>
						<p class={settingsMetaLabelClass}>Current focus</p>
						<p class="mt-1 text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
							{activeSectionConfig.label}
						</p>
						<p class="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
							{getSectionSummary(activeSectionConfig.id)}
						</p>
					</div>
				</div>
			</aside>

			<main class="flex min-w-0 flex-col gap-6">
				<!-- 1. Appearance Section -->
				<Tabs.Content value="appearance" class={settingsTabContentClass}>
					<section id="appearance" class={settingsPanelFrameClass}>
						<SettingsGroup
							id="appearance"
							title="Appearance"
							description="Customize the visual experience of your grimoire"
							icon={Palette}
							index={0}
							accentColor="var(--gem-amethyst)"
						>
							<!-- Theme switcher using card-based selector -->
							<div class="w-full py-4">
								<ThemeCardSelector />
							</div>

							<!-- Theme Import/Export -->
							<SettingsItem
								label="Import Theme"
								description="Import a custom theme from a JSON file"
							>
								{#snippet control()}
									<Button variant="secondary" size="sm" onclick={() => (showImportDialog = true)}>
										<Upload class="size-4" />
										Import
									</Button>
								{/snippet}
							</SettingsItem>

							{#if importedThemes.length > 0}
								<SettingsItem
									label="Imported Themes"
									description="Manage your imported themes"
									divider={false}
								>
									{#snippet control()}
										<div class="flex flex-wrap gap-2">
											{#each importedThemes as theme (theme.id)}
												<div
													class="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2 py-1"
												>
													<span class="text-xs text-[var(--color-text-secondary)]"
														>{theme.name}</span
													>
													<button
														class="rounded p-0.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)]"
														onclick={() => handleApplyTheme(theme.id)}
														title="Apply theme"
													>
														<Palette class="size-3" />
													</button>
													<button
														class="rounded p-0.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-text-primary)]"
														onclick={() => handleExportTheme(theme.id)}
														title="Export theme"
													>
														<Download class="size-3" />
													</button>
													<button
														class="rounded p-0.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-overlay)] hover:text-red-400"
														onclick={() => handleDeleteImportedTheme(theme.id)}
														title="Delete theme"
													>
														<Trash2 class="size-3" />
													</button>
												</div>
											{/each}
										</div>
									{/snippet}
								</SettingsItem>
							{/if}
						</SettingsGroup>
					</section></Tabs.Content
				>

				<!-- 2. Compendium Section -->
				<Tabs.Content value="compendium" class={settingsTabContentClass}>
					<section id="compendium" class={settingsPanelFrameClass}>
						<SettingsGroup
							id="compendium"
							title="Compendium"
							description="Configure how you browse spells, monsters, and items"
							icon={Book}
							index={1}
							accentColor="var(--gem-emerald)"
						>
							<SettingsItem
								label="Sync on Load"
								description="Automatically refresh compendium data when the app opens"
								divider={false}
							>
								{#snippet control()}
									<Toggle
										checked={userSettingsStore.data.syncOnLoad}
										onchange={(v: boolean) => userSettingsStore.updateSetting('syncOnLoad', v)}
									/>
								{/snippet}
							</SettingsItem>

							<SettingsItem
								label="Grid Density"
								description="Choose how many archive cards can appear in a row on this device"
							>
								{#snippet control()}
									<RadioCardGrid
										name="gridMaxColumns"
										options={GRID_MAX_COLUMNS_OPTIONS}
										value={String(settingsStore.settings.gridMaxColumns)}
										onchange={(value) => settingsStore.setGridMaxColumns(Number(value))}
										columns={5}
									/>
								{/snippet}
							</SettingsItem>

							<SettingsItem
								label="Offline Data"
								description="Keep downloaded entries available when you lose connection"
								divider={false}
							>
								{#snippet control()}
									<Toggle
										checked={userSettingsStore.data.offlineEnabled}
										onchange={(v: boolean) => userSettingsStore.updateSetting('offlineEnabled', v)}
									/>
								{/snippet}
							</SettingsItem>
						</SettingsGroup>
					</section></Tabs.Content
				>

				<!-- 3. Data & Sync Section -->
				<Tabs.Content value="data" class={settingsTabContentClass}>
					<section id="data" class={settingsPanelFrameClass}>
						<SettingsGroup
							id="data"
							title="Data & Sync"
							description="Manage cache behavior, cleanup tools, and synchronization cadence"
							icon={RefreshCw}
							index={2}
							accentColor="var(--gem-sapphire)"
						>
							<SettingsItem
								label="Auto-Sync Interval"
								description="How often the app should refresh data in the background"
								divider={false}
							>
								{#snippet control()}
									<RadioCardGrid
										name="autoSyncInterval"
										options={SYNC_INTERVAL_OPTIONS}
										value={userSettingsStore.data.autoSyncInterval}
										onchange={(v) =>
											userSettingsStore.updateSetting(
												'autoSyncInterval',
												v as 'never' | '15min' | '30min' | '1h'
											)}
										columns={4}
									/>
								{/snippet}
							</SettingsItem>

							<SettingsItem label="Clear Cache" description="Remove cached data to free up storage">
								{#snippet control()}
									<Button
										type="button"
										variant="danger"
										size="sm"
										disabled={clearingCache}
										onclick={clearCache}
									>
										{#if clearingCache}
											<RefreshCw class="size-4 animate-spin" />
											Clearing...
										{:else}
											<Trash2 class="size-4" />
											Clear Cache
										{/if}
									</Button>
								{/snippet}
							</SettingsItem>

							<SettingsItem label="Clear Offline Data" description="Remove all IndexedDB data">
								{#snippet control()}
									<Button
										type="button"
										variant="danger"
										size="sm"
										disabled={clearingOffline}
										onclick={clearOfflineData}
									>
										{#if clearingOffline}
											<RefreshCw class="size-4 animate-spin" />
											Clearing...
										{:else}
											<HardDrive class="size-4" />
											Clear All Data
										{/if}
									</Button>
								{/snippet}
							</SettingsItem>

							<SettingsItem label="Clear Characters" description="Remove all character data">
								{#snippet control()}
									<Button
										type="button"
										variant="danger"
										size="sm"
										disabled={clearingCharacters}
										onclick={clearCharacterData}
									>
										{#if clearingCharacters}
											<RefreshCw class="size-4 animate-spin" />
											Clearing...
										{:else}
											<Sword class="size-4" />
											Clear Characters
										{/if}
									</Button>
								{/snippet}
							</SettingsItem>

							<SettingsItem
								label="Reset Settings"
								description="Restore both synced and device-only preferences to their defaults"
								divider={false}
							>
								{#snippet control()}
									<Button
										type="button"
										variant="secondary"
										size="sm"
										disabled={resettingSettings}
										onclick={resetAllSettings}
									>
										{#if resettingSettings}
											<RefreshCw class="size-4 animate-spin" />
											Resetting...
										{:else}
											<RotateCcw class="size-4" />
											Reset All
										{/if}
									</Button>
								{/snippet}
							</SettingsItem>
						</SettingsGroup>
					</section></Tabs.Content
				>

				<!-- 4. User & Account Section -->
				<Tabs.Content value="account" class={settingsTabContentClass}>
					<section id="account" class={settingsPanelFrameClass}>
						<SettingsGroup
							id="account"
							title="User & Account"
							description="Manage your account and session"
							icon={Users}
							index={4}
							accentColor="var(--gem-ruby)"
						>
							{#if user}
								<SettingsItem label="Username" description={user.username}>
									{#snippet control()}
										<span class="text-sm font-medium text-[var(--color-text-primary)]"
											>{user.username}</span
										>
									{/snippet}
								</SettingsItem>

								{#if user.email}
									<SettingsItem label="Email" description={user.email}>
										{#snippet control()}
											<span class="text-sm text-[var(--color-text-secondary)]">{user.email}</span>
										{/snippet}
									</SettingsItem>
								{/if}

								<SettingsItem label="Account Type" description="Authentication method">
									{#snippet control()}
										<div class="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5">
											<span class="text-xs font-medium text-green-400">Authenticated</span>
										</div>
									{/snippet}
								</SettingsItem>

								<SettingsItem label="Session" description={sessionInfo?.text ?? 'Unknown'}>
									{#snippet control()}
										<div class="flex items-center gap-2">
											{#if sessionInfo?.valid}
												<span class="flex items-center gap-1 text-xs text-green-400">
													<Clock class="size-3" />
													Active
												</span>
											{:else}
												<span class="flex items-center gap-1 text-xs text-yellow-400">
													<Clock class="size-3" />
													Expiring
												</span>
											{/if}
										</div>
									{/snippet}
								</SettingsItem>

								<SettingsItem
									label="Account Created"
									description={formatDate(user.createdAt)}
									divider={false}
								>
									{#snippet control()}
										<span class="text-sm text-[var(--color-text-secondary)]"
											>{formatDate(user.createdAt)}</span
										>
									{/snippet}
								</SettingsItem>

								<div class="pt-4">
									<form
										id="logout-form"
										method="POST"
										action="?/logout"
										use:enhance={() => {
											loggingOut = true;
											return async ({ result }) => {
												loggingOut = false;
												if (result.type === 'redirect') {
													goto(result.location, { invalidateAll: true });
												}
											};
										}}
									>
										<Button
											type="button"
											variant="danger"
											size="lg"
											class="w-full"
											disabled={loggingOut}
											onclick={() => (showLogoutDialog = true)}
										>
											{#if loggingOut}
												<RefreshCw class="size-5 animate-spin" />
												Signing out...
											{:else}
												<LogOut class="size-5" />
												Sign Out
											{/if}
										</Button>
									</form>
								</div>
							{:else}
								<div class="py-8 text-center">
									<User class="mx-auto mb-3 size-12 text-gray-500" />
									<p class="text-gray-400">Not signed in</p>
									<Button href="/login" variant="primary" size="sm" class="mt-4">Sign In</Button>
								</div>
							{/if}
						</SettingsGroup>
					</section></Tabs.Content
				>

				<!-- 5. About Section -->
				<Tabs.Content value="about" class={settingsTabContentClass}>
					<section id="about" class={settingsPanelFrameClass}>
						<SettingsGroup
							id="about"
							title="About"
							description="Information about your grimoire"
							icon={Info}
							index={5}
							accentColor="var(--gem-pearl)"
						>
							<SettingsItem
								label="Application"
								description="Grimar Hermetica - Your D&D 5e Companion"
							>
								{#snippet control()}
									<span class="text-sm font-medium text-[var(--color-text-primary)]"
										>Grimar Hermetica</span
									>
								{/snippet}
							</SettingsItem>

							<SettingsItem label="Version" description="Current application version">
								{#snippet control()}
									<div class="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5">
										<span class="text-xs font-medium text-purple-400">v1.0.0</span>
									</div>
								{/snippet}
							</SettingsItem>

							<SettingsItem label="Build" description="Self-hosted D&D 5e Grimoire">
								{#snippet control()}
									<span class="text-sm text-[var(--color-text-secondary)]">Local Build</span>
								{/snippet}
							</SettingsItem>

							<SettingsItem
								label="License"
								description="Open source under MIT License"
								divider={false}
							>
								{#snippet control()}
									<a
										href="https://github.com"
										target="_blank"
										rel="noopener noreferrer"
										class="text-sm text-purple-400 hover:underline"
									>
										View on GitHub
									</a>
								{/snippet}
							</SettingsItem>
						</SettingsGroup>
					</section></Tabs.Content
				>
			</main></Tabs.Root
		>
	</div>

	<!-- Theme Import Dialog -->
	<Dialog.Root bind:open={showImportDialog}>
		<Dialog.Content class="sm:max-w-[500px]">
			<Dialog.Header>
				<Dialog.Title>Import Theme</Dialog.Title>
				<Dialog.Description>
					Paste a theme JSON below or upload a file. Imported themes are stored locally in your
					browser.
				</Dialog.Description>
			</Dialog.Header>
			<div class="py-4">
				<textarea
					bind:value={importText}
					placeholder={'{"id": "my-theme", "name": "My Theme", "colors": {...}, ...}'}
					class="min-h-[200px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
				></textarea>
				{#if importError}
					<p class="mt-2 text-sm text-red-400">{importError}</p>
				{/if}
			</div>
			<Dialog.Footer>
				<Button variant="secondary" onclick={handleImportFromFile}>
					<Upload class="size-4" />
					Upload File
				</Button>
				<Button variant="primary" disabled={importingTheme} onclick={handleImportFromText}>
					{#if importingTheme}
						<RefreshCw class="size-4 animate-spin" />
						Importing...
					{:else}
						Import
					{/if}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Confirmation Dialogs -->
	<Dialog.Confirm
		bind:open={showClearCacheDialog}
		title="Clear Cache"
		description="This will remove all cached data from your browser's local storage. Your settings will be preserved."
		confirmText="Clear Cache"
		variant="danger"
		icon={Trash2}
		onconfirm={confirmClearCache}
		onclose={() => (showClearCacheDialog = false)}
	/>

	<Dialog.Confirm
		bind:open={showClearOfflineDialog}
		title="Clear All Data"
		description="This will remove all offline data from IndexedDB. This includes cached compendium data and any locally stored information. Are you sure?"
		confirmText="Clear All Data"
		variant="danger"
		icon={HardDrive}
		onconfirm={confirmClearOfflineData}
		onclose={() => (showClearOfflineDialog = false)}
	/>

	<Dialog.Confirm
		bind:open={showClearCharactersDialog}
		title="Clear Characters"
		description="This will remove all character data. This action cannot be undone. Are you sure?"
		confirmText="Clear Characters"
		variant="danger"
		icon={Sword}
		onconfirm={confirmClearCharacterData}
		onclose={() => (showClearCharactersDialog = false)}
	/>

	<Dialog.Confirm
		bind:open={showResetDialog}
		title="Reset Settings"
		description="This will reset all settings to their default values. This action cannot be undone. Are you sure?"
		confirmText="Reset All"
		icon={RotateCcw}
		onconfirm={confirmResetSettings}
		onclose={() => (showResetDialog = false)}
	/>

	<Dialog.Confirm
		bind:open={showLogoutDialog}
		title="Sign Out"
		description="Are you sure you want to sign out? You'll need to authenticate again to access your account."
		confirmText="Sign Out"
		variant="danger"
		icon={LogOut}
		onconfirm={confirmLogout}
		onclose={() => (showLogoutDialog = false)}
	/>
</div>
