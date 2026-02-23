<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
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
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import RadioCardGrid from '$lib/components/ui/RadioCardGrid.svelte';
	import SettingsGroup from '$lib/components/ui/SettingsGroup.svelte';
	import SettingsItem from '$lib/components/ui/SettingsItem.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Tabs } from 'bits-ui';
	import { settingsStore, SYNC_INTERVAL_OPTIONS } from '$lib/core/client/settingsStore.svelte';
	import { userSettingsStore } from '$lib/core/client/userSettingsStore.svelte';
	import {
		getImportedThemes,
		importTheme,
		exportTheme,
		deleteImportedTheme,
		getAllThemes
	} from '$lib/core/client/themeRegistry';
	import { setTheme } from '$lib/core/client/themeStore.svelte';
	import type { ThemeConfig } from '$lib/core/types/theme';

	let { data } = $props();

	// Theme import/export state
	let showImportDialog = $state(false);
	let importText = $state('');
	let importError = $state('');
	let importingTheme = $state(false);
	let importedThemes = $state<ThemeConfig[]>([]);

	// Load imported themes
	$effect(() => {
		if (showImportDialog) {
			importedThemes = getImportedThemes();
		}
	});

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

	// Track active section - now bound to Tabs
	let activeSection = $state('appearance');

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
</script>

<svelte:head>
	<title>Settings - Grimar</title>
</svelte:head>

<div class="settings-workspace min-h-screen p-6">
	<!-- Page Header -->
	<header class="mb-6 flex items-center gap-4">
		<div class="rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 p-3">
			<Cog
				class="size-7 text-[var(--color-accent)] drop-shadow-[0_0_8px_var(--color-accent-glow)]"
			/>
		</div>
		<div>
			<h1 class="text-holo text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
				Settings
			</h1>
			<p class="text-sm text-[var(--color-text-secondary)]">Configure your grimoire experience</p>
		</div>
	</header>

	<!-- Two-Column Layout with Tabs -->
	<div class="settings-container">
		<!-- Sidebar Navigation (Tabs) -->
		<aside class="settings-sidebar">
			<Tabs.Root bind:value={activeSection}>
				<nav class="settings-nav">
					{#each sections as section}
						<Tabs.Trigger value={section.id} class="settings-nav-item">
							<span class="nav-icon">
								<section.icon class="size-5" style="color: {section.accent}" />
							</span>
							<span class="nav-label">{section.label}</span>
						</Tabs.Trigger>
					{/each}
				</nav>
			</Tabs.Root>
		</aside>

		<!-- Tab Content Panels -->
		<main class="settings-main">
			<Tabs.Root bind:value={activeSection}>
				<!-- 1. Appearance Section -->
				<Tabs.Content value="appearance" class="settings-tab-content">
					<section id="appearance">
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
											{#each importedThemes as theme}
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
				<Tabs.Content value="compendium" class="settings-tab-content">
					<section id="compendium">
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
								description="Automatically sync compendium when page loads"
								divider={false}
							>
								{#snippet control()}
									<Toggle
										checked={userSettingsStore.data.syncOnLoad}
										onchange={(v: boolean) => userSettingsStore.updateSetting('syncOnLoad', v)}
									/>
								{/snippet}
							</SettingsItem>

							<SettingsItem label="Offline Data" description="Enable caching for offline use">
								{#snippet control()}
									<Toggle
										checked={userSettingsStore.data.offlineEnabled}
										onchange={(v: boolean) => userSettingsStore.updateSetting('offlineEnabled', v)}
									/>
								{/snippet}
							</SettingsItem>

							<SettingsItem
								label="Auto-Sync Interval"
								description="How often to automatically sync data"
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

							<SettingsItem label="Export Data" description="Download your settings and data">
								{#snippet control()}
									<Button variant="secondary" size="sm">
										<Download class="size-4" />
										Export
									</Button>
								{/snippet}
							</SettingsItem>

							<SettingsItem label="Import Data" description="Restore settings and data from backup">
								{#snippet control()}
									<Button variant="secondary" size="sm">
										<Upload class="size-4" />
										Import
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
								description="Restore all settings to defaults"
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

				<!-- 5. User & Account Section -->
				<Tabs.Content value="account" class="settings-tab-content">
					<section id="account">
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

				<!-- 6. About Section -->
				<Tabs.Content value="about" class="settings-tab-content">
					<section id="about">
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
			</Tabs.Root>
		</main>
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
