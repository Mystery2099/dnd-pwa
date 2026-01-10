// Test script to debug SRD API calls
import { getAlignmentsApi } from './src/lib/server/services/srd/alignments';

async function main() {
	console.log('Fetching alignments from SRD...');
	const alignments = await getAlignmentsApi(500);
	console.log(`Received ${alignments.length} alignments:`);
	for (const a of alignments) {
		console.log(`  - ${a.index}: ${a.name}`);
	}
}

main().catch(console.error);
