/**
 * User Settings API Endpoint
 *
 * GET /api/user/settings - Fetch current settings
 * PATCH /api/user/settings - Update settings (partial merge)
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireUser } from '$lib/server/services/auth/auth-service';
import { getUserSettings, updateUserSettings } from '$lib/server/repositories/users';
import { createModuleLogger } from '$lib/server/logger';
import type { ServerSettings } from '$lib/core/client/settings';

const log = createModuleLogger('SettingsAPI');

/**
 * GET /api/user/settings
 * Returns the current user's settings.
 */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const user = requireUser(locals);
		log.debug({ username: user.username }, 'Fetching user settings');

		const db = await import('$lib/server/db').then((m) => m.getDb());
		const settings = await getUserSettings(db, user.username);

		log.debug({ username: user.username }, 'Settings retrieved');
		return json(settings satisfies ServerSettings);
	} catch (error) {
		log.error({ error }, 'Error fetching settings');
		return json({ error: 'Failed to fetch settings' }, { status: 500 });
	}
};

/**
 * PATCH /api/user/settings
 * Updates the current user's settings (partial merge).
 * Body: Partial<ServerSettings>
 */
export const PATCH: RequestHandler = async ({ locals, request }) => {
	try {
		const user = requireUser(locals);
		const partial = (await request.json()) as Partial<ServerSettings>;

		log.debug({ username: user.username, keys: Object.keys(partial) }, 'Updating user settings');

		const db = await import('$lib/server/db').then((m) => m.getDb());
		const settings = await updateUserSettings(db, user.username, partial);

		log.info({ username: user.username }, 'Settings updated');
		return json(settings satisfies ServerSettings);
	} catch (error) {
		log.error({ error }, 'Error updating settings');
		return json({ error: 'Failed to update settings' }, { status: 500 });
	}
};
