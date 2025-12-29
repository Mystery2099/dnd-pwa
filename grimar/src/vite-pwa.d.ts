/// <reference types="@vite-pwa/sveltekit" />

declare module 'virtual:pwa-info' {
	export const pwaInfo:
		| {
				webManifest: { linkTag: string };
		  }
		| undefined;
}

declare module 'virtual:pwa-register' {
	export function registerSW(options?: {
		immediate?: boolean;
		onRegistered?: (r: ServiceWorkerRegistration | undefined) => void;
		onRegisterError?: (error: unknown) => void;
	}): void;
}
