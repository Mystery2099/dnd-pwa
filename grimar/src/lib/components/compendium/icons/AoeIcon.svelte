<script lang="ts">
	type Props = {
		shape: string;
		class?: string;
	};

	let { shape, class: className = '' }: Props = $props();

	const normalizedShape = $derived(shape.trim().toLowerCase());
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
		{#if normalizedShape === 'cone'}
			<path d="M20 44l12-24 12 24H20z" class="glyph-fill"></path>
			<path d="M32 20v24" class="glyph-accent"></path>
		{:else if normalizedShape === 'sphere'}
			<circle cx="32" cy="32" r="16" class="glyph-fill"></circle>
			<path d="M16 32h32" class="glyph-accent"></path>
		{:else if normalizedShape === 'cube'}
			<rect x="20" y="20" width="24" height="24" rx="2" class="glyph-fill"></rect>
			<path d="M24 16h24v24"></path>
			<path d="M20 20l4-4" class="glyph-accent"></path>
			<path d="M44 20l4-4" class="glyph-accent"></path>
		{:else if normalizedShape === 'line'}
			<path d="M18 46L46 18" class="glyph-accent"></path>
			<path d="M21 18h25v25"></path>
		{:else if normalizedShape === 'wall'}
			<path d="M18 42h28"></path>
			<path d="M18 34h28"></path>
			<path d="M18 26h28"></path>
			<path d="M18 18h28"></path>
		{:else if normalizedShape === 'touch'}
			<path d="M26 46V25a3 3 0 016 0v11"></path>
			<path d="M32 36V23a3 3 0 016 0v15"></path>
			<path d="M38 38v-9a3 3 0 016 0v8c0 4-2 7-5 9"></path>
			<path d="M26 41l-3-3a3 3 0 00-4 4l6 6" class="glyph-accent"></path>
		{:else if normalizedShape === 'self'}
			<circle cx="32" cy="32" r="9" class="glyph-fill"></circle>
			<path d="M32 17v5" class="glyph-accent"></path>
			<path d="M32 42v5" class="glyph-accent"></path>
			<path d="M17 32h5" class="glyph-accent"></path>
			<path d="M42 32h5" class="glyph-accent"></path>
		{:else if normalizedShape === 'creature'}
			<circle cx="32" cy="25" r="6" class="glyph-fill"></circle>
			<path d="M22 46c2-7 6-11 10-11s8 4 10 11"></path>
		{:else if normalizedShape === 'point'}
			<circle cx="32" cy="32" r="5" class="glyph-fill"></circle>
			<path d="M32 16v8" class="glyph-accent"></path>
			<path d="M32 40v8" class="glyph-accent"></path>
			<path d="M16 32h8" class="glyph-accent"></path>
			<path d="M40 32h8" class="glyph-accent"></path>
		{:else}
			<circle cx="32" cy="32" r="16" class="glyph-fill"></circle>
		{/if}
	</g>
</svg>

<style>
	.compendium-icon {
		color: color-mix(in srgb, var(--color-accent) 46%, var(--color-text-primary));
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
		fill: color-mix(in srgb, var(--color-accent) 20%, transparent);
	}

	.glyph-accent {
		stroke: color-mix(in srgb, var(--color-accent) 82%, var(--color-text-primary));
	}
</style>
