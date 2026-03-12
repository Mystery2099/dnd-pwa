#!/usr/bin/env bun

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const CLIENT_OUT_DIR = join(ROOT, '.svelte-kit/output/client');
const NON_BUDGET_FILE_PATTERNS = [/service-worker/i, /registerSW/i, /workbox/i];

const BUDGETS = {
	totalJsBytes: 700 * 1024,
	largestJsChunkBytes: 140 * 1024,
	totalCssBytes: 220 * 1024,
	faviconBytes: 12 * 1024
} as const;

type FileStat = {
	path: string;
	bytes: number;
};

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

function walkFiles(dir: string): string[] {
	const entries = readdirSync(dir, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walkFiles(fullPath));
			continue;
		}
		files.push(fullPath);
	}

	return files;
}

function toStat(path: string): FileStat {
	return {
		path: relative(ROOT, path),
		bytes: statSync(path).size
	};
}

if (!existsSync(CLIENT_OUT_DIR)) {
	console.error('Build output not found. Run `bun run build` first.');
	process.exit(1);
}

const allFiles = walkFiles(CLIENT_OUT_DIR).filter((path) => {
	const relativePath = relative(CLIENT_OUT_DIR, path);
	return !NON_BUDGET_FILE_PATTERNS.some((pattern) => pattern.test(relativePath));
});
const jsFiles = allFiles.filter((path) => path.endsWith('.js')).map(toStat);
const cssFiles = allFiles.filter((path) => path.endsWith('.css')).map(toStat);
const faviconPath = join(CLIENT_OUT_DIR, 'favicon.svg');
const faviconExists = existsSync(faviconPath);
const faviconSize = faviconExists ? statSync(faviconPath).size : 0;

const totalJsBytes = jsFiles.reduce((acc, file) => acc + file.bytes, 0);
const totalCssBytes = cssFiles.reduce((acc, file) => acc + file.bytes, 0);
const largestJsChunk = jsFiles.reduce((acc, file) => (file.bytes > acc.bytes ? file : acc), {
	path: '(none)',
	bytes: 0
});

const failures: string[] = [];

if (totalJsBytes > BUDGETS.totalJsBytes) {
	failures.push(
		`Total client JS exceeds budget: ${formatBytes(totalJsBytes)} > ${formatBytes(BUDGETS.totalJsBytes)}`
	);
}

if (largestJsChunk.bytes > BUDGETS.largestJsChunkBytes) {
	failures.push(
		`Largest JS chunk exceeds budget: ${largestJsChunk.path} (${formatBytes(largestJsChunk.bytes)}) > ${formatBytes(BUDGETS.largestJsChunkBytes)}`
	);
}

if (totalCssBytes > BUDGETS.totalCssBytes) {
	failures.push(
		`Total client CSS exceeds budget: ${formatBytes(totalCssBytes)} > ${formatBytes(BUDGETS.totalCssBytes)}`
	);
}

if (!faviconExists) {
	failures.push(`Favicon is missing: ${relative(ROOT, faviconPath)}`);
}

if (faviconSize > BUDGETS.faviconBytes) {
	failures.push(
		`Favicon exceeds budget: ${formatBytes(faviconSize)} > ${formatBytes(BUDGETS.faviconBytes)}`
	);
}

console.log('Bundle Budget Report');
console.log(
	`- Total JS: ${formatBytes(totalJsBytes)} (budget: ${formatBytes(BUDGETS.totalJsBytes)})`
);
console.log(
	`- Largest JS chunk: ${largestJsChunk.path} (${formatBytes(largestJsChunk.bytes)}) (budget: ${formatBytes(BUDGETS.largestJsChunkBytes)})`
);
console.log(
	`- Total CSS: ${formatBytes(totalCssBytes)} (budget: ${formatBytes(BUDGETS.totalCssBytes)})`
);
console.log(
	`- Favicon: ${formatBytes(faviconSize)} (budget: ${formatBytes(BUDGETS.faviconBytes)})`
);

if (failures.length > 0) {
	console.error('\nBudget check failed:');
	for (const failure of failures) {
		console.error(`- ${failure}`);
	}
	process.exit(1);
}

console.log('\nAll budgets passed.');
