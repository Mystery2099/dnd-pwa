import type { Handle } from '@sveltejs/kit';
import { handleAuth } from '$lib/server/services/auth/service';
import { startCacheCleanup } from '$lib/server/cache';

// Initialize cache cleanup when app starts
startCacheCleanup(60 * 1000); // Clean every minute

export const handle: Handle = handleAuth;
