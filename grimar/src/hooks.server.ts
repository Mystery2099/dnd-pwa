import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handleAuth } from '$lib/server/services/auth/auth-service';
import { startCacheCleanup } from '$lib/server/utils/cache';
import { createRequestLogger } from '$lib/server/utils/monitoring';

// Initialize cache cleanup when app starts
startCacheCleanup(60 * 1000); // Clean every minute

// Combine request logging with auth handling
export const handle: Handle = sequence(createRequestLogger(), handleAuth);
