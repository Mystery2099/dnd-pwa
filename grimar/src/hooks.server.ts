import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handleAuth } from '$lib/server/services/auth';
import { startCacheCleanup } from '$lib/server/utils/cache';
import { createRequestLogger } from '$lib/server/utils/monitoring';

// Combine request logging with auth handling
const composedHandle = sequence(createRequestLogger(), handleAuth);
let cacheCleanupInitialized = false;

function ensureCacheCleanupStarted(): void {
	if (cacheCleanupInitialized) return;
	startCacheCleanup(60 * 1000); // Clean every minute
	cacheCleanupInitialized = true;
}

export const handle: Handle = async ({ event, resolve }) => {
	ensureCacheCleanupStarted();
	return composedHandle({ event, resolve });
};

export const handleError: HandleServerError = ({ error, event, status, message }) => {
	console.error('[handleError]', {
		status,
		message,
		method: event.request.method,
		path: event.url.pathname,
		requestId: event.locals.requestId,
		error
	});

	if (error instanceof Error) {
		console.error(error.stack);
	}

	return {
		message: 'Internal Server Error'
	};
};
