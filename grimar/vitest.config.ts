import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [tailwindcss(), svelte()],
	resolve: {
		alias: {
			$lib: resolve(__dirname, './src/lib'),
			'$app/environment': resolve(__dirname, './src/test/mocks/app-environment.ts')
		}
	},
	test: {
		environment: 'happy-dom',
		environmentMatchGlobs: [['src/**/*.{test,spec}.{ts,tsx}', 'happy-dom']],
		include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts', 'src/**/*.spec.tsx'],
		exclude: ['node_modules', '.git', 'dist', '**/node_modules/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.ts', 'src/**/*.svelte'],
			exclude: [
				'src/**/*.d.ts',
				'src/**/*.test.ts',
				'src/**/*.spec.ts',
				'src/app.d.ts',
				'src/vite-pwa.d.ts',
				'src/lib/types/**/*.ts',
				'src/lib/constants/**/*.ts'
			]
		},
		globals: true,
		setupFiles: ['src/test/setup.ts']
	}
});
