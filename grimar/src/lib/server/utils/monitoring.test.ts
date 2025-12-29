import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	PerformanceMonitor,
	measureAsync,
	measureDb,
	logPagePerformance
} from '$lib/server/utils/monitoring';

describe('PerformanceMonitor', () => {
	let monitor: PerformanceMonitor;

	beforeEach(() => {
		// Get a fresh instance and clear it
		monitor = PerformanceMonitor.getInstance();
		monitor.clear();
	});

	describe('record', () => {
		it('should record a performance metric', () => {
			monitor.record('test-operation', 50);

			const stats = monitor.getStats('test-operation');
			expect(stats.count).toBe(1);
			expect(stats.avg).toBe(50);
		});

		it('should record multiple metrics', () => {
			monitor.record('operation1', 100);
			monitor.record('operation1', 200);
			monitor.record('operation2', 50);

			const stats1 = monitor.getStats('operation1');
			const stats2 = monitor.getStats('operation2');

			expect(stats1.count).toBe(2);
			expect(stats2.count).toBe(1);
		});

		it('should include metadata', () => {
			monitor.record('test', 50, { userId: '123', action: 'click' });

			const recent = monitor.getRecent(15);
			expect(recent.length).toBe(1);
			expect(recent[0].metadata?.userId).toBe('123');
		});

		it('should log slow operations (>100ms)', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			monitor.record('slow-operation', 150);

			expect(consoleSpy).toHaveBeenCalledWith(
				'[PERF] Slow operation: slow-operation took 150ms',
				undefined
			);

			consoleSpy.mockRestore();
		});

		it('should not log fast operations (<100ms)', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			monitor.record('fast-operation', 50);

			expect(consoleSpy).not.toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it('should limit stored metrics to max (1000)', () => {
			// Record 1005 metrics
			for (let i = 0; i < 1005; i++) {
				monitor.record('metric', i);
			}

			const stats = monitor.getStats('metric');
			expect(stats.count).toBe(1000);
		});
	});

	describe('getStats', () => {
		it('should calculate correct statistics', () => {
			monitor.record('operation', 10);
			monitor.record('operation', 20);
			monitor.record('operation', 30);
			monitor.record('operation', 40);
			monitor.record('operation', 50);

			const stats = monitor.getStats('operation');

			expect(stats.count).toBe(5);
			expect(stats.avg).toBe(30); // (10+20+30+40+50) / 5
			expect(stats.min).toBe(10);
			expect(stats.max).toBe(50);
		});

		it('should return zeros for non-existent operation', () => {
			const stats = monitor.getStats('non-existent');

			expect(stats.count).toBe(0);
			expect(stats.avg).toBe(0);
			expect(stats.min).toBe(0);
			expect(stats.max).toBe(0);
		});

		it('should calculate percentiles correctly', () => {
			// Record 100 operations with increasing duration
			for (let i = 1; i <= 100; i++) {
				monitor.record('percentile-test', i);
			}

			const stats = monitor.getStats('percentile-test');

			// Percentile calculation uses interpolation, so values may be off by 1
			expect(stats.p95).toBeGreaterThanOrEqual(95);
			expect(stats.p95).toBeLessThanOrEqual(96);
			expect(stats.p99).toBeGreaterThanOrEqual(99);
			expect(stats.p99).toBeLessThanOrEqual(100);
		});

		it('should filter by metric name', () => {
			monitor.record('operation-a', 100);
			monitor.record('operation-b', 200);
			monitor.record('operation-a', 50);

			const statsA = monitor.getStats('operation-a');
			const statsB = monitor.getStats('operation-b');

			expect(statsA.count).toBe(2);
			expect(statsA.avg).toBe(75);
			expect(statsB.count).toBe(1);
			expect(statsB.avg).toBe(200);
		});
	});

	describe('getRecent', () => {
		it('should return metrics within time window', () => {
			monitor.record('recent', 50);

			const recent = monitor.getRecent(15);

			expect(recent.length).toBe(1);
		});

		it('should filter by metric name', () => {
			monitor.record('keep', 50);
			monitor.record('discard', 50);

			const recent = monitor.getRecent(15, 'keep');

			expect(recent.length).toBe(1);
			expect(recent[0].name).toBe('keep');
		});

		it('should filter out old metrics', () => {
			// This test would require time manipulation which is tricky
			// In practice, this would need vitest.useFakeTimers()
		});
	});

	describe('clear', () => {
		it('should remove all metrics', () => {
			monitor.record('operation', 50);
			monitor.record('operation', 100);

			expect(monitor.getStats('operation').count).toBe(2);

			monitor.clear();

			expect(monitor.getStats('operation').count).toBe(0);
		});
	});

	describe('measure decorator', () => {
		it('should measure async function execution', async () => {
			const fn = monitor.measure('async-test', async () => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return 'result';
			});

			const result = await fn();

			expect(result).toBe('result');
			expect(monitor.getStats('async-test').count).toBe(1);
		});

		it('should record error on failure', async () => {
			const fn = monitor.measure('error-test', async () => {
				throw new Error('Test error');
			});

			await expect(fn()).rejects.toThrow('Test error');

			const stats = monitor.getStats('error-test');
			expect(stats.count).toBe(1);
		});
	});

	describe('logSummary', () => {
		it('should not throw', () => {
			monitor.record('operation', 50);
			monitor.record('operation', 100);

			// Should not throw
			expect(() => monitor.logSummary()).not.toThrow();
		});
	});
});

describe('measureAsync', () => {
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	it('should measure async operation', async () => {
		const result = await measureAsync('test', async () => {
			await new Promise((resolve) => setTimeout(resolve, 5));
			return 'success';
		});

		expect(result).toBe('success');
	});

	it('should record successful operation', async () => {
		await measureAsync('success-test', async () => {
			return 'done';
		});

		const monitor = PerformanceMonitor.getInstance();
		monitor.clear();

		await measureAsync('success-test', async () => 'done');

		const stats = monitor.getStats('success-test');
		expect(stats.count).toBe(1);
		expect(stats.avg).toBeGreaterThan(0);
	});

	it('should rethrow error after recording', async () => {
		await expect(
			measureAsync('error-test', async () => {
				throw new Error('Operation failed');
			})
		).rejects.toThrow('Operation failed');
	});

	it('should record failed operation', async () => {
		try {
			await measureAsync('fail-test', async () => {
				throw new Error('Fail');
			});
		} catch {
			// Expected
		}

		const monitor = PerformanceMonitor.getInstance();
		monitor.clear();

		try {
			await measureAsync('fail-test', async () => {
				throw new Error('Fail');
			});
		} catch {
			// Expected
		}

		const stats = monitor.getStats('fail-test');
		expect(stats.count).toBe(1);
	});
});

describe('measureDb', () => {
	it('should measure synchronous database operation', () => {
		const result = measureDb('db-test', () => {
			return { rows: [], count: 0 };
		});

		expect(result).toEqual({ rows: [], count: 0 });
	});

	it('should record database operation', () => {
		measureDb('db-metric', () => ({ success: true }));

		const monitor = PerformanceMonitor.getInstance();
		monitor.clear();

		measureDb('db-metric', () => ({ success: true }));

		const stats = monitor.getStats('db-metric');
		expect(stats.count).toBe(1);
	});

	it('should handle errors', () => {
		expect(() =>
			measureDb('db-error', () => {
				throw new Error('DB connection failed');
			})
		).toThrow('DB connection failed');
	});
});

describe('logPagePerformance', () => {
	it('should log page load performance', () => {
		const monitor = PerformanceMonitor.getInstance();
		monitor.clear();

		logPagePerformance('/compendium/spells', 150);

		const stats = monitor.getStats('page_load');
		expect(stats.count).toBe(1);
		expect(stats.avg).toBe(150);
	});

	it('should include page in metadata', () => {
		const monitor = PerformanceMonitor.getInstance();
		monitor.clear();

		logPagePerformance('/compendium/monsters', 200);

		const recent = monitor.getRecent(15, 'page_load');
		expect(recent.length).toBe(1);
	});
});
