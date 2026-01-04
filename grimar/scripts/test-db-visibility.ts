import { getDb } from '../src/lib/server/db/db-connection';
import { compendiumItems } from '../src/lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

async function check() {
    console.log('Connecting to DB...');
    const db = await getDb();
    console.log('Connected.');
    
    const spellCount = await db.$count(compendiumItems, eq(compendiumItems.type, 'spell'));
    console.log('Spell count:', spellCount);
    
    const allCount = await db.$count(compendiumItems);
    console.log('Total items:', allCount);
}

check();
