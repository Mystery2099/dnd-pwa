#!/usr/bin/env bun
/**
 * Project Structure Analyzer
 * Provides an in-depth overview of the project's directory structure
 */

import { existsSync, readdirSync, lstatSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = '/home/mystery/misc-projects/dnd-pwa/grimar';
const OUTPUT: string[] = [];

function log(msg: string) {
	OUTPUT.push(msg);
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileCount(dir: string): { files: number; dirs: number; totalSize: number } {
	let files = 0;
	let dirs = 0;
	let totalSize = 0;

	try {
		const items = readdirSync(dir);
		for (const item of items) {
			const fullPath = join(dir, item);
			if (lstatSync(fullPath).isDirectory()) {
				dirs++;
				const result = getFileCount(fullPath);
				files += result.files;
				dirs += result.dirs;
				totalSize += result.totalSize;
			} else {
				files++;
				totalSize += lstatSync(fullPath).size;
			}
		}
	} catch (e) {
		// Ignore permission errors
	}

	return { files, dirs, totalSize };
}

function scanDirectory(dir: string, indent = 0, maxDepth = 6): void {
	const prefix = '  '.repeat(indent);
	const items = readdirSync(dir).sort();

	for (const item of items) {
		const fullPath = join(dir, item);
		const isDir = lstatSync(fullPath).isDirectory();
		const size = isDir ? 0 : lstatSync(fullPath).size;
		const sizeStr = isDir ? '' : ` (${formatBytes(size)})`;

		// Highlight important directories
		let icon = isDir ? '📁' : '📄';
		if (item === 'src') icon = '🔵';
		if (item === 'node_modules') icon = '🟢';
		if (item === '.svelte-kit') icon = '⚙️';
		if (item === 'drizzle') icon = '🗄️';
		if (item === 'local.db') icon = '💾';

		log(`${prefix}${icon} ${item}${sizeStr}`);

		if (isDir && indent < maxDepth) {
			// Show file count for all directories at reasonable depth
			const { files, dirs, totalSize } = getFileCount(fullPath);
			log(`${prefix}  └── ${dirs} dirs, ${files} files (${formatBytes(totalSize)})`);
			scanDirectory(fullPath, indent + 1, maxDepth);
		}
	}
}

function getFileTypeBreakdown(dir: string): Record<string, number> {
	const breakdown: Record<string, number> = {};

	function scan(d: string) {
		try {
			const items = readdirSync(d);
			for (const item of items) {
				const fullPath = join(d, item);
				if (lstatSync(fullPath).isDirectory()) {
					scan(fullPath);
				} else {
					const ext = item.includes('.') ? item.split('.').pop()! : 'no-ext';
					breakdown[ext] = (breakdown[ext] || 0) + 1;
				}
			}
		} catch (e) {}
	}

	scan(dir);
	return breakdown;
}

function getTopLevelDirs() {
	const dirs = readdirSync(ROOT)
		.filter((p) => lstatSync(join(ROOT, p)).isDirectory())
		.map((p) => {
			const { files, dirs, totalSize } = getFileCount(join(ROOT, p));
			return { name: p, files, dirs, totalSize };
		})
		.sort((a, b) => b.totalSize - a.totalSize);

	log('\n📊 TOP-LEVEL DIRECTORIES (by size):');
	log('='.repeat(50));
	for (const d of dirs) {
		log(`  ${d.name.padEnd(25)} ${formatBytes(d.totalSize).padStart(10)} ${d.files} files`);
	}
}

function getSourceStats() {
	const srcDir = join(ROOT, 'src');
	const libDir = join(srcDir, 'lib');

	log('\n📁 SOURCE STRUCTURE:');
	log('='.repeat(50));

	// Main source directories
	const srcDirs = ['lib', 'routes'];
	for (const dir of srcDirs) {
		const fullPath = join(srcDir, dir);
		if (existsSync(fullPath)) {
			log(`\n  ${dir}/`);
			scanDirectory(fullPath, 2, 3);
		}
	}
}

function getFileTypeStats() {
	const breakdown = getFileTypeBreakdown(join(ROOT, 'src'));
	log('\n\n📋 FILE TYPE BREAKDOWN (src/):');
	log('='.repeat(50));
	for (const [ext, count] of Object.entries(breakdown).sort((a, b) => b[1] - a[1])) {
		log(`  .${ext.padEnd(12)} ${count} files`);
	}
}

function checkForUnusedOrOrphaned() {
	log('\n\n🔍 POTENTIAL CLEANUP TARGETS:');
	log('='.repeat(50));

	// Check for large files
	log('\n  Largest files in project:');
	const largeFiles: { path: string; size: number }[] = [];

	function findLarge(d: string) {
		try {
			const items = readdirSync(d);
			for (const item of items) {
				const fullPath = join(d, item);
				if (lstatSync(fullPath).isFile() && lstatSync(fullPath).size > 100000) {
					largeFiles.push({ path: fullPath, size: lstatSync(fullPath).size });
				} else if (lstatSync(fullPath).isDirectory() && !item.startsWith('.')) {
					findLarge(fullPath);
				}
			}
		} catch (e) {}
	}

	findLarge(ROOT);
	largeFiles.sort((a, b) => b.size - a.size);

	for (const f of largeFiles.slice(0, 10)) {
		const relPath = f.path.replace(ROOT + '/', '');
		log(`  ${formatBytes(f.size).padStart(8)} ${relPath}`);
	}
}

function getArchitectureSummary() {
	log('\n\n🏗️ ARCHITECTURE SUMMARY:');
	log('='.repeat(50));
	log('');
	log('  SvelteKit Monolith Structure:');
	log('  ├── src/                      # Application source');
	log('  │   ├── lib/                  # Shared code');
	log('  │   │   ├── client/           # Client-side utilities');
	log('  │   │   ├── components/       # UI components');
	log('  │   │   ├── constants/        # Constants');
	log('  │   │   ├── server/           # Server-only code');
	log('  │   │   │   ├── db/           # Database & schema');
	log('  │   │   │   ├── providers/    # Data providers');
	log('  │   │   │   └── services/     # Business logic');
	log('  │   │   └── types/            # TypeScript types');
	log('  │   └── routes/               # SvelteKit routes');
	log('  │       ├── api/              # API endpoints');
	log('  │       ├── compendium/       # Compendium pages');
	log('  │       ├── characters/       # Character pages');
	log('  │       └── dashboard/        # Dashboard');
	log('  ├── drizzle/                  # Database migrations');
	log('  └── [config files]            # tsconfig, vite, etc.');
	log('');
	log('  Database: SQLite via Drizzle ORM');
	log('  Runtime: Bun with svelte-adapter-bun');
}

// Run the analyzer
log('🏔️  GRIMAR PROJECT STRUCTURE');
log('='.repeat(60));
log(`Root: ${ROOT}\n`);

getTopLevelDirs();
getSourceStats();
getFileTypeStats();
checkForUnusedOrOrphaned();
getArchitectureSummary();

// Output
console.log(OUTPUT.join('\n'));
