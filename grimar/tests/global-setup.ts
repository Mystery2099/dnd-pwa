import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function globalSetup() {
	console.log('Setting up E2E test environment...');
	const projectRoot = join(__dirname, '..');
	
	try {
		execSync('bun run db:push', {
			cwd: projectRoot,
			stdio: 'inherit'
		});
	} catch (e) {
		console.log('Database setup skipped (may not be needed for smoke tests)');
	}
}
