<script lang="ts">
	type Props = {
		type: string;
		class?: string;
	};

	let { type, class: className = '' }: Props = $props();

	const normalizedType = $derived(type.trim().toLowerCase());
</script>

<svg
	viewBox="0 0 64 64"
	fill="none"
	stroke-linecap="round"
	stroke-linejoin="round"
	stroke-width="2.5"
	class={`compendium-icon ${className}`.trim()}
	aria-hidden="true"
>
	<circle cx="32" cy="32" r="23" class="shell-fill"></circle>
	<circle cx="32" cy="32" r="23" class="shell-ring"></circle>

	<g class="glyph">
		{#if normalizedType === 'aberration'}
			<path d="M32 22c7 0 12 4.2 12 10 0 7-6.5 12-12 16-5.5-4-12-9-12-16 0-5.8 5-10 12-10z"></path>
			<path d="M20 40c-3 1-5 3.5-5 7" class="glyph-accent"></path>
			<path d="M25 43c-2 1.3-3 3.2-3 5" class="glyph-accent"></path>
			<path d="M44 40c3 1 5 3.5 5 7" class="glyph-accent"></path>
			<path d="M39 43c2 1.3 3 3.2 3 5" class="glyph-accent"></path>
			<circle cx="32" cy="31" r="4" class="glyph-fill"></circle>
		{:else if normalizedType === 'dragon'}
			<path d="M19 40c4-13 12-20 24-20-2 5-1 10 2 13 3 3 2 7-1 10-6-1-10 0-14 5-2-5-5-7-11-8z"
			></path>
			<path d="M34 25c3-3 6-5 10-5" class="glyph-accent"></path>
		{:else if normalizedType === 'elemental'}
			<path d="M32 16c8 9 12 14 12 21a12 12 0 11-24 0c0-7 4-12 12-21z" class="glyph-fill"></path>
			<path d="M27 39c1.5-3 4-5 7-7" class="glyph-accent"></path>
		{:else if normalizedType === 'fiend'}
			<path d="M22 45V31c0-7 4.2-12 10-12s10 5 10 12v14"></path>
			<path d="M24 22l-5-8" class="glyph-accent"></path>
			<path d="M40 22l5-8" class="glyph-accent"></path>
			<path d="M27 45h10"></path>
		{:else if normalizedType === 'ooze'}
			<path d="M20 40c0-14 6-20 12-20s12 6 12 20c0 4-2 8-12 8s-12-4-12-8z" class="glyph-fill"
			></path>
			<circle cx="27" cy="31" r="1.5" class="glyph-accent-fill"></circle>
			<circle cx="38" cy="34" r="1.5" class="glyph-accent-fill"></circle>
		{:else if normalizedType === 'plant'}
			<path d="M32 47V26"></path>
			<path d="M32 26c0-7-5-11-12-11 0 7 4 12 12 12" class="glyph-fill"></path>
			<path d="M32 31c0-7 5-11 12-11 0 7-4 12-12 12" class="glyph-fill"></path>
			<path d="M26 47h12"></path>
		{:else if normalizedType === 'undead'}
			<path d="M24 41c1.5-5 4.2-7 8-7s6.5 2 8 7"></path>
			<path d="M24 29c0-5 3.5-8 8-8s8 3 8 8"></path>
			<circle cx="28" cy="30" r="1.5" class="glyph-accent-fill"></circle>
			<circle cx="36" cy="30" r="1.5" class="glyph-accent-fill"></circle>
			<path d="M28 37h8" class="glyph-accent"></path>
		{:else if normalizedType === 'celestial'}
			<path d="M32 18l4 9 10 1-7.5 6 2.5 10L32 39l-9 5 2.5-10L18 28l10-1 4-9z" class="glyph-fill"
			></path>
		{:else if normalizedType === 'construct'}
			<rect x="22" y="22" width="20" height="20" rx="4" class="glyph-fill"></rect>
			<path d="M32 16v6" class="glyph-accent"></path>
			<path d="M16 32h6" class="glyph-accent"></path>
			<path d="M42 32h6" class="glyph-accent"></path>
			<path d="M32 42v6" class="glyph-accent"></path>
		{:else if normalizedType === 'beast'}
			<path d="M23 42c0-9 4-15 9-15s9 6 9 15"></path>
			<path d="M25 28l-5-7" class="glyph-accent"></path>
			<path d="M39 28l5-7" class="glyph-accent"></path>
			<circle cx="28" cy="35" r="1.5" class="glyph-accent-fill"></circle>
			<circle cx="36" cy="35" r="1.5" class="glyph-accent-fill"></circle>
		{:else}
			<path d="M32 20c7 0 12 5 12 12v10H20V32c0-7 5-12 12-12z"></path>
			<circle cx="32" cy="26" r="4" class="glyph-fill"></circle>
		{/if}
	</g>
</svg>

<style>
	.compendium-icon {
		color: color-mix(in srgb, var(--color-accent) 44%, var(--color-text-primary));
		filter: drop-shadow(0 0 0.6rem color-mix(in srgb, var(--color-accent) 16%, transparent));
	}

	.shell-fill {
		fill: color-mix(in srgb, var(--color-accent) 22%, transparent);
		stroke: none;
	}

	.shell-ring {
		stroke: color-mix(in srgb, var(--color-text-primary) 24%, var(--color-border-hover));
	}

	.glyph {
		stroke: color-mix(in srgb, var(--color-text-primary) 93%, var(--color-accent));
	}

	.glyph-fill {
		fill: color-mix(in srgb, var(--color-accent) 22%, transparent);
	}

	.glyph-accent {
		stroke: color-mix(in srgb, var(--color-accent) 82%, var(--color-text-primary));
	}

	.glyph-accent-fill {
		fill: color-mix(in srgb, var(--color-accent) 88%, var(--color-text-primary));
		stroke: none;
	}
</style>
