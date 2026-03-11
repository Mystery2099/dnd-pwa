type WebVitalName = 'CLS' | 'FCP' | 'INP' | 'LCP';

type WebVitalMetric = {
	name: WebVitalName;
	value: number;
	rating: 'good' | 'needs-improvement' | 'poor';
	pathname: string;
	navigationType: string;
	timestamp: number;
};

let started = false;
const WEB_VITALS_ENDPOINT = '/api/monitoring/web-vitals';

type LayoutShiftEntry = PerformanceEntry & {
	value: number;
	hadRecentInput: boolean;
};

type EventTimingEntry = PerformanceEntry & {
	duration: number;
	interactionId?: number;
};

function getRating(name: WebVitalName, value: number): WebVitalMetric['rating'] {
	if (name === 'CLS') {
		if (value <= 0.1) return 'good';
		if (value <= 0.25) return 'needs-improvement';
		return 'poor';
	}
	if (name === 'INP') {
		if (value <= 200) return 'good';
		if (value <= 500) return 'needs-improvement';
		return 'poor';
	}
	if (name === 'LCP') {
		if (value <= 2500) return 'good';
		if (value <= 4000) return 'needs-improvement';
		return 'poor';
	}
	if (value <= 1800) return 'good';
	if (value <= 3000) return 'needs-improvement';
	return 'poor';
}

function metricToPayload(name: WebVitalName, value: number): WebVitalMetric {
	const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
	return {
		name,
		value: Number(value.toFixed(2)),
		rating: getRating(name, value),
		pathname: window.location.pathname,
		navigationType: navEntries[0]?.type ?? 'navigate',
		timestamp: Date.now()
	};
}

function sendWebVitals(metrics: WebVitalMetric[]) {
	if (metrics.length === 0) return;
	const payload = JSON.stringify({ metrics });

	if ('sendBeacon' in navigator) {
		navigator.sendBeacon(
			WEB_VITALS_ENDPOINT,
			new Blob([payload], { type: 'application/json' })
		);
		return;
	}

	void fetch(WEB_VITALS_ENDPOINT, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: payload,
		keepalive: true
	});
}

export function startWebVitalsReporting(): void {
	if (started || typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
	started = true;

	let lcp = 0;
	let cls = 0;
	let inp = 0;
	let fcp = 0;

	const observers: PerformanceObserver[] = [];

	try {
		const lcpObserver = new PerformanceObserver((entryList) => {
			for (const entry of entryList.getEntries()) {
				lcp = entry.startTime;
			}
		});
		lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
		observers.push(lcpObserver);
	} catch {
		// No-op when unsupported
	}

	try {
		const clsObserver = new PerformanceObserver((entryList) => {
			for (const entry of entryList.getEntries() as LayoutShiftEntry[]) {
				if (!entry.hadRecentInput) {
					cls += entry.value;
				}
			}
		});
		clsObserver.observe({ type: 'layout-shift', buffered: true });
		observers.push(clsObserver);
	} catch {
		// No-op when unsupported
	}

	try {
		const inpObserver = new PerformanceObserver((entryList) => {
			for (const entry of entryList.getEntries() as EventTimingEntry[]) {
				if (entry.interactionId && entry.duration > inp) {
					inp = entry.duration;
				}
			}
		});
		inpObserver.observe({
			type: 'event',
			buffered: true,
			durationThreshold: 40
		} as PerformanceObserverInit);
		observers.push(inpObserver);
	} catch {
		// No-op when unsupported
	}

	try {
		const fcpObserver = new PerformanceObserver((entryList) => {
			for (const entry of entryList.getEntriesByName('first-contentful-paint')) {
				fcp = entry.startTime;
			}
		});
		fcpObserver.observe({ type: 'paint', buffered: true });
		observers.push(fcpObserver);
	} catch {
		// No-op when unsupported
	}

	const flush = () => {
		const metrics: WebVitalMetric[] = [];
		if (fcp > 0) metrics.push(metricToPayload('FCP', fcp));
		if (lcp > 0) metrics.push(metricToPayload('LCP', lcp));
		if (cls > 0) metrics.push(metricToPayload('CLS', cls));
		if (inp > 0) metrics.push(metricToPayload('INP', inp));
		sendWebVitals(metrics);

		for (const observer of observers) observer.disconnect();
		window.removeEventListener('pagehide', flush);
		document.removeEventListener('visibilitychange', onVisibilityChange);
	};

	const onVisibilityChange = () => {
		if (document.visibilityState === 'hidden') {
			flush();
		}
	};

	window.addEventListener('pagehide', flush, { once: true });
	document.addEventListener('visibilitychange', onVisibilityChange);
}
