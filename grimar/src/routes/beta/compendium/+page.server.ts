import type { PageServerLoad } from './$types';
import { SEARCHABLE_TYPES, type CompendiumTypeName } from '$lib/core/constants/compendium';
import { parseAtlasState } from '$lib/features/compendium/atlas';
import { getAtlasPagePayload } from '$lib/server/services/compendium/atlas';
import { getCompendiumQuickDetail } from '$lib/server/services/compendium/quick-detail';
import type { CompendiumType } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ url }) => {
	const state = parseAtlasState(url.searchParams);
	const detailTypeParam = url.searchParams.get('detailType');
	const detailKey = url.searchParams.get('detail');
	const detailType =
		detailTypeParam && SEARCHABLE_TYPES.includes(detailTypeParam as CompendiumTypeName)
			? (detailTypeParam as CompendiumTypeName)
			: null;

	const [atlasPayload, detail] = await Promise.all([
		getAtlasPagePayload(state),
		detailType && detailKey
			? getCompendiumQuickDetail(detailType as CompendiumType, detailKey)
			: Promise.resolve(null)
	]);

	return {
		...atlasPayload,
		detailSelection:
			detailType && detailKey
				? {
						type: detailType,
						key: detailKey
					}
				: null,
		detail
	};
};
