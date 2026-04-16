<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { onNavigate } from '$app/navigation';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { pwaInfo } from 'virtual:pwa-info';
	import AppShell from '$lib/components/layout/AppShell.svelte';
	import DebugControls from '$lib/components/ui/DebugControls.svelte';
	import { initThemeSync, initTheme } from '$lib/core/client/themeStore.svelte';
	import ClientQueryProvider from '$lib/components/ui/ClientQueryProvider.svelte';
	import { createQueryClient, setQueryClient } from '$lib/core/client/query-client';
	import { startCacheSync } from '$lib/core/client/cache-sync';
	import { BUILTIN_THEME_IDS, THEME_FONT_HREF_BY_ID } from '$lib/core/client/themeAssets';

	// Initialize theme synchronously before first render to prevent FOUC
	initThemeSync();

	let { data, children } = $props();
	const webManifestLink =
		typeof pwaInfo?.webManifest?.linkTag === 'string' &&
		pwaInfo.webManifest.linkTag.length > 0 &&
		!pwaInfo.webManifest.linkTag.includes('href="false"')
			? pwaInfo.webManifest.linkTag
			: '';
	const themeBootScript = `<script>(function(){try{var theme=localStorage.getItem('grimar-theme');var validThemes=${JSON.stringify(BUILTIN_THEME_IDS)};if(validThemes.indexOf(theme)===-1){return;}document.documentElement.setAttribute('data-theme',theme);var saveData='connection' in navigator&&Boolean(navigator.connection&&navigator.connection.saveData);if(saveData){return;}var fontHrefs=${JSON.stringify(THEME_FONT_HREF_BY_ID)};var href=fontHrefs[theme];if(!href||document.querySelector('link[data-theme-fonts=\"'+theme+'\"]')){return;}if(!document.querySelector('link[data-theme-font-preconnect=\"googleapis\"]')){var googleApisPreconnect=document.createElement('link');googleApisPreconnect.rel='preconnect';googleApisPreconnect.href='https://fonts.googleapis.com';googleApisPreconnect.setAttribute('data-theme-font-preconnect','googleapis');document.head.appendChild(googleApisPreconnect);}if(!document.querySelector('link[data-theme-font-preconnect=\"gstatic\"]')){var gstaticPreconnect=document.createElement('link');gstaticPreconnect.rel='preconnect';gstaticPreconnect.href='https://fonts.gstatic.com';gstaticPreconnect.crossOrigin='anonymous';gstaticPreconnect.setAttribute('data-theme-font-preconnect','gstatic');document.head.appendChild(gstaticPreconnect);}var themeFontLink=document.createElement('link');themeFontLink.rel='stylesheet';themeFontLink.href=href;themeFontLink.setAttribute('data-theme-fonts',theme);document.head.appendChild(themeFontLink);}catch(error){console.warn('Theme boot failed',error);}})();<\/script>`;

	// Create QueryClient synchronously - needed for SSR and initial render
	const queryClient = createQueryClient();
	setQueryClient(queryClient);

	type ViewTransitionCapableDocument = Document & {
		startViewTransition?: (update: () => Promise<void> | void) => { finished: Promise<void> };
	};

	if (browser) {
		onNavigate((navigation) => {
			const documentWithTransitions = document as ViewTransitionCapableDocument;
			if (!documentWithTransitions.startViewTransition) {
				return;
			}

			return new Promise<void>((resolve) => {
				documentWithTransitions.startViewTransition(async () => {
					resolve();
					await navigation.complete;
				});
			});
		});
	}

	onMount(async () => {
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
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html themeBootScript}
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
