/**
 * Source Badge Utility
 *
 * Returns CSS class names for source badge styling based on source type.
 */

export function getSourceBadgeClass(source: string): string {
	switch (source) {
		case 'open5e':
			return 'bg-[var(--color-gem-sapphire)]/20 text-[var(--color-gem-sapphire)] border-[var(--color-gem-sapphire)]/30';
		case '5ebits':
			return 'bg-[var(--color-gem-topaz)]/20 text-[var(--color-gem-topaz)] border-[var(--color-gem-topaz)]/30';
		case 'srd':
			// Legacy, treat as 5ebits
			return 'bg-[var(--color-gem-topaz)]/20 text-[var(--color-gem-topaz)] border-[var(--color-gem-topaz)]/30';
		case 'homebrew':
			return 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]/30';
		default:
			return 'bg-[var(--color-text-muted)]/20 text-[var(--color-text-secondary)] border-[var(--color-text-muted)]/30';
	}
}

export function getSourceLabel(source: string): string {
	switch (source) {
		case 'open5e':
			return 'Open5e';
		case '5ebits':
			return '5e-Bits';
		case 'srd':
			return '5e-Bits';
		case 'homebrew':
			return 'Homebrew';
		default:
			return source.charAt(0).toUpperCase() + source.slice(1);
	}
}
