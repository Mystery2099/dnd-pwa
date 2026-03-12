import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { rmSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function globalSetup() {
	console.log('Setting up E2E test environment...');
	const projectRoot = join(__dirname, '..');
	const databaseUrl = join(projectRoot, 'data', 'e2e.db');

	rmSync(databaseUrl, { force: true });

	execSync('bun scripts/setup-e2e-db.ts', {
		cwd: projectRoot,
		stdio: 'inherit',
		env: {
			...process.env,
			DATABASE_URL: databaseUrl
		}
	});
}
