/**
 * Auth Types
 */

export interface AuthUser {
	username: string;
	settings: Record<string, unknown>;
}

export type AuthResult = { user: AuthUser } | { user: null; redirectTo?: string };
