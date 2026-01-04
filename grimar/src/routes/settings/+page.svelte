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
		Database,
		Accessibility
	} from 'lucide-svelte';
	import ThemeSwitcher from '$lib/components/ui/ThemeSwitcher.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import SelectCard from '$lib/components/ui/SelectCard.svelte';
	import SettingsGroup from '$lib/components/ui/SettingsGroup.svelte';
	import SettingsItem from '$lib/components/ui/SettingsItem.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SurfaceCard from '$lib/components/ui/SurfaceCard.svelte';
	import SettingsNavigation from '$lib/components/ui/SettingsNavigation.svelte';
	import type { NavSection } from '$lib/components/ui/SettingsNavigation.svelte';
	import {
		settingsStore,
		FONT_SIZE_OPTIONS,
		ANIMATION_LEVEL_OPTIONS,
		COMPENDIUM_VIEW_OPTIONS,
		ITEMS_PER_PAGE_OPTIONS,
		SYNC_INTERVAL_OPTIONS
	} from '$lib/core/client/settingsStore.svelte';

	let { data } = $props();

	// Local reference for TypeScript null tracking
	let user = $derived(data.user ?? null);

	// Form states
	let clearingCache = $state(false);
	let clearingOffline = $state(false);
	let loggingOut = $state(false);

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
		clearingCache = true;
		try {
			const keys = Object.keys(localStorage).filter((key) => key.startsWith('grimar-'));
			keys.forEach((key) => localStorage.removeItem(key));
			console.log('[Settings] Cache cleared successfully');
		} catch (error) {
			console.error('[Settings] Failed to clear cache:', error);
		} finally {
			clearingCache = false;
		}
	}

	async function clearOfflineData() {
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
		}
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
				class="size-7 text-[var(--color-accent)]"
				style="filter: drop-shadow(0 0 8px var(--color-accent-glow))"
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
			<SettingsItem
				label="Theme"
				description="Choose a magical essence for your interface"
				category="appearance"
			>
				{#snippet control()}
					<div class="w-full max-w-md">
						<ThemeSwitcher />
					</div>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Font Size"
				description="Adjust text size for readability"
				category="appearance"
			>
				{#snippet control()}
					<SelectCard
						value={settingsStore.settings.fontSize}
						options={FONT_SIZE_OPTIONS}
						onchange={(v) => settingsStore.setFontSize(v as 'sm' | 'md' | 'lg' | 'xl')}
						gridCols={2}
						label=""
						class="w-48"
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Compact Mode"
				description="Use a denser layout with smaller spacing"
				category="appearance"
			>
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.compactMode}
						onchange={(v) => settingsStore.setCompactMode(v)}
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Animation Level"
				description="Control the intensity of animations"
				category="appearance"
				divider={false}
			>
				{#snippet control()}
					<SelectCard
						value={settingsStore.settings.animationLevel}
						options={ANIMATION_LEVEL_OPTIONS}
						onchange={(v) => settingsStore.setAnimationLevel(v as 'full' | 'reduced' | 'minimal')}
						gridCols={3}
						label=""
						class="w-64"
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
			<SettingsItem
				label="Default View"
				description="Choose how compendium items are displayed"
				category="compendium"
			>
				{#snippet control()}
					<SelectCard
						value={settingsStore.settings.defaultCompendiumView}
						options={COMPENDIUM_VIEW_OPTIONS}
						onchange={(v) => settingsStore.setDefaultCompendiumView(v as 'grid' | 'list')}
						gridCols={2}
						label=""
						class="w-48"
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Items Per Page"
				description="Number of items shown in lists"
				category="compendium"
			>
				{#snippet control()}
					<SelectCard
						value={settingsStore.settings.itemsPerPage.toString()}
						options={ITEMS_PER_PAGE_OPTIONS}
						onchange={(v) => settingsStore.setItemsPerPage(Number(v))}
						gridCols={4}
						label=""
						class="w-56"
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Show SRD Badges"
				description="Display indicator for System Reference Document content"
				category="compendium"
			>
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.showSRDBadge}
						onchange={(v) => settingsStore.setShowSRDBadge(v)}
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Sync on Load"
				description="Automatically sync compendium when page loads"
				category="compendium"
				divider={false}
			>
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.syncOnLoad}
						onchange={(v) => settingsStore.setSyncOnLoad(v)}
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
			<SettingsItem
				label="Offline Data"
				description="Enable caching for offline use"
				category="data"
			>
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.offlineEnabled}
						onchange={(v) => settingsStore.setOfflineEnabled(v)}
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Auto-Sync Interval"
				description="How often to automatically sync data"
				category="data"
			>
				{#snippet control()}
					<SelectCard
						value={settingsStore.settings.autoSyncInterval}
						options={SYNC_INTERVAL_OPTIONS}
						onchange={(v) =>
							settingsStore.setAutoSyncInterval(v as 'never' | '15min' | '30min' | '1h')}
						gridCols={2}
						label=""
						class="w-56"
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Clear Cache"
				description="Remove cached data to free up storage"
				category="data"
			>
				{#snippet control()}
					<Button
						type="button"
						variant="outline"
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

			<SettingsItem
				label="Clear Offline Data"
				description="Remove all IndexedDB data"
				category="data"
			>
				{#snippet control()}
					<Button
						type="button"
						variant="outline"
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

			<SettingsItem
				label="Export Data"
				description="Download your settings and data"
				category="data"
				divider={false}
			>
				{#snippet control()}
					<Button variant="outline" size="sm">
						<Download class="size-4" />
						Export
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
			<SettingsItem
				label="Reduced Motion"
				description="Minimize animations for motion sensitivity"
				category="accessibility"
			>
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.reducedMotion}
						onchange={(v) => settingsStore.setReducedMotion(v)}
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="High Contrast"
				description="Increase visual contrast for better clarity"
				category="accessibility"
			>
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.highContrast}
						onchange={(v) => settingsStore.setHighContrast(v)}
					/>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="Keyboard Shortcuts"
				description="Enable keyboard navigation and shortcuts"
				category="accessibility"
				divider={false}
			>
				{#snippet control()}
					<Toggle
						checked={settingsStore.settings.keyboardShortcuts}
						onchange={(v) => settingsStore.setKeyboardShortcuts(v)}
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
				<SettingsItem label="Username" description={user.username} category="account">
					{#snippet control()}
						<span class="text-sm font-medium text-[var(--color-text-primary)]">{user.username}</span
						>
					{/snippet}
				</SettingsItem>

				{#if user.email}
					<SettingsItem label="Email" description={user.email} category="account">
						{#snippet control()}
							<span class="text-sm text-[var(--color-text-secondary)]">{user.email}</span>
						{/snippet}
					</SettingsItem>
				{/if}

				<SettingsItem label="Account Type" description="Authentication method" category="account">
					{#snippet control()}
						<div class="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5">
							<span class="text-xs font-medium text-green-400">Authenticated</span>
						</div>
					{/snippet}
				</SettingsItem>

				<SettingsItem
					label="Session"
					description={sessionInfo?.text ?? 'Unknown'}
					category="account"
				>
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
					category="account"
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
						<Button type="submit" variant="danger" size="lg" class="w-full" disabled={loggingOut}>
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
			<SettingsItem
				label="Application"
				description="Grimar Hermetica - Your D&D 5e Companion"
				category="about"
			>
				{#snippet control()}
					<span class="text-sm font-medium text-[var(--color-text-primary)]">Grimar Hermetica</span>
				{/snippet}
			</SettingsItem>

			<SettingsItem label="Version" description="Current application version" category="about">
				{#snippet control()}
					<div class="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5">
						<span class="text-xs font-medium text-purple-400">v1.0.0</span>
					</div>
				{/snippet}
			</SettingsItem>

			<SettingsItem label="Build" description="Self-hosted D&D 5e Grimoire" category="about">
				{#snippet control()}
					<span class="text-sm text-[var(--color-text-secondary)]">Local Build</span>
				{/snippet}
			</SettingsItem>

			<SettingsItem
				label="License"
				description="Open source under MIT License"
				category="about"
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
	</div>
</div>
