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

		// Log slow operations (>100ms)
		if (duration > 100) {
			console.warn(`[PERF] Slow operation: ${name} took ${duration}ms`, metadata);
		}
	}

	// Decorator for measuring function execution time
	measure<T extends (...args: any[]) => any>(name: string, fn: T): T {
		return (async (...args: Parameters<T>) => {
			const start = performance.now();
			try {
				const result = await fn(...args);
				const duration = performance.now() - start;
				this.record(name, duration, { success: true });
				return result;
			} catch (error) {
				const duration = performance.now() - start;
				this.record(name, duration, {
					success: false,
					error: error instanceof Error ? error.message : String(error)
				});
				throw error;
			}
		}) as T;
	}

	// Get performance statistics
	getStats(metricName?: string) {
		let filteredMetrics = this.metrics;

		if (metricName) {
			filteredMetrics = this.metrics.filter((m) => m.name === metricName);
		}

		if (filteredMetrics.length === 0) {
			return {
				count: 0,
				avg: 0,
				min: 0,
				max: 0,
				p95: 0,
				p99: 0
			};
		}

		const durations = filteredMetrics.map((m) => m.duration).sort((a, b) => a - b);
		const count = durations.length;
		const sum = durations.reduce((a, b) => a + b, 0);

		return {
			count,
			avg: sum / count,
			min: durations[0],
			max: durations[count - 1],
			p95: durations[Math.floor(count * 0.95)],
			p99: durations[Math.floor(count * 0.99)]
		};
	}

	// Get recent metrics (last N minutes)
	getRecent(minutes: number = 15, metricName?: string) {
		const cutoff = Date.now() - minutes * 60 * 1000;
		let filtered = this.metrics.filter((m) => m.timestamp > cutoff);

		if (metricName) {
			filtered = filtered.filter((m) => m.name === metricName);
		}

		return filtered;
	}

	// Clear all metrics
	clear(): void {
		this.metrics = [];
	}

	// Log performance summary
	logSummary(): void {
		const operations = [...new Set(this.metrics.map((m) => m.name))];

		console.log('\n=== PERFORMANCE SUMMARY ===');
		for (const operation of operations) {
			const stats = this.getStats(operation);
			console.log(`${operation}:`);
			console.log(`  Count: ${stats.count}`);
			console.log(`  Avg: ${stats.avg.toFixed(2)}ms`);
			console.log(`  Min/Max: ${stats.min.toFixed(2)}ms / ${stats.max.toFixed(2)}ms`);
			console.log(`  P95/P99: ${stats.p95.toFixed(2)}ms / ${stats.p99.toFixed(2)}ms`);
		}
		console.log('========================\n');
	}
}

// Helper function to measure async operations
export async function measureAsync<T>(
	name: string,
	operation: () => Promise<T>,
	metadata?: Record<string, any>
): Promise<T> {
	const monitor = PerformanceMonitor.getInstance();
	const start = performance.now();

	try {
		const result = await operation();
		const duration = performance.now() - start;
		monitor.record(name, duration, { success: true, ...metadata });
		return result;
	} catch (error) {
		const duration = performance.now() - start;
		monitor.record(name, duration, {
			success: false,
			error: error instanceof Error ? error.message : String(error),
			...metadata
		});
		throw error;
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

// Performance hooks for SvelteKit
export function logPagePerformance(page: string, loadTime: number) {
	const monitor = PerformanceMonitor.getInstance();
	monitor.record('page_load', loadTime, { page });
}
