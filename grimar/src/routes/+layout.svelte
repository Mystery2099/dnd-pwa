<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { pwaInfo } from 'virtual:pwa-info';
	import AppShell from '$lib/components/layout/AppShell.svelte';
	import GlobalHeader from '$lib/components/layout/GlobalHeader.svelte';
	import OfflineIndicator from '$lib/components/ui/OfflineIndicator.svelte';
	import CleanupNotification from '$lib/components/ui/CleanupNotification.svelte';
	import { clientCache } from '$lib/core/client/cache';
	import { initializeOfflineExperience } from '$lib/core/client/offline-init';
	import { page } from '$app/state';
	import { initThemeSync, initTheme, logThemesToConsole } from '$lib/core/client/themeStore.svelte';

	// Initialize theme synchronously before first render to prevent FOUC
	initThemeSync();

	let { children } = $props();
	const webManifestLink =
		typeof pwaInfo?.webManifest?.linkTag === 'string' &&
		pwaInfo.webManifest.linkTag.length > 0 &&
		!pwaInfo.webManifest.linkTag.includes('href="false"')
			? pwaInfo.webManifest.linkTag
			: '';

	let cleanupReason = $state<string>('');
	let cleanupDetails = $state<
		| {
				itemsRemoved?: number;
				cacheUsage?: number;
				spaceFreed?: string;
		  }
		| undefined
	>(undefined);

	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({ immediate: true });
		}

		// Initialize offline data for seamless offline experience
		initializeOfflineExperience();

		// Initialize theme from localStorage
		initTheme();

		// Dev-only: Log theme options to console
		if (import.meta.env.DEV) {
			logThemesToConsole();
		}

		// Register for cache cleanup notifications
		clientCache.onCleanup((reason: string) => {
			const usage = clientCache.getCacheStats();
			cleanupReason = reason;
			cleanupDetails = {
				cacheUsage: usage.percentage,
				spaceFreed: `${(usage.used / 1024 / 1024).toFixed(1)}MB`
			};

			// Auto-hide after 8 seconds for cleanup notifications
			setTimeout(() => {
				cleanupReason = '';
				cleanupDetails = undefined;
			}, 8000);
		});
	});

	// Simple active link helper
	function isActive(href: string) {
		return page.url.pathname.startsWith(href)
			? 'text-[var(--color-text-primary)] font-semibold drop-shadow-[0_0_8px_color-mix(in_srgb,var(--color-text-primary)_50%,transparent)]'
			: 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors';
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Theme initialization script - runs before first paint to prevent FOUC -->
	<script>
		(function () {
			var theme = localStorage.getItem('grimar-theme');
			var validThemes = ['amethyst', 'arcane', 'nature', 'fire', 'ice', 'void', 'ocean'];
			if (theme && validThemes.indexOf(theme) !== -1) {
				document.documentElement.setAttribute('data-theme', theme);
			}
		})();
	</script>
	<!-- Preload Inter font (optional, but good for performance if using Google Fonts) -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<!-- Only render web manifest if it's valid and safe -->
	{#if webManifestLink && webManifestLink.includes('<link')}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html webManifestLink}
	{/if}
</svelte:head>

<!-- Noise Overlay -->
<div
	class="pointer-events-none fixed inset-0 z-50 opacity-40 mix-blend-overlay"
	style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E&quot;);"
></div>

<!-- Cleanup Notification -->
{#if cleanupReason}
	<CleanupNotification reason={cleanupReason} details={cleanupDetails} duration={8000} />
{/if}

{#snippet header()}
	<GlobalHeader title="Grimar" homeHref="/dashboard" />
{/snippet}

{#snippet nav()}
	<nav class="flex flex-col gap-1 text-sm font-medium">
		<div
			class="mb-2 px-3 py-2 text-xs font-bold tracking-widest text-[var(--color-text-muted)] uppercase"
		>
			Grimoire
		</div>
		<a
			class="rounded-lg px-3 py-2 hover:bg-[var(--color-bg-card)] {isActive('/dashboard')}"
			href="/dashboard">Dashboard</a
		>
		<a
			class="rounded-lg px-3 py-2 hover:bg-[var(--color-bg-card)] {isActive('/compendium')}"
			href="/compendium">Compendium</a
		>
		<a
			class="rounded-lg px-3 py-2 hover:bg-[var(--color-bg-card)] {isActive('/characters')}"
			href="/characters">Characters</a
		>
		<a
			class="rounded-lg px-3 py-2 hover:bg-[var(--color-bg-card)] {isActive('/forge')}"
			href="/forge">The Forge</a
		>

		<div
			class="mt-4 mb-2 px-3 py-2 text-xs font-bold tracking-widest text-[var(--color-text-muted)] uppercase"
		>
			System
		</div>
		<a
			class="rounded-lg px-3 py-2 hover:bg-[var(--color-bg-card)] {isActive('/settings')}"
			href="/settings">Settings</a
		>

		<!-- Offline Status Indicator -->
		<div class="mt-4">
			<OfflineIndicator showDetails={true} />
		</div>
	</nav>
{/snippet}

<AppShell {header} {nav}>
	{@render children()}
</AppShell>
