import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'Grimar D&D Compendium',
				short_name: 'Grimar',
				description: 'Offline-capable D&D 5e Compendium',
				theme_color: '#1f2937',
				background_color: '#030712',
				display: 'standalone',
				icons: [
					{
						src: '/icon-192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/icon-512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			},
			strategies: 'generateSW',
			workbox: {
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/api\.open5e\.com\/.*/i,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'open5e-api-cache',
							expiration: {
								maxEntries: 1000,
								maxAgeSeconds: 24 * 60 * 60 // 24 hours
							}
						}
					},
					{
						// Cache compendium export for offline seeding
						urlPattern: /\/api\/compendium\/export\?full=true/i,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'compendium-export-cache',
							expiration: {
								maxEntries: 1,
								maxAgeSeconds: 24 * 60 * 60 // 24 hours
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						urlPattern: /^https?:\/\/.*\/api\/.*/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 10 * 60 // 10 minutes
							}
						}
					},
					{
						urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'images-cache',
							expiration: {
								maxEntries: 500,
								maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
							}
						}
					},
					{
						urlPattern: /\.(?:js|css)$/i,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'static-resources',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 24 * 60 * 60 // 24 hours
							}
						}
					}
				]
			}
		})
	]
});
