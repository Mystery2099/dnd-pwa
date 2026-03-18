<script lang="ts">
	type IconId = 'dashboard' | 'compendium' | 'homebrew' | 'characters' | 'forge';

	type Props = {
		icon: IconId;
		class?: string;
	};

	let { icon, class: className = '' }: Props = $props();
</script>

<svg
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={`overflow-visible ${className}`.trim()}
	aria-hidden="true"
>
	{#if icon === 'dashboard'}
		<rect x="4" y="4" width="7" height="7" rx="1.5" />
		<rect x="13" y="4" width="7" height="5" rx="1.5" />
		<rect x="13" y="11" width="7" height="9" rx="1.5" />
		<rect x="4" y="13" width="7" height="7" rx="1.5" />
	{:else if icon === 'compendium'}
		<path d="M6.5 5.5A2.5 2.5 0 0 1 9 3h8a2 2 0 0 1 2 2v14a1 1 0 0 1-1.45.9L14 18H9a2.5 2.5 0 0 0-2.5 2" />
		<path d="M6.5 5.5v15" />
		<path d="M10 7h6" />
		<path d="M10 10h6" />
	{:else if icon === 'homebrew'}
		<path d="M9 4h6" />
		<path d="M10 4v4l-4.5 7.5A4 4 0 0 0 9 21h6a4 4 0 0 0 3.5-5.5L14 8V4" />
		<path d="M9 13h6" />
	{:else if icon === 'characters'}
		<circle cx="12" cy="8" r="3.25" />
		<path d="M6 19c1.2-3 3.3-4.5 6-4.5s4.8 1.5 6 4.5" />
		<path d="M4.5 19h15" />
	{:else}
		<path d="M12 3l7 4v5c0 4.2-2.3 7.9-7 9-4.7-1.1-7-4.8-7-9V7l7-4z" />
		<path d="M12 8v8" />
		<path d="M9 11h6" />
	{/if}
</svg>
