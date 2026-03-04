import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTypeCounts } from '$lib/server/repositories/compendium';

export const GET: RequestHandler = async () => {
	const start = performance.now();
	const counts = await getTypeCounts();
	const durationMs = Number((performance.now() - start).toFixed(2));
	const bucket =
		durationMs < 20 ? 'fast' : durationMs < 75 ? 'moderate' : durationMs < 200 ? 'slow' : 'very-slow';

	return json(counts, {
		headers: {
			'Server-Timing': `compendium-stats;dur=${durationMs}`,
			'X-Query-Time-Ms': String(durationMs),
			'X-Query-Bucket': bucket
		}
	});
};
