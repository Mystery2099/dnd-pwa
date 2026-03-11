import { json, type RequestHandler } from '@sveltejs/kit';
import { PerformanceMonitor } from '$lib/server/utils/monitoring';
import {
	persistWebVital,
	flushQueuedWebVitals,
	getQueuedWebVitalCount
} from '$lib/server/repositories/web-vitals';

type IncomingMetric = {
	name?: unknown;
	value?: unknown;
	rating?: unknown;
	pathname?: unknown;
	navigationType?: unknown;
	timestamp?: unknown;
};

function getRawMetrics(payload: unknown): unknown[] {
	if (Array.isArray(payload)) return payload;

	const metrics = (payload as { metrics?: unknown[] } | null)?.metrics;
	return Array.isArray(metrics) ? metrics : [];
}

function isValidMetric(metric: IncomingMetric): metric is {
	name: string;
	value: number;
	rating?: string;
	pathname?: string;
	navigationType?: string;
	timestamp?: number;
} {
	return (
		typeof metric?.name === 'string' &&
		typeof metric?.value === 'number' &&
		Number.isFinite(metric.value) &&
		metric.value >= 0
	);
}

export const POST: RequestHandler = async ({ request }) => {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return json({ error: 'invalid_json' }, { status: 400 });
	}

	const rawMetrics = getRawMetrics(payload);

	if (rawMetrics.length === 0) {
		return json({ recorded: 0 }, { status: 202 });
	}

	const monitor = PerformanceMonitor.getInstance();
	const flushResult = await flushQueuedWebVitals();
	let recorded = 0;
	let persisted = 0;
	let persistenceErrors = 0;

	for (const rawMetric of rawMetrics.slice(0, 20)) {
		const metric = rawMetric as IncomingMetric;
		if (!isValidMetric(metric)) continue;
		const normalizedMetric = {
			name: metric.name,
			value: metric.value,
			rating: typeof metric.rating === 'string' ? metric.rating : undefined,
			pathname: typeof metric.pathname === 'string' ? metric.pathname : undefined,
			navigationType: typeof metric.navigationType === 'string' ? metric.navigationType : undefined,
			clientTimestamp:
				typeof metric.timestamp === 'number' && Number.isFinite(metric.timestamp)
					? metric.timestamp
					: undefined
		};

		monitor.record(`web-vital:${normalizedMetric.name}`, normalizedMetric.value, normalizedMetric);
		try {
			await persistWebVital(normalizedMetric);
			persisted += 1;
		} catch (error) {
			console.error('persistWebVital failed', {
				name: normalizedMetric.name,
				pathname: normalizedMetric.pathname,
				error
			});
			persistenceErrors += 1;
		}
		recorded += 1;
	}

	return json(
		{
			recorded,
			persisted,
			queued: getQueuedWebVitalCount(),
			flushedFromQueue: flushResult.flushed,
			persistenceErrors
		},
		{ status: persistenceErrors > 0 ? 503 : 202 }
	);
};
