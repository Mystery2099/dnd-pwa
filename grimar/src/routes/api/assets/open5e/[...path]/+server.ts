import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OPEN5E_API_BASE_URL } from '$lib/server/providers/open5e-config';

const CACHE_CONTROL = 'public, max-age=86400, s-maxage=86400';

function getOpen5eAssetOrigin(): string {
	const explicitOrigin = process.env.OPEN5E_ASSET_ORIGIN?.trim();
	if (explicitOrigin) {
		return explicitOrigin.replace(/\/+$/, '');
	}

	return OPEN5E_API_BASE_URL.replace(/\/v2$/i, '');
}

function normalizePath(path: string): string {
	const trimmed = path.trim();
	if (!trimmed) {
		throw error(400, 'Invalid asset path');
	}

	const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
	if (normalized.includes('..')) {
		throw error(400, 'Invalid asset path');
	}

	return normalized;
}

export const GET: RequestHandler = async ({ params, fetch, url }) => {
	const assetPath = normalizePath(params.path);
	const upstreamUrl = new URL(assetPath, `${getOpen5eAssetOrigin()}/`);
	upstreamUrl.search = url.search;

	const upstreamResponse = await fetch(upstreamUrl, {
		method: 'GET'
	});

	if (!upstreamResponse.ok || !upstreamResponse.body) {
		throw error(upstreamResponse.status || 502, 'Asset not found');
	}

	const headers = new Headers();
	const allowedHeaders = ['content-type', 'content-length', 'etag', 'last-modified'];

	for (const header of allowedHeaders) {
		const value = upstreamResponse.headers.get(header);
		if (value) {
			headers.set(header, value);
		}
	}

	headers.set('Cache-Control', CACHE_CONTROL);

	return new Response(upstreamResponse.body, {
		status: upstreamResponse.status,
		headers
	});
};
