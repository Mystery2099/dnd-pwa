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

const MAX_PATHNAME_LENGTH = 200;

function sanitizePathname(pathname: string | undefined): string | undefined {
	if (!pathname) return undefined;
	const trimmed = pathname.trim();
	if (!trimmed) return undefined;
	try {
		const parsed = new URL(trimmed, 'http://localhost');
		return (parsed.pathname || '/').slice(0, MAX_PATHNAME_LENGTH);
	} catch {
		const withoutHash = trimmed.split('#')[0] ?? trimmed;
		const withoutQuery = withoutHash.split('?')[0] ?? withoutHash;
		const candidate = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
		return candidate.slice(0, MAX_PATHNAME_LENGTH);
	}
}

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
	const persistenceErrors: Array<{ name: string; pathname?: string; message: string }> = [];

	for (const rawMetric of rawMetrics.slice(0, 20)) {
		const metric = rawMetric as IncomingMetric;
		if (!isValidMetric(metric)) continue;
		const normalizedMetric = {
			name: metric.name,
			value: metric.value,
			rating: typeof metric.rating === 'string' ? metric.rating : undefined,
			pathname: sanitizePathname(typeof metric.pathname === 'string' ? metric.pathname : undefined),
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
			const message = error instanceof Error ? error.message : 'Unknown error';
			console.error('persistWebVital failed', {
				name: normalizedMetric.name,
				pathname: normalizedMetric.pathname,
				error: message
			});
			persistenceErrors.push({ name: normalizedMetric.name, pathname: normalizedMetric.pathname, message });
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
		{ status: persistenceErrors.length > 0 ? 503 : 202 }
	);
};
