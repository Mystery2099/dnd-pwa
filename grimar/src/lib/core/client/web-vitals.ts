import { onCLS, onFCP, onINP, onLCP, type Metric } from 'web-vitals';

let started = false;
const WEB_VITALS_ENDPOINT = '/api/monitoring/web-vitals';

function sendWebVital(metric: Metric, pathname: string): void {
	const payload = JSON.stringify({
		metrics: [
			{
				name: metric.name,
				value: Number(metric.value.toFixed(2)),
				rating: metric.rating,
				pathname,
				navigationType: metric.navigationType,
				timestamp: Date.now()
			}
		]
	});

	if (
		'sendBeacon' in navigator &&
		navigator.sendBeacon(WEB_VITALS_ENDPOINT, new Blob([payload], { type: 'application/json' }))
	)
		return;

	void fetch(WEB_VITALS_ENDPOINT, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: payload,
		keepalive: true
	}).catch(() => {});
}

export function startWebVitalsReporting(): void {
	if (started || typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
	started = true;

	// These metrics describe the document navigation, not the SPA route at flush time.
	const pathname = window.location.pathname;
	const report = (metric: Metric) => sendWebVital(metric, pathname);
	onCLS(report);
	onFCP(report);
	onINP(report);
	onLCP(report);
}
