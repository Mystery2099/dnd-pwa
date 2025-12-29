/**
 * Source Badge Utility
 *
 * Returns CSS class names for source badge styling based on source type.
 */

export function getSourceBadgeClass(source: string): string {
	switch (source) {
		case 'open5e':
			return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
		case 'srd':
			return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
		case 'homebrew':
			return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
		default:
			return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
	}
}

export function getSourceLabel(source: string): string {
	switch (source) {
		case 'open5e':
			return 'Open5e';
		case 'srd':
			return 'SRD';
		case 'homebrew':
			return 'Homebrew';
		default:
			return source.charAt(0).toUpperCase() + source.slice(1);
	}
}
