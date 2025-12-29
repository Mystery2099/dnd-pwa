/**
 * Auth Index
 *
 * Re-exports all authentication utilities.
 */

export type { AuthUser, AuthResult } from './auth-types';
export { handleAuth, resolveUser } from './auth-handler';
export { requireUser } from './auth-guard';
