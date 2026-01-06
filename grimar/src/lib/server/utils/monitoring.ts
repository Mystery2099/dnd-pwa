export interface PerformanceMetric {
	name: string;
	duration: number;
	timestamp: number;
	metadata?: Record<string, any>;
}

export class PerformanceMonitor {
	private static instance: PerformanceMonitor;
	private metrics: PerformanceMetric[] = [];
	private readonly maxMetrics: number = 1000; // Keep last 1000 metrics

	static getInstance(): PerformanceMonitor {
		if (!PerformanceMonitor.instance) {
			PerformanceMonitor.instance = new PerformanceMonitor();
		}
		return PerformanceMonitor.instance;
	}

	record(name: string, duration: number, metadata?: Record<string, any>): void {
		const metric: PerformanceMetric = {
			name,
			duration,
			timestamp: Date.now(),
			metadata
		};

		this.metrics.push(metric);

		// Keep only recent metrics
		if (this.metrics.length > this.maxMetrics) {
			this.metrics = this.metrics.slice(-this.maxMetrics);
		}
	}

	clear(): void {
		this.metrics = [];
	}
}

// Helper function for database operations
export function measureDb<T>(name: string, dbOperation: () => T): T {
	const monitor = PerformanceMonitor.getInstance();
	const start = performance.now();

	try {
		const result = dbOperation();
		const duration = performance.now() - start;
		monitor.record(name, duration, { success: true, type: 'database' });
		return result;
	} catch (error) {
		const duration = performance.now() - start;
		monitor.record(name, duration, {
			success: false,
			error: error instanceof Error ? error.message : String(error),
			type: 'database'
		});
		throw error;
	}
}

import type { Handle, HandleServerError } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import logger, { createModuleLogger } from '$lib/server/logger';

const log = logger.child({ module: 'RequestLogger' }) as ReturnType<typeof createModuleLogger>;

// Request logging middleware
export function createRequestLogger(): Handle {
	return async ({ event, resolve }) => {
		const requestId = event.request.headers.get('x-request-id') || nanoid(8);
		const start = performance.now();

		// Add request ID to locals for use in handlers
		event.locals.requestId = requestId;

		// Log request start
		log.info(
			{
				requestId,
				method: event.request.method,
				url: event.request.url,
				userAgent: event.request.headers.get('user-agent')
			},
			'Request started'
		);

		try {
			const response = await resolve(event, {
				transformPageChunk: ({ html }) => html
			});

			const duration = performance.now() - start;

			// Log response
			log.info(
				{
					requestId,
					method: event.request.method,
					url: event.request.url,
					status: response.status,
					duration: Math.round(duration)
				},
				'Request completed'
			);

			return response;
		} catch (error) {
			const duration = performance.now() - start;
			log.error(
				{
					requestId,
					method: event.request.method,
					url: event.request.url,
					duration: Math.round(duration),
					error: error instanceof Error ? error.message : String(error)
				},
				'Request failed'
			);

			throw error;
		}
	};
}
