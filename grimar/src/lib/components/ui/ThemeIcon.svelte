<script lang="ts">
	type Props = {
		themeId?: string;
		class?: string;
		style?: string;
		primaryColor?: string;
		secondaryColor?: string;
	};

	let {
		themeId = 'amethyst',
		class: className = '',
		style = '',
		primaryColor = 'currentColor',
		secondaryColor = 'currentColor'
	}: Props = $props();
	const iconId = $derived(themeId.trim().toLowerCase());
	const uniqueId = $derived(`theme-icon-${iconId.replace(/[^a-z0-9_-]/g, '-')}`);
</script>

<svg
	viewBox="0 0 64 64"
	fill="none"
	stroke={primaryColor}
	stroke-width="2.4"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={`theme-icon overflow-visible ${className}`.trim()}
	{style}
	aria-hidden="true"
>
	<defs>
		<linearGradient
			id={`${uniqueId}-glow`}
			x1="14"
			y1="14"
			x2="50"
			y2="50"
			gradientUnits="userSpaceOnUse"
		>
			<stop offset="0%" stop-color={primaryColor} stop-opacity="0.34" />
			<stop offset="100%" stop-color={secondaryColor} stop-opacity="0.1" />
		</linearGradient>
	</defs>

	<circle
		cx="32"
		cy="32"
		r="24"
		fill={`url(#${uniqueId}-glow)`}
		stroke={secondaryColor}
		stroke-opacity="0.28"
	/>

	{#if iconId === 'amethyst'}
		<path d="M24 21l8-6 8 6-2 10-6 15-6-15-2-10z" fill={secondaryColor} fill-opacity="0.22" />
		<path d="M24 21h16" />
		<path d="M32 15v31" />
		<path d="M26 31h12" />
	{:else if iconId === 'arcane'}
		<circle cx="32" cy="32" r="11" />
		<path d="M32 15v6" />
		<path d="M32 43v6" />
		<path d="M15 32h6" />
		<path d="M43 32h6" />
		<path d="M20 20l4 4" />
		<path d="M40 40l4 4" />
		<path d="M44 20l-4 4" />
		<path d="M20 44l4-4" />
		<path d="M28 28l8 8" stroke={secondaryColor} />
		<path d="M36 28l-8 8" stroke={secondaryColor} />
	{:else if iconId === 'nature'}
		<path d="M32 48V24" />
		<path d="M32 27c0-8-5-13-13-13 0 9 5 15 13 15" fill={secondaryColor} fill-opacity="0.2" />
		<path d="M32 33c0-8 5-13 13-13 0 9-5 15-13 15" fill={primaryColor} fill-opacity="0.12" />
		<path d="M25 48h14" />
	{:else if iconId === 'fire'}
		<path
			d="M32 14c4 6 9 9 9 18 0 8-4 15-9 18-5-3-9-10-9-18 0-6 3-10 7-14 0 4 2 6 2 6s3-3 0-10z"
			fill={secondaryColor}
			fill-opacity="0.22"
		/>
		<path d="M32 26c2 3 4 5 4 9 0 4-2 7-4 9-2-2-4-5-4-9 0-3 1-5 3-7" />
	{:else if iconId === 'ice'}
		<path d="M32 16v32" />
		<path d="M18 24l28 16" stroke={secondaryColor} />
		<path d="M18 40l28-16" stroke={secondaryColor} />
		<path d="M24 17l3 5" />
		<path d="M40 42l3 5" />
		<path d="M24 47l3-5" />
		<path d="M40 22l3-5" />
		<path d="M18 24l6 1" />
		<path d="M40 39l6 1" />
		<path d="M18 40l6-1" />
		<path d="M40 25l6-1" />
	{:else if iconId === 'ocean'}
		<path d="M16 39c4-4 8-6 12-6s8 2 12 6 8 6 12 6" />
		<path d="M16 31c4-4 8-6 12-6s8 2 12 6 8 6 12 6" stroke={secondaryColor} stroke-opacity="0.88" />
		<path d="M29 20c0-4 3-7 3-7s3 3 3 7a3 3 0 11-6 0z" fill={secondaryColor} fill-opacity="0.22" />
	{:else if iconId === 'void'}
		<circle cx="32" cy="32" r="13" />
		<circle cx="32" cy="32" r="4.5" fill={secondaryColor} stroke="none" />
		<path d="M20 18l4 4" />
		<path d="M44 42l4 4" />
		<path d="M44 18l-4 4" />
		<path d="M20 46l4-4" />
	{:else if iconId === 'beach'}
		<path d="M20 46h24" />
		<path d="M30 46V24" />
		<path d="M30 24c10 0 15 5 15 11-9 0-15-4-15-11z" fill={secondaryColor} fill-opacity="0.2" />
		<path d="M20 20c3-4 8-6 13-6" stroke={secondaryColor} />
		<circle cx="18" cy="18" r="3.5" fill={secondaryColor} stroke="none" />
	{:else if iconId === 'necropolis'}
		<path d="M24 46V28l8-6 8 6v18" />
		<path d="M20 46h24" />
		<path d="M28 38h8" stroke={secondaryColor} />
		<path d="M32 22v-5" stroke={secondaryColor} />
		<circle cx="32" cy="16" r="2" fill={secondaryColor} stroke="none" />
	{:else if iconId === 'charmed'}
		<path
			d="M32 47s-12-7.3-12-17a7 7 0 0112-4 7 7 0 0112 4c0 9.7-12 17-12 17z"
			fill={secondaryColor}
			fill-opacity="0.22"
		/>
		<path d="M27 24l5 5 5-5" stroke={secondaryColor} />
	{:else if iconId === 'divine'}
		<circle cx="32" cy="32" r="10" />
		<path d="M32 14v6" />
		<path d="M32 44v6" />
		<path d="M14 32h6" />
		<path d="M44 32h6" />
		<path d="M20 20l4 4" />
		<path d="M40 40l4 4" />
		<path d="M44 20l-4 4" />
		<path d="M20 44l4-4" />
	{:else if iconId === 'underdark'}
		<path d="M32 16l11 8v16L32 48 21 40V24l11-8z" fill={secondaryColor} fill-opacity="0.16" />
		<path d="M32 16v32" />
		<path d="M21 24l11 8 11-8" stroke={secondaryColor} />
		<circle cx="25" cy="37" r="2.2" fill={secondaryColor} stroke="none" />
		<circle cx="39" cy="33" r="2.2" fill={secondaryColor} stroke="none" />
	{:else}
		<circle cx="32" cy="32" r="10" />
		<path d="M32 16v6" stroke={secondaryColor} />
		<path d="M32 42v6" stroke={secondaryColor} />
	{/if}
</svg>
