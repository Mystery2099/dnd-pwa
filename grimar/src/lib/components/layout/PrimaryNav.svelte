<script lang="ts">
	import { page } from '$app/state';

	type NavItem = {
		href: string;
		label: string;
		disabled?: boolean;
	};

	type Props = {
		items?: NavItem[];
	};

	let {
		items = [
			{ href: '/dashboard', label: 'Dashboard' },
			{ href: '/compendium', label: 'Compendium' },
			{ href: '/characters', label: 'Characters' },
			{ href: '/forge', label: 'The Forge', disabled: true },
			{ href: '/settings', label: 'Settings' }
		]
	}: Props = $props();
</script>

<nav
	class="hidden items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] md:flex"
>
	{#each items as item (item.href)}
		{#if item.disabled}
			<span
				class="pointer-events-none rounded-full border border-transparent px-4 py-1.5 opacity-50"
			>
				{item.label}
			</span>
		{:else}
			<a
				class={'rounded-full border px-4 py-1.5 transition-all duration-200 ' +
					(item.href === page.url.pathname
						? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/20 text-[var(--color-text-primary)] shadow-[var(--color-accent-glow)]'
						: 'border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]')}
				href={item.href}
			>
				{item.label}
			</a>
		{/if}
	{/each}
</nav>
