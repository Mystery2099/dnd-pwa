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
	let controller: ReadableStreamDefaultController | null = null;

	const stream = new ReadableStream({
		start(ctrl) {
			controller = ctrl;

			// Send initial version update event
			ctrl.enqueue(`data: ${getVersionJson()}\n\n`);

			// Set up heartbeat interval
			const heartbeatInterval = setInterval(() => {
				try {
					ctrl.enqueue(`data: ${getHeartbeatEvent()}\n\n`);
				} catch {
					clearInterval(heartbeatInterval);
				}
			}, HEARTBEAT_INTERVAL);

			// Store interval for cleanup
			(ctrl as any).heartbeatInterval = heartbeatInterval;
		},
		cancel() {
			// Cleanup when client disconnects
			if (controller && (controller as any).heartbeatInterval) {
				clearInterval((controller as any).heartbeatInterval);
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache'
		}
	});
};
