/**
 * Cache Events SSE Endpoint
 *
 * GET /api/cache/events
 * Server-Sent Events stream for cache invalidation notifications.
 */

import type { RequestHandler } from './$types';
import { getVersionJson, getHeartbeatEvent } from '$lib/server/cache-version';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

/**
 * GET /api/cache/events
 * Returns a Server-Sent Events stream for cache updates.
 */
export const GET: RequestHandler = async () => {
	let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

	const stream = new ReadableStream({
		start(ctrl) {
			// Send initial version update event
			ctrl.enqueue(`data: ${getVersionJson()}\n\n`);

			// Set up heartbeat interval
			heartbeatInterval = setInterval(() => {
				try {
					ctrl.enqueue(`data: ${getHeartbeatEvent()}\n\n`);
				} catch {
					if (heartbeatInterval) {
						clearInterval(heartbeatInterval);
						heartbeatInterval = null;
					}
				}
			}, HEARTBEAT_INTERVAL);
		},
		cancel() {
			// Cleanup when client disconnects
			if (heartbeatInterval) {
				clearInterval(heartbeatInterval);
				heartbeatInterval = null;
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});
};
