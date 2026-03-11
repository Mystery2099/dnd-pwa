import { browser } from '$app/environment';

export interface PerfSample {
	endpoint: string;
	durationMs: number;
	bucket: string;
	status: number;
	timestamp: number;
	source: 'header' | 'client';
}

interface PerfTelemetryState {
	samples: PerfSample[];
}

interface PerfSummary {
	endpoint: string;
	count: number;
	avgMs: number;
	p95Ms: number;
	lastMs: number;
	lastStatus: number;
}

type Listener = (state: PerfTelemetryState) => void;

const MAX_SAMPLES = 300;

function normalizeEndpoint(url: string): string {
	try {
		if (browser) {
			const parsed = new URL(url, window.location.origin);
			return parsed.pathname;
		}
		return url.split('?')[0] ?? url;
	} catch {
		return url.split('?')[0] ?? url;
	}
}

function parseDurationFromServerTiming(value: string | null): number | null {
	if (!value) return null;
	const match = value.match(/dur=([\d.]+)/);
	if (!match) return null;
	const parsed = Number(match[1]);
	return Number.isFinite(parsed) ? parsed : null;
}

class PerfTelemetryStore {
	private state: PerfTelemetryState = { samples: [] };
	private listeners: Set<Listener> = new Set();

	subscribe(listener: Listener): () => void {
		this.listeners.add(listener);
		listener(this.state);
		return () => this.listeners.delete(listener);
	}

	private notify() {
		for (const listener of this.listeners) {
			listener(this.state);
		}
	}

	record(sample: PerfSample): void {
		const nextSamples = [...this.state.samples, sample];
		const samples =
			nextSamples.length > MAX_SAMPLES
				? nextSamples.slice(nextSamples.length - MAX_SAMPLES)
				: nextSamples;
		this.state = { samples };
		this.notify();
	}

	recordFromResponse(url: string, response: Response, fallbackDurationMs: number): void {
			const headerDuration = response.headers.get('x-query-time-ms');
			const serverTimingDuration = parseDurationFromServerTiming(response.headers.get('server-timing'));
		const parsedHeaderDuration = headerDuration ? Number(headerDuration) : null;
		const durationMs =
			(parsedHeaderDuration !== null && Number.isFinite(parsedHeaderDuration) && parsedHeaderDuration > 0
				? parsedHeaderDuration
				: null) ??
			serverTimingDuration ??
			fallbackDurationMs;
		const bucket = response.headers.get('x-query-bucket') ?? 'client';

		this.record({
			endpoint: normalizeEndpoint(url),
			durationMs,
				bucket,
				status: response.status,
				timestamp: Date.now(),
				source: headerDuration != null || serverTimingDuration != null ? 'header' : 'client'
			});
	}

	recordNetworkError(url: string, durationMs: number): void {
		this.record({
			endpoint: normalizeEndpoint(url),
			durationMs,
			bucket: 'error',
			status: 0,
			timestamp: Date.now(),
			source: 'client'
		});
	}

	getSummaries(limit = 8): PerfSummary[] {
		const grouped = new Map<string, PerfSample[]>();
		for (const sample of this.state.samples) {
			const current = grouped.get(sample.endpoint) ?? [];
			current.push(sample);
			grouped.set(sample.endpoint, current);
		}

		const summaries: PerfSummary[] = [];
		for (const [endpoint, samples] of grouped) {
			const durations = samples.map((s) => s.durationMs).sort((a, b) => a - b);
			const total = durations.reduce((sum, value) => sum + value, 0);
			const p95Index = Math.min(durations.length - 1, Math.floor(durations.length * 0.95));
			const latest = samples[samples.length - 1];
			summaries.push({
				endpoint,
				count: samples.length,
				avgMs: Number((total / durations.length).toFixed(1)),
				p95Ms: Number((durations[p95Index] ?? 0).toFixed(1)),
				lastMs: Number((latest?.durationMs ?? 0).toFixed(1)),
				lastStatus: latest?.status ?? 0
			});
		}

		return summaries.sort((a, b) => b.avgMs - a.avgMs).slice(0, limit);
	}
}

export const perfTelemetryStore = new PerfTelemetryStore();
