export function getImageKind(
	fileUrl: unknown
): 'condition-icon' | 'creature-illustration' | 'icon' | 'illustration' | 'image' {
	if (typeof fileUrl !== 'string' || fileUrl.trim().length === 0) {
		return 'image';
	}

	const normalized = fileUrl.toLowerCase();
	if (normalized.includes('/conditions/')) {
		return 'condition-icon';
	}
	if (normalized.includes('/monsters/')) {
		return 'creature-illustration';
	}
	if (normalized.includes('/object_icons/')) {
		return 'icon';
	}
	if (normalized.includes('/object_illustrations/')) {
		return 'illustration';
	}

	return 'image';
}

export function getImageKindLabel(fileUrl: unknown): string {
	switch (getImageKind(fileUrl)) {
		case 'condition-icon':
			return 'Condition Icon';
		case 'creature-illustration':
			return 'Creature Illustration';
		case 'icon':
			return 'Icon';
		case 'illustration':
			return 'Illustration';
		default:
			return 'Image';
	}
}
