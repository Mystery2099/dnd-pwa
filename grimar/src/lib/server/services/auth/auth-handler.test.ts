import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleAuth } from './auth-handler';
import { resolveUser } from './auth-utils';

// Mock db module
const { mockDb } = vi.hoisted(() => {
	return {
		mockDb: {
			getDb: vi.fn(),
			select: vi.fn(),
			insert: vi.fn().mockReturnThis(),
			values: vi.fn().mockReturnThis(),
			onConflictDoUpdate: vi.fn().mockReturnThis(),
			onConflictDoNothing: vi.fn().mockReturnThis(),
			all: vi.fn(),
			// Mock query builder chain
			from: vi.fn(),
			where: vi.fn(),
			// Mock query.users.findFirst
			query: {
				users: {
					findFirst: vi.fn()
				}
			}
		}
	};
});

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn()
}));

// Mock schema
vi.mock('$lib/server/db/schema', () => ({
	users: { username: 'username' }
}));

// Helper to create mock event
function createMockEvent(
	urlStr: string,
	headers: Record<string, string> = {},
	cookies: Record<string, string> = {}
) {
	return {
		url: new URL(urlStr),
		request: {
			headers: {
				get: (key: string) => headers[key] || null
			}
		},
		cookies: {
			get: vi.fn((key: string) => cookies[key] || null),
			set: vi.fn(),
			delete: vi.fn(),
			serialize: vi.fn()
		},
		locals: {}
	} as any;
}

describe('AuthHandler', () => {
	beforeEach(async () => {
		vi.resetAllMocks();

		// Keep production-like process env defaults for session cookie behavior.
		vi.stubEnv('NODE_ENV', 'production');
		vi.stubEnv('DEV_TEST_AUTH_BYPASS', 'false');

		const { getDb } = await import('$lib/server/db');
		(getDb as any).mockResolvedValue(mockDb);

		// Setup default mock chain
		mockDb.select.mockReturnValue(mockDb);
		mockDb.from.mockReturnValue(mockDb);
		mockDb.where.mockReturnValue(mockDb);
		mockDb.insert.mockReturnValue(mockDb);
		mockDb.values.mockReturnValue(mockDb);
		mockDb.onConflictDoUpdate.mockResolvedValue({});
		mockDb.onConflictDoNothing.mockReturnValue(mockDb);
		mockDb.query.users.findFirst.mockResolvedValue(null);
	});

	describe('handleAuth', () => {
		it('does not allow test cookie bypass unless explicitly enabled', async () => {
			const event = createMockEvent('http://test.com/dashboard', {}, { 'test-user': 'test-dm' });
			const resolve = vi.fn().mockResolvedValue(new Response('ok'));

			const response = await handleAuth({ event, resolve });

			expect(event.locals.user).toBeUndefined();
			expect(resolve).not.toHaveBeenCalled();
			expect(response.status).toBe(302);
		});

		it('allows test cookie bypass when explicitly enabled', async () => {
			vi.stubEnv('DEV_TEST_AUTH_BYPASS', 'true');
			const event = createMockEvent('http://test.com/dashboard', {}, { 'test-user': 'test-dm' });
			const resolve = vi.fn().mockResolvedValue(new Response('ok'));

			await handleAuth({ event, resolve });

			expect(event.locals.user).toBeDefined();
			expect(event.locals.user.username).toBe('test-dm');
			expect(resolve).toHaveBeenCalled();
		});

		it('should extract user from X-Authentik-Username header', async () => {
			const event = createMockEvent('http://test.com/', { 'X-Authentik-Username': 'testuser' });
			const resolve = vi.fn().mockResolvedValue(new Response('ok'));

			// Mock user exists
			mockDb.query.users.findFirst.mockResolvedValueOnce({ username: 'testuser', settings: {} });

			await handleAuth({ event, resolve });

			expect(event.locals.user).toBeDefined();
			expect(event.locals.user.username).toBe('testuser');
			expect(resolve).toHaveBeenCalled();
		});

		it('should create new user on first access', async () => {
			const event = createMockEvent('http://test.com/', { 'X-Authentik-Username': 'newuser' });
			const resolve = vi.fn().mockResolvedValue(new Response('ok'));

			// Mock user doesn't exist initially, then returns created user
			mockDb.query.users.findFirst
				.mockResolvedValueOnce(null) // First check - user doesn't exist
				.mockResolvedValueOnce({ username: 'newuser', settings: {} }); // After insert - user now exists

			await handleAuth({ event, resolve });

			expect(event.locals.user).toBeDefined();
			expect(event.locals.user.username).toBe('newuser');
		});
	});

	describe('resolveUser', () => {
		it('should return null for unauthenticated request', async () => {
			const event = createMockEvent('http://test.com/', {});
			const result = await resolveUser(event);
			expect(result.user).toBeNull();
		});

		it('should return AuthUser for authenticated request', async () => {
			const event = createMockEvent('http://test.com/', { 'X-Authentik-Username': 'testuser' });

			mockDb.query.users.findFirst.mockResolvedValueOnce({ username: 'testuser', settings: {} });

			const result = await resolveUser(event);
			expect(result.user).not.toBeNull();
			expect(result.user?.username).toBe('testuser');
		});
	});
});
