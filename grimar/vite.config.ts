import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	envDir: '.',
	ssr: {
		noExternal: ['clsx', 'tailwind-merge', 'nanoid', /.*/]
	},
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
						src: '/favicon.svg',
						sizes: '3300x3300',
						type: 'image/svg+xml'
					},
					{
						src: '/favicon.svg',
						sizes: '3300x3300',
						type: 'image/svg+xml',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB for large SVG favicon
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
						// Cache compendium export for offline compendium access
						urlPattern: /\/api\/compendium\/export\?full=true/i,
						handler: 'CacheFirst',
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
						// SSE endpoint - never cache, always network
						urlPattern: /\/api\/cache\/events/i,
						handler: 'NetworkOnly',
						options: {
							cacheName: 'sse-cache'
						}
					},
					{
						// Cache version endpoint - short cache for invalidation checks
						urlPattern: /\/api\/cache\/version/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'cache-version-cache',
							expiration: {
								maxEntries: 5,
								maxAgeSeconds: 60 // 1 minute
							}
						}
					},
					{
						// API routes - always prefer server (server-first architecture)
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
