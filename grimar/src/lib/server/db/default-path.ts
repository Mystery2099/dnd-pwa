import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dbModuleDir = dirname(fileURLToPath(import.meta.url));

// Resolve the default SQLite database relative to the Grimar app root, not the shell cwd.
export const DEFAULT_DATABASE_URL = resolve(dbModuleDir, '../../../../local.db');
