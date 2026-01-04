import { Database } from 'bun:sqlite';
import { readFileSync } from 'fs';

const envText = readFileSync('.env', 'utf-8');
const dbUrl = envText.match(/DATABASE_URL=(.*)/)?.[1];

if (!dbUrl) {
    console.error('No DATABASE_URL in .env');
    process.exit(1);
}

console.log('Connecting to:', dbUrl);
const db = new Database(dbUrl);

const count = db.query('SELECT count(*) as c FROM compendium_items WHERE type = ?').get('spell') as { c: number };
console.log('Spell count:', count.c);
