// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { AuthUser } from '$lib/server/services/auth/auth-types';

declare global {
	namespace App {
		interface Locals {
			user: AuthUser | null;
			requestId?: string;
		}
	}
}

export {};
