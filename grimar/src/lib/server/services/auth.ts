/**
 * Auth Index
 *
 * Re-exports all authentication utilities.
 */

export type { AuthUser, AuthResult } from './auth/auth-types';
export { handleAuth, resolveUser } from './auth/auth-handler';
export { requireUser } from './auth/auth-guard';
