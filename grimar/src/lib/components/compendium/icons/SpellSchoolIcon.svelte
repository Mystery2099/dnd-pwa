<script lang="ts">
	type Props = {
		school: string;
		class?: string;
	};

	let { school, class: className = '' }: Props = $props();

	const normalizedSchool = $derived(school.trim().toLowerCase());
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
		{#if normalizedSchool === 'abjuration'}
			<path d="M32 16l12 5v10c0 8-5.7 14.8-12 17-6.3-2.2-12-9-12-17V21l12-5z"></path>
			<path d="M25 31h14" class="glyph-accent"></path>
		{:else if normalizedSchool === 'conjuration'}
			<circle cx="25" cy="27" r="6" class="glyph-fill"></circle>
			<circle cx="39" cy="37" r="6" class="glyph-fill"></circle>
			<path d="M29.5 30.5l5 3" class="glyph-accent"></path>
		{:else if normalizedSchool === 'divination'}
			<path d="M16 32s6-10 16-10 16 10 16 10-6 10-16 10-16-10-16-10z"></path>
			<circle cx="32" cy="32" r="5" class="glyph-fill"></circle>
		{:else if normalizedSchool === 'enchantment'}
			<path
				d="M32 46l-11-11a7.5 7.5 0 010-10.6 7.5 7.5 0 0110.6 0L32 25l.4-.4a7.5 7.5 0 0110.6 10.6L32 46z"
				class="glyph-fill"
			></path>
		{:else if normalizedSchool === 'evocation'}
			<path d="M34 16L22 35h8l-2 13 14-21h-8l2-11z" class="glyph-accent"></path>
		{:else if normalizedSchool === 'illusion'}
			<path d="M19 24l13-8 13 8v16l-13 8-13-8V24z"></path>
			<path d="M24 40l16-16" class="glyph-accent"></path>
		{:else if normalizedSchool === 'necromancy'}
			<path d="M32 18c8 0 14 5.8 14 14 0 7.8-5.7 14-14 14s-14-6.2-14-14c0-8.2 6-14 14-14z"></path>
			<path d="M27 28c0-3 2.2-5 5-5s5 2 5 5"></path>
			<path d="M24 39c2.7-2.5 5.3-3.5 8-3.5s5.3 1 8 3.5" class="glyph-accent"></path>
		{:else if normalizedSchool === 'transmutation'}
			<path d="M24 20h16"></path>
			<path d="M24 44h16"></path>
			<path d="M24 20l16 24" class="glyph-accent"></path>
			<path d="M40 20L24 44" class="glyph-accent"></path>
		{:else}
			<circle cx="32" cy="32" r="10" class="glyph-fill"></circle>
			<path d="M32 17v6"></path>
			<path d="M47 32h-6"></path>
			<path d="M32 47v-6"></path>
			<path d="M17 32h6"></path>
		{/if}
	</g>
</svg>

<style>
	.compendium-icon {
		color: color-mix(in srgb, var(--color-accent) 62%, var(--color-text-primary));
		filter: drop-shadow(0 0 0.7rem color-mix(in srgb, var(--color-accent) 14%, transparent));
	}

	.shell-fill {
		fill: color-mix(in srgb, var(--color-accent) 18%, transparent);
		stroke: none;
	}

	.shell-ring {
		stroke: color-mix(in srgb, var(--color-border-hover) 82%, var(--color-border));
	}

	.glyph {
		stroke: color-mix(in srgb, var(--color-text-primary) 84%, var(--color-accent));
	}

	.glyph-fill {
		fill: color-mix(in srgb, var(--color-accent) 18%, transparent);
	}

	.glyph-accent {
		stroke: var(--color-accent);
	}
</style>
