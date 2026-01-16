import { json } from '@sveltejs/kit';
import { handleEntryDetail, type EntryType } from '$lib/server/api/entry-detail';

export const GET = async ({ params }: { params: { slug: string } }) => {
	const { slug } = params;
	const type: EntryType = 'creature';

	const result = await handleEntryDetail(type, slug);

	if (result.error) {
		return json({ error: result.error }, { status: result.status ?? 500 });
	}

	return json(result.data);
};
