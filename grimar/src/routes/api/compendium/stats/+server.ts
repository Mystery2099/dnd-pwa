import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTypeCounts } from '$lib/server/repositories/compendium';
import { getQueryBucket } from '$lib/server/utils/query-performance';

export const GET: RequestHandler = async () => {
	const start = performance.now();
	const counts = await getTypeCounts();
	const durationMs = Number((performance.now() - start).toFixed(2));
	const bucket = getQueryBucket(durationMs);

	return json(counts, {
		headers: {
			'Server-Timing': `compendium-stats;dur=${durationMs}`,
			'X-Query-Time-Ms': String(durationMs),
			'X-Query-Bucket': bucket,
			'Cache-Control': 'public, max-age=30, stale-while-revalidate=120'
		}
	});
};
