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
		{#if normalizedType === 'acid'}
			<path d="M32 15c8 8 13 15 13 23a13 13 0 11-26 0c0-8 5-15 13-23z" class="glyph-fill"></path>
			<path d="M26 39c2-2.5 4.5-4 7.5-5" class="glyph-accent"></path>
		{:else if normalizedType === 'bludgeoning'}
			<circle cx="26" cy="25" r="6" class="glyph-fill"></circle>
			<path d="M31 29l12 12"></path>
			<path d="M44 42l4 4" class="glyph-accent"></path>
		{:else if normalizedType === 'cold'}
			<path d="M32 16v32"></path>
			<path d="M20 23l24 18"></path>
			<path d="M20 41l24-18"></path>
			<circle cx="32" cy="32" r="5" class="glyph-fill"></circle>
		{:else if normalizedType === 'fire'}
			<path
				d="M32 16c6 8 10 13 10 21a10 10 0 11-20 0c0-5 2.5-9 7-14-.3 3.5 1.2 6 3 7 1.5-2 1.8-4.5 0-8 0-2 0-3.5 0-6z"
				class="glyph-fill"
			></path>
		{:else if normalizedType === 'force'}
			<path d="M32 17l5 10 11 1-8 7 2 11-10-6-10 6 2-11-8-7 11-1 5-10z" class="glyph-fill"></path>
		{:else if normalizedType === 'lightning'}
			<path d="M35 16L23 34h8l-2 14 12-19h-8l2-13z" class="glyph-accent"></path>
		{:else if normalizedType === 'necrotic'}
			<path d="M23 42c1.5-5 4.5-8 9-8s7.5 3 9 8"></path>
			<path d="M24 28c0-5 3.5-8 8-8s8 3 8 8"></path>
			<circle cx="28" cy="29" r="1.5" class="glyph-accent-fill"></circle>
			<circle cx="36" cy="29" r="1.5" class="glyph-accent-fill"></circle>
		{:else if normalizedType === 'piercing'}
			<path d="M18 46l28-28"></path>
			<path d="M39 18h7v7" class="glyph-accent"></path>
			<path d="M18 46l10-2-8-8-2 10z" class="glyph-fill"></path>
		{:else if normalizedType === 'poison'}
			<path
				d="M32 17c8 0 14 6 14 14 0 10-8 15-14 17-6-2-14-7-14-17 0-8 6-14 14-14z"
				class="glyph-fill"
			></path>
			<path d="M26 32c4-1 8-4 12-9"></path>
			<path d="M31 26c0 7-2 12-6 16" class="glyph-accent"></path>
		{:else if normalizedType === 'psychic'}
			<path d="M21 39c0-10 4.5-17 11-17s11 7 11 17"></path>
			<path d="M26 28c1.5-2 3.5-3 6-3s4.5 1 6 3"></path>
			<path d="M25 42c2-2 4.5-3 7-3s5 1 7 3" class="glyph-accent"></path>
		{:else if normalizedType === 'radiant'}
			<circle cx="32" cy="32" r="8" class="glyph-fill"></circle>
			<path d="M32 16v7" class="glyph-accent"></path>
			<path d="M32 41v7" class="glyph-accent"></path>
			<path d="M16 32h7" class="glyph-accent"></path>
			<path d="M41 32h7" class="glyph-accent"></path>
			<path d="M21 21l5 5"></path>
			<path d="M38 38l5 5"></path>
			<path d="M43 21l-5 5"></path>
			<path d="M26 38l-5 5"></path>
		{:else if normalizedType === 'slashing'}
			<path d="M42 18c-6 7-10 16-12 28"></path>
			<path d="M32 18c-5 7-8 14-9 22"></path>
			<path d="M22 20c-3 4-5 8-6 13" class="glyph-accent"></path>
		{:else if normalizedType === 'thunder'}
			<path d="M21 27c3-5 7-8 11-8 7 0 12 5 12 13 0 7-5 12-12 12-5 0-9-2.5-12-8"></path>
			<path d="M16 32h14" class="glyph-accent"></path>
		{:else}
			<circle cx="32" cy="32" r="16" class="glyph-fill"></circle>
			<path d="M32 23v18"></path>
			<path d="M23 32h18" class="glyph-accent"></path>
		{/if}
	</g>
</svg>

<style>
	.compendium-icon {
		color: color-mix(in srgb, var(--color-accent) 52%, var(--color-text-primary));
		filter: drop-shadow(0 0 0.65rem color-mix(in srgb, var(--color-accent) 18%, transparent));
	}

	.shell-fill {
		fill: color-mix(in srgb, var(--color-accent) 24%, transparent);
		stroke: none;
	}

	.shell-ring {
		stroke: color-mix(in srgb, var(--color-text-primary) 26%, var(--color-border-hover));
	}

	.glyph {
		stroke: color-mix(in srgb, var(--color-text-primary) 95%, var(--color-accent));
	}

	.glyph-fill {
		fill: color-mix(in srgb, var(--color-accent) 24%, transparent);
	}

	.glyph-accent {
		stroke: color-mix(in srgb, var(--color-accent) 84%, var(--color-text-primary));
	}

	.glyph-accent-fill {
		fill: color-mix(in srgb, var(--color-accent) 90%, var(--color-text-primary));
		stroke: none;
	}
</style>
