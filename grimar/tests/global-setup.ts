import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function globalSetup() {
	console.log('Seeding test database...');
	const projectRoot = join(__dirname, '..');
	execSync('bun run db:seed', {
		cwd: projectRoot,
		stdio: 'inherit'
	});
}
