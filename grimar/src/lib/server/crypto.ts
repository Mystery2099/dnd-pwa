/**
 * Simple encryption utilities for session data
 *
 * Uses Node.js crypto module for AES-256-GCM encryption.
 */

import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Get encryption key from environment or generate a stable one
function getEncryptionKey(): Buffer {
	const key = process.env.SESSION_ENCRYPTION_KEY;
	if (key) {
		return crypto.scryptSync(key, 'grimar-salt', KEY_LENGTH);
	}

	// For development, use a fixed key (in production, always set SESSION_ENCRYPTION_KEY)
	console.warn('[auth] SESSION_ENCRYPTION_KEY not set, using development key');
	return crypto.scryptSync('grimar-dev-key-do-not-use-in-production', 'grimar-salt', KEY_LENGTH);
}

/**
 * Encrypt plaintext data
 */
export function encrypt(plaintext: string): string {
	const iv = crypto.randomBytes(IV_LENGTH);
	const key = getEncryptionKey();
	const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

	let encrypted = cipher.update(plaintext, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	const authTag = cipher.getAuthTag();

	// Combine IV + authTag + encrypted data
	return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

/**
 * Decrypt encrypted data
 */
export function decrypt(encryptedData: string): string {
	const key = getEncryptionKey();

	// Extract IV, authTag, and encrypted data
	const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex');
	const authTag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2), 'hex');
	const encrypted = encryptedData.slice((IV_LENGTH + AUTH_TAG_LENGTH) * 2);

	const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(authTag);

	let decrypted = decipher.update(encrypted, 'hex', 'utf8');
	decrypted += decipher.final('utf8');

	return decrypted;
}
