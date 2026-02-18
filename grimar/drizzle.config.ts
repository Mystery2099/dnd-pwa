import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	schema: './src/lib/server/db/schema-normalized.ts',
	dialect: 'sqlite',
	dbCredentials: { url: process.env.DATABASE_URL },
	verbose: true,
	strict: true,
	// Exclude FTS virtual table and its shadow tables from Drizzle management
	tablesFilter: [
		'!*_fts',
		'!*_fts_data',
		'!*_fts_idx',
		'!*_fts_content',
		'!*_fts_docsize',
		'!*_fts_config'
	]
});
