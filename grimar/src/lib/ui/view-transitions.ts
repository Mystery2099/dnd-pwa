export function getCompendiumTransitionKey(type: string, key: string): string {
	return `${sanitizeTransitionToken(type)}-${sanitizeTransitionToken(key)}`;
}

export function getCompendiumTransitionNames(type: string, key: string) {
	const transitionKey = getCompendiumTransitionKey(type, key);

	return {
		shell: `compendium-shell-${transitionKey}`,
		title: `compendium-title-${transitionKey}`,
		meta: `compendium-meta-${transitionKey}`
	};
}

function sanitizeTransitionToken(value: string): string {
	return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
}
