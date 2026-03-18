<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { pwaInfo } from 'virtual:pwa-info';
	import AppShell from '$lib/components/layout/AppShell.svelte';
	import GlobalHeader from '$lib/components/layout/GlobalHeader.svelte';
	import OfflineIndicator from '$lib/components/ui/OfflineIndicator.svelte';
	import DebugControls from '$lib/components/ui/DebugControls.svelte';
	import PerfTelemetryPanel from '$lib/components/ui/PerfTelemetryPanel.svelte';
	import RouteSkeletonOverlay from '$lib/components/ui/RouteSkeletonOverlay.svelte';
	import { page, navigating } from '$app/state';
	import { initThemeSync, initTheme } from '$lib/core/client/themeStore.svelte';
	import ClientQueryProvider from '$lib/components/ui/ClientQueryProvider.svelte';
	import { createQueryClient, setQueryClient } from '$lib/core/client/query-client';
	import { startCacheSync } from '$lib/core/client/cache-sync';
	import { browser } from '$app/environment';

	// Initialize theme synchronously before first render to prevent FOUC
	initThemeSync();

	let { children } = $props();
	const webManifestLink =
		typeof pwaInfo?.webManifest?.linkTag === 'string' &&
		pwaInfo.webManifest.linkTag.length > 0 &&
		!pwaInfo.webManifest.linkTag.includes('href="false"')
			? pwaInfo.webManifest.linkTag
			: '';

	// Create QueryClient synchronously - needed for SSR and initial render
	const queryClient = createQueryClient();
	setQueryClient(queryClient);
	let showNoiseOverlay = $state(false);
	let showRouteSkeleton = $state(false);
	let routeSkeletonTimer: ReturnType<typeof setTimeout> | null = null;

	function shouldLoadExternalFont(): boolean {
		const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
		const prefersReducedData =
			'navigator' in window &&
			'connection' in navigator &&
			Boolean(
				(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
			);
		return isDesktop && !prefersReducedData;
	}

	function loadInterFontAsync(): void {
		if (!shouldLoadExternalFont()) return;
		if (document.querySelector('link[data-font="inter"]')) return;

		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
		link.setAttribute('data-font', 'inter');
		document.head.appendChild(link);
	}

	onMount(async () => {
		showNoiseOverlay =
			window.matchMedia('(min-width: 1024px)').matches &&
			window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
		loadInterFontAsync();

		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({ immediate: true });
		}

		// Initialize persistence in background (doesn't block rendering)
		const { initializePersistence } = await import('$lib/core/client/query-client');
		await initializePersistence(queryClient);

		// Start cache sync for SSE invalidation
		if (browser) {
			startCacheSync();
		}

		// Capture user-centric rendering metrics in production.
		if (browser && !import.meta.env.DEV) {
			const { startWebVitalsReporting } = await import('$lib/core/client/web-vitals');
			startWebVitalsReporting();
		}

		// Initialize theme from localStorage
		initTheme();
	});

	// Simple active link helper
	function isActive(href: string) {
		return page.url.pathname.startsWith(href)
			? 'text-[var(--color-text-primary)] font-semibold drop-shadow-[0_0_8px_color-mix(in_srgb,var(--color-text-primary)_50%,transparent)]'
			: 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors';
	}

	let navigatingPath = $derived(navigating.to?.url.pathname ?? '');
	let showRouteProgress = $derived(Boolean(navigatingPath));

	$effect(() => {
		if (routeSkeletonTimer) {
			clearTimeout(routeSkeletonTimer);
			routeSkeletonTimer = null;
		}

		if (!showRouteProgress) {
			showRouteSkeleton = false;
			return;
		}

		showRouteSkeleton = false;
		routeSkeletonTimer = setTimeout(() => {
			showRouteSkeleton = true;
		}, 180);

		return () => {
			if (routeSkeletonTimer) {
				clearTimeout(routeSkeletonTimer);
				routeSkeletonTimer = null;
			}
		};
	});
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
	<!-- Only render web manifest if it's valid and safe -->
	{#if webManifestLink && webManifestLink.includes('<link')}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html webManifestLink}
	{/if}
</svelte:head>

{#if showNoiseOverlay}
	<!-- Noise Overlay -->
	<div
		class="pointer-events-none fixed inset-0 z-50 opacity-40 mix-blend-overlay"
		style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E&quot;);"
	></div>
{/if}

{#if showRouteProgress && showRouteSkeleton}
	<div class="route-progress fixed top-0 right-0 left-0 z-[70] h-1"></div>
	<RouteSkeletonOverlay pathname={navigatingPath} />
{/if}

{#snippet header()}
	<GlobalHeader homeHref="/dashboard" />
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
			class="pointer-events-none rounded-lg px-3 py-2 opacity-50 hover:bg-[var(--color-bg-card)] {isActive(
				'/characters'
			)}"
			href="/characters">Characters</a
		>
		<a
			class="pointer-events-none rounded-lg px-3 py-2 opacity-50 hover:bg-[var(--color-bg-card)] {isActive(
				'/forge'
			)}"
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
	<ClientQueryProvider client={queryClient}>
		{@render children()}
	</ClientQueryProvider>
</AppShell>

<PerfTelemetryPanel />
<DebugControls />
