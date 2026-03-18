<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { pwaInfo } from 'virtual:pwa-info';
	import AppShell from '$lib/components/layout/AppShell.svelte';
	import DebugControls from '$lib/components/ui/DebugControls.svelte';
	import { initThemeSync, initTheme } from '$lib/core/client/themeStore.svelte';
	import ClientQueryProvider from '$lib/components/ui/ClientQueryProvider.svelte';
	import { createQueryClient, setQueryClient } from '$lib/core/client/query-client';
	import { startCacheSync } from '$lib/core/client/cache-sync';
	import { browser } from '$app/environment';

	// Initialize theme synchronously before first render to prevent FOUC
	initThemeSync();

	let { data, children } = $props();
	const webManifestLink =
		typeof pwaInfo?.webManifest?.linkTag === 'string' &&
		pwaInfo.webManifest.linkTag.length > 0 &&
		!pwaInfo.webManifest.linkTag.includes('href="false"')
			? pwaInfo.webManifest.linkTag
			: '';

	// Create QueryClient synchronously - needed for SSR and initial render
	const queryClient = createQueryClient();
	setQueryClient(queryClient);

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

<AppShell user={data.shellUser}>
	<ClientQueryProvider client={queryClient}>
		{@render children()}
	</ClientQueryProvider>
</AppShell>

<DebugControls />
