export const QUERY_BUCKET_THRESHOLDS = {
	fast: 20,
	moderate: 75,
	slow: 200
} as const;

export function getQueryBucket(durationMs: number): 'fast' | 'moderate' | 'slow' | 'very-slow' {
	if (durationMs < QUERY_BUCKET_THRESHOLDS.fast) return 'fast';
	if (durationMs < QUERY_BUCKET_THRESHOLDS.moderate) return 'moderate';
	if (durationMs < QUERY_BUCKET_THRESHOLDS.slow) return 'slow';
	return 'very-slow';
}
