import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { providerRegistry } from '$lib/server/providers/registry';
import { syncProviderById } from '$lib/server/services/sync/orchestrator';
import { getDb } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	const { providerId } = await request.json();
	
	if (!providerId) {
		return json({ error: 'Provider ID is required' }, { status: 400 });
	}
	
	const provider = providerRegistry.getProvider(providerId);
	
	if (!provider) {
		return json({ error: 'Provider not found or not enabled' }, { status: 404 });
	}
	
	try {
		const db = await getDb();
		const result = await syncProviderById(db, providerId);
		
		return json({
			success: true,
			provider: providerId,
			totalItems: result.totalItems,
			counts: result.counts
		});
	} catch (error) {
		console.error('Sync failed:', error);
		return json({ 
			error: error instanceof Error ? error.message : 'Sync failed' 
		}, { status: 500 });
	}
};

export const GET: RequestHandler = async () => {
	const providers = providerRegistry.getEnabledProviders();
	
	const syncStatus = providers.map(p => ({
		id: p.id,
		name: p.name,
		supportedTypes: p.supportedTypes
	}));
	
	return json({ providers: syncStatus });
};
