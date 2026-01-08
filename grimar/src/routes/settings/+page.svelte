<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Palette,
		Cog,
		Info,
		User,
		LogOut,
		Trash2,
		Download,
		Eye,
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
	import CycleButton from '$lib/components/ui/CycleButton.svelte';
	import RadioCardGrid from '$lib/components/ui/RadioCardGrid.svelte';
	import SettingsGroup from '$lib/components/ui/SettingsGroup.svelte';
	import SettingsItem from '$lib/components/ui/SettingsItem.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SettingsNavigation from '$lib/components/ui/SettingsNavigation.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { NavSection } from '$lib/components/ui/SettingsNavigation.svelte';
	import {
		settingsStore,
		FONT_SIZE_OPTIONS,
		ANIMATION_LEVEL_OPTIONS,
		SYNC_INTERVAL_OPTIONS,
		GRID_MAX_COLUMNS_OPTIONS,
		SPELL_SORT_OPTIONS
	} from '$lib/core/client/settingsStore.svelte';

	let { data } = $props();

	// Local reference for TypeScript null tracking
	let user = $derived(data.user ?? null);

	// Form states
	let clearingCache = $state(false);
	let clearingOffline = $state(false);
	let clearingCharacters = $state(false);
	let resettingSettings = $state(false);
	let loggingOut = $state(false);

	// Local bindings for segmented controls (convert to/from strings)
	let gridMaxColumns = $state(settingsStore.settings.gridMaxColumns.toString());

	// Sync local bindings back to store
	$effect(() => {
		settingsStore.setGridMaxColumns(Number(gridMaxColumns));
	});

	// Confirmation dialogs
	let showClearCacheDialog = $state(false);
	let showClearOfflineDialog = $state(false);
	let showClearCharactersDialog = $state(false);
	let showLogoutDialog = $state(false);
	let showResetDialog = $state(false);

	// Define sections data for navigation
	const sections: NavSection[] = [
		{
			id: 'appearance',
			label: 'Appearance',
			icon: Palette,
			description: 'Theme, fonts, animations'
		},
		{
			id: 'compendium',
			label: 'Compendium',
			icon: Book,
			description: 'Views, sync, badges'
		},
		{
			id: 'data',
			label: 'Data & Sync',
			icon: RefreshCw,
			description: 'Offline, cache, export'
		},
		{
			id: 'accessibility',
			label: 'Accessibility',
			icon: Eye,
			description: 'Motion, contrast, input'
		},
		{
			id: 'account',
			label: 'User & Account',
			icon: Users,
			description: 'Profile, session, logout'
		},
		{
			id: 'about',
			label: 'About',
			icon: Info,
			description: 'Version, license, info'
		}
	];

	// Track active section
	let activeSection = $state('appearance');

	// IntersectionObserver to detect visible section
	let observer: IntersectionObserver | undefined;

	$effect(() => {
		// Set up observer after component mounts
		if (typeof window !== 'undefined') {
			const options = {
				rootMargin: '-20% 0px -60% 0px', // Trigger when section is near top
				threshold: 0
			};

			observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						activeSection = entry.target.id;
					}
				});
			}, options);

			// Observe all sections
			sections.forEach((section) => {
				const element = document.getElementById(section.id);
				if (element) observer?.observe(element);
			});

			// Cleanup
			return () => observer?.disconnect();
		}
	});

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
			<h1 class="text-3xl font-black tracking-tight text-white">Settings</h1>
			<p class="text-sm text-[var(--color-text-secondary)]">Configure your grimoire experience</p>
		</div>
	</header>

	<!-- Quick Navigation -->
	<SettingsNavigation {sections} {activeSection} class="mb-8" />

	<div class="grid max-w-4xl grid-cols-1 gap-8">
		<!-- 1. Appearance Section -->
		<SettingsGroup
			id="appearance"
			title="Appearance"
			description="Customize the visual experience of your grimoire"
			icon={Palette}
			index={0}
		>
			<!-- Theme switcher using card-based selector -->
			<div class="w-full py-4">
				<ThemeCardSelector />
			</div>

			<SettingsItem label="Font Size" description="Adjust text size for readability">
				{#snippet control()}
					<SegmentedControl
						bind:value={settingsStore.settings.fontSize}
						options={FONT_SIZE_OPTIONS}
						size="sm"
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem label="Compact Mode" description="Use a denser layout with smaller spacing">
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.compactMode}
						onchange={(v: boolean) => settingsStore.setCompactMode(v)}
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Animation Level"
				description="Control the intensity of animations"
				divider={false}
			>
				{#snippet control()}
					<SegmentedControl
						bind:value={settingsStore.settings.animationLevel}
						options={ANIMATION_LEVEL_OPTIONS}
						size="sm"
					/>
				{/snippet}
			</SettingsItem>
		</SettingsGroup>

		<!-- 2. Compendium Section -->
		<SettingsGroup
			id="compendium"
			title="Compendium"
			description="Configure how you browse spells, monsters, and items"
			icon={Book}
			index={1}
		>
			<SettingsItem label="Default View" description="Choose how compendium items are displayed">
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.defaultCompendiumView === 'grid'}
						onchange={(v: boolean) => settingsStore.setDefaultCompendiumView(v ? 'grid' : 'list')}
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem label="Max Grid Columns" description="Maximum columns in grid view">
				{#snippet control()}
					<SegmentedControl
						bind:value={gridMaxColumns}
						options={GRID_MAX_COLUMNS_OPTIONS}
						size="sm"
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Show SRD Badges"
				description="Display indicator for System Reference Document content"
			>
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.showSRDBadge}
						onchange={(v: boolean) => settingsStore.setShowSRDBadge(v)}
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Sync on Load"
				description="Automatically sync compendium when page loads"
			>
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.syncOnLoad}
						onchange={(v: boolean) => settingsStore.setSyncOnLoad(v)}
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Show Advanced 5e Content"
				description="Display content from the Advanced 5e (A5e) expansion"
			>
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.showA5eContent}
						onchange={(v: boolean) => settingsStore.setShowA5eContent(v)}
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem label="Spell Sort Order" description="How spells are ordered in lists">
				{#snippet control()}
					<SegmentedControl
						bind:value={settingsStore.settings.spellSortOrder}
						options={SPELL_SORT_OPTIONS}
						size="sm"
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Auto-Expand Details"
				description="Automatically expand item details when navigating"
				divider={false}
			>
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.autoExpandDetails}
						onchange={(v: boolean) => settingsStore.setAutoExpandDetails(v)}
					/>
				{/snippet}
			</SettingsItem>
		</SettingsGroup>

		<!-- 3. Data & Sync Section -->
		<SettingsGroup
			id="data"
			title="Data & Sync"
			description="Manage offline data and synchronization"
			icon={RefreshCw}
			index={2}
		>
			<SettingsItem label="Offline Data" description="Enable caching for offline use">
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.offlineEnabled}
						onchange={(v: boolean) => settingsStore.setOfflineEnabled(v)}
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem label="Auto-Sync Interval" description="How often to automatically sync data">
				{#snippet control()}
					<RadioCardGrid
						name="autoSyncInterval"
						options={SYNC_INTERVAL_OPTIONS}
						value={settingsStore.settings.autoSyncInterval}
						onchange={(v) =>
							settingsStore.setAutoSyncInterval(v as 'never' | '15min' | '30min' | '1h')}
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
					<Button variant="outline" size="sm">
						<Download class="size-4" />
						Export
					</Button>
				{/snippet}
			</SettingsItem>

			<SettingsItem label="Import Data" description="Restore settings and data from backup">
				{#snippet control()}
					<Button variant="outline" size="sm">
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
						variant="outline"
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

		<!-- 4. Accessibility Section -->
		<SettingsGroup
			id="accessibility"
			title="Accessibility"
			description="Configure accessibility and input preferences"
			icon={Eye}
			index={3}
		>
			<SettingsItem label="Reduced Motion" description="Minimize animations for motion sensitivity">
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.reducedMotion}
						onchange={(v: boolean) => settingsStore.setReducedMotion(v)}
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem label="High Contrast" description="Increase visual contrast for better clarity">
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.highContrast}
						onchange={(v: boolean) => settingsStore.setHighContrast(v)}
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Keyboard Shortcuts"
				description="Enable keyboard navigation and shortcuts"
				divider={false}
			>
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.keyboardShortcuts}
						onchange={(v: boolean) => settingsStore.setKeyboardShortcuts(v)}
					/>
				{/snippet}
			</SettingsItem>
		</SettingsGroup>

		<!-- 5. User & Account Section -->
		<SettingsGroup
			id="account"
			title="User & Account"
			description="Manage your account and session"
			icon={Users}
			index={4}
		>
			{#if user}
				<SettingsItem label="Username" description={user.username}>
					{#snippet control()}
						<span class="text-sm font-medium text-[var(--color-text-primary)]">{user.username}</span
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
						method="POST"
						action="?/logout"
						use:enhance={() => {
							loggingOut = true;
							return async ({ update }) => {
								await update();
								loggingOut = false;
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
					<Button href="/login" variant="gem" size="sm" class="mt-4">Sign In</Button>
				</div>
			{/if}
		</SettingsGroup>

		<!-- 6. About Section -->
		<SettingsGroup
			id="about"
			title="About"
			description="Information about your grimoire"
			icon={Info}
			index={5}
		>
			<SettingsItem label="Application" description="Grimar Hermetica - Your D&D 5e Companion">
				{#snippet control()}
					<span class="text-sm font-medium text-[var(--color-text-primary)]">Grimar Hermetica</span>
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

			<SettingsItem label="License" description="Open source under MIT License" divider={false}>
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
	</div>

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
