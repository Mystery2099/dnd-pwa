/**
 * Auth Types
 */

export type UserRole = 'user' | 'admin';

export interface AuthUser {
	username: string;
	settings: Record<string, unknown>;
	role: UserRole;
	groups: string[];
}

export type AuthResult = { user: AuthUser } | { user: null; redirectTo?: string };
